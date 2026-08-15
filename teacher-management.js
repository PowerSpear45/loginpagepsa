const API_URL = "https://loginpagepsabackend.onrender.com/api/teachers";

let teachers = [];
let editTeacherId = null;
let currentPhoto = "";

const teacherTableBody = document.getElementById("teacherTableBody");
const teacherForm = document.getElementById("teacherForm");
const teacherModal = document.getElementById("teacherModal");

const openTeacherModal = document.getElementById("openTeacherModal");
const closeTeacherModal = document.getElementById("closeTeacherModal");
const cancelTeacherBtn = document.getElementById("cancelTeacherBtn");

const departmentFilter = document.getElementById("departmentFilter");
const subjectFilter = document.getElementById("subjectFilter");
const searchInput = document.getElementById("searchInput");

const teacherPhoto = document.getElementById("teacherPhoto");
const teacherPhotoPreview = document.getElementById("teacherPhotoPreview");
const photoPlaceholder = document.getElementById("photoPlaceholder");

const teacherIdInput = document.getElementById("teacherId");
const teacherModalTitle = document.getElementById("teacherModalTitle");


// =====================================================
// DATE
// =====================================================

function displayDate() {

    const todayDate = document.getElementById("todayDate");

    const today = new Date();

    const options = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        weekday: "long"
    };

    todayDate.textContent =
        today.toLocaleDateString("en-IN", options);
}


// =====================================================
// TEACHER ID DISPLAY
// =====================================================

function formatTeacherId(id) {

    if (!id) return "";

    return "TCH" + String(id).padStart(4, "0");
}


// =====================================================
// LOAD TEACHERS
// =====================================================

async function loadTeachers() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load teachers");
        }

        teachers = await response.json();

        renderTeachers();

    } catch (error) {

        console.error("Error loading teachers:", error);

        alert("Unable to load teachers from server.");
    }
}


// =====================================================
// RENDER TEACHERS
// =====================================================

function renderTeachers() {

    teacherTableBody.innerHTML = "";

    const searchText =
        searchInput.value.toLowerCase();

    const selectedDepartment =
        departmentFilter.value;

    const selectedSubject =
        subjectFilter.value;


    const filteredTeachers = teachers.filter(teacher => {

        const fullName =
            (teacher.fullName || "").toLowerCase();

        const teacherId =
            String(teacher.teacherId || "").toLowerCase();

        const subject =
            (teacher.subject || "").toLowerCase();

        const department =
            teacher.department || "";

        const matchesSearch =
            fullName.includes(searchText) ||
            teacherId.includes(searchText) ||
            subject.includes(searchText);

        const matchesDepartment =
            selectedDepartment === "" ||
            department === selectedDepartment;

        const matchesSubject =
            selectedSubject === "" ||
            teacher.subject === selectedSubject;

        return (
            matchesSearch &&
            matchesDepartment &&
            matchesSubject
        );
    });


    filteredTeachers.forEach((teacher, index) => {

        const row = document.createElement("tr");


        const photoHTML = teacher.photo
            ? `<img src="${teacher.photo}" 
                    alt="Teacher Photo"
                    onerror="this.style.display='none'">`
            : `<div class="default-teacher-photo">
                    <i class="fa-solid fa-user"></i>
               </div>`;


        row.innerHTML = `

            <td>${index + 1}</td>

            <td>
                ${photoHTML}
            </td>

            <td>${teacher.fullName || "-"}</td>

            <td>${formatTeacherId(teacher.teacherId)}</td>

            <td>${teacher.department || "-"}</td>

            <td>${teacher.subject || "-"}</td>

            <td>${teacher.qualification || "-"}</td>

            <td>

                <button
                    class="action-btn edit-action"
                    onclick="editTeacher(${teacher.teacherId})">

                    <i class="fa-solid fa-pen"></i>

                </button>


                <button
                    class="action-btn delete-action"
                    onclick="deleteTeacher(${teacher.teacherId})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>
        `;


        teacherTableBody.appendChild(row);

    });


    updateCards();
}


// =====================================================
// DASHBOARD CARDS
// =====================================================

