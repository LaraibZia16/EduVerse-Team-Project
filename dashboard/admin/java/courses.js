"use strict";


/* =========================================================
   EDUVERSE ADMIN - COURSES
   ========================================================= */


const STORAGE_KEY = "eduverseCourses";

let courses = [];

let currentPage = 1;

const itemsPerPage = 5;

let editingCourseId = null;

let deletingCourseId = null;


/* =========================================================
   DEFAULT COURSES
   ========================================================= */

const defaultCourses = [

    {
        id: 1,
        name: "HTML & CSS Fundamentals",
        instructor: "Usman Ali",
        category: "Web Development",
        students: 42,
        status: "active",
        created: "15 Sep 2026",
        description:
            "Learn the fundamentals of HTML and CSS and build responsive web pages."
    },

    {
        id: 2,
        name: "JavaScript Essentials",
        instructor: "Ahmed Raza",
        category: "Programming",
        students: 35,
        status: "active",
        created: "12 Sep 2026",
        description:
            "Learn JavaScript fundamentals, DOM manipulation and modern JavaScript concepts."
    },

    {
        id: 3,
        name: "UI/UX Design Basics",
        instructor: "Fatima Noor",
        category: "Design",
        students: 28,
        status: "active",
        created: "10 Sep 2026",
        description:
            "Understand user interface and user experience design principles."
    },

    {
        id: 4,
        name: "Python Programming",
        instructor: "Hamza Khan",
        category: "Programming",
        students: 31,
        status: "active",
        created: "08 Sep 2026",
        description:
            "Learn Python programming from basic syntax to practical programming concepts."
    },

    {
        id: 5,
        name: "React JS Development",
        instructor: "Zain Ali",
        category: "Web Development",
        students: 24,
        status: "draft",
        created: "06 Sep 2026",
        description:
            "Build modern web applications using React components and state management."
    },

    {
        id: 6,
        name: "Database Management",
        instructor: "Sara Ahmed",
        category: "Database",
        students: 19,
        status: "active",
        created: "04 Sep 2026",
        description:
            "Learn database concepts, tables, queries and database management."
    },

    {
        id: 7,
        name: "Digital Marketing",
        instructor: "Hina Ahmed",
        category: "Digital Marketing",
        students: 16,
        status: "inactive",
        created: "02 Sep 2026",
        description:
            "Learn the basics of digital marketing, SEO and online promotion."
    }

];


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadCourses();

    setupEvents();

    populateCategoryFilter();

    updateStats();

    renderCourses();

});


/* =========================================================
   LOAD COURSES
   ========================================================= */

function loadCourses() {

    const savedCourses = localStorage.getItem(STORAGE_KEY);

    if (savedCourses) {

        try {

            courses = JSON.parse(savedCourses);

        } catch (error) {

            courses = [...defaultCourses];

            saveCourses();

        }

    } else {

        courses = [...defaultCourses];

        saveCourses();

    }

}


/* =========================================================
   SAVE COURSES
   ========================================================= */

function saveCourses() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(courses)
    );

}


/* =========================================================
   EVENTS
   ========================================================= */

function setupEvents() {

    const searchInput =
        document.getElementById("searchInput");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const statusFilter =
        document.getElementById("statusFilter");

    const addButton =
        document.getElementById("openAddCourseBtn");

    const courseForm =
        document.getElementById("courseForm");

    const confirmDelete =
        document.getElementById("confirmDeleteBtn");


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                currentPage = 1;

                renderCourses();

            }
        );

    }


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            function () {

                currentPage = 1;

                renderCourses();

            }
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            function () {

                currentPage = 1;

                renderCourses();

            }
        );

    }


    if (addButton) {

        addButton.addEventListener(
            "click",
            openAddModal
        );

    }


    if (courseForm) {

        courseForm.addEventListener(
            "submit",
            saveCourse
        );

    }


    if (confirmDelete) {

        confirmDelete.addEventListener(
            "click",
            deleteCourse
        );

    }


    document.addEventListener(
        "click",
        handleTableActions
    );


    document.querySelectorAll("[data-close]").forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    closeModal(
                        button.dataset.close
                    );

                }
            );

        }
    );


    document.querySelectorAll(".modal-overlay").forEach(
        function (modal) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (event.target === modal) {

                        closeModal(modal.id);

                    }

                }
            );

        }
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                document
                    .querySelectorAll(".modal-overlay.active")
                    .forEach(function (modal) {

                        closeModal(modal.id);

                    });

            }

        }
    );

}


