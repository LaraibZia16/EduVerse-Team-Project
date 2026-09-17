/* ============================================================
   EDUVERSE TEACHER DASHBOARD — dashboard.js
   ------------------------------------------------------------
   This file makes your dashboard.html interactive.
   It is split into clearly labeled sections.
   Every section is independent — if one breaks, the rest still works.
============================================================ */


/* ------------------------------------------------------------
   WAIT FOR THE PAGE TO FULLY LOAD FIRST
   ------------------------------------------------------------
   "DOMContentLoaded" means "the HTML has finished loading".
   We put ALL our code inside this so we never try to grab
   an element before it exists on the page.
------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", function () {


  /* ============================================================
     SECTION 1: SIDEBAR TOGGLE (Mobile Menu)
     ------------------------------------------------------------
     What it does: clicking the hamburger button (.menu-toggle)
     slides the sidebar in/out on mobile screens.
     Your CSS already has ".sidebar.active { left:0; }" ready —
     we just need to ADD or REMOVE that "active" class.
  ============================================================ */

  const menuToggleBtn = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");

  if (menuToggleBtn && sidebar) {
    menuToggleBtn.addEventListener("click", function () {
      sidebar.classList.toggle("active");
    });

    // Bonus: if the user clicks anywhere OUTSIDE the sidebar
    // while it's open (on mobile), close it automatically.
    document.addEventListener("click", function (event) {
      const clickedInsideSidebar = sidebar.contains(event.target);
      const clickedToggleButton = menuToggleBtn.contains(event.target);

      if (
        sidebar.classList.contains("active") &&
        !clickedInsideSidebar &&
        !clickedToggleButton
      ) {
        sidebar.classList.remove("active");
      }
    });
  }


  /* ============================================================
     SECTION 2: STUDENT ANALYTICS CHART (Chart.js)
     ------------------------------------------------------------
     What it does: draws a line chart inside your empty
     <canvas id="studentChart"> using the Chart.js library
     you already linked in your HTML.
     It also reacts when the user changes the "This Month /
     Last Month / This Year" dropdown filter.
  ============================================================ */

  const chartCanvas = document.getElementById("studentChart");

  // Only run this code if the canvas actually exists on the page
  if (chartCanvas) {

    // Sample data for three time ranges.
    // Replace these numbers later with real data from your backend/database.
    const chartDataSets = {
      "This Month": {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        data: [320, 450, 400, 520]
      },
      "Last Month": {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        data: [280, 300, 350, 390]
      },
      "This Year": {
        labels: ["Jan", "Mar", "May", "Jul", "Sep", "Nov"],
        data: [900, 1050, 1180, 1220, 1260, 1284]
      }
    };

    // Draw the chart for the first time using "This Month" data
    const studentChart = new Chart(chartCanvas, {
      type: "line",
      data: {
        labels: chartDataSets["This Month"].labels,
        datasets: [
          {
            label: "New Students",
            data: chartDataSets["This Month"].data,
            borderColor: "#6C63FF",
            backgroundColor: "rgba(108,99,255,0.15)",
            borderWidth: 3,
            tension: 0.4,   // makes the line curved instead of sharp angles
            fill: true,
            pointBackgroundColor: "#6C63FF",
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    // Find the dropdown filter (This Month / Last Month / This Year)
    const analyticsFilter = document.querySelector(".analytics-filter");

    if (analyticsFilter) {
      analyticsFilter.addEventListener("change", function () {
        const selectedRange = analyticsFilter.value; // e.g. "This Month"
        const newData = chartDataSets[selectedRange];

        if (newData) {
          // Update the chart's labels and numbers, then redraw it
          studentChart.data.labels = newData.labels;
          studentChart.data.datasets[0].data = newData.data;
          studentChart.update();
        }
      });
    }
  }


  /* ============================================================
     SECTION 3: "CREATE COURSE" BUTTONS
     ------------------------------------------------------------
     What it does: both "Create Course" buttons (one in the
     welcome banner, one in the sidebar promo card) will take
     the teacher to courses.html when clicked.
     ============================================================
     NOTE: We find buttons by matching their visible text,
     since they don't have a unique class/id yet.
  ============================================================ */

  // Get every <button> on the page, then keep only the ones
  // whose text says "Create Course"
  const allButtons = document.querySelectorAll("button");

  allButtons.forEach(function (button) {
    if (button.textContent.trim().includes("Create Course")) {
      button.addEventListener("click", function () {
        window.location.href = "courses.html";
      });
    }
  });


  /* ============================================================
     SECTION 4: "JOIN" BUTTONS (Upcoming Classes)
     ------------------------------------------------------------
     What it does: when a teacher clicks "Join" on one of the
     upcoming classes, we show a small toast message.
     (Later you can replace this with a real video-call link.)
  ============================================================ */

  const joinButtons = document.querySelectorAll(".class-item button");

  joinButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      // Find the class name from the same .class-item block
      const classItem = button.closest(".class-item");
      const className = classItem
        ? classItem.querySelector("h6").textContent
        : "class";

      showToast("Joining " + className + "...");
    });
  });


  /* ============================================================
     SECTION 5: REUSABLE TOAST NOTIFICATION
     ------------------------------------------------------------
     What it does: shows a small popup message in the corner
     of the screen for 2.5 seconds, then fades it away.
     Your CSS already has ".dashboard-toast" styles ready —
     we just build the box with JavaScript so you don't need
     to add any extra HTML.
  ============================================================ */

  function showToast(message) {
    // 1. Create a new <div> element
    const toast = document.createElement("div");
    toast.className = "dashboard-toast";
    toast.textContent = message;

    // 2. Add it to the page
    document.body.appendChild(toast);

    // 3. Trigger the "show" animation (defined in your CSS)
    //    We use a tiny delay so the browser registers the
    //    element BEFORE we add the class that animates it in.
    setTimeout(function () {
      toast.classList.add("show");
    }, 50);

    // 4. Remove the toast automatically after 2.5 seconds
    setTimeout(function () {
      toast.classList.remove("show");
      // Wait for the fade-out transition to finish, then delete it
      setTimeout(function () {
        toast.remove();
      }, 350);
    }, 2500);
  }


  /* ============================================================
     SECTION 6: NAVBAR NOTIFICATION ICONS (Bell / Envelope)
     ------------------------------------------------------------
     What it does: clicking the bell or envelope icon in the
     top navbar shows a quick toast. Replace this later with a
     real dropdown of notifications/messages.
  ============================================================ */

  const navIcons = document.querySelectorAll(".nav-icon");

  navIcons.forEach(function (icon) {
    icon.addEventListener("click", function () {
      // Check which icon was clicked based on the Font Awesome class inside it
      const isBell = icon.querySelector(".fa-bell");
      showToast(isBell ? "No new notifications" : "No new messages");
    });
  });

}); // END of DOMContentLoaded