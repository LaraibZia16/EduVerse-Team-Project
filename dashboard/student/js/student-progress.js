/* ==========================================================
   EDUVERSE — STUDENT "MY PROGRESS" JS
   Vanilla ES6, LocalStorage-backed dummy data.
   Shows this student's OWN progress only — no student
   selector, no teacher-authoring, no other students' data.
========================================================== */

const STORAGE_KEY = "eduverse_my_progress_data";

let attendanceChartInstance = null;
let monthlyProgressChartInstance = null;
let subjectPerformanceChartInstance = null;
let quizPerformanceChartInstance = null;
let assignmentPerformanceChartInstance = null;


document.addEventListener("DOMContentLoaded", () => {

    initSidebarToggleFallback();
    initActiveNavLink();

    seedProgressData();

    const data = getProgressData();

    renderProfile(data);
    renderOverallStats(data);
    renderAttendance(data);
    renderAssignments(data);
    renderQuizzes(data);
    renderSubjects(data);
    renderResults(data);
    renderAnalyticsCharts(data);
    renderTeacherFeedback(data);
    renderChat(data);
    renderActivityTimeline(data);
    renderAchievements(data);
    renderRecommendations(data);
    renderSchedule(data);
    renderAlerts(data);
    populateFilterOptions(data);

    bindAssignmentToolbar();
    bindGlobalSearch();
    bindExportButtons();
    bindChatInput();
    bindFilterBar();

});


/* ==========================================================
   SIDEBAR TOGGLE FALLBACK
   (dashboard.js already binds this — this guards pages
   loaded without it, without double-binding.)
========================================================== */

function initSidebarToggleFallback() {

    const toggleBtn = document.querySelector(".menu-toggle");
    const wrapper = document.querySelector(".dashboard-wrapper");

    if (!toggleBtn || !wrapper || toggleBtn.dataset.bound) return;

    toggleBtn.dataset.bound = "true";

    toggleBtn.addEventListener("click", () => {
        wrapper.classList.toggle("sidebar-collapsed");
    });

}


/* ==========================================================
   ACTIVE NAV LINK HIGHLIGHTING
========================================================== */

function initActiveNavLink() {

    const currentPage = window.location.pathname.split("/").pop() || "student-progress.html";
    const navItems = document.querySelectorAll(".sidebar-menu ul li");

    navItems.forEach((li) => {
        const link = li.querySelector("a");
        if (!link) return;

        const href = link.getAttribute("href");
        li.classList.toggle("active", href === currentPage);
    });

}


/* ==========================================================
   DUMMY DATA SEEDING
========================================================== */

