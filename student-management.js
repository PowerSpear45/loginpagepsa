// =========================================================
// API
// =========================================================

const API_BASE =
    "https://loginpagepsabackend.onrender.com/api/students";


// =========================================================
// DOM ELEMENTS
// =========================================================

const addBtn =
    document.querySelector(".add-btn");

const modal =
    document.getElementById("studentModal");

const closeBtn =
    document.querySelector(".close-btn");

const studentForm =
    document.querySelector(".student-form");

const tableBody =
    document.getElementById("studentTableBody");


// View modal

const viewModal =
    document.getElementById("viewStudentModal");

const closeViewBtn =
    document.querySelector(".close-view");

const studentDetailsContent =
    document.getElementById("studentDetailsContent");

const deleteStudentBtn =
    document.getElementById("deleteStudentBtn");


// Filters

const searchInput =
    document.getElementById("searchInput");

const classFilter =
    document.getElementById("classFilter");

const sectionFilter =
    document.getElementById("sectionFilter");

const genderFilter =
    document.getElementById("genderFilter");


// =========================================================
// VARIABLES
// =========================================================

let editingStudentId = null;

let viewingStudentId = null;

let allStudents = [];


// =========================================================
// ADD STUDENT BUTTON
// =========================================================

addBtn.addEventListener("click", function () {

    editingStudentId = null;

    studentForm.reset();

    document.querySelector(".modal-header h2").innerHTML =
        "Add New Student";

    modal.style.display = "block";

});


// =========================================================
// CLOSE ADD / EDIT MODAL
// =========================================================

closeBtn.addEventListener("click", function () {

    modal.style.display = "none";

});


// =========================================================
// CLOSE VIEW MODAL
// =========================================================

closeViewBtn.addEventListener("click", function () {

    viewModal.style.display = "none";

    viewingStudentId = null;

});


// =========================================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// =========================================================

window.addEventListener("click", function (event) {

    if (event.target === modal) {

        modal.style.display = "none";

    }

    if (event.target === viewModal) {

        viewModal.style.display = "none";

        viewingStudentId = null;

    }

});


// =========================================================
// LOAD STUDENTS
// =========================================================

