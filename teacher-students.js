const API_BASE_URL =
    "https://loginpagepsabackend.onrender.com/api";

let allStudents = [];


document.addEventListener("DOMContentLoaded", function () {

    loadStudents();

    const searchInput =
        document.getElementById("searchInput");

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                filterStudents(
                    searchInput.value.trim()
                );

            }
        );

    }

});


/* =========================================================
   LOAD STUDENTS
   ========================================================= */

async function loadStudents() {

    const params =
        new URLSearchParams(window.location.search);

    const className =
        params.get("class");

    const section =
        params.get("section");


    if (!className || !section) {

        showError(
            "Class information is missing."
        );

        return;
    }


    updateClassInformation(
        className,
        section
    );


    try {

        const response = await fetch(
            `${API_BASE_URL}/students/class/${encodeURIComponent(className)}/section/${encodeURIComponent(section)}`
        );


        if (!response.ok) {

            throw new Error(
                "Failed to load students"
            );

        }


        allStudents = await response.json();


        updateSummary(allStudents);

        displayStudents(allStudents);


    } catch (error) {

        console.error(
            "Error loading students:",
            error
        );

        showError(
            "Unable to load students. Please try again."
        );

    }

}


/* =========================================================
   UPDATE CLASS INFORMATION
   ========================================================= */

function updateClassInformation(
    className,
    section
) {

    const classTitle =
        document.getElementById("classTitle");

    const classDescription =
        document.getElementById("classDescription");

    const pageSubtitle =
        document.getElementById("pageSubtitle");


    if (classTitle) {

        classTitle.textContent =
            `Class ${className} - Section ${section}`;

    }


    if (classDescription) {

        classDescription.textContent =
            `Students assigned to Class ${className}, Section ${section}.`;

    }


    if (pageSubtitle) {

        pageSubtitle.textContent =
            `Class ${className} - Section ${section}`;

    }

}


/* =========================================================
   DISPLAY STUDENTS
   ========================================================= */

function displayStudents(students) {

    const tableBody =
        document.getElementById(
            "studentsTableBody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    if (!students || students.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-message">

                    No students found in this class.

                </td>

            </tr>

        `;

        return;
    }


    students.forEach(
        function (student, index) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>

                    <div class="student-name">

                        ${
                            student.studentPhoto
                            ?
                            `<img
                                src="${student.studentPhoto}"
                                class="student-photo"
                                alt="Student">`
                            :
                            `<div class="student-photo-placeholder">
                                👨‍🎓
                             </div>`
                        }

                        <strong>
                            ${escapeHtml(
                                student.fullName || "-"
                            )}
                        </strong>

                    </div>

                </td>

                <td>
                    ${escapeHtml(
                        student.admissionNo || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        student.rollNo || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        student.gender || "-"
                    )}
                </td>

                <td>
                    ${
                        student.dateOfBirth
                        ?
                        formatDate(
                            student.dateOfBirth
                        )
                        :
                        "-"
                    }
                </td>

                <td>

                    <span class="status-badge ${
                        String(student.status || "")
                            .toLowerCase() === "active"
                            ? "active"
                            : "inactive"
                    }">

                        ${escapeHtml(
                            student.status || "-"
                        )}

                    </span>

                </td>

            `;


            tableBody.appendChild(row);

        }
    );

}


/* =========================================================
   SEARCH / FILTER
   ========================================================= */

function filterStudents(searchText) {

    const search =
        searchText.toLowerCase();


    if (search === "") {

        displayStudents(allStudents);

        return;

    }


    const filteredStudents =
        allStudents.filter(
            function (student) {

                return (

                    String(
                        student.fullName || ""
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        student.rollNo || ""
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        student.admissionNo || ""
                    )
                    .toLowerCase()
                    .includes(search)

                );

            }
        );


    displayStudents(
        filteredStudents
    );

}


/* =========================================================
   SUMMARY
   ========================================================= */

function updateSummary(students) {

    const total =
        students.length;


    const male =
        students.filter(
            function (student) {

                return String(
                    student.gender || ""
                )
                .toLowerCase() === "male";

            }
        ).length;


    const female =
        students.filter(
            function (student) {

                return String(
                    student.gender || ""
                )
                .toLowerCase() === "female";

            }
        ).length;


    document.getElementById(
        "totalStudents"
    ).textContent = total;


    document.getElementById(
        "maleStudents"
    ).textContent = male;


    document.getElementById(
        "femaleStudents"
    ).textContent = female;


    document.getElementById(
        "studentCount"
    ).textContent =
        `${total} ${
            total === 1
                ? "Student"
                : "Students"
        }`;

}


/* =========================================================
   BACK
   ========================================================= */

function goBack() {

    window.location.href =
        "teacher-classes.html";

}


/* =========================================================
   LOGOUT
   ========================================================= */

function logout() {

    localStorage.removeItem(
        "userRole"
    );

    window.location.href =
        "login.html";

}


/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(dateString) {

    const date =
        new Date(dateString);


    if (isNaN(date.getTime())) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   HTML SAFETY
   ========================================================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   ERROR
   ========================================================= */

function showError(message) {

    const tableBody =
        document.getElementById(
            "studentsTableBody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `

        <tr>

            <td
                colspan="7"
                class="error-message">

                ${escapeHtml(message)}

            </td>

        </tr>

    `;

}