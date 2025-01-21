let currentSort = { column: null, ascending: true };
let analysisResults = []; // Stores all received analysis results for sorting

const CATEGORIES = [
    "General Best Practice",
    "Velo Best Practice",
    "Bug",
    "Security Vulnerability"
]

const { data, message } = MOCK_DATA;
render(data, message);


document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (id) {
        document.getElementById("uploadForm").style.display = "none"; // Hide form
        showLoader(); // Show loading animation
        await fetchDataById(id);
        hideLoader(); // Hide loading animation
    } {
        initiateUploadForm();
    }
});

function showLoader() {
    document.getElementById("loader").style.display = "block";
}

function hideLoader() {
    document.getElementById("loader").style.display = "none";
}

async function fetchDataById(id) {
    try {
        document.getElementById("status").innerText = "Fetching analysis data...";

        const response = await fetch(`/analysis?id=${id}`);
        if (!response.ok) throw new Error("Failed to fetch data");

        const { data, message } = await response.json();
        console.log(data, message);
        render(JSON.parse(data), message);
    } catch (error) {
        document.getElementById("status").innerText = "Failed to fetch analysis data";
        console.error("Error fetching data:", error);
    }
}

function initiateUploadForm() {
    document.getElementById("uploadForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const fileInput = document.getElementById("fileInput").files[0];
        const email = document.getElementById("emailInput").value;
        const website = document.getElementById("websiteInput").value;
        const experience = document.getElementById("experienceInput").value;
        const role = document.getElementById("roleInput").value;

        if (!fileInput) return alert("Please select a file");

        const formData = new FormData();
        formData.append("email", email);
        formData.append("website", website);
        formData.append("experiance", experience);
        formData.append("role", role);
        formData.append("codeFolder", fileInput);

        document.getElementById("status").innerText = "Uploading and analyzing...";
        document.getElementById("results-table").innerHTML = ""; // Clear old results
        document.getElementById("progress-bar").style.width = "0%"; // Reset progress bar
        document.getElementById("progress-text").innerText = "0/0 Files analyzed, 0 skipped. Issues found: 0";

        try {
            const response = await fetch("/upload", {
                method: "POST",
                body: formData
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            reader.read().then(function processText({ done, value }) {
                if (done) {
                    document.getElementById("status").innerText = "Analysis complete! Check your email for a link to the full results";
                    return;
                }

                const text = decoder.decode(value);
                const events = text.split("\n\n");

                events.forEach(event => {
                    console.log("event", event);
                    if (event.startsWith("data: ")) {
                        try {
                            const { data, message } = JSON.parse(event.replace("data: ", ""));
                            render(data, message)
                        } catch (error) {
                            console.error("Error receiving event", error);
                            document.getElementById("status").innerText = "There was an error processing. Results may be partial.";
                        }
                    }
                });

                return reader.read().then(processText);
            });
        } catch (error) {
            document.getElementById("status").innerText = "Upload failed!";
            console.error("Error uploading file:", error);
        }
    });
}


function render(data, message) {
    document.getElementById("status").innerText = message;

    if (data?.files) {
        const analyzed = data.files.analyzed;
        const total = data.files.total;
        const skipped = data.files.skipped;
        const totalIssues = data.totalIssues;

        // Update progress bar
        const progressPercent = total > 0 ? (analyzed / total) * 100 : 0;
        document.getElementById("progress-bar").style.width = `${progressPercent}%`;

        // Update progress text
        document.getElementById("progress-text").innerText = `${analyzed}/${total} files analyzed, ${skipped} skipped. Issues found: ${totalIssues || data.issues.length}`;
    }

    if (data?.issues?.length > 0) {
        analysisResults = data.issues;
        console.log("ar", analysisResults)
        updateResultsTable();
    }
}

function updateResultsTable() {
    const tableBody = document.getElementById("results-table");
    tableBody.innerHTML = ""; // Clear old rows

    analysisResults.forEach(issue => {
        const row = document.createElement("tr");
        // row.className = `severity-${issue.severity}`;

        // Limit description to 100 characters
        const shortDesc = issue.description.length > 30
            ? issue.description.substring(0, 30) + "<span class='show-more'>...show more</span>"
            : issue.description;

        row.innerHTML = `
                <td class="center severity-${issue.severity}">${issue.severity}</td>
                <td>${issue.page}</td>
                <td class="center">${issue.line}</td>
                <td>${issue.location}</td>
                <td class="category-${CATEGORIES.indexOf(issue.category) + 1}">${issue.category}</td>
                <td><pre>${issue.relevant_code}</pre></td>
                <td class="description" onclick="toggleDescription(this, '${issue.description.replace(/['"`]/g, '*')}')">
                    ${shortDesc}
                </td> 
            `;

        tableBody.appendChild(row);
    });
}

function sortTable(column) {
    if (currentSort.column === column) {
        currentSort.ascending = !currentSort.ascending;
    } else {
        currentSort.column = column;
        currentSort.ascending = true;
    }

    analysisResults.sort((a, b) => {
        let valueA = a[column];
        let valueB = b[column];


        valueA = valueA.toString().toLowerCase();
        valueB = valueB.toString().toLowerCase();

        return currentSort.ascending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });

    updateResultsTable();
}

/**
 * Toggles full description visibility on click
 */
function toggleDescription(element, fullText) {
    if (element.dataset.expanded === "true") {
        element.innerText = fullText.substring(0, 30) + "...";
        element.dataset.expanded = "false";
    } else {
        element.innerText = fullText;
        element.dataset.expanded = "true";
    }
}