/**
 * Teacher Students Module JavaScript
 * Power Public School ERP
 */

const API_BASE_URL = "http://localhost:8080/api";
const TEACHER_ID = 1;

let allStudents = [];

document.addEventListener("DOMContentLoaded", () => {
    updateDateDisplay();
    loadTeacherInfo();
    initializeClassAndStudents();
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
 * Loads Teacher profile details in the top bar
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
 * Resolves current class and section, then fetches students
 */
async function initializeClassAndStudents() {
    // Check URL query parameters or sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const className = urlParams.get("className") || sessionStorage.getItem("selectedClass") || "5";
    const section = urlParams.get("section") || sessionStorage.getItem("selectedSection") || "A";

    const classTitle = document.getElementById("classTitle");
    const classDescription = document.getElementById("classDescription");
    const pageSubtitle = document.getElementById("pageSubtitle");

    if (classTitle) classTitle.textContent = `Class ${className} - Section ${section}`;
    if (classDescription) classDescription.textContent = `Viewing student roster for Class ${className}, Section ${section}`;
    if (pageSubtitle) pageSubtitle.textContent = `Students in Class ${className} - ${section}`;

    await loadStudents(className, section);
}

/**
 * Fetches students from backend API
 */
async function loadStudents(className, section) {
    const tableBody = document.getElementById("studentsTableBody");

    try {
        const response = await fetch(`${API_BASE_URL}/students/class/${className}/section/${section}`);
        if (response.ok) {
            allStudents = await response.json();
            renderStudentsTable(allStudents);
            updateSummaryCards(allStudents);
        } else {
            tableBody.innerHTML = `<tr><td colspan="7" class="empty-message">No students found for Class ${className} - ${section}.</td></tr>`;
        }
    } catch (error) {
        console.warn("Error fetching students, using fallback preview:", error);
        tableBody.innerHTML = `<tr><td colspan="7" class="empty-message">Unable to load students from server.</td></tr>`;
    }
}

/**
 * Renders students to the table
 */
function renderStudentsTable(students) {
    const tableBody = document.getElementById("studentsTableBody");
    const studentCountElem = document.getElementById("studentCount");

    if (!students || students.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="empty-message">No matching students found.</td></tr>`;
        if (studentCountElem) studentCountElem.textContent = "0 Students";
        return;
    }

    if (studentCountElem) studentCountElem.textContent = `${students.length} Students`;
    tableBody.innerHTML = "";

    students.forEach((student, index) => {
        const fullName = student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
        const admissionNo = student.admissionNo || student.studentId || '-';
        const rollNo = student.rollNo || '-';
        const gender = student.gender || '-';
        const dob = student.dob || student.dateOfBirth || '-';
        const status = student.status || 'Active';

        const row = `
            <tr>
                <td><strong>${index + 1}</strong></td>
                <td>
                    <div class="student-name-cell">
                        ${student.photo ? `<img src="${student.photo}" class="student-photo" alt="Photo">` : `<div class="student-photo-placeholder"><i class="fa-solid fa-user"></i></div>`}
                        <strong>${fullName}</strong>
                    </div>
                </td>
                <td>${admissionNo}</td>
                <td><strong>${rollNo}</strong></td>
                <td>${gender}</td>
                <td>${dob}</td>
                <td>
                    <span class="status-badge ${status.toLowerCase() === 'active' ? 'active' : 'inactive'}">
                        ${status}
                    </span>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", row);
    });
}

/**
 * Updates male, female, and total counter cards
 */
function updateSummaryCards(students) {
    const totalElem = document.getElementById("totalStudents");
    const maleElem = document.getElementById("maleStudents");
    const femaleElem = document.getElementById("femaleStudents");

    const total = students.length;
    const males = students.filter(s => (s.gender || '').toLowerCase() === 'male').length;
    const females = students.filter(s => (s.gender || '').toLowerCase() === 'female').length;

    if (totalElem) totalElem.textContent = total;
    if (maleElem) maleElem.textContent = males;
    if (femaleElem) femaleElem.textContent = females;
}

/**
 * Real-time student search filter
 */
function filterStudentsTable() {
    const query = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
    if (!query) {
        renderStudentsTable(allStudents);
        return;
    }

    const filtered = allStudents.filter(student => {
        const name = (student.fullName || `${student.firstName || ''} ${student.lastName || ''}`).toLowerCase();
        const roll = String(student.rollNo || '').toLowerCase();
        const adm = String(student.admissionNo || student.studentId || '').toLowerCase();
        return name.includes(query) || roll.includes(query) || adm.includes(query);
    });

    renderStudentsTable(filtered);
}

function goBack() {
    window.location.href = "teacher-classes.html";
}

function logout() {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "login.html";
}

window.filterStudentsTable = filterStudentsTable;
window.goBack = goBack;
window.logout = logout;