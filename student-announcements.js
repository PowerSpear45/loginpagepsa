/**
 * Student Announcements Controller
 * Power Public School ERP
 */

const API_BASE = "https://loginpagepsabackend.onrender.com/api";
const TARGET_ADMISSION_NO = localStorage.getItem("activeAdmissionNo") || "ADM5B01";

let activeStudent = null;
let allAnnouncements = [];
let currentFilterTab = "ALL";

document.addEventListener("DOMContentLoaded", async () => {
    updateTodayDate();
    await initStudent();
    await loadAnnouncements();
});

function updateTodayDate() {
    const now = new Date();
    const dateVal = document.getElementById("currentDateVal");
    const dayVal = document.getElementById("currentDayVal");

    if (dateVal) dateVal.textContent = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    if (dayVal) dayVal.textContent = now.toLocaleDateString("en-IN", { weekday: "long" });
}

async function initStudent() {
    try {
        const res = await fetch(`${API_BASE}/students`);
        if (res.ok) {
            const students = await res.json();
            activeStudent = students.find(s => 
                (s.admissionNo && s.admissionNo.toUpperCase() === TARGET_ADMISSION_NO) ||
                (s.admission_no && s.admission_no.toUpperCase() === TARGET_ADMISSION_NO)
            );
        }
    } catch (e) {
        console.warn("Could not load student profile:", e);
    }

    if (!activeStudent) {
        activeStudent = {
            studentId: 1,
            fullName: "V.S.Sakthivel",
            className: "5",
            section: "B",
            rollNo: "20265001"
        };
    }

    const name = activeStudent.fullName || activeStudent.full_name || "V.S.Sakthivel";
    const cl = activeStudent.className || activeStudent.class_name || "5";
    const sec = activeStudent.section || "B";
    const roll = activeStudent.rollNo || activeStudent.roll_no || "20265001";

    document.getElementById("studentName").textContent = name;
    document.getElementById("studentClassSection").textContent = `${cl}-${sec}`;
    document.getElementById("studentRoll").textContent = roll;
    document.getElementById("studentAvatar").src = 
        activeStudent.photo || activeStudent.photoUrl || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1f3f6d&color=ffffff`;
}

async function loadAnnouncements() {
    const container = document.getElementById("announcementsList");

    try {
        const res = await fetch(`${API_BASE}/announcements`);
        if (res.ok) {
            allAnnouncements = await res.json();
        } else {
            throw new Error("Failed to load announcements");
        }
    } catch (err) {
        console.warn("Server unavailable or endpoint cold-starting. Loading fallback sync notices:", err);
        allAnnouncements = getFallbackAnnouncements();
    }

    // Filter notices targeted to Students or this specific Class (Class 5 - B)
    const studentClassName = String(activeStudent.className || "5").trim();
    const studentSection = String(activeStudent.section || "B").trim();
    const studentClassTag = `Class ${studentClassName} - ${studentSection}`.toLowerCase();

    const studentRelevant = allAnnouncements.filter(item => {
        const aud = (item.audience || "").toLowerCase();
        // Allow broad student notices or specific class matches
        return (
            aud.includes("all student") ||
            aud.includes("students") ||
            aud.includes("general") ||
            aud.includes(studentClassTag) ||
            aud.includes(`class ${studentClassName}`)
        );
    });

    // Update KPI counters
    let adminCount = 0;
    let teacherCount = 0;

    studentRelevant.forEach(item => {
        const poster = (item.postedBy || item.posted_by || "").toLowerCase();
        if (poster.includes("admin") || poster.includes("principal")) {
            adminCount++;
        } else {
            teacherCount++;
        }
    });

    document.getElementById("statTotalCount").textContent = studentRelevant.length;
    document.getElementById("statAdminCount").textContent = adminCount;
    document.getElementById("statTeacherCount").textContent = teacherCount;

    renderAnnouncements(studentRelevant);
}

function switchTab(tab) {
    currentFilterTab = tab;
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));

    if (tab === "ALL") document.getElementById("tabAll").classList.add("active");
    if (tab === "ADMIN") document.getElementById("tabAdmin").classList.add("active");
    if (tab === "TEACHER") document.getElementById("tabTeacher").classList.add("active");

    handleSearch();
}

function handleSearch() {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    const studentClassName = String(activeStudent.className || "5").trim();
    const studentSection = String(activeStudent.section || "B").trim();
    const studentClassTag = `Class ${studentClassName} - ${studentSection}`.toLowerCase();

    const studentRelevant = allAnnouncements.filter(item => {
        const aud = (item.audience || "").toLowerCase();
        return (
            aud.includes("all student") ||
            aud.includes("students") ||
            aud.includes("general") ||
            aud.includes(studentClassTag) ||
            aud.includes(`class ${studentClassName}`)
        );
    });

    const filtered = studentRelevant.filter(item => {
        const poster = (item.postedBy || item.posted_by || "").toLowerCase();
        const isAdmin = poster.includes("admin") || poster.includes("principal");
        const isTeacher = !isAdmin;

        let tabMatch = true;
        if (currentFilterTab === "ADMIN") tabMatch = isAdmin;
        if (currentFilterTab === "TEACHER") tabMatch = isTeacher;

        const title = (item.title || "").toLowerCase();
        const desc = (item.description || "").toLowerCase();
        const searchMatch = !query || title.includes(query) || desc.includes(query);

        return tabMatch && searchMatch;
    });

    renderAnnouncements(filtered);
}

function renderAnnouncements(list) {
    const container = document.getElementById("announcementsList");
    container.innerHTML = "";

    if (!list || list.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-bullhorn" style="font-size: 28px; margin-bottom: 8px; color: #94a3b8; display: block;"></i>
                No circulars or notices match your selection.
            </div>
        `;
        return;
    }

    list.forEach(item => {
        const postedBy = item.postedBy || item.posted_by || "Admin";
        const isAdmin = postedBy.toLowerCase().includes("admin") || postedBy.toLowerCase().includes("principal");
        const title = item.title || "School Notice";
        const desc = item.description || "";
        const audience = item.audience || "All Students";
        const date = item.announcementDate || item.announcement_date || "Recent";
        const time = item.announcementTime || item.announcement_time || "";

        const card = document.createElement("div");
        card.className = `ann-card ${isAdmin ? 'admin-card' : 'teacher-card'}`;

        card.innerHTML = `
            <div class="ann-card-header">
                <div class="ann-badges">
                    <span class="badge-source ${isAdmin ? 'badge-admin' : 'badge-teacher'}">
                        ${isAdmin ? '<i class="fa-solid fa-shield-halved"></i> From Admin' : '<i class="fa-solid fa-chalkboard-user"></i> Class Teacher'}
                    </span>
                    <span class="badge-target"><i class="fa-solid fa-users"></i> ${audience}</span>
                </div>
                <span class="ann-date"><i class="fa-regular fa-clock"></i> ${date} ${time}</span>
            </div>

            <h3>${title}</h3>
            <p class="ann-content">${desc}</p>

            <div class="ann-card-footer">
                <div class="author-info">
                    <i class="fa-solid fa-user-pen"></i> Posted by: <strong>${postedBy}</strong>
                </div>
                <span style="color: #16a34a; font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Official Notice</span>
            </div>
        `;

        container.appendChild(card);
    });
}

