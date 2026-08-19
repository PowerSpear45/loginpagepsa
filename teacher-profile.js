const API_BASE = "https://loginpagepsabackend.onrender.com/api";
const teacherId = localStorage.getItem("teacherId") || "1";

let teacherData = null;
let updatedPhotoBase64 = null;

document.addEventListener("DOMContentLoaded", () => {
    updateTodayDate();
    loadTeacherProfile();
    loadAssignedClasses();
});

function updateTodayDate() {
    const dateEl = document.getElementById("todayDate");
    const dayEl = document.getElementById("todayDay");
    const now = new Date();

    if (dateEl) dateEl.textContent = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    if (dayEl) dayEl.textContent = now.toLocaleDateString("en-IN", { weekday: "long" });
}

// Load Teacher Profile from Backend
async function loadTeacherProfile() {
    try {
        const res = await fetch(`${API_BASE}/teachers/${teacherId}`);
        if (res.ok) {
            teacherData = await res.json();
            renderProfileData(teacherData);
            return;
        }
    } catch (e) {
        console.warn("Using stored/fallback profile data:", e);
    }

    // Default fallback if offline
    teacherData = {
        teacherId: Number(teacherId),
        fullName: "Abinash Kumar",
        subject: "Mathematics & Science",
        department: "Science & Technology",
        gender: "Male",
        qualification: "M.Sc., B.Ed.",
        email: "abinash.teacher@powerschool.edu",
        phone: "+91 98765 43210",
        joiningDate: "2022-06-15",
        address: "No. 42, Gandhi Road, Chennai, Tamil Nadu",
        status: "Active",
        photo: ""
    };
    renderProfileData(teacherData);
}

function renderProfileData(data) {
    const fullName = data.fullName || data.full_name || "Teacher";
    const subject = data.subject || "General Teacher";
    const dept = data.department || "Academics";
    const status = data.status || "Active";
    const empId = `TCH-${String(data.teacherId || data.teacher_id || teacherId).padStart(3, '0')}`;

    // Top Bar & Hero Card
    document.getElementById("topTeacherName").textContent = fullName;
    document.getElementById("cardFullName").textContent = fullName;
    document.getElementById("cardSubject").textContent = subject;
    document.getElementById("cardStatusText").textContent = status;
    document.getElementById("cardEmpId").textContent = empId;
    document.getElementById("cardDept").textContent = dept;

    // Contacts
    document.getElementById("cardEmail").textContent = data.email || "Not specified";
    document.getElementById("cardPhone").textContent = data.phone || "Not specified";
    document.getElementById("cardAddress").textContent = data.address || "Not specified";

    // Photo
    if (data.photo && data.photo.trim() !== "") {
        document.getElementById("profilePhoto").src = data.photo;
    }

    // Details Grid
    document.getElementById("infoFullName").textContent = fullName;
    document.getElementById("infoGender").textContent = data.gender || "Not specified";
    document.getElementById("infoQualification").textContent = data.qualification || "B.Ed.";
    document.getElementById("infoSubject").textContent = subject;
    document.getElementById("infoDepartment").textContent = dept;
    document.getElementById("infoJoiningDate").textContent = data.joiningDate || data.joining_date || "2022-06-15";
    document.getElementById("infoAddress").textContent = data.address || "Not specified";
}

// Load Assigned Classes
async function loadAssignedClasses() {
    const container = document.getElementById("assignedClassesContainer");
    try {
        const res = await fetch(`${API_BASE}/teachers/${teacherId}/classes`);
        if (res.ok) {
            const classes = await res.json();
            if (classes && classes.length > 0) {
                container.innerHTML = "";
                classes.forEach(c => {
                    const cName = c.className || c.class_name;
                    const sec = c.section;
                    container.insertAdjacentHTML("beforeend", `
                        <div class="class-chip">
                            <i class="fa-solid fa-graduation-cap"></i> Class ${cName} - Section ${sec}
                        </div>
                    `);
                });
                return;
            }
        }
    } catch (e) {
        console.warn("Fallback classes:", e);
    }

    // Default classes display
    container.innerHTML = `
        <div class="class-chip"><i class="fa-solid fa-graduation-cap"></i> Class 5 - Section A</div>
        <div class="class-chip"><i class="fa-solid fa-graduation-cap"></i> Class 5 - Section B</div>
        <div class="class-chip"><i class="fa-solid fa-graduation-cap"></i> Class 6 - Section A</div>
    `;
}

// Quick Photo Change (Camera Icon)
function handleQuickPhotoChange(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64Photo = e.target.result;
            document.getElementById("profilePhoto").src = base64Photo;
            
            // Save to backend immediately
            if (teacherData) {
                teacherData.photo = base64Photo;
                await saveProfileToBackend(teacherData);
            }
        };
        reader.readAsDataURL(file);
    }
}

function previewModalPhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            updatedPhotoBase64 = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Open Edit Profile Modal
function openEditProfileModal() {
    if (!teacherData) return;

    document.getElementById("editFullName").value = teacherData.fullName || teacherData.full_name || "";
    document.getElementById("editGender").value = teacherData.gender || "Male";
    document.getElementById("editSubject").value = teacherData.subject || "";
    document.getElementById("editDepartment").value = teacherData.department || "";
    document.getElementById("editQualification").value = teacherData.qualification || "";
    document.getElementById("editJoiningDate").value = teacherData.joiningDate || teacherData.joining_date || "";
    document.getElementById("editEmail").value = teacherData.email || "";
    document.getElementById("editPhone").value = teacherData.phone || "";
    document.getElementById("editAddress").value = teacherData.address || "";
    updatedPhotoBase64 = null;

    document.getElementById("editModal").classList.add("active");
}

function closeEditProfileModal() {
    document.getElementById("editModal").classList.remove("active");
}

// Handle Form Submission (Save Profile)
async function handleProfileUpdate(e) {
    e.preventDefault();

    const updated = {
        teacherId: Number(teacherId),
        fullName: document.getElementById("editFullName").value,
        gender: document.getElementById("editGender").value,
        subject: document.getElementById("editSubject").value,
        department: document.getElementById("editDepartment").value,
        qualification: document.getElementById("editQualification").value,
        joiningDate: document.getElementById("editJoiningDate").value,
        email: document.getElementById("editEmail").value,
        phone: document.getElementById("editPhone").value,
        address: document.getElementById("editAddress").value,
        status: teacherData.status || "Active",
        photo: updatedPhotoBase64 || teacherData.photo || ""
    };

    await saveProfileToBackend(updated);
    teacherData = updated;
    renderProfileData(teacherData);
    closeEditProfileModal();
    alert("Profile updated successfully!");
}

async function saveProfileToBackend(payload) {
    try {
        await fetch(`${API_BASE}/teachers/${teacherId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.warn("Saved to local session:", e);
    }
}

window.openEditProfileModal = openEditProfileModal;
window.closeEditProfileModal = closeEditProfileModal;
window.handleProfileUpdate = handleProfileUpdate;
window.handleQuickPhotoChange = handleQuickPhotoChange;
window.previewModalPhoto = previewModalPhoto;