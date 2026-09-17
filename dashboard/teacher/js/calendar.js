/* ==========================================================================
   EduVerse | Academic Calendar
   calendar.js
   Fully functional month-view calendar with events, persistence,
   search, and category filtering. Vanilla JS + Bootstrap 5 (already
   loaded on the page).
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     0. UTILITIES
     ------------------------------------------------------------------------ */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const STORAGE_KEY = 'eduverse_calendar_events';
  const DARK_KEY = 'eduverse_dark_mode';

  const CATEGORY_COLORS = {
    'Live Class': '#4361ee',
    Assignment: '#f77f00',
    Exam: '#d90429',
    Quiz: '#2a9d8f',
    Other: '#8d99ae'
  };

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  function uid() {
    return 'evt_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  }

  function pad(n) {
    return n.toString().padStart(2, '0');
  }

  function dateKey(year, month, day) {
    return `${year}-${pad(month + 1)}-${pad(day)}`;
  }

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

  const Store = {
    get() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },
    set(events) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      } catch (e) {
        /* storage unavailable - fail silently */
      }
    }
  };

  /* ------------------------------------------------------------------------
     1. SEED DATA (used only the very first time, so the calendar isn't empty)
     ------------------------------------------------------------------------ */

  function seedEvents() {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    return [
      {
        id: uid(),
        title: 'Web Development Live Class',
        category: 'Live Class',
        date: dateKey(y, m, Math.min(now.getDate() + 1, 28)),
        time: '19:00',
        notes: 'Topic: Flexbox & Grid layouts'
      },
      {
        id: uid(),
        title: 'Portfolio Website Due',
        category: 'Assignment',
        date: dateKey(y, m, Math.min(now.getDate() + 3, 28)),
        time: '23:59',
        notes: 'Submit via the Assignments tab'
      },
      {
        id: uid(),
        title: 'JavaScript Quiz',
        category: 'Quiz',
        date: dateKey(y, m, Math.min(now.getDate() + 5, 28)),
        time: '10:00',
        notes: '30 MCQs, 20 minutes'
      },
      {
        id: uid(),
        title: 'Mid-Term Exam - Python',
        category: 'Exam',
        date: dateKey(y, m, Math.min(now.getDate() + 9, 28)),
        time: '09:00',
        notes: 'Covers chapters 1-6'
      }
    ];
  }

  /* ------------------------------------------------------------------------
     2. STATE
     ------------------------------------------------------------------------ */

  const state = {
    events: Store.get() || seedEvents(),
    viewYear: new Date().getFullYear(),
    viewMonth: new Date().getMonth(),
    selectedDate: dateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
    searchTerm: ''
  };

  if (!Store.get()) Store.set(state.events);

  function saveEvents() {
    Store.set(state.events);
  }

  /* ------------------------------------------------------------------------
     3. MODAL HELPERS
     ------------------------------------------------------------------------ */

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
     4. RENDER: CALENDAR GRID
     ------------------------------------------------------------------------ */

  function getEventsForDate(dk) {
    return state.events
      .filter((e) => e.date === dk)
      .filter((e) =>
        state.searchTerm
          ? e.title.toLowerCase().includes(state.searchTerm) ||
            e.category.toLowerCase().includes(state.searchTerm)
          : true
      )
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }

  function renderCalendar() {
    const grid = $('#calendarGrid');
    const label = $('#currentMonthLabel');
    if (!grid || !label) return;

    label.textContent = `${MONTH_NAMES[state.viewMonth]} ${state.viewYear}`;

    grid.innerHTML = '';

    const firstOfMonth = new Date(state.viewYear, state.viewMonth, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(state.viewYear, state.viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(state.viewYear, state.viewMonth, 0).getDate();

    const todayKey = dateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div');
      let cellYear = state.viewYear;
      let cellMonth = state.viewMonth;
      let cellDay;
      let otherMonth = false;

      if (i < startWeekday) {
        cellDay = daysInPrevMonth - startWeekday + i + 1;
        cellMonth -= 1;
        if (cellMonth < 0) { cellMonth = 11; cellYear -= 1; }
        otherMonth = true;
      } else if (i >= startWeekday + daysInMonth) {
        cellDay = i - (startWeekday + daysInMonth) + 1;
        cellMonth += 1;
        if (cellMonth > 11) { cellMonth = 0; cellYear += 1; }
        otherMonth = true;
      } else {
        cellDay = i - startWeekday + 1;
      }

      const cellKey = dateKey(cellYear, cellMonth, cellDay);

      cell.className = 'calendar-day';
      if (otherMonth) cell.classList.add('other-month');
      if (cellKey === todayKey) cell.classList.add('today');
      if (cellKey === state.selectedDate) cell.classList.add('selected');
      cell.dataset.date = cellKey;

      const dayEvents = getEventsForDate(cellKey);
      const visibleEvents = dayEvents.slice(0, 2);
      const extraCount = dayEvents.length - visibleEvents.length;

      cell.innerHTML = `
        <div class="day-number">${cellDay}</div>
        <div class="day-events">
          ${visibleEvents
            .map(
              (e) => `<div class="day-event-pill" style="background:${CATEGORY_COLORS[e.category] || '#8d99ae'}">${e.title}</div>`
            )
            .join('')}
          ${extraCount > 0 ? `<div class="day-event-more">+${extraCount} more</div>` : ''}
        </div>`;

      cell.addEventListener('click', () => {
        state.selectedDate = cellKey;
        if (otherMonth) {
          state.viewYear = cellYear;
          state.viewMonth = cellMonth;
        }
        renderCalendar();
        renderEventPanel();
      });

      cell.addEventListener('dblclick', () => openEventForm(cellKey));

      grid.appendChild(cell);
    }

    renderStats();
    renderMiniSummary();
  }

  /* ------------------------------------------------------------------------
     5. RENDER: SELECTED DAY / UPCOMING EVENTS PANEL
     ------------------------------------------------------------------------ */

  function formatFriendlyDate(dk) {
    const [y, m, d] = dk.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function renderEventPanel() {
    const panel = $('#eventListPanel');
    const label = $('#selectedDayLabel');
    if (!panel || !label) return;

    const todayKey = dateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const isToday = state.selectedDate === todayKey;

    label.textContent = isToday ? 'Today' : formatFriendlyDate(state.selectedDate);

    const events = getEventsForDate(state.selectedDate);

    if (events.length === 0) {
      panel.innerHTML = `
        <p class="text-muted mb-3">No events on this day.</p>
        <button class="btn btn-primary btn-sm" id="panelAddEventBtn">
          <i class="fa-solid fa-plus"></i> Add Event
        </button>`;
      $('#panelAddEventBtn', panel)?.addEventListener('click', () => openEventForm(state.selectedDate));
      return;
    }

    panel.innerHTML = events
      .map(
        (e) => `
      <div class="event-item" data-id="${e.id}">
        <div class="event-color-dot" style="background:${CATEGORY_COLORS[e.category] || '#8d99ae'}"></div>
        <div class="event-info">
          <div class="event-title">${e.title}</div>
          <div class="event-meta">${e.category} ${e.time ? '• ' + e.time : ''}</div>
          ${e.notes ? `<div class="event-meta">${e.notes}</div>` : ''}
        </div>
        <button class="event-delete" title="Delete event">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>`
      )
      .join('');

    $$('.event-item', panel).forEach((item) => {
      const id = item.dataset.id;
      item.querySelector('.event-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteEvent(id);
      });
      item.addEventListener('click', () => openEventForm(state.selectedDate, id));
    });
  }

  /* ------------------------------------------------------------------------
     6. RENDER: STATS + MINI SUMMARY
     ------------------------------------------------------------------------ */

  function renderStats() {
    const todayEl = $('#statToday');
    const quizzesEl = $('#statQuizzes');
    const assignmentsEl = $('#statAssignments');
    const classesEl = $('#statClasses');
    if (!todayEl) return;

    const today = new Date();
    todayEl.textContent = today.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    const monthEvents = state.events.filter((e) => {
      const [y, m] = e.date.split('-').map(Number);
      return y === state.viewYear && m - 1 === state.viewMonth;
    });

    quizzesEl.textContent = monthEvents.filter((e) => e.category === 'Quiz').length;
    assignmentsEl.textContent = monthEvents.filter((e) => e.category === 'Assignment').length;
    classesEl.textContent = monthEvents.filter((e) => e.category === 'Live Class').length;
  }

  function renderMiniSummary() {
    const container = $('#miniMonthSummary');
    if (!container) return;

    const monthEvents = state.events.filter((e) => {
      const [y, m] = e.date.split('-').map(Number);
      return y === state.viewYear && m - 1 === state.viewMonth;
    });

    const counts = {};
    Object.keys(CATEGORY_COLORS).forEach((cat) => (counts[cat] = 0));
    monthEvents.forEach((e) => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });

    container.innerHTML = Object.entries(counts)
      .map(
        ([cat, count]) => `
      <div class="mini-row">
        <span><i class="fa-solid fa-circle me-2" style="color:${CATEGORY_COLORS[cat]};font-size:0.6rem"></i>${cat}</span>
        <strong>${count}</strong>
      </div>`
      )
      .join('') + `
      <div class="mini-row border-0 pt-2">
        <span>Total this month</span>
        <strong>${monthEvents.length}</strong>
      </div>`;
  }

  /* ------------------------------------------------------------------------
     7. ADD / EDIT / DELETE EVENT
     ------------------------------------------------------------------------ */

  function openEventForm(dateStr, eventId = null) {
    const existing = eventId ? state.events.find((e) => e.id === eventId) : null;
    const isEdit = !!existing;

    const categoryOptions = Object.keys(CATEGORY_COLORS)
      .map(
        (cat) =>
          `<option value="${cat}" ${existing?.category === cat ? 'selected' : ''}>${cat}</option>`
      )
      .join('');

    const { modalEl } = showModal(
      'eventFormModal',
      `<i class="fa-solid ${isEdit ? 'fa-pen' : 'fa-plus'} me-2"></i>${isEdit ? 'Edit Event' : 'Add Event'}`,
      `
      <div class="mb-3">
        <label class="form-label">Title</label>
        <input type="text" class="form-control" id="eventTitleInput" value="${existing?.title || ''}" placeholder="e.g. Web Development Live Class">
      </div>
      <div class="row g-3">
        <div class="col-6">
          <label class="form-label">Date</label>
          <input type="date" class="form-control" id="eventDateInput" value="${existing?.date || dateStr}">
        </div>
        <div class="col-6">
          <label class="form-label">Time</label>
          <input type="time" class="form-control" id="eventTimeInput" value="${existing?.time || '09:00'}">
        </div>
      </div>
      <div class="mb-3 mt-3">
        <label class="form-label">Category</label>
        <select class="form-select" id="eventCategoryInput">${categoryOptions}</select>
      </div>
      <div class="mb-1">
        <label class="form-label">Notes (optional)</label>
        <textarea class="form-control" id="eventNotesInput" rows="2">${existing?.notes || ''}</textarea>
      </div>`,
      `
      ${isEdit ? '<button class="btn btn-outline-danger me-auto" id="deleteEventFormBtn">Delete</button>' : ''}
      <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
      <button class="btn btn-primary" id="saveEventBtn">${isEdit ? 'Save Changes' : 'Add Event'}</button>`
    );

    $('#saveEventBtn', modalEl).addEventListener('click', () => {
      const title = $('#eventTitleInput', modalEl).value.trim();
      const date = $('#eventDateInput', modalEl).value;
      const time = $('#eventTimeInput', modalEl).value;
      const category = $('#eventCategoryInput', modalEl).value;
      const notes = $('#eventNotesInput', modalEl).value.trim();

      if (!title || !date) {
        toast('Please fill in at least a title and date.', 'danger');
        return;
      }

      if (isEdit) {
        Object.assign(existing, { title, date, time, category, notes });
        toast('Event updated.', 'success');
      } else {
        state.events.push({ id: uid(), title, date, time, category, notes });
        toast('Event added to calendar.', 'success');
      }

      saveEvents();
      const [y, m] = date.split('-').map(Number);
      state.viewYear = y;
      state.viewMonth = m - 1;
      state.selectedDate = date;

      bootstrap.Modal.getInstance(modalEl).hide();
      renderCalendar();
      renderEventPanel();
    });

    if (isEdit) {
      $('#deleteEventFormBtn', modalEl).addEventListener('click', () => {
        bootstrap.Modal.getInstance(modalEl).hide();
        deleteEvent(existing.id);
      });
    }
  }

  function deleteEvent(id) {
    state.events = state.events.filter((e) => e.id !== id);
    saveEvents();
    renderCalendar();
    renderEventPanel();
    toast('Event deleted.', 'primary');
  }

  /* ------------------------------------------------------------------------
     8. TOOLBAR CONTROLS
     ------------------------------------------------------------------------ */

  function initToolbar() {
    $('#prevMonthBtn')?.addEventListener('click', () => {
      state.viewMonth -= 1;
      if (state.viewMonth < 0) { state.viewMonth = 11; state.viewYear -= 1; }
      renderCalendar();
    });

    $('#nextMonthBtn')?.addEventListener('click', () => {
      state.viewMonth += 1;
      if (state.viewMonth > 11) { state.viewMonth = 0; state.viewYear += 1; }
      renderCalendar();
    });

    $('#todayBtn')?.addEventListener('click', () => {
      const now = new Date();
      state.viewYear = now.getFullYear();
      state.viewMonth = now.getMonth();
      state.selectedDate = dateKey(now.getFullYear(), now.getMonth(), now.getDate());
      renderCalendar();
      renderEventPanel();
    });

    $('#addEventBtn')?.addEventListener('click', () => openEventForm(state.selectedDate));
  }

  /* ------------------------------------------------------------------------
     9. SEARCH
     ------------------------------------------------------------------------ */

  function initSearch() {
    const input = $('#eventSearchInput');
    if (!input) return;

    input.addEventListener('input', () => {
      state.searchTerm = input.value.trim().toLowerCase();
      renderCalendar();
      renderEventPanel();
    });
  }

  /* ------------------------------------------------------------------------
     10. SIDEBAR TOGGLE + DARK MODE (kept in sync with student.js behavior)
     ------------------------------------------------------------------------ */

  /* FIX: previously toggled '.wrapper' -> 'sidebar-collapsed' and
     '.sidebar' -> 'show', neither of which style.css defines. The
     corrected HTML uses '.dashboard-wrapper' + '.sidebar', and
     style.css's mobile breakpoint expects '.sidebar.active' — so the
     toggle now uses that class to match the working dashboard.html
     behavior. */
  function initSidebarToggle() {
    const menuBtn = $('#menuBtn');
    const sidebar = $('.sidebar');
    if (!menuBtn || !sidebar) return;

    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      const isMobile = window.innerWidth <= 992;
      if (!isMobile) return;
      if (
        sidebar.classList.contains('active') &&
        !sidebar.contains(e.target) &&
        e.target !== menuBtn &&
        !menuBtn.contains(e.target)
      ) {
        sidebar.classList.remove('active');
      }
    });
  }

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

    let saved = false;
    try {
      saved = JSON.parse(localStorage.getItem(DARK_KEY)) || false;
    } catch (e) {
      saved = false;
    }
    applyTheme(saved);

    darkModeBtn.addEventListener('click', () => {
      const isDark = !document.body.classList.contains('dark-mode');
      applyTheme(isDark);
      try {
        localStorage.setItem(DARK_KEY, JSON.stringify(isDark));
      } catch (e) {
        /* ignore */
      }
    });
  }

  /* ------------------------------------------------------------------------
     INIT — DOM READY
     ------------------------------------------------------------------------ */

  document.addEventListener('DOMContentLoaded', () => {
    initSidebarToggle();
    initDarkMode();
    initToolbar();
    initSearch();
    renderCalendar();
    renderEventPanel();
  });
})();