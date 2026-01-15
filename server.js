const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// Serve public folder
// =======================
app.use(express.static("public"));

// =======================
// Upload folder
// =======================
const uploadFolder = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// =======================
// Multer config
// =======================
const storage = multer.diskStorage({
    destination: uploadFolder,
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// =======================
// In-memory store
// =======================
const fileStore = {};

// =======================
// UPLOAD API
// =======================
app.post("/upload", upload.array("files"), (req, res) => {

    const keyword = req.body.keyword;
    const files = req.files;

    if (!keyword || files.length === 0) {
        return res.status(400).json({ message: "Keyword or file missing" });
    }

    // clear old timer if exists
    if (fileStore[keyword]) {
        clearTimeout(fileStore[keyword].timer);
    }

    const savedFiles = files.map(f => ({
        path: f.path,
        originalName: f.originalname
    }));

    fileStore[keyword] = {
        files: savedFiles,
        timer: setTimeout(() => {
            savedFiles.forEach(f => {
                if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
            });
            delete fileStore[keyword];
        }, 10000)
    };

    res.json({ message: "Files uploaded. Download within 10 seconds." });
});

// =======================
// DOWNLOAD ZIP API
// =======================
app.get("/download/:keyword", (req, res) => {

    const data = fileStore[req.params.keyword];
    if (!data) return res.status(404).send("Expired or invalid keyword");

    res.setHeader("Content-Disposition", `attachment; filename=${req.params.keyword}.zip`);
    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip");
    archive.pipe(res);

    data.files.forEach(f => {
        archive.file(f.path, { name: f.originalName });
    });

    archive.finalize();
});

// =======================
// Start server
// =======================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
