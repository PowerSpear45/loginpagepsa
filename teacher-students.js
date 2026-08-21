const API_BASE = "https://loginpagepsabackend.onrender.com/api";
let currentStudents = [];

document.addEventListener("DOMContentLoaded", () => {
    // Retrieve the class and section selected from the "My Classes" page
    // Defaults to 5-A if navigated directly
    const className = localStorage.getItem("selectedClass") || "5";
    const section = localStorage.getItem("selectedSection") || "A";

    // Update UI Headers
    const classTitle = document.getElementById("classTitle");
    const classDesc = document.getElementById("classDescription");
    if (classTitle) classTitle.textContent = `Class ${className} - Section ${section}`;
    if (classDesc) classDesc.textContent = `Viewing student roster for Class ${className}, Section ${section}`;

    loadStudents(className, section);
    initSearch();
});

async function loadStudents(className, section) {
    const tableBody = document.getElementById("studentsTableBody");
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color:#6b7280;">Loading students from server...</td></tr>`;

    try {
        const response = await fetch(`${API_BASE}/students`);
        if (response.ok) {
            const allStudents = await response.json();
            // Filter only the students for this specific class and section
            currentStudents = allStudents.filter(s => 
                String(s.className || s.class_name) === String(className) && 
                String(s.section) === String(section)
            );
        } else {
            throw new Error("Backend returned an error status.");
        }
    } catch (err) {
        console.warn("Backend offline or failed. Using fallback data to prevent crash:", err);
        // Fallback data if Render is asleep
        currentStudents = [
            { admissionNo: "ADM101", rollNo: "20265001", fullName: "Abinash Kumar", gender: "Male", dateOfBirth: "2012-08-23", status: "Active" },
            { admissionNo: "ADM102", rollNo: "20265002", fullName: "Sanjay P", gender: "Male", dateOfBirth: "2012-05-14", status: "Active" },
            { admissionNo: "ADM103", rollNo: "20265003", fullName: "Dhivya T", gender: "Female", dateOfBirth: "2012-09-24", status: "Active" }
        ].filter(s => className === "5"); // Only show fallback for class 5
    }

    renderStudents();
}

function renderStudents() {
    const tableBody = document.getElementById("studentsTableBody");
    if (!tableBody) return;
    
    tableBody.innerHTML = "";

    if (!currentStudents || currentStudents.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px; color:#6b7280;"><i class="fa-solid fa-folder-open" style="font-size: 24px; display:block; margin-bottom:10px;"></i>No students registered in this section yet.</td></tr>`;
        updateCounters();
        return;
    }

    currentStudents.forEach((student, index) => {
        const tr = document.createElement("tr");
        const statusHTML = student.status === "Active" || !student.status 
            ? `<span style="background:#dcfce7; color:#15803d; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:700;">Active</span>`
            : `<span style="background:#fee2e2; color:#b91c1c; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:700;">Inactive</span>`;

        tr.innerHTML = `
            <td style="text-align:center;">${index + 1}</td>
            <td style="font-weight: 600; color: #111827;">${student.fullName || student.full_name || student.name || '-'}</td>
            <td>${student.admissionNo || student.admission_no || '-'}</td>
            <td>${student.rollNo || student.roll_no || '-'}</td>
            <td>${student.gender || '-'}</td>
            <td>${student.dateOfBirth || student.date_of_birth || '-'}</td>
            <td style="text-align:center;">${statusHTML}</td>
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
            // Skip the "No students found" row
            if (row.cells.length === 1) return; 
            
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(val) ? "" : "none";
        });
    });
}

function goBack() {
    window.location.href = "teacher-classes.html";
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}