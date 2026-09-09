/**
 * Student Homework Controller (Read & Download Mode)
 * Power Public School ERP
 */

const API_BASE = "https://loginpagepsabackend.onrender.com/api";
const TARGET_ADMISSION_NO = localStorage.getItem("activeAdmissionNo") || "ADM5B01";

let activeStudent = null;
let allHomeworkList = [];

document.addEventListener("DOMContentLoaded", async () => {
    updateTodayDate();
    await initStudent();
    await loadStudentHomework();
});

function updateTodayDate() {
    const now = new Date();
    const dateVal = document.getElementById("currentDateVal");
    const dayVal = document.getElementById("currentDayVal");

    if (dateVal) dateVal.textContent = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    if (dayVal) dayVal.textContent = now.toLocaleDateString("en-IN", { weekday: "long" });
}

async function initStudent() {
    try {
        const res = await fetch(`${API_BASE}/students`);
        if (res.ok) {
            const students = await res.json();
            activeStudent = students.find(s => 
                (s.admissionNo && s.admissionNo.toUpperCase() === TARGET_ADMISSION_NO) ||
                (s.admission_no && s.admission_no.toUpperCase() === TARGET_ADMISSION_NO)
            );
        }
    } catch (e) {
        console.warn("Could not load student profile:", e);
    }

    if (!activeStudent) {
        activeStudent = {
            studentId: 1,
            fullName: "V.S.Sakthivel",
            className: "5",
            section: "B",
            rollNo: "20265001"
        };
    }

    const name = activeStudent.fullName || activeStudent.full_name || "V.S.Sakthivel";
    const cl = activeStudent.className || activeStudent.class_name || "5";
    const sec = activeStudent.section || "B";
    const roll = activeStudent.rollNo || activeStudent.roll_no || "20265001";

    document.getElementById("studentName").textContent = name;
    document.getElementById("studentClassSection").textContent = `${cl}-${sec}`;
    document.getElementById("studentRoll").textContent = roll;
    document.getElementById("studentAvatar").src = 
        activeStudent.photo || activeStudent.photoUrl || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1f3f6d&color=ffffff`;
}

async function loadStudentHomework() {
    const container = document.getElementById("homeworkCardsContainer");

    try {
        // Query teacher-published homework from database
        let data = [];
        const endpoints = [
            `${API_BASE}/teacher/homework`,
            `${API_BASE}/homework`
        ];

        for (const url of endpoints) {
            try {
                const res = await fetch(url);
                if (res.ok) {
                    const parsed = await res.json();
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        data = parsed;
                        break;
                    }
                }
            } catch (_) {}
        }

        if (data.length === 0) {
            data = getFallbackHomework();
        }

        // Filter for this student's class & section (Class 5 - B)
        const myClass = String(activeStudent.className || "5").trim();
        const mySec = String(activeStudent.section || "B").trim();

        allHomeworkList = data.filter(h => {
            const hClass = String(h.className || h.class_name || "").trim();
            const hSec = String(h.section || "").trim();
            return (!hClass || hClass === myClass) && (!hSec || hSec === mySec);
        });

        if (allHomeworkList.length === 0) {
            // If strictly filtered yields nothing, load class-level assignments
            allHomeworkList = data.filter(h => String(h.className || h.class_name || "").trim() === myClass);
        }

        computeStats(allHomeworkList);
        renderHomework();

    } catch (err) {
        console.error("Failed to load homework records:", err);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 26px; color: #dc2626; margin-bottom: 8px; display: block;"></i>
                Unable to load homework tasks from server.
            </div>
        `;
    }
}

function computeStats(list) {
    const today = new Date().toISOString().split("T")[0];
    let pendingCount = 0;
    let overdueCount = 0;

    list.forEach(h => {
        const dueDate = h.dueDate || h.due_date || "";
        if (dueDate && dueDate < today) {
            overdueCount++;
        } else {
            pendingCount++;
        }
    });

    document.getElementById("statTotalCount").textContent = list.length;
    document.getElementById("statPendingCount").textContent = pendingCount;
    document.getElementById("statOverdueCount").textContent = overdueCount;
}

