const express = require("express");
const router = express.Router();
const pool = require("./db"); // Assuming this is your database connection file
require("dotenv").config();
console.log("Database Config:", process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_NAME);

router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Check if the user already exists
        const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Insert new user
        await pool.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, password]);

        res.json({ success: true, redirectTo: "/login.html" });
    } catch (error) {
        console.error("❌ Signup Error:", error); // Logs the full error in the console
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("🔍 Received Login Request:", email, password);

    try {
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        console.log("🛠 DB Query Result:", rows);

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        const user = rows[0];

        if (user.password !== password) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        console.log("✅ Login Successful!");
        res.json({ success: true, redirect: "/dashboard.html" });

    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


module.exports = router;         