function seedProgressData() {

    if (localStorage.getItem(STORAGE_KEY)) return;

    const today = new Date();

    const addDays = (n) => {
        const d = new Date(today);
        d.setDate(d.getDate() + n);
        return d.toISOString().split("T")[0];
    };

    const data = {

        profile: {
            name: "Ayesha Khan",
            avatar: "https://i.pravatar.cc/150?img=47",
            course: "Web Development",
            batch: "Batch 2026-A",
            status: "Active",
            studentId: "STU-2451",
            rollNo: "WD-021",
            email: "ayesha.khan@example.com",
            phone: "+92 300 1234567",
            joinDate: "10 Jan 2026"
        },

        overall: {
            gpa: "3.7",
            attendancePercent: 88,
            avgQuizScore: 85,
            avgAssignmentScore: 82,
            coursesCompleted: 5,
            coursesEnrolled: 8
        },

        attendance: {
            present: 88,
            absent: 8,
            leave: 4,
            monthly: {
                labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
                values: [82, 85, 90, 87, 91, 88]
            }
        },

        assignments: [
            {
                title: "HTML Portfolio",
                subject: "HTML & CSS",
                dueDate: addDays(-8),
                submitted: true,
                submittedDate: addDays(-9),
                marks: "85 / 100",
                status: "completed",
                remarks: "Great structure, clean semantic markup."
            },
            {
                title: "Bootstrap Landing Page",
                subject: "HTML & CSS",
                dueDate: addDays(4),
                submitted: false,
                submittedDate: null,
                marks: "--",
                status: "pending",
                remarks: "Not submitted yet."
            },
            {
                title: "JavaScript To-Do App",
                subject: "JavaScript",
                dueDate: addDays(-2),
                submitted: false,
                submittedDate: null,
                marks: "--",
                status: "overdue",
                remarks: "Deadline passed — submit as soon as possible."
            },
            {
                title: "React Reusable Components",
                subject: "React JS",
                dueDate: addDays(10),
                submitted: false,
                submittedDate: null,
                marks: "--",
                status: "pending",
                remarks: "Not submitted yet."
            },
            {
                title: "Python Data Structures Lab",
                subject: "Python",
                dueDate: addDays(-15),
                submitted: true,
                submittedDate: addDays(-16),
                marks: "91 / 100",
                status: "completed",
                remarks: "Excellent use of built-in data structures."
            },
            {
                title: "UI/UX Wireframe Task",
                subject: "UI / UX Design",
                dueDate: addDays(1),
                submitted: false,
                submittedDate: null,
                marks: "--",
                status: "pending",
                remarks: "Due very soon — don't forget!"
            }
        ],

        quizzes: [
            { name: "HTML Basics Quiz", date: "28 Jul 2026", score: "17 / 20", percent: 85, result: "Passed", time: "8 min" },
            { name: "JavaScript MCQ Test", date: "26 Jul 2026", score: "22 / 25", percent: 88, result: "Passed", time: "12 min" },
            { name: "React Components Quiz", date: "20 Jul 2026", score: "14 / 20", percent: 70, result: "Passed", time: "10 min" }
        ],

        subjects: [
            { name: "HTML & CSS", percent: 90, color: "success" },
            { name: "JavaScript", percent: 78, color: "primary" },
            { name: "React JS", percent: 65, color: "warning" },
            { name: "Python", percent: 88, color: "info" }
        ],

        results: [
            { semester: "Semester 1", gpa: "3.6", percent: "84%", rank: "5 / 60", status: "Passed" },
            { semester: "Semester 2", gpa: "3.7", percent: "87%", rank: "3 / 58", status: "Passed" }
        ],

        teacherFeedback: [
            { teacher: "Usman Ali", subject: "HTML & CSS", note: "Great structure, clean semantic markup. Work on responsive spacing.", date: "29 Jul 2026" },
            { teacher: "Usman Ali", subject: "Python", note: "Excellent use of built-in data structures. Keep it up!", date: "25 Jul 2026" }
        ],

        chat: {
            teacherName: "Usman Ali",
            teacherAvatar: "https://i.pravatar.cc/100?img=12",
            messages: [
                { from: "teacher", text: "Good job on the HTML Portfolio submission!", time: "Yesterday" },
                { from: "student", text: "Thank you! Any tips for the Bootstrap assignment?", time: "Yesterday" },
                { from: "teacher", text: "Focus on the grid system and keep it mobile-first.", time: "Today" }
            ]
        },

        activity: [
            { icon: "fa-circle-check", color: "success", text: "Completed \"Python Data Structures Lab\" — scored 91%" },
            { icon: "fa-clipboard-check", color: "primary", text: "Attempted \"JavaScript MCQ Test\" — scored 88%" },
            { icon: "fa-file-circle-check", color: "warning", text: "Submitted \"HTML Portfolio\"" },
            { icon: "fa-star", color: "danger", text: "Unlocked achievement: Perfect Attendance Week" }
        ],

        achievements: [
            { icon: "fa-trophy", label: "Perfect Attendance Week", earned: true },
            { icon: "fa-medal", label: "Top 5 in Semester 1", earned: true },
            { icon: "fa-bolt", label: "Quiz Streak x5", earned: true },
            { icon: "fa-book", label: "Course Completion: Python", earned: true },
            { icon: "fa-crown", label: "Top 3 in Semester 2", earned: false }
        ],

        recommendations: [
            { title: "Revise React Hooks", reason: "Your React JS score (65%) is your lowest subject — a quick refresher could help." },
            { title: "Practice more JS quizzes", reason: "You're close to an 90%+ average — one more strong attempt would get you there." },
            { title: "Keep your attendance streak going", reason: "88% attendance is solid — a few more present days will push you past 90%." }
        ],

        schedule: [
            { title: "React Development — Live Class", type: "Class", when: addDays(0) + " · 02:00 PM" },
            { title: "Bootstrap Landing Page — Due", type: "Deadline", when: addDays(4) },
            { title: "UI/UX Wireframe Task — Due", type: "Deadline", when: addDays(1) },
            { title: "JavaScript Advanced Quiz", type: "Quiz", when: addDays(6) }
        ]

    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

}

function getProgressData() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}

