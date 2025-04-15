// document.getElementById("loginForm").addEventListener("submit", async function (e) {
//     e.preventDefault();

//     const email = document.getElementById("email").value;
//     const password = document.getElementById("password").value;

//     try {
//         const response = await fetch("/auth/login", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email, password })
//         });

//         const data = await response.json();

//         if (data.success) {
//             // ✅ Redirect to the dashboard after successful login
//             window.location.href = data.redirect;
//         } else {
//             alert(data.message);
//         }

//     } catch (error) {
//         console.error("❌ Login Error:", error);
//         alert("An error occurred while logging in.");
//     }
// });


// Proceed to Upload
function proceedToUpload() {
    let docType = document.getElementById('documentType').value;
    sessionStorage.setItem('selectedDoc', docType);
    window.location.href = "upload.html";
}

// Upload API Call
document.getElementById('uploadForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    alert("Documents uploaded successfully! Your request will be processed.");
});



