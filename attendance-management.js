const API_BASE = "https://loginpagepsabackend.onrender.com/api";
const attendanceTableBody = document.getElementById("attendanceTableBody");

const classFilter = document.getElementById("classFilter");
const sectionFilter = document.getElementById("sectionFilter");
const rollSearch = document.getElementById("rollSearch");
const attendanceDate = document.getElementById("attendanceDate");

const totalStudentsEl = document.getElementById("totalStudents");
const totalPresentEl = document.getElementById("totalPresent");
const totalAbsentEl = document.getElementById("totalAbsent");
const lateComersEl = document.getElementById("lateComers");
const overallAttendanceEl = document.getElementById("overallAttendance");

let attendanceChart;
let monthlyChart;
let studentsData = [];

document.addEventListener("DOMContentLoaded", async () => {
  setDefaultDate();
  updateDateTime();
  setInterval(updateDateTime, 1000);

  await loadStudents();
  await loadTodayAttendance();
});

function setDefaultDate() {
  const today = new Date().toISOString().split("T")[0];
  if (attendanceDate) {
    attendanceDate.value = today;
  }
}

async function loadStudents() {
  try {
    const response = await fetch(`${API_BASE}/students`);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const rawData = await response.json();

    studentsData = rawData.map(student => {
      const sId = student.studentId ?? student.student_id ?? student.id;
      const sName = student.fullName || student.full_name || student.studentName || "Student";
      const photo = student.studentPhoto || student.student_photo || student.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(sName)}&background=1f3f6d&color=ffffff`;

      return {
        studentId: Number(sId),
        rollNo: String(student.rollNo || student.roll_no || ""),
        studentName: sName,
        className: String(student.className || student.class_name || ""),
        section: String(student.section || ""),
        photo: photo,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        todayStatus: "Present"
      };
    });

    loadAttendanceTable();
  } catch (error) {
    console.error("LOAD STUDENTS ERROR:", error);
    attendanceTableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center; padding: 25px; color: #dc2626;">
          Failed to load students. Please verify backend connectivity.
        </td>
      </tr>
    `;
  }
}

async function loadTodayAttendance() {
  const selectedDate = attendanceDate.value;
  if (!selectedDate) return;

  try {
    const response = await fetch(`${API_BASE}/attendance?date=${selectedDate}`);
    if (response.ok) {
      const attendance = await response.json();
      attendance.forEach(record => {
        const recordStudentId = Number(record.studentId || record.student_id);
        const student = studentsData.find(s => s.studentId === recordStudentId);

        if (student && record.status) {
          const rawStatus = record.status.trim().toLowerCase();
          student.todayStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
        }
      });
    }
  } catch (error) {
    console.warn("Could not fetch today's attendance:", error);
  }

  loadAttendanceTable();
}

function loadAttendanceTable() {
  const filteredData = getFilteredData();
  attendanceTableBody.innerHTML = "";

  if (filteredData.length === 0) {
    attendanceTableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center; padding: 25px; color: #64748b;">
          No students found matching the selected class and section.
        </td>
      </tr>
    `;
    updateSummaryCards([]);
    updateCharts([]);
    return;
  }

  filteredData.forEach((student, index) => {
    const totalDays = student.presentDays + student.absentDays + student.lateDays;
    const percentage = totalDays === 0 ? 100 : (student.presentDays / totalDays) * 100;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${student.rollNo}</strong></td>
      <td>
        <img class="student-photo" src="${student.photo}" alt="Student Photo" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
      </td>
      <td>${student.studentName}</td>
      <td>${student.presentDays}</td>
      <td>${student.absentDays}</td>
      <td>${student.lateDays}</td>
      <td class="${percentage >= 80 ? "percent-green" : "percent-orange"}">
        ${percentage.toFixed(2)}%
      </td>
      <td>
        <select class="status-select ${getStatusClass(student.todayStatus)}"
          onchange="changeStatus('${student.rollNo}', this.value, this)">
          <option value="Present" ${student.todayStatus === "Present" ? "selected" : ""}>Present</option>
          <option value="Absent" ${student.todayStatus === "Absent" ? "selected" : ""}>Absent</option>
          <option value="Late" ${student.todayStatus === "Late" ? "selected" : ""}>Late</option>
          <option value="Leave" ${student.todayStatus === "Leave" ? "selected" : ""}>Leave</option>
        </select>
      </td>
    `;
    attendanceTableBody.appendChild(row);
  });

  updateSummaryCards(filteredData);
  updateCharts(filteredData);
}

function getFilteredData() {
  const selectedClass = classFilter.value;
  const selectedSection = sectionFilter.value;
  const searchValue = rollSearch.value.trim().toLowerCase();

  return studentsData.filter(student => {
    const classMatch = selectedClass === "All" || student.className === selectedClass;
    const sectionMatch = selectedSection === "All" || student.section === selectedSection;
    const rollMatch =
      student.rollNo.toLowerCase().includes(searchValue) ||
      student.studentName.toLowerCase().includes(searchValue);

    return classMatch && sectionMatch && rollMatch;
  });
}

