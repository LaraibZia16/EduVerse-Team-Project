/* ==========================================================
   EDUVERSE — STUDENT QUIZZES JS
   Vanilla ES6, LocalStorage-backed dummy data.
   No quiz create/edit/delete/question-management logic —
   only: view available quizzes, start quiz, attempt questions,
   submit quiz, view own result, view own attempt history.
========================================================== */

const QUIZ_BANK = [

    {
        id: "quiz-html-basics",
        name: "HTML Basics Quiz",
        course: "HTML & CSS",
        durationMinutes: 10,
        passingPercent: 50,
        instructions: "Answer all questions. You have 10 minutes. Each question carries equal marks.",
        questions: [
            {
                id: "q1",
                text: "Which tag is used to define an unordered list in HTML?",
                options: ["<ol>", "<ul>", "<li>", "<list>"],
                correctIndex: 1
            },
            {
                id: "q2",
                text: "What does HTML stand for?",
                options: [
                    "Hyper Trainer Marking Language",
                    "Hyper Text Markup Language",
                    "Hyper Text Marketing Language",
                    "Hyper Text Markup Leveler"
                ],
                correctIndex: 1
            },
            {
                id: "q3",
                text: "Which attribute specifies an alternate text for an image?",
                options: ["title", "src", "alt", "longdesc"],
                correctIndex: 2
            },
            {
                id: "q4",
                text: "Which tag is used to create a hyperlink?",
                options: ["<link>", "<href>", "<a>", "<url>"],
                correctIndex: 2
            }
        ]
    },

    {
        id: "quiz-js-mcq",
        name: "JavaScript MCQ Test",
        course: "JavaScript",
        durationMinutes: 15,
        passingPercent: 60,
        instructions: "This quiz covers core JavaScript fundamentals. You have 15 minutes.",
        questions: [
            {
                id: "q1",
                text: "Which keyword declares a block-scoped variable?",
                options: ["var", "let", "static", "define"],
                correctIndex: 1
            },
            {
                id: "q2",
                text: "Which method converts a JSON string into a JS object?",
                options: ["JSON.parse()", "JSON.stringify()", "JSON.objectify()", "JSON.toObject()"],
                correctIndex: 0
            },
            {
                id: "q3",
                text: "What is the output of typeof null?",
                options: ["'null'", "'undefined'", "'object'", "'number'"],
                correctIndex: 2
            },
            {
                id: "q4",
                text: "Which method is used to add an element to the end of an array?",
                options: ["push()", "pop()", "shift()", "unshift()"],
                correctIndex: 0
            }
        ]
    },

    {
        id: "quiz-react-components",
        name: "React Components Quiz",
        course: "React JS",
        durationMinutes: 12,
        passingPercent: 60,
        instructions: "This quiz tests your understanding of React components and props.",
        questions: [
            {
                id: "q1",
                text: "Which hook is used to manage state in a functional component?",
                options: ["useEffect", "useState", "useRef", "useMemo"],
                correctIndex: 1
            },
            {
                id: "q2",
                text: "How is data passed from a parent to a child component?",
                options: ["State", "Props", "Context only", "Redux only"],
                correctIndex: 1
            },
            {
                id: "q3",
                text: "What does JSX stand for?",
                options: [
                    "JavaScript XML",
                    "Java Syntax Extension",
                    "JSON XML",
                    "JavaScript Extra"
                ],
                correctIndex: 0
            }
        ]
    }

];


let activeQuizId = null;
let quizTimerInterval = null;
let quizTimeRemaining = 0;

let takeQuizModalInstance = null;
let quizResultModalInstance = null;


document.addEventListener("DOMContentLoaded", () => {

    initSidebarToggle();
    initActiveNavLink();

    takeQuizModalInstance = new bootstrap.Modal(document.getElementById("takeQuizModal"));
    quizResultModalInstance = new bootstrap.Modal(document.getElementById("quizResultModal"));

    renderQuizTable();
    renderAttemptHistory();
    updateQuizStats();

    document.getElementById("quizSearch")?.addEventListener("input", renderQuizTable);
    document.getElementById("quizCourseFilter")?.addEventListener("change", renderQuizTable);
    document.getElementById("submitQuizBtn")?.addEventListener("click", submitActiveQuiz);

});


/* ==========================================================
   SIDEBAR TOGGLE (mobile)
========================================================== */

function initSidebarToggle() {

    const toggleBtn = document.querySelector(".menu-toggle");
    const wrapper = document.querySelector(".dashboard-wrapper");

    if (!toggleBtn || !wrapper) return;

    toggleBtn.addEventListener("click", () => {
        wrapper.classList.toggle("sidebar-collapsed");
    });

}


/* ==========================================================
   ACTIVE NAV LINK HIGHLIGHTING
========================================================== */

