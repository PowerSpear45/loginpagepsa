const API_BASE_URL =
    "https://loginpagepsabackend.onrender.com/api";

document.addEventListener("DOMContentLoaded", function () {

    loadTeacherClasses();

});


/* =========================================================
   LOAD CLASSES
   ========================================================= */

async function loadTeacherClasses() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/class-sections`
        );

        if (!response.ok) {
            throw new Error("Failed to load classes");
        }

        const classes = await response.json();

        console.log("Classes from database:", classes);

        displayClasses(classes);

        updateSummary(classes);

    } catch (error) {

        console.error("Error loading classes:", error);

        showError(
            "Unable to load classes. Please try again."
        );

    }

}


/* =========================================================
   DISPLAY CLASSES
   ========================================================= */

function displayClasses(classes) {

    const tableBody =
        document.querySelector("tbody");

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";


    if (!classes || classes.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    No classes found.
                </td>
            </tr>
        `;

        return;
    }


    classes.forEach(function (classData, index) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${index + 1}
            </td>


            <td>
                <strong>
                    Class ${classData.className}
                </strong>
            </td>


            <td>

                <span class="section-badge">
                    ${classData.section}
                </span>

            </td>


            <td>
                —
            </td>


            <td>

                <span class="student-count">
                    ${classData.strength || 0}
                </span>

            </td>


            <td>
                ${classData.classTeacher || "Not Assigned"}
            </td>


            <td>

                <button
                    class="view-btn"
                    onclick="viewStudents(
                        '${classData.className}',
                        '${classData.section}'
                    )">

                    View Students

                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });

}


/* =========================================================
   UPDATE SUMMARY CARDS
   ========================================================= */

function updateSummary(classes) {

    const totalClasses =
        classes.length;


    let totalStudents = 0;


    classes.forEach(function (classData) {

        totalStudents +=
            Number(classData.strength || 0);

    });


    const summaryValues =
        document.querySelectorAll(
            ".summary-card strong"
        );


    if (summaryValues.length >= 3) {

        // Total Classes

        summaryValues[0].textContent =
            totalClasses;


        // Total Students

        summaryValues[1].textContent =
            totalStudents;


        // Subjects

        // Subject is not stored in class_section yet.

        summaryValues[2].textContent =
            "—";

    }


    const classCount =
        document.querySelector(".class-count");


    if (classCount) {

        classCount.textContent =
            `${totalClasses} ${
                totalClasses === 1
                    ? "Class"
                    : "Classes"
            }`;

    }

}


/* =========================================================
   VIEW STUDENTS
   ========================================================= */

function viewStudents(className, section) {

    window.location.href =
        `teacher-students.html?class=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}`;

}


/* =========================================================
   ERROR
   ========================================================= */

function showError(message) {

    const tableBody =
        document.querySelector("tbody");

    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `

        <tr>

            <td
                colspan="7"
                class="error-message"
            >

                ${message}

            </td>

        </tr>

    `;

}


/* =========================================================
   LOGOUT
   ========================================================= */

function logout() {

    localStorage.removeItem("userRole");

    window.location.href =
        "login.html";

}