function saveProgressData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}


/* ==========================================================
   PROFILE
========================================================== */

function renderProfile(data) {

    const p = data.profile;
    if (!p) return;

    document.getElementById("studentAvatar").src = p.avatar;
    document.getElementById("studentName").textContent = p.name;
    document.getElementById("studentCourseBatch").textContent = `${p.course} · ${p.batch}`;
    document.getElementById("studentStatusBadge").textContent = p.status;

    document.getElementById("infoStudentId").textContent = p.studentId;
    document.getElementById("infoRollNo").textContent = p.rollNo;
    document.getElementById("infoEmail").textContent = p.email;
    document.getElementById("infoPhone").textContent = p.phone;
    document.getElementById("infoJoinDate").textContent = p.joinDate;

}


/* ==========================================================
   OVERALL PROGRESS STATS
========================================================== */

function renderOverallStats(data) {

    const grid = document.getElementById("overallStatsGrid");
    if (!grid) return;

    const o = data.overall;

    const cards = [
        { icon: "fa-graduation-cap", color: "purple", value: o.gpa, label: "Current GPA" },
        { icon: "fa-calendar-check", color: "green", value: `${o.attendancePercent}%`, label: "Attendance" },
        { icon: "fa-clipboard-question", color: "blue", value: `${o.avgQuizScore}%`, label: "Avg Quiz Score" },
        { icon: "fa-file-lines", color: "orange", value: `${o.avgAssignmentScore}%`, label: "Avg Assignment Score" },
        { icon: "fa-book-open", color: "yellow", value: `${o.coursesCompleted}/${o.coursesEnrolled}`, label: "Courses Completed" }
    ];

    grid.innerHTML = cards.map(c => `
        <div class="col-xl col-lg-4 col-md-6">
            <div class="stat-card">
                <div class="stat-icon ${c.color}">
                    <i class="fa-solid ${c.icon}"></i>
                </div>
                <div class="stat-info">
                    <h2>${c.value}</h2>
                    <h5>${c.label}</h5>
                </div>
            </div>
        </div>
    `).join("");

}


/* ==========================================================
   ATTENDANCE
========================================================== */

function renderAttendance(data) {

    const a = data.attendance;
    if (!a) return;

    const statsGrid = document.getElementById("attendanceStatsGrid");

    const stats = [
        { label: "Present", value: a.present, color: "text-success" },
        { label: "Absent", value: a.absent, color: "text-danger" },
        { label: "Leave", value: a.leave, color: "text-warning" }
    ];

    statsGrid.innerHTML = stats.map(s => `
        <div class="col-4 text-center">
            <h3 class="${s.color} mb-1">${s.value}</h3>
            <small class="text-muted">${s.label}</small>
        </div>
    `).join("");

    document.getElementById("attendancePercentLabel").textContent = `${a.present}%`;
    document.getElementById("attendanceProgressBar").style.width = `${a.present}%`;

    const ctx = document.getElementById("attendanceChart");
    if (!ctx) return;

    if (attendanceChartInstance) attendanceChartInstance.destroy();

    attendanceChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: a.monthly.labels,
            datasets: [{
                label: "Attendance %",
                data: a.monthly.values,
                borderColor: "#16a34a",
                backgroundColor: "rgba(22,163,74,0.1)",
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });

}


