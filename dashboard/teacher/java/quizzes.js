/* ==========================================================
    EduVerse Teacher Dashboard
    quizzes.js
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================================
        ELEMENTS
    ========================================================== */

    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");

    const questionSection = document.querySelector(".question-box")?.parentElement;

    const addQuestionBtn = document.querySelector(".question-builder .btn-primary")
        || [...document.querySelectorAll("button")]
            .find(btn => btn.textContent.includes("Add Question"));

    const saveDraftBtn = [...document.querySelectorAll("button")]
        .find(btn => btn.textContent.includes("Save Draft"));

    const previewBtn = [...document.querySelectorAll("button")]
        .find(btn => btn.textContent.includes("Preview Quiz"));

    const publishBtn = [...document.querySelectorAll("button")]
        .find(btn => btn.textContent.includes("Publish Quiz"));

    const totalQuestionInput = [...document.querySelectorAll("label")]
        .find(label => label.textContent.includes("Total Questions"))
        ?.nextElementSibling;

    const quizSearchInput = document.querySelector(
        'input[placeholder="Search Quiz..."]'
    );

    const navbarSearch = document.querySelector(
        'input[placeholder="Search quizzes..."]'
    );

    const tableRows = document.querySelectorAll("tbody tr");

    /* ==========================================================
        SIDEBAR
    ========================================================== */

    if (menuToggle) {

        menuToggle.addEventListener("click", () => {

            sidebar.classList.toggle("show");

        });

    }

    /* ==========================================================
        UPDATE QUESTION COUNT
    ========================================================== */

    function updateQuestionCount() {

        const questions = document.querySelectorAll(".question-box");

        questions.forEach((box, index) => {

            box.querySelector("h5").textContent = `Question ${index + 1}`;

        });

        if (totalQuestionInput) {

            totalQuestionInput.value = questions.length;

        }

    }

    /* ==========================================================
        CREATE QUESTION
    ========================================================== */

    function createQuestion(number) {

        const wrapper = document.createElement("div");

        wrapper.className = "question-box mt-4";

        wrapper.innerHTML = `

<div class="d-flex justify-content-between mb-3">

<h5>Question ${number}</h5>

<button class="btn btn-sm btn-danger delete-question">

<i class="fa-solid fa-trash"></i>

</button>

</div>

<label class="form-label">Question</label>

<input
type="text"
class="form-control question-input"
placeholder="Enter your question">

<div class="row mt-3 g-3">

<div class="col-md-6">

<label class="form-label">Option A</label>

<input type="text" class="form-control option">

</div>

<div class="col-md-6">

<label class="form-label">Option B</label>

<input type="text" class="form-control option">

</div>

<div class="col-md-6">

<label class="form-label">Option C</label>

<input type="text" class="form-control option">

</div>

<div class="col-md-6">

<label class="form-label">Option D</label>

<input type="text" class="form-control option">

</div>

</div>

<div class="row mt-3">

<div class="col-md-6">

<label class="form-label">

Correct Answer

</label>

<select class="form-select">

<option>Select Correct Option</option>

<option>Option A</option>

<option>Option B</option>

<option>Option C</option>

<option>Option D</option>

</select>

</div>

<div class="col-md-6">

<label class="form-label">

Marks

</label>

<input
type="number"
class="form-control"
placeholder="5">

</div>

</div>

`;

        questionSection.appendChild(wrapper);

        updateQuestionCount();

    }

    /* ==========================================================
        ADD QUESTION
    ========================================================== */

    if (addQuestionBtn) {

        addQuestionBtn.addEventListener("click", () => {

            createQuestion(document.querySelectorAll(".question-box").length + 1);

        });

    }

    /* ==========================================================
        DELETE QUESTION
    ========================================================== */

    document.addEventListener("click", (e) => {

        const btn = e.target.closest(".btn-danger");

        if (!btn) return;

        const question = btn.closest(".question-box");

        if (!question) return;

        if (document.querySelectorAll(".question-box").length === 1) {

            alert("Quiz must contain at least one question.");

            return;

        }

        if (confirm("Delete this question?")) {

            question.remove();

            updateQuestionCount();

        }

    });

    /* ==========================================================
        SEARCH TABLE
    ========================================================== */

    if (quizSearchInput) {

        quizSearchInput.addEventListener("keyup", function () {

            const value = this.value.toLowerCase();

            tableRows.forEach(row => {

                row.style.display = row.innerText.toLowerCase().includes(value)
                    ? ""
                    : "none";

            });

        });

    }

    /* ==========================================================
        SEARCH QUESTIONS
    ========================================================== */

    if (navbarSearch) {

        navbarSearch.addEventListener("keyup", function () {

            const value = this.value.toLowerCase();

            document.querySelectorAll(".question-box").forEach(box => {

                box.style.display = box.innerText.toLowerCase().includes(value)
                    ? ""
                    : "none";

            });

        });

    }

    /* ==========================================================
        FORM DATA
    ========================================================== */

    function collectQuizData() {

        const data = {};

        data.title = document.querySelector('input[placeholder="Enter quiz title"]').value;

        data.course = document.querySelectorAll("select")[0].value;

        data.category = document.querySelectorAll("select")[1].value;

        data.difficulty = document.querySelectorAll("select")[2].value;

        data.duration = document.querySelector('input[placeholder="30 Minutes"]').value;

        data.passing = document.querySelector('input[placeholder="Example: 50"]').value;

        data.instructions = document.querySelector("textarea").value;

        data.questions = [];

        document.querySelectorAll(".question-box").forEach(box => {

            const inputs = box.querySelectorAll("input");

            const select = box.querySelector("select");

            data.questions.push({

                question: inputs[0].value,

                optionA: inputs[1].value,

                optionB: inputs[2].value,

                optionC: inputs[3].value,

                optionD: inputs[4].value,

                marks: inputs[5]?.value,

                answer: select.value

            });

        });

        return data;

    }

    /* ==========================================================
        SAVE DRAFT
    ========================================================== */

    if (saveDraftBtn) {

        saveDraftBtn.addEventListener("click", () => {

            const quiz = collectQuizData();

            localStorage.setItem("eduverseQuizDraft", JSON.stringify(quiz));

            alert("Draft Saved Successfully.");

        });

    }

    /* ==========================================================
        LOAD DRAFT
    ========================================================== */

    function loadDraft() {

        const draft = JSON.parse(localStorage.getItem("eduverseQuizDraft"));

        if (!draft) return;

        document.querySelector('input[placeholder="Enter quiz title"]').value = draft.title;

        document.querySelectorAll("select")[0].value = draft.course;

        document.querySelectorAll("select")[1].value = draft.category;

        document.querySelectorAll("select")[2].value = draft.difficulty;

        document.querySelector('input[placeholder="30 Minutes"]').value = draft.duration;

        document.querySelector('input[placeholder="Example: 50"]').value = draft.passing;

        document.querySelector("textarea").value = draft.instructions;

    }

    loadDraft();

    /* ==========================================================
        VALIDATION
    ========================================================== */

    function validateQuiz() {

        const title = document.querySelector(
            'input[placeholder="Enter quiz title"]'
        ).value.trim();

        if (!title) {

            alert("Quiz title is required.");

            return false;

        }

        let valid = true;

        document.querySelectorAll(".question-box").forEach(box => {

            const q = box.querySelector("input").value.trim();

            if (!q) valid = false;

        });

        if (!valid) {

            alert("Every question must contain text.");

            return false;

        }

        return true;

    }

    /* ==========================================================
        PREVIEW
    ========================================================== */

    if (previewBtn) {

        previewBtn.addEventListener("click", () => {

            if (!validateQuiz()) return;

            const quiz = collectQuizData();

            console.log(quiz);

            alert(
                `${quiz.title}\n\nQuestions : ${quiz.questions.length}\n\nPreview generated.\n(Check console)`
            );

        });

    }

    /* ==========================================================
        PUBLISH
    ========================================================== */

    if (publishBtn) {

        publishBtn.addEventListener("click", () => {

            if (!validateQuiz()) return;

            if (!confirm("Publish this quiz?")) return;

            alert("Quiz Published Successfully.");

            localStorage.removeItem("eduverseQuizDraft");

        });

    }

    /* ==========================================================
        TABLE ACTIONS
    ========================================================== */

    document.querySelector("tbody").addEventListener("click", function (e) {

        const button = e.target.closest("button");

        if (!button) return;

        const row = button.closest("tr");

        const quiz = row.children[1].innerText;

        if (button.classList.contains("btn-primary")) {

            alert("Viewing: " + quiz);

        }

        if (button.classList.contains("btn-warning")) {

            alert("Editing: " + quiz);

        }

        if (button.classList.contains("btn-danger")) {

            if (confirm(`Delete "${quiz}" ?`)) {

                row.remove();

            }

        }

    });

    updateQuestionCount();

});