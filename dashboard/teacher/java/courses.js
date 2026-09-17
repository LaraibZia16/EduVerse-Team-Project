/* ============================================================
   EDUVERSE TEACHER DASHBOARD — courses.js
   ------------------------------------------------------------
   This file powers the "My Courses" page.
   Sections:
     1. Sidebar toggle (same as dashboard.html)
     2. Toast notification helper
     3. Create Course button -> opens a real popup modal
     4. Live search box (filters cards as you type)
     5. "All / Published / Draft" filter dropdown
     6. "Newest / Oldest / A-Z" sort dropdown
     7. View / Edit buttons on each course card
     8. Pagination clicks (visual only for now)
============================================================ */


document.addEventListener("DOMContentLoaded", function () {


  /* ============================================================
     SECTION 1: SIDEBAR TOGGLE
     ------------------------------------------------------------
     Same behavior as dashboard.html — clicking the hamburger
     button slides the sidebar in/out on mobile.
  ============================================================ */

  const menuToggleBtn = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");

  if (menuToggleBtn && sidebar) {
    menuToggleBtn.addEventListener("click", function () {
      sidebar.classList.toggle("active");
    });

    document.addEventListener("click", function (event) {
      const clickedInside = sidebar.contains(event.target);
      const clickedButton = menuToggleBtn.contains(event.target);
      if (sidebar.classList.contains("active") && !clickedInside && !clickedButton) {
        sidebar.classList.remove("active");
      }
    });
  }


  /* ============================================================
     SECTION 2: REUSABLE TOAST NOTIFICATION
     ------------------------------------------------------------
     Shows a small popup message in the corner of the screen.
     Your CSS already has ".dashboard-toast" styles ready.
  ============================================================ */

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "dashboard-toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function () {
      toast.classList.add("show");
    }, 50);

    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () {
        toast.remove();
      }, 350);
    }, 2500);
  }


  /* ============================================================
     SECTION 3: CREATE COURSE MODAL
     ------------------------------------------------------------
     Your HTML doesn't have a modal yet, so we BUILD one here
     with JavaScript and attach it to the page automatically.
     We use Bootstrap's modal system (already loaded in your
     HTML via bootstrap.bundle.min.js) so it opens/closes with
     the same smooth animation as the rest of Bootstrap.
  ============================================================ */

  // --- 3a. Build the modal's HTML and add it to the page ---
  const modalHTML = `
    <div class="modal fade" id="createCourseModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title">Create New Course</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <form id="createCourseForm">

              <div class="mb-3">
                <label class="form-label">Course Title</label>
                <input type="text" class="form-control" id="newCourseTitle" required>
              </div>

              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" id="newCourseDescription" rows="3" required></textarea>
              </div>

              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label">Total Lessons</label>
                  <input type="number" class="form-control" id="newCourseLessons" min="1" value="10" required>
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label">Status</label>
                  <select class="form-select" id="newCourseStatus">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Cover Image URL (optional)</label>
                <input type="text" class="form-control" id="newCourseImage"
                       placeholder="Leave blank to use a default image">
              </div>

            </form>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline-primary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="saveCourseBtn">Create Course</button>
          </div>

        </div>
      </div>
    </div>
  `;

  // Add the modal to the very end of the page body
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // --- 3b. Turn our new modal HTML into a working Bootstrap modal ---
  const modalElement = document.getElementById("createCourseModal");
  const courseModal = new bootstrap.Modal(modalElement);

  // --- 3c. Open the modal when "Create Course" button is clicked ---
  const createCourseBtn = document.querySelector(".create-course-btn");
  if (createCourseBtn) {
    createCourseBtn.addEventListener("click", function () {
      courseModal.show();
    });
  }

  // --- 3d. When "Create Course" INSIDE the modal is clicked, build the card ---
  const saveCourseBtn = document.getElementById("saveCourseBtn");

  saveCourseBtn.addEventListener("click", function () {

    // Grab the values the teacher typed in
    const title = document.getElementById("newCourseTitle").value.trim();
    const description = document.getElementById("newCourseDescription").value.trim();
    const lessons = document.getElementById("newCourseLessons").value;
    const status = document.getElementById("newCourseStatus").value; // "published" or "draft"
    let imageUrl = document.getElementById("newCourseImage").value.trim();

    // Simple validation — title and description are required
    if (title === "" || description === "") {
      showToast("Please fill in the title and description.");
      return;
    }

    // If no image was given, use a random placeholder image
    if (imageUrl === "") {
      imageUrl = "https://picsum.photos/600/350?random=" + Math.floor(Math.random() * 100);
    }

    // Decide the badge text/class based on status
    const badgeClass = status === "published" ? "published" : "draft";
    const badgeText = status === "published" ? "Published" : "Draft";

    // Build the new course card using the SAME structure as your existing cards
    const newCardHTML = `
      <div class="col-xl-4 col-lg-6 new-course-card">
        <div class="course-card">
          <div class="course-image">
            <img src="${imageUrl}" alt="${title}">
            <span class="course-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="course-content">
            <h4>${title}</h4>
            <p>${description}</p>
            <div class="course-meta">
              <span><i class="fa-solid fa-users"></i> 0 Students</span>
              <span><i class="fa-solid fa-book-open"></i> ${lessons} Lessons</span>
            </div>
            <div class="progress mt-3">
              <div class="progress-bar" style="width:0%">0%</div>
            </div>
            <div class="course-footer">
              <span>⭐ New</span>
              <div>
                <button class="btn btn-sm btn-outline-primary">View</button>
                <button class="btn btn-sm btn-primary">Edit</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add the new card to the TOP of the courses grid
    const coursesRow = document.querySelector(".courses-grid .row");
    coursesRow.insertAdjacentHTML("afterbegin", newCardHTML);

    // Re-attach View/Edit button behavior to the brand-new card
    // (see Section 7 below — we call the same function again)
    attachCardButtonEvents();

    // Close the modal, clear the form, and confirm to the teacher
    courseModal.hide();
    document.getElementById("createCourseForm").reset();
    showToast("Course \"" + title + "\" created!");
  });


  /* ============================================================
     SECTION 4: LIVE SEARCH BOX
     ------------------------------------------------------------
     What it does: as the teacher types into the "Search your
     courses..." box, we hide any course card whose title
     doesn't match what was typed.
  ============================================================ */

  const courseSearchInput = document.getElementById("courseSearch");

  if (courseSearchInput) {
    courseSearchInput.addEventListener("keyup", function () {
      const searchTerm = courseSearchInput.value.toLowerCase().trim();

      // Every course card currently on the page
      const allCourseCards = document.querySelectorAll(".courses-grid .col-xl-4");

      allCourseCards.forEach(function (cardWrapper) {
        const title = cardWrapper.querySelector("h4").textContent.toLowerCase();

        // Show the card if the title contains the search text,
        // otherwise hide it completely
        if (title.includes(searchTerm)) {
          cardWrapper.style.display = "block";
        } else {
          cardWrapper.style.display = "none";
        }
      });
    });
  }


  /* ============================================================
     SECTION 5: STATUS FILTER ("All Courses / Published / Draft")
     ------------------------------------------------------------
     This is the FIRST dropdown inside .toolbar-actions.
  ============================================================ */

  const toolbarSelects = document.querySelectorAll(".toolbar-actions .form-select");
  const statusFilterSelect = toolbarSelects[0]; // "All Courses / Published / Draft"
  const sortSelect = toolbarSelects[1];         // "Newest / Oldest / A-Z"

  if (statusFilterSelect) {
    statusFilterSelect.addEventListener("change", function () {
      const chosenStatus = statusFilterSelect.value; // "All Courses", "Published", or "Draft"
      const allCourseCards = document.querySelectorAll(".courses-grid .col-xl-4");

      allCourseCards.forEach(function (cardWrapper) {
        const badge = cardWrapper.querySelector(".course-badge");

        if (chosenStatus === "All Courses") {
          cardWrapper.style.display = "block";
        } else if (chosenStatus === "Published" && badge.classList.contains("published")) {
          cardWrapper.style.display = "block";
        } else if (chosenStatus === "Draft" && badge.classList.contains("draft")) {
          cardWrapper.style.display = "block";
        } else {
          cardWrapper.style.display = "none";
        }
      });
    });
  }


  /* ============================================================
     SECTION 6: SORT DROPDOWN ("Newest / Oldest / A-Z")
     ------------------------------------------------------------
     What it does: reorders the course cards inside the grid.
     "Newest" = the order they were created (most recent first)
     "Oldest" = reverse of that
     "A-Z"    = alphabetical by course title
  ============================================================ */

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      const coursesRow = document.querySelector(".courses-grid .row");
      const allCourseCards = Array.from(coursesRow.querySelectorAll(".col-xl-4"));
      const chosenSort = sortSelect.value;

      if (chosenSort === "A-Z") {
        allCourseCards.sort(function (a, b) {
          const titleA = a.querySelector("h4").textContent.toLowerCase();
          const titleB = b.querySelector("h4").textContent.toLowerCase();
          return titleA.localeCompare(titleB);
        });
      } else if (chosenSort === "Oldest") {
        allCourseCards.reverse();
      }
      // "Newest" just keeps the current page order, so nothing to do there.

      // Remove all cards from the page, then add them back in the new order
      allCourseCards.forEach(function (card) {
        coursesRow.appendChild(card);
      });
    });
  }


  /* ============================================================
     SECTION 7: VIEW / EDIT BUTTONS
     ------------------------------------------------------------
     What it does: clicking "View" or "Edit" on any course card
     shows a toast with that course's name.
     We wrap this in a function so we can re-run it every time
     a NEW course card is added (see Section 3d above).
  ============================================================ */

  function attachCardButtonEvents() {
    const courseCards = document.querySelectorAll(".course-card");

    courseCards.forEach(function (card) {
      const title = card.querySelector("h4").textContent;
      const viewBtn = card.querySelector(".btn-outline-primary");
      const editBtn = card.querySelector(".course-footer .btn-primary");

      if (viewBtn) {
        // Remove any old click listener before adding a new one,
        // so we don't accidentally attach it twice to the same button
        viewBtn.onclick = function () {
          showToast("Viewing: " + title);
        };
      }

      if (editBtn) {
        editBtn.onclick = function () {
          showToast("Editing: " + title);
        };
      }
    });
  }

  // Run it once for the cards that already exist when the page loads
  attachCardButtonEvents();


  /* ============================================================
     SECTION 8: PAGINATION
     ------------------------------------------------------------
     What it does: clicking a page number visually marks it as
     active. (Hooking this up to real page-loading logic comes
     later once you have a backend/database.)
  ============================================================ */

  const paginationLinks = document.querySelectorAll(".pagination .page-link");

  paginationLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault(); // stop the link from jumping to "#"

      // Ignore clicks on "Previous"/"Next" for this simple visual demo
      const pageItem = link.closest(".page-item");
      if (pageItem.classList.contains("disabled")) return;

      // Remove "active" from every page item, then add it to the clicked one
      document.querySelectorAll(".pagination .page-item").forEach(function (item) {
        item.classList.remove("active");
      });
      pageItem.classList.add("active");
    });
  });

}); // END of DOMContentLoaded