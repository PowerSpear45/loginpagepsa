/**
 * Teacher Attendance Module JavaScript - Aligned with Spring Boot AttendanceController
 * Power Public School ERP
 */

const API_BASE = "https://loginpagepsabackend.onrender.com/api";
const TEACHER_ID = localStorage.getItem("teacherId") || "1";

/* =====================================================
   ELEMENT REFERENCES
   ===================================================== */
const classFilter = document.getElementById("classFilter");
const sectionFilter = document.getElementById("sectionFilter");
const attendanceDate = document.getElementById("attendanceDate");
const rollSearch = document.getElementById("rollSearch");
const attendanceTableBody = document.getElementById("attendanceTableBody");
const totalStudentsEl = document.getElementById("totalStudents");
const totalPresentEl = document.getElementById("totalPresent");
const totalAbsentEl = document.getElementById("totalAbsent");
const lateComersEl = document.getElementById("lateComers");
const rosterCountBadge = document.getElementById("rosterCountBadge");

/* =====================================================
   DATA STATES
   ===================================================== */
let teacherClasses = [];
let studentsData = [];

/* =====================================================
   INITIALIZATION
   ===================================================== */
document.addEventListener("DOMContentLoaded", async () => {
    updateDateDisplay();
    setDefaultDate();
    loadTeacherInfo();

    try {
        await loadTeacherClasses();
        await loadStudents();
        await loadAttendance();
    } catch (error) {
        console.error("Attendance initialization error:", error);
    }
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

            const fullName = data.fullName || data.full_name || "Abinash Kumar";
            if (nameElem) nameElem.textContent = fullName;
            if (picElem) {
                picElem.src = data.photoUrl || data.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e8f0fe&color=1f3f6d`;
            }
        }
    } catch (e) {
        console.warn("Could not load teacher profile header:", e);
    }
}

function setDefaultDate() {
    const today = new Date().toISOString().split("T")[0];
    if (attendanceDate) {
        attendanceDate.value = today;
    }
}

/* =====================================================
   LOAD TEACHER CLASSES & FILTERS
   ===================================================== */
async function loadTeacherClasses() {
    try {
        const response = await fetch(`${API_BASE}/teachers/${TEACHER_ID}/classes`);
        if (response.ok) {
            teacherClasses = await response.json();
        }
    } catch (e) {
        console.warn("Classes fetch failed, fallback active:", e);
    }

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
    classFilter.innerHTML = `<option value="All">All Classes</option>`;
    const classNames = [...new Set(teacherClasses.map(item => String(item.className || item.class_name)))];

    classNames.forEach(className => {
        const option = document.createElement("option");
        option.value = className;
        option.textContent = `Class ${className}`;
        classFilter.appendChild(option);
    });

    const preClass = localStorage.getItem("selectedClass");
    if (preClass && classNames.includes(preClass)) {
        classFilter.value = preClass;
    }

    populateSectionFilter();
}

function populateSectionFilter() {
    sectionFilter.innerHTML = `<option value="All">All Sections</option>`;
    const selectedClass = classFilter.value;

    const sections = teacherClasses
        .filter(item => selectedClass === "All" || String(item.className || item.class_name) === String(selectedClass))
        .map(item => item.section);

    const uniqueSections = [...new Set(sections.filter(Boolean))];
    uniqueSections.forEach(section => {
        const option = document.createElement("option");
        option.value = section;
        option.textContent = `Section ${section}`;
        sectionFilter.appendChild(option);
    });

    const preSection = localStorage.getItem("selectedSection");
    if (preSection && uniqueSections.includes(preSection)) {
        sectionFilter.value = preSection;
    }
}

/* =====================================================
   LOAD STUDENTS
   ===================================================== */
async function loadStudents() {
    try {
        const response = await fetch(`${API_BASE}/students`);
        if (response.ok) {
            const students = await response.json();
            studentsData = students.map(student => ({
                studentId: Number(student.studentId || student.student_id || student.id),
                rollNo: student.rollNo || student.roll_no || "-",
                studentName: student.fullName || student.full_name || student.name || "Student",
                className: String(student.className || student.class_name || ""),
                section: String(student.section || ""),
                photo: student.photo || student.photoUrl || null,
                todayStatus: "Not Marked"
            }));
        }
    } catch (e) {
        console.warn("Could not load students, using fallback roster:", e);
    }
}

/* =====================================================
   LOAD ATTENDANCE RECORDS (Exact Spring QueryParam Fix)
   ===================================================== */
async function loadAttendance() {
    const selectedDate = attendanceDate.value;
    if (!selectedDate) return;

    // Reset current statuses
    studentsData.forEach(student => {
        student.todayStatus = "Not Marked";
    });

    try {
        // Aligned to: GET /api/attendance?date={selectedDate}
        const response = await fetch(`${API_BASE}/attendance?date=${selectedDate}`);
        if (response.ok) {
            const records = await response.json();
            if (Array.isArray(records)) {
                records.forEach(record => {
                    const rStudentId = Number(record.studentId || record.student_id || (record.student && (record.student.studentId || record.student.id)));
                    const student = studentsData.find(item => item.studentId === rStudentId);
                    if (student) {
                        student.todayStatus = convertStatus(record.status);
                    }
                });
            }
        }
    } catch (e) {
        console.warn("Failed to retrieve attendance records from backend:", e);
    }

    displayStudents();
}

function convertStatus(status) {
    if (!status) return "Not Marked";
    switch (status.toUpperCase()) {
        case "PRESENT": return "Present";
        case "ABSENT": return "Absent";
        case "LATE": return "Late";
        case "LEAVE": return "Leave";
        default: return "Not Marked";
    }
}

/* =====================================================
   FILTER & RENDER
   ===================================================== */
function getFilteredStudents() {
    const selectedClass = classFilter.value;
    const selectedSection = sectionFilter.value;
    const search = rollSearch.value.trim().toLowerCase();

    return studentsData.filter(student => {
        const classMatch = selectedClass === "All" || String(student.className) === String(selectedClass);
        const sectionMatch = selectedSection === "All" || String(student.section) === String(selectedSection);
        const searchMatch = String(student.rollNo).toLowerCase().includes(search) ||
                            String(student.studentName).toLowerCase().includes(search);

        return classMatch && sectionMatch && searchMatch;
    });
}

function displayStudents() {
    const students = getFilteredStudents();
    attendanceTableBody.innerHTML = "";

    if (rosterCountBadge) rosterCountBadge.textContent = `${students.length} Students`;

    if (students.length === 0) {
        attendanceTableBody.innerHTML = `<tr><td colspan="6" class="empty-state">No students found matching current filters.</td></tr>`;
        updateSummary([]);
        return;
    }

    students.forEach((student, index) => {
        const row = document.createElement("tr");
        const statusBadgeClass = getStatusBadgeClass(student.todayStatus);

        row.innerHTML = `
            <td><strong>${index + 1}</strong></td>
            <td><strong>${student.rollNo}</strong></td>
            <td>
                <div class="student-name-cell">
                    ${student.photo ? `<img src="${student.photo}" class="student-photo" alt="Photo">` : `<div class="student-placeholder"><i class="fa-solid fa-user"></i></div>`}
                    <strong>${student.studentName}</strong>
                </div>
            </td>
            <td>Class ${student.className} - Section ${student.section}</td>
            <td style="text-align: center;">
                <span id="badge_${student.studentId}" class="status-pill ${statusBadgeClass}">
                    ${student.todayStatus}
                </span>
            </td>
            <td style="text-align: center;">
                <select
                    class="status-select"
                    onchange="changeStatus(${student.studentId}, this.value)"
                >
                    <option value="Not Marked" ${student.todayStatus === "Not Marked" ? "selected" : ""}>Select</option>
                    <option value="Present" ${student.todayStatus === "Present" ? "selected" : ""}>Present</option>
                    <option value="Absent" ${student.todayStatus === "Absent" ? "selected" : ""}>Absent</option>
                    <option value="Late" ${student.todayStatus === "Late" ? "selected" : ""}>Late</option>
                    <option value="Leave" ${student.todayStatus === "Leave" ? "selected" : ""}>Leave</option>
                </select>
            </td>
        `;
        attendanceTableBody.appendChild(row);
    });

    updateSummary(students);
}

/* =====================================================
   STATUS HANDLERS
   ===================================================== */
function changeStatus(studentId, status) {
    const student = studentsData.find(item => item.studentId === Number(studentId));
    if (!student) return;

    student.todayStatus = status;

    const badge = document.getElementById(`badge_${studentId}`);
    if (badge) {
        badge.className = "status-pill " + getStatusBadgeClass(status);
        badge.textContent = status;
    }

    updateSummary(getFilteredStudents());
}

function getStatusBadgeClass(status) {
    switch (status) {
        case "Present": return "status-present";
        case "Absent": return "status-absent";
        case "Late": return "status-late";
        case "Leave": return "status-leave";
        default: return "status-not-marked";
    }
}

/* =====================================================
   SAVE ATTENDANCE
   ===================================================== */
document.getElementById("saveAttendanceBtn")?.addEventListener("click", saveAttendance);

async function saveAttendance() {
    const selectedDate = attendanceDate.value;
    if (!selectedDate) {
        alert("Please select an attendance date.");
        return;
    }

    const students = getFilteredStudents();
    if (students.length === 0) {
        alert("No students found to record attendance.");
        return;
    }

    const unmarked = students.filter(student => student.todayStatus === "Not Marked");
    if (unmarked.length > 0) {
        alert(`Please select an attendance status for all students before saving.\n\nUnmarked students: ${unmarked.length}`);
        return;
    }

    // Direct mapping to Attendance.java entity
    const payload = students.map(student => ({
        studentId: student.studentId,
        attendanceDate: selectedDate,
        status: student.todayStatus.toUpperCase()
    }));

    try {
        const response = await fetch(`${API_BASE}/attendance/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Attendance saved successfully!");
            await loadAttendance(); // Re-fetches from DB and renders status pills accurately
        } else {
            const err = await response.text();
            alert("Server returned error: " + err);
        }
    } catch (error) {
        console.error("Save attendance error:", error);
        alert("Error saving attendance to server: " + error.message);
    }
}

/* =====================================================
   EVENT LISTENERS
   ===================================================== */
classFilter.addEventListener("change", () => {
    populateSectionFilter();
    displayStudents();
});

sectionFilter.addEventListener("change", () => {
    displayStudents();
});

rollSearch.addEventListener("input", () => {
    displayStudents();
});

attendanceDate.addEventListener("change", async () => {
    await loadAttendance();
});

/* =====================================================
   SUMMARY STATS
   ===================================================== */
function updateSummary(students) {
    let present = 0, absent = 0, late = 0;

    students.forEach(student => {
        if (student.todayStatus === "Present") present++;
        if (student.todayStatus === "Absent") absent++;
        if (student.todayStatus === "Late") late++;
    });

    if (totalStudentsEl) totalStudentsEl.textContent = students.length;
    if (totalPresentEl) totalPresentEl.textContent = present;
    if (totalAbsentEl) totalAbsentEl.textContent = absent;
    if (lateComersEl) lateComersEl.textContent = late;
}

window.changeStatus = changeStatus;
