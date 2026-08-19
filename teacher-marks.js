const API_BASE =
    "https://loginpagepsabackend.onrender.com/api";

const teacherId =
    localStorage.getItem("teacherId") || "1";

let teacherClasses = [];
let studentsData = [];
let savedMarks = [];

let selectedSubject = "";
let selectedExam = "";
let selectedDate = "";
let maximumMarks = 100;


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    
    setDefaultDate();
    updateDateTime();
    updateTodayDate();

    loadTeacherClasses();
    loadStudents();

    setInterval(updateDateTime, 1000);

});


/* =========================================================
   DATE
   ========================================================= */

function setDefaultDate() {

    const dateInput =
        document.getElementById("examDate");

    if (!dateInput) return;

    const today =
        new Date().toISOString().split("T")[0];

    dateInput.value = today;

    selectedDate = today;
}


/* =========================================================
   CURRENT DATE / TIME
   ========================================================= */

function updateDateTime() {

    const element =
        document.getElementById("currentDateTime");

    if (!element) return;

    const now = new Date();

    element.textContent =
        now.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
}


/* =========================================================
   LOAD TEACHER CLASSES
   ========================================================= */

async function loadTeacherClasses() {

    try {

        const response =
            await fetch(
                `${API_BASE}/teachers/${teacherId}/classes`
            );

        if (!response.ok) {
            throw new Error(
                "Unable to load teacher classes"
            );
        }

        teacherClasses =
            await response.json();

        populateClassFilter();

    } catch (error) {

        console.error(
            "Teacher classes error:",
            error
        );

        showMessage(
            "Unable to load teacher classes.",
            "error"
        );
    }
}


/* =========================================================
   CLASS FILTER
   ========================================================= */

function populateClassFilter() {

    const classFilter =
        document.getElementById("classFilter");

    if (!classFilter) return;

    classFilter.innerHTML =
        `<option value="">Select Class</option>`;

    const classes = [
        ...new Set(
            teacherClasses.map(
                item =>
                    item.className ??
                    item.classNumber ??
                    item.classId ??
                    ""
            )
        )
    ];

    classes.forEach(className => {

        if (!className) return;

        const option =
            document.createElement("option");

        option.value = className;
        option.textContent =
            `Class ${className}`;

        classFilter.appendChild(option);
    });

    classFilter.addEventListener(
        "change",
        function () {

            populateSectionFilter();

            populateSubjectFilter();

            displayStudents();

        }
    );
}


/* =========================================================
   SECTION FILTER
   ========================================================= */

function populateSectionFilter() {

    const sectionFilter =
        document.getElementById("sectionFilter");

    const classFilter =
        document.getElementById("classFilter");

    if (!sectionFilter || !classFilter) return;

    const selectedClass =
        classFilter.value;

    sectionFilter.innerHTML =
        `<option value="">Select Section</option>`;

    const sections = [
        ...new Set(
            teacherClasses
                .filter(item => {

                    const classValue =
                        item.className ??
                        item.classNumber ??
                        item.classId ??
                        "";

                    return String(classValue) ===
                        String(selectedClass);
                })
                .map(
                    item =>
                        item.section ??
                        item.sectionName ??
                        ""
                )
        )
    ];

    sections.forEach(section => {

        if (!section) return;

        const option =
            document.createElement("option");

        option.value = section;
        option.textContent = section;

        sectionFilter.appendChild(option);
    });

    sectionFilter.onchange =
        function () {

            populateSubjectFilter();

            displayStudents();
        };
}


/* =========================================================
   SUBJECT FILTER
   ========================================================= */

function populateSubjectFilter() {

    const subjectFilter =
        document.getElementById("subjectFilter");

    const classFilter =
        document.getElementById("classFilter");

    const sectionFilter =
        document.getElementById("sectionFilter");

    if (!subjectFilter) return;

    const selectedClass =
        classFilter?.value || "";

    const selectedSection =
        sectionFilter?.value || "";

    subjectFilter.innerHTML =
        `<option value="">Select Subject</option>`;

    const subjects = [
        ...new Set(
            teacherClasses
                .filter(item => {

                    const classValue =
                        item.className ??
                        item.classNumber ??
                        item.classId ??
                        "";

                    const sectionValue =
                        item.section ??
                        item.sectionName ??
                        "";

                    const classMatches =
                        !selectedClass ||
                        String(classValue) ===
                        String(selectedClass);

                    const sectionMatches =
                        !selectedSection ||
                        String(sectionValue) ===
                        String(selectedSection);

                    return classMatches &&
                           sectionMatches;
                })
                .map(
                    item =>
                        item.subject ??
                        item.subjectName ??
                        ""
                )
        )
    ];

    subjects.forEach(subject => {

        if (!subject) return;

        const option =
            document.createElement("option");

        option.value = subject;
        option.textContent = subject;

        subjectFilter.appendChild(option);
    });

    subjectFilter.onchange =
        function () {

            selectedSubject =
                subjectFilter.value;

            loadExistingMarks();

            displayStudents();
        };
}


