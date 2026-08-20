/**
 * Teacher Dashboard JavaScript
 * Power Public School ERP
 */

const API_BASE_URL = "http://localhost:8080/api";
const TEACHER_ID = 1; // Default logged-in teacher ID

document.addEventListener("DOMContentLoaded", () => {
    initDashboard();
});

async function initDashboard() {
    updateDateDisplay();
    loadTeacherProfile();
    await loadTeacherStatsAndSchedule();
    await loadAnnouncements();
}

/**
 * Updates real-time date in the sidebar/header
 */
function updateDateDisplay() {
    const now = new Date();
    const dateOptions = { day: "2-digit", month: "short", year: "numeric" };
    const dayOptions = { weekday: "long" };

    const dateVal = document.getElementById("currentDateVal");
    const dayVal = document.getElementById("currentDayVal");

    if (dateVal) dateVal.textContent = now.toLocaleDateString("en-IN", dateOptions);
    if (dayVal) dayVal.textContent = now.toLocaleDateString("en-IN", dayOptions);
}

/**
 * Populates Teacher info in the Top Bar
 */
async function loadTeacherProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/teachers/${TEACHER_ID}`);
        if (response.ok) {
            const teacher = await response.json();
            const nameElem = document.getElementById("teacherNameDisplay");
            const deptElem = document.getElementById("teacherDeptDisplay");
            
            if (nameElem && teacher.fullName) nameElem.textContent = teacher.fullName;
            if (deptElem && teacher.department) deptElem.textContent = `${teacher.department} Department`;
        }
    } catch (err) {
        console.warn("Could not fetch teacher profile, using default values:", err);
    }
}

/**
 * Loads dashboard stat counters and today's schedule from teacher classes
 */
async function loadTeacherStatsAndSchedule() {
    const classesCountElem = document.getElementById("statTotalClasses");
    const studentsCountElem = document.getElementById("statTotalStudents");
    const attendanceElem = document.getElementById("statAttendance");
    const scheduleContainer = document.getElementById("scheduleListContainer");

    try {
        const response = await fetch(`${API_BASE_URL}/teachers/${TEACHER_ID}/classes`);
        if (response.ok) {
            const assignedClasses = await response.json();

            // 1. Total Classes
            if (classesCountElem) classesCountElem.textContent = assignedClasses.length || "0";

            // 2. Total Students calculation
            let totalStudents = 0;
            assignedClasses.forEach(item => {
                totalStudents += item.strength || 30; // fallback per class if strength isn't set
            });
            if (studentsCountElem) studentsCountElem.textContent = totalStudents || "0";

            // 3. Render Today's Schedule dynamically
            if (scheduleContainer && assignedClasses.length > 0) {
                scheduleContainer.innerHTML = "";
                const sampleTimes = [
                    { time: "09:00", period: "AM" },
                    { time: "10:15", period: "AM" },
                    { time: "11:30", period: "AM" },
                    { time: "01:30", period: "PM" },
                    { time: "02:45", period: "PM" }
                ];

                assignedClasses.slice(0, 4).forEach((cls, idx) => {
                    const timeSlot = sampleTimes[idx % sampleTimes.length];
                    const itemHtml = `
                        <div class="schedule-item">
                            <div class="schedule-time">
                                <strong>${timeSlot.time}</strong>
                                <span>${timeSlot.period}</span>
                            </div>
                            <div class="schedule-details">
                                <strong>Class ${cls.className} - ${cls.section}</strong>
                                <span>${cls.subject || "General Session"}</span>
                            </div>
                        </div>
                    `;
                    scheduleContainer.insertAdjacentHTML("beforeend", itemHtml);
                });
            }
        }
    } catch (error) {
        console.warn("Backend classes endpoint unavailable, displaying cached structure:", error);
    }

    // 4. Load attendance percentage
    try {
        const todayStr = new Date().toISOString().split("T")[0];
        const attResponse = await fetch(`${API_BASE_URL}/attendance/date/${todayStr}`);
        if (attResponse.ok) {
            const records = await attResponse.json();
            if (records.length > 0) {
                const present = records.filter(r => r.status?.toUpperCase() === "PRESENT").length;
                const percent = Math.round((present / records.length) * 100);
                if (attendanceElem) attendanceElem.textContent = `${percent}%`;
            }
        }
    } catch (e) {
        // Keeps fallback 94%
    }
}

/**
 * Loads recent announcements from backend
 */
async function loadAnnouncements() {
    const listContainer = document.getElementById("announcementListContainer");
    if (!listContainer) return;

    try {
        const res = await fetch(`${API_BASE_URL}/announcements`);
        if (res.ok) {
            const announcements = await res.json();
            if (announcements.length > 0) {
                listContainer.innerHTML = "";
                announcements.slice(0, 3).forEach(item => {
                    const itemHtml = `
                        <div class="announcement-item">
                            <div class="announcement-icon">📌</div>
                            <div>
                                <strong>${item.title || "Announcement"}</strong>
                                <p>${item.description || ""}</p>
                                <span>${item.announcementDate || "Recent"}</span>
                            </div>
                        </div>
                    `;
                    listContainer.insertAdjacentHTML("beforeend", itemHtml);
                });
            }
        }
    } catch (e) {
        console.warn("Announcements endpoint unavailable, showing default announcements:", e);
    }
}

/* =========================================================
   QUICK ACTION SHORTCUTS & NAVIGATION
   ========================================================= */

function openAttendance() {
    window.location.href = "teacher-attendance.html";
}

function openMarks() {
    window.location.href = "teacher-marks.html";
}

function openHomework() {
    window.location.href = "teacher-homework.html";
}

function openAnnouncements() {
    window.location.href = "teacher-announcements.html";
}

function openMyClasses() {
    window.location.href = "teacher-classes.html";
}

function openProfile() {
    window.location.href = "teacher-profile.html";
}

function logout() {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "login.html";
}

// Attach globally for inline onclick handlers
window.openAttendance = openAttendance;
window.openMarks = openMarks;
window.openHomework = openHomework;
window.openAnnouncements = openAnnouncements;
window.openMyClasses = openMyClasses;
window.openProfile = openProfile;
window.logout = logout;