const addBtn = document.querySelector(".add-btn");
const modal = document.getElementById("studentModal");
const closeBtn = document.querySelector(".close-btn");
const tableBody = document.getElementById("studentTableBody");
const studentForm = document.querySelector(".student-form");

const searchInput = document.getElementById("searchInput");
const classFilter = document.getElementById("classFilter");
const sectionFilter = document.getElementById("sectionFilter");
const genderFilter = document.getElementById("genderFilter");

let editingStudentId = null;
let allStudents = [];

addBtn.onclick = function () {
    editingStudentId = null;
    studentForm.reset();
    modal.style.display = "block";
};

closeBtn.onclick = function () {
    modal.style.display = "none";
};

async function loadStudents() {
    try {
        const response = await fetch("http://localhost:8080/api/students");
        const students = await response.json();

        allStudents = students;

        updateDashboardCards(allStudents);
        applyFilters();

    } catch (error) {
        console.error("Error loading students:", error);
    }
}

function displayStudents(students) {
    tableBody.innerHTML = "";

    students.forEach((student, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <img src="https://i.pravatar.cc/40?img=${index + 1}" class="student-photo">
                </td>
                <td>${student.fullName || "-"}</td>
                <td>${student.admissionNo || "-"}</td>
                <td>${student.className || "-"}-${student.section || "-"}</td>
                <td>${student.rollNo || "-"}</td>
                <td class="${student.gender === "Female" ? "female" : "male"}">
                    ${student.gender || "-"}
                </td>
                <td>${student.dateOfBirth || "-"}</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" onclick="editStudent(${student.studentId})">Edit</button>
                        <button class="delete-btn" onclick="deleteStudent(${student.studentId})">Delete</button>
                    </div>
                </td>
            </tr>
        `;

        tableBody.insertAdjacentHTML("beforeend", row);
    });
}

function applyFilters() {
    const keyword = searchInput.value.toLowerCase();
    const selectedClass = classFilter.value;
    const selectedSection = sectionFilter.value;
    const selectedGender = genderFilter.value;

    const filteredStudents = allStudents.filter(student => {
        const matchesSearch =
            (student.fullName || "").toLowerCase().includes(keyword) ||
            (student.admissionNo || "").toLowerCase().includes(keyword) ||
            (student.rollNo || "").toLowerCase().includes(keyword);

        const matchesClass =
            selectedClass === "All Classes" || student.className === selectedClass;

        const matchesSection =
            selectedSection === "All Sections" || student.section === selectedSection;

        const matchesGender =
            selectedGender === "All Genders" || student.gender === selectedGender;

        return matchesSearch && matchesClass && matchesSection && matchesGender;
    });

    displayStudents(filteredStudents);
}

function updateDashboardCards(students) {
    const total = students.length;
    const boys = students.filter(student => student.gender === "Male").length;
    const girls = students.filter(student => student.gender === "Female").length;
    const newAdmissions = students.slice(-5).length;

    document.getElementById("totalStudents").textContent = total;
    document.getElementById("boysCount").textContent = boys;
    document.getElementById("girlsCount").textContent = girls;
    document.getElementById("newAdmissionsCount").textContent = newAdmissions;
}

function editStudent(id) {
    const student = allStudents.find(s => s.studentId === id);

    if (!student) return;

    editingStudentId = id;

    document.getElementById("fullName").value = student.fullName || "";
    document.getElementById("admissionNo").value = student.admissionNo || "";
    document.getElementById("rollNo").value = student.rollNo || "";
    document.getElementById("dateOfBirth").value = student.dateOfBirth || "";
    document.getElementById("gender").value = student.gender || "";
    document.getElementById("className").value = student.className || "";
    document.getElementById("section").value = student.section || "";

    modal.style.display = "block";
}

studentForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const studentData = {
        fullName: document.getElementById("fullName").value,
        admissionNo: document.getElementById("admissionNo").value,
        rollNo: document.getElementById("rollNo").value,
        dateOfBirth: document.getElementById("dateOfBirth").value,
        gender: document.getElementById("gender").value,
        className: document.getElementById("className").value,
        section: document.getElementById("section").value,
        status: "ACTIVE"
    };

    const url = editingStudentId
        ? `http://localhost:8080/api/students/${editingStudentId}`
        : "http://localhost:8080/api/students";

    const method = editingStudentId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
        });

        if (response.ok) {
            alert(editingStudentId ? "Student Updated Successfully" : "Student Added Successfully");

            modal.style.display = "none";
            studentForm.reset();
            editingStudentId = null;

            loadStudents();
        } else {
            alert("Failed to save student");
        }

    } catch (error) {
        console.error("Error saving student:", error);
        alert("Error saving student");
    }
});

async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
        const response = await fetch(`http://localhost:8080/api/students/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Student Deleted Successfully");
            loadStudents();
        } else {
            alert("Failed to delete student");
        }

    } catch (error) {
        console.error("Error deleting student:", error);
        alert("Error deleting student");
    }
}

searchInput.addEventListener("input", applyFilters);
classFilter.addEventListener("change", applyFilters);
sectionFilter.addEventListener("change", applyFilters);
genderFilter.addEventListener("change", applyFilters);

loadStudents();