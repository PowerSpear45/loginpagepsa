const API_BASE = "https://loginpagepsabackend.onrender.com/api";
const teacherId = localStorage.getItem("teacherId") || "1";

let teacherClasses = [];
let allHomeworks = [];
let selectedPdfBase64 = null;
let selectedFileName = "";
let classStrengths = {}; // Map of "class_section" -> student count

document.addEventListener("DOMContentLoaded", () => {
    updateDate();
    loadClasses();
    loadHomeworks();
    initFilters();
});

function updateDate() {
    const now = new Date();
    const dateEl = document.getElementById("todayDate");
    const dayEl = document.getElementById("todayDay");
    if (dateEl) dateEl.textContent = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    if (dayEl) dayEl.textContent = now.toLocaleDateString("en-IN", { weekday: "long" });
}

function initFilters() {
    document.getElementById("classFilter").addEventListener("change", renderHomeworkTable);
    document.getElementById("sectionFilter").addEventListener("change", renderHomeworkTable);
    document.getElementById("subjectFilter").addEventListener("change", renderHomeworkTable);
}

// Load teacher classes
async function loadClasses() {
    try {
        const res = await fetch(`${API_BASE}/teachers/${teacherId}/classes`);
        if (res.ok) teacherClasses = await res.json();
    } catch (e) {
        console.warn(e);
    }

    if (!teacherClasses || teacherClasses.length === 0) {
        teacherClasses = [
            { className: "5", section: "A", strength: 30 },
            { className: "5", section: "B", strength: 30 },
            { className: "6", section: "A", strength: 28 }
        ];
    }

    const classFilter = document.getElementById("classFilter");
    const hwClass = document.getElementById("hwClass");
    const unique = [...new Set(teacherClasses.map(c => c.className || c.class_name))];

    unique.forEach(cls => {
        const opt = `<option value="${cls}">Class ${cls}</option>`;
        classFilter.insertAdjacentHTML("beforeend", opt);
        hwClass.insertAdjacentHTML("beforeend", opt);
    });
}

function populateModalSections() {
    const selectedClass = document.getElementById("hwClass").value;
    const secSelect = document.getElementById("hwSection");
    secSelect.innerHTML = `<option value="">Select Section</option>`;

    const sections = teacherClasses
        .filter(c => (c.className || c.class_name) == selectedClass)
        .map(c => c.section);

    (sections.length > 0 ? [...new Set(sections)] : ["A", "B"]).forEach(s => {
        secSelect.insertAdjacentHTML("beforeend", `<option value="${s}">Section ${s}</option>`);
    });
}

