/* ============================================================
   EDUVERSE TEACHER DASHBOARD — assignments.js
   ------------------------------------------------------------
   This file powers the "Assignments" page.
   Sections:
     1. Sidebar toggle (same as other pages)
     2. Toast notification helper
     3. "New Assignment" button -> jumps to the form
     4. Form validation helper (reused by Save/Preview/Publish)
     5. Save Draft button
     6. Preview button (shows entered info in a popup)
     7. Publish Assignment button
     8. File upload -> shows the chosen file name
     9. Search box -> filters the submissions table live
     10. View / Grade buttons on each table row

   A NOTE ON "RESPONSIVE":
   Responsiveness (how the page reflows on phones/tablets) is
   handled by your CSS media queries — JavaScript doesn't
   change layout by itself. What JavaScript CAN do (and what
   this file does) is make sure every interactive feature —
   toasts, popups, the sidebar — works equally well whether
   someone is on a small phone screen or a big desktop screen.
   That's what "full responsive" means for a JS file, and it's
   built in throughout (e.g. the sidebar auto-closes on mobile,
   toasts are positioned with CSS that already adapts to screen
   size in your stylesheet).
============================================================ */


document.addEventListener("DOMContentLoaded", function () {


  /* ============================================================
     SECTION 1: SIDEBAR TOGGLE
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
     GRAB THE FORM FIELDS ONCE, SO WE CAN REUSE THEM EVERYWHERE
     ------------------------------------------------------------
     Your form fields don't have unique "id" attributes yet, so
     we grab them by their position/order inside the form using
     querySelectorAll + array index. Simple and reliable as long
     as you don't reorder the fields in the HTML.
  ============================================================ */

  const assignmentForm = document.querySelector(".assignment-section form");
  const titleInput       = assignmentForm.querySelector('input[type="text"]');
  const courseSelect     = assignmentForm.querySelector("select");
  const dueDateInput     = assignmentForm.querySelector('input[type="date"]');
  const marksInput       = assignmentForm.querySelector('input[type="number"]');
  const timeLimitInputs  = assignmentForm.querySelectorAll('input[type="text"]');
  const timeLimitInput   = timeLimitInputs[1]; // 2nd text input = Time Limit
  const descriptionInput = assignmentForm.querySelector("textarea");
  const fileInput        = assignmentForm.querySelector('input[type="file"]');


  /* ============================================================
     SECTION 3: "NEW ASSIGNMENT" BUTTON (in page header)
     ------------------------------------------------------------
     What it does: scrolls smoothly down to the form and puts
     the cursor in the Title field, ready to type.
  ============================================================ */

  const newAssignmentBtn = document.querySelector(".page-header-right button");

  if (newAssignmentBtn) {
    newAssignmentBtn.addEventListener("click", function () {
      document.querySelector(".assignment-section")
        .scrollIntoView({ behavior: "smooth", block: "start" });
      titleInput.focus();
    });
  }


  /* ============================================================
     SECTION 4: FORM VALIDATION HELPER
     ------------------------------------------------------------
     What it does: checks that a required field has a value.
     If it's empty, we add Bootstrap's red "is-invalid" outline
     so the teacher can instantly see what's missing.
     Returns true if the field is OK, false if it's empty.
  ============================================================ */

  function validateField(field, isValid) {
    if (isValid) {
      field.classList.remove("is-invalid");
    } else {
      field.classList.add("is-invalid");
    }
    return isValid;
  }

  // Remove the red outline as soon as the teacher starts fixing a field
  [titleInput, courseSelect, dueDateInput, marksInput, descriptionInput].forEach(function (field) {
    field.addEventListener("input", function () {
      field.classList.remove("is-invalid");
    });
    field.addEventListener("change", function () {
      field.classList.remove("is-invalid");
    });
  });


  /* ============================================================
     SECTION 5: SAVE DRAFT BUTTON
     ------------------------------------------------------------
     What it does: a draft only NEEDS a title — everything else
     can be filled in later. If the title is missing, we warn
     the teacher; otherwise we confirm the draft was saved.
  ============================================================ */

  const saveDraftBtn = document.querySelector(".btn-outline-secondary");

  if (saveDraftBtn) {
    saveDraftBtn.addEventListener("click", function () {
      const titleIsValid = validateField(titleInput, titleInput.value.trim() !== "");

      if (!titleIsValid) {
        showToast("Please add a title before saving as draft.");
        titleInput.focus();
        return;
      }

      // (Later: send this data to your backend/database instead)
      showToast("Draft \"" + titleInput.value.trim() + "\" saved!");
    });
  }


  /* ============================================================
     SECTION 6: PREVIEW BUTTON
     ------------------------------------------------------------
     What it does: shows everything the teacher has typed so far
     inside a popup, without needing all fields to be filled in.
     Uses a Bootstrap modal built dynamically in JavaScript
     (same technique as the "Create Course" modal on courses.js).
  ============================================================ */

  // Build the preview modal once and add it to the page
  const previewModalHTML = `
    <div class="modal fade" id="previewAssignmentModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Assignment Preview</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="previewModalBody">
            <!-- Filled in by JavaScript right before opening -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", previewModalHTML);

  const previewModalElement = document.getElementById("previewAssignmentModal");
  const previewModal = new bootstrap.Modal(previewModalElement);
  const previewModalBody = document.getElementById("previewModalBody");

  const previewBtn = document.querySelector(".btn-warning");

  if (previewBtn) {
    previewBtn.addEventListener("click", function () {
      // Fill the popup with whatever has been typed so far.
      // We show "(not set)" for anything left blank.
      previewModalBody.innerHTML = `
        <p><strong>Title:</strong> ${titleInput.value.trim() || "(not set)"}</p>
        <p><strong>Course:</strong> ${courseSelect.value === "Choose Course" ? "(not set)" : courseSelect.value}</p>
        <p><strong>Due Date:</strong> ${dueDateInput.value || "(not set)"}</p>
        <p><strong>Total Marks:</strong> ${marksInput.value || "(not set)"}</p>
        <p><strong>Time Limit:</strong> ${timeLimitInput.value || "(not set)"}</p>
        <p><strong>Description:</strong><br>${descriptionInput.value.trim() || "(not set)"}</p>
      `;
      previewModal.show();
    });
  }


  /* ============================================================
     SECTION 7: PUBLISH ASSIGNMENT BUTTON
     ------------------------------------------------------------
     What it does: checks that EVERY required field is filled
     in before allowing the teacher to publish. Any empty field
     gets a red outline and the page scrolls up to the first one.
  ============================================================ */

  const publishBtn = document.querySelector(".btn-success");

  if (publishBtn) {
    publishBtn.addEventListener("click", function () {

      // Run every check FIRST (don't stop early) so all problem
      // fields get highlighted at once, not just the first one.
      const titleOk    = validateField(titleInput, titleInput.value.trim() !== "");
      const courseOk   = validateField(courseSelect, courseSelect.value !== "Choose Course");
      const dueDateOk  = validateField(dueDateInput, dueDateInput.value !== "");
      const marksOk    = validateField(marksInput, marksInput.value !== "" && Number(marksInput.value) > 0);
      const descOk     = validateField(descriptionInput, descriptionInput.value.trim() !== "");

      const allFieldsValid = titleOk && courseOk && dueDateOk && marksOk && descOk;

      if (!allFieldsValid) {
        showToast("Please fill in all required fields before publishing.");
        // Scroll to the form so the teacher can see the red outlines
        assignmentForm.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      // Everything is filled in correctly
      showToast("Assignment \"" + titleInput.value.trim() + "\" published!");

      // Clear the form so it's ready for the next assignment
      assignmentForm.reset();
      if (fileNameDisplay) {
        fileNameDisplay.textContent = "";
      }
    });
  }


  /* ============================================================
     SECTION 8: FILE UPLOAD FEEDBACK
     ------------------------------------------------------------
     What it does: file inputs don't show much on their own, so
     we display the chosen file's name underneath it, replacing
     the "Upload PDF, DOCX, ZIP or PPT." helper text temporarily.
  ============================================================ */

  let fileNameDisplay = null;

  if (fileInput) {
    fileNameDisplay = fileInput.parentElement.querySelector("small");

    fileInput.addEventListener("change", function () {
      if (fileInput.files.length > 0) {
        fileNameDisplay.textContent = "Selected file: " + fileInput.files[0].name;
      } else {
        fileNameDisplay.textContent = "Upload PDF, DOCX, ZIP or PPT.";
      }
    });
  }


  /* ============================================================
     SECTION 9: SEARCH STUDENT (Submitted Assignments table)
     ------------------------------------------------------------
     What it does: typing in the "Search Student..." box hides
     any table row whose student name doesn't match.
  ============================================================ */

  const studentSearchInput = document.querySelector('.table-responsive').closest("section")
    .querySelector('input[placeholder="Search Student..."]');

  const tableRows = document.querySelectorAll(".table tbody tr");

  if (studentSearchInput) {
    studentSearchInput.addEventListener("keyup", function () {
      const searchTerm = studentSearchInput.value.toLowerCase().trim();

      tableRows.forEach(function (row) {
        const studentName = row.querySelector("td").textContent.toLowerCase();
        row.style.display = studentName.includes(searchTerm) ? "" : "none";
      });
    });
  }


  /* ============================================================
     SECTION 10: VIEW / GRADE BUTTONS (table rows)
     ------------------------------------------------------------
     What it does:
       - "View" (eye icon) shows a toast confirming which
         submission is being opened.
       - "Grade" asks the teacher for a score using a simple
         prompt, then updates that row's Marks + Status.
  ============================================================ */

  tableRows.forEach(function (row) {
    const studentName = row.querySelector("td").textContent;
    const viewBtn = row.querySelector(".btn-primary");
    const gradeBtn = row.querySelector(".btn-success");
    const marksCell = row.querySelectorAll("td")[3];   // 4th column = Marks
    const statusCell = row.querySelectorAll("td")[4];  // 5th column = Status

    if (viewBtn) {
      viewBtn.addEventListener("click", function () {
        showToast("Opening submission: " + studentName);
      });
    }

    if (gradeBtn) {
      gradeBtn.addEventListener("click", function () {
        // A simple browser prompt — good enough for now.
        // Later you could replace this with another nice modal.
        const enteredMarks = prompt("Enter marks out of 100 for " + studentName + ":");

        // If the teacher clicked Cancel, prompt() returns null — do nothing
        if (enteredMarks === null) return;

        const marksNumber = Number(enteredMarks);

        // Make sure they typed a real number between 0 and 100
        if (isNaN(marksNumber) || marksNumber < 0 || marksNumber > 100) {
          showToast("Please enter a valid number between 0 and 100.");
          return;
        }

        // Update the row on the page
        marksCell.textContent = marksNumber + " / 100";
        statusCell.innerHTML = '<span class="badge bg-info">Reviewed</span>';

        showToast(studentName + " graded: " + marksNumber + "/100");
      });
    }
  });

}); // END of DOMContentLoaded