/* ==========================================================
   EduVerse Student Dashboard — Assignments
   Vanilla JS, LocalStorage powered (no backend/API)
   ========================================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "eduverse_student_assignments";
  const ACTIVITY_KEY = "eduverse_student_activity";
  const AI_QUIZ_KEY = "eduverse_ai_quiz_attempts";

  /* -------------------- AI Quiz question bank --------------------
     NOTE: This project runs as a static frontend with no secured
     backend to hold an API key, so "AI Quiz Generator" is simulated
     locally: it randomly assembles questions from a curated bank
     per course/difficulty and times the reveal to feel like a live
     generation. If a backend is added later, replace generateQuizQuestions()
     with a real call to the Claude API instead of the local bank.
  ------------------------------------------------------------------ */
  const QUESTION_BANK = {
    "HTML & CSS": {
      easy: [
        { q: "Which tag is used to create a hyperlink in HTML?", options: ["<link>", "<a>", "<href>", "<nav>"], correct: 1, explanation: "The <a> (anchor) tag defines a hyperlink." },
        { q: "Which CSS property changes text color?", options: ["font-color", "text-color", "color", "background-color"], correct: 2, explanation: "The 'color' property sets the text color." },
        { q: "Which HTML tag is used for the largest heading?", options: ["<h6>", "<heading>", "<h1>", "<head>"], correct: 2, explanation: "<h1> represents the largest, most important heading." }
      ],
      medium: [
        { q: "Which CSS property is used to control the spacing between flex items?", options: ["gap", "margin-flex", "space-between", "flex-gap"], correct: 0, explanation: "'gap' controls spacing between flex/grid items directly." },
        { q: "What does the CSS box-sizing: border-box do?", options: ["Removes borders", "Includes padding and border in the element's total width/height", "Adds a box shadow", "Disables margin"], correct: 1, explanation: "border-box makes width/height include padding and border." },
        { q: "Which selector targets an element with class 'card' AND id 'main'?", options: [".card#main", "#main .card", ".card, #main", "card.main"], correct: 0, explanation: "Combining .card#main selects an element matching both simultaneously." }
      ],
      hard: [
        { q: "Which CSS unit is relative to the root element's font size?", options: ["em", "vh", "rem", "%"], correct: 2, explanation: "'rem' is always relative to the root (<html>) font size." },
        { q: "Which property creates a new stacking context?", options: ["z-index alone on static position", "opacity less than 1", "text-align", "line-height"], correct: 1, explanation: "opacity < 1 (among other properties) creates a new stacking context." }
      ]
    },
    "JavaScript": {
      easy: [
        { q: "Which keyword declares a block-scoped variable?", options: ["var", "let", "global", "const only"], correct: 1, explanation: "'let' is block-scoped, unlike 'var' which is function-scoped." },
        { q: "What does '===' check in JavaScript?", options: ["Value only", "Value and type", "Type only", "Reference only"], correct: 1, explanation: "'===' is strict equality — checks both value and type." },
        { q: "Which method adds an item to the end of an array?", options: ["push()", "pop()", "shift()", "unshift()"], correct: 0, explanation: "push() appends an item to the end of an array." }
      ],
      medium: [
        { q: "What does Array.prototype.map() return?", options: ["The original array", "A new array with transformed values", "undefined", "A single value"], correct: 1, explanation: "map() returns a new array built from the callback's return values." },
        { q: "What is a closure in JavaScript?", options: ["A loop that never ends", "A function bundled with its lexical scope", "A syntax error", "A CSS animation"], correct: 1, explanation: "A closure gives a function access to its outer scope even after that scope has closed." },
        { q: "Which method converts a JSON string into a JS object?", options: ["JSON.stringify()", "JSON.parse()", "Object.toJSON()", "JSON.convert()"], correct: 1, explanation: "JSON.parse() parses a JSON string into a JavaScript object." }
      ],
      hard: [
        { q: "What does the 'this' keyword refer to inside an arrow function?", options: ["The arrow function itself", "The global object always", "The enclosing lexical scope's 'this'", "undefined always"], correct: 2, explanation: "Arrow functions don't bind their own 'this' — they inherit it from the enclosing scope." },
        { q: "What is the output of typeof null?", options: ["'null'", "'undefined'", "'object'", "'number'"], correct: 2, explanation: "typeof null returns 'object' — a long-standing JS quirk." }
      ]
    },
    "React JS": {
      easy: [
        { q: "Which hook is used to manage state in a functional component?", options: ["useEffect", "useState", "useRef", "useMemo"], correct: 1, explanation: "useState creates and manages local component state." },
        { q: "What syntax does React use to write UI markup in JS?", options: ["JSX", "XML", "HTM", "TSX only"], correct: 0, explanation: "JSX lets you write HTML-like syntax inside JavaScript." }
      ],
      medium: [
        { q: "When does useEffect with an empty dependency array [] run?", options: ["On every render", "Only once, after the first render", "Never", "Before render"], correct: 1, explanation: "An empty dependency array means the effect runs only once, after mount." },
        { q: "How do you pass data from a parent to a child component?", options: ["State", "Props", "Context only", "Refs"], correct: 1, explanation: "Props pass data down from parent to child components." }
      ],
      hard: [
        { q: "What problem does React.memo solve?", options: ["Routing", "Unnecessary re-renders of a component", "State management", "CSS scoping"], correct: 1, explanation: "React.memo skips re-rendering a component when its props haven't changed." },
        { q: "What is the purpose of a key prop in a list?", options: ["Styling", "Helps React identify which items changed/added/removed", "Sets the element id", "Improves SEO"], correct: 1, explanation: "Keys help React efficiently track list items across re-renders." }
      ]
    },
    "Python": {
      easy: [
        { q: "Which keyword defines a function in Python?", options: ["func", "def", "function", "lambda only"], correct: 1, explanation: "'def' is used to define a function in Python." },
        { q: "Which data type is immutable in Python?", options: ["list", "dict", "tuple", "set"], correct: 2, explanation: "Tuples are immutable — their contents can't be changed after creation." }
      ],
      medium: [
        { q: "What does the len() function return for a list?", options: ["The last item", "The number of items", "The data type", "The sum of items"], correct: 1, explanation: "len() returns the number of items in a sequence." },
        { q: "Which statement is used for exception handling?", options: ["try/except", "catch/throw", "on error", "handle/rescue"], correct: 0, explanation: "Python uses try/except blocks to handle exceptions." }
      ],
      hard: [
        { q: "What does a Python list comprehension like [x*2 for x in range(5)] produce?", options: ["A generator", "[0,2,4,6,8]", "An error", "A tuple"], correct: 1, explanation: "It builds a list by doubling each value from range(5)." },
        { q: "What is the difference between a shallow copy and a deep copy?", options: ["No difference", "Shallow copies nested objects by reference; deep copies recursively duplicate them", "Deep copy is always faster", "Shallow copy duplicates memory addresses"], correct: 1, explanation: "A shallow copy shares references to nested objects; a deep copy duplicates them entirely." }
      ]
    }
  };

  let currentAiQuiz = null; // { course, difficulty, questions: [...], answers: [] }

  /* -------------------- Default dummy data -------------------- */
  const defaultAssignments = [
    {
      id: "a1",
      title: "HTML Portfolio",
      course: "HTML & CSS",
      dueDate: "2026-08-02",
      totalMarks: 100,
      status: "graded", // pending | submitted | graded
      obtainedMarks: 85,
      feedback: "Great structure and clean semantic markup. Improve responsiveness on smaller screens.",
      submittedDate: "2026-07-28"
    },
    {
      id: "a2",
      title: "JavaScript Quiz Project",
      course: "JavaScript",
      dueDate: "2026-08-21",
      totalMarks: 100,
      status: "pending",
      obtainedMarks: null,
      feedback: "",
      submittedDate: null
    },
    {
      id: "a3",
      title: "React Components",
      course: "React JS",
      dueDate: "2026-08-25",
      totalMarks: 100,
      status: "pending",
      obtainedMarks: null,
      feedback: "",
      submittedDate: null
    },
    {
      id: "a4",
      title: "Python Basics Exercise",
      course: "Python",
      dueDate: "2026-07-20",
      totalMarks: 100,
      status: "graded",
      obtainedMarks: 78,
      feedback: "Good logic overall. Watch your indentation and variable naming conventions.",
      submittedDate: "2026-07-19"
    },
    {
      id: "a5",
      title: "Bootstrap Landing Page",
      course: "HTML & CSS",
      dueDate: "2026-08-19",
      totalMarks: 100,
      status: "submitted",
      obtainedMarks: null,
      feedback: "",
      submittedDate: "2026-08-18"
    }
  ];

  const defaultActivity = [
    { icon: "fa-solid fa-circle-check text-success", text: "Bootstrap Landing Page submitted successfully" },
    { icon: "fa-solid fa-star text-warning", text: "HTML Portfolio graded — Score 85%" },
    { icon: "fa-solid fa-clock text-danger", text: "JavaScript Quiz Project due in 2 days" }
  ];

  /* -------------------- State -------------------- */
  let assignments = loadAssignments();
  let activity = loadActivity();
  let currentFilter = "all";
  let currentSearch = "";
  let pendingSubmitId = null;

  /* -------------------- Storage helpers -------------------- */
  function loadAssignments() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Could not read assignments from storage", e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAssignments));
    return defaultAssignments.slice();
  }

  function saveAssignments() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  }

  function loadActivity() {
    try {
      const raw = localStorage.getItem(ACTIVITY_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Could not read activity from storage", e);
    }
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(defaultActivity));
    return defaultActivity.slice();
  }

  function saveActivity() {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
  }

  function addActivity(icon, text) {
    activity.unshift({ icon, text });
    activity = activity.slice(0, 6);
    saveActivity();
    renderActivity();
  }

  /* -------------------- Utilities -------------------- */
  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  function daysLeft(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr + "T00:00:00");
    const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  }

  function statusBadge(status) {
    if (status === "graded") return '<span class="badge bg-info">Graded</span>';
    if (status === "submitted") return '<span class="badge bg-success">Submitted</span>';
    return '<span class="badge bg-warning text-dark">Pending</span>';
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  /* -------------------- Rendering -------------------- */
  function renderStats() {
    const total = assignments.length;
    const completed = assignments.filter(a => a.status === "submitted" || a.status === "graded").length;
    const pending = assignments.filter(a => a.status === "pending").length;
    const graded = assignments.filter(a => a.status === "graded" && a.obtainedMarks !== null);
    const avg = graded.length
      ? Math.round(graded.reduce((sum, a) => sum + (a.obtainedMarks / a.totalMarks) * 100, 0) / graded.length)
      : 0;

    document.getElementById("statTotal").textContent = total;
    document.getElementById("statCompleted").textContent = completed;
    document.getElementById("statPending").textContent = pending;
    document.getElementById("statAverage").textContent = avg + "%";
  }

  function getFilteredAssignments() {
    return assignments.filter(a => {
      const matchesStatus = currentFilter === "all" || a.status === currentFilter;
      const q = currentSearch.trim().toLowerCase();
      const matchesSearch = !q || a.title.toLowerCase().includes(q) || a.course.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }

  function renderTable() {
    const tbody = document.getElementById("assignmentTableBody");
    const emptyMsg = document.getElementById("noAssignmentsMsg");
    const list = getFilteredAssignments();

    if (!list.length) {
      tbody.innerHTML = "";
      emptyMsg.classList.remove("d-none");
      return;
    }
    emptyMsg.classList.add("d-none");

    tbody.innerHTML = list.map(a => {
      const marks = a.status === "graded" ? `${a.obtainedMarks} / ${a.totalMarks}` : "-";
      let actionBtns = "";

      if (a.status === "pending") {
        actionBtns = `
          <button class="btn btn-sm btn-primary view-btn" data-id="${a.id}">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-success submit-btn" data-id="${a.id}">
            Submit
          </button>`;
      } else if (a.status === "submitted") {
        actionBtns = `
          <button class="btn btn-sm btn-primary view-btn" data-id="${a.id}">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-secondary" disabled>
            Awaiting Grade
          </button>`;
      } else {
        actionBtns = `
          <button class="btn btn-sm btn-primary view-btn" data-id="${a.id}">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-info view-btn" data-id="${a.id}">
            Feedback
          </button>`;
      }

      return `
        <tr>
          <td>${escapeHtml(a.title)}</td>
          <td>${escapeHtml(a.course)}</td>
          <td>${formatDate(a.dueDate)}</td>
          <td>${marks}</td>
          <td>${statusBadge(a.status)}</td>
          <td>${actionBtns}</td>
        </tr>`;
    }).join("");

    attachRowListeners();
  }

  function renderDeadlines() {
    const container = document.getElementById("deadlinesList");
    const upcoming = assignments
      .filter(a => a.status === "pending")
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3);

    if (!upcoming.length) {
      container.innerHTML = '<p class="text-muted mb-0">No upcoming deadlines. You\'re all caught up!</p>';
      return;
    }

    container.innerHTML = upcoming.map((a, idx) => {
      const left = daysLeft(a.dueDate);
      let badge;
      if (left < 0) badge = '<span class="badge bg-danger">Overdue</span>';
      else if (left <= 2) badge = `<span class="badge bg-danger">${left} Day${left === 1 ? "" : "s"} Left</span>`;
      else if (left <= 7) badge = `<span class="badge bg-warning text-dark">${left} Days Left</span>`;
      else badge = '<span class="badge bg-info">Scheduled</span>';

      const divider = idx < upcoming.length - 1 ? "<hr>" : "";
      return `
        <div class="assignment-item">
          <div>
            <h6>${escapeHtml(a.title)}</h6>
            <small>Due: ${formatDate(a.dueDate)}</small>
          </div>
          ${badge}
        </div>
        ${divider}`;
    }).join("");
  }

  function renderActivity() {
    const container = document.getElementById("activityList");
    container.innerHTML = activity.map((item, idx) => {
      const divider = idx < activity.length - 1 ? "<hr>" : "";
      return `
        <div class="activity-item">
          <i class="${item.icon} me-3"></i>
          ${escapeHtml(item.text)}
        </div>
        ${divider}`;
    }).join("");
  }

  function renderAll() {
    renderStats();
    renderTable();
    renderDeadlines();
    renderActivity();
  }

  /* -------------------- Row action handlers -------------------- */
  function attachRowListeners() {
    document.querySelectorAll(".submit-btn").forEach(btn => {
      btn.addEventListener("click", () => openSubmitModal(btn.dataset.id));
    });
    document.querySelectorAll(".view-btn").forEach(btn => {
      btn.addEventListener("click", () => openViewModal(btn.dataset.id));
    });
  }

  function openSubmitModal(id) {
    const assignment = assignments.find(a => a.id === id);
    if (!assignment) return;
    pendingSubmitId = id;

    document.getElementById("submitAssignmentTitle").textContent = assignment.title;
    document.getElementById("submitAssignmentCourse").textContent = assignment.course + " • Due " + formatDate(assignment.dueDate);
    document.getElementById("submitAssignmentForm").reset();

    const modal = new bootstrap.Modal(document.getElementById("submitModal"));
    modal.show();
  }

  function openViewModal(id) {
    const assignment = assignments.find(a => a.id === id);
    if (!assignment) return;

    document.getElementById("viewModalTitle").textContent = assignment.title;

    let body = `
      <p class="mb-1"><strong>Course:</strong> ${escapeHtml(assignment.course)}</p>
      <p class="mb-1"><strong>Due Date:</strong> ${formatDate(assignment.dueDate)}</p>
      <p class="mb-1"><strong>Total Marks:</strong> ${assignment.totalMarks}</p>
      <p class="mb-1"><strong>Status:</strong> ${statusBadge(assignment.status)}</p>`;

    if (assignment.submittedDate) {
      body += `<p class="mb-1"><strong>Submitted On:</strong> ${formatDate(assignment.submittedDate)}</p>`;
    }

    if (assignment.status === "graded") {
      body += `
        <hr>
        <p class="mb-1"><strong>Score:</strong> ${assignment.obtainedMarks} / ${assignment.totalMarks}</p>
        <p class="mb-1"><strong>Teacher Feedback:</strong></p>
        <p class="text-muted">${escapeHtml(assignment.feedback || "No feedback provided.")}</p>`;
    } else if (assignment.status === "submitted") {
      body += `<hr><p class="text-muted mb-0">Your submission is awaiting review by the teacher.</p>`;
    } else {
      body += `<hr><p class="text-muted mb-0">You haven't submitted this assignment yet.</p>`;
    }

    document.getElementById("viewModalBody").innerHTML = body;

    const modal = new bootstrap.Modal(document.getElementById("viewModal"));
    modal.show();
  }

  function confirmSubmit() {
    const fileInput = document.getElementById("submitFile");
    if (!fileInput.value) {
      fileInput.classList.add("is-invalid");
      return;
    }
    fileInput.classList.remove("is-invalid");

    const assignment = assignments.find(a => a.id === pendingSubmitId);
    if (!assignment) return;

    assignment.status = "submitted";
    assignment.submittedDate = new Date().toISOString().slice(0, 10);
    saveAssignments();

    addActivity("fa-solid fa-circle-check text-success", `${assignment.title} submitted successfully`);
    renderAll();

    const modalEl = document.getElementById("submitModal");
    bootstrap.Modal.getInstance(modalEl).hide();
    pendingSubmitId = null;
  }

  /* -------------------- AI Quiz Generator -------------------- */
  function saveAiQuizAttempt(record) {
    let attempts = [];
    try {
      const raw = localStorage.getItem(AI_QUIZ_KEY);
      if (raw) attempts = JSON.parse(raw);
    } catch (e) {
      attempts = [];
    }
    attempts.unshift(record);
    attempts = attempts.slice(0, 20);
    localStorage.setItem(AI_QUIZ_KEY, JSON.stringify(attempts));
  }

  function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function generateQuizQuestions(course, difficulty, count) {
    const pool = (QUESTION_BANK[course] && QUESTION_BANK[course][difficulty]) || [];
    const otherDifficulties = ["easy", "medium", "hard"].filter(d => d !== difficulty);
    let combined = pool.slice();

    // Top up with questions from other difficulty tiers of the same course
    // if the bank doesn't have enough at the requested level.
    otherDifficulties.forEach(d => {
      if (combined.length < count && QUESTION_BANK[course] && QUESTION_BANK[course][d]) {
        combined = combined.concat(QUESTION_BANK[course][d]);
      }
    });

    const shuffled = shuffle(combined);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  function resetAiQuizModal() {
    document.getElementById("aiQuizConfigStep").classList.remove("d-none");
    document.getElementById("aiQuizLoadingStep").classList.add("d-none");
    document.getElementById("aiQuizAttemptStep").classList.add("d-none");
    document.getElementById("aiQuizResultStep").classList.add("d-none");

    document.getElementById("generateAiQuizBtn").classList.remove("d-none");
    document.getElementById("submitAiQuizBtn").classList.add("d-none");
    document.getElementById("retakeAiQuizBtn").classList.add("d-none");

    currentAiQuiz = null;
  }

  function openAiQuizModal() {
    resetAiQuizModal();
    const modal = new bootstrap.Modal(document.getElementById("aiQuizModal"));
    modal.show();
  }

  function startQuizGeneration() {
    const course = document.getElementById("aiQuizCourse").value;
    const difficulty = document.getElementById("aiQuizDifficulty").value;
    const count = parseInt(document.getElementById("aiQuizCount").value, 10);

    document.getElementById("aiQuizConfigStep").classList.add("d-none");
    document.getElementById("aiQuizLoadingStep").classList.remove("d-none");
    document.getElementById("generateAiQuizBtn").classList.add("d-none");

    // Simulated AI "thinking" delay for a natural generation feel.
    setTimeout(() => {
      const questions = generateQuizQuestions(course, difficulty, count);
      currentAiQuiz = { course, difficulty, questions, answers: new Array(questions.length).fill(null) };

      document.getElementById("aiQuizLoadingStep").classList.add("d-none");
      document.getElementById("aiQuizAttemptStep").classList.remove("d-none");
      document.getElementById("submitAiQuizBtn").classList.remove("d-none");

      renderQuizQuestions();
    }, 900);
  }

  function renderQuizQuestions() {
    const container = document.getElementById("aiQuizQuestions");
    if (!currentAiQuiz || !currentAiQuiz.questions.length) {
      container.innerHTML = '<p class="text-muted">No questions available for this course/difficulty yet.</p>';
      return;
    }

    container.innerHTML = currentAiQuiz.questions.map((item, qIdx) => `
      <div class="mb-4">
        <p class="fw-semibold mb-2">${qIdx + 1}. ${escapeHtml(item.q)}</p>
        ${item.options.map((opt, oIdx) => `
          <div class="form-check">
            <input class="form-check-input" type="radio" name="aiq_${qIdx}" id="aiq_${qIdx}_${oIdx}" value="${oIdx}">
            <label class="form-check-label" for="aiq_${qIdx}_${oIdx}">${escapeHtml(opt)}</label>
          </div>`).join("")}
      </div>
    `).join("");

    container.querySelectorAll('input[type="radio"]').forEach(input => {
      input.addEventListener("change", e => {
        const qIdx = parseInt(e.target.name.split("_")[1], 10);
        currentAiQuiz.answers[qIdx] = parseInt(e.target.value, 10);
      });
    });
  }

  function submitAiQuiz() {
    if (!currentAiQuiz) return;

    const total = currentAiQuiz.questions.length;
    let correctCount = 0;

    const reviewHtml = currentAiQuiz.questions.map((item, idx) => {
      const userAnswer = currentAiQuiz.answers[idx];
      const isCorrect = userAnswer === item.correct;
      if (isCorrect) correctCount++;

      return `
        <div class="mb-3 p-3" style="border-left: 3px solid ${isCorrect ? "#28a745" : "#dc3545"};">
          <p class="fw-semibold mb-1">${idx + 1}. ${escapeHtml(item.q)}</p>
          <p class="mb-1 small">
            Your answer: ${userAnswer !== null ? escapeHtml(item.options[userAnswer]) : "<em>Not answered</em>"}
            ${isCorrect ? '<span class="badge bg-success ms-2">Correct</span>' : '<span class="badge bg-danger ms-2">Incorrect</span>'}
          </p>
          ${!isCorrect ? `<p class="mb-1 small">Correct answer: ${escapeHtml(item.options[item.correct])}</p>` : ""}
          <p class="mb-0 small text-muted">${escapeHtml(item.explanation)}</p>
        </div>`;
    }).join("");

    const scorePercent = Math.round((correctCount / total) * 100);

    document.getElementById("aiQuizAttemptStep").classList.add("d-none");
    document.getElementById("submitAiQuizBtn").classList.add("d-none");
    document.getElementById("aiQuizResultStep").classList.remove("d-none");
    document.getElementById("retakeAiQuizBtn").classList.remove("d-none");

    document.getElementById("aiQuizScoreText").textContent = `${correctCount} / ${total} Correct (${scorePercent}%)`;
    document.getElementById("aiQuizScoreSub").textContent = `${currentAiQuiz.course} • ${currentAiQuiz.difficulty} difficulty`;
    document.getElementById("aiQuizReview").innerHTML = reviewHtml;

    saveAiQuizAttempt({
      course: currentAiQuiz.course,
      difficulty: currentAiQuiz.difficulty,
      score: scorePercent,
      total,
      correctCount,
      date: new Date().toISOString().slice(0, 10)
    });

    addActivity("fa-solid fa-wand-magic-sparkles text-primary", `AI Quiz generated for ${currentAiQuiz.course} — scored ${scorePercent}%`);
  }

  /* -------------------- Init -------------------- */
  function init() {
    document.getElementById("assignmentSearch").addEventListener("input", e => {
      currentSearch = e.target.value;
      renderTable();
    });

    document.getElementById("statusFilter").addEventListener("change", e => {
      currentFilter = e.target.value;
      renderTable();
    });

    document.getElementById("confirmSubmitBtn").addEventListener("click", confirmSubmit);

    document.getElementById("openAiQuizBtn").addEventListener("click", openAiQuizModal);
    document.getElementById("generateAiQuizBtn").addEventListener("click", startQuizGeneration);
    document.getElementById("submitAiQuizBtn").addEventListener("click", submitAiQuiz);
    document.getElementById("retakeAiQuizBtn").addEventListener("click", resetAiQuizModal);
    document.getElementById("aiQuizModal").addEventListener("hidden.bs.modal", resetAiQuizModal);

    renderAll();
  }

  document.addEventListener("DOMContentLoaded", init);
})();