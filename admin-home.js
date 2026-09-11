

const API_BASE = "https://loginpagepsabackend.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
    initCalendar();
    initCharts();
    loadDashboardData();
});

function initCalendar() {
    const today = new Date();
    const dateOptions = { day: "2-digit", month: "long", year: "numeric" };
    
    const dateEl = document.getElementById("currentDate");
    const dayEl = document.getElementById("currentDay");

    if (dateEl) dateEl.innerText = today.toLocaleDateString("en-GB", dateOptions);
    if (dayEl) dayEl.innerText = today.toLocaleDateString("en-GB", { weekday: "long" });
}

function initCharts() {
    // 1. Fees Doughnut Chart
    const feesCanvas = document.getElementById("feesChart");
    if (feesCanvas) {
        new Chart(feesCanvas, {
            type: "doughnut",
            data: {
                labels: ["Paid", "Pending", "Overdue"],
                datasets: [{
                    data: [60, 30, 10],
                    backgroundColor: ["#38bdf8", "#f43f5e", "#fb923c"],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "top", labels: { boxWidth: 12, font: { size: 11 } } }
                }
            }
        });
    }

    // 2. Attendance Line Chart
    const attendanceCanvas = document.getElementById("attendanceChart");
    if (attendanceCanvas) {
        new Chart(attendanceCanvas, {
            type: "line",
            data: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                datasets: [{
                    label: "Attendance %",
                    data: [93, 92, 89, 94, 96, 95],
                    borderColor: "#38bdf8",
                    backgroundColor: "rgba(56, 189, 248, 0.2)",
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "top", labels: { boxWidth: 12, font: { size: 11 } } }
                },
                scales: {
                    y: { min: 85, max: 100 }
                }
            }
        });
    }

    // 3. Gender Doughnut Chart
    const genderCanvas = document.getElementById("genderChart");
    if (genderCanvas) {
        new Chart(genderCanvas, {
            type: "doughnut",
            data: {
                labels: ["Boys", "Girls"],
                datasets: [{
                    data: [670, 535],
                    backgroundColor: ["#38bdf8", "#fb7185"],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "top", labels: { boxWidth: 12, font: { size: 11 } } }
                }
            }
        });
    }
}

async function loadDashboardData() {
    let totalStudents = null;
    let totalTeachers = null;
    let attendancePct = null;
    let recentActivities = null;

    // 1. Fetch dashboard aggregated stats
    try {
        const response = await fetch(`${API_BASE}/admin/dashboard`);
        if (response.ok) {
            const data = await response.json();
            totalStudents = data?.totalStudents;
            totalTeachers = data?.totalTeachers;
            attendancePct = data?.attendancePercentage;
            recentActivities = data?.recentActivities;
        }
    } catch (err) {
        console.warn("Dashboard summary endpoint error, fetching directly:", err);
    }

    // 2. Sync directly with /api/students if totalStudents is missing or undefined
    if (totalStudents === null || totalStudents === undefined) {
        try {
            const stuRes = await fetch(`${API_BASE}/students`);
            if (stuRes.ok) {
                const students = await stuRes.json();
                totalStudents = Array.isArray(students) ? students.length : 0;
            }
        } catch (e) {
            console.error("Failed to load students directly:", e);
        }
    }

    // 3. Fallbacks to prevent 'undefined' or mismatched mock values
    totalStudents = totalStudents ?? 0;
    totalTeachers = totalTeachers ?? 48;
    attendancePct = attendancePct ?? 94.2;

    if (!recentActivities || recentActivities.length === 0) {
        recentActivities = [
            {
                activityTitle: "Added New Admission - Class 5-B",
                doneBy: "Admin Office",
                activityTime: "10 mins ago",
                iconType: "student"
            },
            {
                activityTitle: "Term 1 Fees Batch Received",
                doneBy: "Accounts Dept",
                activityTime: "1 hour ago",
                iconType: "fees"
            },
            {
                activityTitle: "Staff Meeting Announcement Issued",
                doneBy: "Principal Desk",
                activityTime: "Yesterday",
                iconType: "announcement"
            }
        ];
    }

    // 4. Update DOM Elements
    const stuElem = document.getElementById("totalStudents");
    const teaElem = document.getElementById("totalTeachers");
    const attElem = document.getElementById("attendancePercent");

    if (stuElem) stuElem.innerText = totalStudents;
    if (teaElem) teaElem.innerText = totalTeachers;
    if (attElem) attElem.innerText = `${attendancePct}%`;

    renderRecentActivities(recentActivities);
}

function renderRecentActivities(activities) {
    const activitiesBox = document.getElementById("recentActivities");
    if (!activitiesBox) return;

    activitiesBox.innerHTML = "";

    if (!activities || activities.length === 0) {
        activitiesBox.innerHTML = `<p style="padding: 15px; color: #888;">No recent activities found.</p>`;
        return;
    }

    activities.forEach(activity => {
        const type = (activity.iconType || "student").toLowerCase();
        let iconMarkup = '<i class="fa-solid fa-circle-info"></i>';

        if (type.includes("student")) {
            iconMarkup = '<i class="fa-solid fa-user-graduate"></i>';
        } else if (type.includes("fee")) {
            iconMarkup = '<i class="fa-solid fa-receipt"></i>';
        } else if (type.includes("announce")) {
            iconMarkup = '<i class="fa-solid fa-bullhorn"></i>';
        }

        const item = document.createElement("div");
        item.className = "activity";
        item.innerHTML = `
            <div class="activity-icon ${type}">
                ${iconMarkup}
            </div>
            <p>
                <strong>${activity.activityTitle || "Activity Updated"}</strong>
                <br>
                <small>By ${activity.doneBy || "Admin"}</small>
            </p>
            <span>${activity.activityTime || "Recent"}</span>
        `;
        activitiesBox.appendChild(item);
    });
}