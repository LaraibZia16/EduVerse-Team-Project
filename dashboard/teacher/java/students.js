/* ==========================================================================
   EduVerse | Student Dashboard
   student.js
   Fully functional front-end logic for student.html
   Author: Senior Frontend/Java-style modular JS (vanilla, no dependencies
   beyond Bootstrap 5 which is already loaded in the page)
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     0. UTILITIES
     ------------------------------------------------------------------------ */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const Storage = {
    get(key, fallback) {
      try {
        const val = localStorage.getItem(key);
        return val === null ? fallback : JSON.parse(val);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        /* storage unavailable - fail silently */
      }
    }
  };

  function toast(message, type = 'primary') {
    let container = $('#eduToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'eduToastContainer';
      container.style.position = 'fixed';
      container.style.top = '20px';
      container.style.right = '20px';
      container.style.zIndex = '2000';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '10px';
      document.body.appendChild(container);
    }

    const toastEl = document.createElement('div');
    toastEl.className = `alert alert-${type} shadow`;
    toastEl.style.minWidth = '260px';
    toastEl.style.opacity = '0';
    toastEl.style.transition = 'opacity .3s ease, transform .3s ease';
    toastEl.style.transform = 'translateX(20px)';
    toastEl.textContent = message;

    container.appendChild(toastEl);
    requestAnimationFrame(() => {
      toastEl.style.opacity = '1';
      toastEl.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateX(20px)';
      setTimeout(() => toastEl.remove(), 300);
    }, 3000);
  }

  function buildModal(id, title, bodyHTML, footerHTML = '') {
    let existing = document.getElementById(id);
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = id;
    modal.tabIndex = -1;
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">${bodyHTML}</div>
          ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
        </div>
      </div>`;
    document.body.appendChild(modal);
    return modal;
  }

  function showModal(id, title, bodyHTML, footerHTML = '') {
    const modalEl = buildModal(id, title, bodyHTML, footerHTML);
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
    return modal;
  }

  /* ------------------------------------------------------------------------
     1. SIDEBAR TOGGLE (mobile responsiveness)
     ------------------------------------------------------------------------ */

  function initSidebarToggle() {
    const menuBtn = $('#menuBtn');
    const wrapper = $('.wrapper');
    const sidebar = $('.sidebar');
    if (!menuBtn || !wrapper) return;

    menuBtn.addEventListener('click', () => {
      wrapper.classList.toggle('sidebar-collapsed');
      sidebar.classList.toggle('show');
    });

    // Close sidebar on outside click when in mobile/overlay mode
    document.addEventListener('click', (e) => {
      const isMobile = window.innerWidth <= 992;
      if (!isMobile) return;
      if (
        sidebar.classList.contains('show') &&
        !sidebar.contains(e.target) &&
        e.target !== menuBtn &&
        !menuBtn.contains(e.target)
      ) {
        sidebar.classList.remove('show');
      }
    });

    // Highlight active nav link + auto-close sidebar on mobile after click
    $$('.sidebar ul li a').forEach((link) => {
      link.addEventListener('click', () => {
        $$('.sidebar ul li').forEach((li) => li.classList.remove('active'));
        link.closest('li').classList.add('active');
        if (window.innerWidth <= 992) {
          sidebar.classList.remove('show');
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     2. DARK MODE TOGGLE (persisted)
     ------------------------------------------------------------------------ */

  function initDarkMode() {
    const darkModeBtn = $('#darkModeBtn');
    if (!darkModeBtn) return;

    const icon = darkModeBtn.querySelector('i');

    function applyTheme(isDark) {
      document.body.classList.toggle('dark-mode', isDark);
      if (icon) {
        icon.classList.toggle('fa-moon', !isDark);
        icon.classList.toggle('fa-sun', isDark);
      }
    }

    const saved = Storage.get('eduverse_dark_mode', false);
    applyTheme(saved);

    darkModeBtn.addEventListener('click', () => {
      const isDark = !document.body.classList.contains('dark-mode');
      applyTheme(isDark);
      Storage.set('eduverse_dark_mode', isDark);
    });
  }

  /* ------------------------------------------------------------------------
     3. COURSE SEARCH FILTER
     ------------------------------------------------------------------------ */

  function initSearch() {
    const input = $('#searchInput');
    if (!input) return;

    input.addEventListener('input', () => {
      const term = input.value.trim().toLowerCase();
      const cards = $$('#courses .course-card');
      let visibleCount = 0;

      cards.forEach((card) => {
        const title = card.querySelector('h4')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
        const match = title.includes(term) || desc.includes(term);
        const col = card.closest('[class*="col-"]');
        if (col) col.style.display = match ? '' : 'none';
        if (match) visibleCount++;
      });

      // "No results" message
      let noResults = $('#noCourseResults');
      const courseRow = $('#courses .row');
      if (visibleCount === 0 && term !== '') {
        if (!noResults && courseRow) {
          noResults = document.createElement('div');
          noResults.id = 'noCourseResults';
          noResults.className = 'text-center text-muted py-4 w-100';
          noResults.textContent = `No courses match "${input.value}".`;
          courseRow.appendChild(noResults);
        }
      } else if (noResults) {
        noResults.remove();
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. NOTIFICATIONS
     ------------------------------------------------------------------------ */

  function initNotifications() {
    const notifBtn = $('.right .btn-light');
    const countBadge = $('.notification-count');
    if (!notifBtn) return;

    const sampleNotifications = [
      { text: 'New assignment posted in Web Development', time: '2h ago' },
      { text: 'Your Python Calculator was graded: A', time: '5h ago' },
      { text: 'Live class "CSS Flexbox" starts in 1 hour', time: '6h ago' },
      { text: 'Quiz rescheduled to Monday', time: '1d ago' }
    ];

    notifBtn.style.cursor = 'pointer';
    notifBtn.addEventListener('click', () => {
      const listHTML = sampleNotifications
        .map(
          (n) => `
        <div class="d-flex justify-content-between border-bottom py-2">
          <span>${n.text}</span>
          <small class="text-muted ms-3">${n.time}</small>
        </div>`
        )
        .join('');

      showModal(
        'notificationsModal',
        '<i class="fa-solid fa-bell me-2"></i>Notifications',
        listHTML || '<p class="text-muted mb-0">No new notifications.</p>'
      );

      if (countBadge) {
        countBadge.textContent = '0';
        countBadge.style.display = 'none';
      }
    });
  }

  /* ------------------------------------------------------------------------
     5. COURSES - Continue Learning
     ------------------------------------------------------------------------ */

  function initContinueLearning() {
    $$('.continue-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.course-card');
        const title = card.querySelector('h4')?.textContent.trim() || 'Course';
        const progressBar = card.querySelector('.progress-bar');
        const currentWidth = parseInt(progressBar?.style.width) || 0;

        toast(`Resuming "${title}" — ${currentWidth}% completed`, 'success');

        // Simulate slight progress increase each time the student continues
        if (progressBar && currentWidth < 100) {
          const newWidth = Math.min(currentWidth + 5, 100);
          progressBar.style.width = newWidth + '%';
          progressBar.textContent = newWidth + '%';

          if (newWidth === 100) {
            progressBar.classList.remove('bg-warning', 'bg-info');
            progressBar.classList.add('bg-success');
            toast(`🎉 You completed "${title}"!`, 'success');
          }
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. LIVE CLASSES - Join
     ------------------------------------------------------------------------ */

  function initJoinClass() {
    $$('.join-class, .btn-danger').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const row = btn.closest('tr');
        let course = 'the class';
        let teacher = '';
        let time = '';

        if (row) {
          const cells = row.querySelectorAll('td');
          course = cells[0]?.textContent.trim() || course;
          teacher = cells[1]?.textContent.trim() || '';
          time = `${cells[2]?.textContent.trim() || ''} at ${cells[3]?.textContent.trim() || ''}`;
        }

        showModal(
          'joinClassModal',
          `<i class="fa-solid fa-video me-2"></i>Joining ${course}`,
          `
          <div class="text-center py-3">
            <div class="spinner-border text-primary mb-3" role="status"></div>
            <p class="mb-1"><strong>Course:</strong> ${course}</p>
            ${teacher ? `<p class="mb-1"><strong>Teacher:</strong> ${teacher}</p>` : ''}
            ${time ? `<p class="mb-1"><strong>Schedule:</strong> ${time}</p>` : ''}
            <p class="text-muted mt-3">Connecting to live session...</p>
          </div>`,
          `<button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>`
        );

        setTimeout(() => {
          const modalEl = $('#joinClassModal');
          if (modalEl && modalEl.classList.contains('show')) {
            toast(`Connected to ${course} live class.`, 'success');
          }
        }, 1500);
      });
    });
  }

  /* ------------------------------------------------------------------------
     7. RECORDED LECTURES - Watch Now
     ------------------------------------------------------------------------ */

  function initWatchVideo() {
    $$('.watch-video').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.video-card');
        const title = card.querySelector('h5')?.textContent.trim() || 'Lecture';
        const duration = card.querySelector('p')?.textContent.trim() || '';
        const thumb = card.querySelector('img')?.src || '';

        showModal(
          'watchVideoModal',
          `<i class="fa-solid fa-circle-play me-2"></i>${title}`,
          `
          <div class="ratio ratio-16x9 bg-dark d-flex align-items-center justify-content-center mb-3">
            <div class="text-white text-center">
              <i class="fa-solid fa-play-circle fa-3x mb-2"></i>
              <p class="mb-0">Playing: ${title}</p>
            </div>
          </div>
          <p class="text-muted mb-0">${duration}</p>`
        );
      });
    });
  }

  /* ------------------------------------------------------------------------
     8. ASSIGNMENTS - Upload
     ------------------------------------------------------------------------ */

  function initAssignmentUpload() {
    $$('.upload-btn').forEach((btn) => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.pdf,.doc,.docx,.zip,.png,.jpg';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);

      btn.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', () => {
        if (!fileInput.files || fileInput.files.length === 0) return;
        const fileName = fileInput.files[0].name;
        const row = btn.closest('tr');
        const assignment = row?.querySelector('td')?.textContent.trim() || 'Assignment';
        const statusBadge = row?.querySelector('.badge');

        toast(`Uploading "${fileName}" for ${assignment}...`, 'primary');

        setTimeout(() => {
          if (statusBadge) {
            statusBadge.textContent = 'Submitted';
            statusBadge.classList.remove('bg-warning');
            statusBadge.classList.add('bg-success');
          }
          btn.textContent = 'Uploaded';
          btn.disabled = true;
          btn.classList.remove('btn-primary');
          btn.classList.add('btn-secondary');
          toast(`"${fileName}" submitted successfully for ${assignment}.`, 'success');
        }, 1000);

        fileInput.value = '';
      });
    });
  }

  /* ------------------------------------------------------------------------
     9. QUIZZES - Start Quiz (simple interactive MCQ runner)
     ------------------------------------------------------------------------ */

  const QUIZ_BANK = {
    'HTML Quiz': [
      { q: 'What does HTML stand for?', options: ['Hyper Trainer Markup Language', 'Hyper Text Markup Language', 'Hyper Text Marketing Language', 'None'], answer: 1 },
      { q: 'Which tag is used for the largest heading?', options: ['<h6>', '<heading>', '<h1>', '<head>'], answer: 2 },
      { q: 'Which tag creates a hyperlink?', options: ['<link>', '<a>', '<href>', '<nav>'], answer: 1 }
    ],
    'CSS Quiz': [
      { q: 'Which property changes text color?', options: ['font-color', 'text-color', 'color', 'background-color'], answer: 2 },
      { q: 'Which value makes a flex container?', options: ['display: flex', 'position: flex', 'flex: box', 'display: box'], answer: 0 },
      { q: 'Which unit is relative to the root font size?', options: ['em', 'px', 'rem', 'vh'], answer: 2 }
    ],
    'JavaScript Quiz': [
      { q: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'global', 'define'], answer: 1 },
      { q: 'Which method converts JSON text to an object?', options: ['JSON.parse()', 'JSON.stringify()', 'JSON.toObject()', 'Object.parse()'], answer: 0 },
      { q: 'Which operator checks strict equality?', options: ['==', '=', '===', '!='], answer: 2 }
    ]
  };

  function initQuizzes() {
    $$('.start-quiz').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.quiz-card');
        const title = card.querySelector('h4')?.textContent.trim() || 'Quiz';
        const questions = QUIZ_BANK[title] || [];

        if (questions.length === 0) {
          toast(`No questions available for ${title} yet.`, 'warning');
          return;
        }

        let current = 0;
        let score = 0;

        const modalEl = buildModal(
          'quizModal',
          `<i class="fa-solid fa-clipboard-question me-2"></i>${title}`,
          '',
          `<button class="btn btn-secondary" data-bs-dismiss="modal">Exit Quiz</button>`
        );
        const modal = new bootstrap.Modal(modalEl);
        const body = modalEl.querySelector('.modal-body');

        function renderQuestion() {
          const q = questions[current];
          body.innerHTML = `
            <p class="text-muted">Question ${current + 1} of ${questions.length}</p>
            <h5 class="mb-3">${q.q}</h5>
            <div class="d-grid gap-2" id="quizOptions">
              ${q.options
                .map(
                  (opt, i) => `<button type="button" class="btn btn-outline-primary text-start quiz-option" data-index="${i}">${opt}</button>`
                )
                .join('')}
            </div>`;

          $$('.quiz-option', body).forEach((optBtn) => {
            optBtn.addEventListener('click', () => {
              const chosen = parseInt(optBtn.dataset.index);
              $$('.quiz-option', body).forEach((b) => (b.disabled = true));

              if (chosen === q.answer) {
                optBtn.classList.remove('btn-outline-primary');
                optBtn.classList.add('btn-success');
                score++;
              } else {
                optBtn.classList.remove('btn-outline-primary');
                optBtn.classList.add('btn-danger');
                const correctBtn = $(`.quiz-option[data-index="${q.answer}"]`, body);
                if (correctBtn) {
                  correctBtn.classList.remove('btn-outline-primary');
                  correctBtn.classList.add('btn-success');
                }
              }

              setTimeout(() => {
                current++;
                if (current < questions.length) {
                  renderQuestion();
                } else {
                  showResults();
                }
              }, 700);
            });
          });
        }

        function showResults() {
          const percent = Math.round((score / questions.length) * 100);
          body.innerHTML = `
            <div class="text-center py-3">
              <i class="fa-solid fa-award fa-3x text-warning mb-3"></i>
              <h4>You scored ${score} / ${questions.length}</h4>
              <p class="text-muted">${percent}% correct</p>
            </div>`;
          toast(`${title} completed: ${percent}%`, percent >= 70 ? 'success' : 'warning');
        }

        renderQuestion();
        modal.show();
        modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
      });
    });
  }

  /* ------------------------------------------------------------------------
     10. TEACHER CHAT
     ------------------------------------------------------------------------ */

  function initTeacherChat() {
    const chatSection = $('#chat');
    if (!chatSection) return;

    const chatBox = chatSection.querySelector('.chat-box');
    const textarea = chatSection.querySelector('textarea');
    const sendBtn = chatSection.querySelector('.btn-primary');
    if (!chatBox || !textarea || !sendBtn) return;

    const autoReplies = [
      'Noted, thank you for your message!',
      "I'll get back to you shortly.",
      'Please check the assignment guidelines on the portal.',
      "Great question — I'll cover that in the next class."
    ];

    function appendMessage(text, type) {
      const msg = document.createElement('div');
      msg.className = `message ${type}`;
      msg.innerHTML = `<strong>${type === 'sent' ? 'You' : 'Teacher'}:</strong> ${text}`;
      chatBox.appendChild(msg);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    function sendMessage() {
      const text = textarea.value.trim();
      if (!text) {
        textarea.focus();
        return;
      }
      appendMessage(text, 'sent');
      textarea.value = '';

      // Simulated teacher reply
      setTimeout(() => {
        const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
        appendMessage(reply, 'received');
      }, 900);
    }

    sendBtn.addEventListener('click', sendMessage);
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  /* ------------------------------------------------------------------------
     11. PROFILE - Edit Profile
     ------------------------------------------------------------------------ */

  function initProfileEdit() {
    const profileSection = $('#profile');
    if (!profileSection) return;

    const editBtn = profileSection.querySelector('.btn-success');
    if (!editBtn) return;

    editBtn.addEventListener('click', () => {
      const nameEl = profileSection.querySelector('h3');
      const emailEl = profileSection.querySelectorAll('p')[0];
      const rollEl = profileSection.querySelectorAll('p')[1];
      const deptEl = profileSection.querySelectorAll('p')[2];

      const currentName = nameEl?.textContent.trim() || '';
      const currentEmail = emailEl?.textContent.replace('Email :', '').trim() || '';
      const currentRoll = rollEl?.textContent.replace('Roll No :', '').trim() || '';
      const currentDept = deptEl?.textContent.replace('Department :', '').trim() || '';

      showModal(
        'editProfileModal',
        '<i class="fa-solid fa-user-pen me-2"></i>Edit Profile',
        `
        <div class="mb-3">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-control" id="editName" value="${currentName}">
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" id="editEmail" value="${currentEmail}">
        </div>
        <div class="mb-3">
          <label class="form-label">Roll No</label>
          <input type="text" class="form-control" id="editRoll" value="${currentRoll}">
        </div>
        <div class="mb-3">
          <label class="form-label">Department</label>
          <input type="text" class="form-control" id="editDept" value="${currentDept}">
        </div>`,
        `
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button class="btn btn-success" id="saveProfileBtn">Save Changes</button>`
      );

      $('#saveProfileBtn').addEventListener('click', () => {
        const newName = $('#editName').value.trim() || currentName;
        const newEmail = $('#editEmail').value.trim() || currentEmail;
        const newRoll = $('#editRoll').value.trim() || currentRoll;
        const newDept = $('#editDept').value.trim() || currentDept;

        nameEl.textContent = newName;
        emailEl.textContent = `Email : ${newEmail}`;
        rollEl.textContent = `Roll No : ${newRoll}`;
        deptEl.textContent = `Department : ${newDept}`;

        // Keep topbar welcome name in sync (uses first name)
        const studentNameEl = $('.student-name');
        if (studentNameEl) studentNameEl.textContent = newName.split(' ')[0];

        Storage.set('eduverse_profile', { newName, newEmail, newRoll, newDept });

        bootstrap.Modal.getInstance($('#editProfileModal')).hide();
        toast('Profile updated successfully.', 'success');
      });
    });
  }

  /* ------------------------------------------------------------------------
     12. SETTINGS - Toggles (persisted)
     ------------------------------------------------------------------------ */

  function initSettings() {
    const notifToggle = $('#notifications');
    const emailToggle = $('#emails');

    if (notifToggle) {
      notifToggle.checked = Storage.get('eduverse_notif_enabled', true);
      notifToggle.addEventListener('change', () => {
        Storage.set('eduverse_notif_enabled', notifToggle.checked);
        toast(`Notifications ${notifToggle.checked ? 'enabled' : 'disabled'}.`, 'primary');
      });
    }

    if (emailToggle) {
      emailToggle.checked = Storage.get('eduverse_email_enabled', false);
      emailToggle.addEventListener('change', () => {
        Storage.set('eduverse_email_enabled', emailToggle.checked);
        toast(`Email updates ${emailToggle.checked ? 'enabled' : 'disabled'}.`, 'primary');
      });
    }
  }

  /* ------------------------------------------------------------------------
     13. VIEW ALL COURSES BUTTON
     ------------------------------------------------------------------------ */

  function initViewAllCourses() {
    const viewAllBtn = $('#courses .section-header .btn-primary');
    if (!viewAllBtn) return;

    viewAllBtn.addEventListener('click', () => {
      const hiddenCols = $$('#courses .row > [class*="col-"]').filter(
        (col) => col.style.display === 'none'
      );
      hiddenCols.forEach((col) => (col.style.display = ''));
      const searchInput = $('#searchInput');
      if (searchInput) searchInput.value = '';
      const noResults = $('#noCourseResults');
      if (noResults) noResults.remove();
      toast('Showing all enrolled courses.', 'primary');
    });
  }

  /* ------------------------------------------------------------------------
     14. SMOOTH SCROLL FOR SIDEBAR / SECTION ANCHORS
     ------------------------------------------------------------------------ */

  function initSmoothScroll() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     15. RESTORE PERSISTED PROFILE ON LOAD
     ------------------------------------------------------------------------ */

  function restoreProfile() {
    const saved = Storage.get('eduverse_profile', null);
    if (!saved) return;

    const profileSection = $('#profile');
    if (!profileSection) return;

    const nameEl = profileSection.querySelector('h3');
    const emailEl = profileSection.querySelectorAll('p')[0];
    const rollEl = profileSection.querySelectorAll('p')[1];
    const deptEl = profileSection.querySelectorAll('p')[2];
    const studentNameEl = $('.student-name');

    if (nameEl) nameEl.textContent = saved.newName;
    if (emailEl) emailEl.textContent = `Email : ${saved.newEmail}`;
    if (rollEl) rollEl.textContent = `Roll No : ${saved.newRoll}`;
    if (deptEl) deptEl.textContent = `Department : ${saved.newDept}`;
    if (studentNameEl) studentNameEl.textContent = saved.newName.split(' ')[0];
  }

  /* ------------------------------------------------------------------------
     INIT — DOM READY
     ------------------------------------------------------------------------ */

  document.addEventListener('DOMContentLoaded', () => {
    restoreProfile();
    initSidebarToggle();
    initDarkMode();
    initSearch();
    initNotifications();
    initContinueLearning();
    initJoinClass();
    initWatchVideo();
    initAssignmentUpload();
    initQuizzes();
    initTeacherChat();
    initProfileEdit();
    initSettings();
    initViewAllCourses();
    initSmoothScroll();
  });
})();