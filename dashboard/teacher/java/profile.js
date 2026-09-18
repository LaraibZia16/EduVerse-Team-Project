/* ==========================================================================
   EduVerse | Teacher Profile
   profile.js
   Fully functional front-end logic for profile.html
   Vanilla JS + Bootstrap 5 (already loaded on the page)
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
     2. NOTIFICATIONS BELL (top navbar)
     ------------------------------------------------------------------------ */

  function initTopNotifications() {
    const bell = $('.navbar-right .nav-icon');
    if (!bell) return;

    const badge = bell.querySelector('span');
    const items = [
      { text: 'Your profile was viewed by 12 students', time: '1h ago' },
      { text: 'New certificate uploaded successfully', time: '4h ago' },
      { text: 'Security: new login from Windows device', time: '6h ago' },
      { text: 'Reminder: update your bio for better reach', time: '1d ago' },
      { text: 'Your rating increased to 4.9', time: '2d ago' }
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
     3. SEARCH PROFILE (top navbar) — scrolls/highlights matching section
     ------------------------------------------------------------------------ */

  function initSearch() {
    const input = $('.navbar-left .search-box input');
    if (!input) return;

    const sectionMap = [
      { keywords: ['about', 'introduction', 'bio'], selector: '.about-content' },
      { keywords: ['personal', 'email', 'phone', 'location', 'name'], heading: 'Personal Information' },
      { keywords: ['qualification', 'education', 'degree'], selector: '.qualification-item' },
      { keywords: ['skill'], selector: '.skills-container' },
      { keywords: ['experience'], selector: '.experience-list' },
      { keywords: ['language'], selector: '.language-item' },
      { keywords: ['social', 'linkedin', 'github', 'youtube'], selector: '.social-links' },
      { keywords: ['security', 'password', '2fa', 'authentication'], selector: '.security-item' },
      { keywords: ['notification'], selector: '.notification-item' },
      { keywords: ['activity', 'login', 'device'], selector: '.activity-row' }
    ];

    function findByHeading(headingText) {
      const heading = $$('.card-header-custom h4').find((h) => h.textContent.trim() === headingText);
      return heading ? heading.closest('.dashboard-card') : null;
    }

    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const term = input.value.trim().toLowerCase();
      if (!term) return;

      const match = sectionMap.find((entry) => entry.keywords.some((k) => term.includes(k)));
      const target = match ? (match.heading ? findByHeading(match.heading) : $(match.selector)) : null;

      if (target) {
        const card = target.closest('.dashboard-card') || target;
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.transition = 'box-shadow .3s ease';
        card.style.boxShadow = '0 0 0 3px #4361ee';
        setTimeout(() => (card.style.boxShadow = ''), 1500);
      } else {
        toast(`No profile section matches "${input.value}".`, 'warning');
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. AVATAR UPLOAD (click the profile photo to change it)
     ------------------------------------------------------------------------ */

  function initAvatarUpload() {
    const profileImage = $('.profile-image img');
    const container = $('.profile-image');
    if (!profileImage || !container) return;

    container.style.cursor = 'pointer';
    container.title = 'Click to change photo';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    container.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        profileImage.src = dataUrl;

        const topbarAvatar = $('.teacher-profile img');
        if (topbarAvatar) topbarAvatar.src = dataUrl;

        Storage.set('eduverse_teacher_avatar', dataUrl);
        toast('Profile photo updated.', 'success');
      };
      reader.readAsDataURL(file);
      fileInput.value = '';
    });
  }

  function restoreAvatar() {
    const saved = Storage.get('eduverse_teacher_avatar', null);
    if (!saved) return;
    const profileImage = $('.profile-image img');
    const topbarAvatar = $('.teacher-profile img');
    if (profileImage) profileImage.src = saved;
    if (topbarAvatar) topbarAvatar.src = saved;
  }

  /* ------------------------------------------------------------------------
     5. EDIT PROFILE MODAL (name, title, tags)
     ------------------------------------------------------------------------ */

  function initEditProfile() {
    const editBtn = $('.profile-action .btn-primary');
    if (!editBtn) return;

    editBtn.addEventListener('click', () => {
      const nameEl = $('.profile-info h2');
      const titleEl = $('.profile-info p');
      const tagEls = $$('.profile-tags span');

      const currentName = nameEl?.textContent.trim() || '';
      const currentTitle = titleEl?.textContent.trim() || '';
      const currentTags = tagEls.map((t) => t.textContent.trim()).join(', ');

      const { modalEl } = showModal(
        'editProfileModal',
        '<i class="fa-solid fa-pen me-2"></i>Edit Profile',
        `
        <div class="mb-3">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-control" id="editProfileName" value="${currentName}">
        </div>
        <div class="mb-3">
          <label class="form-label">Professional Title</label>
          <input type="text" class="form-control" id="editProfileTitle" value="${currentTitle}">
        </div>
        <div class="mb-1">
          <label class="form-label">Tags (comma separated)</label>
          <input type="text" class="form-control" id="editProfileTags" value="${currentTags}">
        </div>`,
        `
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button class="btn btn-primary" id="saveProfileEditBtn">Save Changes</button>`
      );

      $('#saveProfileEditBtn', modalEl).addEventListener('click', () => {
        const newName = $('#editProfileName', modalEl).value.trim() || currentName;
        const newTitle = $('#editProfileTitle', modalEl).value.trim() || currentTitle;
        const newTags = $('#editProfileTags', modalEl)
          .value.split(',')
          .map((t) => t.trim())
          .filter(Boolean);

        if (nameEl) nameEl.textContent = newName;
        if (titleEl) titleEl.textContent = newTitle;

        const tagsContainer = $('.profile-tags');
        if (tagsContainer) {
          tagsContainer.innerHTML = newTags.map((t) => `<span>${t}</span>`).join('');
        }

        // Keep topbar + Personal Information section in sync
        const topbarName = $('.teacher-profile h6');
        if (topbarName) topbarName.textContent = newName;

        const fullNameInput = $$('.form-label').find((l) => l.textContent.trim() === 'Full Name')
          ?.parentElement?.querySelector('input');
        if (fullNameInput) fullNameInput.value = newName;

        Storage.set('eduverse_teacher_identity', { name: newName, title: newTitle, tags: newTags });

        bootstrap.Modal.getInstance(modalEl).hide();
        toast('Profile updated successfully.', 'success');
      });
    });
  }

  function restoreIdentity() {
    const saved = Storage.get('eduverse_teacher_identity', null);
    if (!saved) return;

    const nameEl = $('.profile-info h2');
    const titleEl = $('.profile-info p');
    const tagsContainer = $('.profile-tags');
    const topbarName = $('.teacher-profile h6');

    if (nameEl) nameEl.textContent = saved.name;
    if (titleEl) titleEl.textContent = saved.title;
    if (tagsContainer && Array.isArray(saved.tags)) {
      tagsContainer.innerHTML = saved.tags.map((t) => `<span>${t}</span>`).join('');
    }
    if (topbarName) topbarName.textContent = saved.name;
  }

  /* ------------------------------------------------------------------------
     6. PERSONAL INFORMATION — inline edit with Save / Discard bar
     ------------------------------------------------------------------------ */

  function initPersonalInfoForm() {
    const heading = $$('.card-header-custom h4').find((h) => h.textContent.trim() === 'Personal Information');
    const card = heading?.closest('.dashboard-card');
    if (!card) return;

    const inputs = $$('input.form-control', card);
    if (inputs.length === 0) return;

    const originalValues = inputs.map((i) => i.value);

    let saveBar = null;

    function showSaveBar() {
      if (saveBar) return;
      saveBar = document.createElement('div');
      saveBar.className = 'd-flex justify-content-end gap-2 mt-3';
      saveBar.innerHTML = `
        <button class="btn btn-outline-secondary btn-sm" id="discardPersonalInfoBtn">Discard</button>
        <button class="btn btn-primary btn-sm" id="savePersonalInfoBtn">Save Changes</button>`;
      card.appendChild(saveBar);

      $('#savePersonalInfoBtn', saveBar).addEventListener('click', () => {
        inputs.forEach((input, i) => (originalValues[i] = input.value));

        Storage.set(
          'eduverse_teacher_personal_info',
          inputs.map((i) => i.value)
        );

        // Sync full name across the page
        const fullNameLabel = $$('.form-label', card).find((l) => l.textContent.trim() === 'Full Name');
        const fullNameInput = fullNameLabel?.parentElement?.querySelector('input');
        if (fullNameInput) {
          const nameEl = $('.profile-info h2');
          const topbarName = $('.teacher-profile h6');
          if (nameEl) nameEl.textContent = fullNameInput.value;
          if (topbarName) topbarName.textContent = fullNameInput.value;
        }

        toast('Personal information saved.', 'success');
        saveBar.remove();
        saveBar = null;
      });

      $('#discardPersonalInfoBtn', saveBar).addEventListener('click', () => {
        inputs.forEach((input, i) => (input.value = originalValues[i]));
        saveBar.remove();
        saveBar = null;
      });
    }

    inputs.forEach((input) => {
      input.addEventListener('input', showSaveBar);
    });
  }

  function restorePersonalInfo() {
    const saved = Storage.get('eduverse_teacher_personal_info', null);
    if (!saved) return;

    const heading = $$('.card-header-custom h4').find((h) => h.textContent.trim() === 'Personal Information');
    const card = heading?.closest('.dashboard-card');
    if (!card) return;

    const inputs = $$('input.form-control', card);
    inputs.forEach((input, i) => {
      if (saved[i] !== undefined) input.value = saved[i];
    });
  }

  /* ------------------------------------------------------------------------
     7. TEACHING SKILLS — click to remove, "+" chip to add
     ------------------------------------------------------------------------ */

  function initSkills() {
    const container = $('.skills-container');
    if (!container) return;

    function attachRemoveHandler(chip) {
      chip.style.cursor = 'pointer';
      chip.title = 'Click to remove';
      chip.addEventListener('click', () => {
        const name = chip.textContent.trim();
        chip.remove();
        persistSkills();
        toast(`Removed "${name}" from your skills.`, 'primary');
      });
    }

    function persistSkills() {
      const skills = $$('.skills-container span:not(.add-skill-chip)').map((s) => s.textContent.trim());
      Storage.set('eduverse_teacher_skills', skills);
    }

    function addSkillChip(name) {
      const chip = document.createElement('span');
      chip.textContent = name;
      attachRemoveHandler(chip);
      container.insertBefore(chip, addChip);
      persistSkills();
    }

    // Attach remove behavior to existing chips
    $$('span', container).forEach(attachRemoveHandler);

    // "+" chip to add a new skill
    const addChip = document.createElement('span');
    addChip.className = 'add-skill-chip';
    addChip.innerHTML = '<i class="fa-solid fa-plus"></i> Add Skill';
    addChip.style.cursor = 'pointer';
    addChip.style.border = '1px dashed currentColor';
    addChip.style.opacity = '0.8';
    container.appendChild(addChip);

    addChip.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Skill name';
      input.className = 'form-control form-control-sm d-inline-block';
      input.style.width = '140px';
      container.insertBefore(input, addChip);
      input.focus();

      function commit() {
        const value = input.value.trim();
        input.remove();
        if (value) addSkillChip(value);
      }

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') input.remove();
      });
      input.addEventListener('blur', commit);
    });
  }

  function restoreSkills() {
    const saved = Storage.get('eduverse_teacher_skills', null);
    const container = $('.skills-container');
    if (!saved || !container) return;

    container.innerHTML = '';
    saved.forEach((name) => {
      const chip = document.createElement('span');
      chip.textContent = name;
      container.appendChild(chip);
    });
  }

  /* ------------------------------------------------------------------------
     8. SECURITY SETTINGS — Change Password + Two-Factor Authentication
     ------------------------------------------------------------------------ */

  function initSecurity() {
    const securityItems = $$('.security-item');
    if (securityItems.length === 0) return;

    // Change Password
    const passwordItem = securityItems.find((item) => item.querySelector('h6')?.textContent.trim() === 'Password');
    const changePwBtn = passwordItem?.querySelector('button');

    if (changePwBtn) {
      changePwBtn.addEventListener('click', () => {
        const { modalEl } = showModal(
          'changePasswordModal',
          '<i class="fa-solid fa-lock me-2"></i>Change Password',
          `
          <div class="mb-3">
            <label class="form-label">Current Password</label>
            <input type="password" class="form-control" id="currentPasswordInput">
          </div>
          <div class="mb-3">
            <label class="form-label">New Password</label>
            <input type="password" class="form-control" id="newPasswordInput">
          </div>
          <div class="mb-1">
            <label class="form-label">Confirm New Password</label>
            <input type="password" class="form-control" id="confirmPasswordInput">
          </div>
          <div id="passwordFormError" class="text-danger small mt-2" style="display:none;"></div>`,
          `
          <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button class="btn btn-primary" id="submitPasswordChangeBtn">Update Password</button>`
        );

        $('#submitPasswordChangeBtn', modalEl).addEventListener('click', () => {
          const current = $('#currentPasswordInput', modalEl).value;
          const next = $('#newPasswordInput', modalEl).value;
          const confirm = $('#confirmPasswordInput', modalEl).value;
          const errorEl = $('#passwordFormError', modalEl);

          function showError(msg) {
            errorEl.textContent = msg;
            errorEl.style.display = 'block';
          }

          if (!current || !next || !confirm) {
            showError('Please fill in all fields.');
            return;
          }
          if (next.length < 6) {
            showError('New password must be at least 6 characters.');
            return;
          }
          if (next !== confirm) {
            showError('New password and confirmation do not match.');
            return;
          }

          // Passwords are never persisted client-side; this is a UI-only simulation.
          const lastChangedEl = passwordItem.querySelector('p');
          if (lastChangedEl) lastChangedEl.textContent = 'Last changed just now';

          bootstrap.Modal.getInstance(modalEl).hide();
          toast('Password updated successfully.', 'success');
        });
      });
    }

    // Two-Factor Authentication toggle
    const twoFAItem = securityItems.find(
      (item) => item.querySelector('h6')?.textContent.trim() === 'Two Factor Authentication'
    );
    const twoFAToggle = twoFAItem?.querySelector('input[type="checkbox"]');

    if (twoFAToggle) {
      twoFAToggle.checked = Storage.get('eduverse_2fa_enabled', false);
      twoFAToggle.addEventListener('change', () => {
        Storage.set('eduverse_2fa_enabled', twoFAToggle.checked);
        toast(
          twoFAToggle.checked
            ? 'Two-factor authentication enabled.'
            : 'Two-factor authentication disabled.',
          twoFAToggle.checked ? 'success' : 'warning'
        );
      });
    }
  }

  /* ------------------------------------------------------------------------
     9. NOTIFICATION PREFERENCES
     ------------------------------------------------------------------------ */

  function initNotificationPreferences() {
    const items = $$('.notification-item');
    if (items.length === 0) return;

    const saved = Storage.get('eduverse_notification_prefs', {});

    items.forEach((item) => {
      const label = item.querySelector('span')?.textContent.trim() || '';
      const toggle = item.querySelector('input[type="checkbox"]');
      if (!toggle) return;

      if (label in saved) {
        toggle.checked = saved[label];
      }

      toggle.addEventListener('change', () => {
        const prefs = Storage.get('eduverse_notification_prefs', {});
        prefs[label] = toggle.checked;
        Storage.set('eduverse_notification_prefs', prefs);
        toast(`${label} notifications ${toggle.checked ? 'enabled' : 'disabled'}.`, 'primary');
      });
    });
  }

  /* ------------------------------------------------------------------------
     10. SOCIAL LINKS — set a URL once, then click opens it
     ------------------------------------------------------------------------ */

  function initSocialLinks() {
    const links = $$('.social-links a');
    if (links.length === 0) return;

    const saved = Storage.get('eduverse_social_links', {});

    links.forEach((link) => {
      const platform = link.textContent.trim();
      if (saved[platform]) {
        link.href = saved[platform];
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }

      link.addEventListener('click', (e) => {
        const current = Storage.get('eduverse_social_links', {})[platform];
        if (current) return; // real link already set — let the browser follow it

        e.preventDefault();

        const { modalEl } = showModal(
          'socialLinkModal',
          `Add your ${platform} URL`,
          `
          <div class="mb-1">
            <label class="form-label">${platform} Profile URL</label>
            <input type="url" class="form-control" id="socialUrlInput" placeholder="https://...">
          </div>`,
          `
          <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button class="btn btn-primary" id="saveSocialUrlBtn">Save</button>`
        );

        $('#saveSocialUrlBtn', modalEl).addEventListener('click', () => {
          const url = $('#socialUrlInput', modalEl).value.trim();
          if (!url) {
            toast('Please enter a valid URL.', 'danger');
            return;
          }

          const links2 = Storage.get('eduverse_social_links', {});
          links2[platform] = url;
          Storage.set('eduverse_social_links', links2);

          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';

          bootstrap.Modal.getInstance(modalEl).hide();
          toast(`${platform} link saved.`, 'success');
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
     11. ACCOUNT ACTIVITY — click an active session to sign it out
     ------------------------------------------------------------------------ */

  function initAccountActivity() {
    const rows = $$('.activity-row');
    if (rows.length === 0) return;

    rows.forEach((row) => {
      const badge = row.querySelector('.badge');
      if (!badge || !badge.classList.contains('bg-success')) return; // only "Active" sessions are actionable

      badge.style.cursor = 'pointer';
      badge.title = 'Click to sign out this device';

      badge.addEventListener('click', () => {
        const deviceName = row.querySelector('h6')?.textContent.trim() || 'this device';

        const { modalEl } = showModal(
          'signOutModal',
          '<i class="fa-solid fa-right-from-bracket me-2"></i>Sign Out Device',
          `<p class="mb-0">Are you sure you want to sign out <strong>${deviceName}</strong>?</p>`,
          `
          <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button class="btn btn-danger" id="confirmSignOutBtn">Sign Out</button>`
        );

        $('#confirmSignOutBtn', modalEl).addEventListener('click', () => {
          badge.textContent = 'Signed Out';
          badge.classList.remove('bg-success');
          badge.classList.add('bg-secondary');
          badge.style.cursor = 'default';
          bootstrap.Modal.getInstance(modalEl).hide();
          toast(`${deviceName} has been signed out.`, 'warning');
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
     INIT — DOM READY
     ------------------------------------------------------------------------ */

  document.addEventListener('DOMContentLoaded', () => {
    restoreAvatar();
    restoreIdentity();
    restorePersonalInfo();
    restoreSkills();

    initSidebarToggle();
    initTopNotifications();
    initSearch();
    initAvatarUpload();
    initEditProfile();
    initPersonalInfoForm();
    initSkills();
    initSecurity();
    initNotificationPreferences();
    initSocialLinks();
    initAccountActivity();
  });
})();