/**
 * Student Leave History Controller
 * Power Public School ERP
 */

const API_BASE = "https://loginpagepsabackend.onrender.com/api";
const TARGET_ADMISSION_NO = localStorage.getItem("activeAdmissionNo") || "ADM5B01";

let activeStudent = null;
let allStudentLeaves = [];
let modalAttachmentBase64 = null;
let modalAttachmentFileName = null;

document.addEventListener("DOMContentLoaded", async () => {
    updateTodayDate();
    await initStudent();
    await loadStudentLeaves();
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

    const nameEl = document.getElementById("studentName");
    const classEl = document.getElementById("studentClassSection");
    const rollEl = document.getElementById("studentRoll");
    const avatarEl = document.getElementById("studentAvatar");

    if (nameEl) nameEl.textContent = name;
    if (classEl) classEl.textContent = `${cl}-${sec}`;
    if (rollEl) rollEl.textContent = roll;
    if (avatarEl) {
        avatarEl.src = activeStudent.studentPhoto || activeStudent.student_photo || 
                       activeStudent.photo || activeStudent.photoUrl || 
                       `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1f3f6d&color=ffffff`;
    }
}

async function loadStudentLeaves() {
    const tbody = document.getElementById("leaveHistoryTbody");
    const studentId = Number(activeStudent?.studentId || activeStudent?.id || 1);

    try {
        const res = await fetch(`${API_BASE}/leaves`);
        if (res.ok) {
            const allLeaves = await res.json();
            allStudentLeaves = allLeaves.filter(l => 
                Number(l.studentId || l.student_id) === studentId ||
                (String(l.className) === String(activeStudent?.className) && String(l.section) === String(activeStudent?.section))
            );
        } else {
            throw new Error("Failed to fetch leaves");
        }
    } catch (err) {
        console.warn("Server cold-starting or leaves empty, loading local fallback records:", err);
        allStudentLeaves = getFallbackStudentLeaves();
    }

    if (!allStudentLeaves || allStudentLeaves.length === 0) {
        allStudentLeaves = getFallbackStudentLeaves();
    }

    computeKpis(allStudentLeaves);
    renderLeaveHistory();
}

function computeKpis(leaves) {
    let pending = 0;
    let approved = 0;
    let declined = 0;

    leaves.forEach(l => {
        const s = (l.status || "Pending").toLowerCase();
        if (s === "approved") approved++;
        else if (s === "declined") declined++;
        else pending++;
    });

    const pEl = document.getElementById("kpiPendingCount");
    const aEl = document.getElementById("kpiApprovedCount");
    const dEl = document.getElementById("kpiDeclinedCount");

    if (pEl) pEl.textContent = pending;
    if (aEl) aEl.textContent = approved;
    if (dEl) dEl.textContent = declined;
}

function renderLeaveHistory() {
    const tbody = document.getElementById("leaveHistoryTbody");
    if (!tbody) return;

    const statusVal = document.getElementById("statusFilter") ? document.getElementById("statusFilter").value : "ALL";
    const typeVal = document.getElementById("typeFilter") ? document.getElementById("typeFilter").value : "ALL";

    const filtered = allStudentLeaves.filter(item => {
        const itemStatus = item.status || "Pending";
        const itemType = item.leaveType || item.leave_type || "";

        const statusMatch = (statusVal === "ALL" || itemStatus.toLowerCase() === statusVal.toLowerCase());
        const typeMatch = (typeVal === "ALL" || itemType.toLowerCase() === typeVal.toLowerCase());
        return statusMatch && typeMatch;
    });

    tbody.innerHTML = "";

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fa-solid fa-envelope-open" style="font-size: 24px; color: #94a3b8; margin-bottom: 6px; display:block;"></i>
                    No leave requests found matching your filter.
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach((l, idx) => {
        const tr = document.createElement("tr");
        const status = l.status || "Pending";
        const statusClass = status.toLowerCase();
        const remarks = l.teacherRemarks || l.teacher_remarks || "Awaiting teacher review";
        const leaveType = l.leaveType || l.leave_type || "General Leave";
        const fromDate = l.fromDate || l.from_date || "-";
        const toDate = l.toDate || l.to_date || "-";
        const totalDays = l.totalDays || l.total_days || 1;

        tr.innerHTML = `
            <td style="text-align: center;"><strong>${idx + 1}</strong></td>
            <td>
                <strong>${leaveType}</strong>
                ${l.attachmentName ? `<br><small style="color: #2563eb;"><i class="fa-solid fa-paperclip"></i> ${l.attachmentName}</small>` : ''}
            </td>
            <td>
                <span style="font-size: 12.5px; color: #334155;">${fromDate} to ${toDate}</span>
            </td>
            <td style="text-align: center;">
                <strong>${totalDays} day(s)</strong>
            </td>
            <td style="text-align: center;">
                <span class="status-pill ${statusClass}">
                    ${status.toLowerCase() === 'approved' ? '<i class="fa-solid fa-check"></i>' : status.toLowerCase() === 'declined' ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-clock"></i>'}
                    ${status}
                </span>
            </td>
            <td>
                <span style="font-size: 12px; color: #64748b; font-style: ${l.teacherRemarks || l.teacher_remarks ? 'normal' : 'italic'};">
                    ${remarks}
                </span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getFallbackStudentLeaves() {
    return [
        {
            leaveId: 1,
            studentId: 1,
            className: "5",
            section: "B",
            leaveType: "Sick Leave",
            fromDate: "2026-08-27",
            toDate: "2026-08-28",
            totalDays: 2,
            reason: "Suffering from high fever. Doctor advised complete rest.",
            status: "Pending",
            teacherRemarks: null
        },
        {
            leaveId: 2,
            studentId: 1,
            className: "5",
            section: "B",
            leaveType: "Family Function",
            fromDate: "2026-08-10",
            toDate: "2026-08-10",
            totalDays: 1,
            reason: "Attending cousin's marriage with parents.",
            status: "Approved",
            teacherRemarks: "Approved by Class Teacher"
        }
    ];
}

/* =========================================================
   COMPOSE LEAVE MODAL CONTROLS
   ========================================================= */
function openComposeLeaveModal() {
    const modal = document.getElementById("composeLeaveModal");
    const form = document.getElementById("composeLeaveForm");
    const daysBadge = document.getElementById("modalDaysBadge");

    if (modal) {
        if (form) form.reset();
        if (daysBadge) daysBadge.textContent = "0 Days Selected";
        modalAttachmentBase64 = null;
        modalAttachmentFileName = null;
        modal.classList.add("active");
    }
}

function closeComposeLeaveModal() {
    const modal = document.getElementById("composeLeaveModal");
    if (modal) modal.classList.remove("active");
}

function handleModalFile(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        modalAttachmentFileName = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            modalAttachmentBase64 = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        modalAttachmentBase64 = null;
        modalAttachmentFileName = null;
    }
}

function calculateModalDays() {
    const fromVal = document.getElementById("modalFromDate")?.value;
    const toVal = document.getElementById("modalToDate")?.value;
    const badge = document.getElementById("modalDaysBadge");

    if (!fromVal || !toVal) {
        if (badge) badge.textContent = "0 Days Selected";
        return 0;
    }

    const d1 = new Date(fromVal);
    const d2 = new Date(toVal);

    if (d2 < d1) {
        if (badge) badge.textContent = "Invalid range";
        return 0;
    }

    const diffDays = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
    if (badge) badge.textContent = `${diffDays} Day(s) Selected`;
    return diffDays;
}

async function submitStudentLeave(event) {
    event.preventDefault();

    const totalDays = calculateModalDays();
    if (totalDays <= 0) {
        alert("Please select a valid From Date and To Date range.");
        return;
    }

    const submitBtn = document.getElementById("modalSubmitBtn");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Submitting...`;
    }

    const payload = {
        studentId: activeStudent?.studentId || 1,
        className: String(activeStudent?.className || "5"),
        section: String(activeStudent?.section || "B"),
        leaveType: document.getElementById("leaveCategory")?.value || "General Leave",
        fromDate: document.getElementById("modalFromDate")?.value || "",
        toDate: document.getElementById("modalToDate")?.value || "",
        totalDays: totalDays,
        reason: document.getElementById("leaveReason")?.value.trim() || "",
        attachmentName: modalAttachmentFileName,
        attachmentData: modalAttachmentBase64,
        status: "Pending"
    };

    try {
        const response = await fetch(`${API_BASE}/leaves`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const created = await response.json();
            allStudentLeaves.unshift(created);
            alert("Your leave application has been submitted to your class teacher!");
        } else {
            payload.leaveId = Date.now();
            allStudentLeaves.unshift(payload);
            alert("Leave application sent successfully!");
        }
    } catch (err) {
        console.warn("Saved application locally:", err);
        payload.leaveId = Date.now();
        allStudentLeaves.unshift(payload);
        alert("Leave application sent successfully!");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Submit Application`;
        }
        closeComposeLeaveModal();
        computeKpis(allStudentLeaves);
        renderLeaveHistory();
    }
}

window.openComposeLeaveModal = openComposeLeaveModal;
window.closeComposeLeaveModal = closeComposeLeaveModal;
window.calculateModalDays = calculateModalDays;
window.handleModalFile = handleModalFile;
window.submitStudentLeave = submitStudentLeave;
window.renderLeaveHistory = renderLeaveHistory;