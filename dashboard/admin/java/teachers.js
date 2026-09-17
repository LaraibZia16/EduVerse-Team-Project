"use strict";

/* =========================================================
   EduVerse | Admin Teachers
   Frontend only
   Uses localStorage
========================================================= */


/* =========================================================
   DEFAULT TEACHERS
========================================================= */

const defaultTeachers = [

    {
        name: "Usman Ali",
        email: "usman@example.com",
        subject: "Mathematics",
        experience: "5 Years",
        status: "Active",
        joined: "10 Sep 2026"
    },

    {
        name: "Sara Ahmed",
        email: "sara@example.com",
        subject: "English",
        experience: "4 Years",
        status: "Active",
        joined: "5 Sep 2026"
    },

    {
        name: "Hassan Raza",
        email: "hassan@example.com",
        subject: "Computer Science",
        experience: "6 Years",
        status: "Active",
        joined: "2 Sep 2026"
    },

    {
        name: "Ayesha Khan",
        email: "ayesha@example.com",
        subject: "Physics",
        experience: "3 Years",
        status: "Inactive",
        joined: "30 Aug 2026"
    },

    {
        name: "Bilal Ahmed",
        email: "bilal@example.com",
        subject: "Chemistry",
        experience: "7 Years",
        status: "Active",
        joined: "28 Aug 2026"
    },

    {
        name: "Mariam Noor",
        email: "mariam@example.com",
        subject: "Biology",
        experience: "4 Years",
        status: "Active",
        joined: "25 Aug 2026"
    }

];


/* =========================================================
   LOAD DATA
========================================================= */

let teachers =
    JSON.parse(
        localStorage.getItem("eduverseTeachers")
    ) || defaultTeachers;


/* =========================================================
   SAVE DATA
========================================================= */

function saveTeachers() {

    localStorage.setItem(
        "eduverseTeachers",
        JSON.stringify(teachers)
    );

}


/* =========================================================
   PAGINATION
========================================================= */

let currentPage = 1;

const teachersPerPage = 5;

let deleteIndex = null;


/* =========================================================
   ELEMENTS
========================================================= */