/* =========================================================
   LOAD STUDENTS
   ========================================================= */

async function loadStudents() {

    try {

        const response =
            await fetch(
                `${API_BASE}/students`
            );

        if (!response.ok) {
            throw new Error(
                "Unable to load students"
            );
        }

        studentsData =
            await response.json();

        studentsData.forEach(student => {

            student.marks = "";

        });

        displayStudents();

    } catch (error) {

        console.error(
            "Students error:",
            error
        );

        showMessage(
            "Unable to load students.",
            "error"
        );
    }
}


/* =========================================================
   DISPLAY STUDENTS
   ========================================================= */

function displayStudents() {

    const tableBody =
        document.getElementById(
            "marksTableBody"
        );

    if (!tableBody) return;

    const classFilter =
        document.getElementById(
            "classFilter"
        );

    const sectionFilter =
        document.getElementById(
            "sectionFilter"
        );

    const selectedClass =
        classFilter?.value || "";

    const selectedSection =
        sectionFilter?.value || "";

    tableBody.innerHTML = "";

    const filteredStudents =
        studentsData.filter(student => {

            const studentClass =
                student.className ??
                student.classNumber ??
                student.classId ??
                "";

            const studentSection =
                student.section ??
                student.sectionName ??
                "";

            const classMatches =
                !selectedClass ||
                String(studentClass) ===
                String(selectedClass);

            const sectionMatches =
                !selectedSection ||
                String(studentSection) ===
                String(selectedSection);

            return classMatches &&
                   sectionMatches;
        });

    filteredStudents.forEach(
        (student, index) => {

            const row =
                document.createElement("tr");

            const marksValue =
                student.marks === null ||
                student.marks === undefined
                    ? ""
                    : student.marks;

            const status =
                marksValue !== ""
                    ? "Entered"
                    : "Pending";

            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${student.rollNumber ??
                      student.rollNo ??
                      "-"}
                </td>

                <td>
                    ${student.fullName ??
                      student.name ??
                      "-"}
                </td>

                <td>
                    <input
                        type="number"
                        class="marks-input"
                        data-student-id="${student.studentId}"
                        value="${marksValue}"
                        min="0"
                        max="${maximumMarks}"
                        placeholder="Enter marks"
                    >
                </td>

                <td>
                    ${maximumMarks}
                </td>

                <td>
                    <span class="mark-status ${
                        status === "Entered"
                            ? "entered"
                            : "pending"
                    }">
                        ${status}
                    </span>
                </td>

                <td>
                    <button
                        type="button"
                        class="save-mark-btn"
                        onclick="saveIndividualMark(${student.studentId})">
                        Save
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        }
    );

    document
        .querySelectorAll(".marks-input")
        .forEach(input => {

            input.addEventListener(
                "input",
                function () {

                    const studentId =
                        Number(
                            this.dataset.studentId
                        );

                    const student =
                        studentsData.find(
                            s =>
                                Number(s.studentId) ===
                                studentId
                        );

                    if (!student) return;

                    let value =
                        this.value;

                    if (
                        value !== "" &&
                        Number(value) > maximumMarks
                    ) {

                        value =
                            maximumMarks;

                        this.value =
                            maximumMarks;
                    }

                    if (
                        value !== "" &&
                        Number(value) < 0
                    ) {

                        value = 0;

                        this.value = 0;
                    }

                    student.marks =
                        value;

                    updateSummary();
                    updateRowStatus(this);
                }
            );
        });

    updateSummary();
}


/* =========================================================
   UPDATE ROW STATUS
   ========================================================= */

function updateRowStatus(input) {

    const row =
        input.closest("tr");

    if (!row) return;

    const status =
        row.querySelector(
            ".mark-status"
        );

    if (!status) return;

    if (input.value !== "") {

        status.textContent =
            "Entered";

        status.className =
            "mark-status entered";

    } else {

        status.textContent =
            "Pending";

        status.className =
            "mark-status pending";
    }
}


/* =========================================================
   GET CURRENT SELECTION
   ========================================================= */

function getMarkSelection() {

    const subjectFilter =
        document.getElementById(
            "subjectFilter"
        );

    const examFilter =
        document.getElementById(
            "examType"
        );

    const examDate =
        document.getElementById(
            "examDate"
        );

    selectedSubject =
        subjectFilter?.value || "";

    selectedExam =
        examFilter?.value || "";

    selectedDate =
        examDate?.value || "";

    return {
        subject: selectedSubject,
        examType: selectedExam,
        examDate: selectedDate
    };
}


