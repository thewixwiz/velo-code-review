const MOCK_DATA = {
    message: "Analysis complete!",
    data: {
        files: {
            total: 5,
            analyzed: 4,
            skipped: 1,
        },
        issues: [
            {
                severity: 2,
                category: "General Best Practice",
                description: "The function `restart()` calls itself recursively without an exit condition, which can cause a stack overflow.",
                page: "script.js",
                line: "22",
                location: "Backend",
                relevant_code: "function restart() { restart(); }"
            },
            {
                severity: 3,
                category: "Security Vulnerability",
                description: "Hardcoded API keys found in the source code. Consider storing them in environment variables instead.",
                page: "config.js",
                line: "5",
                location: "Frontend",
                relevant_code: "const API_KEY = '123456789abcdef';"
            },
            {
                severity: 1,
                category: "Velo Best Practice",
                description: "Only one `onReady()` function is defined, but it is empty. Consider removing or adding functionality.",
                page: "Cart Page.hd029.js",
                line: "4",
                location: "Public",
                relevant_code: "$w.onReady(function () {});"
            },
            {
                severity: 2,
                category: "Bug",
                description: "Undefined variable `userName` is being used in the function, which may cause runtime errors.",
                page: "userProfile.js",
                line: "15",
                location: "Frontend",
                relevant_code: "console.log(userName);"
            }
        ]
    }
};