/* =========================================================
   FILTER COURSES
   ========================================================= */

function getFilteredCourses() {

    const searchInput =
        document.getElementById("searchInput");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const statusFilter =
        document.getElementById("statusFilter");


    const search =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";


    const category =
        categoryFilter
            ? categoryFilter.value
            : "all";


    const status =
        statusFilter
            ? statusFilter.value
            : "all";


    return courses.filter(function (course) {

        const matchesSearch =
            course.name.toLowerCase().includes(search) ||
            course.instructor.toLowerCase().includes(search);


        const matchesCategory =
            category === "all" ||
            course.category === category;


        const matchesStatus =
            status === "all" ||
            course.status === status;


        return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus
        );

    });

}


/* =========================================================
   RENDER COURSES
   ========================================================= */

function renderCourses() {

    const tableBody =
        document.getElementById("coursesTableBody");

    const emptyState =
        document.getElementById("emptyState");


    if (!tableBody) return;


    const filteredCourses =
        getFilteredCourses();


    const totalPages =
        Math.ceil(
            filteredCourses.length / itemsPerPage
        );


    if (
        currentPage > totalPages &&
        totalPages > 0
    ) {

        currentPage = totalPages;

    }


    const start =
        (currentPage - 1) * itemsPerPage;


    const paginatedCourses =
        filteredCourses.slice(
            start,
            start + itemsPerPage
        );


    tableBody.innerHTML = "";


    if (paginatedCourses.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-results">
                    No courses found.
                </td>
            </tr>
        `;

        if (emptyState) {

            emptyState.classList.add("show");

        }

    } else {

        if (emptyState) {

            emptyState.classList.remove("show");

        }


        paginatedCourses.forEach(
            function (course) {

                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>

                        <div class="course-info">

                            <div class="course-icon">
                                📚
                            </div>

                            <div>

                                <strong>
                                    ${escapeHTML(course.name)}
                                </strong>

                                <span>
                                    Course
                                </span>

                            </div>

                        </div>

                    </td>


                    <td>
                        ${escapeHTML(course.instructor)}
                    </td>


                    <td>
                        <span class="category-badge">
                            ${escapeHTML(course.category)}
                        </span>
                    </td>


                    <td>
                        ${course.students}
                    </td>


                    <td>

                        <span class="
                            status-badge
                            ${course.status}
                        ">

                            ${capitalize(course.status)}

                        </span>

                    </td>


                    <td>
                        ${escapeHTML(course.created)}
                    </td>


                    <td>

                        <div class="action-buttons">

                            <button
                                class="action-btn view"
                                data-action="view"
                                data-id="${course.id}"
                                title="View"
                            >
                                👁
                            </button>


                            <button
                                class="action-btn edit"
                                data-action="edit"
                                data-id="${course.id}"
                                title="Edit"
                            >
                                ✏️
                            </button>


                            <button
                                class="action-btn delete"
                                data-action="delete"
                                data-id="${course.id}"
                                title="Delete"
                            >
                                🗑
                            </button>

                        </div>

                    </td>

                `;


                tableBody.appendChild(row);

            }
        );

    }


    renderPagination(
        filteredCourses.length,
        totalPages
    );

}


/* =========================================================
   TABLE ACTIONS
   ========================================================= */

function handleTableActions(event) {

    const button =
        event.target.closest("[data-action]");


    if (!button) return;


    const id =
        Number(button.dataset.id);


    const action =
        button.dataset.action;


    if (action === "view") {

        viewCourse(id);

    }


    if (action === "edit") {

        editCourse(id);

    }


    if (action === "delete") {

        openDeleteModal(id);

    }

}