/* =========================================================
   LOAD EXISTING MARKS
   ========================================================= */

async function loadExistingMarks() {

    const selection =
        getMarkSelection();

    if (
        !selection.subject ||
        !selection.examType ||
        !selection.examDate
    ) {

        return;
    }

    try {

        const params =
            new URLSearchParams({
                subject: selection.subject,
                examType: selection.examType,
                examDate: selection.examDate
            });

        const response =
            await fetch(
                `${API_BASE}/marks?${params.toString()}`
            );

        if (!response.ok) {
            throw new Error(
                "Unable to load existing marks"
            );
        }

        savedMarks =
            await response.json();

        /*
         * Clear current marks first
         */
        studentsData.forEach(
            student => {

                student.marks = "";

            }
        );

        /*
         * Put saved marks into students
         */
        savedMarks.forEach(mark => {

            const student =
                studentsData.find(
                    student =>
                        Number(
                            student.studentId
                        ) === Number(
                            mark.studentId
                        )
                );

            if (student) {

                student.marks =
                    mark.marksObtained;
            }
        });

        displayStudents();

    } catch (error) {

        console.error(
            "Existing marks error:",
            error
        );

        showMessage(
            "Unable to load saved marks.",
            "error"
        );
    }
}


/* =========================================================
   SAVE INDIVIDUAL MARK
   ========================================================= */

async function saveIndividualMark(
    studentId
) {

    const selection =
        getMarkSelection();

    if (!selection.subject) {

        showMessage(
            "Please select a subject.",
            "error"
        );

        return;
    }

    if (!selection.examType) {

        showMessage(
            "Please select an exam type.",
            "error"
        );

        return;
    }

    if (!selection.examDate) {

        showMessage(
            "Please select an exam date.",
            "error"
        );

        return;
    }

    const student =
        studentsData.find(
            s =>
                Number(s.studentId) ===
                Number(studentId)
        );

    if (!student) {

        showMessage(
            "Student not found.",
            "error"
        );

        return;
    }

    if (
        student.marks === "" ||
        student.marks === null ||
        student.marks === undefined
    ) {

        showMessage(
            "Please enter marks first.",
            "error"
        );

        return;
    }

    const marks =
        Number(student.marks);

    if (
        Number.isNaN(marks) ||
        marks < 0 ||
        marks > maximumMarks
    ) {

        showMessage(
            `Marks must be between 0 and ${maximumMarks}.`,
            "error"
        );

        return;
    }

    const payload = {

        studentId:
            Number(student.studentId),

        subject:
            selection.subject,

        examType:
            selection.examType,

        examDate:
            selection.examDate,

        maxMarks:
            maximumMarks,

        marksObtained:
            marks
    };

    try {

        const response =
            await fetch(
                `${API_BASE}/marks/save`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(payload)
                }
            );

        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Failed to save mark"
            );
        }

        await response.json();

        showMessage(
            "Mark saved successfully.",
            "success"
        );

        await loadExistingMarks();

    } catch (error) {

        console.error(
            "Save mark error:",
            error
        );

        showMessage(
            "Failed to save mark.",
            "error"
        );
    }
}


/* =========================================================
   SAVE ALL MARKS
   ========================================================= */

async function saveAllMarks() {

    const selection =
        getMarkSelection();

    if (!selection.subject) {

        showMessage(
            "Please select a subject.",
            "error"
        );

        return;
    }

    if (!selection.examType) {

        showMessage(
            "Please select an exam type.",
            "error"
        );

        return;
    }

    if (!selection.examDate) {

        showMessage(
            "Please select an exam date.",
            "error"
        );

        return;
    }

    const classFilter =
        document.getElementById(
            "classFilter"
        );

    const sectionFilter =
        document.getElementById(
            "sectionFilter"
        );

    const selectedClass =
        classFilter?.value || "";

    const selectedSection =
        sectionFilter?.value || "";

    const filteredStudents =
        studentsData.filter(student => {

            const studentClass =
                student.className ??
                student.classNumber ??
                student.classId ??
                "";

            const studentSection =
                student.section ??
                student.sectionName ??
                "";

            const classMatches =
                !selectedClass ||
                String(studentClass) ===
                String(selectedClass);

            const sectionMatches =
                !selectedSection ||
                String(studentSection) ===
                String(selectedSection);

            return classMatches &&
                   sectionMatches;
        });

    const studentsWithMarks =
        filteredStudents.filter(
            student =>
                student.marks !== "" &&
                student.marks !== null &&
                student.marks !== undefined
        );

    if (
        studentsWithMarks.length === 0
    ) {

        showMessage(
            "Please enter at least one mark.",
            "error"
        );

        return;
    }

    /*
     * Validate every entered mark
     */
    for (
        const student of studentsWithMarks
    ) {

        const marks =
            Number(student.marks);

        if (
            Number.isNaN(marks) ||
            marks < 0 ||
            marks > maximumMarks
        ) {

            showMessage(
                `Invalid marks for ${
                    student.fullName ??
                    student.name ??
                    "student"
                }. Marks must be between 0 and ${maximumMarks}.`,
                "error"
            );

            return;
        }
    }

    const payload =
        studentsWithMarks.map(
            student => ({

                studentId:
                    Number(student.studentId),

                subject:
                    selection.subject,

                examType:
                    selection.examType,

                examDate:
                    selection.examDate,

                maxMarks:
                    maximumMarks,

                marksObtained:
                    Number(student.marks)
            })
        );

    try {

        const response =
            await fetch(
                `${API_BASE}/marks/save-all`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(payload)
                }
            );

        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Failed to save marks"
            );
        }

        await response.json();

        showMessage(
            `${payload.length} mark(s) saved successfully.`,
            "success"
        );

        await loadExistingMarks();

    } catch (error) {

        console.error(
            "Save all error:",
            error
        );

        showMessage(
            "Failed to save marks.",
            "error"
        );
    }
}


