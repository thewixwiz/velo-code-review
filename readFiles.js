const fs = require("fs");
const path = require("path");

// Allowed code file extensions
const allowedExtensions = [".js", ".ts"];

/**
 * Reads all code files in a directory recursively
 */
function readCodeFiles(dir) {
    let codeFiles = {};

    fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            Object.assign(codeFiles, readCodeFiles(filePath)); // Recursive for subfolders
        } else if (allowedExtensions.includes(path.extname(file))) {
            codeFiles[filePath] = fs.readFileSync(filePath, "utf8");
        }
    });

    return codeFiles;
}

module.exports = { readCodeFiles };