const tableBody =
    document.getElementById(
        "teachersTableBody"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const subjectFilter =
    document.getElementById(
        "subjectFilter"
    );

const statusFilter =
    document.getElementById(
        "statusFilter"
    );

const noTeachers =
    document.getElementById(
        "noTeachers"
    );


const totalTeachers =
    document.getElementById(
        "totalTeachers"
    );

const activeTeachers =
    document.getElementById(
        "activeTeachers"
    );

const inactiveTeachers =
    document.getElementById(
        "inactiveTeachers"
    );

const totalSubjects =
    document.getElementById(
        "totalSubjects"
    );


const prevBtn =
    document.getElementById(
        "prevBtn"
    );

const nextBtn =
    document.getElementById(
        "nextBtn"
    );

const pageInfo =
    document.getElementById(
        "pageInfo"
    );


/* =========================================================
   MODALS
========================================================= */

const viewModal =
    document.getElementById(
        "viewModal"
    );

const teacherFormModal =
    document.getElementById(
        "teacherFormModal"
    );

const deleteModal =
    document.getElementById(
        "deleteModal"
    );


/* =========================================================
   VIEW ELEMENTS
========================================================= */

const viewAvatar =
    document.getElementById(
        "viewAvatar"
    );

const viewName =
    document.getElementById(
        "viewName"
    );

const viewEmail =
    document.getElementById(
        "viewEmail"
    );

const viewSubject =
    document.getElementById(
        "viewSubject"
    );

const viewExperience =
    document.getElementById(
        "viewExperience"
    );

const viewStatus =
    document.getElementById(
        "viewStatus"
    );

const viewJoined =
    document.getElementById(
        "viewJoined"
    );


/* =========================================================
   FORM ELEMENTS
========================================================= */

const teacherForm =
    document.getElementById(
        "teacherForm"
    );

const formTitle =
    document.getElementById(
        "formTitle"
    );

const editIndex =
    document.getElementById(
        "editIndex"
    );

const teacherName =
    document.getElementById(
        "teacherName"
    );

const teacherEmail =
    document.getElementById(
        "teacherEmail"
    );

const teacherSubject =
    document.getElementById(
        "teacherSubject"
    );

const teacherExperience =
    document.getElementById(
        "teacherExperience"
    );

const teacherStatus =
    document.getElementById(
        "teacherStatus"
    );


/* =========================================================
   DELETE ELEMENTS
========================================================= */

const deleteTeacherName =
    document.getElementById(
        "deleteTeacherName"
    );

const confirmDeleteBtn =
    document.getElementById(
        "confirmDeleteBtn"
    );


/* =========================================================
   ADD BUTTON
========================================================= */

const addTeacherBtn =
    document.getElementById(
        "addTeacherBtn"
    );


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics() {

    totalTeachers.textContent =
        teachers.length;


    activeTeachers.textContent =
        teachers.filter(function (teacher) {

            return teacher.status === "Active";

        }).length;


    inactiveTeachers.textContent =
        teachers.filter(function (teacher) {

            return teacher.status === "Inactive";

        }).length;


    const subjects =
        new Set(
            teachers.map(function (teacher) {

                return teacher.subject;

            })
        );


    totalSubjects.textContent =
        subjects.size;

}


/* =========================================================
   SUBJECT FILTER
========================================================= */

function updateSubjectFilter() {

    const currentValue =
        subjectFilter.value;


    const subjects =
        [...new Set(
            teachers.map(function (teacher) {

                return teacher.subject;

            })
        )].sort();


    subjectFilter.innerHTML = `
        <option value="all">
            All Subjects
        </option>
    `;


    subjects.forEach(function (subject) {

        const option =
            document.createElement("option");

        option.value = subject;

        option.textContent = subject;

        subjectFilter.appendChild(option);

    });


    if (
        subjects.includes(currentValue)
    ) {

        subjectFilter.value =
            currentValue;

    }

}


/* =========================================================
   FILTER TEACHERS
========================================================= */

function getFilteredTeachers() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedSubject =
        subjectFilter.value;


    const selectedStatus =
        statusFilter.value;


    return teachers.filter(
        function (teacher) {

            const matchesSearch =
                teacher.name
                    .toLowerCase()
                    .includes(search)
                ||
                teacher.email
                    .toLowerCase()
                    .includes(search);


            const matchesSubject =
                selectedSubject === "all"
                ||
                teacher.subject ===
                selectedSubject;


            const matchesStatus =
                selectedStatus === "all"
                ||
                teacher.status ===
                selectedStatus;


            return (
                matchesSearch &&
                matchesSubject &&
                matchesStatus
            );

        }
    );

}


/* =========================================================
   DISPLAY TEACHERS
========================================================= */