/* =========================================================
   CLEAR ALL MARK INPUTS
   ========================================================= */

function clearAllMarks() {

    const classFilter =
        document.getElementById(
            "classFilter"
        );

    const sectionFilter =
        document.getElementById(
            "sectionFilter"
        );

    const selectedClass =
        classFilter?.value || "";

    const selectedSection =
        sectionFilter?.value || "";

    studentsData.forEach(student => {

        const studentClass =
            student.className ??
            student.classNumber ??
            student.classId ??
            "";

        const studentSection =
            student.section ??
            student.sectionName ??
            "";

        const classMatches =
            !selectedClass ||
            String(studentClass) ===
            String(selectedClass);

        const sectionMatches =
            !selectedSection ||
            String(studentSection) ===
            String(selectedSection);

        if (
            classMatches &&
            sectionMatches
        ) {

            student.marks = "";
        }
    });

    displayStudents();

    showMessage(
        "Marks cleared from the form.",
        "success"
    );
}


/* =========================================================
   SUMMARY
   ========================================================= */

function updateSummary() {

    const classFilter =
        document.getElementById(
            "classFilter"
        );

    const sectionFilter =
        document.getElementById(
            "sectionFilter"
        );

    const selectedClass =
        classFilter?.value || "";

    const selectedSection =
        sectionFilter?.value || "";

    const filteredStudents =
        studentsData.filter(student => {

            const studentClass =
                student.className ??
                student.classNumber ??
                student.classId ??
                "";

            const studentSection =
                student.section ??
                student.sectionName ??
                "";

            const classMatches =
                !selectedClass ||
                String(studentClass) ===
                String(selectedClass);

            const sectionMatches =
                !selectedSection ||
                String(studentSection) ===
                String(selectedSection);

            return classMatches &&
                   sectionMatches;
        });

    const totalStudents =
        filteredStudents.length;

    const marksEntered =
        filteredStudents.filter(
            student =>
                student.marks !== "" &&
                student.marks !== null &&
                student.marks !== undefined
        ).length;

    const marksPending =
        totalStudents -
        marksEntered;

    setElementText(
        "totalStudents",
        totalStudents
    );

    setElementText(
        "marksEntered",
        marksEntered
    );

    setElementText(
        "marksPending",
        marksPending
    );
}


/* =========================================================
   HELPER
   ========================================================= */

function setElementText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(
    message,
    type = "success"
) {

    /*
     * If your HTML already contains
     * a message element, use it.
     */
    const messageElement =
        document.getElementById(
            "message"
        );

    if (messageElement) {

        messageElement.textContent =
            message;

        messageElement.className =
            `message ${type}`;

        setTimeout(() => {

            messageElement.textContent =
                "";

        }, 3000);

        return;
    }

    /*
     * Fallback
     */
    alert(message);
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

document.addEventListener(
    "change",
    function (event) {

        if (
            event.target.id ===
            "examType"
        ) {

            selectedExam =
                event.target.value;

            loadExistingMarks();
        }

        if (
            event.target.id ===
            "examDate"
        ) {

            selectedDate =
                event.target.value;

            loadExistingMarks();
        }

    }
);


/* =========================================================
   BUTTON COMPATIBILITY
   ========================================================= */

window.saveIndividualMark =
    saveIndividualMark;

window.saveAllMarks =
    saveAllMarks;

window.clearAllMarks =
    clearAllMarks;

window.loadExistingMarks =
    loadExistingMarks;