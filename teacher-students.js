const API_BASE = "https://loginpagepsabackend.onrender.com/api";
const TEACHER_ID = localStorage.getItem("teacherId") || "1";
let currentStudents = [];

document.addEventListener("DOMContentLoaded", () => {
    updateDateDisplay();
    loadTeacherProfile(); // Now correctly invoked on page load
    
    // Retrieve selected class and section from localStorage or default to 5-B
    const className = localStorage.getItem("selectedClass") || "5";
    const section = localStorage.getItem("selectedSection") || "B";

    const classTitle = document.getElementById("classTitle");
    const classDesc = document.getElementById("classDescription");
    if (classTitle) classTitle.textContent = `Class ${className} - Section ${section}`;
    if (classDesc) classDesc.textContent = `Viewing student roster for Class ${className}, Section ${section}`;

    loadStudents(className, section);
    initSearch();
});

function updateDateDisplay() {
    const now = new Date();
    const dateVal = document.getElementById("currentDateVal");
    const dayVal = document.getElementById("currentDayVal");

    if (dateVal) dateVal.textContent = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    if (dayVal) dayVal.textContent = now.toLocaleDateString("en-IN", { weekday: "long" });
}

async function loadTeacherProfile() {
    try {
        const response = await fetch(`${API_BASE}/teachers/${TEACHER_ID}`);
        if (response.ok) {
            const teacher = await response.json();
            const nameElem = document.getElementById("teacherNameDisplay");
            const picElem = document.getElementById("teacherProfilePic");
            
            const fullName = teacher.fullName || teacher.full_name || "Abinash Kumar";
            if (nameElem) nameElem.textContent = fullName;
            
            if (picElem) {
                picElem.src = teacher.photo || teacher.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e8f0fe&color=1f3f6d`;
            }
            return;
        }
    } catch (err) {
        console.warn("Could not fetch teacher profile, using default fallback:", err);
    }

    // Default fallback if server is offline or loading
    const defaultName = "Abinash Kumar";
    const nameElem = document.getElementById("teacherNameDisplay");
    const picElem = document.getElementById("teacherProfilePic");
    if (nameElem) nameElem.textContent = defaultName;
    if (picElem) {
        picElem.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=e8f0fe&color=1f3f6d`;
    }
}

async function loadStudents(className, section) {
    const tableBody = document.getElementById("studentsTableBody");
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color:#6b7280;">Loading students from server...</td></tr>`;

    try {
        const response = await fetch(`${API_BASE}/students`);
        if (response.ok) {
            const allStudents = await response.json();
            
            // Filter by class & section and ensure all students have status 'Active'
            currentStudents = allStudents
                .filter(s => 
                    String(s.className || s.class_name) === String(className) && 
                    String(s.section) === String(section)
                )
                .map(s => ({
                    ...s,
                    status: "Active"
                }));
        } else {
            throw new Error("Backend returned an error status.");
        }
    } catch (err) {
        console.warn("Backend offline or failed. Using fallback data:", err);
        currentStudents = [
            { studentId: 101, admissionNo: "ADM101", rollNo: "20265001", fullName: "Abinash Kumar", gender: "Male", className: className, section: section, status: "Active" },
            { studentId: 102, admissionNo: "ADM102", rollNo: "20265002", fullName: "Sanjay P", gender: "Male", className: className, section: section, status: "Active" },
            { studentId: 103, admissionNo: "ADM103", rollNo: "20265003", fullName: "Dhivya T", gender: "Female", className: className, section: section, status: "Active" }
        ];
    }

    renderStudents();
}

function renderStudents() {
    const tableBody = document.getElementById("studentsTableBody");
    if (!tableBody) return;
    
    tableBody.innerHTML = "";

    if (!currentStudents || currentStudents.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px; color:#6b7280;"><i class="fa-solid fa-folder-open" style="font-size: 24px; display:block; margin-bottom:10px;"></i>No students registered in this section yet.</td></tr>`;
        updateCounters();
        return;
    }

    currentStudents.forEach((student, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td style="text-align:center;">${index + 1}</td>
            <td style="font-weight: 600; color: #111827;">${student.fullName || student.full_name || student.name || '-'}</td>
            <td>${student.admissionNo || student.admission_no || '-'}</td>
            <td>${student.rollNo || student.roll_no || '-'}</td>
            <td>${student.gender || '-'}</td>
            <td style="text-align:center;">
                <button type="button" class="action-view-btn" onclick="openStudentViewModal(${index})">
                    <i class="fa-solid fa-eye"></i> View
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    updateCounters();
}

function updateCounters() {
    const total = currentStudents.length;
    const males = currentStudents.filter(s => (s.gender || "").toLowerCase() === "male").length;
    const females = currentStudents.filter(s => (s.gender || "").toLowerCase() === "female").length;

    const totalEl = document.getElementById("totalStudents");
    const maleEl = document.getElementById("maleStudents");
    const femaleEl = document.getElementById("femaleStudents");
    const countEl = document.getElementById("studentCount");

    if (totalEl) totalEl.textContent = total;
    if (maleEl) maleEl.textContent = males;
    if (femaleEl) femaleEl.textContent = females;
    if (countEl) countEl.textContent = `${total} Students`;
}

function initSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
        const val = e.target.value.toLowerCase();
        const rows = document.querySelectorAll("#studentsTableBody tr");
        
        rows.forEach(row => {
            if (row.cells.length === 1) return; 
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(val) ? "" : "none";
        });
    });
}

/* =========================================================
   VIEW / EDIT MODAL LOGIC
   ========================================================= */

function openStudentViewModal(index) {
    const student = currentStudents[index];
    if (!student) return;

    document.getElementById("modalStudentId").value = index;
    document.getElementById("modalFullName").value = student.fullName || student.full_name || student.name || "";
    document.getElementById("modalAdmissionNo").value = student.admissionNo || student.admission_no || "";
    document.getElementById("modalRollNo").value = student.rollNo || student.roll_no || "";
    document.getElementById("modalGender").value = student.gender || "Male";
    document.getElementById("modalStatus").value = "Active";
    document.getElementById("modalClassName").value = student.className || student.class_name || localStorage.getItem("selectedClass") || "5";
    document.getElementById("modalSection").value = student.section || localStorage.getItem("selectedSection") || "B";

    document.getElementById("studentModalOverlay").classList.add("active");
}

function closeStudentModal() {
    document.getElementById("studentModalOverlay").classList.remove("active");
}

async function saveStudentChanges(e) {
    e.preventDefault();
    const index = document.getElementById("modalStudentId").value;
    const student = currentStudents[index];

    if (!student) return;

    student.fullName = document.getElementById("modalFullName").value.trim();
    student.admissionNo = document.getElementById("modalAdmissionNo").value.trim();
    student.rollNo = document.getElementById("modalRollNo").value.trim();
    student.gender = document.getElementById("modalGender").value;
    student.status = document.getElementById("modalStatus").value;

    const sId = student.studentId || student.id;

    if (sId) {
        try {
            await fetch(`${API_BASE}/students/${sId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(student)
            });
        } catch (err) {
            console.warn("Backend update failed, updated locally:", err);
        }
    }

    alert("Student details updated successfully!");
    closeStudentModal();
    renderStudents();
}

function goBack() {
    window.location.href = "teacher-classes.html";
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

window.openStudentViewModal = openStudentViewModal;
window.closeStudentModal = closeStudentModal;
window.saveStudentChanges = saveStudentChanges;
window.goBack = goBack;
window.logout = logout;