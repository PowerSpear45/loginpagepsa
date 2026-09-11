/**
 * Admin Marks Report Controller
 * Power Public School ERP
 */

const API_BASE = "https://loginpagepsabackend.onrender.com/api";

const tableBody = document.getElementById("marksTableBody");
const averagePercentageEl = document.getElementById("averagePercentage");
const highestMarksEl = document.getElementById("highestMarks");
const lowestMarksEl = document.getElementById("lowestMarks");
const rowCountBadge = document.getElementById("rowCountBadge");

const classFilter = document.getElementById("classFilter");
const sectionFilter = document.getElementById("sectionFilter");
const examFilter = document.getElementById("examFilter");
const searchInput = document.getElementById("searchInput");

let marksData = [];
let allStudentsMap = new Map();

document.addEventListener("DOMContentLoaded", async () => {
  updateDateTime();
  await loadStudentsMap();
  await loadMarksReport();

  classFilter.addEventListener("change", renderTable);
  sectionFilter.addEventListener("change", renderTable);
  examFilter.addEventListener("change", renderTable);
  searchInput.addEventListener("input", renderTable);

  document.getElementById("topPerformers")?.addEventListener("click", showTopPerformers);
  document.getElementById("exportExcel")?.addEventListener("click", () => {
    alert("Exporting Marks Summary report...");
  });
});

function updateDateTime() {
  const now = new Date();
  const todayDateEl = document.getElementById("todayDate");
  const todayDayEl = document.getElementById("todayDay");

  if (todayDateEl) {
    todayDateEl.textContent = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }
  if (todayDayEl) {
    todayDayEl.textContent = now.toLocaleDateString("en-IN", { weekday: "long" });
  }
}

async function loadStudentsMap() {
  try {
    const res = await fetch(`${API_BASE}/students`);
    if (res.ok) {
      const students = await res.json();
      students.forEach(s => {
        const id = Number(s.studentId ?? s.student_id ?? s.id);
        allStudentsMap.set(id, s);
      });
    }
  } catch (err) {
    console.warn("Could not prefetch students map:", err);
  }
}

