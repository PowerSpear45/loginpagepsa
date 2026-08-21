const API_BASE =
    "https://loginpagepsabackend.onrender.com/api";

const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");


/* =========================================================
   LOGIN FORM
   ========================================================= */

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    // Clear previous error
    errorMessage.textContent = "";

    // Get form values
    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value.trim();

    const role =
        document.getElementById("role").value.trim();


    /* =====================================================
       VALIDATION
       ===================================================== */

    if (username === "") {
        errorMessage.textContent = "Username is required.";
        return;
    }

    if (password === "") {
        errorMessage.textContent = "Password is required.";
        return;
    }

    if (role === "") {
        errorMessage.textContent = "Please select a role.";
        return;
    }


    /* =====================================================
       LOGIN DATA
       ===================================================== */

    const loginData = {
        username: username,
        password: password,
        role: role
    };


    // Disable button while logging in
    const loginButton =
        loginForm.querySelector("button[type='submit']");

    if (loginButton) {
        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";
    }


    /* =====================================================
       SEND LOGIN REQUEST
       ===================================================== */

    try {

        const response = await fetch(
            `${API_BASE}/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(loginData)
            }
        );


        /* =================================================
           READ RESPONSE
           ================================================= */

        let result = {};

        try {
            result = await response.json();
        } catch (jsonError) {
            result = {};
        }


        console.log("Login response:", result);


        /* =================================================
           LOGIN FAILED
           ================================================= */

        if (!response.ok || result.success === false) {

            errorMessage.textContent =
                result.message ||
                "Invalid username or password.";

            return;
        }


        /* =================================================
           DETERMINE ROLE
           ================================================= */

        const returnedRole =
            result.role || role;

        const normalizedRole =
            String(returnedRole).toUpperCase();


        /* =================================================
           SAVE LOGIN INFORMATION
           ================================================= */

        localStorage.setItem(
            "username",
            username
        );

        localStorage.setItem(
            "userRole",
            normalizedRole
        );


        /*
         * Your current project uses one teacher.
         *
         * If the backend returns teacherId,
         * use that value.
         *
         * Otherwise use teacher ID 1.
         */

        if (result.teacherId !== undefined &&
            result.teacherId !== null &&
            result.teacherId !== "") {

            localStorage.setItem(
                "teacherId",
                String(result.teacherId)
            );

        } else if (normalizedRole === "TEACHER") {

            localStorage.setItem(
                "teacherId",
                "1"
            );
        }


        /* =================================================
           REDIRECT BASED ON ROLE
           ================================================= */

        if (normalizedRole === "ADMIN") {

            window.location.href =
                "admin-home.html";

        }

        else if (normalizedRole === "TEACHER") {

            window.location.href =
                "teacher-home.html";

        }

        else if (normalizedRole === "STUDENT") {

            window.location.href =
                "student-dashboard.html";

        }

        else if (normalizedRole === "PARENT") {

            window.location.href =
                "parent-dashboard.html";

        }

        else {

            errorMessage.textContent =
                "Login successful, but the user role is not supported.";

        }

    }


    /* =====================================================
       SERVER / NETWORK ERROR
       ===================================================== */

    catch (error) {

        console.error(
            "Login request failed:",
            error
        );

        errorMessage.textContent =
            "Unable to connect to the server. Please try again.";

    }


    /* =====================================================
       ENABLE LOGIN BUTTON AGAIN
       ===================================================== */

    finally {

        if (loginButton) {

            loginButton.disabled = false;
            loginButton.textContent = "Login";

        }

    }

});