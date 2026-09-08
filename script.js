const API_BASE = "https://loginpagepsabackend.onrender.com/api";

const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

/* =========================================================
   LOGIN SUBMISSION HANDLER
   ========================================================= */
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (errorMessage) errorMessage.textContent = "";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value.trim();

    if (!username) {
        errorMessage.textContent = "Username is required.";
        return;
    }
    if (!password) {
        errorMessage.textContent = "Password is required.";
        return;
    }
    if (!role) {
        errorMessage.textContent = "Please select a role.";
        return;
    }

    const loginButton = loginForm.querySelector("button[type='submit']");
    if (loginButton) {
        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";
    }

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password,
                role: role.toLowerCase()
            })
        });

        let result = {};
        try {
            result = await response.json();
        } catch (e) {
            result = {};
        }

        /* =================================================
           1. BACKEND RESPONSE SUCCESS
           ================================================= */
        if (response.ok && result.success !== false) {
            const returnedRole = (result.role || role).toUpperCase();

            localStorage.setItem("username", username);
            localStorage.setItem("userRole", returnedRole);

            if (returnedRole === "ADMIN") {
                window.location.href = "admin-home.html";
                return;
            }

            if (returnedRole === "TEACHER") {
                localStorage.setItem("teacherId", String(result.teacherId || "1"));
                window.location.href = "teacher-home.html";
                return;
            }

            if (returnedRole === "STUDENT") {
                localStorage.setItem("activeAdmissionNo", "ADM5B01");
                window.location.href = "student-home.html";
                return;
            }

            if (returnedRole === "PARENT") {
                window.location.href = "parent-dashboard.html";
                return;
            }

            errorMessage.textContent = "Role not supported.";
            return;
        }

        /* =================================================
           2. DEMO / OFFLINE BYPASS (Handles Inactive / Render Sleep)
           ================================================= */
        if (
            role.toLowerCase() === "student" &&
            (username.toLowerCase() === "student1" || username.toUpperCase() === "ADM5B01") &&
            password === "student123"
        ) {
            localStorage.setItem("username", username);
            localStorage.setItem("userRole", "STUDENT");
            localStorage.setItem("activeAdmissionNo", "ADM5B01");
            window.location.href = "student-home.html";
            return;
        }

        // Show backend error if not matched
        errorMessage.textContent = result.message || "Invalid username or password.";

    } catch (err) {
        console.warn("Server connection failed, checking demo credentials...", err);

        if (
            role.toLowerCase() === "student" &&
            (username.toLowerCase() === "student1" || username.toUpperCase() === "ADM5B01") &&
            password === "student123"
        ) {
            localStorage.setItem("username", username);
            localStorage.setItem("userRole", "STUDENT");
            localStorage.setItem("activeAdmissionNo", "ADM5B01");
            window.location.href = "student-home.html";
            return;
        }

        errorMessage.textContent = "Unable to connect to the server. Please try again.";
    } finally {
        if (loginButton) {
            loginButton.disabled = false;
            loginButton.textContent = "Login";
        }
    }
});