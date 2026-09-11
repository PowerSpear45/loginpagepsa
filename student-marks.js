/**
 * Student Examination Marks & Report Card Controller
 * Power Public School ERP - Pure Database Mode
 */

const API_BASE = "https://loginpagepsabackend.onrender.com/api";
const TARGET_ADMISSION_NO = localStorage.getItem("activeAdmissionNo") || "ADM5B01";

let activeStudent = null;
let allStudentMarks = [];

document.addEventListener("DOMContentLoaded", async () => {
    updateTodayDate();
    await initStudent();
    await loadStudentMarksFromDB();
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
                (s.admission_no && s.admission_no.toUpperCase() === TARGET_ADMISSION_NO) ||
                Number(s.studentId || s.student_id) === 143
            );
        }
    } catch (e) {
        console.warn("Could not load student profile:", e);
    }

    if (!activeStudent) {
        activeStudent = {
            studentId: 143,
            fullName: "V.S.Sakthivel",
            className: "5",
            section: "B",
            rollNo: "20265001",
            admissionNo: "ADM5B01"
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

async function loadStudentMarksFromDB() {
    const sId = Number(activeStudent?.studentId || activeStudent?.student_id || 143);
    let matchedRecords = [];

    const endpoints = [
        `${API_BASE}/teacher/marks`,
        `${API_BASE}/marks`,
        `${API_BASE}/marks/student/${sId}`
    ];

    for (const url of endpoints) {
        try {
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const filtered = data.filter(m => {
                        const markStudentId = Number(
                            m.studentId || 
                            m.student_id || 
                            (m.student && (m.student.studentId || m.student.student_id || m.student.id))
                        );
                        return markStudentId === sId;
                    });

                    if (filtered.length > 0) {
                        matchedRecords = filtered;
                        break;
                    }
                }
            }
        } catch (e) {
            console.warn(`Query to ${url} failed:`, e);
        }
    }

    allStudentMarks = matchedRecords;
    renderMarksTable();
}

function computeKpis(filteredMarks) {
    if (!filteredMarks || filteredMarks.length === 0) {
        document.getElementById("kpiPercentage").textContent = "0%";
        document.getElementById("kpiTotalMarks").textContent = "0 / 0";
        document.getElementById("kpiOverallGrade").textContent = "--";
        const label = document.getElementById("kpiPerformanceLabel");
        if (label) label.textContent = "No Records Found";
        return;
    }

    let totalObtained = 0;
    let totalMax = 0;

    filteredMarks.forEach(m => {
        const obtained = Number(m.marksObtained ?? m.marks_obtained ?? m.marks ?? 0);
        const max = Number(m.maxMarks ?? m.max_marks ?? 100);
        totalObtained += obtained;
        totalMax += max;
    });

    const percent = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    const grade = calculateGrade(percent);

    document.getElementById("kpiPercentage").textContent = `${percent}%`;
    document.getElementById("kpiTotalMarks").textContent = `${totalObtained} / ${totalMax}`;
    document.getElementById("kpiOverallGrade").textContent = grade;

    const labelEl = document.getElementById("kpiPerformanceLabel");
    if (labelEl) {
        if (percent >= 85) labelEl.textContent = "Distinction Level";
        else if (percent >= 60) labelEl.textContent = "First Class Level";
        else labelEl.textContent = "Satisfactory Progress";
    }
}

function calculateGrade(percentage) {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 35) return "D";
    return "F";
}

