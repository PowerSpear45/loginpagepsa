/**
 * Teacher Leaves Module
 * Power Public School ERP
 */

const API_BASE = "https://loginpagepsabackend.onrender.com/api";
const teacherId = localStorage.getItem("teacherId") || "1";

let teacherClasses = [];
let allLeaveRequests = [];
let studentsMap = {};
let activeLeaveId = null;

document.addEventListener("DOMContentLoaded", () => {
    updateTodayDate();
    loadTeacherInfo();
    loadClasses();
    loadStudents();
    loadLeaves();
    initFilters();
});

function updateTodayDate() {
    const now = new Date();
    const dateEl = document.getElementById("todayDate");
    const dayEl = document.getElementById("todayDay");
    if (dateEl) dateEl.textContent = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    if (dayEl) dayEl.textContent = now.toLocaleDateString("en-IN", { weekday: "long" });
}

async function loadTeacherInfo() {
    try {
        const res = await fetch(`${API_BASE}/teachers/${teacherId}`);
        if (res.ok) {
            const data = await res.json();
            const nameEl = document.getElementById("teacherNameDisplay");
            const picEl = document.getElementById("teacherProfilePic");
            const fullName = data.fullName || data.full_name || "Abinash Kumar";

            if (nameEl) nameEl.textContent = fullName;
            if (picElem) {
                picElem.src = data.photoUrl || data.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e8f0fe&color=1f3f6d`;
            }
        }
    } catch (e) {
        console.warn("Could not load teacher profile header:", e);
    }
}

function initFilters() {
    document.getElementById("classFilter")?.addEventListener("change", renderTable);
    document.getElementById("sectionFilter")?.addEventListener("change", renderTable);
    document.getElementById("statusFilter")?.addEventListener("change", renderTable);
}

async function loadClasses() {
    try {
        const res = await fetch(`${API_BASE}/teachers/${teacherId}/classes`);
        if (res.ok) teacherClasses = await res.json();
    } catch (e) {
        console.warn("Classes fallback active:", e);
    }

    if (!teacherClasses || teacherClasses.length === 0) {
        teacherClasses = [
            { className: "5", section: "A" },
            { className: "5", section: "B" },
            { className: "6", section: "A" }
        ];
    }

    const classFilter = document.getElementById("classFilter");
    const sectionFilter = document.getElementById("sectionFilter");
    if (!classFilter || !sectionFilter) return;

    const uniqueClasses = [...new Set(teacherClasses.map(c => String(c.className || c.class_name)))];
    const uniqueSections = [...new Set(teacherClasses.map(c => String(c.section)))];

    uniqueClasses.forEach(c => classFilter.insertAdjacentHTML("beforeend", `<option value="${c}">Class ${c}</option>`));
    uniqueSections.forEach(s => sectionFilter.insertAdjacentHTML("beforeend", `<option value="${s}">Section ${s}</option>`));
}

async function loadStudents() {
    try {
        const res = await fetch(`${API_BASE}/students`);
        if (res.ok) {
            const list = await res.json();
            list.forEach(s => {
                const id = Number(s.studentId || s.student_id || s.id);
                studentsMap[id] = s;
            });
        }
    } catch (e) {
        console.warn("Using default student mapping fallback");
    }
}

async function loadLeaves() {
    try {
        const res = await fetch(`${API_BASE}/leaves`);
        if (res.ok) {
            allLeaveRequests = await res.json();
        }
    } catch (err) {
        console.warn("Using sample leave applications:", err);
        allLeaveRequests = [
            {
                leaveId: 1,
                studentId: 101,
                className: "5",
                section: "B",
                leaveType: "Sick Leave",
                fromDate: "2026-08-27",
                toDate: "2026-08-28",
                totalDays: 2,
                reason: "Suffering from fever and cold. Doctor advised two days bed rest.",
                status: "Pending"
            },
            {
                leaveId: 2,
                studentId: 102,
                className: "5",
                section: "B",
                leaveType: "Family Function",
                fromDate: "2026-08-29",
                toDate: "2026-08-29",
                totalDays: 1,
                reason: "Attending cousin's wedding ceremony out of station.",
                status: "Approved"
            }
        ];
    }
    renderTable();
}

function renderTable() {
    const classVal = document.getElementById("classFilter")?.value || "";
    const secVal = document.getElementById("sectionFilter")?.value || "";
    const statusVal = document.getElementById("statusFilter")?.value || "";

    const filtered = allLeaveRequests.filter(req => {
        const cMatch = !classVal || String(req.className) === classVal;
        const sMatch = !secVal || String(req.section) === secVal;
        const stMatch = !statusVal || req.status === statusVal;
        return cMatch && sMatch && stMatch;
    });

    const tbody = document.getElementById("leaveTableBody");
    const totalEl = document.getElementById("totalCountBadge");
    if (totalEl) totalEl.textContent = `${filtered.length} Total`;
    if (!tbody) return;

    tbody.innerHTML = "";
    updateKpis();

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-message">
                    <i class="fa-solid fa-envelope-open"></i>
                    No leave requests found matching your filters.
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach((req, idx) => {
        const student = studentsMap[req.studentId] || {};
        const fullName = student.fullName || student.full_name || student.name || `Student #${req.studentId}`;
        const rollNo = student.rollNo || student.roll_no || "-";
        const statusClass = (req.status || "pending").toLowerCase();

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="text-align: center;">${idx + 1}</td>
            <td><strong>${rollNo}</strong></td>
            <td style="font-weight: 600;">${fullName}</td>
            <td style="text-align: center;"><span class="badge-tag">Class ${req.className} - ${req.section}</span></td>
            <td>${req.leaveType}</td>
            <td>${req.fromDate} to ${req.toDate}</td>
            <td style="text-align: center;">${req.totalDays || 1} day(s)</td>
            <td style="text-align: center;">
                <span class="status-badge ${statusClass}">
                    ${req.status === 'Approved' ? '<i class="fa-solid fa-circle-check"></i>' : req.status === 'Declined' ? '<i class="fa-solid fa-circle-xmark"></i>' : '<i class="fa-solid fa-clock"></i>'}
                    ${req.status}
                </span>
            </td>
            <td style="text-align: center;">
                <button class="btn-review" onclick="openLeaveModal(${req.leaveId})">
                    <i class="fa-solid fa-eye"></i> Review
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateKpis() {
    let p = 0, a = 0, d = 0;
    allLeaveRequests.forEach(r => {
        if (r.status === "Approved") a++;
        else if (r.status === "Declined") d++;
        else p++;
    });

    const pEl = document.getElementById("kpiPendingCount");
    const aEl = document.getElementById("kpiApprovedCount");
    const dEl = document.getElementById("kpiDeclinedCount");

    if (pEl) pEl.textContent = p;
    if (aEl) aEl.textContent = a;
    if (dEl) dEl.textContent = d;
}

function openLeaveModal(leaveId) {
    activeLeaveId = leaveId;
    const req = allLeaveRequests.find(r => r.leaveId === leaveId);
    if (!req) return;

    const student = studentsMap[req.studentId] || {};
    const fullName = student.fullName || student.full_name || student.name || `Student #${req.studentId}`;
    const rollNo = student.rollNo || student.roll_no || "-";

    document.getElementById("modalStudentHeader").textContent = `${fullName} (${rollNo}) - Class ${req.className} [${req.section}]`;
    document.getElementById("modalLeaveType").textContent = req.leaveType;
    document.getElementById("modalDuration").textContent = `${req.fromDate} to ${req.toDate} (${req.totalDays || 1} days)`;
    document.getElementById("modalReason").textContent = req.reason || "No reason specified.";
    document.getElementById("teacherRemarksInput").value = req.teacherRemarks || "";

    document.getElementById("leaveDetailModal").classList.add("active");
}

function closeLeaveModal() {
    document.getElementById("leaveDetailModal").classList.remove("active");
    activeLeaveId = null;
}

async function submitDecision(newStatus) {
    if (!activeLeaveId) return;

    const req = allLeaveRequests.find(r => r.leaveId === activeLeaveId);
    if (req) {
        req.status = newStatus;
        req.teacherRemarks = document.getElementById("teacherRemarksInput").value.trim();

        try {
            await fetch(`${API_BASE}/leaves/${activeLeaveId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(req)
            });
        } catch (e) {
            console.warn("Updated leave locally:", e);
        }

        alert(`Leave request has been marked as ${newStatus}.`);
        closeLeaveModal();
        renderTable();
    }
}

window.openLeaveModal = openLeaveModal;
window.closeLeaveModal = closeLeaveModal;
window.submitDecision = submitDecision;