function getFallbackAnnouncements() {
    return [
        {
            announcementId: 1,
            title: "Quarterly Examination Schedule Released",
            description: "Quarterly examinations will commence from September 15. The detailed timetable has been uploaded on your portal.",
            audience: "All Students",
            postedBy: "Admin",
            announcementDate: "2026-08-25",
            announcementTime: "10:00 AM",
            status: "Active"
        },
        {
            announcementId: 2,
            title: "Class 5-B Mathematics Revision Class",
            description: "There will be a special doubt-clearing session for Chapter 3 geometry this Friday at 3:30 PM.",
            audience: "Class 5 - B",
            postedBy: "Teacher - Abinash Kumar",
            announcementDate: "2026-08-26",
            announcementTime: "02:15 PM",
            status: "Active"
        },
        {
            announcementId: 3,
            title: "Annual Sports Day Registration",
            description: "Registrations are now open for track and field events. Interested students can give their names to their class teacher.",
            audience: "All Students",
            postedBy: "Admin",
            announcementDate: "2026-08-28",
            announcementTime: "11:30 AM",
            status: "Active"
        }
    ];
}

function logoutStudent() {
    localStorage.removeItem("activeStudentId");
    localStorage.removeItem("activeAdmissionNo");
    window.location.href = "login.html";
}