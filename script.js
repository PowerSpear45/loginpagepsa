async function handleLogin(e) {
    e.preventDefault();

    const usernameInput = document.getElementById("username").value.trim();
    const passwordInput = document.getElementById("password").value.trim();
    const roleInput = document.getElementById("role") ? document.getElementById("role").value.toLowerCase() : "teacher";

    // Direct match check or API call
    try {
        const response = await fetch("https://loginpagepsabackend.onrender.com/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput,
                role: roleInput
            })
        });

        if (response.ok) {
            const data = await response.json();
            
            // Set user credentials & master teacher ID
            localStorage.setItem("username", usernameInput);
            localStorage.setItem("role", data.role || roleInput);
            localStorage.setItem("teacherId", data.teacherId || "1");

            // Redirect based on role
            if (roleInput === "admin") {
                window.location.href = "admin-home.html";
            } else {
                window.location.href = "teacher-home.html";
            }
            return;
        }
    } catch (err) {
        console.warn("Backend auth offline, checking direct master credentials:", err);
    }

    // Master Client-Side Fallback for teacher1
    if (usernameInput === "teacher1" && passwordInput === "teacher123") {
        localStorage.setItem("username", "teacher1");
        localStorage.setItem("role", "teacher");
        localStorage.setItem("teacherId", "1");
        alert("Login successful!");
        window.location.href = "teacher-home.html";
    } else if (usernameInput === "admin" && passwordInput === "admin123") {
        localStorage.setItem("username", "admin");
        localStorage.setItem("role", "admin");
        window.location.href = "admin-home.html";
    } else {
        alert("Invalid username or password!");
    }
}