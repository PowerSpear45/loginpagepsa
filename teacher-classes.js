/**
 * Teacher Classes Module JavaScript
 * Power Public School ERP
 */

const API_BASE_URL = "http://localhost:8080/api";
const TEACHER_ID = 1; // Default logged-in teacher ID

document.addEventListener("DOMContentLoaded", () => {
    updateDateDisplay();
    loadTeacherInfo();
    loadTeacherAssignedClasses();
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
 * Loads Teacher info in the Top Bar
 */
async function loadTeacherInfo() {
    try {
        const res = await fetch(`${API_BASE_URL}/teachers/${TEACHER_ID}`);
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

/**
 * Fetches and renders assigned classes in the table and summary cards
 */
async function loadTeacherAssignedClasses() {
    const tableBody = document.getElementById("classesTableBody");
    const totalClassesElem = document.getElementById("totalClassesCount");
    const totalStudentsElem = document.getElementById("totalStudentsCount");
    const totalSubjectsElem = document.getElementById("totalSubjectsCount");
    const classCountBadge = document.getElementById("classCountBadge");

    try {
        const response = await fetch(`${API_BASE_URL}/teachers/${TEACHER_ID}/classes`);
        if (response.ok) {
            const classes = await response.json();

            if (!classes || classes.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 25px; color:#888;">No classes assigned yet.</td></tr>`;
                return;
            }

            // Summary stats calculation
            let totalStudents = 0;
            const uniqueSubjects = new Set();

            classes.forEach(c => {
                totalStudents += c.strength || 30;
                if (c.subject) uniqueSubjects.add(c.subject);
            });

            if (totalClassesElem) totalClassesElem.textContent = classes.length;
            if (totalStudentsElem) totalStudentsElem.textContent = totalStudents;
            if (totalSubjectsElem) totalSubjectsElem.textContent = uniqueSubjects.size || "1";
            if (classCountBadge) classCountBadge.textContent = `${classes.length} Classes`;

            // Render table rows
            tableBody.innerHTML = "";
            classes.forEach((item, index) => {
                const isClassTeacher = item.isClassTeacher || item.classTeacher === TEACHER_ID;
                const row = `
                    <tr>
                        <td><strong>${index + 1}</strong></td>
                        <td><strong>Class ${item.className}</strong></td>
                        <td><span class="section-badge">${item.section}</span></td>
                        <td>${item.subject || "General"}</td>
                        <td><span class="student-count">${item.strength || 30} Students</span></td>
                        <td>
                            <span class="role-badge ${isClassTeacher ? 'is-ct' : ''}">
                                ${isClassTeacher ? '⭐ Class Teacher' : 'Subject Teacher'}
                            </span>
                        </td>
                        <td>
                            <div class="action-btns-wrap">
                                <button class="view-btn" onclick="goToAttendance('${item.className}', '${item.section}')">
                                    <i class="fa-solid fa-calendar-check"></i> Attendance
                                </button>
                                <button class="view-btn" onclick="goToMarks('${item.className}', '${item.section}')">
                                    <i class="fa-solid fa-file-pen"></i> Marks
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML("beforeend", row);
            });
        }
    } catch (err) {
        console.warn("Backend unavailable, using default class preview:", err);
    }
}

function goToAttendance(className, section) {
    sessionStorage.setItem("selectedClass", className);
    sessionStorage.setItem("selectedSection", section);
    window.location.href = "teacher-attendance.html";
}

function goToMarks(className, section) {
    sessionStorage.setItem("selectedClass", className);
    sessionStorage.setItem("selectedSection", section);
    window.location.href = "teacher-marks.html";
}

function logout() {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "login.html";
}

window.goToAttendance = goToAttendance;
window.goToMarks = goToMarks;
window.logout = logout;
