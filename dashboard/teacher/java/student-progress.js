/*=========================================================
        STUDENT PROGRESS PAGE — EDUVERSE TEACHER DASHBOARD
        Vanilla ES6, LocalStorage-backed dummy data,
        Chart.js visuals. Does not touch any other file.
=========================================================*/

(() => {
  "use strict";

  /*=========================
        CONFIG / STATE
  =========================*/

  const STORAGE_KEY = "eduverse_student_progress_data_v1";
  const NOTES_KEY_PREFIX = "notes_";
  const MSG_KEY_PREFIX = "messages_";

  const chartInstances = {};

  const state = {
    currentStudentId: null,
    filters: { subject: "all", month: "all", semester: "all" }
  };

  /*=========================
        DUMMY SEED DATA
  =========================*/

  const seedStudents = () => ([
    {
      id: "EDV-1042",
      name: "Ali Khan",
      rollNo: "CS-21-042",
      guardian: "Muhammad Khan",
      email: "ali.khan@example.com",
      phone: "+92 300 1234567",
      course: "Web Development",
      batch: "Batch 2026-A",
      joinDate: "2025-08-14",
      status: "Active",
      avatar: "https://i.pravatar.cc/150?img=15",
      overall: {
        percentage: 84,
        gpa: "3.6",
        completedLectures: 46,
        pendingLectures: 6,
        assignmentsSubmitted: 11,
        assignmentsPending: 2,
        quizzesAttempted: 8,
        avgQuizScore: 78,
        attendancePercentage: 91,
        performanceStatus: "Excellent"
      },
      attendance: {
        total: 120, present: 109, absent: 7, leave: 4, percentage: 91,
        monthly: [
          { month: "Feb", percentage: 88 }, { month: "Mar", percentage: 90 },
          { month: "Apr", percentage: 85 }, { month: "May", percentage: 93 },
          { month: "Jun", percentage: 95 }, { month: "Jul", percentage: 91 }
        ]
      },
      assignments: [
        { title: "HTML Portfolio", subject: "HTML", due: "2026-06-10", submitted: "2026-06-09", marksObtained: 18, totalMarks: 20, status: "Submitted", remarks: "Clean structure, great effort." },
        { title: "CSS Landing Page", subject: "CSS", due: "2026-06-20", submitted: "2026-06-22", marksObtained: 15, totalMarks: 20, status: "Late", remarks: "Good design, submitted late." },
        { title: "DOM Manipulation Task", subject: "JavaScript", due: "2026-07-02", submitted: "2026-07-01", marksObtained: 19, totalMarks: 20, status: "Submitted", remarks: "Excellent logic." },
        { title: "React Todo App", subject: "React", due: "2026-07-15", submitted: "", marksObtained: 0, totalMarks: 20, status: "Pending", remarks: "Not submitted yet." },
        { title: "SQL Queries Sheet", subject: "Database", due: "2026-07-20", submitted: "", marksObtained: 0, totalMarks: 20, status: "Pending", remarks: "Due soon." }
      ],
      quizzes: [
        { name: "HTML Basics Quiz", date: "2026-06-05", score: 17, total: 20, result: "Pass", time: "12 min" },
        { name: "CSS Flexbox Quiz", date: "2026-06-18", score: 14, total: 20, result: "Pass", time: "15 min" },
        { name: "JavaScript Fundamentals", date: "2026-06-30", score: 16, total: 20, result: "Pass", time: "18 min" },
        { name: "React Basics Quiz", date: "2026-07-10", score: 9, total: 20, result: "Fail", time: "20 min" }
      ],
      subjects: [
        { name: "HTML", icon: "fa-solid fa-code", quizMarks: 85, assignmentMarks: 90, attendance: 92, overall: 89 },
        { name: "CSS", icon: "fa-brands fa-css3-alt", quizMarks: 70, assignmentMarks: 75, attendance: 88, overall: 78 },
        { name: "JavaScript", icon: "fa-brands fa-js", quizMarks: 80, assignmentMarks: 95, attendance: 93, overall: 89 },
        { name: "React", icon: "fa-brands fa-react", quizMarks: 45, assignmentMarks: 0, attendance: 85, overall: 43 },
        { name: "Database", icon: "fa-solid fa-database", quizMarks: 60, assignmentMarks: 0, attendance: 90, overall: 50 },
        { name: "Python", icon: "fa-brands fa-python", quizMarks: 88, assignmentMarks: 92, attendance: 95, overall: 92 }
      ],
      results: [
        { semester: "Semester 1", gpa: "3.4", percentage: 78, rank: 12, status: "Passed" },
        { semester: "Semester 2", gpa: "3.6", percentage: 82, rank: 8, status: "Passed" },
        { semester: "Semester 3", gpa: "3.6", percentage: 84, rank: 5, status: "Passed" }
      ],
      monthlyProgress: [
        { month: "Feb", percentage: 72 }, { month: "Mar", percentage: 76 },
        { month: "Apr", percentage: 79 }, { month: "May", percentage: 81 },
        { month: "Jun", percentage: 83 }, { month: "Jul", percentage: 84 }
      ],
      parent: { name: "Muhammad Khan", phone: "+92 301 9876543", email: "m.khan@example.com" },
      activities: [
        { icon: "fa-solid fa-video", color: "bg-primary", title: "Lecture Completed", desc: "JavaScript DOM Manipulation", time: "2 hours ago" },
        { icon: "fa-solid fa-file-circle-check", color: "bg-success", title: "Assignment Submitted", desc: "DOM Manipulation Task", time: "1 day ago" },
        { icon: "fa-solid fa-clipboard-question", color: "bg-warning", title: "Quiz Attempted", desc: "JavaScript Fundamentals — 16/20", time: "3 days ago" },
        { icon: "fa-solid fa-calendar-check", color: "bg-success", title: "Attendance Marked", desc: "Present in Web Development class", time: "3 days ago" },
        { icon: "fa-solid fa-award", color: "bg-danger", title: "Certificate Earned", desc: "HTML & CSS Fundamentals", time: "1 week ago" }
      ],
      achievements: [
        { icon: "fa-solid fa-medal", title: "Best Subject: Python", desc: "Highest overall score of 92%" },
        { icon: "fa-solid fa-trophy", title: "Highest Quiz Score", desc: "17/20 in HTML Basics Quiz" },
        { icon: "fa-solid fa-arrow-trend-up", title: "Most Improved", desc: "+12% overall since Semester 1" },
        { icon: "fa-solid fa-calendar-check", title: "Strong Attendance", desc: "91% attendance this term" }
      ],
      schedule: [
        { type: "Class", title: "React Development", date: "2026-08-07", time: "02:00 PM" },
        { type: "Assignment Deadline", title: "React Todo App", date: "2026-07-15", time: "11:59 PM" },
        { type: "Quiz", title: "Database Basics Quiz", date: "2026-08-09", time: "10:00 AM" },
        { type: "Exam", title: "Mid-Term Practical", date: "2026-08-18", time: "09:00 AM" }
      ]
    },
    {
      id: "EDV-1077",
      name: "Fatima Noor",
      rollNo: "CS-21-077",
      guardian: "Noor Hassan",
      email: "fatima.noor@example.com",
      phone: "+92 302 4455667",
      course: "JavaScript",
      batch: "Batch 2026-B",
      joinDate: "2025-09-02",
      status: "Active",
      avatar: "https://i.pravatar.cc/150?img=32",
      overall: {
        percentage: 68, gpa: "2.9", completedLectures: 30, pendingLectures: 14,
        assignmentsSubmitted: 7, assignmentsPending: 5, quizzesAttempted: 5,
        avgQuizScore: 62, attendancePercentage: 74, performanceStatus: "Average"
      },
      attendance: {
        total: 110, present: 81, absent: 19, leave: 10, percentage: 74,
        monthly: [
          { month: "Feb", percentage: 70 }, { month: "Mar", percentage: 72 },
          { month: "Apr", percentage: 68 }, { month: "May", percentage: 76 },
          { month: "Jun", percentage: 78 }, { month: "Jul", percentage: 74 }
        ]
      },
      assignments: [
        { title: "Bootstrap Project", subject: "CSS", due: "2026-06-12", submitted: "2026-06-14", marksObtained: 12, totalMarks: 20, status: "Late", remarks: "Needs cleaner layout." },
        { title: "JavaScript Quiz Prep", subject: "JavaScript", due: "2026-06-25", submitted: "2026-06-24", marksObtained: 16, totalMarks: 20, status: "Submitted", remarks: "Well done." },
        { title: "Python Basics Sheet", subject: "Python", due: "2026-07-05", submitted: "", marksObtained: 0, totalMarks: 20, status: "Pending", remarks: "Overdue." }
      ],
      quizzes: [
        { name: "CSS Flexbox Quiz", date: "2026-06-10", score: 11, total: 20, result: "Pass", time: "17 min" },
        { name: "JavaScript Fundamentals", date: "2026-06-28", score: 9, total: 20, result: "Fail", time: "19 min" }
      ],
      subjects: [
        { name: "HTML", icon: "fa-solid fa-code", quizMarks: 65, assignmentMarks: 70, attendance: 78, overall: 71 },
        { name: "CSS", icon: "fa-brands fa-css3-alt", quizMarks: 55, assignmentMarks: 60, attendance: 74, overall: 63 },
        { name: "JavaScript", icon: "fa-brands fa-js", quizMarks: 45, assignmentMarks: 80, attendance: 72, overall: 66 },
        { name: "React", icon: "fa-brands fa-react", quizMarks: 0, assignmentMarks: 0, attendance: 70, overall: 30 },
        { name: "Database", icon: "fa-solid fa-database", quizMarks: 50, assignmentMarks: 0, attendance: 76, overall: 45 },
        { name: "Python", icon: "fa-brands fa-python", quizMarks: 40, assignmentMarks: 0, attendance: 75, overall: 38 }
      ],
      results: [
        { semester: "Semester 1", gpa: "2.7", percentage: 62, rank: 34, status: "Passed" },
        { semester: "Semester 2", gpa: "2.9", percentage: 68, rank: 27, status: "Passed" }
      ],
      monthlyProgress: [
        { month: "Feb", percentage: 58 }, { month: "Mar", percentage: 60 },
        { month: "Apr", percentage: 63 }, { month: "May", percentage: 65 },
        { month: "Jun", percentage: 67 }, { month: "Jul", percentage: 68 }
      ],
      parent: { name: "Noor Hassan", phone: "+92 303 1122334", email: "noor.hassan@example.com" },
      activities: [
        { icon: "fa-solid fa-file-circle-check", color: "bg-success", title: "Assignment Submitted", desc: "JavaScript Quiz Prep", time: "5 hours ago" },
        { icon: "fa-solid fa-clipboard-question", color: "bg-danger", title: "Quiz Attempted", desc: "JavaScript Fundamentals — 9/20", time: "2 days ago" },
        { icon: "fa-solid fa-calendar-xmark", color: "bg-warning", title: "Attendance Marked", desc: "Absent from CSS class", time: "4 days ago" }
      ],
      achievements: [
        { icon: "fa-solid fa-arrow-trend-up", title: "Improvement Badge", desc: "+6% overall this term" }
      ],
      schedule: [
        { type: "Class", title: "JavaScript Fundamentals", date: "2026-08-07", time: "11:00 AM" },
        { type: "Assignment Deadline", title: "Python Basics Sheet", date: "2026-07-05", time: "11:59 PM" },
        { type: "Exam", title: "Mid-Term Practical", date: "2026-08-18", time: "09:00 AM" }
      ]
    }
  ]);

  /*=========================
        DATA HELPERS
  =========================*/

  const loadData = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Could not read student progress data, reseeding.", e);
    }
    const fresh = seedStudents();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  };

  const saveData = (students) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  };

  const getStudent = (students, id) => students.find(s => s.id === id) || students[0];

  const loadNotes = (studentId) => {
    try {
      return JSON.parse(localStorage.getItem(NOTES_KEY_PREFIX + studentId)) || [];
    } catch { return []; }
  };

  const saveNotes = (studentId, notes) => {
    localStorage.setItem(NOTES_KEY_PREFIX + studentId, JSON.stringify(notes));
  };

  const loadMessages = (studentId, defaults) => {
    try {
      const raw = localStorage.getItem(MSG_KEY_PREFIX + studentId);
      if (raw) return JSON.parse(raw);
    } catch { /* fall through */ }
    localStorage.setItem(MSG_KEY_PREFIX + studentId, JSON.stringify(defaults));
    return defaults;
  };

  const saveMessages = (studentId, messages) => {
    localStorage.setItem(MSG_KEY_PREFIX + studentId, JSON.stringify(messages));
  };

  /*=========================
        UTILITIES
  =========================*/

  const $ = (sel) => document.querySelector(sel);
  const $all = (sel) => document.querySelectorAll(sel);

  const statusBadgeClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "submitted" || s === "pass" || s === "passed" || s === "active") return "status-active";
    if (s === "late" || s === "pending") return "status-pending";
    if (s === "fail" || s === "failed" || s === "inactive" || s === "overdue") return "status-inactive";
    return "status-pending";
  };

  const performanceClass = (label) => {
    const map = { Excellent: "excellent", Good: "good", Average: "average", Poor: "poor" };
    return map[label] || "average";
  };

  const showToast = (message) => {
    const toast = $("#dashboardToast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 2600);
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "—";
    const d = new Date(isoDate);
    if (isNaN(d)) return isoDate;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  /*=========================
        RENDER: PROFILE
  =========================*/

  const renderProfile = (student) => {
    $("#studentAvatar").src = student.avatar;
    $("#studentName").textContent = student.name;
    $("#studentCourseBatch").textContent = `${student.course} • ${student.batch}`;
    const badge = $("#studentStatusBadge");
    badge.textContent = student.status;

    $("#infoStudentId").textContent = student.id;
    $("#infoRollNo").textContent = student.rollNo;
    $("#infoGuardian").textContent = student.guardian;
    $("#infoEmail").textContent = student.email;
    $("#infoPhone").textContent = student.phone;
    $("#infoJoinDate").textContent = formatDate(student.joinDate);
  };

  /*=========================
        RENDER: OVERALL STATS
  =========================*/

  const renderOverallStats = (student) => {
    const o = student.overall;
    const cards = [
      { icon: "fa-solid fa-chart-pie", cls: "progress-purple", value: `${o.percentage}%`, label: "Overall Percentage" },
      { icon: "fa-solid fa-graduation-cap", cls: "progress-blue", value: o.gpa, label: "GPA / Grade" },
      { icon: "fa-solid fa-circle-check", cls: "progress-green", value: `${o.completedLectures}`, label: "Lectures Completed" },
      { icon: "fa-solid fa-hourglass-half", cls: "progress-orange", value: `${o.pendingLectures}`, label: "Lectures Pending" },
      { icon: "fa-solid fa-file-circle-check", cls: "progress-green", value: `${o.assignmentsSubmitted}`, label: "Assignments Submitted" },
      { icon: "fa-solid fa-file-circle-exclamation", cls: "progress-orange", value: `${o.assignmentsPending}`, label: "Assignments Pending" },
      { icon: "fa-solid fa-clipboard-question", cls: "progress-blue", value: `${o.quizzesAttempted}`, label: "Quizzes Attempted" },
      { icon: "fa-solid fa-percent", cls: "progress-purple", value: `${o.avgQuizScore}%`, label: "Average Quiz Score" },
      { icon: "fa-solid fa-calendar-check", cls: "progress-green", value: `${o.attendancePercentage}%`, label: "Attendance" }
    ];

    $("#overallStatsGrid").innerHTML = cards.map(c => `
      <div class="col-xl-4 col-md-6">
        <div class="progress-card">
          <div class="progress-icon ${c.cls}"><i class="${c.icon}"></i></div>
          <h5>${c.value}</h5>
          <p>${c.label}</p>
        </div>
      </div>
    `).join("") + `
      <div class="col-xl-4 col-md-6">
        <div class="progress-card">
          <div class="progress-icon progress-purple"><i class="fa-solid fa-star"></i></div>
          <h5 class="${performanceClass(o.performanceStatus)}">${o.performanceStatus}</h5>
          <p>Overall Performance</p>
        </div>
      </div>
    `;
  };

  /*=========================
        RENDER: ATTENDANCE
  =========================*/

  const renderAttendance = (student) => {
    const a = student.attendance;

    $("#attendanceStatsGrid").innerHTML = `
      <div class="col-6"><div class="score-box w-100 text-center">Total<br><strong>${a.total}</strong></div></div>
      <div class="col-6"><div class="score-box w-100 text-center">Present<br><strong>${a.present}</strong></div></div>
      <div class="col-6"><div class="score-box w-100 text-center">Absent<br><strong>${a.absent}</strong></div></div>
      <div class="col-6"><div class="score-box w-100 text-center">Leave<br><strong>${a.leave}</strong></div></div>
    `;

    $("#attendancePercentLabel").textContent = `${a.percentage}%`;
    const bar = $("#attendanceProgressBar");
    bar.style.width = "0%";
    requestAnimationFrame(() => { bar.style.width = `${a.percentage}%`; });

    renderChart("attendanceChart", "line", {
      labels: a.monthly.map(m => m.month),
      datasets: [{
        label: "Attendance %",
        data: a.monthly.map(m => m.percentage),
        borderColor: "#6C63FF",
        backgroundColor: "rgba(108,99,255,.15)",
        tension: 0.35,
        fill: true
      }]
    });
  };

  /*=========================
        RENDER: ASSIGNMENTS
  =========================*/

  const monthFromDate = (isoDate) => {
    if (!isoDate) return null;
    const d = new Date(isoDate);
    if (isNaN(d)) return null;
    return d.toLocaleDateString(undefined, { month: "short" });
  };

  const applyCommonFilters = (items, subjectField, dateField) => {
    return items.filter(item => {
      const subjectOk = state.filters.subject === "all" || item[subjectField] === state.filters.subject;
      const itemMonth = monthFromDate(item[dateField]);
      const monthOk = state.filters.month === "all" || itemMonth === state.filters.month;
      return subjectOk && monthOk;
    });
  };

  const renderAssignments = (student) => {
    const rows = applyCommonFilters(student.assignments, "subject", "due");
    const tbody = $("#assignmentsTable tbody");

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No assignments match the current filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map(a => `
      <tr>
        <td>${a.title}</td>
        <td>${a.subject}</td>
        <td>${formatDate(a.due)}</td>
        <td>${a.submitted ? formatDate(a.submitted) : "—"}</td>
        <td>${a.status === "Pending" ? "—" : `${a.marksObtained}/${a.totalMarks}`}</td>
        <td><span class="${statusBadgeClass(a.status)}">${a.status}</span></td>
        <td>${a.remarks}</td>
      </tr>
    `).join("");
  };

  /*=========================
        RENDER: QUIZZES
  =========================*/

  const renderQuizzes = (student) => {
    const rows = applyCommonFilters(student.quizzes, null, "date")
      .filter(q => state.filters.subject === "all" || q.name.toLowerCase().includes(state.filters.subject.toLowerCase()));
    const tbody = $("#quizzesTable tbody");

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No quizzes match the current filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map(q => {
      const pct = Math.round((q.score / q.total) * 100);
      return `
      <tr>
        <td>${q.name}</td>
        <td>${formatDate(q.date)}</td>
        <td>${q.score}/${q.total}</td>
        <td>${pct}%</td>
        <td><span class="${statusBadgeClass(q.result)}">${q.result}</span></td>
        <td>${q.time}</td>
      </tr>
    `;
    }).join("");
  };

  /*=========================
        RENDER: SUBJECTS
  =========================*/

  const renderSubjects = (student) => {
    const subjects = state.filters.subject === "all"
      ? student.subjects
      : student.subjects.filter(s => s.name === state.filters.subject);

    $("#subjectsGrid").innerHTML = subjects.map(s => `
      <div class="col-xl-2 col-lg-3 col-md-4 col-6">
        <div class="subject-card">
          <i class="${s.icon} fa-2x" style="color:var(--primary);"></i>
          <h4>${s.name}</h4>
          <span>Quiz: ${s.quizMarks}% • Assign: ${s.assignmentMarks}%</span>
          <div class="progress mt-3">
            <div class="progress-bar bg-primary" style="width:${s.overall}%;"></div>
          </div>
          <span class="d-block mt-2 fw-bold">${s.overall}% Overall</span>
        </div>
      </div>
    `).join("");
  };

  /*=========================
        RENDER: RESULTS
  =========================*/

  const renderResults = (student) => {
    const rows = state.filters.semester === "all"
      ? student.results
      : student.results.filter(r => r.semester === state.filters.semester);
    const tbody = $("#resultsTable tbody");

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No results for the selected semester.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.semester}</td>
        <td>${r.gpa}</td>
        <td>${r.percentage}%</td>
        <td>#${r.rank}</td>
        <td><span class="${statusBadgeClass(r.status)}">${r.status}</span></td>
      </tr>
    `).join("");
  };

  /*=========================
        RENDER: CHARTS
  =========================*/

  const renderChart = (canvasId, type, data, extraOptions = {}) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === "undefined") return;

    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

    chartInstances[canvasId] = new Chart(canvas.getContext("2d"), {
      type,
      data,
      options: Object.assign({
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: type !== "bar" } }
      }, extraOptions)
    });
  };

  const renderAnalyticsCharts = (student) => {
    renderChart("monthlyProgressChart", "line", {
      labels: student.monthlyProgress.map(m => m.month),
      datasets: [{
        label: "Overall %",
        data: student.monthlyProgress.map(m => m.percentage),
        borderColor: "#16a34a",
        backgroundColor: "rgba(22,163,74,.15)",
        tension: 0.35,
        fill: true
      }]
    });

    renderChart("subjectPerformanceChart", "bar", {
      labels: student.subjects.map(s => s.name),
      datasets: [{
        label: "Overall %",
        data: student.subjects.map(s => s.overall),
        backgroundColor: "#6C63FF",
        borderRadius: 8
      }]
    });

    renderChart("quizPerformanceChart", "bar", {
      labels: student.quizzes.map(q => q.name),
      datasets: [{
        label: "Score %",
        data: student.quizzes.map(q => Math.round((q.score / q.total) * 100)),
        backgroundColor: "#f59e0b",
        borderRadius: 8
      }]
    });

    renderChart("assignmentPerformanceChart", "bar", {
      labels: student.assignments.map(a => a.title),
      datasets: [{
        label: "Marks %",
        data: student.assignments.map(a => a.status === "Pending" ? 0 : Math.round((a.marksObtained / a.totalMarks) * 100)),
        backgroundColor: "#2563eb",
        borderRadius: 8
      }]
    });
  };

  /*=========================
        RENDER: TEACHER NOTES
  =========================*/

  const renderNotes = (studentId) => {
    const notes = loadNotes(studentId);
    const list = $("#teacherNotesList");

    if (!notes.length) {
      list.innerHTML = `<p class="text-muted">No notes yet. Add the first remark above.</p>`;
      return;
    }

    list.innerHTML = notes.slice().reverse().map(n => `
      <div class="performance-item">
        <div>
          <h6>${n.text}</h6>
          <small>${n.date}</small>
        </div>
      </div>
    `).join("");
  };

  /*=========================
        RENDER: CONTACT / CHAT
  =========================*/

  const defaultMessages = (student) => ([
    { from: "student", text: `Hello! This is ${student.name.split(" ")[0]}.`, time: "Yesterday" },
    { from: "teacher", text: "Hi! Just checking in on your React assignment progress.", time: "Yesterday" }
  ]);

  const quickReplies = [
    "Please submit your pending assignment.",
    "Great work on the last quiz!",
    "Your attendance needs improvement.",
    "Let's schedule a quick call."
  ];

  const renderChat = (student) => {
    $("#chatUserAvatar").src = student.avatar;
    $("#chatUserName").textContent = student.name;

    $("#parentName").textContent = student.parent.name;
    $("#parentPhone").textContent = student.parent.phone;
    $("#parentEmail").textContent = student.parent.email;

    const messages = loadMessages(student.id, defaultMessages(student));
    const body = $("#chatBody");
    body.innerHTML = messages.map(m => `
      <div class="message ${m.from === "teacher" ? "sent" : "received"}">
        <div class="message-text">
          ${m.text}
          <span class="message-time">${m.time}</span>
        </div>
      </div>
    `).join("");
    body.scrollTop = body.scrollHeight;

    $("#quickReplyRow").innerHTML = quickReplies.map(q => `
      <button type="button" class="btn btn-outline-primary btn-sm quick-reply-btn">${q}</button>
    `).join("");
  };

  const sendMessage = (text) => {
    if (!text || !text.trim()) return;
    const students = loadData();
    const student = getStudent(students, state.currentStudentId);
    const messages = loadMessages(student.id, defaultMessages(student));

    messages.push({ from: "teacher", text: text.trim(), time: "Just now" });
    saveMessages(student.id, messages);
    renderChat(student);
    showToast("Message sent");

    // Dummy auto-reply for demo purposes.
    setTimeout(() => {
      const refreshed = loadMessages(student.id, messages);
      refreshed.push({ from: "student", text: "Got it, thank you!", time: "Just now" });
      saveMessages(student.id, refreshed);
      if (state.currentStudentId === student.id) renderChat(student);
    }, 900);
  };

  /*=========================
        RENDER: ACTIVITY TIMELINE
  =========================*/

  const renderActivityTimeline = (student) => {
    $("#activityTimeline").innerHTML = student.activities.map(a => `
      <div class="activity-item">
        <div class="activity-icon ${a.color}"><i class="${a.icon}"></i></div>
        <div>
          <h6>${a.title}</h6>
          <small>${a.desc}</small>
          <p>${a.time}</p>
        </div>
      </div>
    `).join("");
  };

  /*=========================
        RENDER: ACHIEVEMENTS
  =========================*/

  const renderAchievements = (student) => {
    if (!student.achievements.length) {
      $("#achievementsList").innerHTML = `<p class="text-muted">No achievements recorded yet.</p>`;
      return;
    }

    $("#achievementsList").innerHTML = student.achievements.map(a => `
      <div class="achievement-card performance-badge">
        <i class="${a.icon}"></i>
        <div>
          <h5>${a.title}</h5>
          <p>${a.desc}</p>
        </div>
      </div>
    `).join("");
  };

  /*=========================
        RENDER: RECOMMENDATIONS
  =========================*/

  const buildRecommendations = (student) => {
    const recs = [];
    const weakSubjects = student.subjects.filter(s => s.overall < 60);

    if (weakSubjects.length) {
      recs.push(`Focus on ${weakSubjects.map(s => s.name).join(", ")} — currently below 60% overall.`);
    }
    const pendingAssignments = student.assignments.filter(a => a.status === "Pending");
    if (pendingAssignments.length) {
      recs.push(`${pendingAssignments.length} assignment(s) still pending: ${pendingAssignments.map(a => a.title).join(", ")}.`);
    }
    if (student.overall.attendancePercentage < 80) {
      recs.push("Attendance is below 80% — recommend catching up on missed lectures.");
    }
    const upcomingQuiz = student.schedule.find(s => s.type === "Quiz");
    if (upcomingQuiz) {
      recs.push(`Upcoming quiz: ${upcomingQuiz.title} on ${formatDate(upcomingQuiz.date)}.`);
    }
    if (!recs.length) {
      recs.push("Performance is on track — no urgent action needed right now.");
    }
    return recs;
  };

  const renderRecommendations = (student) => {
    const recs = buildRecommendations(student);
    $("#recommendationsList").innerHTML = recs.map(r => `
      <div class="performance-item">
        <div><h6><i class="fa-solid fa-lightbulb text-warning me-2"></i>${r}</h6></div>
      </div>
    `).join("");
  };

  /*=========================
        RENDER: SCHEDULE
  =========================*/

  const renderSchedule = (student) => {
    $("#scheduleList").innerHTML = student.schedule.map(s => `
      <div class="class-item">
        <div>
          <h6>${s.title}</h6>
          <small>${s.type} • ${formatDate(s.date)} at ${s.time}</small>
        </div>
        <span class="status-pending">${s.type}</span>
      </div>
    `).join("");
  };

  /*=========================
        RENDER: ALERTS
  =========================*/

  const buildAlerts = (student) => {
    const alerts = [];
    if (student.overall.attendancePercentage < 80) {
      alerts.push({ type: "warning", text: `Low attendance warning: ${student.name} is at ${student.overall.attendancePercentage}%.` });
    }
    const overdue = student.assignments.filter(a => a.status === "Pending" && new Date(a.due) < new Date("2026-08-06"));
    if (overdue.length) {
      alerts.push({ type: "danger", text: `${overdue.length} assignment(s) overdue.` });
    }
    const failedQuiz = student.quizzes.find(q => q.result === "Fail");
    if (failedQuiz) {
      alerts.push({ type: "danger", text: `Poor quiz performance in "${failedQuiz.name}".` });
    }
    if (student.overall.percentage >= 80) {
      alerts.push({ type: "success", text: `Excellent overall performance at ${student.overall.percentage}%!` });
    }
    return alerts;
  };

  const renderAlerts = (student) => {
    const alerts = buildAlerts(student);
    $("#alertsSection").innerHTML = alerts.map(a => `
      <div class="alert alert-${a.type} mb-2">${a.text}</div>
    `).join("");
  };

  /*=========================
        FILTER OPTIONS
  =========================*/

  const populateFilterOptions = (students) => {
    const studentSelect = $("#filterStudent");
    studentSelect.innerHTML = students.map(s => `<option value="${s.id}">${s.name}</option>`).join("");

    const courses = [...new Set(students.map(s => s.course))];
    $("#filterCourse").innerHTML = `<option value="all">All Courses</option>` +
      courses.map(c => `<option value="${c}">${c}</option>`).join("");

    const allSubjects = [...new Set(students.flatMap(s => s.subjects.map(sub => sub.name)))];
    $("#filterSubject").innerHTML = `<option value="all">All Subjects</option>` +
      allSubjects.map(s => `<option value="${s}">${s}</option>`).join("");

    const months = [...new Set(students.flatMap(s => s.attendance.monthly.map(m => m.month)))];
    $("#filterMonth").innerHTML = `<option value="all">All Months</option>` +
      months.map(m => `<option value="${m}">${m}</option>`).join("");

    const semesters = [...new Set(students.flatMap(s => s.results.map(r => r.semester)))];
    $("#filterSemester").innerHTML = `<option value="all">All Semesters</option>` +
      semesters.map(s => `<option value="${s}">${s}</option>`).join("");
  };

  /*=========================
        MASTER RENDER
  =========================*/

  const renderAll = () => {
    const students = loadData();
    const student = getStudent(students, state.currentStudentId);
    state.currentStudentId = student.id;

    $("#filterStudent").value = student.id;

    renderAlerts(student);
    renderProfile(student);
    renderOverallStats(student);
    renderAttendance(student);
    renderAssignments(student);
    renderQuizzes(student);
    renderSubjects(student);
    renderResults(student);
    renderAnalyticsCharts(student);
    renderNotes(student.id);
    renderChat(student);
    renderActivityTimeline(student);
    renderAchievements(student);
    renderRecommendations(student);
    renderSchedule(student);
  };

  /*=========================
        SIDEBAR TOGGLE
        (self-contained — does not
        depend on dashboard.js)
  =========================*/

  const bindSidebarToggle = () => {
    const toggleBtn = $(".menu-toggle");
    const sidebar = $(".sidebar");
    if (!toggleBtn || !sidebar) return;

    // Guard against double-binding if this script runs more than once.
    if (toggleBtn.dataset.spToggleBound === "true") return;
    toggleBtn.dataset.spToggleBound = "true";

    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.toggle("active");
    });

    // Close the sidebar when tapping outside it on small screens.
    document.addEventListener("click", (e) => {
      if (window.innerWidth > 992) return;
      if (!sidebar.classList.contains("active")) return;
      if (sidebar.contains(e.target) || e.target === toggleBtn || toggleBtn.contains(e.target)) return;
      sidebar.classList.remove("active");
    });

    // Close the sidebar automatically after choosing a menu link on mobile.
    $all(".sidebar-menu a").forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 992) sidebar.classList.remove("active");
      });
    });

    // Reset state cleanly when resizing back to desktop.
    window.addEventListener("resize", () => {
      if (window.innerWidth > 992) sidebar.classList.remove("active");
    });
  };

  /*=========================
        EVENT BINDINGS
  =========================*/

  const bindEvents = () => {

    bindSidebarToggle();

    $("#filterStudent").addEventListener("change", (e) => {
      state.currentStudentId = e.target.value;
      renderAll();
    });

    $("#applyFilterBtn").addEventListener("click", () => {
      state.filters.subject = $("#filterSubject").value;
      state.filters.month = $("#filterMonth").value;
      state.filters.semester = $("#filterSemester").value;

      const students = loadData();
      const student = getStudent(students, state.currentStudentId);
      renderAssignments(student);
      renderQuizzes(student);
      renderSubjects(student);
      renderResults(student);
      showToast("Filters applied");
    });

    $("#globalStudentSearch").addEventListener("input", (e) => {
      const term = e.target.value.trim().toLowerCase();
      if (!term) return;
      const students = loadData();
      const match = students.find(s =>
        s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term)
      );
      if (match) {
        state.currentStudentId = match.id;
        renderAll();
      }
    });

    $("#addNoteBtn").addEventListener("click", () => {
      const input = $("#teacherNoteInput");
      const text = input.value.trim();
      if (!text) {
        showToast("Please write a note first");
        return;
      }
      const notes = loadNotes(state.currentStudentId);
      notes.push({ text, date: new Date().toLocaleString() });
      saveNotes(state.currentStudentId, notes);
      input.value = "";
      renderNotes(state.currentStudentId);
      showToast("Note added");
    });

    $("#sendMessageBtn").addEventListener("click", () => {
      const input = $("#chatMessageInput");
      sendMessage(input.value);
      input.value = "";
    });

    $("#chatMessageInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        sendMessage(e.target.value);
        e.target.value = "";
      }
    });

    $("#quickReplyRow").addEventListener("click", (e) => {
      const btn = e.target.closest(".quick-reply-btn");
      if (!btn) return;
      sendMessage(btn.textContent);
    });

    $("#emailStudentBtn").addEventListener("click", () => {
      const students = loadData();
      const student = getStudent(students, state.currentStudentId);
      window.location.href = `mailto:${student.email}`;
      showToast(`Opening email to ${student.name}`);
    });

    $("#callStudentBtn").addEventListener("click", () => {
      const students = loadData();
      const student = getStudent(students, state.currentStudentId);
      showToast(`Dummy call started with ${student.name} (${student.phone})`);
    });

    $("#printReportBtn").addEventListener("click", () => window.print());

    $("#exportCsvBtn").addEventListener("click", exportAssignmentsCsv);

    $("#exportPdfBtn").addEventListener("click", () => {
      showToast("Generating PDF report... (demo only)");
    });
  };

  /*=========================
        CSV EXPORT
  =========================*/

  const exportAssignmentsCsv = () => {
    const students = loadData();
    const student = getStudent(students, state.currentStudentId);

    const header = ["Title", "Subject", "Due Date", "Submitted", "Marks Obtained", "Total Marks", "Status", "Remarks"];
    const rows = student.assignments.map(a => [
      a.title, a.subject, a.due, a.submitted || "", a.marksObtained, a.totalMarks, a.status, a.remarks
    ]);

    const csvContent = [header, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${student.name.replace(/\s+/g, "_")}_progress_report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("CSV export downloaded");
  };

  /*=========================
        INIT
  =========================*/

  const init = () => {
    const students = loadData();
    state.currentStudentId = students[0].id;
    populateFilterOptions(students);
    bindEvents();
    renderAll();
  };

  document.addEventListener("DOMContentLoaded", init);

})();