/* ==========================================================
   ASSIGNMENTS — done / pending / deadline tracker
========================================================== */

function daysUntil(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);
    return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

function renderAssignments(data) {

    const list = data.assignments || [];

    // ----- Snapshot cards -----

    const completed = list.filter(a => a.status === "completed").length;
    const overdue = list.filter(a => a.status === "overdue").length;
    const pending = list.filter(a => a.status === "pending").length;
    const total = list.length;

    const statsGrid = document.getElementById("assignmentStatsGrid");

    const cards = [
        { icon: "fa-file-lines", color: "purple", value: total, label: "Total Assignments" },
        { icon: "fa-circle-check", color: "green", value: completed, label: "Completed" },
        { icon: "fa-clock", color: "orange", value: pending, label: "Pending" },
        { icon: "fa-triangle-exclamation", color: "blue", value: overdue, label: "Overdue" }
    ];

    statsGrid.innerHTML = cards.map(c => `
        <div class="col-xl-3 col-md-6">
            <div class="stat-card">
                <div class="stat-icon ${c.color}">
                    <i class="fa-solid ${c.icon}"></i>
                </div>
                <div class="stat-info">
                    <h2>${c.value}</h2>
                    <h5>${c.label}</h5>
                </div>
            </div>
        </div>
    `).join("");

    // ----- Completion bar -----

    const completionPercent = total ? Math.round((completed / total) * 100) : 0;

    document.getElementById("assignmentCompletionLabel").textContent = `${completionPercent}%`;
    document.getElementById("assignmentCompletionBar").style.width = `${completionPercent}%`;

    // ----- Next deadline banner -----

    const upcoming = list
        .filter(a => a.status !== "completed")
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const banner = upcoming[0];
    const titleEl = document.getElementById("nextDeadlineTitle");
    const subtitleEl = document.getElementById("nextDeadlineSubtitle");
    const badgeEl = document.getElementById("nextDeadlineBadge");

    if (banner) {

        const daysLeft = daysUntil(banner.dueDate);

        titleEl.textContent = `Next Deadline: ${banner.title} (${banner.subject})`;
        subtitleEl.textContent = `Due on ${formatDate(banner.dueDate)}`;

        badgeEl.style.display = "inline-block";

        if (daysLeft < 0) {
            badgeEl.className = "badge bg-danger";
            badgeEl.textContent = `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"}`;
        } else if (daysLeft === 0) {
            badgeEl.className = "badge bg-danger";
            badgeEl.textContent = "Due Today";
        } else {
            badgeEl.className = daysLeft <= 3 ? "badge bg-danger" : "badge bg-warning text-dark";
            badgeEl.textContent = `${daysLeft} Day${daysLeft === 1 ? "" : "s"} Left`;
        }

    } else {
        titleEl.textContent = "No upcoming deadlines";
        subtitleEl.textContent = "You're all caught up!";
        badgeEl.style.display = "none";
    }

    renderAssignmentTable(data);

}

function renderAssignmentTable(data) {

    const tbody = document.getElementById("assignmentsTableBody");
    if (!tbody) return;

    const list = [...(data.assignments || [])];

    const searchTerm = (document.getElementById("assignmentTableSearch")?.value || "").toLowerCase().trim();
    const statusFilter = document.getElementById("assignmentStatusFilter")?.value || "all";
    const sortValue = document.getElementById("assignmentSortSelect")?.value || "deadline";

    let filtered = list.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchTerm) || a.subject.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === "all" || a.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (sortValue === "deadline") {
        filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sortValue === "az") {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    }
    // "recent" keeps original insertion order

    tbody.innerHTML = filtered.map(a => {

        const daysLeft = daysUntil(a.dueDate);
        let daysLeftLabel;

        if (a.status === "completed") {
            daysLeftLabel = `<span class="text-muted">--</span>`;
        } else if (daysLeft < 0) {
            daysLeftLabel = `<span class="text-danger fw-semibold">${Math.abs(daysLeft)}d overdue</span>`;
        } else if (daysLeft === 0) {
            daysLeftLabel = `<span class="text-danger fw-semibold">Due Today</span>`;
        } else {
            daysLeftLabel = `<span class="${daysLeft <= 3 ? 'text-danger' : 'text-muted'}">${daysLeft}d left</span>`;
        }

        const statusBadge = {
            completed: `<span class="badge bg-success">Completed</span>`,
            pending: `<span class="badge bg-warning text-dark">Pending</span>`,
            overdue: `<span class="badge bg-danger">Overdue</span>`
        }[a.status];

        return `
            <tr>
                <td>${a.title}</td>
                <td>${a.subject}</td>
                <td>${formatDate(a.dueDate)}</td>
                <td>${daysLeftLabel}</td>
                <td>${a.submitted ? formatDate(a.submittedDate) : "--"}</td>
                <td>${a.marks}</td>
                <td>${statusBadge}</td>
                <td>${a.remarks}</td>
            </tr>
        `;

    }).join("") || `<tr><td colspan="8" class="text-center text-muted py-4">No assignments match your search/filter.</td></tr>`;

}

