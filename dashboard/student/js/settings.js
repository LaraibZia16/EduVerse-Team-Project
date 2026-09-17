/* ==========================================================
   EduVerse Student Dashboard — Settings
   Vanilla JS, LocalStorage powered (no backend/API)
   ========================================================== */

(function () {
  "use strict";

  const SETTINGS_KEY = "eduverse_student_settings";
  const SESSIONS_KEY = "eduverse_student_sessions";
  const CONNECT_KEY = "eduverse_student_connections";

  const DEFAULT_SETTINGS = {
    theme: "light",
    fontSize: "medium",
    twoFactor: true,
    rememberDevice: true,
    notifTeacherMessages: true,
    notifAssignmentReminders: true,
    notifQuizReminders: true,
    notifWeeklyReport: false,
    notifEmail: true,
    notifBrowser: true,
    notifSms: false,
    notifGrades: true,
    collapseSidebar: true,
    animations: true,
    compactLayout: false,
    language: "English",
    timezone: "(GMT +5) Pakistan",
    dateFormat: "DD-MMM-YYYY",
    currency: "PKR",
    autoplayLecture: true,
    showProgressBar: true,
    courseRecommendations: true,
    offlineDownload: false,
    courseView: "Grid View",
    difficulty: "Intermediate",
    reminderDays: 2,
    focusTimer: 30,
    autoSaveDraft: true,
    instantScore: true,
    focusMode: false,
    quizReminderPush: true,
    allowChat: true,
    allowFileShare: true,
    allowVoiceMsg: false,
    readReceipts: true,
    reduceMotion: false,
    highContrast: false,
    screenReader: false,
    keyboardShortcuts: true,
    showProfile: true,
    allowDirectMessage: true,
    displayEmail: false,
    promoEmails: true
  };

  const DEFAULT_SESSIONS = [
    { id: "s1", device: "Windows 11 - Chrome", location: "Karachi, Pakistan", date: "Today - 10:30 AM", status: "current" },
    { id: "s2", device: "Android Mobile", location: "Karachi", date: "Yesterday", status: "loggedout" },
    { id: "s3", device: "MacBook Air", location: "Lahore", date: "3 Days Ago", status: "unknown" }
  ];

  const DEFAULT_CONNECTIONS = {
    google: true,
    github: true,
    microsoft: false
  };

  let settings = loadSettings();
  let sessions = loadSessions();
  let connections = loadConnections();

  /* -------------------- Storage helpers -------------------- */
  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(raw));
    } catch (e) { /* fall through */ }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return Object.assign({}, DEFAULT_SETTINGS);
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function loadSessions() {
    try {
      const raw = localStorage.getItem(SESSIONS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fall through */ }
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(DEFAULT_SESSIONS));
    return DEFAULT_SESSIONS.slice();
  }

  function saveSessions() {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }

  function loadConnections() {
    try {
      const raw = localStorage.getItem(CONNECT_KEY);
      if (raw) return Object.assign({}, DEFAULT_CONNECTIONS, JSON.parse(raw));
    } catch (e) { /* fall through */ }
    localStorage.setItem(CONNECT_KEY, JSON.stringify(DEFAULT_CONNECTIONS));
    return Object.assign({}, DEFAULT_CONNECTIONS);
  }

  function saveConnections() {
    localStorage.setItem(CONNECT_KEY, JSON.stringify(connections));
  }

  /* -------------------- Toast -------------------- */
  function showToast(message) {
    const toastEl = document.getElementById("settingsToast");
    document.getElementById("settingsToastBody").textContent = message;
    const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
    toast.show();
  }

  /* -------------------- Apply theme / font size -------------------- */
  function applyTheme(theme) {
    const body = document.body;
    body.classList.remove("eduverse-dark-preview");

    if (theme === "dark") {
      body.classList.add("eduverse-dark-preview");
    } else if (theme === "system") {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) body.classList.add("eduverse-dark-preview");
    }
  }

  function applyFontSize(size) {
    document.body.classList.remove("eduverse-fontsize-small", "eduverse-fontsize-medium", "eduverse-fontsize-large");
    document.body.classList.add("eduverse-fontsize-" + size);
  }

  /* -------------------- Populate form from settings -------------------- */
  function populateForm() {
    document.querySelectorAll(".setting-toggle").forEach(input => {
      const key = input.dataset.setting;
      if (key in settings) input.checked = !!settings[key];
    });

    document.querySelectorAll(".setting-select").forEach(select => {
      const key = select.dataset.setting;
      if (key in settings) {
        const val = settings[key];
        const match = Array.from(select.options).find(o => o.value === val || o.textContent.trim() === val);
        if (match) select.value = match.value;
      }
    });

    document.querySelectorAll(".setting-input").forEach(input => {
      const key = input.dataset.setting;
      if (key in settings) input.value = settings[key];
    });

    document.getElementById("themeSelect").value = settings.theme;
    document.getElementById("fontSizeSelect").value = settings.fontSize;

    applyTheme(settings.theme);
    applyFontSize(settings.fontSize);
  }

  /* -------------------- Collect form into settings -------------------- */
  function collectForm() {
    document.querySelectorAll(".setting-toggle").forEach(input => {
      settings[input.dataset.setting] = input.checked;
    });

    document.querySelectorAll(".setting-select").forEach(select => {
      settings[select.dataset.setting] = select.value;
    });

    document.querySelectorAll(".setting-input").forEach(input => {
      const num = parseFloat(input.value);
      settings[input.dataset.setting] = isNaN(num) ? input.value : num;
    });

    settings.theme = document.getElementById("themeSelect").value;
    settings.fontSize = document.getElementById("fontSizeSelect").value;
  }

  function saveAll() {
    collectForm();
    saveSettings();
    applyTheme(settings.theme);
    applyFontSize(settings.fontSize);
    showToast("All settings saved successfully.");
  }

  function resetAll() {
    settings = Object.assign({}, DEFAULT_SETTINGS);
    saveSettings();
    populateForm();
    showToast("Settings reset to default.");
  }

  /* -------------------- Live theme/font preview -------------------- */
  function initLivePreview() {
    document.getElementById("themeSelect").addEventListener("change", e => applyTheme(e.target.value));
    document.getElementById("fontSizeSelect").addEventListener("change", e => applyFontSize(e.target.value));
  }

  /* -------------------- Profile -------------------- */
  function updateProfile() {
    const name = document.getElementById("fullNameInput").value.trim();
    const email = document.getElementById("emailInput").value.trim();
    const phone = document.getElementById("phoneInput").value.trim();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name || !emailValid) {
      showToast("Please enter a valid name and email.");
      return;
    }

    localStorage.setItem("eduverse_student_profile", JSON.stringify({ name, email, phone }));

    const msg = document.getElementById("profileSavedMsg");
    msg.classList.remove("d-none");
    setTimeout(() => msg.classList.add("d-none"), 2500);
    showToast("Profile updated successfully.");
  }

  /* -------------------- Password -------------------- */
  function changePassword() {
    const current = document.getElementById("currentPassword").value;
    const next = document.getElementById("newPassword").value;
    const confirm = document.getElementById("confirmPassword").value;
    const errorEl = document.getElementById("passwordError");

    if (!current || next.length < 6 || next !== confirm) {
      errorEl.classList.remove("d-none");
      return;
    }
    errorEl.classList.add("d-none");
    document.getElementById("passwordForm").reset();
    showToast("Password changed successfully.");
  }

  /* -------------------- Login sessions -------------------- */
  function renderSessions() {
    const tbody = document.getElementById("loginActivityBody");
    tbody.innerHTML = sessions.map(s => {
      let badge;
      let actionBtn = "";
      if (s.status === "current") {
        badge = '<span class="badge bg-success">Current Session</span>';
      } else if (s.status === "loggedout") {
        badge = '<span class="badge bg-secondary">Logged Out</span>';
        actionBtn = `<button class="btn btn-sm btn-outline-danger remove-session-btn" data-id="${s.id}">Remove</button>`;
      } else {
        badge = '<span class="badge bg-warning text-dark">Unknown</span>';
        actionBtn = `<button class="btn btn-sm btn-outline-danger remove-session-btn" data-id="${s.id}">Remove</button>`;
      }

      return `
        <tr>
          <td>${escapeHtml(s.device)}</td>
          <td>${escapeHtml(s.location)}</td>
          <td>${escapeHtml(s.date)}</td>
          <td>${badge}</td>
          <td>${actionBtn}</td>
        </tr>`;
    }).join("");

    tbody.querySelectorAll(".remove-session-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        sessions = sessions.filter(s => s.id !== btn.dataset.id);
        saveSessions();
        renderSessions();
        showToast("Session removed.");
      });
    });
  }

  function logoutAllDevices() {
    sessions = sessions.filter(s => s.status === "current");
    saveSessions();
    renderSessions();
    showToast("Logged out from all other devices.");
  }

  /* -------------------- Delete account -------------------- */
  function initDeleteAccount() {
    const confirmInput = document.getElementById("deleteConfirmInput");
    const confirmBtn = document.getElementById("confirmDeleteBtn");

    confirmInput.addEventListener("input", () => {
      confirmBtn.disabled = confirmInput.value.trim().toUpperCase() !== "DELETE";
    });

    confirmBtn.addEventListener("click", () => {
      [SETTINGS_KEY, SESSIONS_KEY, CONNECT_KEY, "eduverse_student_profile",
       "eduverse_student_assignments", "eduverse_student_activity", "eduverse_ai_quiz_attempts"]
        .forEach(key => localStorage.removeItem(key));

      const modalEl = document.getElementById("deleteAccountModal");
      bootstrap.Modal.getInstance(modalEl).hide();
      showToast("Account data deleted from this device.");
    });
  }

  /* -------------------- Connected accounts -------------------- */
  function renderConnections() {
    const rows = { google: "googleConnectRow", github: "githubConnectRow", microsoft: "microsoftConnectRow" };
    Object.keys(rows).forEach(key => {
      const row = document.getElementById(rows[key]);
      const statusEl = row.querySelector(".connect-status");
      const btn = row.querySelector(".connect-toggle-btn");
      const isConnected = connections[key];

      statusEl.textContent = isConnected ? "Connected" : "Not Connected";
      btn.textContent = isConnected ? "Disconnect" : "Connect";
      btn.className = "btn btn-sm connect-toggle-btn " + (isConnected ? "btn-outline-danger" : "btn-primary");
    });
  }

  function initConnections() {
    document.querySelectorAll(".connect-toggle-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const row = btn.closest(".setting-row");
        const key = row.id.replace("ConnectRow", "");
        connections[key] = !connections[key];
        saveConnections();
        renderConnections();
        showToast(connections[key] ? "Account connected." : "Account disconnected.");
      });
    });
  }

  /* -------------------- Exports (real Blob downloads) -------------------- */
  function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportGrades() {
    let assignments = [];
    try {
      assignments = JSON.parse(localStorage.getItem("eduverse_student_assignments") || "[]");
    } catch (e) { assignments = []; }

    let csv = "Assignment,Course,Status,Marks\n";
    assignments.forEach(a => {
      const marks = a.status === "graded" ? `${a.obtainedMarks}/${a.totalMarks}` : "-";
      csv += `"${a.title}","${a.course}","${a.status}","${marks}"\n`;
    });

    downloadTextFile("my-grades.csv", csv);
    showToast("Grades exported.");
  }

  function exportSubmissions() {
    let assignments = [];
    try {
      assignments = JSON.parse(localStorage.getItem("eduverse_student_assignments") || "[]");
    } catch (e) { assignments = []; }

    const submitted = assignments.filter(a => a.status === "submitted" || a.status === "graded");
    let csv = "Assignment,Course,Submitted Date,Status\n";
    submitted.forEach(a => {
      csv += `"${a.title}","${a.course}","${a.submittedDate || "-"}","${a.status}"\n`;
    });

    downloadTextFile("my-submissions.csv", csv);
    showToast("Submissions exported.");
  }

  function downloadProgressReport() {
    const name = document.getElementById("fullNameInput").value.trim() || "Student";
    const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    const report = `EduVerse Student Progress Report
Generated: ${date}
Student: ${name}

This is a summary export of your EduVerse activity, generated
locally from your dashboard data.
`;
    downloadTextFile("progress-report.txt", report);
    showToast("Progress report downloaded.");
  }

  function downloadCertificates() {
    const name = document.getElementById("fullNameInput").value.trim() || "Student";
    const cert = `EduVerse Certificate of Completion

This certifies that ${name} has engaged with courses on the
EduVerse platform.

(Sample export — connect a backend to issue verified certificates.)
`;
    downloadTextFile("certificates.txt", cert);
    showToast("Certificates downloaded.");
  }

  /* -------------------- Misc actions -------------------- */
  function clearChatHistory() {
    localStorage.removeItem("eduverse_student_chat_history");
    showToast("Chat history cleared.");
  }

  /* -------------------- Utilities -------------------- */
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  /* -------------------- Init -------------------- */
  function init() {
    populateForm();
    renderSessions();
    renderConnections();
    initLivePreview();
    initConnections();
    initDeleteAccount();

    document.getElementById("saveAllBtn").addEventListener("click", saveAll);
    document.getElementById("saveAllTopBtn").addEventListener("click", saveAll);
    document.getElementById("resetSettingsBtn").addEventListener("click", resetAll);

    document.getElementById("updateProfileBtn").addEventListener("click", updateProfile);
    document.getElementById("changePasswordBtn").addEventListener("click", changePassword);

    document.getElementById("logoutAllBtn").addEventListener("click", logoutAllDevices);
    document.getElementById("clearChatHistoryBtn").addEventListener("click", clearChatHistory);

    document.getElementById("exportGradesBtn").addEventListener("click", exportGrades);
    document.getElementById("exportSubmissionsBtn").addEventListener("click", exportSubmissions);
    document.getElementById("downloadProgressBtn").addEventListener("click", downloadProgressReport);
    document.getElementById("downloadCertificatesBtn").addEventListener("click", downloadCertificates);

    // Persist immediately whenever any toggle/select is changed, so
    // preferences survive a reload even without pressing Save.
    document.querySelectorAll(".setting-toggle, .setting-select, .setting-input").forEach(el => {
      el.addEventListener("change", () => {
        collectForm();
        saveSettings();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();