function updateCards() {

    document.getElementById("totalTeachers").textContent =
        teachers.length;


    document.getElementById("maleTeachers").textContent =
        teachers.filter(
            teacher => teacher.gender === "Male"
        ).length;


    document.getElementById("femaleTeachers").textContent =
        teachers.filter(
            teacher => teacher.gender === "Female"
        ).length;


    const currentMonth =
        new Date().getMonth();

    const currentYear =
        new Date().getFullYear();


    const newTeachers = teachers.filter(teacher => {

        if (!teacher.joiningDate) {
            return false;
        }

        const joining =
            new Date(teacher.joiningDate);

        return (
            joining.getMonth() === currentMonth &&
            joining.getFullYear() === currentYear
        );
    });


    document.getElementById("newTeachers").textContent =
        newTeachers.length;
}


// =====================================================
// PHOTO COMPRESSION
// =====================================================

function compressImage(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = function(event) {

            const img = new Image();

            img.onload = function() {

                const canvas =
                    document.createElement("canvas");

                const MAX_SIZE = 300;

                let width = img.width;
                let height = img.height;


                if (width > height) {

                    if (width > MAX_SIZE) {

                        height =
                            height * MAX_SIZE / width;

                        width = MAX_SIZE;
                    }

                } else {

                    if (height > MAX_SIZE) {

                        width =
                            width * MAX_SIZE / height;

                        height = MAX_SIZE;
                    }
                }


                canvas.width = width;
                canvas.height = height;


                const ctx =
                    canvas.getContext("2d");

                ctx.drawImage(
                    img,
                    0,
                    0,
                    width,
                    height
                );


                const compressedImage =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.75
                    );


                resolve(compressedImage);
            };


            img.onerror = reject;

            img.src = event.target.result;
        };


        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}


// =====================================================
// PHOTO UPLOAD
// =====================================================

teacherPhoto.addEventListener("change", async function() {

    const file = this.files[0];

    if (!file) {
        return;
    }


    // Maximum original upload size = 5 MB

    if (file.size > 5 * 1024 * 1024) {

        alert(
            "Photo is too large.\nPlease select an image below 5 MB."
        );

        this.value = "";

        return;
    }


    try {

        currentPhoto =
            await compressImage(file);


        teacherPhotoPreview.src =
            currentPhoto;

        teacherPhotoPreview.style.display =
            "block";

        photoPlaceholder.style.display =
            "none";


    } catch (error) {

        console.error(
            "Photo processing failed:",
            error
        );

        alert("Unable to process this photo.");
    }

});


// =====================================================
// OPEN MODAL
// =====================================================

function openModal() {

    teacherModal.style.display = "block";
}


// =====================================================
// CLOSE MODAL
// =====================================================

function closeModal() {

    teacherModal.style.display = "none";

    teacherForm.reset();

    editTeacherId = null;

    currentPhoto = "";

    teacherIdInput.value = "";

    teacherModalTitle.textContent =
        "Add New Teacher";

    document.querySelector(".submit-btn").textContent =
        "Save Teacher";


    teacherPhotoPreview.src = "";

    teacherPhotoPreview.style.display =
        "none";

    photoPlaceholder.style.display =
        "flex";
}


// =====================================================
// ADD TEACHER BUTTON
// =====================================================

openTeacherModal.addEventListener("click", () => {

    editTeacherId = null;

    currentPhoto = "";

    teacherForm.reset();

    teacherIdInput.value =
        "Generated automatically after saving";

    teacherModalTitle.textContent =
        "Add New Teacher";

    document.querySelector(".submit-btn").textContent =
        "Save Teacher";

    teacherPhotoPreview.src = "";

    teacherPhotoPreview.style.display =
        "none";

    photoPlaceholder.style.display =
        "flex";

    openModal();
});


// =====================================================
// CLOSE BUTTONS
// =====================================================

closeTeacherModal.addEventListener(
    "click",
    closeModal
);

cancelTeacherBtn.addEventListener(
    "click",
    closeModal
);


// =====================================================
// CLICK OUTSIDE MODAL
// =====================================================

window.addEventListener("click", event => {

    if (event.target === teacherModal) {

        closeModal();
    }
});


// =====================================================
// SAVE / UPDATE TEACHER
// =====================================================

teacherForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        try {

            const teacherData = {

                fullName:
                    document
                        .getElementById("teacherName")
                        .value
                        .trim(),

                gender:
                    document
                        .getElementById("gender")
                        .value,

                department:
                    document
                        .getElementById("department")
                        .value,

                subject:
                    document
                        .getElementById("subject")
                        .value
                        .trim(),

                qualification:
                    document
                        .getElementById("qualification")
                        .value
                        .trim(),

                email:
                    document
                        .getElementById("email")
                        .value
                        .trim(),

                phone:
                    document
                        .getElementById("phone")
                        .value
                        .trim(),

                joiningDate:
                    document
                        .getElementById("joiningDate")
                        .value,

                status:
                    document
                        .getElementById("status")
                        .value
                        .toUpperCase(),

                address:
                    document
                        .getElementById("address")
                        .value
                        .trim(),

                photo:
                    currentPhoto || null
            };


            // =========================================
            // ADD
            // =========================================

            if (editTeacherId === null) {

                const response =
                    await fetch(API_URL, {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(teacherData)
                    });


                if (!response.ok) {

                    const errorText =
                        await response.text();

                    console.error(
                        "Server error:",
                        errorText
                    );

                    throw new Error(
                        "Failed to save teacher"
                    );
                }


                const savedTeacher =
                    await response.json();


                alert(
                    "Teacher saved successfully!\n\nTeacher ID: " +
                    formatTeacherId(
                        savedTeacher.teacherId
                    )
                );

            }


            // =========================================
            // UPDATE
            // =========================================

            else {

                const response =
                    await fetch(
                        `${API_URL}/${editTeacherId}`,
                        {

                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    teacherData
                                )
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Failed to update teacher"
                    );
                }


                alert(
                    "Teacher updated successfully!"
                );
            }


            closeModal();

            await loadTeachers();


        } catch (error) {

            console.error(
                "Save error:",
                error
            );

            alert(
                "Unable to save teacher.\n\n" +
                "Please check the backend connection."
            );
        }

    }
);


// =====================================================
// EDIT TEACHER
// =====================================================

function editTeacher(id) {

    const teacher =
        teachers.find(
            teacher =>
                teacher.teacherId === id
        );


    if (!teacher) {

        alert("Teacher not found.");

        return;
    }


    editTeacherId = id;


    document.getElementById("teacherName").value =
        teacher.fullName || "";


    document.getElementById("gender").value =
        teacher.gender || "";


    document.getElementById("department").value =
        teacher.department || "";


    document.getElementById("subject").value =
        teacher.subject || "";


    document.getElementById("qualification").value =
        teacher.qualification || "";


    document.getElementById("email").value =
        teacher.email || "";


    document.getElementById("phone").value =
        teacher.phone || "";


    document.getElementById("joiningDate").value =
        teacher.joiningDate || "";


    document.getElementById("status").value =
        teacher.status || "ACTIVE";


    document.getElementById("address").value =
        teacher.address || "";


    // Show existing ID

    teacherIdInput.value =
        formatTeacherId(
            teacher.teacherId
        );


    // Keep existing photo

    currentPhoto =
        teacher.photo || "";


    if (teacher.photo) {

        teacherPhotoPreview.src =
            teacher.photo;

        teacherPhotoPreview.style.display =
            "block";

        photoPlaceholder.style.display =
            "none";

    } else {

        teacherPhotoPreview.src = "";

        teacherPhotoPreview.style.display =
            "none";

        photoPlaceholder.style.display =
            "flex";
    }


    teacherModalTitle.textContent =
        "Edit Teacher";


    document.querySelector(".submit-btn").textContent =
        "Update Teacher";


    openModal();
}


// =====================================================
// DELETE TEACHER
// =====================================================

async function deleteTeacher(id) {

    const teacher =
        teachers.find(
            teacher =>
                teacher.teacherId === id
        );


    if (!teacher) {
        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to delete ${teacher.fullName}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Delete failed"
            );
        }


        alert(
            "Teacher deleted successfully."
        );


        await loadTeachers();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Unable to delete teacher."
        );
    }
}


// =====================================================
// FILTERS
// =====================================================

departmentFilter.addEventListener(
    "change",
    renderTeachers
);

subjectFilter.addEventListener(
    "change",
    renderTeachers
);

searchInput.addEventListener(
    "input",
    renderTeachers
);


// =====================================================
// START
// =====================================================

displayDate();

loadTeachers();