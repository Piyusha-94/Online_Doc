const express = require("express");
const multer = require("multer");
const pool = require("./db");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Upload Document
router.post("/upload", upload.single("document"), async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Login required" });

    const { documentType } = req.body;
    const filePath = req.file.path;

    try {
        await pool.execute(
            "INSERT INTO documents (user_id, document_type, file_path) VALUES (?, ?, ?)",
            [req.session.userId, documentType, filePath]
        );
        res.json({ message: "Document uploaded successfully" });
    } catch (err) {
        console.error("Document Upload Error:", err);
        res.status(500).json({ error: "Error uploading document" });
    }
});

// Check Document Status
router.get("/status", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Login required" });

    try {
        const [documents] = await pool.execute("SELECT * FROM documents WHERE user_id = ?", [req.session.userId]);
        res.json(documents);
    } catch (err) {
        console.error("Fetch Document Status Error:", err);
        res.status(500).json({ error: "Error fetching document status" });
    }
});
module.exports = router;       

