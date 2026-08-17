
const API_BASE =
    "https://loginpagepsabackend.onrender.com/api";


/* =====================================================
   ELEMENTS
   ===================================================== */

const classFilter =
    document.getElementById("classFilter");

const sectionFilter =
    document.getElementById("sectionFilter");

const attendanceDate =
    document.getElementById("attendanceDate");

const rollSearch =
    document.getElementById("rollSearch");

const attendanceTableBody =
    document.getElementById("attendanceTableBody");

const totalStudentsEl =
    document.getElementById("totalStudents");

const totalPresentEl =
    document.getElementById("totalPresent");

const totalAbsentEl =
    document.getElementById("totalAbsent");

const lateComersEl =
    document.getElementById("lateComers");

const teacherNameEl =
    document.getElementById("teacherName");


/* =====================================================
   TEACHER ID
   ===================================================== */
// =====================================================
// TEACHER ID
// =====================================================

// For this project, Attendance is currently assigned
// to a single teacher.
const teacherId = 1;





/* =====================================================
   DATA
   ===================================================== */

let teacherClasses = [];

let studentsData = [];


/* =====================================================
   PAGE INITIALIZATION
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setDefaultDate();

        updateDateTime();

        setInterval(
            updateDateTime,
            1000
        );


        const storedTeacherName =
            localStorage.getItem("teacherName");


        if (storedTeacherName) {

            teacherNameEl.textContent =
                storedTeacherName;

        }


        try {

            await loadTeacherClasses();

            await loadStudents();

            await loadAttendance();

        }
        catch (error) {

            console.error(
                "Attendance initialization error:",
                error
            );

        }

    }
);


/* =====================================================
   LOAD TEACHER CLASSES
   ===================================================== */

async function loadTeacherClasses() {

    const response =
        await fetch(
            `${API_BASE}/teachers/${teacherId}/classes`
        );


    if (!response.ok) {

        throw new Error(
            "Unable to load your assigned classes."
        );

    }


    teacherClasses =
        await response.json();


    console.log(
        "Teacher classes:",
        teacherClasses
    );


    populateClassFilter();

}


/* =====================================================
   CLASS FILTER
   ===================================================== */

function populateClassFilter() {

    classFilter.innerHTML = "";


    const allOption =
        document.createElement("option");

    allOption.value = "All";

    allOption.textContent =
        "All Classes";

    classFilter.appendChild(
        allOption
    );


    const classNames = [
        ...new Set(
            teacherClasses.map(
                item => item.className
            )
        )
    ];


    classNames.forEach(
        className => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                className;

            option.textContent =
                `Class ${className}`;

            classFilter.appendChild(
                option
            );

        }
    );


    populateSectionFilter();

}


/* =====================================================
   SECTION FILTER
   ===================================================== */

function populateSectionFilter() {

    sectionFilter.innerHTML = "";


    const allOption =
        document.createElement("option");

    allOption.value = "All";

    allOption.textContent =
        "All Sections";

    sectionFilter.appendChild(
        allOption
    );


    const selectedClass =
        classFilter.value;


    const sections =
        teacherClasses
            .filter(item => {

                return (
                    selectedClass === "All" ||
                    String(item.className) ===
                    String(selectedClass)
                );

            })
            .map(
                item => item.section
            );


    const uniqueSections =
        [...new Set(sections)];


    uniqueSections.forEach(
        section => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                section;

            option.textContent =
                section;

            sectionFilter.appendChild(
                option
            );

        }
    );

}


/* =====================================================
   LOAD STUDENTS
   ===================================================== */

async function loadStudents() {

    const response =
        await fetch(
            `${API_BASE}/students`
        );


    if (!response.ok) {

        throw new Error(
            "Unable to load students."
        );

    }


    const students =
        await response.json();


    /*
     * Keep ONLY students belonging
     * to the teacher's assigned
     * classes and sections.
     */

    studentsData =
        students
            .filter(student => {

                const studentClass =
                    String(
                        student.className || ""
                    );

                const studentSection =
                    String(
                        student.section || ""
                    );


                return teacherClasses.some(
                    assignedClass => {

                        return (
                            String(
                                assignedClass.className
                            ) === studentClass &&

                            String(
                                assignedClass.section
                            ) === studentSection
                        );

                    }
                );

            })
            .map(student => ({

                studentId:
                    student.studentId,

                rollNo:
                    student.rollNo || "",

                studentName:
                    student.fullName || "",

                className:
                    student.className || "",

                section:
                    student.section || "",

                photo:
                    student.studentPhoto ||
                    `https://i.pravatar.cc/100?u=${student.studentId}`,

                todayStatus:
                    "Not Marked"

            }));


    console.log(
        "Teacher students:",
        studentsData
    );

}