/* =========================================================
   VIEW COURSE
   ========================================================= */

function viewCourse(id) {

    const course =
        courses.find(function (item) {

            return item.id === id;

        });


    if (!course) return;


    document.getElementById(
        "viewCourseName"
    ).textContent = course.name;


    document.getElementById(
        "viewInstructor"
    ).textContent =
        "Instructor: " + course.instructor;


    document.getElementById(
        "viewCategory"
    ).textContent = course.category;


    document.getElementById(
        "viewStudents"
    ).textContent =
        course.students + " students";


    document.getElementById(
        "viewStatus"
    ).textContent =
        capitalize(course.status);


    document.getElementById(
        "viewCreated"
    ).textContent = course.created;


    document.getElementById(
        "viewDescription"
    ).textContent =
        course.description ||
        "No description available.";


    openModal("viewModal");

}


/* =========================================================
   OPEN ADD MODAL
   ========================================================= */

function openAddModal() {

    editingCourseId = null;


    const form =
        document.getElementById("courseForm");


    form.reset();


    document.getElementById(
        "courseId"
    ).value = "";


    document.getElementById(
        "courseModalTitle"
    ).textContent = "Add Course";


    document.getElementById(
        "courseModalSubtitle"
    ).textContent =
        "Create a new course";


    document.getElementById(
        "courseStatus"
    ).value = "active";


    openModal("courseModal");

}


/* =========================================================
   EDIT COURSE
   ========================================================= */

function editCourse(id) {

    const course =
        courses.find(function (item) {

            return item.id === id;

        });


    if (!course) return;


    editingCourseId = id;


    document.getElementById(
        "courseId"
    ).value = course.id;


    document.getElementById(
        "courseName"
    ).value = course.name;


    document.getElementById(
        "instructor"
    ).value = course.instructor;


    document.getElementById(
        "category"
    ).value = course.category;


    document.getElementById(
        "studentCount"
    ).value = course.students;


    document.getElementById(
        "courseStatus"
    ).value = course.status;


    document.getElementById(
        "description"
    ).value = course.description || "";


    document.getElementById(
        "courseModalTitle"
    ).textContent = "Edit Course";


    document.getElementById(
        "courseModalSubtitle"
    ).textContent =
        "Update course information";


    openModal("courseModal");

}


/* =========================================================
   SAVE COURSE
   ========================================================= */

function saveCourse(event) {

    event.preventDefault();


    const name =
        document.getElementById(
            "courseName"
        ).value.trim();


    const instructor =
        document.getElementById(
            "instructor"
        ).value.trim();


    const category =
        document.getElementById(
            "category"
        ).value;


    const students =
        Number(
            document.getElementById(
                "studentCount"
            ).value
        );


    const status =
        document.getElementById(
            "courseStatus"
        ).value;


    const description =
        document.getElementById(
            "description"
        ).value.trim();


    if (!name || !instructor || !category) {

        return;

    }


    if (editingCourseId) {

        const index =
            courses.findIndex(
                function (course) {

                    return course.id === editingCourseId;

                }
            );


        if (index !== -1) {

            courses[index].name = name;

            courses[index].instructor =
                instructor;

            courses[index].category =
                category;

            courses[index].students =
                students;

            courses[index].status =
                status;

            courses[index].description =
                description;

        }

    } else {

        const newCourse = {

            id: Date.now(),

            name: name,

            instructor: instructor,

            category: category,

            students: students,

            status: status,

            created: getTodayDate(),

            description: description

        };


        courses.unshift(newCourse);

    }


    saveCourses();

    populateCategoryFilter();

    updateStats();

    currentPage = 1;

    renderCourses();

    closeModal("courseModal");

}


/* =========================================================
   DELETE MODAL
   ========================================================= */