async function loadStudents() {

    try {

        const response =
            await fetch(API_BASE);


        if (!response.ok) {

            throw new Error(
                "Failed to load students"
            );

        }


        const students =
            await response.json();


        allStudents = students;


        updateDashboardCards(
            allStudents
        );


        applyFilters();


    } catch (error) {

        console.error(
            "Error loading students:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="9"
                    style="text-align:center; padding:30px; color:#777;">
                    Unable to load students.
                </td>
            </tr>
        `;

    }

}


// =========================================================
// DISPLAY STUDENTS
// =========================================================

function displayStudents(students) {

    tableBody.innerHTML = "";


    if (students.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="9"
                    style="text-align:center; padding:30px; color:#777;">
                    No students found.
                </td>
            </tr>
        `;

        return;

    }


    students.forEach(function (student, index) {


        // -------------------------------------------------
        // PHOTO
        // -------------------------------------------------

        let photoUrl =
            student.studentPhoto ||
            `https://i.pravatar.cc/40?img=${index + 1}`;


        // -------------------------------------------------
        // GENDER CLASS
        // -------------------------------------------------

        let genderClass = "";

        if (student.gender === "Female") {

            genderClass = "female";

        } else if (student.gender === "Male") {

            genderClass = "male";

        }


        // -------------------------------------------------
        // TABLE ROW
        // -------------------------------------------------

        const row = `

            <tr>

                <td>
                    ${index + 1}
                </td>


                <td>

                    <img
                        src="${escapeHtml(photoUrl)}"
                        class="student-photo"
                        alt="Student Photo"
                        onerror="this.src='https://i.pravatar.cc/40?img=1'"
                    >

                </td>


                <td>
                    ${escapeHtml(student.fullName || "-")}
                </td>


                <td>
                    ${escapeHtml(student.admissionNo || "-")}
                </td>


                <td>
                    ${escapeHtml(student.className || "-")}
                    -
                    ${escapeHtml(student.section || "-")}
                </td>


                <td>
                    ${escapeHtml(student.rollNo || "-")}
                </td>


                <td class="${genderClass}">
                    ${escapeHtml(student.gender || "-")}
                </td>


                <td>
                    ${formatDate(student.dateOfBirth)}
                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            type="button"
                            class="edit-btn"
                            onclick="editStudent(${student.studentId})">

                            <i class="fa-solid fa-pen"></i>
                            Edit

                        </button>


                        <button
                            type="button"
                            class="view-btn"
                            onclick="viewStudent(${student.studentId})">

                            <i class="fa-solid fa-eye"></i>
                            View

                        </button>

                    </div>

                </td>

            </tr>

        `;


        tableBody.insertAdjacentHTML(
            "beforeend",
            row
        );

    });

}


// =========================================================
// FILTER STUDENTS
// =========================================================

function applyFilters() {

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedClass =
        classFilter.value;


    const selectedSection =
        sectionFilter.value;


    const selectedGender =
        genderFilter.value;


    const filteredStudents =
        allStudents.filter(function (student) {


            // ---------------------------------------------
            // SEARCH
            // ---------------------------------------------

            const fullName =
                (student.fullName || "")
                    .toLowerCase();


            const admissionNo =
                (student.admissionNo || "")
                    .toLowerCase();


            const rollNo =
                (student.rollNo || "")
                    .toLowerCase();


            const matchesSearch =

                fullName.includes(keyword) ||

                admissionNo.includes(keyword) ||

                rollNo.includes(keyword);


            // ---------------------------------------------
            // CLASS
            // ---------------------------------------------

            const matchesClass =

                selectedClass === "All Classes" ||

                student.className === selectedClass;


            // ---------------------------------------------
            // SECTION
            // ---------------------------------------------

            const matchesSection =

                selectedSection === "All Sections" ||

                student.section === selectedSection;


            // ---------------------------------------------
            // GENDER
            // ---------------------------------------------

            const matchesGender =

                selectedGender === "All Genders" ||

                student.gender === selectedGender;


            return (

                matchesSearch &&

                matchesClass &&

                matchesSection &&

                matchesGender

            );

        });


    displayStudents(
        filteredStudents
    );

}


// =========================================================
// DASHBOARD CARDS
// =========================================================

function updateDashboardCards(students) {

    const total =
        students.length;


    const boys =
        students.filter(
            student =>
                student.gender === "Male"
        ).length;


    const girls =
        students.filter(
            student =>
                student.gender === "Female"
        ).length;


    /*
       For now, New Admissions displays
       the latest 5 students.

       Later we can calculate this
       based on actual admission date.
    */

    const newAdmissions =
        students.slice(-5).length;


    document.getElementById(
        "totalStudents"
    ).textContent = total;


    document.getElementById(
        "boysCount"
    ).textContent = boys;


    document.getElementById(
        "girlsCount"
    ).textContent = girls;


    document.getElementById(
        "newAdmissionsCount"
    ).textContent = newAdmissions;

}


// =========================================================
// EDIT STUDENT
// =========================================================

function editStudent(id) {

    const student =
        allStudents.find(
            s => s.studentId === id
        );


    if (!student) {

        alert("Student not found.");

        return;

    }


    editingStudentId = id;


    // -----------------------------------------------------
    // CHANGE MODAL TITLE
    // -----------------------------------------------------

    document.querySelector(
        ".modal-header h2"
    ).innerHTML =
        "Edit Student";


    // -----------------------------------------------------
    // STUDENT DETAILS
    // -----------------------------------------------------

    setValue(
        "fullName",
        student.fullName
    );


    setValue(
        "admissionNo",
        student.admissionNo
    );


    setValue(
        "rollNo",
        student.rollNo
    );


    setValue(
        "dateOfBirth",
        student.dateOfBirth
    );


    setValue(
        "gender",
        student.gender
    );


    setValue(
        "bloodGroup",
        student.bloodGroup
    );


    setValue(
        "nationality",
        student.nationality
    );


    setValue(
        "motherTongue",
        student.motherTongue
    );


    setValue(
        "religion",
        student.religion
    );


    setValue(
        "firstLanguage",
        student.firstLanguage
    );


    setValue(
        "secondLanguage",
        student.secondLanguage
    );


    setValue(
        "thirdLanguage",
        student.thirdLanguage
    );


    // -----------------------------------------------------
    // CLASS
    // -----------------------------------------------------

    setValue(
        "className",
        student.className
    );


    setValue(
        "section",
        student.section
    );


    // -----------------------------------------------------
    // ADDRESS
    // -----------------------------------------------------

    setValue(
        "currentAddress",
        student.currentAddress
    );


    setValue(
        "city",
        student.city
    );


    setValue(
        "state",
        student.state
    );


    setValue(
        "cityPincode",
        student.cityPincode
    );


    // -----------------------------------------------------
    // FATHER
    // -----------------------------------------------------

    setValue(
        "fatherName",
        student.fatherName
    );


    setValue(
        "fatherQualification",
        student.fatherQualification
    );


    setValue(
        "fatherCompany",
        student.fatherCompany
    );


    setValue(
        "fatherOccupation",
        student.fatherOccupation
    );


    // -----------------------------------------------------
    // MOTHER
    // -----------------------------------------------------

    setValue(
        "motherName",
        student.motherName
    );


    setValue(
        "motherQualification",
        student.motherQualification
    );


    setValue(
        "motherCompany",
        student.motherCompany
    );


    setValue(
        "motherOccupation",
        student.motherOccupation
    );


    // -----------------------------------------------------
    // OPEN MODAL
    // -----------------------------------------------------

    modal.style.display = "block";

}


// =========================================================
// ADD / UPDATE STUDENT
// =========================================================

studentForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // -------------------------------------------------
        // PINCODE VALIDATION
        // -------------------------------------------------

        const pincode =
            document.getElementById(
                "cityPincode"
            ).value.trim();


        if (
            pincode !== "" &&
            !/^\d{6}$/.test(pincode)
        ) {

            alert(
                "City Pincode must contain exactly 6 digits."
            );

            document.getElementById(
                "cityPincode"
            ).focus();

            return;

        }


        // -------------------------------------------------
        // COLLECT FORM DATA
        // -------------------------------------------------

        const studentData = {

            fullName:
                getValue("fullName"),

            admissionNo:
                getValue("admissionNo"),

            rollNo:
                getValue("rollNo"),

            dateOfBirth:
                getValue("dateOfBirth"),

            gender:
                getValue("gender"),

            bloodGroup:
                getValue("bloodGroup"),

            nationality:
                getValue("nationality"),

            motherTongue:
                getValue("motherTongue"),

            religion:
                getValue("religion"),

            firstLanguage:
                getValue("firstLanguage"),

            secondLanguage:
                getValue("secondLanguage"),

            thirdLanguage:
                getValue("thirdLanguage"),

            className:
                getValue("className"),

            section:
                getValue("section"),

            currentAddress:
                getValue("currentAddress"),

            city:
                getValue("city"),

            state:
                getValue("state"),

            cityPincode:
                pincode,

            fatherName:
                getValue("fatherName"),

            fatherQualification:
                getValue("fatherQualification"),

            fatherCompany:
                getValue("fatherCompany"),

            fatherOccupation:
                getValue("fatherOccupation"),

            motherName:
                getValue("motherName"),

            motherQualification:
                getValue("motherQualification"),

            motherCompany:
                getValue("motherCompany"),

            motherOccupation:
                getValue("motherOccupation"),

            status:
                "ACTIVE"

        };


        // -------------------------------------------------
        // DETERMINE ADD OR UPDATE
        // -------------------------------------------------

        const url =
            editingStudentId

                ? `${API_BASE}/${editingStudentId}`

                : API_BASE;


        const method =
            editingStudentId

                ? "PUT"

                : "POST";


        try {


            // -------------------------------------------------
            // SEND REQUEST
            // -------------------------------------------------

            const response =
                await fetch(
                    url,
                    {
                        method: method,

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                studentData
                            )
                    }
                );


            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            if (response.ok) {


                alert(
                    editingStudentId

                        ? "Student Updated Successfully"

                        : "Student Added Successfully"
                );


                modal.style.display =
                    "none";


                studentForm.reset();


                editingStudentId =
                    null;


                await loadStudents();


            } else {


                // ---------------------------------------------
                // TRY TO READ ERROR
                // ---------------------------------------------

                let errorMessage =
                    "Failed to save student.";


                try {

                    const errorData =
                        await response.text();

                    if (errorData) {

                        console.error(
                            "Server response:",
                            errorData
                        );

                    }

                } catch (e) {

                    console.error(e);

                }


                alert(
                    errorMessage
                );

            }


        } catch (error) {

            console.error(
                "Error saving student:",
                error
            );


            alert(
                "Error connecting to the server."
            );

        }

    }
);