async function loadMarksReport() {
  tableBody.innerHTML = `
    <tr>
      <td colspan="11" class="loading-cell">
        <i class="fa-solid fa-spinner fa-spin"></i> Fetching examination marks from database...
      </td>
    </tr>
  `;

  let rawTeacherMarks = [];
  let rawAdminMarks = [];

  // 1. Fetch from Teacher marks endpoint (/api/teacher/marks -> 'marks' table)
  try {
    const resTeacher = await fetch(`${API_BASE}/teacher/marks`);
    if (resTeacher.ok) {
      const data = await resTeacher.json();
      if (Array.isArray(data)) rawTeacherMarks = data;
    }
  } catch (e) {
    console.warn("/api/teacher/marks fetch failed:", e);
  }

  // 2. Fetch from Admin marks endpoint (/api/marks -> 'student_marks' table)
  try {
    const resAdmin = await fetch(`${API_BASE}/marks`);
    if (resAdmin.ok) {
      const data = await resAdmin.json();
      if (Array.isArray(data)) rawAdminMarks = data;
    }
  } catch (e) {
    console.warn("/api/marks fetch failed:", e);
  }

  // If Admin table has aggregate rows, parse them
  if (rawAdminMarks.length > 0) {
    marksData = rawAdminMarks.map((item, idx) => parseAdminMarkRecord(item, idx));
  } 
  // Otherwise aggregate row-by-row records from the 'marks' table
  else if (rawTeacherMarks.length > 0) {
    marksData = aggregateTeacherMarks(rawTeacherMarks);
  } 
  else {
    marksData = [];
  }

  if (marksData.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="11" class="empty-cell">No examination records found in database.</td>
      </tr>
    `;
    updateKpis([]);
    return;
  }

  populateFilters();
  renderTable();
}

function parseAdminMarkRecord(item, idx) {
  const studentObj = item.student || {};
  const sId = Number(item.studentId ?? item.student_id ?? studentObj.studentId ?? studentObj.student_id ?? idx + 1);
  const studentInfo = allStudentsMap.get(sId) || {};

  const roll = item.rollNo || item.roll_no || studentInfo.rollNo || studentInfo.roll_no || "-";
  const name = item.fullName || item.full_name || studentInfo.fullName || studentInfo.full_name || "Student";
  const cl = item.className || item.class_name || studentInfo.className || studentInfo.class_name || "5";
  const sec = item.section || studentInfo.section || "B";
  const exam = item.examName || item.exam_name || item.examType || item.exam_type || "Quarterly Exam";
  const photo = item.studentPhoto || studentInfo.studentPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1f3f6d&color=ffffff`;

  const tamil = Number(item.tamil || 0);
  const english = Number(item.english || 0);
  const maths = Number(item.maths || 0);
  const science = Number(item.science || 0);
  const social = Number(item.social || 0);
  const computer = Number(item.computer || 0);

  const total = Number(item.total || (tamil + english + maths + science + social + computer));
  const maxMarks = computer > 0 ? 600 : 500;
  const pct = item.percentage ? Number(item.percentage) : Math.round((total / maxMarks) * 100);
  const grade = item.grade || calculateGrade(pct);

  return {
    studentId: sId,
    rollNo: roll,
    studentPhoto: photo,
    fullName: name,
    className: String(cl),
    section: String(sec),
    examName: exam,
    subjects: [
      { name: "Tamil", score: tamil, max: 100 },
      { name: "English", score: english, max: 100 },
      { name: "Mathematics", score: maths, max: 100 },
      { name: "Science", score: science, max: 100 },
      { name: "Social", score: social, max: 100 }
    ],
    total,
    maxMarks,
    percentage: pct,
    grade
  };
}

function aggregateTeacherMarks(teacherMarks) {
  // Group by studentId + examType
  const groups = new Map();

  teacherMarks.forEach(m => {
    const sId = Number(m.studentId ?? m.student_id);
    const exam = m.examType || m.exam_type || "Quarterly Exam";
    const key = `${sId}_${exam}`;

    if (!groups.has(key)) {
      groups.set(key, {
        studentId: sId,
        examName: exam,
        subjects: [],
        total: 0,
        maxMarks: 0
      });
    }

    const group = groups.get(key);
    const obt = Number(m.marksObtained ?? m.marks_obtained ?? 0);
    const max = Number(m.maxMarks ?? m.max_marks ?? 100);

    group.subjects.push({
      name: m.subject || "Subject",
      score: obt,
      max: max
    });
    group.total += obt;
    group.maxMarks += max;
  });

  return Array.from(groups.values()).map(g => {
    const studentInfo = allStudentsMap.get(g.studentId) || {};
    const name = studentInfo.fullName || studentInfo.full_name || "V.S.Sakthivel";
    const roll = studentInfo.rollNo || studentInfo.roll_no || "20265001";
    const cl = studentInfo.className || studentInfo.class_name || "5";
    const sec = studentInfo.section || "B";
    const photo = studentInfo.studentPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1f3f6d&color=ffffff`;

    const pct = g.maxMarks > 0 ? Math.round((g.total / g.maxMarks) * 100) : 0;
    const grade = calculateGrade(pct);

    return {
      studentId: g.studentId,
      rollNo: roll,
      studentPhoto: photo,
      fullName: name,
      className: String(cl),
      section: String(sec),
      examName: g.examName,
      subjects: g.subjects,
      total: g.total,
      maxMarks: g.maxMarks,
      percentage: pct,
      grade: grade
    };
  });
}

function populateFilters() {
  const classes = [...new Set(marksData.map(m => m.className).filter(Boolean))].sort();
  const sections = [...new Set(marksData.map(m => m.section).filter(Boolean))].sort();
  const exams = [...new Set(marksData.map(m => m.examName).filter(Boolean))].sort();

  classFilter.innerHTML = `<option value="">All Classes</option>`;
  classes.forEach(c => {
    classFilter.innerHTML += `<option value="${c}">Class ${c}</option>`;
  });

  sectionFilter.innerHTML = `<option value="">All Sections</option>`;
  sections.forEach(s => {
    sectionFilter.innerHTML += `<option value="${s}">Section ${s}</option>`;
  });

  examFilter.innerHTML = `<option value="">All Exams</option>`;
  exams.forEach(e => {
    examFilter.innerHTML += `<option value="${e}">${e}</option>`;
  });
}

function renderTable() {
  tableBody.innerHTML = "";

  const query = searchInput.value.trim().toLowerCase();
  const filtered = marksData.filter(student => {
    const matchClass = !classFilter.value || student.className === classFilter.value;
    const matchSection = !sectionFilter.value || student.section === sectionFilter.value;
    const matchExam = !examFilter.value || student.examName === examFilter.value;
    const matchSearch =
      student.fullName.toLowerCase().includes(query) ||
      String(student.rollNo).toLowerCase().includes(query);

    return matchClass && matchSection && matchExam && matchSearch;
  });

  rowCountBadge.textContent = `${filtered.length} Records`;

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="11" class="empty-cell">No student marks matching selected criteria.</td>
      </tr>
    `;
    updateKpis([]);
    return;
  }

  updateKpis(filtered);

  filtered.forEach((st, idx) => {
    const isPass = st.percentage >= 35;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="text-align: center;"><strong>${idx + 1}</strong></td>
      <td><strong>${st.rollNo}</strong></td>
      <td><img src="${st.studentPhoto}" class="student-photo" alt="Photo"></td>
      <td><strong>${st.fullName}</strong></td>
      <td>Class ${st.className} - ${st.section}</td>
      <td><span style="font-size: 12px; color: #64748b;">${st.examName}</span></td>
      <td style="text-align: center;"><strong>${st.total} / ${st.maxMarks}</strong></td>
      <td style="text-align: center;">${st.percentage}%</td>
      <td style="text-align: center;"><span class="grade-tag">${st.grade}</span></td>
      <td style="text-align: center;">
        <span class="${isPass ? 'pass-tag' : 'fail-tag'}">${isPass ? 'PASS' : 'FAIL'}</span>
      </td>
      <td style="text-align: center;">
        <button type="button" class="view-btn" onclick="openScorecardModal(${st.studentId}, '${st.examName}')">
          <i class="fa-solid fa-eye"></i> View
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function updateKpis(filtered) {
  if (!filtered || filtered.length === 0) {
    averagePercentageEl.textContent = "0%";
    highestMarksEl.textContent = "0";
    lowestMarksEl.textContent = "0";
    return;
  }

  let totalPctSum = 0;
  let highest = 0;
  let lowest = Infinity;

  filtered.forEach(st => {
    totalPctSum += st.percentage;
    if (st.total > highest) highest = st.total;
    if (st.total < lowest) lowest = st.total;
  });

  averagePercentageEl.textContent = `${(totalPctSum / filtered.length).toFixed(1)}%`;
  highestMarksEl.textContent = highest;
  lowestMarksEl.textContent = lowest === Infinity ? 0 : lowest;
}

function openScorecardModal(studentId, examName) {
  const st = marksData.find(m => String(m.studentId) === String(studentId) && m.examName === examName);
  if (!st) return;

  document.getElementById("modalStudentName").textContent = st.fullName;
  document.getElementById("modalStudentMeta").textContent = `Class ${st.className} - ${st.section} | Roll: ${st.rollNo} | ${st.examName}`;

  const tbody = document.getElementById("modalSubjectsBody");
  tbody.innerHTML = "";

  st.subjects.forEach(sub => {
    tbody.innerHTML += `
      <tr>
        <td><strong>${sub.name}</strong></td>
        <td style="text-align: center;">${sub.max}</td>
        <td style="text-align: center; font-weight: bold; color: ${sub.score >= 35 ? '#15803d' : '#b91c1c'};">${sub.score}</td>
      </tr>
    `;
  });

  document.getElementById("modalTotalScore").textContent = `${st.total} / ${st.maxMarks}`;
  document.getElementById("modalPercentage").textContent = `${st.percentage}%`;
  document.getElementById("modalGrade").textContent = st.grade;

  document.getElementById("scorecardModal").classList.add("active");
}

function closeScorecardModal() {
  document.getElementById("scorecardModal").classList.remove("active");
}

function showTopPerformers() {
  if (marksData.length === 0) {
    alert("No records available to rank.");
    return;
  }

  const sorted = [...marksData].sort((a, b) => b.total - a.total).slice(0, 5);
  let msg = "🏆 TOP PERFORMERS\n\n";
  sorted.forEach((s, idx) => {
    msg += `${idx + 1}. ${s.fullName} (${s.className}-${s.section}) - ${s.total}/${s.maxMarks} (${s.percentage}% - Grade ${s.grade})\n`;
  });
  alert(msg);
}

function calculateGrade(percentage) {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 35) return "D";
  return "F";
}

window.openScorecardModal = openScorecardModal;
window.closeScorecardModal = closeScorecardModal;