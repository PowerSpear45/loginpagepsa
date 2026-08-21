const API_BASE = "https://loginpagepsabackend.onrender.com/api";
const teacherId = localStorage.getItem("teacherId") || "1";

let teacherClasses = [];
let studentsData = [];
let savedMarks = [];
let maximumMarks = 100;

document.addEventListener("DOMContentLoaded", () => {
    setDefaultDate();
    updateTodayDate();
    initEventListeners();
    loadTeacherClasses();
});

function setDefaultDate() {
    const examDateInput = document.getElementById("examDate");
    if (examDateInput) {
        examDateInput.value = new Date().toISOString().split("T")[0];
    }
}

function updateTodayDate() {
    const dateEl = document.getElementById("todayDate");
    const dayEl = document.getElementById("todayDay");
    const now = new Date();
    if (dateEl) dateEl.textContent = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    if (dayEl) dayEl.textContent = now.toLocaleDateString("en-IN", { weekday: "long" });
}

function initEventListeners() {
    const classFilter = document.getElementById("classFilter");
    const sectionFilter = document.getElementById("sectionFilter");
    const subjectFilter = document.getElementById("subjectFilter");
    const examFilter = document.getElementById("examFilter");
    const examDate = document.getElementById("examDate");

    if (classFilter) classFilter.addEventListener("change", () => { populateSectionFilter(); populateSubjectFilter(); handleFilterChange(); });
    if (sectionFilter) sectionFilter.addEventListener("change", () => { populateSubjectFilter(); handleFilterChange(); });
    if (subjectFilter) subjectFilter.addEventListener("change", handleFilterChange);
    if (examFilter) examFilter.addEventListener("change", handleFilterChange);
    if (examDate) examDate.addEventListener("change", handleFilterChange);
}

// --- 1. Load Classes & Fallback ---
async function loadTeacherClasses() {
    try {
        const res = await fetch(`${API_BASE}/teachers/${teacherId}/classes`);
        if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
                teacherClasses = data;
            }
        }
    } catch (err) {
        console.warn("Backend offline, using fallback classes:", err);
    }

    // Force fallback if empty
    if (!teacherClasses || teacherClasses.length === 0) {
        teacherClasses = [
            { className: "5", section: "A", subject: "Mathematics" },
            { className: "5", section: "B", subject: "Mathematics" },
            { className: "6", section: "A", subject: "Science" },
            { className: "6", section: "B", subject: "Science" }
        ];
    }
    populateClassFilter();
}

function populateClassFilter() {
    const classFilter = document.getElementById("classFilter");
    if (!classFilter) return;

    classFilter.innerHTML = `<option value="">Select Class</option>`;
    const uniqueClasses = [...new Set(teacherClasses.map(c => c.className || c.class_name))];

    uniqueClasses.forEach(cls => {
        const option = document.createElement("option");
        option.value = cls;
        option.textContent = `Class ${cls}`;
        classFilter.appendChild(option);
    });
}

function populateSectionFilter() {
    const classFilter = document.getElementById("classFilter");
    const sectionFilter = document.getElementById("sectionFilter");
    if (!classFilter || !sectionFilter) return;

    sectionFilter.innerHTML = `<option value="">Select Section</option>`;
    const selectedClass = classFilter.value;
    if (!selectedClass) return;

    const sections = teacherClasses.filter(c => String(c.className) === String(selectedClass)).map(c => c.section);
    const uniqueSections = [...new Set(sections)];

    uniqueSections.forEach(sec => {
        const option = document.createElement("option");
        option.value = sec;
        option.textContent = `Section ${sec}`;
        sectionFilter.appendChild(option);
    });
}

function populateSubjectFilter() {
    const classFilter = document.getElementById("classFilter");
    const subjectFilter = document.getElementById("subjectFilter");
    if (!classFilter || !subjectFilter) return;

    subjectFilter.innerHTML = `<option value="">Select Subject</option>`;
    const selectedClass = classFilter.value;
    if (!selectedClass) return;

    const subjects = teacherClasses.filter(c => String(c.className) === String(selectedClass)).map(c => c.subject || c.subjectName);
    const uniqueSubjects = [...new Set(subjects.filter(Boolean))];

    if (uniqueSubjects.length === 0) uniqueSubjects.push("Mathematics", "Science"); // Fallback subjects

    uniqueSubjects.forEach(sub => {
        const option = document.createElement("option");
        option.value = sub;
        option.textContent = sub;
        subjectFilter.appendChild(option);
    });
}

// --- 2. Load Students & Marks ---
async function handleFilterChange() {
    const classVal = document.getElementById("classFilter")?.value;
    const secVal = document.getElementById("sectionFilter")?.value;
    const subVal = document.getElementById("subjectFilter")?.value;
    const examVal = document.getElementById("examFilter")?.value;

    if (classVal && secVal && subVal && examVal) {
        await loadStudents(classVal, secVal);
        await loadExistingMarks(classVal, secVal, subVal, examVal);
        renderTable();
    } else {
        renderEmptyMessage("Please select Class, Section, Subject, and Exam to load students.");
    }
}