function displayTeachers() {

    const filteredTeachers =
        getFilteredTeachers();


    tableBody.innerHTML = "";


    const totalPages =
        Math.ceil(
            filteredTeachers.length /
            teachersPerPage
        );


    if (
        filteredTeachers.length === 0
    ) {

        noTeachers.style.display =
            "block";

        pageInfo.textContent =
            "Page 1";

        prevBtn.disabled = true;

        nextBtn.disabled = true;

        return;

    }


    noTeachers.style.display =
        "none";


    if (
        currentPage > totalPages
    ) {

        currentPage =
            totalPages;

    }


    const start =
        (currentPage - 1) *
        teachersPerPage;


    const end =
        start + teachersPerPage;


    const pageTeachers =
        filteredTeachers.slice(
            start,
            end
        );


    pageTeachers.forEach(
        function (teacher) {

            const realIndex =
                teachers.indexOf(
                    teacher
                );


            const row =
                document.createElement(
                    "tr"
                );


            const initial =
                teacher.name
                    .charAt(0)
                    .toUpperCase();


            row.innerHTML = `

                <td>

                    <div class="teacher-cell">

                        <div class="table-avatar">
                            ${escapeHTML(initial)}
                        </div>

                        <strong>
                            ${escapeHTML(
                                teacher.name
                            )}
                        </strong>

                    </div>

                </td>


                <td>
                    ${escapeHTML(
                        teacher.email
                    )}
                </td>


                <td>
                    <span class="subject-badge">
                        ${escapeHTML(
                            teacher.subject
                        )}
                    </span>
                </td>


                <td>
                    ${escapeHTML(
                        teacher.experience
                    )}
                </td>


                <td>

                    <span
                        class="status ${teacher.status.toLowerCase()}"
                    >
                        ${escapeHTML(
                            teacher.status
                        )}
                    </span>

                </td>


                <td>
                    ${escapeHTML(
                        teacher.joined
                    )}
                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            class="view-btn"
                            data-action="view"
                            data-index="${realIndex}"
                        >
                            View
                        </button>


                        <button
                            class="edit-btn"
                            data-action="edit"
                            data-index="${realIndex}"
                        >
                            Edit
                        </button>


                        <button
                            class="delete-btn"
                            data-action="delete"
                            data-index="${realIndex}"
                        >
                            Delete
                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(row);

        }
    );


    pageInfo.textContent =
        `Page ${currentPage} of ${totalPages}`;


    prevBtn.disabled =
        currentPage === 1;


    nextBtn.disabled =
        currentPage === totalPages;

}


/* =========================================================
   VIEW TEACHER
========================================================= */

function viewTeacher(index) {

    const teacher =
        teachers[index];


    if (!teacher) return;


    viewAvatar.textContent =
        teacher.name
            .charAt(0)
            .toUpperCase();


    viewName.textContent =
        teacher.name;


    viewEmail.textContent =
        teacher.email;


    viewSubject.textContent =
        teacher.subject;


    viewExperience.textContent =
        teacher.experience;


    viewStatus.textContent =
        teacher.status;


    viewJoined.textContent =
        teacher.joined;


    openModal(viewModal);

}


/* =========================================================
   ADD TEACHER
========================================================= */

function openAddTeacher() {

    formTitle.textContent =
        "Add Teacher";


    editIndex.value = "";


    teacherForm.reset();


    teacherStatus.value =
        "Active";


    openModal(
        teacherFormModal
    );

}


/* =========================================================
   EDIT TEACHER
========================================================= */

function editTeacher(index) {

    const teacher =
        teachers[index];


    if (!teacher) return;


    formTitle.textContent =
        "Edit Teacher";


    editIndex.value =
        index;


    teacherName.value =
        teacher.name;


    teacherEmail.value =
        teacher.email;


    teacherSubject.value =
        teacher.subject;


    teacherExperience.value =
        teacher.experience;


    teacherStatus.value =
        teacher.status;


    openModal(
        teacherFormModal
    );

}


/* =========================================================
   SAVE TEACHER
========================================================= */

teacherForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const name =
            teacherName.value.trim();


        const email =
            teacherEmail.value.trim();


        const subject =
            teacherSubject.value.trim();


        const experience =
            teacherExperience.value.trim();


        const status =
            teacherStatus.value;


        if (
            !name ||
            !email ||
            !subject ||
            !experience
        ) {

            return;

        }


        const index =
            editIndex.value;


        /* Edit */

        if (index !== "") {

            teachers[
                Number(index)
            ] = {

                ...teachers[
                    Number(index)
                ],

                name: name,

                email: email,

                subject: subject,

                experience: experience,

                status: status

            };

        }

        /* Add */

        else {

            teachers.unshift({

                name: name,

                email: email,

                subject: subject,

                experience: experience,

                status: status,

                joined: getTodayDate()

            });


            currentPage = 1;

        }


        saveTeachers();

        updateStatistics();

        updateSubjectFilter();

        displayTeachers();

        closeModal(
            teacherFormModal
        );

    }
);


/* =========================================================
   DELETE TEACHER
========================================================= */

function openDeleteTeacher(index) {

    const teacher =
        teachers[index];


    if (!teacher) return;


    deleteIndex =
        index;


    deleteTeacherName.textContent =
        teacher.name;


    openModal(
        deleteModal
    );

}


/* =========================================================
   CONFIRM DELETE
========================================================= */

confirmDeleteBtn.addEventListener(
    "click",
    function () {

        if (
            deleteIndex === null
        ) {

            return;

        }


        teachers.splice(
            deleteIndex,
            1
        );


        saveTeachers();

        updateStatistics();

        updateSubjectFilter();

        displayTeachers();


        deleteIndex = null;


        closeModal(
            deleteModal
        );

    }
);


/* =========================================================
   TABLE ACTIONS
========================================================= */

tableBody.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) return;


        const index =
            Number(
                button.dataset.index
            );


        const action =
            button.dataset.action;


        if (
            action === "view"
        ) {

            viewTeacher(index);

        }


        if (
            action === "edit"
        ) {

            editTeacher(index);

        }


        if (
            action === "delete"
        ) {

            openDeleteTeacher(index);

        }

    }
);


/* =========================================================
   MODAL FUNCTIONS
========================================================= */

function openModal(modal) {

    modal.classList.add("show");

    document.body.classList.add(
        "modal-open"
    );

}


function closeModal(modal) {

    modal.classList.remove("show");

    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================================
   CLOSE BUTTONS
========================================================= */

document
    .querySelectorAll("[data-close]")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const modalId =
                    button.dataset.close;


                const modal =
                    document.getElementById(
                        modalId
                    );


                if (modal) {

                    closeModal(modal);

                }

            }
        );

    });


/* =========================================================
   CLOSE OUTSIDE MODAL
========================================================= */

document
    .querySelectorAll(".modal")
    .forEach(function (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    modal
                ) {

                    closeModal(modal);

                }

            }
        );

    });


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !== "Escape"
        ) {

            return;

        }


        document
            .querySelectorAll(
                ".modal.show"
            )
            .forEach(function (modal) {

                closeModal(modal);

            });

    }
);


/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener(
    "input",
    function () {

        currentPage = 1;

        displayTeachers();

    }
);


/* =========================================================
   SUBJECT FILTER
========================================================= */

subjectFilter.addEventListener(
    "change",
    function () {

        currentPage = 1;

        displayTeachers();

    }
);


/* =========================================================
   STATUS FILTER
========================================================= */

statusFilter.addEventListener(
    "change",
    function () {

        currentPage = 1;

        displayTeachers();

    }
);


/* =========================================================
   PREVIOUS
========================================================= */

prevBtn.addEventListener(
    "click",
    function () {

        if (
            currentPage > 1
        ) {

            currentPage--;

            displayTeachers();

        }

    }
);


/* =========================================================
   NEXT
========================================================= */

nextBtn.addEventListener(
    "click",
    function () {

        const filteredTeachers =
            getFilteredTeachers();


        const totalPages =
            Math.ceil(
                filteredTeachers.length /
                teachersPerPage
            );


        if (
            currentPage < totalPages
        ) {

            currentPage++;

            displayTeachers();

        }

    }
);


/* =========================================================
   ADD BUTTON
========================================================= */

addTeacherBtn.addEventListener(
    "click",
    openAddTeacher
);


/* =========================================================
   TODAY DATE
========================================================= */

function getTodayDate() {

    const today =
        new Date();


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    const month =
        today.toLocaleString(
            "en-US",
            {
                month: "short"
            }
        );


    const year =
        today.getFullYear();


    return `${day} ${month} ${year}`;

}


/* =========================================================
   SECURITY
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   INITIAL LOAD
========================================================= */

updateStatistics();

updateSubjectFilter();

displayTeachers();