// =========================================================
// VIEW STUDENT
// =========================================================

function viewStudent(id) {

    const student =
        allStudents.find(
            s => s.studentId === id
        );


    if (!student) {

        alert("Student not found.");

        return;

    }


    viewingStudentId = id;


    // -----------------------------------------------------
    // PHOTO
    // -----------------------------------------------------

    const photoUrl =
        student.studentPhoto ||
        "https://i.pravatar.cc/100";


    // -----------------------------------------------------
    // BUILD DETAILS
    // -----------------------------------------------------

    studentDetailsContent.innerHTML = `

        <img
            src="${escapeHtml(photoUrl)}"
            class="view-student-photo"
            alt="Student Photo"
            onerror="this.src='https://i.pravatar.cc/100'"
        >


        <!-- =============================================
             STUDENT DETAILS
        ============================================== -->

        <div class="details-section">

            <h3>
                Student Details
            </h3>


            <div class="details-grid">


                ${detailItem(
                    "Student Name",
                    student.fullName
                )}


                ${detailItem(
                    "Admission Number",
                    student.admissionNo
                )}


                ${detailItem(
                    "Roll Number",
                    student.rollNo
                )}


                ${detailItem(
                    "Date of Birth",
                    formatDate(student.dateOfBirth)
                )}


                ${detailItem(
                    "Gender",
                    student.gender
                )}


                ${detailItem(
                    "Blood Group",
                    student.bloodGroup
                )}


                ${detailItem(
                    "Nationality",
                    student.nationality
                )}


                ${detailItem(
                    "Mother Tongue",
                    student.motherTongue
                )}


                ${detailItem(
                    "Religion",
                    student.religion
                )}


                ${detailItem(
                    "First Language",
                    student.firstLanguage
                )}


                ${detailItem(
                    "Second Language",
                    student.secondLanguage
                )}


                ${detailItem(
                    "Third Language",
                    student.thirdLanguage
                )}


                ${detailItem(
                    "Class",
                    student.className
                )}


                ${detailItem(
                    "Section",
                    student.section
                )}

            </div>

        </div>



        <!-- =============================================
             ADDRESS
        ============================================== -->

        <div class="details-section">

            <h3>
                Address Details
            </h3>


            <div class="details-grid">


                ${detailItem(
                    "Residential Address",
                    student.currentAddress
                )}


                ${detailItem(
                    "City",
                    student.city
                )}


                ${detailItem(
                    "State",
                    student.state
                )}


                ${detailItem(
                    "City Pincode",
                    student.cityPincode
                )}

            </div>

        </div>



        <!-- =============================================
             FATHER
        ============================================== -->

        <div class="details-section">

            <h3>
                Father Details
            </h3>


            <div class="details-grid">


                ${detailItem(
                    "Father's Name",
                    student.fatherName
                )}


                ${detailItem(
                    "Qualification",
                    student.fatherQualification
                )}


                ${detailItem(
                    "Company",
                    student.fatherCompany
                )}


                ${detailItem(
                    "Occupation",
                    student.fatherOccupation
                )}

            </div>

        </div>



        <!-- =============================================
             MOTHER
        ============================================== -->

        <div class="details-section">

            <h3>
                Mother Details
            </h3>


            <div class="details-grid">


                ${detailItem(
                    "Mother's Name",
                    student.motherName
                )}


                ${detailItem(
                    "Qualification",
                    student.motherQualification
                )}


                ${detailItem(
                    "Company",
                    student.motherCompany
                )}


                ${detailItem(
                    "Occupation",
                    student.motherOccupation
                )}

            </div>

        </div>

    `;


    // -----------------------------------------------------
    // OPEN VIEW MODAL
    // -----------------------------------------------------

    viewModal.style.display =
        "block";

}


