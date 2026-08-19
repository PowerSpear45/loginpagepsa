const API_BASE = "https://loginpagepsabackend.onrender.com/api";
const teacherId = localStorage.getItem("teacherId") || "1";

let teacherClasses = [];
let studentsData = [];
let savedMarks = [];
let maximumMarks = 100;

document.addEventListener("DOMContentLoaded", () => {
    setDefaultDate();
    updateTodayDate();
    updateDateTime();
    setInterval(updateDateTime, 1000);

    initEventListeners();
    loadTeacherClasses();
});

// Set default date to today
function setDefaultDate() {
    const examDateInput = document.getElementById("examDate");
    if (examDateInput) {
        const today = new Date().toISOString().split("T")[0];
        examDateInput.value = today;
    }
}

// Update today's date in sidebar
function updateTodayDate() {
    const dateEl = document.getElementById("todayDate");
    const dayEl = document.getElementById("todayDay");
    const now = new Date();

    if (dateEl) {
        const options = { day: "2-digit", month: "short", year: "numeric" };
        dateEl.textContent = now.toLocaleDateString("en-IN", options);
    }
    if (dayEl) {
        dayEl.textContent = now.toLocaleDateString("en-IN", { weekday: "long" });
    }
}

function updateDateTime() {
    const timeEl = document.getElementById("currentTime");
    if (timeEl) {
        timeEl.textContent = new Date().toLocaleTimeString("en-IN");
    }
}

// Event Listeners
function initEventListeners() {
    const classFilter = document.getElementById("classFilter");
    const sectionFilter = document.getElementById("sectionFilter");
    const subjectFilter = document.getElementById("subjectFilter");
    const examFilter = document.getElementById("examFilter");
    const examDate = document.getElementById("examDate");

    classFilter.addEventListener("change", () => {
        populateSectionFilter();
        handleFilterChange();
    });

    sectionFilter.addEventListener("change", handleFilterChange);
    subjectFilter.addEventListener("change", handleFilterChange);
    examFilter.addEventListener("change", handleFilterChange);
    if (examDate) examDate.addEventListener("change", handleFilterChange);
}

// Load classes assigned to teacher or fetch available classes from DB
async function loadTeacherClasses() {
    try {
        const res = await fetch(`${API_BASE}/teachers/${teacherId}/classes`);
        if (res.ok) {
            teacherClasses = await res.json();
        }
    } catch (err) {
        console.warn("Could not fetch teacher classes directly:", err);
    }

    // If teacher endpoint returned empty or failed, fetch all classes from students/sections
    if (!teacherClasses || teacherClasses.length === 0) {
        try {
            const studentRes = await fetch(`${API_BASE}/students`);
            if (studentRes.ok) {
                const allStudents = await studentRes.json();
                const uniqueCombos = [];
                allStudents.forEach(s => {
                    const cName = s.className || s.class_name;
                    const sName = s.section;
                    if (cName && !uniqueCombos.some(item => (item.className === cName && item.section === sName))) {
                        uniqueCombos.push({ className: cName, section: sName });
                    }
                });
                if (uniqueCombos.length > 0) {
                    teacherClasses = uniqueCombos;
                }
            }
        } catch (e) {
            console.error("Fallback students query failed:", e);
        }
    }

    // Default static fallback if database is not reachable / empty
    if (!teacherClasses || teacherClasses.length === 0) {
        teacherClasses = [
            { className: "5", section: "A" },
            { className: "5", section: "B" },
            { className: "6", section: "A" },
            { className: "6", section: "B" }
        ];
    }

    populateClassFilter();
}

function populateClassFilter() {
    const classFilter = document.getElementById("classFilter");
    classFilter.innerHTML = `<option value="">Select Class</option>`;

    const uniqueClasses = [...new Set(teacherClasses.map(c => c.className || c.class_name))].filter(Boolean);

    uniqueClasses.forEach(cls => {
        const option = document.createElement("option");
        option.value = cls;
        option.textContent = cls.toLowerCase().startsWith("class") ? cls : `Class ${cls}`;
        classFilter.appendChild(option);
    });
}

