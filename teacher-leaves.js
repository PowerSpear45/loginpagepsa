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
            const nameEl = document.getElementById("teacherHeaderName");
            if (nameEl) nameEl.textContent = data.fullName || data.full_name || "Teacher";
        }
    } catch (e) {
        console.warn(e);
    }
}

function initFilters() {
    document.getElementById("classFilter").addEventListener("change", renderTable);
    document.getElementById("sectionFilter").addEventListener("change", renderTable);
    document.getElementById("statusFilter").addEventListener("change", renderTable);
}

// Load classes assigned to teacher
async function loadClasses() {
    try {
        const res = await fetch(`${API_BASE}/teachers/${teacherId}/classes`);
        if (res.ok) teacherClasses = await res.json();
    } catch (e) {
        console.warn(e);
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
    const uniqueClasses = [...new Set(teacherClasses.map(c => c.className || c.class_name))];
    const uniqueSections = [...new Set(teacherClasses.map(c => c.section))];

    uniqueClasses.forEach(c => classFilter.insertAdjacentHTML("beforeend", `<option value="${c}">Class ${c}</option>`));
    uniqueSections.forEach(s => sectionFilter.insertAdjacentHTML("beforeend", `<option value="${s}">Section ${s}</option>`));
}

// Load student dictionary for mapping names
async function loadStudents() {
    try {
        const res = await fetch(`${API_BASE}/students`);
        if (res.ok) {
            const list = await res.json();
            list.forEach(s => {
                const id = s.studentId || s.student_id;
                studentsMap[id] = s;
            });
        }
    } catch (e) {
        console.warn("Using default student mapping");
    }
}

// Fetch leaves from database
async function loadLeaves() {
    try {
        const res = await fetch(`${API_BASE}/leaves`);
        if (res.ok) {
            allLeaveRequests = await res.json();
        }
    } catch (err) {
        console.warn("Using sample leave applications");
        allLeaveRequests = [
            {
                leaveId: 1,
                studentId: 1,
                className: "5",
                section: "B",
                leaveType: "Sick Leave",
                fromDate: "2026-08-22",
                toDate: "2026-08-23",
                totalDays: 2,
                reason: "Suffering from high fever and severe cold. Doctor recommended complete rest.",
                status: "Pending"
            },
            {
                leaveId: 2,
                studentId: 2,
                className: "5",
                section: "B",
                leaveType: "Family Function",
                fromDate: "2026-08-25",
                toDate: "2026-08-25",
                totalDays: 1,
                reason: "Attending elder brother's marriage ceremony out of town.",
                status: "Pending"
            }
        ];
    }
    renderTable();
}

function renderTable() {
    const classVal = document.getElementById("classFilter").value;
    const secVal = document.getElementById("sectionFilter").value;
    const statusVal = document.getElementById("statusFilter").value;

    const filtered = allLeaveRequests.filter(req => {
        return (!classVal || req.className === classVal) &&
               (!secVal || req.section === secVal) &&
               (!statusVal || req.status === statusVal);
    });

    const tbody = document.getElementById("leaveTableBody");
    const totalEl = document.getElementById("totalCount");
    if (totalEl) totalEl.textContent = filtered.length;
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
        const fullName = student.fullName || student.full_name || `Student #${req.studentId}`;
        const rollNo = student.rollNo || student.roll_no || "-";
        const statusClass = req.status.toLowerCase();

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="text-align: center;">${idx + 1}</td>
            <td><strong>${rollNo}</strong></td>
            <td style="font-weight: 600;">${fullName}</td>
            <td style="text-align: center;"><span class="badge-tag">Class ${req.className} - ${req.section}</span></td>
            <td>${req.leaveType}</td>
            <td>${req.fromDate} to ${req.toDate}</td>
            <td style="text-align: center;">${req.totalDays} day(s)</td>
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

    document.getElementById("kpiPendingCount").textContent = p;
    document.getElementById("kpiApprovedCount").textContent = a;
    document.getElementById("kpiDeclinedCount").textContent = d;
}

// Open Leave Review Modal
function openLeaveModal(leaveId) {
    window.location.href = `teacher-leave-details.html?id=${leaveId}`;
}

    

function downloadFile(base64Data, fileName) {
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

window.openLeaveModal = openLeaveModal;
window.closeLeaveModal = closeLeaveModal;
window.submitDecision = submitDecision;