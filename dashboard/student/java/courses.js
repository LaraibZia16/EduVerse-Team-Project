/* ==========================================================
   EDUVERSE — STUDENT "MY COURSES" JS
   Vanilla ES6, LocalStorage-backed dummy data.
   No course create/edit/delete logic — student actions only:
   search, filter, sort, enroll, continue learning.
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initSidebarToggle();
    initActiveNavLink();
    seedEnrollmentState();
    applyEnrollmentStateToDOM();
    updateSummaryCounts();

    initCourseSearch();
    initStatusFilter();
    initSortSelect();
    initEnrollButtons();

    document.getElementById("browseCoursesBtn")
        ?.addEventListener("click", () => {
            const filterEl = document.getElementById("courseStatusFilter");
            if (filterEl) {
                filterEl.value = "not-enrolled";
                filterCourses();
            }
        });

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

    const currentPage = window.location.pathname.split("/").pop() || "courses.html";
    const navItems = document.querySelectorAll(".sidebar-menu ul li");

    navItems.forEach((li) => {
        const link = li.querySelector("a");
        if (!link) return;

        const href = link.getAttribute("href");
        li.classList.toggle("active", href === currentPage);
    });

}


/* ==========================================================
   ENROLLMENT STATE (LocalStorage)
   Tracks only this student's own enrollment status per course.
========================================================== */

function seedEnrollmentState() {

    if (localStorage.getItem("eduverse_course_enrollment")) return;

    const cols = document.querySelectorAll(".course-col");
    const state = {};

    cols.forEach((col) => {
        const name = col.dataset.name;
        const status = col.dataset.status;
        state[name] = status;
    });

    localStorage.setItem("eduverse_course_enrollment", JSON.stringify(state));

}

function getEnrollmentState() {
    return JSON.parse(localStorage.getItem("eduverse_course_enrollment") || "{}");
}

function saveEnrollmentState(state) {
    localStorage.setItem("eduverse_course_enrollment", JSON.stringify(state));
}

function applyEnrollmentStateToDOM() {

    const state = getEnrollmentState();
    const cols = document.querySelectorAll(".course-col");

    cols.forEach((col) => {
        const name = col.dataset.name;
        if (state[name]) {
            col.dataset.status = state[name];
        }
    });

}


/* ==========================================================
   SUMMARY COUNTS
========================================================== */

function updateSummaryCounts() {

    const state = getEnrollmentState();
    const values = Object.values(state);

    const enrolledCount = values.filter(v => v === "enrolled").length;
    const completedCount = values.filter(v => v === "completed").length;

    const enrolledEl = document.getElementById("statEnrolled");
    const completedEl = document.getElementById("statCompleted");

    if (enrolledEl) enrolledEl.textContent = enrolledCount;
    if (completedEl) completedEl.textContent = completedCount;

}


/* ==========================================================
   SEARCH
========================================================== */

function initCourseSearch() {

    const input = document.getElementById("courseSearch");
    if (!input) return;

    input.addEventListener("input", filterCourses);

}


/* ==========================================================
   STATUS FILTER
========================================================== */

function initStatusFilter() {

    const select = document.getElementById("courseStatusFilter");
    if (!select) return;

    select.addEventListener("change", filterCourses);

}


/* ==========================================================
   COMBINED FILTER (search + status)
========================================================== */

function filterCourses() {

    const searchTerm = (document.getElementById("courseSearch")?.value || "").toLowerCase().trim();
    const statusValue = document.getElementById("courseStatusFilter")?.value || "all";

    const cols = document.querySelectorAll(".course-col");

    cols.forEach((col) => {

        const name = (col.dataset.name || "").toLowerCase();
        const status = col.dataset.status || "all";

        const matchesSearch = name.includes(searchTerm);
        const matchesStatus = statusValue === "all" || status === statusValue;

        col.style.display = (matchesSearch && matchesStatus) ? "" : "none";

    });

}


/* ==========================================================
   SORT
========================================================== */

function initSortSelect() {

    const select = document.getElementById("courseSortSelect");
    if (!select) return;

    select.addEventListener("change", () => {

        const grid = document.getElementById("coursesGrid");
        if (!grid) return;

        const cols = Array.from(grid.querySelectorAll(".course-col"));
        const sortValue = select.value;

        cols.sort((a, b) => {

            if (sortValue === "a-z") {
                return a.dataset.name.localeCompare(b.dataset.name);
            }

            if (sortValue === "oldest") {
                return cols.indexOf(a) < cols.indexOf(b) ? 1 : -1;
            }

            // "newest" — keep original DOM order
            return 0;

        });

        cols.forEach((col) => grid.appendChild(col));

    });

}


/* ==========================================================
   ENROLL BUTTONS
   Marks a course as "enrolled" for this student only.
   Does not create/modify course content — student-side only.
========================================================== */

function initEnrollButtons() {

    document.querySelectorAll(".enroll-btn").forEach((btn) => {

        btn.addEventListener("click", (e) => {

            const col = e.target.closest(".course-col");
            if (!col) return;

            const name = col.dataset.name;

            col.dataset.status = "enrolled";

            const badge = col.querySelector(".course-badge");
            if (badge) {
                badge.textContent = "Enrolled";
            }

            const state = getEnrollmentState();
            state[name] = "enrolled";
            saveEnrollmentState(state);

            btn.textContent = "Continue Learning";
            btn.classList.remove("enroll-btn");

            updateSummaryCounts();

        });

    });

}