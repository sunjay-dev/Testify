const errorDiv = document.getElementById("errorDiv");
const successDiv = document.getElementById("successDiv");
let testId;
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
            console.log(data);
            document.getElementById("testName").value = data.test.name;
            document.getElementById("startingTime").value = formatDateForInput(data.test.startingTime);
            document.getElementById("endingTime").value = formatDateForInput(data.test.endingTime);

            const mcqContainer = document.getElementById("mcqContainer");
            mcqContainer.innerHTML = "";

           if (data.test.mcqs.length > 0) {
                data.test.mcqs.forEach(mcqData => {
                    addMCQ(mcqData);
                });
            }else
                addMCQ();
        })
        .catch(error => {
            showError("Error fetching test data.");
        });
}

function showError(message) {
    errorDiv.classList.remove("hidden");
    errorDiv.classList.add("flex");
    successDiv.classList.add("hidden");
    errorDiv.querySelector('#errorText').innerText = message;
    errorDiv.scrollIntoView({ behavior: "smooth", block: "center" });
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
    successDiv.scrollIntoView({ behavior: "smooth", block: "center" });

    setTimeout(() => {
        successDiv.classList.add("hidden");
        successDiv.classList.remove("flex");
    }, 3500);
}

function formatDateForInput(dateString) {
    if (!dateString) return ""; // Return empty if undefined

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // Check if the date is valid

    return date.toISOString().slice(0, 16); // Convert to "yyyy-MM-ddThh:mm" format
}
function addMCQ(mcqData = {}) {
    const mcqContainer = document.getElementById("mcqContainer");

    const mcqDiv = document.createElement("div");
    mcqDiv.classList.add("border", "p-4", "mt-4", "rounded", "bg-gray-50");
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
    if (mcqData.options) {
        mcqData.options.forEach((option, index) => {
            addOption(mcqDiv.querySelector("button"), option, index === 0);
        });
    } else {
        addOption(mcqDiv.querySelector("button"));
        addOption(mcqDiv.querySelector("button"));
    }
}

function addOption(button, optionData = {}, isChecked = false) {
    const optionsContainer = button.previousElementSibling;
    const div = document.createElement("div");
    div.classList.add("flex", "items-center", "mt-1");
    div.innerHTML += `
            <input type="radio" name="correctOption-${optionsContainer.parentElement.dataset.index}" class="correct-answer" ${optionData.isCorrect ? "checked" : ""}>
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

// Update test
async function submitTest(e) {
    e.preventDefault();
   
    const testName = document.getElementById("testName").value.trim();
    const startingTime = document.getElementById("startingTime").value.trim();
    const endingTime = document.getElementById("endingTime").value.trim();

    // Fetching MCQs dynamically
    const mcqElements = document.querySelectorAll("#mcqContainer > div");
    const mcqs = Array.from(mcqElements).map(mcqEl => {
        const question = mcqEl.querySelector(".mcq-question").value.trim();
        const options = Array.from(mcqEl.querySelectorAll(".option-text"))
            .map((input, index) => ({
                text: input.value.trim(),
                isCorrect: mcqEl.querySelectorAll(".correct-answer")[index].checked
            }))
            .filter(option => option.text !== "");

        if (options.length < 2) {
            showError("Each MCQ must have at least 2 options.");
            return null;
        }
        if (!options.some(option => option.isCorrect)) {
            showError("Each MCQ must have at least one correct answer.");
            return null;
        }

        return { question, options };
    }).filter(mcq => mcq !== null);

    if (mcqs.length === 0) {
        showError("Please add at least one valid MCQ with options.");
        return;
    }

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