function previewFileName(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (file.type !== "application/pdf") {
            alert("Please select a valid PDF file!");
            input.value = "";
            return;
        }
        selectedFileName = file.name;
        document.getElementById("uploadStatusText").textContent = file.name;

        const reader = new FileReader();
        reader.onload = (e) => {
            selectedPdfBase64 = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Fetch homework list
async function loadHomeworks() {
    try {
        const res = await fetch(`${API_BASE}/teacher/homework?teacherId=${teacherId}`);
        if (res.ok) {
            allHomeworks = await res.json();
        }
    } catch (err) {
        console.warn("Using local homework records");
    }

    // Pre-calculate submission counts
    for (let hw of allHomeworks) {
        const hwId = hw.homeworkId || hw.homework_id;
        try {
            const subRes = await fetch(`${API_BASE}/teacher/homework/${hwId}/submissions`);
            if (subRes.ok) {
                const subs = await subRes.json();
                hw.submissionCount = subs.length;
            } else {
                hw.submissionCount = 0;
            }
        } catch (e) {
            hw.submissionCount = 0;
        }

        // Get total class strength
        const key = `${hw.className}_${hw.section}`;
        if (!classStrengths[key]) {
            try {
                const sRes = await fetch(`${API_BASE}/students/class/${hw.className}/section/${hw.section}`);
                if (sRes.ok) {
                    const stList = await sRes.json();
                    classStrengths[key] = stList.length;
                } else {
                    classStrengths[key] = 30;
                }
            } catch (e) {
                classStrengths[key] = 30;
            }
        }
        hw.totalStrength = classStrengths[key];
    }

    renderHomeworkTable();
}

// Render Homework History Table
function renderHomeworkTable() {
    const classVal = document.getElementById("classFilter").value;
    const secVal = document.getElementById("sectionFilter").value;
    const subVal = document.getElementById("subjectFilter").value;

    const filtered = allHomeworks.filter(h => {
        return (!classVal || h.className == classVal) &&
               (!secVal || h.section == secVal) &&
               (!subVal || h.subject == subVal);
    });

    const tbody = document.getElementById("homeworkTableBody");
    const countEl = document.getElementById("totalHwCount");
    tbody.innerHTML = "";
    if (countEl) countEl.textContent = filtered.length;

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-message">
                    <i class="fa-solid fa-book-open"></i>
                    No homework assigned matching your filters.
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach((hw, idx) => {
        const hwId = hw.homeworkId || hw.homework_id;
        const hasPdf = Boolean(hw.fileData || hw.file_data);
        const subCount = hw.submissionCount ?? 0;
        const totalStrength = hw.totalStrength || 30;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="text-align: center;">${idx + 1}</td>
            <td>
                <div class="hw-title-text">${hw.title}</div>
                <div class="hw-desc-text" title="${hw.description || ''}">${hw.description || 'No instructions'}</div>
            </td>
            <td style="text-align: center;">
                <span class="badge-tag badge-class">Class ${hw.className} - ${hw.section}</span>
            </td>
            <td>
                <span class="badge-tag badge-subject">${hw.subject}</span>
            </td>
            <td>${hw.dueDate || hw.due_date || '-'}</td>
            <td style="text-align: center;">
                <span class="submission-progress">
                    <i class="fa-solid fa-user-check"></i> ${subCount} / ${totalStrength}
                </span>
            </td>
            <td style="text-align: center;">
                ${hasPdf ? `
                    <button class="btn-action-pdf" onclick="downloadPdf('${hw.fileData || hw.file_data}', '${hw.fileName || 'Questions.pdf'}')">
                        <i class="fa-solid fa-file-pdf"></i> Download
                    </button>
                ` : `<span style="color:#9ca3af; font-size:12px;">No PDF</span>`}
            </td>
            <td style="text-align: center;">
                <button class="btn-action-eval" onclick="openSubmissionsModal(${hwId}, '${hw.title}', '${hw.className}', '${hw.section}', '${hw.subject}')">
                    <i class="fa-solid fa-eye"></i> View (${subCount})
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Publish New Homework
async function handleCreateHomework(e) {
    e.preventDefault();

    const payload = {
        title: document.getElementById("hwTitle").value,
        subject: document.getElementById("hwSubject").value,
        className: document.getElementById("hwClass").value,
        section: document.getElementById("hwSection").value,
        dueDate: document.getElementById("hwDueDate").value,
        description: document.getElementById("hwDescription").value,
        teacherId: Number(teacherId),
        fileName: selectedFileName || null,
        fileData: selectedPdfBase64 || null
    };

    try {
        const res = await fetch(`${API_BASE}/teacher/homework`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Homework published successfully!");
            closeCreateModal();
            loadHomeworks();
        } else {
            allHomeworks.unshift({ ...payload, homeworkId: Date.now(), submissionCount: 0, totalStrength: 30 });
            closeCreateModal();
            renderHomeworkTable();
        }
    } catch (err) {
        allHomeworks.unshift({ ...payload, homeworkId: Date.now(), submissionCount: 0, totalStrength: 30 });
        closeCreateModal();
        renderHomeworkTable();
    }
}

// Download PDF Helper
function downloadPdf(base64Data, fileName) {
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = fileName || "Document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Open View Submissions Modal
async function openSubmissionsModal(homeworkId, title, className, section, subject) {
    document.getElementById("subModalTitle").textContent = title;
    document.getElementById("subModalDetails").textContent = `Class ${className} - ${section} | ${subject}`;
    document.getElementById("submissionsModal").classList.add("active");

    const tbody = document.getElementById("submissionsTableBody");
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">Loading student submissions...</td></tr>`;

    try {
        const sRes = await fetch(`${API_BASE}/students/class/${className}/section/${section}`);
        const students = await sRes.json();

        const subRes = await fetch(`${API_BASE}/teacher/homework/${homeworkId}/submissions`);
        const submissions = subRes.ok ? await subRes.json() : [];

        tbody.innerHTML = "";

        students.forEach((s, idx) => {
            const sid = s.studentId || s.student_id;
            const sub = submissions.find(item => (item.studentId || item.student_id) === sid);
            const isSub = Boolean(sub && (sub.fileData || sub.file_data));

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="text-align:center;">${idx + 1}</td>
                <td>${s.rollNo || s.roll_no || "-"}</td>
                <td style="font-weight:600;">${s.fullName || s.full_name}</td>
                <td>${isSub ? (sub.submittedDate || "Submitted") : "-"}</td>
                <td style="text-align:center;">
                    <span class="${isSub ? 'status-submitted' : 'status-missing'}">${isSub ? 'Submitted' : 'Pending'}</span>
                </td>
                <td style="text-align:center;">
                    ${isSub ? `
                        <button class="btn-action-pdf" onclick="downloadPdf('${sub.fileData || sub.file_data}', '${s.fullName}_Answersheet.pdf')">
                            <i class="fa-solid fa-download"></i> Answer PDF
                        </button>
                    ` : '<span style="color:#9ca3af; font-size:12px;">Not submitted</span>'}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#ef4444; padding:20px;">Could not load submissions.</td></tr>`;
    }
}

function openCreateModal() {
    document.getElementById("createModal").classList.add("active");
}

function closeCreateModal() {
    document.getElementById("createModal").classList.remove("active");
    document.getElementById("createHomeworkForm").reset();
    document.getElementById("uploadStatusText").textContent = "Click to upload Questions PDF";
    selectedPdfBase64 = null;
    selectedFileName = "";
}

function closeSubmissionsModal() {
    document.getElementById("submissionsModal").classList.remove("active");
}

window.openCreateModal = openCreateModal;
window.closeCreateModal = closeCreateModal;
window.handleCreateHomework = handleCreateHomework;
window.previewFileName = previewFileName;
window.downloadPdf = downloadPdf;
window.openSubmissionsModal = openSubmissionsModal;
window.closeSubmissionsModal = closeSubmissionsModal;
window.populateModalSections = populateModalSections;