// =========================================================
// DELETE STUDENT FROM VIEW PAGE
// =========================================================

deleteStudentBtn.addEventListener(
    "click",
    async function () {


        if (!viewingStudentId) {

            return;

        }


        const student =
            allStudents.find(
                s =>
                    s.studentId ===
                    viewingStudentId
            );


        const studentName =
            student?.fullName ||
            "this student";


        const confirmed =
            confirm(
                `Are you sure you want to permanently delete ${studentName}?`
            );


        if (!confirmed) {

            return;

        }


        try {


            const response =
                await fetch(
                    `${API_BASE}/${viewingStudentId}`,
                    {
                        method: "DELETE"
                    }
                );


            if (response.ok) {


                alert(
                    "Student Deleted Successfully"
                );


                viewModal.style.display =
                    "none";


                viewingStudentId =
                    null;


                await loadStudents();


            } else {

                alert(
                    "Failed to delete student."
                );

            }


        } catch (error) {

            console.error(
                "Error deleting student:",
                error
            );


            alert(
                "Error connecting to the server."
            );

        }

    }
);


// =========================================================
// SEARCH / FILTER EVENTS
// =========================================================

searchInput.addEventListener(
    "input",
    applyFilters
);


classFilter.addEventListener(
    "change",
    applyFilters
);


