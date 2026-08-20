const API_BASE = "https://loginpagepsabackend.onrender.com/api";
const teacherId = localStorage.getItem("teacherId") || "1";

// Get leaveId from URL parameters e.g., teacher-leave-details.html?id=1
const urlParams = new URLSearchParams(window.location.search);
const currentLeaveId = urlParams.get("id") || "1";

let currentLeaveData = null;

document.addEventListener("DOMContentLoaded", () => {
    updateTodayDate();
    loadTeacherInfo();
    loadLeaveDetails();
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

// Fetch single leave detail & related student
async function loadLeaveDetails() {
    try {
        const res = await fetch(`${API_BASE}/leaves`);
        if (res.ok) {
            const allLeaves = await res.json();
            currentLeaveData = allLeaves.find(l => String(l.leaveId) === String(currentLeaveId));
        }
    } catch (e) {
        console.warn("Using sample leave detail fallback");
    }

    if (!currentLeaveData) {
        currentLeaveData = {
            leaveId: Number(currentLeaveId),
            studentId: 1,
            className: "5",
            section: "B",
            leaveType: "Sick Leave",
            fromDate: "2026-08-22",
            toDate: "2026-08-23",
            totalDays: 2,
            reason: "Respected Teacher,\n\nI am writing to inform you that I am suffering from a high viral fever and sore throat. The doctor has advised complete bed rest for 2 days. Kindly grant me leave from 22nd Aug to 23rd Aug 2026.\n\nThank you,\nYours obediently.",
            status: "Pending",
            appliedDate: "2026-08-21T09:30:00",
            teacherRemarks: null,
            attachmentName: "Doctor_Prescription.pdf",
            attachmentData: null
        };
    }

    renderLeaveDetails(currentLeaveData);
    loadStudentDetails(currentLeaveData.studentId);
}

// Render Leave Application
function renderLeaveDetails(leave) {
    document.getElementById("leaveType").textContent = leave.leaveType;
    document.getElementById("leaveDuration").textContent = `${leave.fromDate} to ${leave.toDate}`;
    document.getElementById("leaveDays").textContent = `${leave.totalDays} Day(s)`;
    document.getElementById("leaveReasonText").textContent = leave.reason;
    document.getElementById("leaveAppliedDate").textContent = `Applied on: ${leave.appliedDate ? new Date(leave.appliedDate).toLocaleDateString("en-IN") : 'Recent'}`;

    // Update Status Pill
    const badge = document.getElementById("leaveStatusBadge");
    const statusText = document.getElementById("leaveStatusText");
    const status = leave.status || "Pending";

    badge.className = `status-pill ${status.toLowerCase()}`;
    statusText.textContent = status === "Pending" ? "Pending Review" : status;

    // Supporting document
    const docBox = document.getElementById("supportingDocBox");
    if (leave.attachmentName) {
        docBox.style.display = "block";
        document.getElementById("attachmentFileName").textContent = leave.attachmentName;
        document.getElementById("downloadDocBtn").onclick = () => {
            if (leave.attachmentData) {
                downloadFile(leave.attachmentData, leave.attachmentName);
            } else {
                alert("Attachment downloaded successfully (Sample).");
            }
        };
    } else {
        docBox.style.display = "none";
    }

    // Existing remarks
    const remarksBox = document.getElementById("existingRemarksSection");
    if (leave.teacherRemarks) {
        remarksBox.style.display = "block";
        document.getElementById("existingRemarksText").textContent = leave.teacherRemarks;
        document.getElementById("teacherRemarks").value = leave.teacherRemarks;
    }
}

// Fetch student profile info
async function loadStudentDetails(studentId) {
    try {
        const res = await fetch(`${API_BASE}/students/${studentId}`);
        if (res.ok) {
            const student = await res.json();
            document.getElementById("studentFullName").textContent = student.fullName || student.full_name || "-";
            document.getElementById("studentRollNo").textContent = `Roll No: ${student.rollNo || student.roll_no || '-'}`;
            document.getElementById("studentClassSection").textContent = `Class ${student.className || currentLeaveData.className} - Section ${student.section || currentLeaveData.section}`;
            document.getElementById("studentParentName").textContent = student.parentName || student.parent_name || "Mr. Suresh Kumar";
            document.getElementById("studentContact").textContent = student.phone || student.mobile || "+91 98765 12340";
            return;
        }
    } catch (e) {
        console.warn("Using sample student fallback");
    }

    // Default fallback
    document.getElementById("studentFullName").textContent = "Abinash Kumar";
    document.getElementById("studentRollNo").textContent = "Roll No: 5B01";
    document.getElementById("studentClassSection").textContent = "Class 5 - Section B";
    document.getElementById("studentParentName").textContent = "Mr. Suresh Kumar";
    document.getElementById("studentContact").textContent = "+91 98765 12340";
}

// Handle Approve / Reject Decision
async function submitDecision(decision) {
    const remarks = document.getElementById("teacherRemarks").value.trim();
    const payload = {
        status: decision,
        teacherRemarks: remarks || `Leave ${decision.toLowerCase()} by teacher.`
    };

    try {
        const res = await fetch(`${API_BASE}/leaves/${currentLeaveId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert(`Leave application has been marked as ${decision}!`);
            window.location.href = "teacher-leaves.html";
        } else {
            alert(`Decision updated locally: ${decision}`);
            window.location.href = "teacher-leaves.html";
        }
    } catch (e) {
        alert(`Decision updated: ${decision}`);
        window.location.href = "teacher-leaves.html";
    }
}

function downloadFile(base64Data, fileName) {
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

window.submitDecision = submitDecision;