"use strict";

/* =========================================================
   EduVerse | Admin Students
   Frontend only
   Uses localStorage
========================================================= */


/* =========================================================
   DEFAULT STUDENTS
========================================================= */

const defaultStudents = [

    {
        name: "Ali Khan",
        email: "ali@example.com",
        program: "Web Development",
        level: "Intermediate",
        status: "Active",
        joined: "15 Sep 2026"
    },

    {
        name: "Fatima Noor",
        email: "fatima@example.com",
        program: "Graphic Design",
        level: "Beginner",
        status: "Active",
        joined: "14 Sep 2026"
    },

    {
        name: "Ahmed Raza",
        email: "ahmed@example.com",
        program: "JavaScript",
        level: "Advanced",
        status: "Active",
        joined: "12 Sep 2026"
    },

    {
        name: "Zain Ali",
        email: "zain@example.com",
        program: "Web Development",
        level: "Intermediate",
        status: "Active",
        joined: "8 Sep 2026"
    },

    {
        name: "Hina Ahmed",
        email: "hina@example.com",
        program: "Python",
        level: "Beginner",
        status: "Inactive",
        joined: "6 Sep 2026"
    },

    {
        name: "Hamza Khan",
        email: "hamza@example.com",
        program: "React JS",
        level: "Advanced",
        status: "Active",
        joined: "4 Sep 2026"
    },

    {
        name: "Maham Noor",
        email: "maham@example.com",
        program: "UI/UX Design",
        level: "Intermediate",
        status: "Active",
        joined: "2 Sep 2026"
    }

];


/* =========================================================
   LOAD STUDENTS
========================================================= */

let students =
    JSON.parse(
        localStorage.getItem("eduverseStudents")
    ) || defaultStudents;


/* =========================================================
   SAVE STUDENTS
========================================================= */

function saveStudents() {

    localStorage.setItem(
        "eduverseStudents",
        JSON.stringify(students)
    );

}


/* =========================================================
   PAGINATION
========================================================= */

let currentPage = 1;

const studentsPerPage = 5;

let deleteIndex = null;


/* =========================================================
   ELEMENTS
========================================================= */

