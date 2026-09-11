

let selectedIndex = null;
let classesData = [];
let teachersMap = {};

const API_BASE = "https://loginpagepsabackend.onrender.com/api";
const API_URL = `${API_BASE}/class-sections`;
const TEACHERS_API = `${API_BASE}/teachers`;
const STUDENTS_API = `${API_BASE}/students`;

const tableBody = document.getElementById("classesTableBody");
const searchInput = document.getElementById("searchInput");
const classModal = document.getElementById("classModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const saveClassBtn = document.getElementById("saveClassBtn");
const deleteClassBtn = document.getElementById("deleteClassBtn");
const teacherSelect = document.getElementById("teacherSelect");

document.addEventListener("DOMContentLoaded", async () => {
  initDate();
  await fetchTeachersList();
  await fetchClasses();
});

function initDate() {
  const today = new Date();
  const dateOptions = { day: "2-digit", month: "long", year: "numeric" };
  const dateEl = document.getElementById("currentDateVal");
  const dayEl = document.getElementById("currentDayVal");

  if (dateEl) dateEl.innerText = today.toLocaleDateString("en-GB", dateOptions);
  if (dayEl) dayEl.innerText = today.toLocaleDateString("en-GB", { weekday: "long" });
}

async function fetchTeachersList() {
  teachersMap = {
    1: "Abinash Kumar",
    2: "Priya Sharma",
    3: "Anand R.",
    4: "Meena Sundaram",
    5: "Suresh Babu",
    6: "Kavitha M.",
    7: "Dinesh Karthik",
    8: "Lakshmi Narayanan",
    9: "Venkatesh S.",
    10: "Radha Krishnan"
  };

  try {
    const res = await fetch(TEACHERS_API);
    if (res.ok) {
      const teachers = await res.json();
      teacherSelect.innerHTML = `<option value="">-- Select Class Teacher --</option>`;
      teachers.forEach(t => {
        const id = Number(t.teacherId || t.id);
        const name = t.fullName || t.name;
        if (id && name) teachersMap[id] = name;

        const opt = document.createElement("option");
        opt.value = id;
        opt.textContent = teachersMap[id] || name;
        teacherSelect.appendChild(opt);
      });
      return;
    }
  } catch (err) {
    console.warn("Using fallback teachers dictionary:", err);
  }

  // Populate dropdown using fallback list
  teacherSelect.innerHTML = `<option value="">-- Select Class Teacher --</option>`;
  Object.keys(teachersMap).forEach(id => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = teachersMap[id];
    teacherSelect.appendChild(opt);
  });
}

