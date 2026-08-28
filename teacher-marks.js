/**
 * Teacher Marks Entry Module
 * Power Public School ERP
 */

const API_BASE = "https://loginpagepsabackend.onrender.com/api";
const TEACHER_ID = localStorage.getItem("teacherId") || "1";

let teacherClasses = [];
let allStudents = [];
let savedMarks = [];
const maximumMarks = 100;

document.addEventListener("DOMContentLoaded", async () => {
    updateDateDisplay();
    loadTeacherInfo();
    await loadTeacherClasses();
    await loadAllData();
    initFilters();
});

function updateDateDisplay() {
    const now = new Date();
    const dateVal = document.getElementById("currentDateVal");
    const dayVal = document.getElementById("currentDayVal");

    if (dateVal) dateVal.textContent = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    if (dayVal) dayVal.textContent = now.toLocaleDateString("en-IN", { weekday: "long" });
}

async function loadTeacherInfo() {
    try {
        const res = await fetch(`${API_BASE}/teachers/${TEACHER_ID}`);
        if (res.ok) {
            const data = await res.json();
            const nameElem = document.getElementById("teacherNameDisplay");
            const picElem = document.getElementById("teacherProfilePic");
            if (nameElem && data.fullName) nameElem.textContent = data.fullName;
            if (picElem) {
                picElem.src = data.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName || 'Teacher')}&background=e8f0fe&color=1f3f6d`;
            }
        }
    } catch (e) {
        console.warn("Could not load profile header:", e);
    }
}

async function loadTeacherClasses() {
    try {
        const res = await fetch(`${API_BASE}/teachers/${TEACHER_ID}/classes`);
        if (res.ok) {
            teacherClasses = await res.json();
        }
    } catch (err) {
        console.warn("Backend classes fetch failed, using fallback:", err);
    }

    if (!teacherClasses || teacherClasses.length === 0) {
        teacherClasses = [
            { className: "5", section: "A" },
            { className: "5", section: "B" },
            { className: "6", section: "A" },
            { className: "6", section: "B" }
        ];
    }

    populateClassDropdown();
    populateSectionDropdown();
}

function populateClassDropdown() {
    const classFilter = document.getElementById("classFilter");
    if (!classFilter) return;

    classFilter.innerHTML = `<option value="All">All Classes</option>`;
    const uniqueClasses = [...new Set(teacherClasses.map(c => c.className || c.class_name))];

    uniqueClasses.forEach(cls => {
        const opt = document.createElement("option");
        opt.value = cls;
        opt.textContent = `Class ${cls}`;
        classFilter.appendChild(opt);
    });
}

function populateSectionDropdown() {
    const classFilter = document.getElementById("classFilter");
    const sectionFilter = document.getElementById("sectionFilter");
    if (!sectionFilter) return;

    const selectedClass = classFilter ? classFilter.value : "All";
    sectionFilter.innerHTML = `<option value="All">All Sections</option>`;

    let sections = [];
    if (selectedClass === "All") {
        sections = teacherClasses.map(c => c.section);
    } else {
        sections = teacherClasses.filter(c => String(c.className || c.class_name) === String(selectedClass)).map(c => c.section);
    }

    const uniqueSections = [...new Set(sections.filter(Boolean))];
    uniqueSections.forEach(sec => {
        const opt = document.createElement("option");
        opt.value = sec;
        opt.textContent = `Section ${sec}`;
        sectionFilter.appendChild(opt);
    });
}

async function loadAllData() {
    try {
        const studentRes = await fetch(`${API_BASE}/students`);
        if (studentRes.ok) {
            allStudents = await studentRes.json();
        }
    } catch (e) {
        console.warn("Student fetch error:", e);
    }

    // Load saved marks directly from the Spring MarkController
    try {
        const marksRes = await fetch(`${API_BASE}/teacher/marks`);
        if (marksRes.ok) {
            const data = await marksRes.json();
            if (Array.isArray(data)) {
                savedMarks = data;
            }
        }
    } catch (e) {
        console.warn("Marks fetch error:", e);
    }

    renderTable();
}

function initFilters() {
    const classFilter = document.getElementById("classFilter");
    const sectionFilter = document.getElementById("sectionFilter");
    const subjectFilter = document.getElementById("subjectFilter");
    const examFilter = document.getElementById("examFilter");

    if (classFilter) {
        classFilter.addEventListener("change", () => {
            populateSectionDropdown();
            renderTable();
        });
    }

    if (sectionFilter) sectionFilter.addEventListener("change", renderTable);
    if (subjectFilter) subjectFilter.addEventListener("change", renderTable);
    if (examFilter) examFilter.addEventListener("change", renderTable);
}

function getFilteredStudents() {
    const classVal = document.getElementById("classFilter")?.value || "All";
    const secVal = document.getElementById("sectionFilter")?.value || "All";

    return allStudents.filter(student => {
        const studentClass = String(student.className || student.class_name || "");
        const studentSec = String(student.section || "");

        const classMatch = (classVal === "All" || studentClass === classVal);
        const secMatch = (secVal === "All" || studentSec === secVal);

        return classMatch && secMatch;
    });
}

function renderTable() {
    const tableBody = document.getElementById("studentMarksTableBody");
    if (!tableBody) return;

    const filtered = getFilteredStudents();
    const selectedSubject = document.getElementById("subjectFilter")?.value || "All";
    const selectedExam = document.getElementById("examFilter")?.value || "All";

    tableBody.innerHTML = "";

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="empty-message" style="text-align:center; padding: 25px;">No students found matching current filters.</td></tr>`;
        updateStats(0, 0);
        return;
    }

    let enteredCount = 0;

    filtered.forEach((student, index) => {
        const sId = Number(student.studentId || student.student_id || student.id);
        const rollNo = student.rollNo || student.roll_no || "-";
        const fullName = student.fullName || student.full_name || student.name || "Student";
        const classSec = `Class ${student.className || student.class_name} - ${student.section}`;

        // Schema match against Mark entity
        const existing = savedMarks.find(m => {
            const markStudentId = Number(m.studentId || m.student_id);
            if (markStudentId !== sId) return false;

            const markSub = String(m.subject || "");
            const markExam = String(m.examType || m.exam_type || m.examName || "");

            const subjectMatch = (selectedSubject === "All" || markSub.toLowerCase() === selectedSubject.toLowerCase());
            const examMatch = (selectedExam === "All" || markExam.toLowerCase() === selectedExam.toLowerCase());

            return subjectMatch && examMatch;
        });

        let markVal = "";
        if (existing) {
            markVal = existing.marksObtained ?? existing.marks_obtained ?? "";
        }

        const isEntered = markVal !== "" && markVal !== null && markVal !== undefined;
        if (isEntered) enteredCount++;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td style="text-align: center;"><strong>${index + 1}</strong></td>
            <td>${rollNo}</td>
            <td><strong>${fullName}</strong></td>
            <td>${classSec}</td>
            <td style="text-align: center;">${maximumMarks}</td>
            <td style="text-align: center;">
                <input type="number" 
                    class="marks-input" 
                    id="mark_${sId}" 
                    min="0" 
                    max="${maximumMarks}" 
                    value="${markVal}" 
                    placeholder="Marks"
                    oninput="validateInput(this, ${sId})"
                />
            </td>
            <td style="text-align: center;" id="status_${sId}">
                <span class="status-badge ${isEntered ? 'status-entered' : 'status-pending'}">
                    ${isEntered ? 'Entered' : 'Pending'}
                </span>
            </td>
            <td style="text-align: center;">
                <button type="button" class="save-btn-row" onclick="saveIndividualMark(${sId})">Save</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updateStats(filtered.length, enteredCount);
}

function validateInput(input, studentId) {
    const val = input.value.trim();
    const statusCell = document.getElementById(`status_${studentId}`);

    if (val === "") {
        if (statusCell) statusCell.innerHTML = `<span class="status-badge status-pending">Pending</span>`;
    } else {
        let num = Number(val);
        if (num > maximumMarks) input.value = maximumMarks;
        if (num < 0) input.value = 0;
        if (statusCell) statusCell.innerHTML = `<span class="status-badge status-entered">Entered</span>`;
    }
    recalculateStats();
}

function updateStats(total, entered) {
    const totalEl = document.getElementById("totalStudentsCount");
    const enteredEl = document.getElementById("marksEnteredCount");
    const pendingEl = document.getElementById("marksPendingCount");

    if (totalEl) totalEl.textContent = total;
    if (enteredEl) enteredEl.textContent = entered;
    if (pendingEl) pendingEl.textContent = Math.max(0, total - entered);
}

function recalculateStats() {
    const filtered = getFilteredStudents();
    let entered = 0;
    filtered.forEach(s => {
        const sId = Number(s.studentId || s.student_id || s.id);
        const input = document.getElementById(`mark_${sId}`);
        if (input && input.value.trim() !== "") entered++;
    });
    updateStats(filtered.length, entered);
}

async function saveIndividualMark(studentId) {
    const input = document.getElementById(`mark_${studentId}`);
    if (!input || input.value.trim() === "") {
        alert("Please enter a mark before saving.");
        return;
    }

    const marksVal = Number(input.value.trim());
    if (isNaN(marksVal) || marksVal < 0 || marksVal > maximumMarks) {
        alert(`Please enter a valid mark between 0 and ${maximumMarks}.`);
        input.focus();
        return;
    }

    const todayDate = new Date().toISOString().split("T")[0];
    const subjectVal = document.getElementById("subjectFilter")?.value;
    const examVal = document.getElementById("examFilter")?.value;
    
    const chosenSubject = (!subjectVal || subjectVal === "All") ? "Mathematics" : subjectVal;
    const chosenExam = (!examVal || examVal === "All") ? "Quarterly Exam" : examVal;

    // Strict alignment with Spring Boot MarkRequest DTO
    const payload = {
        studentId: Number(studentId),
        subject: chosenSubject,
        examType: chosenExam,
        examDate: todayDate,
        maxMarks: maximumMarks,
        marksObtained: marksVal
    };

    try {
        const res = await fetch(`${API_BASE}/teacher/marks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const savedEntity = await res.json();

            // Update in-memory state
            const existingIndex = savedMarks.findIndex(m => {
                const mId = Number(m.studentId || m.student_id);
                const mSub = String(m.subject || "");
                const mExam = String(m.examType || m.exam_type || "");
                return mId === Number(studentId) && 
                       mSub.toLowerCase() === chosenSubject.toLowerCase() &&
                       mExam.toLowerCase() === chosenExam.toLowerCase();
            });

            if (existingIndex > -1) {
                savedMarks[existingIndex] = savedEntity;
            } else {
                savedMarks.push(savedEntity);
            }

            alert("Mark saved successfully!");
            renderTable();
        } else {
            const err = await res.text();
            alert("Backend error: " + err);
        }
    } catch (err) {
        console.error("Save error:", err);
        alert("Failed to connect to backend: " + err.message);
    }
}

window.saveIndividualMark = saveIndividualMark;