function bindAssignmentToolbar() {

    document.getElementById("assignmentTableSearch")?.addEventListener("input", () => {
        renderAssignmentTable(getProgressData());
    });

    document.getElementById("assignmentStatusFilter")?.addEventListener("change", () => {
        renderAssignmentTable(getProgressData());
    });

    document.getElementById("assignmentSortSelect")?.addEventListener("change", () => {
        renderAssignmentTable(getProgressData());
    });

}


/* ==========================================================
   QUIZZES
========================================================== */

function renderQuizzes(data) {

    const tbody = document.querySelector("#quizzesTable tbody");
    if (!tbody) return;

    const list = data.quizzes || [];

    tbody.innerHTML = list.map(q => `
        <tr>
            <td>${q.name}</td>
            <td>${q.date}</td>
            <td>${q.score}</td>
            <td>${q.percent}%</td>
            <td><span class="badge ${q.result === 'Passed' ? 'bg-success' : 'bg-danger'}">${q.result}</span></td>
            <td>${q.time}</td>
        </tr>
    `).join("") || `<tr><td colspan="6" class="text-center text-muted py-4">You haven't attempted any quizzes yet.</td></tr>`;

}


/* ==========================================================
   SUBJECT-WISE PERFORMANCE
========================================================== */

function renderSubjects(data) {

    const grid = document.getElementById("subjectsGrid");
    if (!grid) return;

    const list = data.subjects || [];

    grid.innerHTML = list.map(s => `
        <div class="col-lg-3 col-md-6">
            <div class="dashboard-card">
                <h6>${s.name}</h6>
                <div class="progress mt-2 mb-1">
                    <div class="progress-bar bg-${s.color}" style="width:${s.percent}%;">${s.percent}%</div>
                </div>
            </div>
        </div>
    `).join("");

}


/* ==========================================================
   PREVIOUS RESULTS
========================================================== */

function renderResults(data) {

    const tbody = document.querySelector("#resultsTable tbody");
    if (!tbody) return;

    const list = data.results || [];

    tbody.innerHTML = list.map(r => `
        <tr>
            <td>${r.semester}</td>
            <td>${r.gpa}</td>
            <td>${r.percent}</td>
            <td>${r.rank}</td>
            <td><span class="badge bg-success">${r.status}</span></td>
        </tr>
    `).join("");

}


/* ==========================================================
   PROGRESS ANALYTICS CHARTS
========================================================== */