async function fetchClasses() {
  try {
    const [classesRes, studentsRes] = await Promise.all([
      fetch(API_URL),
      fetch(STUDENTS_API).catch(() => null)
    ]);

    if (!classesRes.ok) throw new Error("Failed to load classes");
    const rawClasses = await classesRes.json();

    let allStudents = [];
    if (studentsRes && studentsRes.ok) {
      allStudents = await studentsRes.json();
    }

    // Deduplicate class entries by class_name + section
    const uniqueMap = new Map();
    rawClasses.forEach(c => {
      const key = `${c.className || c.class_name}-${c.section}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, c);
      }
    });
    classesData = Array.from(uniqueMap.values());

    // Calculate real dynamic strength per section if students exist
    if (Array.isArray(allStudents) && allStudents.length > 0) {
      classesData.forEach(item => {
        const count = allStudents.filter(s =>
          String(s.className || s.class_name) === String(item.className) &&
          String(s.section) === String(item.section)
        ).length;
        if (count > 0) item.strength = count;
      });
    }

    loadClasses(classesData, allStudents.length);
  } catch (error) {
    console.error("Error loading classes:", error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding: 25px; color:#ef4444;">
          Failed to load class sections.
        </td>
      </tr>
    `;
  }
}

function loadClasses(data, totalStudentsCount) {
  tableBody.innerHTML = "";

  if (!data || data.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding: 25px; color:#777;">
          No class sections found.
        </td>
      </tr>
    `;
    updateCards([], 0);
    return;
  }

  data.forEach((item, index) => {
    const teacherId = Number(item.classTeacher);
    const teacherName = teachersMap[teacherId] || (teacherId ? `Teacher #${teacherId}` : "Not Assigned");

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>Class ${item.className}</strong></td>
      <td><span class="section-badge">${item.section}</span></td>
      <td><span class="strength-badge">${item.strength || 0}</span></td>
      <td><strong>${teacherName}</strong></td>
      <td style="text-align: center;">
        <button class="view-details-btn" onclick="viewDetails(${index})">
          <i class="fa-solid fa-pen-to-square"></i> View / Edit
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  updateCards(data, totalStudentsCount);
}

function updateCards(data, totalStudentsCount) {
  const uniqueClasses = new Set(data.map(item => String(item.className)));
  const totalSections = data.length;
  
  const totalStudents = totalStudentsCount > 0 
    ? totalStudentsCount 
    : data.reduce((sum, item) => sum + Number(item.strength || 0), 0);

  document.getElementById("totalClasses").textContent = uniqueClasses.size;
  document.getElementById("totalSections").textContent = totalSections;
  document.getElementById("totalStudents").textContent = totalStudents;
}

searchInput.addEventListener("input", function () {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = classesData.filter(item => {
    const tName = (teachersMap[Number(item.classTeacher)] || "").toLowerCase();
    const cName = String(item.className || "").toLowerCase();
    const sec = String(item.section || "").toLowerCase();
    return cName.includes(query) || sec.includes(query) || tName.includes(query);
  });
  loadClasses(filtered, 0);
});

function viewDetails(index) {
  selectedIndex = index;
  const item = classesData[index];

  document.getElementById("modalTitle").textContent = "Edit Class & Section";
  document.getElementById("classNameInput").value = item.className || "";
  document.getElementById("sectionInput").value = item.section || "";
  document.getElementById("strengthInput").value = item.strength || "";
  teacherSelect.value = item.classTeacher || "";

  saveClassBtn.textContent = "Save Changes";
  deleteClassBtn.style.display = "inline-block";
  classModal.style.display = "flex";
}

document.getElementById("addClassBtn").addEventListener("click", function () {
  clearForm();
  document.getElementById("modalTitle").textContent = "Add New Class & Section";
  saveClassBtn.textContent = "Add Class";
  deleteClassBtn.style.display = "none";
  classModal.style.display = "flex";
});

function closeClassModal() {
  clearForm();
  classModal.style.display = "none";
}

closeModalBtn.addEventListener("click", closeClassModal);

saveClassBtn.addEventListener("click", async function () {
  const className = document.getElementById("classNameInput").value.trim();
  const section = document.getElementById("sectionInput").value.trim();
  const strength = Number(document.getElementById("strengthInput").value);
  const teacherId = teacherSelect.value;

  if (!className || !section || isNaN(strength) || !teacherId) {
    alert("Please fill all fields and select a teacher.");
    return;
  }

  const payload = {
    className: className,
    section: section,
    strength: strength,
    classTeacher: parseInt(teacherId, 10)
  };

  try {
    let response;
    if (selectedIndex === null) {
      response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } else {
      const id = classesData[selectedIndex].id;
      response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) throw new Error("Save failed");
    await fetchClasses();
    closeClassModal();
  } catch (err) {
    console.error("Save error:", err);
    alert("Failed to save changes.");
  }
});

function clearForm() {
  document.getElementById("classNameInput").value = "";
  document.getElementById("sectionInput").value = "";
  document.getElementById("strengthInput").value = "";
  teacherSelect.value = "";
  selectedIndex = null;
}

window.viewDetails = viewDetails;
window.closeClassModal = closeClassModal;