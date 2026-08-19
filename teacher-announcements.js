const API_BASE = "https://loginpagepsabackend.onrender.com/api";
const teacherId = localStorage.getItem("teacherId") || "1";

let allAnnouncements = [];
let currentFilterTab = "all";
let teacherName = "Teacher";

document.addEventListener("DOMContentLoaded", () => {
    updateTodayDate();
    loadTeacherInfo();
    loadAnnouncements();
});

function updateTodayDate() {
    const dateEl = document.getElementById("todayDate");
    const dayEl = document.getElementById("todayDay");
    const now = new Date();

    if (dateEl) {
        dateEl.textContent = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    }
    if (dayEl) {
        dayEl.textContent = now.toLocaleDateString("en-IN", { weekday: "long" });
    }
}

// Load current teacher's name
async function loadTeacherInfo() {
    try {
        const res = await fetch(`${API_BASE}/teachers/${teacherId}`);
        if (res.ok) {
            const data = await res.json();
            teacherName = data.fullName || data.full_name || "Teacher";
            const nameEl = document.getElementById("teacherHeaderName");
            if (nameEl) nameEl.textContent = teacherName;
        }
    } catch (e) {
        console.warn("Could not fetch teacher profile, using default");
    }
}

// Fetch all announcements from DB
async function loadAnnouncements() {
    const container = document.getElementById("announcementsList");
    try {
        const res = await fetch(`${API_BASE}/announcements`);
        if (res.ok) {
            allAnnouncements = await res.json();
        } else {
            throw new Error("Failed to load");
        }
    } catch (err) {
        console.warn("Using sample announcements:", err);
        allAnnouncements = [
            {
                announcementId: 1,
                title: "Quarterly Exam Schedule Released",
                description: "Quarterly examinations will commence from September 15. All teachers are requested to complete marks entry promptly.",
                audience: "Teachers & Students",
                postedBy: "Admin",
                announcementDate: "2026-08-18",
                announcementTime: "10:30 AM",
                status: "Active"
            },
            {
                announcementId: 2,
                title: "Class 5-B Maths Special Class",
                description: "There will be a doubt-clearing session for Chapter 3 geometry on Friday at 3:30 PM.",
                audience: "Class 5 - B",
                postedBy: "Teacher - Math",
                announcementDate: "2026-08-19",
                announcementTime: "02:15 PM",
                status: "Active"
            }
        ];
    }
    renderAnnouncements();
}

function switchTab(tab) {
    currentFilterTab = tab;
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    
    if (tab === "all") document.getElementById("tabAll").classList.add("active");
    if (tab === "admin") document.getElementById("tabAdmin").classList.add("active");
    if (tab === "teacher") document.getElementById("tabTeacher").classList.add("active");

    renderAnnouncements();
}

function handleSearch() {
    renderAnnouncements();
}

function renderAnnouncements() {
    const container = document.getElementById("announcementsList");
    const query = document.getElementById("searchInput").value.trim().toLowerCase();

    const filtered = allAnnouncements.filter(item => {
        const postedBy = (item.postedBy || item.posted_by || "").toLowerCase();
        const isAdmin = postedBy.includes("admin") || postedBy === "principal";
        const isTeacher = !isAdmin;

        let tabMatch = true;
        if (currentFilterTab === "admin") tabMatch = isAdmin;
        if (currentFilterTab === "teacher") tabMatch = isTeacher;

        const title = (item.title || "").toLowerCase();
        const desc = (item.description || "").toLowerCase();
        const searchMatch = !query || title.includes(query) || desc.includes(query);

        return tabMatch && searchMatch;
    });

    container.innerHTML = "";

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-bullhorn" style="font-size: 28px; margin-bottom: 8px; display: block;"></i>
                No circulars or announcements found.
            </div>
        `;
        return;
    }

    filtered.forEach(ann => {
        const postedBy = ann.postedBy || ann.posted_by || "Admin";
        const isAdmin = postedBy.toLowerCase().includes("admin");
        const title = ann.title || "Untitled Announcement";
        const desc = ann.description || "";
        const audience = ann.audience || "General";
        const date = ann.announcementDate || ann.announcement_date || "Recent";
        const time = ann.announcementTime || ann.announcement_time || "";

        const card = document.createElement("div");
        card.className = `ann-card ${isAdmin ? 'admin-card' : ''}`;
        card.innerHTML = `
            <div class="ann-header">
                <div class="ann-badges">
                    <span class="badge-source ${isAdmin ? 'badge-admin' : 'badge-teacher'}">
                        ${isAdmin ? '<i class="fa-solid fa-shield-halved"></i> From Admin' : '<i class="fa-solid fa-chalkboard-user"></i> From Teacher'}
                    </span>
                    <span class="badge-target"><i class="fa-solid fa-users"></i> ${audience}</span>
                </div>
                <span class="ann-date"><i class="fa-regular fa-clock"></i> ${date} ${time}</span>
            </div>
            <h3>${title}</h3>
            <p class="ann-content">${desc}</p>
            <div class="ann-footer">
                <div class="author-info">
                    <i class="fa-solid fa-user-pen"></i> Posted by: <strong>${postedBy}</strong>
                </div>
                <span style="color: #10b981; font-weight:600;"><i class="fa-solid fa-circle-check"></i> Active</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function handleAudienceTypeChange() {
    const audienceType = document.getElementById("targetAudience").value;
    const classGroup = document.getElementById("classSelectGroup");
    if (audienceType === "Specific Class") {
        classGroup.style.display = "flex";
    } else {
        classGroup.style.display = "none";
    }
}

// Post New Announcement to Database
async function handlePostAnnouncement(e) {
    e.preventDefault();

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const audienceType = document.getElementById("targetAudience").value;
    const finalAudience = audienceType === "Specific Class" 
        ? document.getElementById("targetClassSection").value 
        : audienceType;

    const payload = {
        title: document.getElementById("annTitle").value,
        description: document.getElementById("annDescription").value,
        audience: finalAudience,
        postedBy: `Teacher - ${teacherName}`,
        announcementDate: dateStr,
        announcementTime: timeStr,
        status: "Active"
    };

    try {
        const res = await fetch(`${API_BASE}/announcements`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Announcement published successfully!");
            closeNewAnnouncementModal();
            loadAnnouncements();
        } else {
            allAnnouncements.unshift({ ...payload, announcementId: Date.now() });
            closeNewAnnouncementModal();
            renderAnnouncements();
        }
    } catch (err) {
        allAnnouncements.unshift({ ...payload, announcementId: Date.now() });
        closeNewAnnouncementModal();
        renderAnnouncements();
    }
}

function openNewAnnouncementModal() {
    document.getElementById("announcementModal").classList.add("active");
}

function closeNewAnnouncementModal() {
    document.getElementById("announcementModal").classList.remove("active");
    document.getElementById("announcementForm").reset();
    document.getElementById("classSelectGroup").style.display = "none";
}

window.openNewAnnouncementModal = openNewAnnouncementModal;
window.closeNewAnnouncementModal = closeNewAnnouncementModal;
window.handlePostAnnouncement = handlePostAnnouncement;
window.handleAudienceTypeChange = handleAudienceTypeChange;
window.switchTab = switchTab;
window.handleSearch = handleSearch;