sectionFilter.addEventListener(
    "change",
    applyFilters
);


genderFilter.addEventListener(
    "change",
    applyFilters
);


// =========================================================
// PINCODE INPUT
// Only numbers
// Maximum 6 digits
// =========================================================

const cityPincode =
    document.getElementById(
        "cityPincode"
    );


cityPincode.addEventListener(
    "input",
    function () {

        this.value =
            this.value
                .replace(/\D/g, "")
                .slice(0, 6);

    }
);


// =========================================================
// HELPER: SET VALUE
// =========================================================

function setValue(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.value =
            value ?? "";

    }

}


// =========================================================
// HELPER: GET VALUE
// =========================================================

function getValue(id) {

    const element =
        document.getElementById(id);


    if (!element) {

        return "";

    }


    return element.value.trim();

}


// =========================================================
// HELPER: FORMAT DATE
// =========================================================

function formatDate(date) {

    if (!date) {

        return "-";

    }


    const parts =
        date.split("-");


    if (parts.length !== 3) {

        return date;

    }


    return `${parts[2]}-${parts[1]}-${parts[0]}`;

}


// =========================================================
// HELPER: DETAIL ITEM
// =========================================================

function detailItem(label, value) {

    return `

        <div class="detail-item">

            <span class="detail-label">
                ${escapeHtml(label)}
            </span>

            <span class="detail-value">
                ${escapeHtml(
                    value || "-"
                )}
            </span>

        </div>

    `;

}


// =========================================================
// HELPER: ESCAPE HTML
// Prevents HTML injection when displaying database data
// =========================================================

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =========================================================
// INITIAL LOAD
// =========================================================

loadStudents();