async function loadStudents(className, section) {
    try {
        const res = await fetch(`${API_BASE}/students`);
        if (res.ok) {
            const allStudents = await res.json();
            studentsData = allStudents.filter(s => String(s.className || s.class_name) === String(className) && String(s.section) === String(section));
        }
    } catch (e) {
        console.warn("Failed to load students:", e);
        studentsData = []; 
    }
}

async function loadExistingMarks(className, section, subject, examType) {
    try {
        const res = await fetch(`${API_BASE}/marks`);
        if (res.ok) {
            const allMarks = await res.json();
            savedMarks = allMarks.filter(m => m.subject === subject && (m.examType === examType || m.examName === examType));
        }
    } catch (err) {
        console.warn("Could not load marks:", err);
        savedMarks = [];
    }
}

// --- 3. Render UI ---
function renderTable() {
    const tableBody = document.getElementById("studentMarksTableBody") || document.getElementById("marksTableBody");
    if (!tableBody) return;
    tableBody.innerHTML = "";

    if (!studentsData || studentsData.length === 0) {
        renderEmptyMessage("No students found in the selected Class & Section.");
        updateSummary();
        return;
    }

    studentsData.forEach((student, index) => {
        const studentId = student.studentId || student.student_id;
        const rollNo = student.rollNo || student.roll_no || "-";
        const fullName = student.fullName || student.full_name || student.name || "Unknown";

        const existingRecord = savedMarks.find(m => (m.studentId === studentId || (m.student && m.student.studentId === studentId)));
        const currentMark = existingRecord ? (existingRecord.marksObtained ?? existingRecord.marks_obtained ?? "") : "";
        const status = currentMark !== "" ? "Entered" : "Pending";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="text-align: center;">${index + 1}</td>
            <td>${rollNo}</td>
            <td>${fullName}</td>
            <td style="text-align: center;">
                <input type="number" class="marks-input" id="mark_${studentId}" min="0" max="${maximumMarks}" value="${currentMark}" oninput="validateInput(this, ${studentId})"/>
            </td>
            <td style="text-align: center;">${maximumMarks}</td>
            <td style="text-align: center;" id="status_${studentId}">
                <span class="mark-status ${status.toLowerCase()}">${status}</span>
            </td>
            <td style="text-align: center;">
                <button type="button" class="save-mark-btn" onclick="saveIndividualMark(${studentId})">Save</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
    updateSummary();
}

function renderEmptyMessage(msg) {
    const tableBody = document.getElementById("studentMarksTableBody") || document.getElementById("marksTableBody");
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color:#888;">${msg}</td></tr>`;
}

function validateInput(input, studentId) {
    const val = input.value.trim();
    const statusCell = document.getElementById(`status_${studentId}`);
    
    if (val === "") {
        if (statusCell) statusCell.innerHTML = `<span class="mark-status pending">Pending</span>`;
    } else {
        let num = Number(val);
        if (num > maximumMarks) { input.value = maximumMarks; }
        if (num < 0) { input.value = 0; }
        if (statusCell) statusCell.innerHTML = `<span class="mark-status entered">Entered</span>`;
    }
    updateSummary();
}

function updateSummary() {
    const totalStudents = studentsData.length;
    let entered = 0;

    studentsData.forEach(student => {
        const studentId = student.studentId || student.student_id;
        const input = document.getElementById(`mark_${studentId}`);
        if (input && input.value.trim() !== "") entered++;
    });

    const totalEl = document.getElementById("totalStudentsCount") || document.getElementById("totalStudents");
    const enteredEl = document.getElementById("marksEnteredCount") || document.getElementById("marksEntered");
    const pendingEl = document.getElementById("marksPendingCount") || document.getElementById("marksPending");

    if (totalEl) totalEl.textContent = totalStudents;
    if (enteredEl) enteredEl.textContent = entered;
    if (pendingEl) pendingEl.textContent = Math.max(0, totalStudents - entered);
}

// --- 4. Saving Data ---
async function saveIndividualMark(studentId) {
    const input = document.getElementById(`mark_${studentId}`);
    if (!input || input.value.trim() === "") {
        alert("Please enter a mark first.");
        return;
    }

    const payload = {
        studentId: studentId,
        subject: document.getElementById("subjectFilter").value,
        examType: document.getElementById("examFilter").value,
        examDate: document.getElementById("examDate").value,
        maxMarks: maximumMarks,
        marksObtained: Number(input.value.trim())
    };

    try {
        const res = await fetch(`${API_BASE}/marks/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok || res.status === 201) {
            alert("Mark saved successfully!");
            handleFilterChange(); // Refresh
        } else {
            alert("Failed to save mark to backend.");
        }
    } catch (err) {
        console.warn("Save error:", err);
        alert("Error saving mark.");
    }
}

window.saveIndividualMark = saveIndividualMark;