function initActiveNavLink() {

    const currentPage = window.location.pathname.split("/").pop() || "quizzes.html";
    const navItems = document.querySelectorAll(".sidebar-menu ul li");

    navItems.forEach((li) => {
        const link = li.querySelector("a");
        if (!link) return;

        const href = link.getAttribute("href");
        li.classList.toggle("active", href === currentPage);
    });

}


/* ==========================================================
   ATTEMPT STORAGE (LocalStorage)
   Stores only this student's own attempts/scores.
========================================================== */

function getAttempts() {
    return JSON.parse(localStorage.getItem("eduverse_quiz_attempts") || "{}");
}

function saveAttempt(quizId, attempt) {
    const attempts = getAttempts();
    attempts[quizId] = attempt;
    localStorage.setItem("eduverse_quiz_attempts", JSON.stringify(attempts));
}


/* ==========================================================
   QUIZ TABLE RENDER
========================================================== */

function renderQuizTable() {

    const tbody = document.getElementById("quizTableBody");
    if (!tbody) return;

    const searchTerm = (document.getElementById("quizSearch")?.value || "").toLowerCase().trim();
    const courseFilter = document.getElementById("quizCourseFilter")?.value || "all";
    const attempts = getAttempts();

    tbody.innerHTML = "";

    QUIZ_BANK
        .filter((quiz) => {
            const matchesSearch = quiz.name.toLowerCase().includes(searchTerm);
            const matchesCourse = courseFilter === "all" || quiz.course === courseFilter;
            return matchesSearch && matchesCourse;
        })
        .forEach((quiz, index) => {

            const attempt = attempts[quiz.id];
            const isCompleted = !!attempt;

            const statusBadge = isCompleted
                ? `<span class="badge bg-success">Completed</span>`
                : `<span class="badge bg-warning text-dark">Not Attempted</span>`;

            const scoreCell = isCompleted ? `${attempt.percent}%` : "--";

            const actionButton = isCompleted
                ? `<button class="btn btn-sm btn-outline-primary view-result-btn" data-quiz-id="${quiz.id}">
                       <i class="fa-solid fa-eye"></i> View Result
                   </button>`
                : `<button class="btn btn-sm btn-primary start-quiz-btn" data-quiz-id="${quiz.id}">
                       <i class="fa-solid fa-play"></i> Start Quiz
                   </button>`;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${quiz.name}</td>
                <td>${quiz.course}</td>
                <td>${quiz.questions.length}</td>
                <td>${quiz.durationMinutes} Minutes</td>
                <td>${statusBadge}</td>
                <td>${scoreCell}</td>
                <td>${actionButton}</td>
            `;

            tbody.appendChild(row);

        });

    document.querySelectorAll(".start-quiz-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const quizId = e.currentTarget.dataset.quizId;
            openQuiz(quizId);
        });
    });

    document.querySelectorAll(".view-result-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const quizId = e.currentTarget.dataset.quizId;
            showResultForQuiz(quizId);
        });
    });

}


/* ==========================================================
   STATS CARD UPDATES
========================================================== */

function updateQuizStats() {

    const attempts = getAttempts();
    const attemptValues = Object.values(attempts);

    const totalQuizzes = QUIZ_BANK.length;
    const attemptedCount = attemptValues.length;
    const pendingCount = totalQuizzes - attemptedCount;

    const avgScore = attemptedCount
        ? Math.round(attemptValues.reduce((sum, a) => sum + a.percent, 0) / attemptedCount)
        : null;

    document.getElementById("statAvailableQuizzes").textContent = totalQuizzes;
    document.getElementById("statAttempted").textContent = attemptedCount;
    document.getElementById("statAvgScore").textContent = avgScore !== null ? `${avgScore}%` : "--";
    document.getElementById("statPending").textContent = pendingCount;

}


/* ==========================================================
   ATTEMPT HISTORY RENDER
========================================================== */

function renderAttemptHistory() {

    const list = document.getElementById("attemptHistoryList");
    const noAttemptsMsg = document.getElementById("noAttemptsMsg");
    if (!list) return;

    const attempts = getAttempts();
    const entries = Object.entries(attempts);

    list.querySelectorAll(".activity-item").forEach(el => el.remove());

    if (entries.length === 0) {
        if (noAttemptsMsg) noAttemptsMsg.style.display = "block";
        return;
    }

    if (noAttemptsMsg) noAttemptsMsg.style.display = "none";

    entries
        .sort((a, b) => new Date(b[1].submittedAt) - new Date(a[1].submittedAt))
        .forEach(([quizId, attempt]) => {

            const quiz = QUIZ_BANK.find(q => q.id === quizId);
            if (!quiz) return;

            const item = document.createElement("div");
            item.className = "activity-item";

            const passed = attempt.percent >= quiz.passingPercent;

            item.innerHTML = `
                <div class="activity-icon ${passed ? 'bg-success' : 'bg-danger'}">
                    <i class="fa-solid ${passed ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
                </div>
                <div>
                    <h6>${quiz.name}</h6>
                    <small>Scored ${attempt.percent}% &middot; ${passed ? 'Passed' : 'Not Passed'}</small>
                    <p>${new Date(attempt.submittedAt).toLocaleString()}</p>
                </div>
            `;

            list.appendChild(item);

        });

}


/* ==========================================================
   OPEN / TAKE QUIZ
========================================================== */

function openQuiz(quizId) {

    const quiz = QUIZ_BANK.find(q => q.id === quizId);
    if (!quiz) return;

    activeQuizId = quizId;

    document.getElementById("takeQuizModalTitle").textContent = quiz.name;
    document.getElementById("quizInstructionsText").textContent = quiz.instructions;

    const container = document.getElementById("quizQuestionsContainer");
    container.innerHTML = "";

    quiz.questions.forEach((question, qIndex) => {

        const box = document.createElement("div");
        box.className = "question-box" + (qIndex > 0 ? " mt-4" : "");

        const optionsHtml = question.options.map((optionText, optIndex) => `
            <div class="form-check mb-2">
                <input class="form-check-input" type="radio"
                       name="${question.id}"
                       id="${question.id}-opt${optIndex}"
                       value="${optIndex}">
                <label class="form-check-label" for="${question.id}-opt${optIndex}">
                    ${optionText}
                </label>
            </div>
        `).join("");

        box.innerHTML = `
            <div class="d-flex justify-content-between mb-3">
                <h5>Question ${qIndex + 1}</h5>
            </div>
            <label class="form-label">${question.text}</label>
            <div class="mt-2">
                ${optionsHtml}
            </div>
        `;

        container.appendChild(box);

    });

    quizTimeRemaining = quiz.durationMinutes * 60;
    startQuizTimer();

    takeQuizModalInstance.show();

}


/* ==========================================================
   QUIZ TIMER
========================================================== */

function startQuizTimer() {

    clearInterval(quizTimerInterval);

    updateTimerDisplay();

    quizTimerInterval = setInterval(() => {

        quizTimeRemaining--;

        if (quizTimeRemaining <= 0) {
            clearInterval(quizTimerInterval);
            quizTimeRemaining = 0;
            updateTimerDisplay();
            submitActiveQuiz();
            return;
        }

        updateTimerDisplay();

    }, 1000);

}

function updateTimerDisplay() {

    const minutes = Math.floor(quizTimeRemaining / 60).toString().padStart(2, "0");
    const seconds = (quizTimeRemaining % 60).toString().padStart(2, "0");

    const display = document.getElementById("quizTimerDisplay");
    if (display) display.textContent = `${minutes}:${seconds}`;

}


/* ==========================================================
   SUBMIT QUIZ — scores client-side against the student's own
   selected answers only. No grading of other students, no
   editing of the question bank.
========================================================== */

function submitActiveQuiz() {

    const quiz = QUIZ_BANK.find(q => q.id === activeQuizId);
    if (!quiz) return;

    clearInterval(quizTimerInterval);

    let correctCount = 0;

    quiz.questions.forEach((question) => {
        const selected = document.querySelector(`input[name="${question.id}"]:checked`);
        if (selected && parseInt(selected.value, 10) === question.correctIndex) {
            correctCount++;
        }
    });

    const percent = Math.round((correctCount / quiz.questions.length) * 100);

    const attempt = {
        correctCount,
        totalQuestions: quiz.questions.length,
        percent,
        submittedAt: new Date().toISOString()
    };

    saveAttempt(quiz.id, attempt);

    takeQuizModalInstance.hide();

    renderQuizTable();
    renderAttemptHistory();
    updateQuizStats();

    showResultForQuiz(quiz.id);

}


/* ==========================================================
   SHOW RESULT MODAL (own result only)
========================================================== */

function showResultForQuiz(quizId) {

    const quiz = QUIZ_BANK.find(q => q.id === quizId);
    const attempts = getAttempts();
    const attempt = attempts[quizId];

    if (!quiz || !attempt) return;

    const passed = attempt.percent >= quiz.passingPercent;

    document.getElementById("resultScoreText").textContent = `${attempt.percent}%`;
    document.getElementById("resultStatusText").textContent = passed ? "Passed 🎉" : "Not Passed";
    document.getElementById("resultDetailText").textContent =
        `You answered ${attempt.correctCount} out of ${attempt.totalQuestions} questions correctly.`;

    const resultIcon = document.getElementById("resultIcon");
    resultIcon.className = `stat-icon ${passed ? 'green' : 'orange'} mx-auto mb-3`;
    resultIcon.style.width = "70px";
    resultIcon.style.height = "70px";
    resultIcon.style.fontSize = "28px";

    quizResultModalInstance.show();

}