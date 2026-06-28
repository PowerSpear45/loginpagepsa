let selectedIndex = null;
let classesData = [];

const API_URL = "https://loginpagepsabackend.onrender.com/api/class-sections";

const tableBody = document.getElementById("classesTableBody");
const searchInput = document.getElementById("searchInput");

const classModal = document.getElementById("classModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const saveClassBtn = document.getElementById("saveClassBtn");
const deleteClassBtn = document.getElementById("deleteClassBtn");

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
  const totalStudents = data.reduce((sum, item) => sum + Number(item.strength || 0), 0);

  document.getElementById("totalClasses").textContent = uniqueClasses.size;
  document.getElementById("totalSections").textContent = totalSections;
  document.getElementById("totalStudents").textContent = totalStudents;
}

async function fetchClasses() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch class sections");
    }

    classesData = await response.json();
    loadClasses(classesData);

  } catch (error) {
    console.error("Error loading classes:", error);
    alert("Failed to load classes");
  }
}

searchInput.addEventListener("input", function () {
  const searchValue = searchInput.value.toLowerCase();

  const filteredData = classesData.filter(item =>
    String(item.className).toLowerCase().includes(searchValue) ||
    String(item.section).toLowerCase().includes(searchValue) ||
    String(item.classTeacher).toLowerCase().includes(searchValue)
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

  saveClassBtn.textContent = "Save";
  deleteClassBtn.style.display = "inline-block";

  classModal.style.display = "flex";
}

document.getElementById("addClassBtn").addEventListener("click", function () {
  clearForm();
  saveClassBtn.textContent = "Add";
  deleteClassBtn.style.display = "none";
  classModal.style.display = "flex";
});

document.getElementById("addSectionBtn").addEventListener("click", function () {
  clearForm();
  saveClassBtn.textContent = "Add";
  deleteClassBtn.style.display = "none";
  classModal.style.display = "flex";
});

closeModalBtn.addEventListener("click", function () {
  clearForm();
  classModal.style.display = "none";
});

saveClassBtn.addEventListener("click", async function () {
  const className = document.getElementById("classNameInput").value.trim();
  const section = document.getElementById("sectionInput").value.trim();
  const strength = Number(document.getElementById("strengthInput").value);
  const classTeacher = document.getElementById("teacherInput").value.trim();

  if (className === "" || section === "" || strength === 0 || classTeacher === "") {
    alert("Please fill all fields");
    return;
  }

  const classSection = {
    className,
    section,
    strength,
    classTeacher
  };

  try {
    let response;

    if (selectedIndex === null) {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(classSection)
      });
    } else {
      const id = classesData[selectedIndex].id;

      response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(classSection)
      });
    }

    if (!response.ok) {
      throw new Error("Save failed");
    }

    await fetchClasses();
    clearForm();
    classModal.style.display = "none";

    alert("Saved successfully");

  } catch (error) {
    console.error("Error saving class section:", error);
    alert("Failed to save");
  }
});

deleteClassBtn.addEventListener("click", async function () {
  if (selectedIndex === null) {
    alert("Please select a class first");
    return;
  }

  const confirmDelete = confirm("Are you sure you want to delete this class/section?");

  if (!confirmDelete) {
    return;
  }

  try {
    const id = classesData[selectedIndex].id;

    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Delete failed");
    }

    await fetchClasses();
    clearForm();
    classModal.style.display = "none";

    alert("Deleted successfully");

  } catch (error) {
    console.error("Error deleting class section:", error);
    alert("Failed to delete");
  }
});

function clearForm() {
  document.getElementById("classNameInput").value = "";
  document.getElementById("sectionInput").value = "";
  document.getElementById("strengthInput").value = "";
  document.getElementById("teacherInput").value = "";
  selectedIndex = null;
}

fetchClasses();