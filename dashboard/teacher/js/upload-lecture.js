/*
==========================================================
EduVerse Teacher Dashboard
upload-lecture.js
==========================================================
*/

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================================
       SELECTORS
    ========================================================== */

    const sidebar = document.querySelector(".sidebar");
    const menuToggle = document.querySelector(".menu-toggle");

    const form = document.getElementById("lectureForm");

    const titleInput = document.querySelector('input[placeholder="Enter Lecture Title"]');
    const durationInput = document.querySelector('input[placeholder="Example : 45 Minutes"]');
    const descriptionInput = document.querySelector("textarea");

    const selects = document.querySelectorAll(".form-select");
    const courseSelect = selects[0];
    const categorySelect = selects[1];

    const uploadBar = document.getElementById("uploadProgress");
    const progressText = document.querySelector(".dashboard-card span");

    const fileInputs = document.querySelectorAll('input[type="file"]');

    const saveBtn = [...document.querySelectorAll("button")]
        .find(btn => btn.textContent.includes("Save Draft"));

    const previewBtn = [...document.querySelectorAll("button")]
        .find(btn => btn.textContent.includes("Preview"));

    const publishBtn = [...document.querySelectorAll("button")]
        .find(btn => btn.textContent.includes("Publish"));

    const lectureSearch =
        document.querySelector('input[placeholder="Search Lecture..."]');

    const navbarSearch =
        document.querySelector('input[placeholder="Search lectures..."]');

    const tbody = document.querySelector("tbody");

    /* ==========================================================
       SIDEBAR
    ========================================================== */

    menuToggle?.addEventListener("click", () => {
        sidebar.classList.toggle("show");
    });

    /* ==========================================================
       FILE PREVIEW
    ========================================================== */

    fileInputs.forEach(input => {

        input.addEventListener("change", function () {

            const file = this.files[0];

            if (!file) return;

            let small = this.parentElement.querySelector(".selected-file");

            if (!small) {

                small = document.createElement("small");
                small.className = "selected-file text-success d-block mt-2";
                this.parentElement.appendChild(small);

            }

            small.innerHTML = `<i class="fa-solid fa-file"></i> ${file.name}`;

        });

    });

    /* ==========================================================
       VALIDATION
    ========================================================== */

    function validateForm() {

        if (titleInput.value.trim() === "") {

            alert("Lecture title is required.");

            titleInput.focus();

            return false;

        }

        if (courseSelect.selectedIndex === 0) {

            alert("Please select a course.");

            return false;

        }

        if (durationInput.value.trim() === "") {

            alert("Please enter lecture duration.");

            return false;

        }

        return true;

    }

    /* ==========================================================
       FORM DATA
    ========================================================== */

    function getLectureData() {

        return {

            title: titleInput.value,

            course: courseSelect.value,

            category: categorySelect.value,

            duration: durationInput.value,

            description: descriptionInput.value

        };

    }

    /* ==========================================================
       LOCAL STORAGE
    ========================================================== */

    function saveDraft() {

        localStorage.setItem(
            "lectureDraft",
            JSON.stringify(getLectureData())
        );

        alert("Draft Saved Successfully.");

    }

    function loadDraft() {

        const draft = JSON.parse(localStorage.getItem("lectureDraft"));

        if (!draft) return;

        titleInput.value = draft.title;
        courseSelect.value = draft.course;
        categorySelect.value = draft.category;
        durationInput.value = draft.duration;
        descriptionInput.value = draft.description;

    }

    loadDraft();

    saveBtn?.addEventListener("click", e => {

        e.preventDefault();

        saveDraft();

    });

    /* ==========================================================
       PREVIEW
    ========================================================== */

    previewBtn?.addEventListener("click", e => {

        e.preventDefault();

        if (!validateForm()) return;

        const lecture = getLectureData();

        alert(

`Lecture Preview

Title : ${lecture.title}

Course : ${lecture.course}

Category : ${lecture.category}

Duration : ${lecture.duration}

Description :

${lecture.description}`

        );

    });

    /* ==========================================================
       PUBLISH
    ========================================================== */

    publishBtn?.addEventListener("click", e => {

        e.preventDefault();

        if (!validateForm()) return;

        simulateUpload();

    });

    /* ==========================================================
       UPLOAD PROGRESS
    ========================================================== */

    function simulateUpload() {

        let progress = 0;

        uploadBar.style.width = "0%";

        progressText.textContent = "0%";

        const timer = setInterval(() => {

            progress += 2;

            uploadBar.style.width = progress + "%";

            progressText.textContent = progress + "%";

            if (progress >= 100) {

                clearInterval(timer);

                alert("Lecture Published Successfully.");

                localStorage.removeItem("lectureDraft");

            }

        }, 50);

    }

    /* ==========================================================
       SEARCH TABLE
    ========================================================== */

    function searchTable(keyword) {

        tbody.querySelectorAll("tr").forEach(row => {

            row.style.display =
                row.innerText.toLowerCase().includes(keyword.toLowerCase())
                    ? ""
                    : "none";

        });

    }

    lectureSearch?.addEventListener("keyup", function () {

        searchTable(this.value);

    });

    navbarSearch?.addEventListener("keyup", function () {

        searchTable(this.value);

    });

    /* ==========================================================
       TABLE ACTIONS
    ========================================================== */

    tbody.addEventListener("click", e => {

        const button = e.target.closest("button");

        if (!button) return;

        const row = button.closest("tr");

        const lecture = row.children[1].textContent.trim();

        if (button.classList.contains("btn-primary")) {

            alert("Viewing:\n\n" + lecture);

        }

        else if (button.classList.contains("btn-warning")) {

            titleInput.value = lecture;
            courseSelect.value = row.children[2].textContent.trim();
            durationInput.value = row.children[3].textContent.trim();

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }

        else if (button.classList.contains("btn-danger")) {

            if (confirm(`Delete "${lecture}"?`)) {

                row.remove();

                updateSerialNumbers();

            }

        }

    });

    /* ==========================================================
       UPDATE SERIAL
    ========================================================== */

    function updateSerialNumbers() {

        tbody.querySelectorAll("tr").forEach((row, index) => {

            row.children[0].textContent = index + 1;

        });

    }

    /* ==========================================================
       AUTO SAVE
    ========================================================== */

    form?.addEventListener("input", () => {

        localStorage.setItem(
            "lectureDraft",
            JSON.stringify(getLectureData())
        );

    });

});
