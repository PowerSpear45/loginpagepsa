/**
 * Teacher Dashboard JavaScript
 * Power Public School ERP
 */

const API_BASE_URL = "https://loginpagepsabackend.onrender.com/api";
const TEACHER_ID = localStorage.getItem("teacherId") || "1";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Instantly render Date & Teacher Profile from cache/system clock
    updateDateDisplay();
    loadTeacherProfile();

    // 2. Fetch remote dashboard data
    initDashboard();
});

async function initDashboard() {
    await loadTeacherStats();
    await loadSchedule();
    await loadAnnouncements();
}

/**
 * Updates real-time date in the sidebar (checks all possible element IDs)
 */
function updateDateDisplay() {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const dayFormatted = now.toLocaleDateString("en-IN", { weekday: "long" });

    // Handles both currentDateVal / todayDate IDs
    const dateEl = document.getElementById("currentDateVal") || document.getElementById("todayDate");
    const dayEl = document.getElementById("currentDayVal") || document.getElementById("todayDay");

    if (dateEl) dateEl.textContent = dateFormatted;
    if (dayEl) dayEl.textContent = dayFormatted;
}

/**
 * Populates Dynamic Teacher info & Photo in the Top Bar with instant fallback
 */
async function loadTeacherProfile() {
    const nameElem = document.getElementById("teacherNameDisplay");
    const deptElem = document.getElementById("teacherDeptDisplay");
    const picElem = document.getElementById("teacherProfilePic");

    // Load instantly from localStorage cache if available
    const cachedName = localStorage.getItem("teacherName") || "Abinash Kumar";
    const cachedDept = localStorage.getItem("teacherDept") || "Mathematics Department";

    if (nameElem) nameElem.textContent = cachedName;
    if (deptElem) deptElem.textContent = cachedDept;
    if (picElem) {
        picElem.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cachedName)}&background=e8f0fe&color=1f3f6d`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/teachers/${TEACHER_ID}`);
        if (response.ok) {
            const teacher = await response.json();
            const fullName = teacher.fullName || teacher.full_name || teacher.name || cachedName;
            const department = teacher.department ? `${teacher.department} Department` : cachedDept;

            if (nameElem) nameElem.textContent = fullName;
            if (deptElem) deptElem.textContent = department;

            // Cache for future loads
            localStorage.setItem("teacherName", fullName);

            if (picElem) {
                picElem.src = teacher.photoUrl || teacher.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e8f0fe&color=1f3f6d`;
            }
        }
    } catch (err) {
        console.warn("Could not fetch teacher profile from server, using local fallback:", err);
    }
}

/**
 * Loads dynamic dashboard stat cards (with deduplicated class count)
 */
async function loadTeacherStats() {
    const classesCountElem = document.getElementById("statTotalClasses");
    const studentsCountElem = document.getElementById("statTotalStudents");
    const attendanceElem = document.getElementById("statAttendance");

    try {
        const response = await fetch(`${API_BASE_URL}/teachers/${TEACHER_ID}/classes`);
        if (response.ok) {
            const rawClasses = await response.json();

            // Deduplicate classes so accurate 10 unique classes show up
            const uniqueMap = new Map();
            rawClasses.forEach(item => {
                const key = `${item.className || item.class_name}-${item.section}`;
                if (!uniqueMap.has(key)) {
                    uniqueMap.set(key, item);
                }
            });
            const assignedClasses = Array.from(uniqueMap.values());

            if (classesCountElem) classesCountElem.textContent = assignedClasses.length || "0";

            let totalStudents = 0;
            try {
                const studentRes = await fetch(`${API_BASE_URL}/students`);
                if (studentRes.ok) {
                    const allStudents = await studentRes.json();
                    assignedClasses.forEach(cls => {
                        const count = allStudents.filter(s => 
                            String(s.className || s.class_name) === String(cls.className || cls.class_name) &&
                            String(s.section) === String(cls.section)
                        ).length;
                        totalStudents += (count > 0 ? count : (cls.strength || 30));
                    });
                }
            } catch (e) {
                assignedClasses.forEach(item => { totalStudents += item.strength || 30; });
            }

            if (studentsCountElem) studentsCountElem.textContent = totalStudents || "0";
        }
    } catch (error) {
        console.warn("Could not load classes stats:", error);
    }

    // Load Today's Attendance Percentage
    try {
        const todayStr = new Date().toISOString().split("T")[0];
        const attResponse = await fetch(`${API_BASE_URL}/attendance?date=${todayStr}`);
        if (attResponse.ok) {
            const records = await attResponse.json();
            if (Array.isArray(records) && records.length > 0) {
                const present = records.filter(r => (r.status || "").toUpperCase() === "PRESENT").length;
                const percent = Math.round((present / records.length) * 100);
                if (attendanceElem) attendanceElem.textContent = `${percent}%`;
            } else {
                if (attendanceElem) attendanceElem.textContent = "0%";
            }
        }
    } catch (e) {
        console.warn("Attendance endpoint check:", e);
    }
}

/**
 * Loads Today's Schedule dynamically based on current day
 */
async function loadSchedule() {
    const scheduleContainer = document.getElementById("scheduleListContainer");
    if (!scheduleContainer) return;

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayDayName = days[new Date().getDay()];

    try {
        const response = await fetch(`${API_BASE_URL}/teachers/${TEACHER_ID}/schedule?day=${todayDayName}`);
        if (response.ok) {
            const scheduleData = await response.json();
            if (Array.isArray(scheduleData) && scheduleData.length > 0) {
                scheduleContainer.innerHTML = "";
                scheduleData.forEach(item => {
                    const itemHtml = `
                        <div class="schedule-item">
                            <div class="schedule-time">
                                <strong>${item.startTime || item.start_time}</strong>
                                <span>${item.period || 'AM'}</span>
                            </div>
                            <div class="schedule-details">
                                <strong>Class ${item.className || item.class_name} - ${item.section}</strong>
                                <span>${item.subject}</span>
                            </div>
                        </div>
                    `;
                    scheduleContainer.insertAdjacentHTML("beforeend", itemHtml);
                });
                return;
            }
        }
    } catch (error) {
        console.warn("Using fallback dynamic schedule:", error);
    }

    // Weekly schedule fallback
    const weeklyScheduleFallback = {
        "Monday": [
            { start_time: "09:00", period: "AM", class_name: "5", section: "A", subject: "Mathematics" },
            { start_time: "10:15", period: "AM", class_name: "6", section: "B", subject: "Mathematics" },
            { start_time: "11:30", period: "AM", class_name: "7", section: "A", subject: "Mathematics" }
        ],
        "Tuesday": [
            { start_time: "09:00", period: "AM", class_name: "6", section: "B", subject: "Mathematics" },
            { start_time: "10:15", period: "AM", class_name: "5", section: "A", subject: "Algebra Basics" },
            { start_time: "01:30", period: "PM", class_name: "8", section: "A", subject: "Mathematics" }
        ],
        "Wednesday": [
            { start_time: "09:00", period: "AM", class_name: "5", section: "A", subject: "Mathematics" },
            { start_time: "10:15", period: "AM", class_name: "7", section: "A", subject: "Mathematics" },
            { start_time: "11:30", period: "AM", class_name: "6", section: "B", subject: "Math Lab Activity" }
        ],
        "Thursday": [
            { start_time: "09:00", period: "AM", class_name: "7", section: "A", subject: "Mathematics" },
            { start_time: "10:15", period: "AM", class_name: "5", section: "A", subject: "Mathematics" },
            { start_time: "01:30", period: "PM", class_name: "6", section: "B", subject: "Problem Solving" }
        ],
        "Friday": [
            { start_time: "09:00", period: "AM", class_name: "8", section: "A", subject: "Mathematics Test" },
            { start_time: "10:15", period: "AM", class_name: "5", section: "A", subject: "Mental Maths" }
        ],
        "Saturday": [
            { start_time: "09:30", period: "AM", class_name: "5", section: "A", subject: "Remedial Session" },
            { start_time: "11:00", period: "AM", class_name: "7", section: "A", subject: "Weekly Quiz" }
        ],
        "Sunday": [
            { start_time: "10:00", period: "AM", class_name: "-", section: "-", subject: "Weekend Holiday" }
        ]
    };

    const todayItems = weeklyScheduleFallback[todayDayName] || [];
    scheduleContainer.innerHTML = "";

    todayItems.forEach(item => {
        const itemHtml = `
            <div class="schedule-item">
                <div class="schedule-time">
                    <strong>${item.start_time}</strong>
                    <span>${item.period}</span>
                </div>
                <div class="schedule-details">
                    <strong>${item.class_name === '-' ? 'No Class' : `Class ${item.class_name} - ${item.section}`}</strong>
                    <span>${item.subject}</span>
                </div>
            </div>
        `;
        scheduleContainer.insertAdjacentHTML("beforeend", itemHtml);
    });
}

/**
 * Loads recent announcements
 */
async function loadAnnouncements() {
    const listContainer = document.getElementById("announcementListContainer");
    if (!listContainer) return;

    try {
        const res = await fetch(`${API_BASE_URL}/announcements`);
        if (res.ok) {
            const announcements = await res.json();
            if (Array.isArray(announcements) && announcements.length > 0) {
                listContainer.innerHTML = "";
                announcements.slice(0, 3).forEach(item => {
                    const dateObj = new Date(item.announcementDate || item.announcement_date || Date.now());
                    const formattedDate = dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                    
                    const itemHtml = `
                        <div class="announcement-item">
                            <div class="announcement-icon">📌</div>
                            <div>
                                <strong>${item.title || "Announcement"}</strong>
                                <p>${item.description || ""}</p>
                                <span>${formattedDate}</span>
                            </div>
                        </div>
                    `;
                    listContainer.insertAdjacentHTML("beforeend", itemHtml);
                });
            }
        }
    } catch (e) {
        console.warn("Announcements endpoint unavailable:", e);
    }
}

// Global Navigations
function openAttendance() { window.location.href = "teacher-attendance.html"; }
function openMarks() { window.location.href = "teacher-marks.html"; }
function openHomework() { window.location.href = "teacher-homework.html"; }
function openAnnouncements() { window.location.href = "teacher-announcements.html"; }
function openMyClasses() { window.location.href = "teacher-classes.html"; }
function openProfile() { window.location.href = "teacher-profile.html"; }

window.openAttendance = openAttendance;
window.openMarks = openMarks;
window.openHomework = openHomework;
window.openAnnouncements = openAnnouncements;
window.openMyClasses = openMyClasses;
window.openProfile = openProfile;