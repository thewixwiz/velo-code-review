const fs = require("fs");
const path = require("path");

// Allowed file extensions
const allowedExtensions = [".js", ".py", ".java", ".cpp", ".ts", ".html", ".css", ".jsx", ".tsx"];

/**
 * Reads all code files from a directory recursively.
 * Returns an object where:
 * - Key = file path
 * - Value = file content
 */
function readCodeFiles(dir) {
    let codeFiles = {};

    fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            Object.assign(codeFiles, readCodeFiles(filePath));
        } else if (allowedExtensions.includes(path.extname(file))) {
            codeFiles[filePath] = fs.readFileSync(filePath, "utf8");
        }
    });

    return codeFiles;
}

module.exports = { readCodeFiles };
