const express = require("express");
const multer = require("multer");
const unzipper = require("unzipper");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv");

const { shouldSkipFile, analyzeCode } = require("./analyzeCode");
const { readCodeFiles } = require("./readCodeFiles");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOADS_DIR = "uploads";

const MAX_FREE_ISSUES = 5;
const MAX_ANALYSIS_FILES = 50;
const MAX_FILE_CHARACTERS = 5000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); // Parse form fields
app.use(express.json()); // Handle JSON payloads

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (req, file, cb) => {
        const randomizer = Math.floor(Math.random() * 100000).toString();
        const ext = path.extname(file.originalname); // Get file extension (.zip)
        const baseName = path.basename(file.originalname, ext); // Remove .zip
        const newFileName = `${baseName}_${randomizer}${ext}`; // Append randomizer before saving
        cb(null, newFileName);
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

    let data = {
        files: {
            total: 0,
            analyzed: 0,
            skipped: 0,
        },
        issues: [],
        totalIssues: 0,
    }
    const { email, website, experiance, role, pastedCode } = req.body;

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    function sendEvent(data) {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    const uploadResponse = await axios.get('https://www.thewixwiz.com/_functions/veloReview/upload');

    console.log("pasted code", pastedCode)

     // Case 1: If user pasted code instead of uploading a file
     if (pastedCode && pastedCode.trim().length > 0) {
        try {
            sendEvent({ message: "Analyzing pasted code..." });

            let snippet = pastedCode.length > MAX_FILE_CHARACTERS 
                ? pastedCode.slice(0, MAX_FILE_CHARACTERS) 
                : pastedCode;

            const result = await analyzeCode(snippet, "pasted_code.js");

            if (result) {
                data.files.analyzed = 1;
                data.files.total = 1;
                data.issues = [...data.issues, ...result];
                data.totalIssues = data.issues.length;
            }

            await axios.post("https://www.thewixwiz.com/_functions/veloReview/save", {
                email,
                website,
                experiance,
                role,
                results: JSON.stringify(data),
                pastedCode
            })

            // Send analysis results
            sendEvent({ message: "Analysis complete!", status: "complete", data });
            res.end();
        } catch (err) {
            console.error("❌ Error analyzing pasted code:", err);
            sendEvent({ error: "Error analyzing pasted code." });
            res.end();
        }
        return;
    }

    if (!req.file) return res.status(400).send("No file uploaded.");

    const zipPath = path.join(UPLOADS_DIR, req.file.filename);
    const extractPath = path.join(UPLOADS_DIR, req.file.filename.replace(".zip", ""));

    sendEvent({ message: "Unzipping files..." });

    const fileStream = fs.createReadStream(zipPath);

    const uploadResult = await axios.put(
        uploadResponse.data.uploadUrl,
        fileStream,
        {
            headers: {
                "Content-Type": "application/octet-stream",
            },
            params: {
                filename: req.file.filename
            }
        });

    //uploadResult.data.file.url

    // Extract ZIP file
    fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: extractPath }))
        .on("close", async () => {
            console.log(`✅ Extracted: ${extractPath}`);
            fs.unlinkSync(zipPath); // Remove ZIP after extraction

            const codeFiles = readCodeFiles(extractPath);
            const totalFiles = Object.keys(codeFiles).length;
            data.files.total = totalFiles;
            sendEvent({ message: "Extraction complete. Starting Anaylsis...", data });

            try {
                for (const [filePath, content] of Object.entries(codeFiles)) {
                    
                    if (data.files.analyzed >= MAX_ANALYSIS_FILES) {
                        console.log(`🚨 Analysis file limit reached ${MAX_ANALYSIS_FILES}. Skipping remaining files.`);
                        sendEvent({
                            message: `🚨 Analysis file limit reached ${MAX_ANALYSIS_FILES}. Skipping remaining files.`,
                            data: {
                                files: data.files,
                                issues: data.issues.slice(0, MAX_FREE_ISSUES),
                                totalIssues,
                            },
                        });
                        data.files.skipped++;
                        break;
                    }
                    
                    if (shouldSkipFile(content)) {
                        data.files.skipped++;
                        console.log(`🚫 Skipping file: ${path.basename(filePath)} (Matched exclusion keyword)`);
                        sendEvent({
                            message: `Empty file ${path.basename(filePath)} skipped...`,
                            data: {
                                files: data.files,
                                issues: data.issues.slice(0, MAX_FREE_ISSUES),
                                totalIssues,
                            },
                        });
                        continue;
                    }

                    let snippet = content;
                    if (snippet.length > MAX_FILE_CHARACTERS) {
                        snippet = content.slice(0, MAX_FILE_CHARACTERS);
                        sendEvent({
                            message: `Long file ${path.basename(filePath)} partially skipped...`,
                            data: {
                                files: data.files,
                                issues: data.issues.slice(0, MAX_FREE_ISSUES),
                                totalIssues,
                            },
                        });
                    }

                    const result = await analyzeCode(snippet, filePath);

                    if (result) {
                        data.files.analyzed++;
                        data.issues = [...data.issues, ...result];
                        totalIssues = data.issues.length;
                    }

                    // Step 4: Send progress update
                    sendEvent({
                        message: "Analyzing files...",
                        data: {
                            files: data.files,
                            issues: data.issues.slice(0, MAX_FREE_ISSUES),
                            totalIssues,
                        },
                    });
                }

                await axios.post("https://www.thewixwiz.com/_functions/veloReview/save", {
                    email,
                    website,
                    experiance,
                    role,
                    results: JSON.stringify(data),
                    codeFiles: uploadResult.data.file.url
                })

                // Step 5: Notify frontend - Analysis complete
                sendEvent({ message: "Analysis complete!", status: "complete" });
                res.end(); // Close the SSE connection
            } catch (err) {
                console.error("❌ Analysis failed:", err);
                sendEvent({ error: "Error analyzing code." });
                res.end();
            }

            deleteFolderRecursive(extractPath); // Delete extracted files after processing

        })
        .on("error", (err) => res.status(500).send("Error extracting file: " + err));
});

app.get("/", async (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.get("/analysis", async (req, res) => {
    const { id } = req.query;
    const response = await axios.get(`https://www.thewixwiz.com/_functions/veloReview/get?id=${id}`);
    console.log(response.data);
    res.status(200).send({ data: response.data.results, message: "Your results are in!" })
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
