(function () {
    'use strict';

    const STORAGE_KEY = 'eduverse_calendar_events';
    const DARK_MODE_KEY = 'eduverse_dark_mode';

    const CATEGORY_COLORS = {
        'Live Class': '#4361ee',
        'Assignment': '#f77f00',
        'Exam': '#d90429',
        'Quiz': '#2a9d8f',
        'Other': '#8d99ae'
    };

    const MONTH_NAMES = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    const state = {
        currentDate: new Date(),
        selectedDate: new Date(),
        events: [],
        searchTerm: ''
    };

    function getDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    function escapeHTML(value) {
        if (value === null || value === undefined) {
            return '';
        }

        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function loadEvents() {
        try {
            const savedEvents = localStorage.getItem(STORAGE_KEY);

            if (!savedEvents) {
                return [];
            }

            const parsedEvents = JSON.parse(savedEvents);

            return Array.isArray(parsedEvents) ? parsedEvents : [];
        } catch (error) {
            console.error('Unable to load calendar events:', error);
            return [];
        }
    }

    function getFilteredEvents() {
        if (!state.searchTerm) {
            return state.events;
        }

        const search = state.searchTerm.toLowerCase();

        return state.events.filter(function (event) {
            return (
                String(event.title || '').toLowerCase().includes(search) ||
                String(event.category || '').toLowerCase().includes(search) ||
                String(event.description || '').toLowerCase().includes(search) ||
                String(event.notes || '').toLowerCase().includes(search)
            );
        });
    }

    function getEventsForDate(date) {
        const dateKey = getDateKey(date);

        return getFilteredEvents()
            .filter(function (event) {
                return event.date === dateKey;
            })
            .sort(function (a, b) {
                return String(a.time || '').localeCompare(String(b.time || ''));
            });
    }

    function renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonthLabel = document.getElementById('currentMonthLabel');

        if (!calendarGrid || !currentMonthLabel) {
            return;
        }

        const year = state.currentDate.getFullYear();
        const month = state.currentDate.getMonth();

        currentMonthLabel.textContent = `${MONTH_NAMES[month]} ${year}`;

        calendarGrid.innerHTML = '';

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const previousMonthDays = new Date(year, month, 0).getDate();

        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

        for (let i = 0; i < totalCells; i++) {
            let dayNumber;
            let cellDate;
            let isOtherMonth = false;

            if (i < firstDay) {
                dayNumber = previousMonthDays - firstDay + i + 1;
                cellDate = new Date(year, month - 1, dayNumber);
                isOtherMonth = true;
            } else if (i >= firstDay + daysInMonth) {
                dayNumber = i - (firstDay + daysInMonth) + 1;
                cellDate = new Date(year, month + 1, dayNumber);
                isOtherMonth = true;
            } else {
                dayNumber = i - firstDay + 1;
                cellDate = new Date(year, month, dayNumber);
            }

            const cell = document.createElement('div');

            cell.className = 'calendar-day';

            if (isOtherMonth) {
                cell.classList.add('other-month');
            }

            const today = new Date();

            if (getDateKey(cellDate) === getDateKey(today)) {
                cell.classList.add('today');
            }

            if (getDateKey(cellDate) === getDateKey(state.selectedDate)) {
                cell.classList.add('selected');
            }

            const dayEvents = getEventsForDate(cellDate);

            let eventHTML = '';

            dayEvents.slice(0, 3).forEach(function (event) {
                const color = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.Other;

                eventHTML += `
                    <div class="calendar-event"
                         style="border-left: 3px solid ${color};">
                        <span>${escapeHTML(event.title)}</span>
                    </div>
                `;
            });

            if (dayEvents.length > 3) {
                eventHTML += `
                    <div class="more-events">
                        +${dayEvents.length - 3} more
                    </div>
                `;
            }

            cell.innerHTML = `
                <div class="day-number">${dayNumber}</div>
                <div class="day-events">
                    ${eventHTML}
                </div>
            `;

            cell.addEventListener('click', function () {
                state.selectedDate = cellDate;

                renderCalendar();
                renderSelectedDay();
            });

            calendarGrid.appendChild(cell);
        }

        renderStatistics();
        renderMiniSummary();
    }

    function renderSelectedDay() {
        const selectedDayLabel = document.getElementById('selectedDayLabel');
        const eventListPanel = document.getElementById('eventListPanel');

        if (!selectedDayLabel || !eventListPanel) {
            return;
        }

        const selectedDate = state.selectedDate;

        selectedDayLabel.textContent = selectedDate.toLocaleDateString(
            'en-US',
            {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            }
        );

        const events = getEventsForDate(selectedDate);

        if (events.length === 0) {
            eventListPanel.innerHTML = `
                <div class="empty-events">
                    <i class="fas fa-calendar-check"></i>
                    <p>No academic events for this day.</p>
                </div>
            `;

            return;
        }

        eventListPanel.innerHTML = events.map(function (event) {
            const color =
                CATEGORY_COLORS[event.category] || CATEGORY_COLORS.Other;

            return `
                <div class="event-item">
                    <div class="event-color"
                         style="background: ${color};"></div>

                    <div class="event-content">
                        <h4>${escapeHTML(event.title)}</h4>

                        <div class="event-meta">
                            <span>
                                <i class="fas fa-clock"></i>
                                ${escapeHTML(event.time || 'Time not specified')}
                            </span>

                            <span>
                                <i class="fas fa-tag"></i>
                                ${escapeHTML(event.category || 'Other')}
                            </span>
                        </div>

                        ${
                            event.description || event.notes
                                ? `
                                    <p>
                                        ${escapeHTML(
                                            event.description || event.notes
                                        )}
                                    </p>
                                `
                                : ''
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderStatistics() {
        const statToday = document.getElementById('statToday');
        const statQuizzes = document.getElementById('statQuizzes');
        const statAssignments = document.getElementById('statAssignments');
        const statClasses = document.getElementById('statClasses');

        if (!statToday) {
            return;
        }

        const year = state.currentDate.getFullYear();
        const month = state.currentDate.getMonth();

        const monthEvents = getFilteredEvents().filter(function (event) {
            const eventDate = new Date(event.date + 'T00:00:00');

            return (
                eventDate.getFullYear() === year &&
                eventDate.getMonth() === month
            );
        });

        const todayKey = getDateKey(new Date());

        const todayEvents = getFilteredEvents().filter(function (event) {
            return event.date === todayKey;
        });

        const quizzes = monthEvents.filter(function (event) {
            return event.category === 'Quiz';
        });

        const assignments = monthEvents.filter(function (event) {
            return event.category === 'Assignment';
        });

        const classes = monthEvents.filter(function (event) {
            return event.category === 'Live Class';
        });

        statToday.textContent = todayEvents.length;

        if (statQuizzes) {
            statQuizzes.textContent = quizzes.length;
        }

        if (statAssignments) {
            statAssignments.textContent = assignments.length;
        }

        if (statClasses) {
            statClasses.textContent = classes.length;
        }
    }

    function renderMiniSummary() {
        const miniMonthSummary = document.getElementById('miniMonthSummary');

        if (!miniMonthSummary) {
            return;
        }

        const year = state.currentDate.getFullYear();
        const month = state.currentDate.getMonth();

        const monthEvents = getFilteredEvents().filter(function (event) {
            const eventDate = new Date(event.date + 'T00:00:00');

            return (
                eventDate.getFullYear() === year &&
                eventDate.getMonth() === month
            );
        });

        miniMonthSummary.textContent =
            `${monthEvents.length} academic event${monthEvents.length === 1 ? '' : 's'} this month`;
    }

    function setupNavigation() {
        const prevMonthBtn = document.getElementById('prevMonthBtn');
        const nextMonthBtn = document.getElementById('nextMonthBtn');
        const todayBtn = document.getElementById('todayBtn');

        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', function () {
                state.currentDate.setMonth(
                    state.currentDate.getMonth() - 1
                );

                renderCalendar();
            });
        }

        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', function () {
                state.currentDate.setMonth(
                    state.currentDate.getMonth() + 1
                );

                renderCalendar();
            });
        }

        if (todayBtn) {
            todayBtn.addEventListener('click', function () {
                const today = new Date();

                state.currentDate = new Date(today);
                state.selectedDate = new Date(today);

                renderCalendar();
                renderSelectedDay();
            });
        }
    }

    function setupSearch() {
        const eventSearchInput =
            document.getElementById('eventSearchInput');

        if (!eventSearchInput) {
            return;
        }

        eventSearchInput.addEventListener('input', function () {
            state.searchTerm = eventSearchInput.value.trim();

            renderCalendar();
            renderSelectedDay();
        });
    }

    function setupSidebar() {
        const menuBtn = document.getElementById('menuBtn');
        const sidebar = document.querySelector('.sidebar');

        if (!menuBtn || !sidebar) {
            return;
        }

        menuBtn.addEventListener('click', function () {
            sidebar.classList.toggle('active');
        });

        document.addEventListener('click', function (event) {
            if (!(event.target instanceof Node)) {
                return;
            }

            if (
                !sidebar.contains(event.target) &&
                !menuBtn.contains(event.target)
            ) {
                sidebar.classList.remove('active');
            }
        });
    }

    function setupDarkMode() {
        const darkModeBtn = document.getElementById('darkModeBtn');

        if (!darkModeBtn) {
            return;
        }

        const savedMode = localStorage.getItem(DARK_MODE_KEY);

        if (savedMode === 'enabled') {
            document.body.classList.add('dark-mode');
        }

        darkModeBtn.addEventListener('click', function () {
            document.body.classList.toggle('dark-mode');

            const enabled =
                document.body.classList.contains('dark-mode');

            localStorage.setItem(
                DARK_MODE_KEY,
                enabled ? 'enabled' : 'disabled'
            );
        });
    }

    function initialize() {
        state.events = loadEvents();

        setupNavigation();
        setupSearch();
        setupSidebar();
        setupDarkMode();

        renderCalendar();
        renderSelectedDay();
    }

    document.addEventListener('DOMContentLoaded', initialize);

})();