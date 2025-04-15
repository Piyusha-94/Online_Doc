require("dotenv").config({ path: './backend/.env' });
const express = require("express");
const session = require("express-session");
const path = require("path");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./authRoutes");
const docRoutes = require("./docRoutes");
const multer = require("multer");
const pool = require("./db");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// Debugging Logs
console.log("Database Config:", {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Debugging Middleware - Logs all incoming requests
app.use((req, res, next) => {
    console.log(`➡️ ${req.method} request to ${req.url}`);
    console.log("Request Body:", req.body);
    next();
});

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Serve static files
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/auth", authRoutes);
app.use("/documents", docRoutes);

// WebSocket connection
io.on("connection", (socket) => {
    console.log("🔗 New WebSocket connection");

    socket.on("disconnect", () => {
        console.log("❌ WebSocket disconnected");
    });
});

app.set("io", io); // Store io instance in app

// Main Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "login.html"));
});

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

// API to handle document submission
app.post("/api/submitApplication", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "File upload failed." });
    }

    try {
        await pool.execute("INSERT INTO documents (user_id, document_type, file_path, status) VALUES (?, ?, ?, ?)", 
            [req.session.userId, req.body.documentType, `/uploads/${req.file.filename}`, "Pending"]);

        res.json({ message: "Application submitted successfully!" });
    } catch (error) {
        console.error("Error submitting application:", error);
        res.status(500).json({ message: "Error submitting application" });
    }
});

// API to fetch all applications (For Admin)
app.get("/api/getApplications", async (req, res) => {
    try {
        const [applications] = await pool.execute("SELECT * FROM documents");
        res.json(applications);
    } catch (err) {
        console.error("Error fetching applications:", err);
        res.status(500).json({ message: "Error fetching applications" });
    }
});
const db = require("./db"); // Ensure this is correctly imported

app.get("/api/getApplications", (req, res) => {
    db.query("SELECT * FROM applications", (err, results) => {
        if (err) {
            console.error("Error fetching applications:", err);
            res.status(500).json({ message: "Error fetching applications" });
        } else {
            res.json(results);
        }
    });
});


// API to update application status (Approve/Reject)
app.post("/api/updateStatus", async (req, res) => {
    const { id, status, reason } = req.body;
    const io = req.app.get("io"); // Get WebSocket instance

    try {
        const [doc] = await pool.execute("SELECT user_id, file_path FROM documents WHERE id = ?", [id]);

        if (doc.length > 0) {
            const userId = doc[0].user_id;
            await pool.execute("UPDATE documents SET status = ?, rejection_reason = ? WHERE id = ?", [status, reason || null, id]);

            // Notify user about status change
            io.emit(`notification_${userId}`, { id, status });

            res.json({ message: `Application ${status}` });
        } else {
            res.status(404).json({ message: "Application not found" });
        }
    } catch (err) {
        console.error("Error updating status:", err);
        res.status(500).json({ message: "Failed to update status" });
    }
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
