const form = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    message.textContent = "Opening Admin Panel...";
    message.className = "form-message";

    setTimeout(() => {
        window.location.href = "admin.html";
    }, 300);
});