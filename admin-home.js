new Chart(document.getElementById("feesChart"), {
  type: "doughnut",
  data: {
    labels: ["Paid", "Pending", "Overdue"],
    datasets: [{
      data: [60, 30, 10]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
});
const today = new Date();

const dateOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric"
};

document.getElementById("currentDate").innerText =
    today.toLocaleDateString("en-GB", dateOptions);

document.getElementById("currentDay").innerText =
    today.toLocaleDateString("en-GB", { weekday: "long" });

new Chart(document.getElementById("attendanceChart"), {
  type: "line",
  data: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [{
      label: "Attendance %",
      data: [93, 92, 89, 94, 96, 95],
      tension: 0.4,
      fill: true
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
});

new Chart(document.getElementById("genderChart"), {
  type: "doughnut",
  data: {
    labels: ["Boys", "Girls"],
    datasets: [{
      data: [670, 535]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
});
fetch("https://loginpagepsabackend.onrender.com/api/admin/dashboard")
  .then(response => response.json())
  .then(data => {
    document.getElementById("totalStudents").innerText = data.totalStudents;
    document.getElementById("totalTeachers").innerText = data.totalTeachers;
    document.getElementById("attendancePercent").innerText =
      data.attendancePercentage + "%";

    const activitiesBox = document.getElementById("recentActivities");
    activitiesBox.innerHTML = "";

    data.recentActivities.forEach(activity => {
      activitiesBox.innerHTML += `
        <div class="activity">
          <div class="icon ${activity.iconType}"></div>
          <p>
            ${activity.activityTitle}
            <br>
            <small>By ${activity.doneBy}</small>
          </p>
          <span>${activity.activityTime}</span>
        </div>
      `;
    });
  })
  .catch(error => console.error("Dashboard API Error:", error));