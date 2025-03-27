const errorDiv = document.getElementById("errorDiv");
const successDiv = document.getElementById("successDiv");
let testId;
let mcqCounter = 0;

document.addEventListener("DOMContentLoaded", async () => {
    testId = new URLSearchParams(window.location.search).get("testId");
    if (!testId) {
        showError("Invalid test ID.");
        return;
    }
    loadTestData(testId);
});

async function loadTestData(testId) {
    fetch(`/getTest/${testId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch test data");
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("testName").value = data.test.name;
            document.getElementById("startingTime").value = formatDateForInput(data.test.startingTime);
            document.getElementById("endingTime").value = formatDateForInput(data.test.endingTime);
            const mcqContainer = document.getElementById("mcqContainer");
            mcqContainer.innerHTML = "";
            data.test.mcqs.length > 0 ? data.test.mcqs.forEach(mcqData => addMCQ(mcqData)) : addMCQ({});
        })
        .catch(error => showError("Error fetching test data."));
}

function showError(message) {
    errorDiv.classList.remove("hidden");
    errorDiv.classList.add("flex");
    successDiv.classList.add("hidden");
    errorDiv.querySelector('#errorText').innerText = message;
    setTimeout(() => {
        errorDiv.classList.add("hidden");
        errorDiv.classList.remove("flex");
    }, 3500);
}

function showSuccess(message) {
    successDiv.classList.remove("hidden");
    successDiv.classList.add("flex");
    errorDiv.classList.add("hidden");
    successDiv.querySelector('#successText').innerText = message;
    setTimeout(() => {
        successDiv.classList.add("hidden");
        successDiv.classList.remove("flex");
    }, 3500);
}

function formatDateForInput(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
}

function addMCQ(mcqData = {}) {
    const mcqContainer = document.getElementById("mcqContainer");
    const mcqDiv = document.createElement("div");
    mcqDiv.classList.add("border", "p-4", "mt-4", "rounded", "bg-gray-50");
    mcqDiv.id = `mcq-${mcqCounter++}`;
    mcqDiv.innerHTML = `
    <div>
        <div class="flex items-center">
            <input type="text" placeholder="Enter question" class="w-full p-2 border rounded mcq-question" value="${mcqData.question || ""}" required>
            <img src="/createTest/delete.svg" alt="Delete" class="cursor-pointer ml-2 w-5 h-5" onclick="removeMCQ(this)">
        </div>
        <div class="options mt-2"></div>
        <button type="button" onclick="addOption(this)" class="mt-2 px-2 py-1 bg-gray-300 rounded">Add Option</button>
    </div>
    `;
    mcqContainer.appendChild(mcqDiv);
    const optionsContainer = mcqDiv.querySelector(".options");
    if (mcqData.options && mcqData.options.length > 0) {
        mcqData.options.forEach(option => addOption(mcqDiv.querySelector("button"), option, option.isCorrect));
    } else {
        addOption(mcqDiv.querySelector("button"), {},true);
        addOption(mcqDiv.querySelector("button"));
    }
}

function addOption(button, optionData = {}, isChecked = false) {
    const optionsContainer = button.previousElementSibling;
    const mcqDiv = optionsContainer.closest(".border");
    const uniqueID = mcqDiv.id;
    const div = document.createElement("div");
    div.classList.add("flex", "items-center", "mt-1");
    div.innerHTML = `
        <input type="radio" name="option-${uniqueID}" class="correct-answer" ${isChecked ? "checked" : ""}>
        <input type="text" placeholder="Option text" class="ml-2 p-2 border rounded option-text" value="${optionData.text || ""}" required>
        <img src="/createTest/delete.svg" alt="Delete" class="cursor-pointer ml-2 w-5 h-5" onclick="removeOption(this)">
    `;
    optionsContainer.appendChild(div);
}

function removeMCQ(deleteBtn) {
    if (document.querySelectorAll(".mcq-question").length > 1) {
        deleteBtn.closest(".border").remove();
    } else {
        showError("At least one MCQ is required.");
    }
}

function removeOption(deleteBtn) {
    const optionsContainer = deleteBtn.parentElement.parentElement;
    if (optionsContainer.querySelectorAll(".option-text").length > 2) {
        deleteBtn.parentElement.remove();
    } else {
        showError("Each MCQ must have at least 2 options.");
    }
}

async function submitTest(e) {
    e.preventDefault();
    const testName = document.getElementById("testName").value.trim();
    const startingTime = document.getElementById("startingTime").value.trim();
    const endingTime = document.getElementById("endingTime").value.trim();

    const mcqs = [];
    document.querySelectorAll("#mcqContainer > div").forEach(mcqEl => {
        const question = mcqEl.querySelector(".mcq-question").value.trim();
        if (!question) {
            showError("Each MCQ must have a question.");
            return;
        }

        const options = [];
        mcqEl.querySelectorAll(".option-text").forEach((input, index) => {
            const text = input.value.trim();
            if (text) {
                options.push({
                    text,
                    isCorrect: mcqEl.querySelectorAll(".correct-answer")[index].checked
                });
            }
        });

        if (options.length < 2) {
            showError("Each MCQ must have at least 2 options.");
            return;
        }
        if (!options.some(option => option.isCorrect)) {
            showError("Each MCQ must have at least one correct answer.");
            return;
        }

        mcqs.push({ question, options });
    });

    if (mcqs.length === 0) {
        showError("Please add at least one valid MCQ with options.");
        return;
    }
    console.log(mcqs);
    try {
        const response = await fetch(`/updateTest/${testId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: testName, startingTime, endingTime, mcqs })
        });
        if (!response.ok) throw new Error("Failed to update test.");
        showSuccess("Test updated successfully!");
    } catch (error) {
        showError("Failed to update test.");
    }
}


// File input for uploading MCQs from a file
document.getElementById("fileInput").addEventListener("change", readFile);

function readFile() {
    const fileInput = document.getElementById("fileInput");
    if (!fileInput.files.length) {
        showError("Please select a file.");
        return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        const content = event.target.result;
        const newMCQs = parseMCQFile(content);
        if (newMCQs.length === 0) {
            showError("No valid MCQs found in the file.");
            return;
        }
        newMCQs.forEach(mcqData => addMCQ(mcqData));
        showSuccess("MCQs added successfully!");
    };
    reader.readAsText(file);
}
// Parse MCQs from file
function parseMCQFile(content) {
    const lines = content.split("\n").map(line => line.trim());
    const mcqs = [];
    let currentQuestion = null;

    lines.forEach(line => {
        if (line.startsWith("#")) {
            if (currentQuestion) mcqs.push(currentQuestion);
            currentQuestion = { question: line.slice(1).trim(), options: [] };
        } else if (line.startsWith("--")) {
            currentQuestion?.options.push({ text: line.slice(2).trim(), isCorrect: true });
        } else if (line.startsWith("-")) {
            currentQuestion?.options.push({ text: line.slice(1).trim(), isCorrect: false });
        }
        else {
            showError("Invalid MCQ format.");
            return [];
        }
    });

    if (currentQuestion) mcqs.push(currentQuestion);
    return mcqs;
}