const tableBody =
    document.getElementById(
        "studentsTableBody"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const programFilter =
    document.getElementById(
        "programFilter"
    );

const statusFilter =
    document.getElementById(
        "statusFilter"
    );

const noStudents =
    document.getElementById(
        "noStudents"
    );


const totalStudents =
    document.getElementById(
        "totalStudents"
    );

const activeStudents =
    document.getElementById(
        "activeStudents"
    );

const inactiveStudents =
    document.getElementById(
        "inactiveStudents"
    );

const totalPrograms =
    document.getElementById(
        "totalPrograms"
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

const studentFormModal =
    document.getElementById(
        "studentFormModal"
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

const viewProgram =
    document.getElementById(
        "viewProgram"
    );

const viewLevel =
    document.getElementById(
        "viewLevel"
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

const studentForm =
    document.getElementById(
        "studentForm"
    );

const formTitle =
    document.getElementById(
        "formTitle"
    );

const editIndex =
    document.getElementById(
        "editIndex"
    );

const studentName =
    document.getElementById(
        "studentName"
    );

const studentEmail =
    document.getElementById(
        "studentEmail"
    );

const studentProgram =
    document.getElementById(
        "studentProgram"
    );

const studentLevel =
    document.getElementById(
        "studentLevel"
    );

const studentStatus =
    document.getElementById(
        "studentStatus"
    );


/* =========================================================
   DELETE ELEMENTS
========================================================= */

const deleteStudentName =
    document.getElementById(
        "deleteStudentName"
    );

const confirmDeleteBtn =
    document.getElementById(
        "confirmDeleteBtn"
    );


/* =========================================================
   ADD BUTTON
========================================================= */

const addStudentBtn =
    document.getElementById(
        "addStudentBtn"
    );


/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics() {

    totalStudents.textContent =
        students.length;


    activeStudents.textContent =
        students.filter(function (student) {

            return student.status === "Active";

        }).length;


    inactiveStudents.textContent =
        students.filter(function (student) {

            return student.status === "Inactive";

        }).length;


    const programs =
        new Set(
            students.map(function (student) {

                return student.program;

            })
        );


    totalPrograms.textContent =
        programs.size;

}


/* =========================================================
   PROGRAM FILTER
========================================================= */

function updateProgramFilter() {

    const currentValue =
        programFilter.value;


    const programs =
        [...new Set(
            students.map(function (student) {

                return student.program;

            })
        )].sort();


    programFilter.innerHTML = `
        <option value="all">
            All Programs
        </option>
    `;


    programs.forEach(function (program) {

        const option =
            document.createElement(
                "option"
            );

        option.value = program;

        option.textContent = program;

        programFilter.appendChild(
            option
        );

    });


    if (
        programs.includes(
            currentValue
        )
    ) {

        programFilter.value =
            currentValue;

    }

}


/* =========================================================
   FILTER STUDENTS
========================================================= */

function getFilteredStudents() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedProgram =
        programFilter.value;


    const selectedStatus =
        statusFilter.value;


    return students.filter(
        function (student) {

            const matchesSearch =
                student.name
                    .toLowerCase()
                    .includes(search)
                ||
                student.email
                    .toLowerCase()
                    .includes(search);


            const matchesProgram =
                selectedProgram === "all"
                ||
                student.program ===
                selectedProgram;


            const matchesStatus =
                selectedStatus === "all"
                ||
                student.status ===
                selectedStatus;


            return (
                matchesSearch &&
                matchesProgram &&
                matchesStatus
            );

        }
    );

}


/* =========================================================
   DISPLAY STUDENTS
========================================================= */

function displayStudents() {

    const filteredStudents =
        getFilteredStudents();


    tableBody.innerHTML = "";


    const totalPages =
        Math.ceil(
            filteredStudents.length /
            studentsPerPage
        );


    if (
        filteredStudents.length === 0
    ) {

        noStudents.style.display =
            "block";

        pageInfo.textContent =
            "Page 1";

        prevBtn.disabled = true;

        nextBtn.disabled = true;

        return;

    }


    noStudents.style.display =
        "none";


    if (
        currentPage > totalPages
    ) {

        currentPage =
            totalPages;

    }


    const start =
        (currentPage - 1) *
        studentsPerPage;


    const end =
        start + studentsPerPage;


    const pageStudents =
        filteredStudents.slice(
            start,
            end
        );


    pageStudents.forEach(
        function (student) {

            const realIndex =
                students.indexOf(
                    student
                );


            const row =
                document.createElement(
                    "tr"
                );


            const initial =
                student.name
                    .charAt(0)
                    .toUpperCase();


            row.innerHTML = `

                <td>

                    <div class="student-cell">

                        <div class="table-avatar">
                            ${escapeHTML(initial)}
                        </div>

                        <strong>
                            ${escapeHTML(
                                student.name
                            )}
                        </strong>

                    </div>

                </td>


                <td>
                    ${escapeHTML(
                        student.email
                    )}
                </td>


                <td>

                    <span class="program-badge">
                        ${escapeHTML(
                            student.program
                        )}
                    </span>

                </td>


                <td>
                    ${escapeHTML(
                        student.level
                    )}
                </td>


                <td>

                    <span
                        class="status ${student.status.toLowerCase()}"
                    >
                        ${escapeHTML(
                            student.status
                        )}
                    </span>

                </td>


                <td>
                    ${escapeHTML(
                        student.joined
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
   VIEW STUDENT
========================================================= */

function viewStudent(index) {

    const student =
        students[index];


    if (!student) return;


    viewAvatar.textContent =
        student.name
            .charAt(0)
            .toUpperCase();


    viewName.textContent =
        student.name;


    viewEmail.textContent =
        student.email;


    viewProgram.textContent =
        student.program;


    viewLevel.textContent =
        student.level;


    viewStatus.textContent =
        student.status;


    viewJoined.textContent =
        student.joined;


    openModal(viewModal);

}


/* =========================================================
   ADD STUDENT
========================================================= */

function openAddStudent() {

    formTitle.textContent =
        "Add Student";


    editIndex.value = "";


    studentForm.reset();


    studentLevel.value =
        "Beginner";


    studentStatus.value =
        "Active";


    openModal(
        studentFormModal
    );

}


/* =========================================================
   EDIT STUDENT
========================================================= */

function editStudent(index) {

    const student =
        students[index];


    if (!student) return;


    formTitle.textContent =
        "Edit Student";


    editIndex.value =
        index;


    studentName.value =
        student.name;


    studentEmail.value =
        student.email;


    studentProgram.value =
        student.program;


    studentLevel.value =
        student.level;


    studentStatus.value =
        student.status;


    openModal(
        studentFormModal
    );

}


/* =========================================================
   SAVE STUDENT
========================================================= */

studentForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const name =
            studentName.value.trim();


        const email =
            studentEmail.value.trim();


        const program =
            studentProgram.value.trim();


        const level =
            studentLevel.value;


        const status =
            studentStatus.value;


        if (
            !name ||
            !email ||
            !program
        ) {

            return;

        }


        const index =
            editIndex.value;


        /* EDIT */

        if (index !== "") {

            students[
                Number(index)
            ] = {

                ...students[
                    Number(index)
                ],

                name: name,

                email: email,

                program: program,

                level: level,

                status: status

            };

        }

        /* ADD */

        else {

            students.unshift({

                name: name,

                email: email,

                program: program,

                level: level,

                status: status,

                joined: getTodayDate()

            });


            currentPage = 1;

        }


        saveStudents();

        updateStatistics();

        updateProgramFilter();

        displayStudents();

        closeModal(
            studentFormModal
        );

    }
);


/* =========================================================
   DELETE STUDENT
========================================================= */

function openDeleteStudent(index) {

    const student =
        students[index];


    if (!student) return;


    deleteIndex =
        index;


    deleteStudentName.textContent =
        student.name;


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


        students.splice(
            deleteIndex,
            1
        );


        saveStudents();

        updateStatistics();

        updateProgramFilter();

        displayStudents();


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

            viewStudent(index);

        }


        if (
            action === "edit"
        ) {

            editStudent(index);

        }


        if (
            action === "delete"
        ) {

            openDeleteStudent(index);

        }

    }
);


/* =========================================================
   MODALS
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
   CLICK OUTSIDE MODAL
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

        displayStudents();

    }
);


/* =========================================================
   PROGRAM FILTER
========================================================= */

programFilter.addEventListener(
    "change",
    function () {

        currentPage = 1;

        displayStudents();

    }
);


/* =========================================================
   STATUS FILTER
========================================================= */

statusFilter.addEventListener(
    "change",
    function () {

        currentPage = 1;

        displayStudents();

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

            displayStudents();

        }

    }
);


/* =========================================================
   NEXT
========================================================= */

nextBtn.addEventListener(
    "click",
    function () {

        const filteredStudents =
            getFilteredStudents();


        const totalPages =
            Math.ceil(
                filteredStudents.length /
                studentsPerPage
            );


        if (
            currentPage < totalPages
        ) {

            currentPage++;

            displayStudents();

        }

    }
);


/* =========================================================
   ADD BUTTON
========================================================= */

addStudentBtn.addEventListener(
    "click",
    openAddStudent
);


/* =========================================================
   TODAY'S DATE
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

updateProgramFilter();

displayStudents();