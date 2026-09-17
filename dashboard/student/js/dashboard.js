/* ==========================================================
   EDUVERSE — STUDENT DASHBOARD JS
   Vanilla ES6, no framework, LocalStorage-backed dummy data.
   No teacher-authority actions are exposed from this file.
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initSidebarToggle();
    initActiveNavLink();
    seedDummyData();
    animateStatCounters();
    initProgressChart();
    document.getElementById("progressFilter")
        ?.addEventListener("change", (e) => {
            renderProgressChart(e.target.value);
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

    const currentPage = window.location.pathname.split("/").pop() || "dashboard.html";
    const navItems = document.querySelectorAll(".sidebar-menu ul li");

    navItems.forEach((li) => {
        const link = li.querySelector("a");
        if (!link) return;

        const href = link.getAttribute("href");
        li.classList.toggle("active", href === currentPage);
    });

}


/* ==========================================================
   DUMMY DATA SEEDING (LocalStorage)
   Keeps this student's own data only — no other students'
   private information is stored or exposed.
========================================================== */

function seedDummyData() {

    if (localStorage.getItem("eduverse_student_progress")) return;

    const progressData = {
        thisMonth: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            quizScores: [72, 78, 85, 90],
            assignmentScores: [68, 75, 80, 88]
        },
        lastMonth: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            quizScores: [60, 65, 70, 74],
            assignmentScores: [58, 62, 66, 70]
        },
        thisYear: {
            labels: ["Jan", "Mar", "May", "Jul", "Aug"],
            quizScores: [55, 62, 70, 80, 90],
            assignmentScores: [50, 58, 65, 76, 88]
        }
    };

    localStorage.setItem("eduverse_student_progress", JSON.stringify(progressData));

}


/* ==========================================================
   STAT CARD COUNT-UP ANIMATION
========================================================== */

function animateStatCounters() {

    const counters = [
        { id: "statEnrolledCourses", value: 8, suffix: "" },
        { id: "statCompletedCourses", value: 5, suffix: "" },
        { id: "statLecturesWatched", value: 84, suffix: "" },
        { id: "statAssignmentsDue", value: 6, suffix: "" },
        { id: "statOverallGrade", value: 92, suffix: "%" }
    ];

    counters.forEach(({ id, value, suffix }) => {

        const el = document.getElementById(id);
        if (!el) return;

        let current = 0;
        const step = Math.max(1, Math.round(value / 30));

        const timer = setInterval(() => {
            current += step;

            if (current >= value) {
                current = value;
                clearInterval(timer);
            }

            el.textContent = current + suffix;

        }, 20);

    });

}


/* ==========================================================
   MY PROGRESS CHART (Chart.js)
========================================================== */

let progressChartInstance = null;

function initProgressChart() {
    renderProgressChart("This Month");
}

function renderProgressChart(rangeLabel) {

    const canvas = document.getElementById("progressChart");
    if (!canvas) return;

    const store = JSON.parse(localStorage.getItem("eduverse_student_progress") || "{}");

    const rangeKeyMap = {
        "This Month": "thisMonth",
        "Last Month": "lastMonth",
        "This Year": "thisYear"
    };

    const dataset = store[rangeKeyMap[rangeLabel] || "thisMonth"];
    if (!dataset) return;

    if (progressChartInstance) {
        progressChartInstance.destroy();
    }

    progressChartInstance = new Chart(canvas, {
        type: "line",
        data: {
            labels: dataset.labels,
            datasets: [
                {
                    label: "Quiz Scores",
                    data: dataset.quizScores,
                    borderColor: "#7c3aed",
                    backgroundColor: "rgba(124, 58, 237, 0.1)",
                    tension: 0.4,
                    fill: true
                },
                {
                    label: "Assignment Scores",
                    data: dataset.assignmentScores,
                    borderColor: "#2563eb",
                    backgroundColor: "rgba(37, 99, 235, 0.1)",
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom"
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

}