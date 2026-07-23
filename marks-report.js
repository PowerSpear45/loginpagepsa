// ==========================================
// MARKS REPORT
// ==========================================

const API_BASE = "https://loginpagepsabackend.onrender.com/api";

// ==========================================
// DOM
// ==========================================

const tableBody = document.getElementById("marksTableBody");

const averagePercentage =
document.getElementById("averagePercentage");

const highestMarks =
document.getElementById("highestMarks");

const lowestMarks =
document.getElementById("lowestMarks");

const classFilter =
document.getElementById("classFilter");

const sectionFilter =
document.getElementById("sectionFilter");

const examFilter =
document.getElementById("examFilter");

const searchInput =
document.getElementById("searchInput");

// ==========================================

let marks = [];

// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    loadMarks();

    classFilter.addEventListener("change", renderTable);
    sectionFilter.addEventListener("change", renderTable);
    examFilter.addEventListener("change", renderTable);
    searchInput.addEventListener("input", renderTable);

});

// ==========================================
// LOAD MARKS
// ==========================================

async function loadMarks() {

    try {

        const response =
        await fetch(`${API_BASE}/marks`);

        marks = await response.json();

        populateFilters();

        renderTable();

    }

    catch (error) {

        console.error(error);

        alert("Unable to load marks.");

    }

}

// ==========================================
// FILTERS
// ==========================================

function populateFilters() {

    const classes =
        [...new Set(marks.map(m => m.className))];

    const sections =
        [...new Set(marks.map(m => m.section))];

    const exams =
        [...new Set(marks.map(m => m.examName))];

    classFilter.innerHTML =
        `<option value="">All Classes</option>`;

    sectionFilter.innerHTML =
        `<option value="">All Sections</option>`;

    examFilter.innerHTML =
        `<option value="">All Exams</option>`;

    classes.forEach(c => {

        classFilter.innerHTML +=
        `<option value="${c}">${c}</option>`;

    });

    sections.forEach(s => {

        sectionFilter.innerHTML +=
        `<option value="${s}">${s}</option>`;

    });

    exams.forEach(e => {

        examFilter.innerHTML +=
        `<option value="${e}">${e}</option>`;

    });

}

// ==========================================
// TABLE
// ==========================================

function renderTable() {

    tableBody.innerHTML = "";

    const filtered = marks.filter(student => {

        const classOk =
            !classFilter.value ||
            student.className === classFilter.value;

        const sectionOk =
            !sectionFilter.value ||
            student.section === sectionFilter.value;

        const examOk =
            !examFilter.value ||
            student.examName === examFilter.value;

        const searchOk =

            student.fullName
            .toLowerCase()
            .includes(searchInput.value.toLowerCase())

            ||

            String(student.rollNo || "")
            .includes(searchInput.value);

        return classOk &&
               sectionOk &&
               examOk &&
               searchOk;

    });

    let highest = 0;
    let lowest = 999;
    let percentageSum = 0;

    filtered.forEach((student,index)=>{

        const total =
            student.total || 0;

        const percentage =
            student.percentage || 0;

        const result =
            percentage >= 35
            ? "<span class='pass'>Pass</span>"
            : "<span class='fail'>Fail</span>";

        highest =
            Math.max(highest,total);

        lowest =
            Math.min(lowest,total);

        percentageSum += Number(percentage);

        const row =
        document.createElement("tr");

        row.innerHTML = `

            <td>${index+1}</td>

            <td>${student.rollNo ?? "-"}</td>

            <td>

                <img
                src="${student.studentPhoto || 'images/default-user.png'}"
                class="student-photo">

            </td>

            <td>

                ${student.fullName}

            </td>

            <td>

                <strong>${total}</strong>

            </td>

            <td>

                ${percentage}%

            </td>

            <td>

                ${result}

            </td>

            <td>

                <button
                    class="view-btn"
                    onclick="viewStudent(${student.studentId})">

                    <i class="fa-solid fa-eye"></i>

                    View

                </button>

            </td>

        `;

        tableBody.appendChild(row);

    });

    if(filtered.length>0){

        averagePercentage.textContent =
            (percentageSum/filtered.length).toFixed(1) + "%";

        highestMarks.textContent =
            highest;

        lowestMarks.textContent =
            lowest;

    }

}
// ==========================================
// VIEW STUDENT
// ==========================================

function viewStudent(studentId) {

    const student =
        marks.find(m => m.studentId == studentId);

    if (!student) {

        alert("Student not found.");

        return;

    }

    alert(

`Student Name : ${student.fullName}

Roll No : ${student.rollNo || "-"}

Class : ${student.className} - ${student.section}

Exam : ${student.examName}

Academic Year : ${student.academicYear}

Tamil : ${student.tamil}

English : ${student.english}

Maths : ${student.maths}

Science : ${student.science}

Social : ${student.social}

Computer : ${student.computer}

-------------------------

Total : ${student.total}

Percentage : ${student.percentage}%

Grade : ${student.grade}

Remarks : ${student.remarks}`

    );

}

// ==========================================
// EXPORT EXCEL
// ==========================================

const exportBtn =
document.getElementById("exportExcel");

if(exportBtn){

    exportBtn.addEventListener("click",()=>{

        alert("Excel Export Coming Soon");

    });

}

// ==========================================
// SUBJECT ANALYSIS
// ==========================================

const analysisBtn =
document.getElementById("subjectAnalysis");

if(analysisBtn){

    analysisBtn.addEventListener("click",()=>{

        alert("Subject Analysis Coming Soon");

    });

}

// ==========================================
// TOP PERFORMERS
// ==========================================

const topBtn =
document.getElementById("topPerformers");

if(topBtn){

topBtn.addEventListener("click",()=>{

    const ranking = [...marks];

    ranking.sort((a,b)=>b.total-a.total);

    let message="🏆 TOP 5 PERFORMERS\n\n";

    ranking.slice(0,5).forEach((student,index)=>{

        message +=
`${index+1}. ${student.fullName}
Total : ${student.total}/600

`;

    });

    alert(message);

});

}

// ==========================================
// TODAY DATE
// ==========================================

const dateElement =
document.getElementById("todayDate");

const dayElement =
document.getElementById("todayDay");

if(dateElement && dayElement){

    const today = new Date();

    dateElement.textContent =
        today.toLocaleDateString("en-IN",{

            day:"2-digit",

            month:"short",

            year:"numeric"

        });

    dayElement.textContent =
        today.toLocaleDateString("en-IN",{

            weekday:"long"

        });

}

// ==========================================
// HELPERS
// ==========================================

function calculateGrade(percentage){

    if(percentage>=90) return "A+";

    if(percentage>=80) return "A";

    if(percentage>=70) return "B";

    if(percentage>=60) return "C";

    if(percentage>=50) return "D";

    return "F";

}