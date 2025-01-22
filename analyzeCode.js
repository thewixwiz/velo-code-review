const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const { getPrompt } = require("./prompt");

dotenv.config();

// OpenAI API Configuration
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const JSON_SCHEMA = {
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
        "required": ["issues"],
        "additionalProperties": false
    },
    "strict": true
}

/**
 * Sends a code snippet to OpenAI for analysis with exponential backoff on errors.
 */
async function analyzeCode(codeSnippet, filePath, maxRetries = 7) {
    console.log("Analyzing", filePath);
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: getPrompt() },
                    { role: "user", content: `File: ${filePath}\n\n\`\`\`\n${codeSnippet}\n\`\`\`` }
                ],
                response_format: {
                    type: "json_schema",
                    json_schema: JSON_SCHEMA,
                }
            });

            console.log(`\n📂 Analysis for ${filePath}:\n`);
            const { issues } = JSON.parse(response.choices[0].message.content);
            console.log(issues);
            return issues;
        } catch (error) {
            const isRateLimitError = error.status === 429;
            const isServerError = error.status >= 500 && error.status < 600;

            if (isRateLimitError || isServerError) {
                const delay = Math.pow(2, attempt) * 1000; // Exponential backoff (1s, 2s, 4s, etc.)
                console.warn(`Retrying in ${delay / 1000}s due to ${error.status} error...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                attempt++;
            } else {
                console.error("Error analyzing code:", error.message);
                break; // Do not retry for client errors (e.g., 400, 401)
            }
        }
    }

    console.error(`Failed to analyze ${filePath} after ${maxRetries} attempts.`);
    return null;
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

module.exports = { shouldSkipFile, analyzeCode };
