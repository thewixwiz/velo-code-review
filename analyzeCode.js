const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const { readCodeFiles } = require("./readFiles");
const { getPrompt } = require("./prompt");

dotenv.config();

// OpenAI API Configuration
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Sends a code snippet to OpenAI for analysis
 */
async function analyzeCode(codeSnippet, filePath) {
    console.log("analyzing", codeSnippet);
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: getPrompt() },
                { role: "user", content: `File: ${filePath}\n\n\`\`\`\n${codeSnippet}\n\`\`\`` }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    "name": "issues_report",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "issues": {
                                "type": "array",
                                "description": "An array of issues identified in the code.",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "severity": {
                                            "type": "number",
                                            "description": "Severity of the issue, ranging from 1 to 3."
                                        },
                                        "category": {
                                            "type": "string",
                                            "enum": [
                                                "Bug",
                                                "Velo Best Practice",
                                                "General Best Practice",
                                                "Security Vulnerability"
                                            ],
                                            "description": "Category of the issue."
                                        },
                                        "relevant_code": {
                                            "type": "string",
                                            "description": "The relevant code snippet related to the issue."
                                        },
                                        "line": {
                                            "type": "string",
                                            "description": "Line number where the issue was found."
                                        },
                                        "location": {
                                            "type": "string",
                                            "enum": [
                                                "Backend",
                                                "Public",
                                                "Frontend",
                                            ],
                                            "description": "Where the page file is located."
                                        },
                                        "page": {
                                            "type": "string",
                                            "description": "Page or file name where the issue was found."
                                        },
                                        "description": {
                                            "type": "string",
                                            "description": "Detailed description of the issue."
                                        }
                                    },
                                    "required": [
                                        "severity",
                                        "category",
                                        "relevant_code",
                                        "location",
                                        "line",
                                        "page",
                                        "description"
                                    ],
                                    "additionalProperties": false
                                }
                            }
                        },
                        "required": [
                            "issues"
                        ],
                        "additionalProperties": false
                    },
                    "strict": true
                }
            }
        });

        console.log(`\n📂 Analysis for ${filePath}:\n`);
        const { issues } = JSON.parse(response.choices[0].message.content);
        console.log(issues);
        return issues;
    } catch (error) {
        console.error("Error analyzing code:", error.message);
    }
}


// Define keywords to **skip** analysis
const SKIP_STRINGS = [
    "Write your JavaScript here",
    "Hello, World!",
    "Velo API Reference:",
    "Write your Javascript"
];

/**
 * Checks if a file should be skipped based on its content
 */
function shouldSkipFile(content) {
    return SKIP_STRINGS.some((keyword) => content.includes(keyword));
}

/**
 * Loop through all code files and send them to OpenAI
 */
async function analyzeAllFiles(extractPath) {
    const codeFiles = readCodeFiles(extractPath);

    let allIssues = [];

    for (const [filePath, content] of Object.entries(codeFiles)) {
        if (shouldSkipFile(content)) {
            console.log(`🚫 Skipping file: ${filePath} (Matched exclusion keyword)`);
            continue;
        }
        const snippet = content.slice(0, 2000); // Limit tokens
        const issues = await analyzeCode(snippet, filePath);
        if (issues) allIssues = [...allIssues, ...issues];
    }

    return allIssues;
}

module.exports = { shouldSkipFile, analyzeCode };
