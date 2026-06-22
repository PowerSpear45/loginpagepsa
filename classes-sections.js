let selectedIndex = null;
let classesData = [
  { className: "5", section: "A", strength: 96, classTeacher: "Mrs. Priya Sharma" },
  { className: "5", section: "B", strength: 100, classTeacher: "Mr. Arvind Kumar" },
  { className: "5", section: "C", strength: 89, classTeacher: "Ms. Kavitha F" },
  { className: "4", section: "A", strength: 79, classTeacher: "Ms. Sangeetha H" },
  { className: "4", section: "B", strength: 85, classTeacher: "Mr. Suresh Kumar" },
  { className: "6", section: "A", strength: 94, classTeacher: "Mr. Rohit Kumar" },
  { className: "6", section: "B", strength: 87, classTeacher: "Mr. Venkatesh J" }
];

const tableBody = document.getElementById("classesTableBody");
const searchInput = document.getElementById("searchInput");

function loadClasses(data) {
  tableBody.innerHTML = "";

  data.forEach((item, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.className}</td>
      <td>${item.section}</td>
      <td>${item.strength}</td>
      <td>${item.classTeacher}</td>
      <td>
        <button class="view-details-btn" onclick="viewDetails(${index})">
          View Details
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  updateCards(data);
}

function updateCards(data) {
  const uniqueClasses = new Set(data.map(item => item.className));
  const totalSections = data.length;
  const totalStudents = data.reduce((sum, item) => sum + item.strength, 0);

  document.getElementById("totalClasses").textContent = uniqueClasses.size;
  document.getElementById("totalSections").textContent = totalSections;
  document.getElementById("totalStudents").textContent = totalStudents;
}

searchInput.addEventListener("input", function () {
  const searchValue = searchInput.value.toLowerCase();

  const filteredData = classesData.filter(item =>
    item.className.toLowerCase().includes(searchValue) ||
    item.section.toLowerCase().includes(searchValue) ||
    item.classTeacher.toLowerCase().includes(searchValue)
  );

  loadClasses(filteredData);
});

function viewDetails(index) {
  selectedIndex = index;

  const item = classesData[index];

  document.getElementById("classNameInput").value = item.className;
  document.getElementById("sectionInput").value = item.section;
  document.getElementById("strengthInput").value = item.strength;
  document.getElementById("teacherInput").value = item.classTeacher;

  classModal.style.display = "flex";
}

loadClasses(classesData);
const classModal = document.getElementById("classModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const saveClassBtn = document.getElementById("saveClassBtn");
const deleteClassBtn = document.getElementById("deleteClassBtn");
deleteClassBtn.addEventListener("click", function () {
  if (selectedIndex === null) {
    alert("Please select a class first");
    return;
  }

  const confirmDelete = confirm("Are you sure you want to delete this class/section?");

  if (confirmDelete) {
    classesData.splice(selectedIndex, 1);
    loadClasses(classesData);
    clearForm();
    classModal.style.display = "none";
  }
});

document.getElementById("addClassBtn").addEventListener("click", function () {
  clearForm();
  classModal.style.display = "flex";
});

document.getElementById("addSectionBtn").addEventListener("click", function () {
  clearForm();
  classModal.style.display = "flex";
});

closeModalBtn.addEventListener("click", function () {
  clearForm();
  classModal.style.display = "none";
});
saveClassBtn.addEventListener("click", function () {
  const className = document.getElementById("classNameInput").value.trim();
  const section = document.getElementById("sectionInput").value.trim();
  const strength = Number(document.getElementById("strengthInput").value);
  const classTeacher = document.getElementById("teacherInput").value.trim();

  if (className === "" || section === "" || strength === 0 || classTeacher === "") {
    alert("Please fill all fields");
    return;
  }

  const updatedData = {
    className,
    section,
    strength,
    classTeacher
  };

  if (selectedIndex === null) {
    classesData.push(updatedData);
  } else {
    classesData[selectedIndex] = updatedData;
  }

  loadClasses(classesData);
  clearForm();

  document.getElementById("classModal").style.display = "none";
});
function clearForm() {
  document.getElementById("classNameInput").value = "";
  document.getElementById("sectionInput").value = "";
  document.getElementById("strengthInput").value = "";
  document.getElementById("teacherInput").value = "";
  selectedIndex = null;
}