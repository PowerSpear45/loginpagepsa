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

let studentsData = [
  {
    rollNo: "260501",
    photo: "https://i.pravatar.cc/100?img=12",
    studentName: "Abinash Kumar",
    className: "5",
    section: "B",
    presentDays: 18,
    absentDays: 2,
    lateDays: 1,
    todayStatus: "Present"
  },
  {
    rollNo: "260502",
    photo: "https://i.pravatar.cc/100?img=47",
    studentName: "Dhivya.S",
    className: "5",
    section: "B",
    presentDays: 19,
    absentDays: 1,
    lateDays: 1,
    todayStatus: "Present"
  },
  {
    rollNo: "260503",
    photo: "https://i.pravatar.cc/100?img=15",
    studentName: "Babu.U",
    className: "5",
    section: "B",
    presentDays: 20,
    absentDays: 1,
    lateDays: 0,
    todayStatus: "Present"
  },
  {
    rollNo: "260504",
    photo: "https://i.pravatar.cc/100?img=33",
    studentName: "Deepika.K",
    className: "5",
    section: "B",
    presentDays: 17,
    absentDays: 3,
    lateDays: 1,
    todayStatus: "Late"
  },
  {
    rollNo: "260505",
    photo: "https://i.pravatar.cc/100?img=52",
    studentName: "Krishna.P",
    className: "5",
    section: "B",
    presentDays: 16,
    absentDays: 4,
    lateDays: 1,
    todayStatus: "Absent"
  },
  {
    rollNo: "260601",
    photo: "https://i.pravatar.cc/100?img=21",
    studentName: "Sanjay P",
    className: "6",
    section: "A",
    presentDays: 18,
    absentDays: 3,
    lateDays: 0,
    todayStatus: "Present"
  },
  {
    rollNo: "260602",
    photo: "https://i.pravatar.cc/100?img=44",
    studentName: "Anjali",
    className: "6",
    section: "A",
    presentDays: 17,
    absentDays: 4,
    lateDays: 2,
    todayStatus: "Leave"
  }
];

function loadAttendanceTable() {
  const filteredData = getFilteredData();

  attendanceTableBody.innerHTML = "";

  filteredData.forEach((student, index) => {
    const totalDays = student.presentDays + student.absentDays + student.lateDays;
    const percentage = totalDays === 0 ? 0 : (student.presentDays / totalDays) * 100;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${student.rollNo}</td>
      <td>
        <img class="student-photo" src="${student.photo}" alt="Student Photo">
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

  let totalPresentDays = 0;
  let totalMarkedDays = 0;

  data.forEach(student => {
    if (student.todayStatus === "Present") presentToday++;
    if (student.todayStatus === "Absent") absentToday++;
    if (student.todayStatus === "Late") lateToday++;

    totalPresentDays += student.presentDays;
    totalMarkedDays += student.presentDays + student.absentDays + student.lateDays;
  });

  const overallPercent =
    totalMarkedDays === 0 ? 0 : (totalPresentDays / totalMarkedDays) * 100;

  totalStudentsEl.textContent = totalStudents;
  totalPresentEl.textContent = presentToday;
  totalAbsentEl.textContent = absentToday;
  lateComersEl.textContent = lateToday;
  overallAttendanceEl.textContent = overallPercent.toFixed(2) + "%";
}

function changeStatus(rollNo, status, selectElement) {
  const student = studentsData.find(s => s.rollNo === rollNo);

  if (student) {
    student.todayStatus = status;
  }

  selectElement.className = "status-select " + getStatusClass(status);

  updateSummaryCards(getFilteredData());
  updateCharts(getFilteredData());
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

document.getElementById("saveAttendanceBtn").addEventListener("click", () => {
  const selectedDate = attendanceDate.value;

  if (!selectedDate) {
    alert("Please select attendance date");
    return;
  }

  const attendancePayload = getFilteredData().map(student => ({
    rollNo: student.rollNo,
    studentName: student.studentName,
    className: student.className,
    section: student.section,
    date: selectedDate,
    status: student.todayStatus
  }));

  console.log("Attendance Saved:", attendancePayload);

  alert("Attendance saved successfully. Backend connection will be added next.");
});

document.getElementById("exportBtn").addEventListener("click", () => {
  alert("Export feature will be added after backend connection.");
});

classFilter.addEventListener("change", loadAttendanceTable);
sectionFilter.addEventListener("change", loadAttendanceTable);
rollSearch.addEventListener("input", loadAttendanceTable);

function updateCharts(data) {
  let present = 0;
  let absent = 0;
  let late = 0;

  data.forEach(student => {
    if (student.todayStatus === "Present") present++;
    if (student.todayStatus === "Absent") absent++;
    if (student.todayStatus === "Late") late++;
  });

  const total = data.length || 1;

  const presentPercent = ((present / total) * 100).toFixed(2);
  const absentPercent = ((absent / total) * 100).toFixed(2);
  const latePercent = ((late / total) * 100).toFixed(2);

  const attendanceCtx = document.getElementById("attendanceChart");

  if (attendanceChart) {
    attendanceChart.destroy();
  }

  attendanceChart = new Chart(attendanceCtx, {
    type: "doughnut",
    data: {
      labels: [
        `Present ${presentPercent}%`,
        `Absent ${absentPercent}%`,
        `Late ${latePercent}%`
      ],
      datasets: [{
        data: [present, absent, late],
        backgroundColor: ["#22c55e", "#ef4444", "#f59e0b"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "right"
        }
      }
    }
  });

  const monthlyCtx = document.getElementById("monthlyChart");

  if (monthlyChart) {
    monthlyChart.destroy();
  }

  monthlyChart = new Chart(monthlyCtx, {
    type: "line",
    data: {
      labels: ["Dec", "Jan", "Feb", "Mar", "Apr", "May"],
      datasets: [{
        label: "Attendance %",
        data: [88.12, 90.45, 91.23, 89.75, 90.10, Number(presentPercent)],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.12)",
        tension: 0.4,
        fill: true,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

function updateDateTime() {
  const now = new Date();

  const dateOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric"
  };

  const dayOptions = {
    weekday: "long"
  };

  document.getElementById("todayDate").textContent =
    now.toLocaleDateString("en-IN", dateOptions);

  document.getElementById("todayDay").textContent =
    now.toLocaleDateString("en-IN", dayOptions);

  document.getElementById("currentTime").textContent =
    now.toLocaleTimeString("en-IN");
}

function setDefaultDate() {
  const today = new Date().toISOString().split("T")[0];
  attendanceDate.value = today;
}

setDefaultDate();
updateDateTime();
setInterval(updateDateTime, 1000);

loadAttendanceTable();