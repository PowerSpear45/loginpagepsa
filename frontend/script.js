const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;

    errorMessage.textContent = "";

    if (username === "") {
        errorMessage.textContent = "Username is required";
        return;
    }

    if (password === "") {
        errorMessage.textContent = "Password is required";
        return;
    }

    if (role === "") {
        errorMessage.textContent = "Please select a role";
        return;
    }

    const loginData = {
        username: username,
        password: password,
        role: role
    };

    try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();

        if (result.success) {
            localStorage.setItem("userRole", result.role);

            if (result.role === "ADMIN") {
                window.location.href = "admin-dashboard.html";
            } else if (result.role === "TEACHER") {
                window.location.href = "teacher-dashboard.html";
            } else if (result.role === "STUDENT") {
                window.location.href = "student-dashboard.html";
            } else if (result.role === "PARENT") {
                window.location.href = "parent-dashboard.html";
            }

        } else {
            errorMessage.textContent = result.message;
        }

    } catch (error) {
        errorMessage.textContent = "Server error. Please try again.";
        console.error(error);
    }
});