function renderMarksTable() {
    const tbody = document.getElementById("marksTableBody");
    if (!tbody) return;

    const examFilter = document.getElementById("examFilter")?.value || "All";
    const subjectFilter = document.getElementById("subjectFilter")?.value || "All";

    const filtered = allStudentMarks.filter(m => {
        const exam = String(m.examType || m.exam_type || m.examName || "");
        const sub = String(m.subject || "");

        const examMatch = (examFilter === "All" || exam.toLowerCase() === examFilter.toLowerCase());
        const subMatch = (subjectFilter === "All" || sub.toLowerCase() === subjectFilter.toLowerCase());
        return examMatch && subMatch;
    });

    computeKpis(filtered);
    tbody.innerHTML = "";

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state" style="text-align: center; padding: 35px; color: #64748b;">
                    <i class="fa-solid fa-folder-open" style="font-size: 24px; color: #94a3b8; margin-bottom: 8px; display:block;"></i>
                    No examination records found in database for this student under the selected filter.
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach((m, idx) => {
        const subject = m.subject || "General";
        const exam = m.examType || m.exam_type || m.examName || "Quarterly Exam";
        const maxMarks = Number(m.maxMarks ?? m.max_marks ?? 100);
        const marks = Number(m.marksObtained ?? m.marks_obtained ?? m.marks ?? 0);
        const percentage = Math.round((marks / maxMarks) * 100);
        const grade = calculateGrade(percentage);
        const isPass = percentage >= 35;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="text-align: center;"><strong>${idx + 1}</strong></td>
            <td><strong>${subject}</strong></td>
            <td><span style="color: #475569; font-size: 12px;">${exam}</span></td>
            <td style="text-align: center;">${maxMarks}</td>
            <td style="text-align: center;"><strong>${marks}</strong></td>
            <td style="text-align: center;">${percentage}%</td>
            <td style="text-align: center;"><span class="grade-badge">${grade}</span></td>
            <td style="text-align: center;">
                <span class="status-badge ${isPass ? 'status-pass' : 'status-fail'}">
                    ${isPass ? '<i class="fa-solid fa-check"></i> Pass' : '<i class="fa-solid fa-xmark"></i> Fail'}
                </span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function downloadReportCardPDF() {
    if (!allStudentMarks || allStudentMarks.length === 0) {
        alert("No examination marks available to generate a report card.");
        return;
    }

    const studentName = activeStudent?.fullName || "V.S.Sakthivel";
    const admNo = activeStudent?.admissionNo || "ADM5B01";
    const rollNo = activeStudent?.rollNo || "20265001";
    const classSec = `Class ${activeStudent?.className || '5'} - ${activeStudent?.section || 'B'}`;
    const reportNo = `REP-PPS-${Date.now().toString().slice(-6)}`;
    const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const selectedExam = document.getElementById("examFilter")?.value || "All";
    const examHeading = selectedExam === "All" ? "Academic Progress Report" : selectedExam;

    const filtered = allStudentMarks.filter(m => {
        const exam = String(m.examType || m.exam_type || m.examName || "");
        return (selectedExam === "All" || exam.toLowerCase() === selectedExam.toLowerCase());
    });

    const marksToPrint = filtered.length > 0 ? filtered : allStudentMarks;

    let totalObt = 0;
    let totalMax = 0;
    let rowsHtml = "";

    marksToPrint.forEach((m, idx) => {
        const sub = m.subject || "General";
        const obt = Number(m.marksObtained ?? m.marks_obtained ?? m.marks ?? 0);
        const max = Number(m.maxMarks ?? m.max_marks ?? 100);
        const pct = Math.round((obt / max) * 100);
        const gr = calculateGrade(pct);
        const st = pct >= 35 ? "PASS" : "FAIL";

        totalObt += obt;
        totalMax += max;

        rowsHtml += `
            <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td><strong>${sub}</strong></td>
                <td style="text-align: center;">${max}</td>
                <td style="text-align: center; font-weight: bold;">${obt}</td>
                <td style="text-align: center;">${pct}%</td>
                <td style="text-align: center; font-weight: bold;">${gr}</td>
                <td style="text-align: center; color: ${pct >= 35 ? '#15803d' : '#b91c1c'}; font-weight: bold;">${st}</td>
            </tr>
        `;
    });

    const overallPct = totalMax > 0 ? Math.round((totalObt / totalMax) * 100) : 0;
    const overallGrade = calculateGrade(overallPct);

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Progress Report Card - ${studentName}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; }
        body { padding: 40px; background: #fff; color: #1e293b; }
        .report-card { max-width: 720px; margin: 0 auto; border: 2.5px solid #1f3f6d; padding: 32px; border-radius: 8px; }
        .header { text-align: center; border-bottom: 2px solid #1f3f6d; padding-bottom: 14px; margin-bottom: 22px; }
        .header h1 { font-size: 24px; color: #1f3f6d; }
        .header p { font-size: 12.5px; color: #64748b; margin-top: 3px; }
        .report-title { font-size: 15px; font-weight: bold; margin-top: 10px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 22px; font-size: 13px; }
        .meta-item { display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px; }
        .meta-item span { color: #64748b; }
        .meta-item strong { color: #0f172a; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 13px; }
        th { background: #1f3f6d; color: #ffffff; padding: 9px 10px; text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        td { padding: 10px; border-bottom: 1px solid #cbd5e1; }
        .total-row td { border-top: 2px solid #1f3f6d; border-bottom: 2px solid #1f3f6d; font-weight: bold; font-size: 14px; }
        .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 16px; font-size: 12px; }
        .seal-box { border: 2px solid #16a34a; color: #16a34a; font-weight: bold; padding: 6px 14px; border-radius: 4px; display: inline-block; }
        .sig { text-align: center; }
        .sig-line { width: 140px; border-top: 1px solid #475569; margin-bottom: 4px; }
        @media print {
            body { padding: 0; }
            .report-card { border: none; padding: 10px; }
        }
    </style>
</head>
<body>
    <div class="report-card">
        <div class="header">
            <h1>POWER PUBLIC SCHOOL</h1>
            <p>Affiliated to CBSE | Anna Nagar, Chennai - 600040</p>
            <div class="report-title">${examHeading}</div>
        </div>

        <div class="meta-grid">
            <div class="meta-item"><span>Report No:</span> <strong>${reportNo}</strong></div>
            <div class="meta-item"><span>Date of Issue:</span> <strong>${today}</strong></div>
            <div class="meta-item"><span>Student Name:</span> <strong>${studentName}</strong></div>
            <div class="meta-item"><span>Admission No:</span> <strong>${admNo}</strong></div>
            <div class="meta-item"><span>Class & Section:</span> <strong>${classSec}</strong></div>
            <div class="meta-item"><span>Roll No:</span> <strong>${rollNo}</strong></div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 40px; text-align: center;">#</th>
                    <th>Subject</th>
                    <th style="text-align: center;">Max Marks</th>
                    <th style="text-align: center;">Obtained</th>
                    <th style="text-align: center;">Percentage</th>
                    <th style="text-align: center;">Grade</th>
                    <th style="text-align: center;">Result</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
                <tr class="total-row">
                    <td colspan="2">Overall Aggregate</td>
                    <td style="text-align: center;">${totalMax}</td>
                    <td style="text-align: center;">${totalObt}</td>
                    <td style="text-align: center;">${overallPct}%</td>
                    <td style="text-align: center;">${overallGrade}</td>
                    <td style="text-align: center; color: #15803d;">PASSED</td>
                </tr>
            </tbody>
        </table>

        <div class="footer">
            <div class="sig">
                <div class="sig-line"></div>
                <strong>Class Teacher</strong>
            </div>
            <div>
                <span class="seal-box">INSTITUTIONAL RECORD</span>
            </div>
            <div class="sig">
                <div class="sig-line"></div>
                <strong>Principal / Headmistress</strong>
            </div>
        </div>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank");

    if (!printWindow) {
        alert("Please allow popups to view and download your report card.");
        return;
    }

    printWindow.onload = function () {
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 300);
    };
}

window.renderMarksTable = renderMarksTable;
window.downloadReportCardPDF = downloadReportCardPDF;