/* =====================================================
   LOAD ATTENDANCE
   ===================================================== */

async function loadAttendance() {

    const selectedDate =
        attendanceDate.value;


    if (!selectedDate) {
        return;
    }


    const response =
        await fetch(
            `${API_BASE}/attendance?date=${selectedDate}`
        );


    if (!response.ok) {

        throw new Error(
            "Unable to load attendance."
        );

    }


    const attendanceRecords =
        await response.json();


    /*
     * Reset statuses.
     */

    studentsData.forEach(
        student => {

            student.todayStatus =
                "Not Marked";

        }
    );


    /*
     * Apply database records.
     */

    attendanceRecords.forEach(
        record => {

            const student =
                studentsData.find(
                    item =>
                        Number(
                            item.studentId
                        ) ===
                        Number(
                            record.studentId
                        )
                );


            if (student) {

                student.todayStatus =
                    convertStatus(
                        record.status
                    );

            }

        }
    );


    displayStudents();

}


/* =====================================================
   STATUS CONVERSION
   ===================================================== */

function convertStatus(status) {

    if (!status) {

        return "Not Marked";

    }


    switch (
        status.toUpperCase()
    ) {

        case "PRESENT":
            return "Present";

        case "ABSENT":
            return "Absent";

        case "LATE":
            return "Late";

        case "LEAVE":
            return "Leave";

        default:
            return "Not Marked";

    }

}


/* =====================================================
   FILTER STUDENTS
   ===================================================== */

function getFilteredStudents() {

    const selectedClass =
        classFilter.value;

    const selectedSection =
        sectionFilter.value;

    const search =
        rollSearch.value
            .trim()
            .toLowerCase();


    return studentsData.filter(
        student => {

            const classMatch =
                selectedClass === "All" ||
                String(
                    student.className
                ) ===
                String(
                    selectedClass
                );


            const sectionMatch =
                selectedSection === "All" ||
                String(
                    student.section
                ) ===
                String(
                    selectedSection
                );


            const searchMatch =
                String(
                    student.rollNo
                )
                    .toLowerCase()
                    .includes(search) ||

                String(
                    student.studentName
                )
                    .toLowerCase()
                    .includes(search);


            return (
                classMatch &&
                sectionMatch &&
                searchMatch
            );

        }
    );

}


/* =====================================================
   DISPLAY STUDENTS
   ===================================================== */

