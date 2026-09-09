/**
 * Student Read-Only Profile Controller
 * Power Public School ERP
 */

const API_BASE = "https://loginpagepsabackend.onrender.com/api";
const TARGET_ADMISSION_NO = localStorage.getItem("activeAdmissionNo") || "ADM5B01";

document.addEventListener("DOMContentLoaded", async () => {
    updateTodayDate();
    await loadStudentFullProfile();
});

function updateTodayDate() {
    const now = new Date();
    const dateVal = document.getElementById("currentDateVal");
    const dayVal = document.getElementById("currentDayVal");

    if (dateVal) dateVal.textContent = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    if (dayVal) dayVal.textContent = now.toLocaleDateString("en-IN", { weekday: "long" });
}

async function loadStudentFullProfile() {
    let student = null;

    try {
        const res = await fetch(`${API_BASE}/students`);
        if (res.ok) {
            const list = await res.json();
            // Look up logged-in student (V.S.Sakthivel / ADM5B01)
            student = list.find(s => 
                (s.admissionNo && s.admissionNo.toUpperCase() === TARGET_ADMISSION_NO) ||
                (s.admission_no && s.admission_no.toUpperCase() === TARGET_ADMISSION_NO)
            );
        }
    } catch (e) {
        console.warn("Unable to fetch students list from DB, loading fallback:", e);
    }

    if (!student) {
        student = getFallbackStudentProfile();
    }

    renderProfile(student);
}

function renderProfile(student) {
    const fullName = student.fullName || student.full_name || "V.S.Sakthivel";
    const admNo = student.admissionNo || student.admission_no || "ADM5B01";
    const rollNo = student.rollNo || student.roll_no || "20265001";
    const className = student.className || student.class_name || "5";
    const section = student.section || "B";
    const status = student.status || "Active";

    // Top Bar Metadata
    document.getElementById("topStudentName").textContent = fullName;
    document.getElementById("topClassSection").textContent = `${className}-${section}`;
    document.getElementById("topRollNo").textContent = rollNo;

    // Photos
    const avatarUrl = student.studentPhoto || student.student_photo || student.photo || student.photoUrl || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1f3f6d&color=ffffff`;
    document.getElementById("studentAvatar").src = avatarUrl;
    document.getElementById("profileBigPhoto").src = avatarUrl;

    // Left Identity Hero Card
    document.getElementById("cardFullName").textContent = fullName;
    document.getElementById("cardAdmissionNo").textContent = admNo;
    document.getElementById("cardStatus").textContent = `${status} Student`;
    document.getElementById("cardClass").textContent = className;
    document.getElementById("cardSection").textContent = section;
    document.getElementById("cardRollNo").textContent = rollNo;

    // Section 1: Personal & Academic
    document.getElementById("infoDob").textContent = student.dateOfBirth || student.date_of_birth || "14 Feb 2015";
    document.getElementById("infoGender").textContent = student.gender || "Male";
    document.getElementById("infoBloodGroup").textContent = student.bloodGroup || student.blood_group || "O+";
    document.getElementById("infoMotherTongue").textContent = student.motherTongue || student.mother_tongue || "Tamil";
    document.getElementById("infoNationality").textContent = student.nationality || "Indian";
    document.getElementById("infoReligion").textContent = student.religion || "Hindu";

    // Section 2: Language Preferences
    document.getElementById("infoFirstLang").textContent = student.firstLanguage || student.first_language || "Tamil";
    document.getElementById("infoSecondLang").textContent = student.secondLanguage || student.second_language || "English";
    document.getElementById("infoThirdLang").textContent = student.thirdLanguage || student.third_language || "Hindi";

    // Section 3: Parent & Guardian Details
    const p = student.parentDetails || student.parent_details || {};
    document.getElementById("infoFatherName").textContent = p.fatherName || p.father_name || "S. Veerappan";
    document.getElementById("infoFatherOccupation").textContent = p.fatherOccupation || p.father_occupation || "Senior Engineer";
    document.getElementById("infoMotherName").textContent = p.motherName || p.mother_name || "V. Selvi";
    document.getElementById("infoMotherOccupation").textContent = p.motherOccupation || p.mother_occupation || "Teacher";

    // Section 4: Residential Address
    const addr = student.currentAddress || student.current_address || "No. 14, Kamarajar Street, Anna Nagar";
    const city = student.city || "Chennai";
    const state = student.state || "Tamil Nadu";
    const pin = student.cityPincode || student.city_pincode || "600040";

    document.getElementById("infoFullAddress").textContent = `${addr}`;
    document.getElementById("infoCityPin").textContent = `${city}, ${state} - ${pin}`;
}

function getFallbackStudentProfile() {
    return {
        studentId: 1,
        fullName: "V.S.Sakthivel",
        admissionNo: "ADM5B01",
        rollNo: "20265001",
        className: "5",
        section: "B",
        gender: "Male",
        status: "Active",
        dateOfBirth: "2015-02-14",
        bloodGroup: "O+",
        nationality: "Indian",
        motherTongue: "Tamil",
        religion: "Hindu",
        firstLanguage: "Tamil",
        secondLanguage: "English",
        thirdLanguage: "Hindi",
        currentAddress: "No. 14, Kamarajar Street, Anna Nagar",
        city: "Chennai",
        state: "Tamil Nadu",
        cityPincode: "600040",
        parentDetails: {
            fatherName: "S. Veerappan",
            fatherOccupation: "Senior Engineer",
            motherName: "V. Selvi",
            motherOccupation: "Teacher"
        }
    };
}

function logoutStudent() {
    localStorage.removeItem("activeStudentId");
    localStorage.removeItem("activeAdmissionNo");
    window.location.href = "login.html";
}