function populateSectionFilter() {
    const classFilter = document.getElementById("classFilter");
    const sectionFilter = document.getElementById("sectionFilter");
    const selectedClass = classFilter.value;

    sectionFilter.innerHTML = `<option value="">Select Section</option>`;

    if (!selectedClass) {
        sectionFilter.disabled = true;
        return;
    }

    const availableSections = teacherClasses
        .filter(c => (c.className || c.class_name) == selectedClass)
        .map(c => c.section)
        .filter(Boolean);

    const uniqueSections = availableSections.length > 0 ? [...new Set(availableSections)] : ["A", "B"];

    uniqueSections.forEach(sec => {
        const option = document.createElement("option");
        option.value = sec;
        option.textContent = `Section ${sec}`;
        sectionFilter.appendChild(option);
    });

    sectionFilter.disabled = false;
}

// Triggered when dropdowns change
async function handleFilterChange() {
    const classVal = document.getElementById("classFilter").value;
    const secVal = document.getElementById("sectionFilter").value;
    const subVal = document.getElementById("subjectFilter").value;
    const examVal = document.getElementById("examFilter").value;

    if (classVal && secVal && subVal && examVal) {
        await loadStudents(classVal, secVal);
        await loadExistingMarks();
        renderTable();
    } else {
        renderEmptyMessage("Please select Class, Section, Subject, and Exam to load students.");
    }
}

// Fetch students for class and section
async function loadStudents(className, section) {
    try {
        const res = await fetch(`${API_BASE}/students/class/${className}/section/${section}`);
        if (res.ok) {
            studentsData = await res.json();
            return;
        }
    } catch (err) {
        console.warn("Class-section endpoint failed, falling back to /api/students:", err);
    }

    // Fallback to /api/students
    try {
        const allRes = await fetch(`${API_BASE}/students`);
        if (allRes.ok) {
            const allStudents = await allRes.json();
            studentsData = allStudents.filter(s => 
                String(s.className || s.class_name) === String(className) && 
                String(s.section) === String(section)
            );
        }
    } catch (e) {
        console.error("Failed to load students:", e);
        studentsData = [];
    }
}

// Load existing marks from backend
async function loadExistingMarks() {
    try {
        const res = await fetch(`${API_BASE}/marks`);
        if (res.ok) {
            savedMarks = await res.json();
        }
    } catch (err) {
        console.warn("Could not load marks:", err);
        savedMarks = [];
    }
}

// Render the Marks Table
function renderTable() {
    const tableBody = document.getElementById("studentMarksTableBody");
    const actionsBar = document.getElementById("tableActionsBar");
    const subVal = document.getElementById("subjectFilter").value;
    const examVal = document.getElementById("examFilter").value;

    tableBody.innerHTML = "";

    if (!studentsData || studentsData.length === 0) {
        renderEmptyMessage("No students found in the selected Class & Section.");
        if (actionsBar) actionsBar.style.display = "none";
        updateSummary();
        return;
    }

    studentsData.forEach((student, index) => {
        const studentId = student.studentId || student.student_id;
        const rollNo = student.rollNo || student.roll_no || "-";
        const fullName = student.fullName || student.full_name || "Unknown";

        const existingRecord = savedMarks.find(m => 
            (m.studentId === studentId || (m.student && m.student.studentId === studentId)) &&
            (m.subject === subVal) &&
            (m.examType === examVal || m.examName === examVal)
        );

        const currentMark = existingRecord ? (existingRecord.marksObtained ?? existingRecord.marks_obtained ?? "") : "";
        const isEntered = currentMark !== "";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="text-align: center;">${index + 1}</td>
            <td class="roll-number">${rollNo}</td>
            <td class="student-name">${fullName}</td>
            <td style="text-align: center;">${maximumMarks}</td>
            <td style="text-align: center;">
                <input type="number" 
                    class="marks-input" 
                    id="mark_${studentId}" 
                    min="0" 
                    max="${maximumMarks}" 
                    value="${currentMark}" 
                    placeholder="Marks"
                    oninput="validateInput(this, ${studentId})"
                />
            </td>
            <td style="text-align: center;" id="status_${studentId}">
                <span class="status-badge ${isEntered ? 'status-entered' : 'status-pending'}">
                    ${isEntered ? '<i class="fa-solid fa-check"></i> Entered' : '<i class="fa-solid fa-clock"></i> Pending'}
                </span>
            </td>
            <td style="text-align: center;">
                <button type="button" class="save-row-btn" title="Save" onclick="saveIndividualMark(${studentId})">
                    <i class="fa-solid fa-floppy-disk"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    if (actionsBar) actionsBar.style.display = "flex";
    updateSummary();
}

function renderEmptyMessage(msg) {
    const tableBody = document.getElementById("studentMarksTableBody");
    if (!tableBody) return;
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="empty-message">
                <i class="fa-solid fa-clipboard-list"></i>
                ${msg}
            </td>
        </tr>
    `;
    const actionsBar = document.getElementById("tableActionsBar");
    if (actionsBar) actionsBar.style.display = "none";
}

function validateInput(input, studentId) {
    const val = input.value.trim();
    const statusCell = document.getElementById(`status_${studentId}`);

    if (val === "") {
        input.classList.remove("invalid");
        if (statusCell) statusCell.innerHTML = `<span class="status-badge status-pending"><i class="fa-solid fa-clock"></i> Pending</span>`;
    } else {
        const num = Number(val);
        if (num < 0 || num > maximumMarks || isNaN(num)) {
            input.classList.add("invalid");
        } else {
            input.classList.remove("invalid");
            if (statusCell) statusCell.innerHTML = `<span class="status-badge status-entered"><i class="fa-solid fa-check"></i> Entered</span>`;
        }
    }
    updateSummary();
}

async function saveIndividualMark(studentId) {
    const input = document.getElementById(`mark_${studentId}`);
    if (!input) return;

    const val = input.value.trim();
    if (val === "" || isNaN(val) || Number(val) < 0 || Number(val) > maximumMarks) {
        alert("Please enter a valid mark between 0 and " + maximumMarks);
        input.focus();
        return;
    }

    const payload = {
        studentId: studentId,
        subject: document.getElementById("subjectFilter").value,
        examType: document.getElementById("examFilter").value,
        examDate: document.getElementById("examDate").value,
        maxMarks: maximumMarks,
        marksObtained: Number(val)
    };

    try {
        const res = await fetch(`${API_BASE}/marks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Mark saved successfully!");
            await loadExistingMarks();
            renderTable();
        } else {
            alert("Failed to save mark. Please try again.");
        }
    } catch (err) {
        console.error("Save error:", err);
        alert("Error saving mark.");
    }
}

