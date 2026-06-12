const API_URL = "http://localhost:8080/api/teachers";

let teachers = [];
let editTeacherId = null;


const teacherTableBody = document.getElementById("teacherTableBody");
const teacherForm = document.getElementById("teacherForm");
const teacherModal = document.getElementById("teacherModal");

const openTeacherModal = document.getElementById("openTeacherModal");
const closeTeacherModal = document.getElementById("closeTeacherModal");
const cancelTeacherBtn = document.getElementById("cancelTeacherBtn");

const departmentFilter = document.getElementById("departmentFilter");
const subjectFilter = document.getElementById("subjectFilter");
const searchInput = document.getElementById("searchInput");

function displayDate() {
  const todayDate = document.getElementById("todayDate");

  const today = new Date();
  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: "long"
  };

  todayDate.textContent = today.toLocaleDateString("en-IN", options);
}
async function loadTeachers() {
    const response = await fetch(API_URL);
    teachers = await response.json();
    renderTeachers();
}

function renderTeachers() {
  teacherTableBody.innerHTML = "";

  const searchText = searchInput.value.toLowerCase();
  const selectedDepartment = departmentFilter.value;
  const selectedSubject = subjectFilter.value;

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch =
      teacher.fullName.toLowerCase().includes(searchText) ||
      teacher.teacherId.toString().includes(searchText) ||
      teacher.subject.toLowerCase().includes(searchText);

    const matchesDepartment =
      selectedDepartment === "" || teacher.department === selectedDepartment;

    const matchesSubject =
      selectedSubject === "" || teacher.subject === selectedSubject;

    return matchesSearch && matchesDepartment && matchesSubject;
  });

  filteredTeachers.forEach((teacher, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>
        <img src="${teacher.photo}" alt="Teacher Photo">
      </td>
      <td>${teacher.fullName}</td>
      <td>${teacher.teacherId}</td>
      <td>${teacher.department}</td>
      <td>${teacher.subject}</td>
      <td>${teacher.qualification}</td>
      <td>
        <button class="action-btn edit-action" onclick="editTeacher(${teacher.teacherId})">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="action-btn delete-action" onclick="deleteTeacher(${teacher.teacherId})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;

    teacherTableBody.appendChild(row);
  });

  updateCards();
}

function updateCards() {
  document.getElementById("totalTeachers").textContent = teachers.length;

  document.getElementById("maleTeachers").textContent =
    teachers.filter(teacher => teacher.gender === "Male").length;

  document.getElementById("femaleTeachers").textContent =
    teachers.filter(teacher => teacher.gender === "Female").length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const newTeachers = teachers.filter(teacher => {
    const joining = new Date(teacher.joiningDate);
    return (
      joining.getMonth() === currentMonth &&
      joining.getFullYear() === currentYear
    );
  });

  document.getElementById("newTeachers").textContent = newTeachers.length;
}

function openModal() {
  teacherModal.style.display = "block";
}

function closeModal() {
  teacherModal.style.display = "none";
  teacherForm.reset();
  editTeacherId = null;

  document.querySelector(".modal-header h2").textContent = "Add New Teacher";
  document.querySelector(".submit-btn").textContent = "Save Teacher";
}

openTeacherModal.addEventListener("click", () => {
  openModal();
});

closeTeacherModal.addEventListener("click", () => {
  closeModal();
});

cancelTeacherBtn.addEventListener("click", () => {
  closeModal();
});

window.addEventListener("click", event => {
  if (event.target === teacherModal) {
    closeModal();
  }
});

teacherForm.addEventListener("submit", async function(event)
 { alert("Submit clicked");
  event.preventDefault();

  const teacherData = {
    fullName: document.getElementById("teacherName").value.trim(),
    gender: document.getElementById("gender").value,
    department: document.getElementById("department").value,
    subject: document.getElementById("subject").value.trim(),
    qualification: document.getElementById("qualification").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    joiningDate: document.getElementById("joiningDate").value,
    status: document.getElementById("status").value,
    address: document.getElementById("address").value.trim(),
    photo: "https://randomuser.me/api/portraits/lego/1.jpg"
  };

  const method = editTeacherId === null ? "POST" : "PUT";

  const url =
    editTeacherId === null
      ? API_URL
      : `${API_URL}/${editTeacherId}`;

  const response = await fetch(url, {
  method: method,
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(teacherData)
});

console.log("Response status:", response.status);

if (!response.ok) {
  throw new Error("Failed to save teacher");
}

alert("Teacher saved successfully");
closeModal();
loadTeachers();
});

function editTeacher(id) {
  const teacher = teachers.find(
    teacher => teacher.teacherId === id
  );

  if (!teacher) return;

  editTeacherId = id;

  document.getElementById("teacherName").value = teacher.fullName;
  document.getElementById("gender").value = teacher.gender || "";
  document.getElementById("department").value = teacher.department || "";
  document.getElementById("subject").value = teacher.subject || "";
  document.getElementById("qualification").value = teacher.qualification || "";
  document.getElementById("email").value = teacher.email || "";
  document.getElementById("phone").value = teacher.phone || "";
  document.getElementById("joiningDate").value = teacher.joiningDate || "";
  document.getElementById("status").value = teacher.status || "";
  document.getElementById("address").value = teacher.address || "";

  document.querySelector(".modal-header h2").textContent =
    "Edit Teacher";

  document.querySelector(".submit-btn").textContent =
    "Update Teacher";

  openModal();
}

async function deleteTeacher(id) {

  if (!confirm("Are you sure you want to delete this teacher?")) {
    return;
  }

  await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });

  loadTeachers();
}

departmentFilter.addEventListener("change", renderTeachers);
subjectFilter.addEventListener("change", renderTeachers);
searchInput.addEventListener("input", renderTeachers);

displayDate();
loadTeachers();