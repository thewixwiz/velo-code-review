const express = require("express");
const multer = require("multer");
const unzipper = require("unzipper");
const fs = require("fs");
const path = require("path");

const { analyzeAllFiles } = require("./analyzeCode");

const app = express();
const PORT = 3000;
const UPLOADS_DIR = "uploads";

app.use(express.static("public"));

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

/**
 * Deletes a folder and its contents
 */
function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log(`🗑️ Deleted: ${folderPath}`);
    }
}

// Upload ZIP file endpoint
app.post("/upload", upload.single("codeFolder"), async (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded.");

    const zipPath = path.join(UPLOADS_DIR, req.file.filename);
    const extractPath = path.join(UPLOADS_DIR, req.file.filename.replace(".zip", ""));

    // Extract ZIP file
    fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: extractPath }))
        .on("close", async () => {
            console.log(`✅ Extracted: ${extractPath}`);
            fs.unlinkSync(zipPath); // Remove ZIP after extraction

            try {
                const allIssues = await analyzeAllFiles(extractPath); // Analyze code
                res.send(allIssues);
            } catch (err) {
                console.error("❌ Analysis failed:", err);
                res.status(500).send("Error analyzing code.");
            }

            deleteFolderRecursive(extractPath); // Delete extracted files after processing

        })
        .on("error", (err) => res.status(500).send("Error extracting file: " + err));
});

app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