function renderAnalyticsCharts(data) {

    const monthlyCtx = document.getElementById("monthlyProgressChart");
    if (monthlyCtx) {

        if (monthlyProgressChartInstance) monthlyProgressChartInstance.destroy();

        monthlyProgressChartInstance = new Chart(monthlyCtx, {
            type: "line",
            data: {
                labels: data.attendance.monthly.labels,
                datasets: [{
                    label: "Overall Progress %",
                    data: data.attendance.monthly.values.map(v => Math.min(100, v + 4)),
                    borderColor: "#7c3aed",
                    backgroundColor: "rgba(124,58,237,0.1)",
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }
        });

    }

    const subjectCtx = document.getElementById("subjectPerformanceChart");
    if (subjectCtx) {

        if (subjectPerformanceChartInstance) subjectPerformanceChartInstance.destroy();

        subjectPerformanceChartInstance = new Chart(subjectCtx, {
            type: "bar",
            data: {
                labels: data.subjects.map(s => s.name),
                datasets: [{
                    label: "Score %",
                    data: data.subjects.map(s => s.percent),
                    backgroundColor: "#2563eb"
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }
        });

    }

    const quizCtx = document.getElementById("quizPerformanceChart");
    if (quizCtx) {

        if (quizPerformanceChartInstance) quizPerformanceChartInstance.destroy();

        quizPerformanceChartInstance = new Chart(quizCtx, {
            type: "line",
            data: {
                labels: data.quizzes.map(q => q.name),
                datasets: [{
                    label: "Quiz Score %",
                    data: data.quizzes.map(q => q.percent),
                    borderColor: "#f59e0b",
                    backgroundColor: "rgba(245,158,11,0.1)",
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }
        });

    }

    const assignmentCtx = document.getElementById("assignmentPerformanceChart");
    if (assignmentCtx) {

        const graded = data.assignments.filter(a => a.status === "completed");

        if (assignmentPerformanceChartInstance) assignmentPerformanceChartInstance.destroy();

        assignmentPerformanceChartInstance = new Chart(assignmentCtx, {
            type: "bar",
            data: {
                labels: graded.map(a => a.title),
                datasets: [{
                    label: "Marks %",
                    data: graded.map(a => parseInt(a.marks, 10) || 0),
                    backgroundColor: "#16a34a"
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }
        });

    }

}


/* ==========================================================
   FEEDBACK FROM MY TEACHERS (read-only)
========================================================== */

function renderTeacherFeedback(data) {

    const list = document.getElementById("teacherNotesList");
    if (!list) return;

    const feedback = data.teacherFeedback || [];

    if (feedback.length === 0) {
        list.innerHTML = `<p class="text-muted mb-0">No feedback shared yet.</p>`;
        return;
    }

    list.innerHTML = feedback.map(f => `
        <div class="dashboard-card mb-3">
            <div class="d-flex justify-content-between mb-1">
                <h6 class="mb-0">${f.teacher} &middot; <span class="text-muted">${f.subject}</span></h6>
                <small class="text-muted">${f.date}</small>
            </div>
            <p class="mb-0">${f.note}</p>
        </div>
    `).join("");

}


/* ==========================================================
   ASK MY TEACHER (chat)
========================================================== */

function renderChat(data) {

    const chat = data.chat;
    if (!chat) return;

    document.getElementById("chatUserAvatar").src = chat.teacherAvatar;
    document.getElementById("chatUserName").textContent = chat.teacherName;

    document.getElementById("teacherName").textContent = chat.teacherName;
    document.getElementById("teacherSubject").textContent = data.profile.course;
    document.getElementById("teacherEmail").textContent = "usman.ali@eduverse.com";

    renderChatMessages(chat.messages);

    const quickReplies = ["Thank you!", "Can you clarify?", "I'll submit soon."];
    const quickReplyRow = document.getElementById("quickReplyRow");

    quickReplyRow.innerHTML = quickReplies.map(q => `
        <button type="button" class="btn btn-sm btn-outline-primary quick-reply-btn">${q}</button>
    `).join("");

    quickReplyRow.querySelectorAll(".quick-reply-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            sendChatMessage(btn.textContent.trim());
        });
    });

}

function renderChatMessages(messages) {

    const body = document.getElementById("chatBody");
    if (!body) return;

    body.innerHTML = messages.map(m => `
        <div class="chat-message ${m.from === 'student' ? 'sent' : 'received'}">
            <p class="mb-1">${m.text}</p>
            <small>${m.time}</small>
        </div>
    `).join("");

    body.scrollTop = body.scrollHeight;

}

function bindChatInput() {

    const sendBtn = document.getElementById("sendMessageBtn");
    const input = document.getElementById("chatMessageInput");

    sendBtn?.addEventListener("click", () => {
        if (!input.value.trim()) return;
        sendChatMessage(input.value.trim());
        input.value = "";
    });

    input?.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && input.value.trim()) {
            sendChatMessage(input.value.trim());
            input.value = "";
        }
    });

}

function sendChatMessage(text) {

    const data = getProgressData();

    data.chat.messages.push({ from: "student", text, time: "Just now" });
    saveProgressData(data);

    renderChatMessages(data.chat.messages);

}


/* ==========================================================
   ACTIVITY TIMELINE
========================================================== */

function renderActivityTimeline(data) {

    const list = document.getElementById("activityTimeline");
    if (!list) return;

    const activity = data.activity || [];

    list.innerHTML = activity.map(a => `
        <div class="activity-item">
            <div class="activity-icon bg-${a.color}">
                <i class="fa-solid ${a.icon}"></i>
            </div>
            <div>
                <p class="mb-0">${a.text}</p>
            </div>
        </div>
    `).join("");

}


/* ==========================================================
   ACHIEVEMENTS
========================================================== */

function renderAchievements(data) {

    const list = document.getElementById("achievementsList");
    if (!list) return;

    const achievements = data.achievements || [];

    list.innerHTML = `
        <div class="row g-3">
            ${achievements.map(a => `
                <div class="col-lg-3 col-md-4 col-6">
                    <div class="dashboard-card text-center ${a.earned ? '' : 'opacity-50'}">
                        <i class="fa-solid ${a.icon} fa-2x mb-2 ${a.earned ? 'text-warning' : 'text-muted'}"></i>
                        <p class="mb-0 small">${a.label}</p>
                        ${a.earned ? '' : '<small class="text-muted">Locked</small>'}
                    </div>
                </div>
            `).join("")}
        </div>
    `;

}


/* ==========================================================
   LEARNING RECOMMENDATIONS
========================================================== */

function renderRecommendations(data) {

    const list = document.getElementById("recommendationsList");
    if (!list) return;

    const recs = data.recommendations || [];

    list.innerHTML = recs.map(r => `
        <div class="dashboard-card mb-3">
            <h6 class="mb-1"><i class="fa-solid fa-lightbulb text-warning me-2"></i>${r.title}</h6>
            <p class="text-muted mb-0">${r.reason}</p>
        </div>
    `).join("");

}


/* ==========================================================
   UPCOMING SCHEDULE
========================================================== */

function renderSchedule(data) {

    const list = document.getElementById("scheduleList");
    if (!list) return;

    const schedule = data.schedule || [];

    const typeIcon = {
        Class: "fa-chalkboard-user",
        Deadline: "fa-file-lines",
        Quiz: "fa-clipboard-question",
        Exam: "fa-pen"
    };

    list.innerHTML = schedule.map(s => `
        <div class="class-item">
            <div>
                <h6><i class="fa-solid ${typeIcon[s.type] || 'fa-calendar'} me-2 text-primary"></i>${s.title}</h6>
                <small>${s.when}</small>
            </div>
            <span class="badge bg-info">${s.type}</span>
        </div>
    `).join("");

}


/* ==========================================================
   PERFORMANCE ALERTS (about the student's own performance)
========================================================== */

function renderAlerts(data) {

    const section = document.getElementById("alertsSection");
    if (!section) return;

    const alerts = [];

    const overdueCount = (data.assignments || []).filter(a => a.status === "overdue").length;
    if (overdueCount > 0) {
        alerts.push({
            type: "danger",
            icon: "fa-triangle-exclamation",
            text: `You have ${overdueCount} overdue assignment${overdueCount > 1 ? "s" : ""}. Submit as soon as possible.`
        });
    }

    const dueSoon = (data.assignments || []).find(a => a.status === "pending" && daysUntil(a.dueDate) <= 2 && daysUntil(a.dueDate) >= 0);
    if (dueSoon) {
        alerts.push({
            type: "warning",
            icon: "fa-clock",
            text: `"${dueSoon.title}" is due very soon (${formatDate(dueSoon.dueDate)}).`
        });
    }

    if (data.overall && data.overall.attendancePercent < 75) {
        alerts.push({
            type: "warning",
            icon: "fa-calendar-xmark",
            text: `Your attendance (${data.overall.attendancePercent}%) is below the recommended 75% threshold.`
        });
    }

    if (alerts.length === 0) {
        section.innerHTML = "";
        return;
    }

    section.innerHTML = alerts.map(a => `
        <div class="alert alert-${a.type} d-flex align-items-center gap-2" role="alert">
            <i class="fa-solid ${a.icon}"></i>
            <span>${a.text}</span>
        </div>
    `).join("");

}


/* ==========================================================
   FILTER BAR (course / subject / month / semester)
========================================================== */

function populateFilterOptions(data) {

    const courseSelect = document.getElementById("filterCourse");
    const subjectSelect = document.getElementById("filterSubject");
    const monthSelect = document.getElementById("filterMonth");
    const semesterSelect = document.getElementById("filterSemester");

    if (courseSelect) {
        courseSelect.innerHTML = `<option value="all">All Courses</option><option value="${data.profile.course}">${data.profile.course}</option>`;
    }

    if (subjectSelect) {
        const options = (data.subjects || []).map(s => `<option value="${s.name}">${s.name}</option>`).join("");
        subjectSelect.innerHTML = `<option value="all">All Subjects</option>${options}`;
    }

    if (monthSelect) {
        const options = (data.attendance.monthly.labels || []).map(m => `<option value="${m}">${m}</option>`).join("");
        monthSelect.innerHTML = `<option value="all">All Months</option>${options}`;
    }

    if (semesterSelect) {
        const options = (data.results || []).map(r => `<option value="${r.semester}">${r.semester}</option>`).join("");
        semesterSelect.innerHTML = `<option value="all">All Semesters</option>${options}`;
    }

}

function bindFilterBar() {

    document.getElementById("applyFilterBtn")?.addEventListener("click", () => {

        const subject = document.getElementById("filterSubject")?.value || "all";

        // Applies the Subject filter to the assignment table's subject
        // search as a simple, workable cross-filter (no other student
        // data involved — this filters only this student's own records).
        const searchInput = document.getElementById("assignmentTableSearch");
        if (searchInput) {
            searchInput.value = subject === "all" ? "" : subject;
            renderAssignmentTable(getProgressData());
        }

        showToast("Filters applied.");

    });

}


/* ==========================================================
   GLOBAL SEARCH (top navbar)
========================================================== */

function bindGlobalSearch() {

    const input = document.getElementById("globalAssignmentSearch");
    if (!input) return;

    input.addEventListener("input", () => {

        const term = input.value.trim();
        const assignmentSearch = document.getElementById("assignmentTableSearch");

        if (assignmentSearch) {
            assignmentSearch.value = term;
            renderAssignmentTable(getProgressData());
        }

    });

}


/* ==========================================================
   EXPORT ACTIONS (dummy — no real backend)
========================================================== */

function bindExportButtons() {

    document.getElementById("printReportBtn")?.addEventListener("click", () => {
        window.print();
    });

    document.getElementById("exportCsvBtn")?.addEventListener("click", () => {
        exportAssignmentsCsv();
    });

    document.getElementById("exportPdfBtn")?.addEventListener("click", () => {
        showToast("Preparing your report — this is a demo export (no backend connected).");
    });

}

function exportAssignmentsCsv() {

    const data = getProgressData();
    const rows = [["Title", "Subject", "Due Date", "Submitted", "Marks", "Status"]];

    (data.assignments || []).forEach(a => {
        rows.push([a.title, a.subject, a.dueDate, a.submitted ? a.submittedDate : "--", a.marks, a.status]);
    });

    const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "my-progress-report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

}


/* ==========================================================
   TOAST HELPER
========================================================== */

function showToast(message) {

    const toast = document.getElementById("dashboardToast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);

}