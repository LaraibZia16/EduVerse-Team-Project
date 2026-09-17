/* ==========================================================================
   EduVerse | Teacher Settings
   settings.js
   Fully functional front-end logic for settings.html
   Vanilla JS + Bootstrap 5 (already loaded on the page)
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     0. UTILITIES
     ------------------------------------------------------------------------ */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const SETTINGS_KEY = 'eduverse_teacher_settings';

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
      Object.assign(container.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '2000',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      });
      document.body.appendChild(container);
    }

    const el = document.createElement('div');
    el.className = `alert alert-${type} shadow`;
    el.style.minWidth = '260px';
    el.style.opacity = '0';
    el.style.transition = 'opacity .3s ease, transform .3s ease';
    el.style.transform = 'translateX(20px)';
    el.textContent = message;

    container.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      setTimeout(() => el.remove(), 300);
    }, 2800);
  }

  function buildModal(id, title, bodyHTML, footerHTML = '') {
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = id;
    modal.tabIndex = -1;
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
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
    return { modalEl, modal };
  }

  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  /* ------------------------------------------------------------------------
     1. SIDEBAR TOGGLE
     ------------------------------------------------------------------------ */

  function initSidebarToggle() {
    const menuBtn = $('.menu-toggle');
    const wrapper = $('.dashboard-wrapper');
    const sidebar = $('.sidebar');
    if (!menuBtn || !wrapper || !sidebar) return;

    menuBtn.addEventListener('click', () => {
      wrapper.classList.toggle('sidebar-collapsed');
      sidebar.classList.toggle('show');
    });

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
  }

  /* ------------------------------------------------------------------------
     2. NOTIFICATIONS BELL
     ------------------------------------------------------------------------ */

  function initTopNotifications() {
    const bell = $('.navbar-right .nav-icon');
    if (!bell) return;

    const badge = bell.querySelector('span');
    const items = [
      { text: 'Your password was changed successfully', time: '2h ago' },
      { text: 'New device signed in from Lahore', time: '3d ago' },
      { text: 'Backup created successfully', time: '5d ago' },
      { text: 'Storage usage is at 28%', time: '1w ago' },
      { text: 'Two-Factor Authentication is enabled', time: '2w ago' }
    ];

    bell.style.cursor = 'pointer';
    bell.addEventListener('click', () => {
      const listHTML = items
        .map(
          (n) => `
        <div class="d-flex justify-content-between border-bottom py-2">
          <span>${n.text}</span>
          <small class="text-muted ms-3">${n.time}</small>
        </div>`
        )
        .join('');
      showModal('notificationsModal', '<i class="fa-solid fa-bell me-2"></i>Notifications', listHTML);
      if (badge) {
        badge.textContent = '0';
        badge.style.display = 'none';
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. SEARCH SETTINGS — live-filters whole sections by their text content
     ------------------------------------------------------------------------ */

  function initSearchSettings() {
    const input = $('.navbar-left .search-box input');
    if (!input) return;

    // Every top-level <section> under main, except the page title and the
    // final "Save All Changes" section, is filterable.
    const allSections = $$('main.main-content > section');
    const titleSection = allSections[0];
    const saveSection = allSections[allSections.length - 1];
    const filterableSections = allSections.filter((s) => s !== titleSection && s !== saveSection);

    input.addEventListener('input', () => {
      const term = input.value.trim().toLowerCase();
      let visibleCount = 0;

      filterableSections.forEach((section) => {
        const match = term === '' || section.textContent.toLowerCase().includes(term);
        section.style.display = match ? '' : 'none';
        if (match) visibleCount++;
      });

      let noResults = $('#noSettingsResults');
      if (visibleCount === 0 && term !== '') {
        if (!noResults) {
          noResults = document.createElement('div');
          noResults.id = 'noSettingsResults';
          noResults.className = 'dashboard-card text-center text-muted';
          noResults.textContent = `No settings match "${input.value}".`;
          saveSection.parentElement.insertBefore(noResults, saveSection);
        }
      } else if (noResults) {
        noResults.remove();
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. FIELD IDENTIFICATION HELPERS
     Every input/select on this page lacks an id, so we build a stable key
     from its section heading + its label text.
     ------------------------------------------------------------------------ */

  function getCardHeading(el) {
    const card = el.closest('.dashboard-card');
    const h4 = card?.querySelector('.card-header-custom h4, h2');
    return h4 ? h4.textContent.trim() : 'General';
  }

  function getFieldLabel(el) {
    if (el.type === 'checkbox') {
      const wrapper = el.closest('.form-check');
      const label = wrapper?.querySelector('.form-check-label');
      return label ? label.textContent.trim() : 'Toggle';
    }
    const wrapper = el.closest('div');
    const label = wrapper?.querySelector('label.form-label');
    if (label) return label.textContent.trim();
    return el.placeholder || el.tagName.toLowerCase();
  }

  function fieldKey(el) {
    return `${getCardHeading(el)}::${getFieldLabel(el)}`;
  }

  function getManagedFields() {
    // Text/email/number inputs that are NOT readonly and NOT passwords,
    // all selects, and all checkbox switches.
    const textFields = $$('input[type="text"]:not([readonly]), input[type="email"]:not([readonly]), input[type="number"]:not([readonly])').filter(
      (el) => !el.closest('.modal')
    );
    const selects = $$('select.form-select').filter((el) => !el.closest('.modal'));
    const checkboxes = $$('input[type="checkbox"].form-check-input').filter((el) => !el.closest('.modal'));

    return { textFields, selects, checkboxes };
  }

  /* ------------------------------------------------------------------------
     5. DIRTY-STATE TRACKING (Save / Reset)
     ------------------------------------------------------------------------ */

  let defaultsSnapshot = {};
  let isDirty = false;

  function captureDefaults() {
    const { textFields, selects, checkboxes } = getManagedFields();
    textFields.concat(selects).forEach((el) => (defaultsSnapshot[fieldKey(el)] = el.value));
    checkboxes.forEach((el) => (defaultsSnapshot[fieldKey(el)] = el.checked));
  }

  function markDirty() {
    isDirty = true;
    $$('.settings-save-trigger').forEach((btn) => btn.classList.add('pulse-unsaved'));
  }

  function clearDirty() {
    isDirty = false;
    $$('.settings-save-trigger').forEach((btn) => btn.classList.remove('pulse-unsaved'));
  }

  function collectCurrentSettings() {
    const { textFields, selects, checkboxes } = getManagedFields();
    const data = {};
    textFields.concat(selects).forEach((el) => (data[fieldKey(el)] = el.value));
    checkboxes.forEach((el) => (data[fieldKey(el)] = el.checked));
    return data;
  }

  function applySettings(data) {
    const { textFields, selects, checkboxes } = getManagedFields();
    textFields.concat(selects).forEach((el) => {
      const key = fieldKey(el);
      if (key in data) el.value = data[key];
    });
    checkboxes.forEach((el) => {
      const key = fieldKey(el);
      if (key in data) el.checked = data[key];
    });
  }

  function saveAllSettings() {
    const data = collectCurrentSettings();
    Storage.set(SETTINGS_KEY, data);
    applyTheme();
    applyFontSize();
    clearDirty();
    toast('All settings saved successfully.', 'success');
  }

  function resetAllSettings() {
    applySettings(defaultsSnapshot);
    Storage.set(SETTINGS_KEY, null);
    applyTheme();
    applyFontSize();
    clearDirty();
    toast('Settings reset to their previous values.', 'primary');
  }

  function initDirtyTracking() {
    const { textFields, selects, checkboxes } = getManagedFields();

    textFields.forEach((el) => el.addEventListener('input', markDirty));
    selects.forEach((el) =>
      el.addEventListener('change', () => {
        markDirty();
        applyTheme();
        applyFontSize();
      })
    );
    checkboxes.forEach((el) => el.addEventListener('change', markDirty));
  }

  /* ------------------------------------------------------------------------
     6. LIVE THEME + FONT SIZE PREVIEW (Appearance card)
     ------------------------------------------------------------------------ */

  function findAppearanceSelect(labelText) {
    const heading = $$('.card-header-custom h4').find((h) => h.textContent.trim() === 'Appearance');
    const card = heading?.closest('.dashboard-card');
    if (!card) return null;
    return $$('select.form-select', card).find((sel) => {
      const label = sel.closest('div')?.querySelector('label.form-label');
      return label?.textContent.trim() === labelText;
    });
  }

  function applyTheme() {
    const themeSelect = findAppearanceSelect('Theme');
    if (!themeSelect) return;
    const value = themeSelect.value;

    if (value === 'Dark Mode') {
      document.body.classList.add('dark-mode');
    } else if (value === 'Light Mode') {
      document.body.classList.remove('dark-mode');
    } else {
      // System Default
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.toggle('dark-mode', prefersDark);
    }
  }

  function applyFontSize() {
    const fontSelect = findAppearanceSelect('Font Size');
    if (!fontSelect) return;
    const sizes = { Small: '14px', Medium: '16px', Large: '18px' };
    document.documentElement.style.fontSize = sizes[fontSelect.value] || '16px';
  }

  /* ------------------------------------------------------------------------
     7. SAVE / RESET BUTTONS (top page-title button + bottom section)
     ------------------------------------------------------------------------ */

  function initSaveResetButtons() {
    // Top "Save Changes" button in the page title card
    const titleSection = $('main.main-content > section');
    const topSaveBtn = titleSection?.querySelector('.btn-primary');
    if (topSaveBtn) {
      topSaveBtn.classList.add('settings-save-trigger');
      topSaveBtn.addEventListener('click', saveAllSettings);
    }

    // Bottom "Save All Changes" / "Reset" section
    const sections = $$('main.main-content > section');
    const saveSection = sections[sections.length - 1];
    if (saveSection) {
      const bottomSaveBtn = Array.from(saveSection.querySelectorAll('button')).find((b) =>
        b.textContent.trim().toLowerCase().includes('save changes')
      );
      const resetBtn = Array.from(saveSection.querySelectorAll('button')).find((b) =>
        b.textContent.trim().toLowerCase() === 'reset'
      );

      if (bottomSaveBtn) {
        bottomSaveBtn.classList.add('settings-save-trigger');
        bottomSaveBtn.addEventListener('click', saveAllSettings);
      }
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          showModal(
            'resetConfirmModal',
            'Reset Settings',
            '<p class="mb-0">This will discard any unsaved changes on this page. Continue?</p>',
            `
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-warning" id="confirmResetBtn">Reset</button>`
          );
          $('#confirmResetBtn').addEventListener('click', () => {
            resetAllSettings();
            bootstrap.Modal.getInstance($('#resetConfirmModal'))?.hide();
          });
        });
      }
    }

    // Small visual cue for unsaved changes (injected once)
    if (!$('#settingsUnsavedStyle')) {
      const style = document.createElement('style');
      style.id = 'settingsUnsavedStyle';
      style.textContent = `
        .pulse-unsaved { box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.6) !important; }
      `;
      document.head.appendChild(style);
    }
  }

  /* ------------------------------------------------------------------------
     8. ACCOUNT SETTINGS — "Update Profile"
     ------------------------------------------------------------------------ */

  function initAccountSettings() {
    const heading = $$('.card-header-custom h4').find((h) => h.textContent.trim() === 'Account Settings');
    const card = heading?.closest('.dashboard-card');
    if (!card) return;

    const updateBtn = Array.from(card.querySelectorAll('button')).find((b) =>
      b.textContent.trim() === 'Update Profile'
    );
    if (!updateBtn) return;

    updateBtn.addEventListener('click', () => {
      const inputs = $$('input.form-control', card);
      const nameInput = inputs.find((i) => i.closest('div')?.querySelector('label')?.textContent.trim() === 'Full Name');
      const emailInput = inputs.find((i) => i.type === 'email');

      if (emailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
        toast('Please enter a valid email address.', 'danger');
        return;
      }

      if (nameInput) {
        const topbarName = $('.teacher-profile h6');
        if (topbarName) topbarName.textContent = nameInput.value.trim();
      }

      saveAllSettings();
      toast('Profile updated successfully.', 'success');
    });
  }

  /* ------------------------------------------------------------------------
     9. SECURITY — "Change Password"
     ------------------------------------------------------------------------ */

  function initSecuritySettings() {
    const heading = $$('.card-header-custom h4').find((h) => h.textContent.trim() === 'Security');
    const card = heading?.closest('.dashboard-card');
    if (!card) return;

    const changePwBtn = Array.from(card.querySelectorAll('button')).find((b) =>
      b.textContent.trim() === 'Change Password'
    );
    const passwordInputs = $$('input[type="password"]', card);
    const [currentPw, newPw, confirmPw] = passwordInputs;

    if (!changePwBtn || !currentPw || !newPw || !confirmPw) return;

    changePwBtn.addEventListener('click', () => {
      if (!currentPw.value || !newPw.value || !confirmPw.value) {
        toast('Please fill in all password fields.', 'danger');
        return;
      }
      if (newPw.value.length < 6) {
        toast('New password must be at least 6 characters.', 'danger');
        return;
      }
      if (newPw.value !== confirmPw.value) {
        toast('New password and confirmation do not match.', 'danger');
        return;
      }

      // Passwords are intentionally never persisted client-side.
      currentPw.value = '';
      newPw.value = '';
      confirmPw.value = '';
      toast('Password changed successfully.', 'success');
    });
  }

  /* ------------------------------------------------------------------------
     10. CHAT MODERATION — Quick Actions
     ------------------------------------------------------------------------ */

  function initChatModeration() {
    const heading = $$('.card-header-custom h4').find((h) => h.textContent.trim() === 'Chat Moderation');
    const card = heading?.closest('.dashboard-card');
    if (!card) return;

    function askStudentThen(actionLabel, cb) {
      const { modalEl } = showModal(
        `chatAction_${actionLabel.replace(/\s+/g, '')}`,
        actionLabel,
        `
        <div class="mb-1">
          <label class="form-label">Student Name</label>
          <input type="text" class="form-control" id="chatActionStudentInput" placeholder="e.g. Ali Khan">
        </div>`,
        `
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button class="btn btn-primary" id="chatActionConfirmBtn">Confirm</button>`
      );

      $('#chatActionConfirmBtn', modalEl).addEventListener('click', () => {
        const name = $('#chatActionStudentInput', modalEl).value.trim();
        if (!name) {
          toast('Please enter a student name.', 'danger');
          return;
        }
        bootstrap.Modal.getInstance(modalEl).hide();
        cb(name);
      });
    }

    const muteBtn = Array.from(card.querySelectorAll('button')).find((b) => b.textContent.includes('Mute Student'));
    const blockBtn = Array.from(card.querySelectorAll('button')).find((b) => b.textContent.includes('Block Student'));
    const deleteBtn = Array.from(card.querySelectorAll('button')).find((b) => b.textContent.includes('Delete Chat'));

    muteBtn?.addEventListener('click', () =>
      askStudentThen('Mute Student', (name) => toast(`${name} has been muted in chat.`, 'warning'))
    );
    blockBtn?.addEventListener('click', () =>
      askStudentThen('Block Student', (name) => toast(`${name} has been blocked from messaging.`, 'danger'))
    );
    deleteBtn?.addEventListener('click', () =>
      askStudentThen('Delete Chat', (name) => toast(`Chat history with ${name} has been deleted.`, 'danger'))
    );
  }

  /* ------------------------------------------------------------------------
     11. PAYMENT SETTINGS — "Save Payment Settings"
     ------------------------------------------------------------------------ */

  function initPaymentSettings() {
    const heading = $$('.card-header-custom h4').find((h) => h.textContent.trim() === 'Payment Settings');
    const card = heading?.closest('.dashboard-card');
    if (!card) return;

    const saveBtn = Array.from(card.querySelectorAll('button')).find((b) =>
      b.textContent.trim() === 'Save Payment Settings'
    );
    if (!saveBtn) return;

    saveBtn.addEventListener('click', () => {
      const accountInput = $$('input.form-control', card).find((i) => i.type === 'text');
      const minWithdrawInput = $$('input.form-control', card).find((i) => i.type === 'number');

      if (!accountInput?.value.trim()) {
        toast('Please enter your bank account number.', 'danger');
        return;
      }
      if (minWithdrawInput && Number(minWithdrawInput.value) < 0) {
        toast('Minimum withdrawal cannot be negative.', 'danger');
        return;
      }

      saveAllSettings();
      toast('Payment settings saved.', 'success');
    });
  }

  /* ------------------------------------------------------------------------
     12. BACKUP & EXPORT
     ------------------------------------------------------------------------ */

  function initBackupExport() {
    const heading = $$('.card-header-custom h4').find((h) => h.textContent.trim() === 'Backup & Export');
    const card = heading?.closest('.dashboard-card');
    if (!card) return;

    const buttons = $$('button', card);

    buttons.forEach((btn) => {
      const label = btn.textContent.trim();

      if (label.includes('Export Courses')) {
        btn.addEventListener('click', () => {
          const csv = 'Course,Students,Revenue\nWeb Development,120,$4500\nPython Programming,95,$3200\nUI / UX Design,80,$2750\nDatabase Management,60,$2000';
          downloadFile(`courses-export-${Date.now()}.csv`, csv, 'text/csv;charset=utf-8;');
          toast('Courses exported successfully.', 'success');
        });
      } else if (label.includes('Export Students')) {
        btn.addEventListener('click', () => {
          const csv = 'Student,Course,Status\nAli Khan,Web Development,Active\nSara Ahmed,Python Programming,Active\nAhmed Raza,UI / UX Design,Active\nFatima Noor,Database Management,Active';
          downloadFile(`students-export-${Date.now()}.csv`, csv, 'text/csv;charset=utf-8;');
          toast('Student list exported successfully.', 'success');
        });
      } else if (label.includes('Download Reports')) {
        btn.addEventListener('click', () => {
          const csv = 'Metric,Value\nTotal Earnings,$12450\nAverage Rating,4.9\nActive Students,254\nCourses Published,6';
          downloadFile(`reports-${Date.now()}.csv`, csv, 'text/csv;charset=utf-8;');
          toast('Report downloaded successfully.', 'success');
        });
      } else if (label.includes('Create Backup')) {
        btn.addEventListener('click', () => {
          const backup = {
            createdAt: new Date().toISOString(),
            settings: collectCurrentSettings()
          };
          downloadFile(`eduverse-backup-${Date.now()}.json`, JSON.stringify(backup, null, 2), 'application/json');
          toast('Backup created and downloaded.', 'success');
        });
      }
    });
  }

  /* ------------------------------------------------------------------------
     13. CONNECTED ACCOUNTS
     ------------------------------------------------------------------------ */

  function initConnectedAccounts() {
    const heading = $$('.card-header-custom h4').find((h) => h.textContent.trim() === 'Connected Accounts');
    const card = heading?.closest('.dashboard-card');
    if (!card) return;

    $$('.setting-row', card).forEach((row) => {
      const statusEl = row.querySelector('p.text-muted');
      const btn = row.querySelector('button');
      const serviceName = row.querySelector('strong')?.textContent.trim() || 'account';
      if (!statusEl || !btn) return;

      btn.addEventListener('click', () => {
        const isConnected = statusEl.textContent.trim() === 'Connected';

        if (isConnected) {
          showModal(
            'disconnectConfirmModal',
            `Disconnect ${serviceName}`,
            `<p class="mb-0">Are you sure you want to disconnect your ${serviceName} account?</p>`,
            `
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-danger" id="confirmDisconnectBtn">Disconnect</button>`
          );
          $('#confirmDisconnectBtn').addEventListener('click', () => {
            statusEl.textContent = 'Not Connected';
            btn.textContent = 'Connect';
            btn.className = 'btn btn-primary btn-sm';
            bootstrap.Modal.getInstance($('#disconnectConfirmModal'))?.hide();
            toast(`${serviceName} disconnected.`, 'warning');
          });
        } else if (btn.textContent.trim() === 'Connect') {
          statusEl.textContent = 'Connected';
          btn.textContent = 'Disconnect';
          btn.className = 'btn btn-outline-danger btn-sm';
          toast(`${serviceName} connected successfully.`, 'success');
        } else {
          // "Manage" button for already-connected services like GitHub
          showModal(
            `${serviceName}ManageModal`,
            `Manage ${serviceName}`,
            `<p class="mb-0">Your ${serviceName} account is connected and syncing normally. You can disconnect it below if needed.</p>`,
            `
            <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button class="btn btn-outline-danger" id="manageDisconnectBtn">Disconnect</button>`
          );
          $('#manageDisconnectBtn').addEventListener('click', () => {
            statusEl.textContent = 'Not Connected';
            btn.textContent = 'Connect';
            btn.className = 'btn btn-primary btn-sm';
            bootstrap.Modal.getInstance($(`#${serviceName}ManageModal`))?.hide();
            toast(`${serviceName} disconnected.`, 'warning');
          });
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     14. HELP & SUPPORT LINKS
     ------------------------------------------------------------------------ */

  function initHelpSupport() {
    const heading = $$('.card-header-custom h4').find((h) => h.textContent.trim() === 'Help & Support');
    const card = heading?.closest('.dashboard-card');
    if (!card) return;

    const helpContent = {
      'Frequently Asked Questions': 'Browse common questions about courses, payments, and student management in our FAQ center.',
      'User Guide': 'Read the complete EduVerse Teacher Dashboard guide to get the most out of every feature.',
      'Report a Bug': 'Let us know what went wrong and our team will investigate as soon as possible.',
      'Contact Admin': 'Reach out to the EduVerse admin team directly for account or platform issues.'
    };

    $$('a.list-group-item', card).forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const label = link.textContent.trim();

        if (label === 'Report a Bug' || label === 'Contact Admin') {
          showModal(
            label,
            label,
            `
            <p class="text-muted">${helpContent[label] || ''}</p>
            <div class="mb-1">
              <label class="form-label">Message</label>
              <textarea class="form-control" rows="4" id="helpMessageInput" placeholder="Describe the issue..."></textarea>
            </div>`,
            `
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-primary" id="sendHelpMessageBtn">Send</button>`
          );
          $('#sendHelpMessageBtn').addEventListener('click', () => {
            const msg = $('#helpMessageInput').value.trim();
            if (!msg) {
              toast('Please describe the issue before sending.', 'danger');
              return;
            }
            bootstrap.Modal.getInstance(document.querySelector('.modal.show'))?.hide();
            toast('Your message has been sent to the EduVerse team.', 'success');
          });
        } else {
          showModal(label, label, `<p class="mb-0">${helpContent[label] || ''}</p>`);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     15. LOGIN ACTIVITY — click a row for details
     ------------------------------------------------------------------------ */

  function initLoginActivity() {
    const heading = $$('.card-header-custom h4').find((h) => h.textContent.trim() === 'Recent Login Activity');
    const card = heading?.closest('.dashboard-card');
    if (!card) return;

    $$('tbody tr', card).forEach((row) => {
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        const cells = row.querySelectorAll('td');
        const device = cells[0]?.textContent.trim() || '';
        const location = cells[1]?.textContent.trim() || '';
        const date = cells[2]?.textContent.trim() || '';
        const status = cells[3]?.textContent.trim() || '';

        showModal(
          'loginActivityDetailModal',
          '<i class="fa-solid fa-clock-rotate-left me-2"></i>Login Details',
          `
          <p class="mb-1"><strong>Device:</strong> ${device}</p>
          <p class="mb-1"><strong>Location:</strong> ${location}</p>
          <p class="mb-1"><strong>Date:</strong> ${date}</p>
          <p class="mb-0"><strong>Status:</strong> ${status}</p>`
        );
      });
    });
  }

  /* ------------------------------------------------------------------------
     16. DANGER ZONE — Logout Everywhere / Delete Account
     ------------------------------------------------------------------------ */

  function initDangerZone() {
    const dangerCards = $$('.danger-card');
    if (dangerCards.length === 0) return;

    const logoutCard = dangerCards.find((c) => c.querySelector('h5')?.textContent.includes('Logout from All Devices'));
    const deleteCard = dangerCards.find((c) => c.querySelector('h5')?.textContent.includes('Delete Account'));

    logoutCard?.querySelector('button')?.addEventListener('click', () => {
      const { modalEl } = showModal(
        'logoutEverywhereModal',
        'Logout from All Devices',
        '<p class="mb-0">This will sign you out of every device except this one. Continue?</p>',
        `
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button class="btn btn-warning" id="confirmLogoutEverywhereBtn">Logout Everywhere</button>`
      );

      $('#confirmLogoutEverywhereBtn', modalEl).addEventListener('click', () => {
        $$('table tbody tr').forEach((row) => {
          const badge = row.querySelector('.badge');
          if (badge && !badge.classList.contains('bg-success')) {
            badge.textContent = 'Logged Out';
            badge.className = 'badge bg-secondary';
          }
        });
        bootstrap.Modal.getInstance(modalEl).hide();
        toast('You have been logged out from all other devices.', 'success');
      });
    });

    deleteCard?.querySelector('button')?.addEventListener('click', () => {
      const { modalEl } = showModal(
        'deleteAccountModal',
        '<span class="text-danger"><i class="fa-solid fa-triangle-exclamation me-2"></i>Delete Account</span>',
        `
        <p>This will permanently remove your courses, students, quizzes, and dashboard data. This cannot be undone.</p>
        <p class="mb-2">Type <strong>DELETE</strong> to confirm.</p>
        <input type="text" class="form-control" id="deleteConfirmInput" placeholder="Type DELETE">`,
        `
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button class="btn btn-danger" id="confirmDeleteAccountBtn" disabled>Delete Account</button>`
      );

      const confirmInput = $('#deleteConfirmInput', modalEl);
      const confirmBtn = $('#confirmDeleteAccountBtn', modalEl);

      confirmInput.addEventListener('input', () => {
        confirmBtn.disabled = confirmInput.value.trim() !== 'DELETE';
      });

      confirmBtn.addEventListener('click', () => {
        if (confirmInput.value.trim() !== 'DELETE') return;
        bootstrap.Modal.getInstance(modalEl).hide();
        toast('Account deletion request submitted.', 'danger');
      });
    });
  }

  /* ------------------------------------------------------------------------
     17. FOOTER LINKS
     ------------------------------------------------------------------------ */

  function initFooterLinks() {
    $$('.dashboard-footer a').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        toast(`${link.textContent.trim()} page is coming soon.`, 'primary');
      });
    });
  }

  /* ------------------------------------------------------------------------
     INIT — DOM READY
     ------------------------------------------------------------------------ */

  document.addEventListener('DOMContentLoaded', () => {
    // Capture the page's original values BEFORE restoring anything,
    // so "Reset" always has a true baseline to fall back to.
    captureDefaults();

    const saved = Storage.get(SETTINGS_KEY, null);
    if (saved) applySettings(saved);

    initSidebarToggle();
    initTopNotifications();
    initSearchSettings();
    initDirtyTracking();
    initSaveResetButtons();
    initAccountSettings();
    initSecuritySettings();
    initChatModeration();
    initPaymentSettings();
    initBackupExport();
    initConnectedAccounts();
    initHelpSupport();
    initLoginActivity();
    initDangerZone();
    initFooterLinks();

    applyTheme();
    applyFontSize();
  });
})();