function openDeleteModal(id) {

    const course =
        courses.find(function (item) {

            return item.id === id;

        });


    if (!course) return;


    deletingCourseId = id;


    document.getElementById(
        "deleteCourseName"
    ).textContent = course.name;


    openModal("deleteModal");

}


/* =========================================================
   DELETE COURSE
   ========================================================= */

function deleteCourse() {

    if (!deletingCourseId) return;


    courses =
        courses.filter(function (course) {

            return course.id !== deletingCourseId;

        });


    saveCourses();

    populateCategoryFilter();

    updateStats();

    renderCourses();

    closeModal("deleteModal");


    deletingCourseId = null;

}


/* =========================================================
   CATEGORY FILTER
   ========================================================= */

function populateCategoryFilter() {

    const select =
        document.getElementById(
            "categoryFilter"
        );


    if (!select) return;


    const currentValue =
        select.value;


    const categories =
        [...new Set(
            courses.map(function (course) {

                return course.category;

            })
        )].sort();


    select.innerHTML =
        `<option value="all">
            All Categories
        </option>`;


    categories.forEach(
        function (category) {

            const option =
                document.createElement("option");


            option.value = category;

            option.textContent = category;


            select.appendChild(option);

        }
    );


    if (
        categories.includes(currentValue)
    ) {

        select.value = currentValue;

    }

}


/* =========================================================
   UPDATE STATS
   ========================================================= */

function updateStats() {

    const total =
        courses.length;


    const active =
        courses.filter(function (course) {

            return course.status === "active";

        }).length;


    const draft =
        courses.filter(function (course) {

            return course.status === "draft";

        }).length;


    const categories =
        new Set(
            courses.map(function (course) {

                return course.category;

            })
        ).size;


    document.getElementById(
        "totalCourses"
    ).textContent = total;


    document.getElementById(
        "activeCourses"
    ).textContent = active;


    document.getElementById(
        "draftCourses"
    ).textContent = draft;


    document.getElementById(
        "totalCategories"
    ).textContent = categories;

}


/* =========================================================
   PAGINATION
   ========================================================= */

function renderPagination(
    totalItems,
    totalPages
) {

    const pagination =
        document.getElementById(
            "pagination"
        );


    if (!pagination) return;


    pagination.innerHTML = "";


    if (totalPages <= 1) return;


    const previous =
        document.createElement("button");


    previous.textContent = "‹";

    previous.disabled =
        currentPage === 1;


    previous.addEventListener(
        "click",
        function () {

            if (currentPage > 1) {

                currentPage--;

                renderCourses();

            }

        }
    );


    pagination.appendChild(previous);


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement("button");


        button.textContent = page;


        if (page === currentPage) {

            button.classList.add("active");

        }


        button.addEventListener(
            "click",
            function () {

                currentPage = page;

                renderCourses();

            }
        );


        pagination.appendChild(button);

    }


    const next =
        document.createElement("button");


    next.textContent = "›";

    next.disabled =
        currentPage === totalPages;


    next.addEventListener(
        "click",
        function () {

            if (currentPage < totalPages) {

                currentPage++;

                renderCourses();

            }

        }
    );


    pagination.appendChild(next);

}


/* =========================================================
   MODALS
   ========================================================= */

function openModal(id) {

    const modal =
        document.getElementById(id);


    if (modal) {

        modal.classList.add("active");

        document.body.classList.add(
            "modal-open"
        );

    }

}


function closeModal(id) {

    const modal =
        document.getElementById(id);


    if (modal) {

        modal.classList.remove("active");

    }


    if (
        !document.querySelector(
            ".modal-overlay.active"
        )
    ) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


/* =========================================================
   TODAY DATE
   ========================================================= */

function getTodayDate() {

    const date = new Date();


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];


    const month =
        monthNames[
            date.getMonth()
        ];


    const year =
        date.getFullYear();


    return `${day} ${month} ${year}`;

}


/* =========================================================
   HELPERS
   ========================================================= */

function capitalize(value) {

    return value.charAt(0).toUpperCase()
        + value.slice(1);

}


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