function renderHomework() {
    const container = document.getElementById("homeworkCardsContainer");
    const subjectFilter = document.getElementById("subjectFilter").value;
    const statusFilter = document.getElementById("statusFilter").value;
    const countBadge = document.getElementById("recordCountBadge");

    const today = new Date().toISOString().split("T")[0];

    const filtered = allHomeworkList.filter(h => {
        const sub = (h.subject || "").toLowerCase();
        const subjectMatch = (subjectFilter === "ALL" || sub === subjectFilter.toLowerCase());

        const dueDate = h.dueDate || h.due_date || "";
        const isOverdue = Boolean(dueDate && dueDate < today);
        let statusMatch = true;

        if (statusFilter === "PENDING") statusMatch = !isOverdue;
        if (statusFilter === "OVERDUE") statusMatch = isOverdue;

        return subjectMatch && statusMatch;
    });

    countBadge.textContent = `${filtered.length} Homework`;

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-book-open" style="font-size: 28px; margin-bottom: 8px; color: #94a3b8; display: block;"></i>
                No homework tasks found matching the selected filter.
            </div>
        `;
        return;
    }

    container.innerHTML = "";

    filtered.forEach(hw => {
        const title = hw.title || "Class Assignment";
        const desc = hw.description || "No specific instructions provided. Download the question paper below.";
        const subject = hw.subject || "General";
        const className = hw.className || hw.class_name || activeStudent.className || "5";
        const section = hw.section || activeStudent.section || "B";
        const dueDate = hw.dueDate || hw.due_date || "Not set";
        
        const isOverdue = Boolean(dueDate !== "Not set" && dueDate < today);
        const hasPdf = Boolean(hw.fileData || hw.file_data);
        const fileName = hw.fileName || hw.file_name || `${subject}_Homework_Questions.pdf`;

        const card = document.createElement("div");
        card.className = `hw-card ${isOverdue ? 'status-overdue-card' : 'status-active-card'}`;

        card.innerHTML = `
            <div>
                <div class="hw-header">
                    <div class="hw-badges">
                        <span class="badge-subject">${subject}</span>
                        <span class="badge-class">Class ${className} - ${section}</span>
                    </div>
                    <span class="badge-due-status ${isOverdue ? 'badge-overdue' : 'badge-active'}">
                        ${isOverdue ? '<i class="fa-solid fa-circle-exclamation"></i> Due Date Over' : '<i class="fa-regular fa-clock"></i> Pending'}
                    </span>
                </div>

                <h3 class="hw-title">${title}</h3>
                <p class="hw-desc">${desc}</p>
            </div>

            <div class="hw-footer">
                <div class="hw-due-info">
                    <span>Deadline:</span>
                    <strong>${dueDate}</strong>
                </div>

                <div>
                    ${hasPdf ? `
                        <button class="btn-download-pdf" onclick="downloadQuestionPdf('${hw.fileData || hw.file_data}', '${fileName}')">
                            <i class="fa-solid fa-file-pdf"></i> Download Questions
                        </button>
                    ` : `<span class="no-pdf-text"><i class="fa-solid fa-info-circle"></i> No PDF Attached</span>`}
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// Download PDF Helper Function
function downloadQuestionPdf(base64Data, fileName) {
    if (!base64Data || base64Data.trim() === "") {
        alert("The question paper document is not available for this homework.");
        return;
    }

    const link = document.createElement("a");
    link.href = base64Data;
    link.download = fileName || "QuestionPaper.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function getFallbackHomework() {
    return [
        {
            homeworkId: 101,
            title: "Chapter 4: Decimals & Fractions Practice",
            description: "Solve all problems on exercise 4.2 in your class workbook and review decimal conversions.",
            className: "5",
            section: "B",
            subject: "Maths",
            dueDate: "2026-09-15",
            fileName: "Maths_Chapter4_Questions.pdf",
            fileData: "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDM4Pj5zdHJlYW0KQlQgL0YxIDEyIFRmIDcyIDcyMCBUZCAoUG93ZXIgUHVibGljIFNjaG9vbCAtIEhvbWV3b3JrKSBUaiBFVAplbmRzdHJlYW0KZW5kb2JqCjEgMCBvYmoKPDwvVHlwZS9QYWdlcy9Db3VudCAxL0tpZHNbMyAwIFJdPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZS9QYWdlL1BhcmVudCAxIDAgUi9NZWRpYUJveFswIDAgNjEyIDc5Ml0vQ29udGVudHMgMiAwIFIvUmVzb3VyY2VzPDwvRm9udDw8L0YxIDQgMCBSPj4+Pj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDA5NiAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAxNDQgMDAwMDAgbiAKMDAwMDAwMDI0NSAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgNS9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjMwMQolJUVPRg=="
        },
        {
            homeworkId: 102,
            title: "Photosynthesis Diagram & Concept Questions",
            description: "Draw and label the process of plant food creation. Answer review questions 1 to 5.",
            className: "5",
            section: "B",
            subject: "Science",
            dueDate: "2026-09-12",
            fileName: "Science_Photosynthesis_Paper.pdf",
            fileData: "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDM4Pj5zdHJlYW0KQlQgL0YxIDEyIFRmIDcyIDcyMCBUZCAoUG93ZXIgUHVibGljIFNjaG9vbCAtIEhvbWV3b3JrKSBUaiBFVAplbmRzdHJlYW0KZW5kb2JqCjEgMCBvYmoKPDwvVHlwZS9QYWdlcy9Db3VudCAxL0tpZHNbMyAwIFJdPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZS9QYWdlL1BhcmVudCAxIDAgUi9NZWRpYUJveFswIDAgNjEyIDc5Ml0vQ29udGVudHMgMiAwIFIvUmVzb3VyY2VzPDwvRm9udDw8L0YxIDQgMCBSPj4+Pj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDA5NiAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAxNDQgMDAwMDAgbiAKMDAwMDAwMDI0NSAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgNS9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjMwMQolJUVPRg=="
        },
        {
            homeworkId: 103,
            title: "English Grammar: Tenses Practice Sheet",
            description: "Complete sentences using past continuous and simple past tenses as discussed in class.",
            className: "5",
            section: "B",
            subject: "English",
            dueDate: "2026-08-30",
            fileName: "English_Tenses_Handout.pdf",
            fileData: null
        }
    ];
}

function logoutStudent() {
    localStorage.removeItem("activeStudentId");
    localStorage.removeItem("activeAdmissionNo");
    window.location.href = "login.html";
}

window.downloadQuestionPdf = downloadQuestionPdf;
window.renderHomework = renderHomework;