function updateSummaryCards(data) {
  const totalStudents = data.length;

  let presentToday = 0;
  let absentToday = 0;
  let lateToday = 0;

  data.forEach(student => {
    if (student.todayStatus === "Present") presentToday++;
    if (student.todayStatus === "Absent") absentToday++;
    if (student.todayStatus === "Late") lateToday++;
  });

  const overallPercent = totalStudents === 0 ? 0 : (presentToday / totalStudents) * 100;

  totalStudentsEl.textContent = totalStudents;
  totalPresentEl.textContent = presentToday;
  totalAbsentEl.textContent = absentToday;
  lateComersEl.textContent = lateToday;
  overallAttendanceEl.textContent = overallPercent.toFixed(1) + "%";
}

function changeStatus(rollNo, status, selectElement) {
  const student = studentsData.find(s => s.rollNo === rollNo);
  if (student) {
    student.todayStatus = status;
  }

  selectElement.className = "status-select " + getStatusClass(status);
  const filtered = getFilteredData();
  updateSummaryCards(filtered);
  updateCharts(filtered);
}

function getStatusClass(status) {
  if (status === "Present") return "status-present";
  if (status === "Absent") return "status-absent";
  if (status === "Late") return "status-late";
  if (status === "Leave") return "status-leave";
  return "";
}

document.getElementById("markAllPresent").addEventListener("click", () => {
  getFilteredData().forEach(student => {
    student.todayStatus = "Present";
  });
  loadAttendanceTable();
});

document.getElementById("markAllAbsent").addEventListener("click", () => {
  getFilteredData().forEach(student => {
    student.todayStatus = "Absent";
  });
  loadAttendanceTable();
});

document.getElementById("saveAttendanceBtn").addEventListener("click", async () => {
  const selectedDate = attendanceDate.value;
  if (!selectedDate) {
    alert("Please select an attendance date.");
    return;
  }

  const currentList = getFilteredData();
  if (currentList.length === 0) {
    alert("No students to save for the selected class.");
    return;
  }

  const attendancePayload = currentList.map(student => ({
    studentId: student.studentId,
    attendanceDate: selectedDate,
    status: student.todayStatus.toUpperCase()
  }));

  const saveBtn = document.getElementById("saveAttendanceBtn");
  saveBtn.disabled = true;
  saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

  try {
    const response = await fetch(`${API_BASE}/attendance/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(attendancePayload)
    });

    if (response.ok) {
      alert("Attendance Saved Successfully.");
    } else {
      const errorMsg = await response.text();
      console.error("Server Error Response:", errorMsg);
      alert(`Failed to save attendance: ${errorMsg || response.status}`);
    }
  } catch (error) {
    console.error("Save Attendance Network Error:", error);
    alert("Server error. Check your connection or console logs.");
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save Attendance`;
  }
});

classFilter.addEventListener("change", loadAttendanceTable);
sectionFilter.addEventListener("change", loadAttendanceTable);
rollSearch.addEventListener("input", loadAttendanceTable);
attendanceDate.addEventListener("change", loadTodayAttendance);

function updateCharts(data) {
  let present = 0;
  let absent = 0;
  let late = 0;

  data.forEach(student => {
    if (student.todayStatus === "Present") present++;
    if (student.todayStatus === "Absent") absentToday++;
    if (student.todayStatus === "Late") late++;
  });

  const total = data.length || 1;
  const presentPercent = ((present / total) * 100).toFixed(1);
  const absentPercent = ((absent / total) * 100).toFixed(1);
  const latePercent = ((late / total) * 100).toFixed(1);

  const attendanceCtx = document.getElementById("attendanceChart");
  if (!attendanceCtx) return;

  if (attendanceChart) attendanceChart.destroy();

  attendanceChart = new Chart(attendanceCtx, {
    type: "doughnut",
    data: {
      labels: [`Present ${presentPercent}%`, `Absent ${absentPercent}%`, `Late ${latePercent}%`],
      datasets: [{
        data: [present, absent, late],
        backgroundColor: ["#22c55e", "#ef4444", "#f59e0b"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "right" }
      }
    }
  });

  const monthlyCtx = document.getElementById("monthlyChart");
  if (!monthlyCtx) return;

  if (monthlyChart) monthlyChart.destroy();

  monthlyChart = new Chart(monthlyCtx, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      datasets: [{
        label: "Attendance %",
        data: [88, 90, 91, 89, 90, Number(presentPercent)],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.12)",
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

function updateDateTime() {
  const now = new Date();
  const dateOptions = { day: "2-digit", month: "short", year: "numeric" };
  const dayOptions = { weekday: "long" };

  const todayDateEl = document.getElementById("todayDate");
  const todayDayEl = document.getElementById("todayDay");
  const currentTimeEl = document.getElementById("currentTime");

  if (todayDateEl) todayDateEl.textContent = now.toLocaleDateString("en-IN", dateOptions);
  if (todayDayEl) todayDayEl.textContent = now.toLocaleDateString("en-IN", dayOptions);
  if (currentTimeEl) currentTimeEl.textContent = now.toLocaleTimeString("en-IN");
}

window.changeStatus = changeStatus;