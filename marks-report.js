const API_BASE = "https://loginpagepsabackend.onrender.com/api";

// ==========================
// DOM Elements
// ==========================

const tableBody = document.getElementById("marksTableBody");

const averagePercentage = document.getElementById("averagePercentage");
const highestMarks = document.getElementById("highestMarks");
const lowestMarks = document.getElementById("lowestMarks");

const classFilter = document.getElementById("classFilter");
const sectionFilter = document.getElementById("sectionFilter");
const examFilter = document.getElementById("examFilter");
const searchInput = document.getElementById("searchInput");

let students = [];
let marks = [];
let exams = [];

// ==========================
// Initial Load
// ==========================

document.addEventListener("DOMContentLoaded", () => {

    loadStudents();
    loadMarks();
    loadExams();

    classFilter.addEventListener("change", renderTable);
    sectionFilter.addEventListener("change", renderTable);
    examFilter.addEventListener("change", renderTable);
    searchInput.addEventListener("input", renderTable);

});

// ==========================
// Load Students
// ==========================

async function loadStudents(){

    try{

        const response = await fetch(`${API_BASE}/students`);

        students = await response.json();

        populateFilters();

        renderTable();

    }
    catch(err){

        console.error(err);

    }

}

// ==========================
// Load Marks
// ==========================

async function loadMarks(){

    try{

        const response = await fetch(`${API_BASE}/marks`);

        marks = await response.json();

        renderTable();

    }
    catch(err){

        console.error(err);

    }

}

// ==========================
// Load Exams
// ==========================

async function loadExams(){

    try{

        const response = await fetch(`${API_BASE}/exams`);

        exams = await response.json();

        populateExamFilter();

    }
    catch(err){

        console.error(err);

    }

}
// ==========================
// Populate Filters
// ==========================

function populateFilters() {

    const classes = [...new Set(students.map(s => s.className))];
    const sections = [...new Set(students.map(s => s.section))];

    classFilter.innerHTML = `<option value="">All Classes</option>`;
    sectionFilter.innerHTML = `<option value="">All Sections</option>`;

    classes.forEach(c => {
        classFilter.innerHTML += `<option value="${c}">${c}</option>`;
    });

    sections.forEach(s => {
        sectionFilter.innerHTML += `<option value="${s}">${s}</option>`;
    });

}

// ==========================
// Populate Exam Filter
// ==========================

function populateExamFilter() {

    examFilter.innerHTML = `<option value="">All Exams</option>`;

    exams.forEach(exam => {

        examFilter.innerHTML +=
        `
        <option value="${exam.id}">
            ${exam.examName}
        </option>
        `;

    });

}

// ==========================
// Render Table
// ==========================

function renderTable() {

    tableBody.innerHTML = "";

    let filteredStudents = students.filter(student => {

        const classOk =
            !classFilter.value ||
            student.className == classFilter.value;

        const sectionOk =
            !sectionFilter.value ||
            student.section == sectionFilter.value;

        const searchOk =
            student.fullName.toLowerCase().includes(searchInput.value.toLowerCase()) ||

            student.rollNo.toString().includes(searchInput.value) ||

            student.admissionNo.toString().includes(searchInput.value);

        return classOk && sectionOk && searchOk;

    });

    let highest = 0;
    let lowest = 500;
    let totalPercentage = 0;

    filteredStudents.forEach((student,index)=>{

        const studentMarks = marks.find(m => m.student.id == student.id);

        let tamil = studentMarks?.tamil || 0;
        let english = studentMarks?.english || 0;
        let maths = studentMarks?.maths || 0;
        let science = studentMarks?.science || 0;
        let social = studentMarks?.social || 0;

        let total =
            tamil +
            english +
            maths +
            science +
            social;

        let average = (total / 5).toFixed(1);

        let percentage = (total / 500 * 100);

        highest = Math.max(highest,total);
        lowest = Math.min(lowest,total);

        totalPercentage += percentage;

     row.innerHTML = `
    <td>${index + 1}</td>

    <td>${student.rollNo || "-"}</td>

    <td>
        <img src="${student.studentPhoto || "images/default-user.png"}"
             class="student-photo">
    </td>

    <td>${student.fullName}</td>

    <td><strong>${student.total}</strong></td>

    <td>${average}%</td>

    <td>${result}</td>

    <td>
        <button class="view-btn"
                onclick="viewStudent(${student.studentId})">
            <i class="fa-solid fa-eye"></i> View
        </button>
    </td>
`;
`;

        </tr> </td>

            <td class="student-name">${student.fullName}</td>

            <td class="mark">${student.tamil}</td>
<td class="mark">${student.english}</td>
<td class="mark">

        

    });

    if(filteredStudents.length>0){

        averagePercentage.textContent =
            (totalPercentage/filteredStudents.length).toFixed(1) + "%";

        highestMarks.textContent = highest;

        lowestMarks.textContent = lowest;

    }

}
// ==========================
// View Student
// ==========================

function viewStudent(studentId) {

    window.location.href = `student-marks.html?id=${studentId}`;

}

// ==========================
// Export Excel
// ==========================

document
.getElementById("exportExcel")
.addEventListener("click", () => {

    alert("Export Excel feature will be added soon.");

});

// ==========================
// Subject Analysis
// ==========================

document
.getElementById("subjectAnalysis")
.addEventListener("click", () => {

    alert("Subject Analysis page coming soon.");

});

// ==========================
// Top Performers
// ==========================

document
.getElementById("topPerformers")
.addEventListener("click", () => {

    const ranking = students.map(student => {

        const mark = marks.find(
            m => m.student.studentId === student.studentId
        );

        if (!mark) {

            return {
                name: student.fullName,
                total: 0
            };

        }

        const total =
            mark.tamil +
            mark.english +
            mark.maths +
            mark.science +
            mark.social;

        return {

            name: student.fullName,
            total: total

        };

    });

    ranking.sort((a, b) => b.total - a.total);

    let message = "🏆 TOP 5 PERFORMERS\n\n";

    ranking.slice(0, 5).forEach((student, index) => {

        message +=
`${index + 1}. ${student.name} - ${student.total}/500\n`;

    });

    alert(message);

};

// ==========================
// Today's Date
// ==========================

const dateElement = document.getElementById("todayDate");
const dayElement = document.getElementById("todayDay");

if (dateElement && dayElement) {

    const today = new Date();

    dateElement.textContent =
        today.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    dayElement.textContent =
        today.toLocaleDateString("en-IN", {
            weekday: "long"
        });

}

// ==========================
// Helper Functions
// ==========================

function calculateTotal(mark) {

    return (
        mark.tamil +
        mark.english +
        mark.maths +
        mark.science +
        mark.social
    );

}

function calculatePercentage(total) {

    return ((total / 500) * 100).toFixed(1);

}

function calculateGrade(percentage) {

    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";

    return "F";

}