function displayStudents() {

    const students =
        getFilteredStudents();


    attendanceTableBody.innerHTML =
        "";


    students.forEach(
        (student, index) => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${student.rollNo}
                </td>

                <td>

                    <img
                        src="${student.photo}"
                        class="student-photo"
                        alt="Student Photo"
                    >

                </td>

                <td>
                    ${student.studentName}
                </td>

                <td>
                    ${student.className}
                </td>

                <td>
                    ${student.section}
                </td>

                <td>

                    <select
                        class="status-select ${getStatusClass(student.todayStatus)}"
                        onchange="changeStatus(
                            ${student.studentId},
                            this.value,
                            this
                        )"
                    >

                        <option
                            value="Not Marked"
                            ${student.todayStatus === "Not Marked"
                                ? "selected"
                                : ""}
                        >
                            Select
                        </option>

                        <option
                            value="Present"
                            ${student.todayStatus === "Present"
                                ? "selected"
                                : ""}
                        >
                            Present
                        </option>

                        <option
                            value="Absent"
                            ${student.todayStatus === "Absent"
                                ? "selected"
                                : ""}
                        >
                            Absent
                        </option>

                        <option
                            value="Late"
                            ${student.todayStatus === "Late"
                                ? "selected"
                                : ""}
                        >
                            Late
                        </option>

                        <option
                            value="Leave"
                            ${student.todayStatus === "Leave"
                                ? "selected"
                                : ""}
                        >
                            Leave
                        </option>

                    </select>

                </td>

            `;


            attendanceTableBody.appendChild(
                row
            );

        }
    );


    updateSummary(
        students
    );

}


/* =====================================================
   CHANGE STATUS
   ===================================================== */

function changeStatus(
    studentId,
    status,
    selectElement
) {

    const student =
        studentsData.find(
            item =>
                Number(
                    item.studentId
                ) ===
                Number(
                    studentId
                )
        );


    if (!student) {
        return;
    }


    student.todayStatus =
        status;


    selectElement.className =
        "status-select " +
        getStatusClass(status);


    updateSummary(
        getFilteredStudents()
    );

}


/* =====================================================
   STATUS CSS
   ===================================================== */

function getStatusClass(status) {

    switch (status) {

        case "Present":
            return "status-present";

        case "Absent":
            return "status-absent";

        case "Late":
            return "status-late";

        case "Leave":
            return "status-leave";

        default:
            return "";

    }

}


/* =====================================================
   MARK ALL PRESENT
   ===================================================== */

document
    .getElementById(
        "markAllPresent"
    )
    .addEventListener(
        "click",
        () => {

            getFilteredStudents()
                .forEach(student => {

                    student.todayStatus =
                        "Present";

                });


            displayStudents();

        }
    );


/* =====================================================
   MARK ALL ABSENT
   ===================================================== */

document
    .getElementById(
        "markAllAbsent"
    )
    .addEventListener(
        "click",
        () => {

            getFilteredStudents()
                .forEach(student => {

                    student.todayStatus =
                        "Absent";

                });


            displayStudents();

        }
    );


/* =====================================================
   SAVE ATTENDANCE
   ===================================================== */

document
    .getElementById(
        "saveAttendanceBtn"
    )
    .addEventListener(
        "click",
        saveAttendance
    );


async function saveAttendance() {

    const selectedDate =
        attendanceDate.value;


    if (!selectedDate) {

        alert(
            "Please select a date."
        );

        return;

    }


    const students =
        getFilteredStudents();


    if (students.length === 0) {

        alert(
            "No students found."
        );

        return;

    }


    const unmarked =
        students.filter(
            student =>
                student.todayStatus ===
                "Not Marked"
        );


    if (unmarked.length > 0) {

        alert(
            `Please mark attendance for all students.\n\nUnmarked students: ${unmarked.length}`
        );

        return;

    }


    const payload =
        students.map(student => ({

            studentId:
                student.studentId,

            attendanceDate:
                selectedDate,

            status:
                student.todayStatus
                    .toUpperCase()

        }));


    console.log(
        "Attendance payload:",
        payload
    );


    try {

        const response =
            await fetch(
                `${API_BASE}/attendance/save`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                "Attendance could not be saved."
            );

        }


        const message =
            await response.text();


        alert(message);


        /*
         * Read the records back
         * from PostgreSQL.
         */

        await loadAttendance();


    }
    catch (error) {

        console.error(
            "SAVE ATTENDANCE ERROR:",
            error
        );


        alert(
            "Unable to save attendance."
        );

    }

}


/* =====================================================
   FILTER EVENTS
   ===================================================== */

classFilter.addEventListener(
    "change",
    () => {

        populateSectionFilter();

        displayStudents();

    }
);


sectionFilter.addEventListener(
    "change",
    () => {

        displayStudents();

    }
);


rollSearch.addEventListener(
    "input",
    () => {

        displayStudents();

    }
);


attendanceDate.addEventListener(
    "change",
    async () => {

        await loadAttendance();

    }
);


/* =====================================================
   SUMMARY
   ===================================================== */

function updateSummary(students) {

    let present = 0;

    let absent = 0;

    let late = 0;


    students.forEach(
        student => {

            if (
                student.todayStatus ===
                "Present"
            ) {

                present++;

            }


            if (
                student.todayStatus ===
                "Absent"
            ) {

                absent++;

            }


            if (
                student.todayStatus ===
                "Late"
            ) {

                late++;

            }

        }
    );


    totalStudentsEl.textContent =
        students.length;


    totalPresentEl.textContent =
        present;


    totalAbsentEl.textContent =
        absent;


    lateComersEl.textContent =
        late;

}


/* =====================================================
   DATE
   ===================================================== */

function setDefaultDate() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    attendanceDate.value =
        today;

}


/* =====================================================
   DATE / TIME
   ===================================================== */

function updateDateTime() {

    const now =
        new Date();


    document.getElementById(
        "todayDate"
    ).textContent =
        now.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );


    document.getElementById(
        "todayDay"
    ).textContent =
        now.toLocaleDateString(
            "en-IN",
            {
                weekday: "long"
            }
        );


    document.getElementById(
        "currentTime"
    ).textContent =
        now.toLocaleTimeString(
            "en-IN"
        );

}