async function saveAllMarks() {
    const subVal = document.getElementById("subjectFilter").value;
    const examVal = document.getElementById("examFilter").value;
    const examDateVal = document.getElementById("examDate").value;

    const promises = [];

    studentsData.forEach(student => {
        const studentId = student.studentId || student.student_id;
        const input = document.getElementById(`mark_${studentId}`);
        if (input && input.value.trim() !== "") {
            const val = Number(input.value.trim());
            if (val >= 0 && val <= maximumMarks) {
                const payload = {
                    studentId: studentId,
                    subject: subVal,
                    examType: examVal,
                    examDate: examDateVal,
                    maxMarks: maximumMarks,
                    marksObtained: val
                };
                promises.push(
                    fetch(`${API_BASE}/marks`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    })
                );
            }
        }
    });

    if (promises.length === 0) {
        alert("No marks entered to save.");
        return;
    }

    try {
        await Promise.all(promises);
        alert("All marks saved successfully!");
        await loadExistingMarks();
        renderTable();
    } catch (err) {
        console.error("Error saving all marks:", err);
        alert("Some marks could not be saved.");
    }
}

function clearAllMarks() {
    studentsData.forEach(student => {
        const studentId = student.studentId || student.student_id;
        const input = document.getElementById(`mark_${studentId}`);
        if (input) {
            input.value = "";
            input.classList.remove("invalid");
            const statusCell = document.getElementById(`status_${studentId}`);
            if (statusCell) {
                statusCell.innerHTML = `<span class="status-badge status-pending"><i class="fa-solid fa-clock"></i> Pending</span>`;
            }
        }
    });
    updateSummary();
}

function updateSummary() {
    const totalStudents = studentsData.length;
    let entered = 0;

    studentsData.forEach(student => {
        const studentId = student.studentId || student.student_id;
        const input = document.getElementById(`mark_${studentId}`);
        if (input && input.value.trim() !== "" && !input.classList.contains("invalid")) {
            entered++;
        }
    });

    const totalEl = document.getElementById("totalStudentsCount");
    const enteredEl = document.getElementById("marksEnteredCount");
    const pendingEl = document.getElementById("marksPendingCount");

    if (totalEl) totalEl.textContent = totalStudents;
    if (enteredEl) enteredEl.textContent = entered;
    if (pendingEl) pendingEl.textContent = Math.max(0, totalStudents - entered);
}

window.saveIndividualMark = saveIndividualMark;
window.saveAllMarks = saveAllMarks;
window.clearAllMarks = clearAllMarks;