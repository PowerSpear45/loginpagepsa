/**
 * Teacher Attendance Module JavaScript
 * Power Public School ERP
 */

const API_BASE = "https://loginpagepsabackend.onrender.com/api";
const TEACHER_ID = 1; // Default teacher identifier

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

/**
 * Updates real-time date in the sidebar
 */
function updateDateDisplay() {
    const now = new Date();
    const dateOptions = { day: "2-digit", month: "short", year: "numeric" };
    const dayOptions = { weekday: "long" };

    const dateVal = document.getElementById("currentDateVal");
    const dayVal = document.getElementById("currentDayVal");

    if (dateVal) dateVal.textContent = now.toLocaleDateString("en-IN", dateOptions);
    if (dayVal) dayVal.textContent = now.toLocaleDateString("en-IN", dayOptions);
}

/**
 * Populates Teacher info in the Top Bar
 */
async function loadTeacherInfo() {
    try {
        const res = await fetch(`${API_BASE}/teachers/${TEACHER_ID}`);
        if (res.ok) {
            const data = await res.json();
            const nameElem = document.getElementById("teacherNameDisplay");
            const deptElem = document.getElementById("teacherDeptDisplay");

            if (nameElem && data.fullName) nameElem.textContent = data.fullName;
            if (deptElem && data.department) deptElem.textContent = `${data.department} Dept`;
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
   LOAD TEACHER CLASSES & POPULATE FILTERS
   ===================================================== */
async function loadTeacherClasses() {
    const response = await fetch(`${API_BASE}/teachers/${TEACHER_ID}/classes`);
    if (!response.ok) throw new Error("Unable to load assigned classes.");

    teacherClasses = await response.json();
    populateClassFilter();
}

function populateClassFilter() {
    classFilter.innerHTML = `<option value="All">All Classes</option>`;
    const classNames = [...new Set(teacherClasses.map(item => item.className))];

    classNames.forEach(className => {
        const option = document.createElement("option");
        option.value = className;
        option.textContent = `Class ${className}`;
        classFilter.appendChild(option);
    });

    // Check if class pre-selected in sessionStorage
    const preClass = sessionStorage.getItem("selectedClass");
    if (preClass && classNames.includes(preClass)) {
        classFilter.value = preClass;
    }

    populateSectionFilter();
}

function populateSectionFilter() {
    sectionFilter.innerHTML = `<option value="All">All Sections</option>`;
    const selectedClass = classFilter.value;

    const sections = teacherClasses
        .filter(item => selectedClass === "All" || String(item.className) === String(selectedClass))
        .map(item => item.section);

    const uniqueSections = [...new Set(sections)];
    uniqueSections.forEach(section => {
        const option = document.createElement("option");
        option.value = section;
        option.textContent = `Section ${section}`;
        sectionFilter.appendChild(option);
    });

    // Check if section pre-selected in sessionStorage
    const preSection = sessionStorage.getItem("selectedSection");
    if (preSection && uniqueSections.includes(preSection)) {
        sectionFilter.value = preSection;
        sessionStorage.removeItem("selectedClass");
        sessionStorage.removeItem("selectedSection");
    }
}

/* =====================================================
   LOAD STUDENTS
   ===================================================== */
async function loadStudents() {
    const response = await fetch(`${API_BASE}/students`);
    if (!response.ok) throw new Error("Unable to load students.");

    const students = await response.json();

    // Filter students belonging to teacher's assigned classes & sections
    studentsData = students
        .filter(student => {
            const studentClass = String(student.className || "");
            const studentSection = String(student.section || "");

            return teacherClasses.some(
                ac => String(ac.className) === studentClass && String(ac.section) === studentSection
            );
        })
        .map(student => ({
            studentId: student.studentId,
            rollNo: student.rollNo || "",
            studentName: student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim(),
            className: student.className || "",
            section: student.section || "",
            photo: student.photo || student.studentPhoto || null,
            todayStatus: "Not Marked"
        }));
}

/* =====================================================
   LOAD ATTENDANCE RECORDS
   ===================================================== */
async function loadAttendance() {
    const selectedDate = attendanceDate.value;
    if (!selectedDate) return;

    // Reset status
    studentsData.forEach(student => {
        student.todayStatus = "Not Marked";
    });

    try {
        const response = await fetch(`${API_BASE}/attendance/date/${selectedDate}`);
        if (response.ok) {
            const records = await response.json();
            records.forEach(record => {
                const student = studentsData.find(
                    item => Number(item.studentId) === Number(record.studentId || record.student?.studentId)
                );
                if (student) {
                    student.todayStatus = convertStatus(record.status);
                }
            });
        }
    } catch (e) {
        console.warn("No attendance records found for this date yet.");
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
        attendanceTableBody.innerHTML = `<tr><td colspan="5" class="empty-state">No students found matching current filters.</td></tr>`;
        updateSummary([]);
        return;
    }

    students.forEach((student, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${index + 1}</strong></td>
            <td><strong>${student.rollNo || '-'}</strong></td>
            <td>
                <div class="student-name-cell">
                    ${student.photo ? `<img src="${student.photo}" class="student-photo" alt="Photo">` : `<div class="student-placeholder"><i class="fa-solid fa-user"></i></div>`}
                    <strong>${student.studentName}</strong>
                </div>
            </td>
            <td>Class ${student.className} - Section ${student.section}</td>
            <td style="text-align: center;">
                <select
                    class="status-select ${getStatusClass(student.todayStatus)}"
                    onchange="changeStatus(${student.studentId}, this.value, this)"
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
function changeStatus(studentId, status, selectElement) {
    const student = studentsData.find(item => Number(item.studentId) === Number(studentId));
    if (!student) return;

    student.todayStatus = status;
    selectElement.className = "status-select " + getStatusClass(status);
    updateSummary(getFilteredStudents());
}

function getStatusClass(status) {
    switch (status) {
        case "Present": return "status-present";
        case "Absent": return "status-absent";
        case "Late": return "status-late";
        case "Leave": return "status-leave";
        default: return "status-not-marked";
    }
}

/* =====================================================
   MARK ALL SHORTCUTS
   ===================================================== */
document.getElementById("markAllPresent")?.addEventListener("click", () => {
    getFilteredStudents().forEach(student => { student.todayStatus = "Present"; });
    displayStudents();
});

document.getElementById("markAllAbsent")?.addEventListener("click", () => {
    getFilteredStudents().forEach(student => { student.todayStatus = "Absent"; });
    displayStudents();
});

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
        alert(`Please assign an attendance status for all students.\n\nUnmarked students: ${unmarked.length}`);
        return;
    }

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

        if (!response.ok) throw new Error("Attendance save failed.");

        alert("Attendance saved successfully!");
        await loadAttendance();
    } catch (error) {
        console.error("Save attendance error:", error);
        alert("Unable to save attendance to the server. Please check your network.");
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
   SUMMARY UPDATES
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

function logout() {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "login.html";
}

window.changeStatus = changeStatus;
window.logout = logout;
