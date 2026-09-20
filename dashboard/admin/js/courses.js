/* ==========================================================
   START - EDUVERSE ADMIN MANAGE COURSES
========================================================== */


/* ==========================================================
   START - FIREBASE IMPORTS
========================================================== */

import {
    auth,
    db
} from "../../../assets/js/firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

/* ==========================================================
   END - FIREBASE IMPORTS
========================================================== */


/* ==========================================================
   START - DOM ELEMENTS
========================================================== */

const logoutBtn = document.getElementById("logoutBtn");

const menuToggle = document.getElementById("menuToggle");
const sidebarClose = document.getElementById("sidebarClose");
const adminSidebar = document.getElementById("adminSidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

const adminName = document.getElementById("adminName");


/* ----------------------------------------------------------
   Course Statistics
---------------------------------------------------------- */

const totalCoursesElement =
    document.getElementById("totalCourses");

const activeCoursesElement =
    document.getElementById("activeCourses");

const inactiveCoursesElement =
    document.getElementById("inactiveCourses");

const totalEnrollmentsElement =
    document.getElementById("totalEnrollments");


/* ----------------------------------------------------------
   Search / Filters
---------------------------------------------------------- */

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const statusFilter =
    document.getElementById("statusFilter");


/* ----------------------------------------------------------
   Table
---------------------------------------------------------- */

const coursesTableBody =
    document.getElementById("coursesTableBody");

const coursesResultText =
    document.getElementById("coursesResultText");

const noCourses =
    document.getElementById("noCourses");


/* ----------------------------------------------------------
   Pagination
---------------------------------------------------------- */

const paginationSummary =
    document.getElementById("paginationSummary");

const pageInfo =
    document.getElementById("pageInfo");

const prevBtn =
    document.getElementById("prevBtn");

const nextBtn =
    document.getElementById("nextBtn");


/* ----------------------------------------------------------
   Add Course
---------------------------------------------------------- */

const addCourseBtn =
    document.getElementById("addCourseBtn");


/* ----------------------------------------------------------
   View Modal
---------------------------------------------------------- */

const viewCourseModal =
    document.getElementById("viewCourseModal");

const closeViewModal =
    document.getElementById("closeViewModal");

const viewCourseTitle =
    document.getElementById("viewCourseTitle");

const viewCourseCategory =
    document.getElementById("viewCourseCategory");

const viewCourseTeacher =
    document.getElementById("viewCourseTeacher");

const viewCourseEnrollments =
    document.getElementById("viewCourseEnrollments");

const viewCourseStatus =
    document.getElementById("viewCourseStatus");

const viewCourseCreated =
    document.getElementById("viewCourseCreated");

const viewCourseDescription =
    document.getElementById("viewCourseDescription");


/* ----------------------------------------------------------
   Add / Edit Modal
---------------------------------------------------------- */

const courseFormModal =
    document.getElementById("courseFormModal");

const closeCourseFormModal =
    document.getElementById("closeCourseFormModal");

const cancelCourseBtn =
    document.getElementById("cancelCourseBtn");

const courseForm =
    document.getElementById("courseForm");

const courseId =
    document.getElementById("courseId");

const courseTitle =
    document.getElementById("courseTitle");

const courseCategory =
    document.getElementById("courseCategory");

const courseTeacher =
    document.getElementById("courseTeacher");

const courseStatus =
    document.getElementById("courseStatus");

const courseDescription =
    document.getElementById("courseDescription");

const courseFormLabel =
    document.getElementById("courseFormLabel");

const courseFormTitle =
    document.getElementById("courseFormTitle");

const courseFormMessage =
    document.getElementById("courseFormMessage");

const saveCourseBtn =
    document.getElementById("saveCourseBtn");


/* ----------------------------------------------------------
   Delete Modal
---------------------------------------------------------- */

const deleteCourseModal =
    document.getElementById("deleteCourseModal");

const closeDeleteModal =
    document.getElementById("closeDeleteModal");

const cancelDeleteBtn =
    document.getElementById("cancelDeleteBtn");

const confirmDeleteBtn =
    document.getElementById("confirmDeleteBtn");

const deleteCourseName =
    document.getElementById("deleteCourseName");

/* ==========================================================
   END - DOM ELEMENTS
========================================================== */


/* ==========================================================
   START - PAGE STATE
========================================================== */

let allCourses = [];
let filteredCourses = [];
let allTeachers = [];

let currentPage = 1;

let courseToDeleteId = null;

const coursesPerPage = 5;

/* ==========================================================
   END - PAGE STATE
========================================================== */


/* ==========================================================
   START - ADMIN AUTH PROTECTION
========================================================== */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.replace(
                "../../../login.html"
            );

            return;
        }


        try {

            const adminSnapshot =
                await getDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    )
                );


            if (!adminSnapshot.exists()) {

                await signOut(auth);

                window.location.replace(
                    "../../../login.html"
                );

                return;
            }


            const adminData =
                adminSnapshot.data();


            if (
                normalizeRole(adminData.role) !==
                "admin"
            ) {

                await signOut(auth);

                window.location.replace(
                    "../../../login.html"
                );

                return;
            }


            setAdminInformation(
                adminData,
                user
            );


            /*
               Admin authentication passed.

               Load teachers first because course
               table and form need teacher names.
            */

            await loadTeachers();

            await loadCourses();


        } catch (error) {

            console.error(
                "Manage Courses Authentication Error:",
                error
            );


            try {

                await signOut(auth);

            } catch (signOutError) {

                console.error(
                    "Sign Out Error:",
                    signOutError
                );

            }


            window.location.replace(
                "../../../login.html"
            );

        }

    }
);

/* ==========================================================
   END - ADMIN AUTH PROTECTION
========================================================== */


/* ==========================================================
   START - ADMIN INFORMATION
========================================================== */

function setAdminInformation(
    userData,
    firebaseUser
) {

    if (!adminName) {
        return;
    }


    const name =
        userData.name ||
        userData.fullName ||
        firebaseUser.displayName ||
        "Admin";


    adminName.textContent = name;

}

/* ==========================================================
   END - ADMIN INFORMATION
========================================================== */


/* ==========================================================
   START - LOAD TEACHERS
========================================================== */

async function loadTeachers() {

    try {

        const usersSnapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );


        allTeachers =
            usersSnapshot.docs
                .map((userDocument) => {

                    return {
                        id: userDocument.id,
                        ...userDocument.data()
                    };

                })
                .filter((user) => {

                    return (
                        normalizeRole(user.role) ===
                        "teacher"
                    );

                });


        allTeachers.sort(
            (a, b) => {

                return getUserName(a)
                    .localeCompare(
                        getUserName(b)
                    );

            }
        );


        renderTeacherOptions();


    } catch (error) {

        console.error(
            "Load Teachers Error:",
            error
        );


        allTeachers = [];

        renderTeacherOptions();

    }

}

/* ==========================================================
   END - LOAD TEACHERS
========================================================== */


/* ==========================================================
   START - TEACHER OPTIONS
========================================================== */

function renderTeacherOptions(
    selectedTeacherId = ""
) {

    if (!courseTeacher) {
        return;
    }


    if (allTeachers.length === 0) {

        courseTeacher.innerHTML = `
            <option value="">
                No registered teachers available
            </option>
        `;

        return;
    }


    courseTeacher.innerHTML = `
        <option value="">
            Select Teacher
        </option>

        ${allTeachers
            .map((teacher) => {

                const teacherName =
                    getUserName(teacher);

                const selected =
                    teacher.id ===
                    selectedTeacherId
                        ? "selected"
                        : "";

                return `
                    <option
                        value="${escapeHTML(teacher.id)}"
                        ${selected}
                    >
                        ${escapeHTML(teacherName)}
                    </option>
                `;

            })
            .join("")}
    `;

}

/* ==========================================================
   END - TEACHER OPTIONS
========================================================== */


/* ==========================================================
   START - LOAD COURSES
========================================================== */

async function loadCourses() {

    try {

        const coursesSnapshot =
            await getDocs(
                collection(
                    db,
                    "courses"
                )
            );


        allCourses =
            coursesSnapshot.docs.map(
                (courseDocument) => {

                    return {
                        id: courseDocument.id,
                        ...courseDocument.data()
                    };

                }
            );


        allCourses.sort(
            sortCoursesByNewest
        );


        updateStatistics();

        updateCategoryFilter();

        applyFilters();


    } catch (error) {

        console.error(
            "Manage Courses Data Error:",
            error
        );


        showCoursesLoadError();

    }

}

/* ==========================================================
   END - LOAD COURSES
========================================================== */


/* ==========================================================
   START - COURSE STATISTICS
========================================================== */

function updateStatistics() {

    const activeCourses =
        allCourses.filter(
            (course) => {

                return (
                    normalizeCourseStatus(
                        course.status
                    ) === "active"
                );

            }
        ).length;


    const draftInactiveCourses =
        allCourses.filter(
            (course) => {

                const status =
                    normalizeCourseStatus(
                        course.status
                    );

                return (
                    status === "draft" ||
                    status === "inactive"
                );

            }
        ).length;


    const totalEnrollments =
        allCourses.reduce(
            (total, course) => {

                return (
                    total +
                    getEnrollmentCount(course)
                );

            },
            0
        );


    if (totalCoursesElement) {

        totalCoursesElement.textContent =
            allCourses.length;

    }


    if (activeCoursesElement) {

        activeCoursesElement.textContent =
            activeCourses;

    }


    if (inactiveCoursesElement) {

        inactiveCoursesElement.textContent =
            draftInactiveCourses;

    }


    if (totalEnrollmentsElement) {

        totalEnrollmentsElement.textContent =
            totalEnrollments;

    }

}

/* ==========================================================
   END - COURSE STATISTICS
========================================================== */


/* ==========================================================
   START - CATEGORY FILTER
========================================================== */

function updateCategoryFilter() {

    if (!categoryFilter) {
        return;
    }


    const currentValue =
        categoryFilter.value || "all";


    const categories = [
        ...new Set(
            allCourses
                .map((course) => {

                    return String(
                        course.category || ""
                    ).trim();

                })
                .filter(Boolean)
        )
    ].sort(
        (a, b) => a.localeCompare(b)
    );


    categoryFilter.innerHTML = `
        <option value="all">
            All Categories
        </option>

        ${categories
            .map((category) => {

                return `
                    <option
                        value="${escapeHTML(category)}"
                    >
                        ${escapeHTML(category)}
                    </option>
                `;

            })
            .join("")}
    `;


    const categoryStillExists =
        currentValue === "all" ||
        categories.includes(
            currentValue
        );


    categoryFilter.value =
        categoryStillExists
            ? currentValue
            : "all";

}

/* ==========================================================
   END - CATEGORY FILTER
========================================================== */


/* ==========================================================
   START - SEARCH AND FILTER
========================================================== */

function applyFilters() {

    const searchTerm =
        String(
            searchInput?.value || ""
        )
            .trim()
            .toLowerCase();


    const selectedCategory =
        String(
            categoryFilter?.value || "all"
        )
            .trim()
            .toLowerCase();


    const selectedStatus =
        normalizeCourseStatusFilter(
            statusFilter?.value || "all"
        );


    filteredCourses =
        allCourses.filter(
            (course) => {

                const title =
                    String(
                        course.title || ""
                    ).toLowerCase();


                const category =
                    String(
                        course.category || ""
                    ).toLowerCase();


                const description =
                    String(
                        course.description || ""
                    ).toLowerCase();


                const teacherName =
                    getCourseTeacherName(course)
                        .toLowerCase();


                const status =
                    normalizeCourseStatus(
                        course.status
                    );


                const matchesSearch =
                    title.includes(searchTerm) ||
                    category.includes(searchTerm) ||
                    description.includes(searchTerm) ||
                    teacherName.includes(searchTerm);


                const matchesCategory =
                    selectedCategory === "all" ||
                    category === selectedCategory;


                const matchesStatus =
                    selectedStatus === "all" ||
                    status === selectedStatus;


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesStatus
                );

            }
        );


    currentPage = 1;

    renderCourses();

}

/* ==========================================================
   END - SEARCH AND FILTER
========================================================== */


/* ==========================================================
   START - RENDER COURSES
========================================================== */

function renderCourses() {

    if (!coursesTableBody) {
        return;
    }


    const totalFilteredCourses =
        filteredCourses.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalFilteredCourses /
                coursesPerPage
            )
        );


    if (currentPage > totalPages) {

        currentPage = totalPages;

    }


    const startIndex =
        (currentPage - 1) *
        coursesPerPage;


    const endIndex =
        startIndex +
        coursesPerPage;


    const coursesForCurrentPage =
        filteredCourses.slice(
            startIndex,
            endIndex
        );


    if (totalFilteredCourses === 0) {

        coursesTableBody.innerHTML = "";


        if (noCourses) {

            noCourses.hidden = false;

        }


        updateResultsText(0);


        updatePagination(
            0,
            1,
            0,
            0
        );


        return;
    }


    if (noCourses) {

        noCourses.hidden = true;

    }


    coursesTableBody.innerHTML =
        coursesForCurrentPage
            .map(createCourseRow)
            .join("");


    addCourseActionEvents();


    updateResultsText(
        totalFilteredCourses
    );


    updatePagination(
        totalFilteredCourses,
        totalPages,
        startIndex,
        coursesForCurrentPage.length
    );

}

/* ==========================================================
   END - RENDER COURSES
========================================================== */


/* ==========================================================
   START - CREATE COURSE ROW
========================================================== */

function createCourseRow(course) {

    const title =
        getCourseTitle(course);


    const category =
        course.category ||
        "Uncategorized";


    const teacherName =
        getCourseTeacherName(course);


    const teacherInitial =
        getInitial(teacherName);


    const enrollmentCount =
        getEnrollmentCount(course);


    const status =
        normalizeCourseStatus(
            course.status
        );


    const formattedStatus =
        formatCourseStatus(status);


    return `
        <tr>

            <td>

                <div class="table-course">

                    <span class="table-course-icon">

                        <i class="fa-solid fa-book-open"></i>

                    </span>


                    <div class="table-course-info">

                        <strong>
                            ${escapeHTML(title)}
                        </strong>

                        <span>
                            ${escapeHTML(
                                getShortDescription(
                                    course.description
                                )
                            )}
                        </span>

                    </div>

                </div>

            </td>


            <td>

                <span class="category-badge">
                    ${escapeHTML(category)}
                </span>

            </td>


            <td>

                <div class="course-teacher">

                    <span class="teacher-mini-avatar">
                        ${escapeHTML(teacherInitial)}
                    </span>

                    <span>
                        ${escapeHTML(teacherName)}
                    </span>

                </div>

            </td>


            <td>

                <span class="enrollment-count">

                    <i class="fa-solid fa-user-graduate"></i>

                    ${enrollmentCount}

                </span>

            </td>


            <td>

                <span
                    class="course-status-badge status-${escapeHTML(status)}"
                >
                    ${escapeHTML(formattedStatus)}
                </span>

            </td>


            <td>

                <div class="course-action-buttons">


                    <button
                        type="button"
                        class="view-course-btn"
                        data-course-id="${escapeHTML(course.id)}"
                        aria-label="View course"
                        title="View Course"
                    >

                        <i class="fa-regular fa-eye"></i>

                    </button>


                    <button
                        type="button"
                        class="edit-course-btn"
                        data-course-id="${escapeHTML(course.id)}"
                        aria-label="Edit course"
                        title="Edit Course"
                    >

                        <i class="fa-regular fa-pen-to-square"></i>

                    </button>


                    <button
                        type="button"
                        class="delete-course-btn"
                        data-course-id="${escapeHTML(course.id)}"
                        aria-label="Delete course"
                        title="Delete Course"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>


                </div>

            </td>

        </tr>
    `;

}

/* ==========================================================
   END - CREATE COURSE ROW
========================================================== */


/* ==========================================================
   START - RESULT TEXT
========================================================== */

function updateResultsText(total) {

    if (!coursesResultText) {
        return;
    }


    if (total === 0) {

        coursesResultText.textContent =
            "No courses match your search.";

        return;
    }


    if (total === 1) {

        coursesResultText.textContent =
            "1 course found.";

        return;
    }


    coursesResultText.textContent =
        `${total} courses found.`;

}

/* ==========================================================
   END - RESULT TEXT
========================================================== */


/* ==========================================================
   START - PAGINATION
========================================================== */

function updatePagination(
    totalCourses,
    totalPages,
    startIndex,
    currentPageCourseCount
) {

    if (pageInfo) {

        pageInfo.textContent =
            `Page ${currentPage} of ${totalPages}`;

    }


    if (prevBtn) {

        prevBtn.disabled =
            currentPage <= 1;

    }


    if (nextBtn) {

        nextBtn.disabled =
            currentPage >= totalPages ||
            totalCourses === 0;

    }


    if (!paginationSummary) {
        return;
    }


    if (totalCourses === 0) {

        paginationSummary.textContent =
            "Showing 0 courses";

        return;
    }


    const firstCourseNumber =
        startIndex + 1;


    const lastCourseNumber =
        startIndex +
        currentPageCourseCount;


    paginationSummary.textContent =
        `Showing ${firstCourseNumber}–${lastCourseNumber} of ${totalCourses} courses`;

}


/* ----------------------------------------------------------
   Previous Page
---------------------------------------------------------- */

if (prevBtn) {

    prevBtn.addEventListener(
        "click",
        () => {

            if (currentPage <= 1) {
                return;
            }


            currentPage--;

            renderCourses();

        }
    );

}


/* ----------------------------------------------------------
   Next Page
---------------------------------------------------------- */

if (nextBtn) {

    nextBtn.addEventListener(
        "click",
        () => {

            const totalPages =
                Math.max(
                    1,
                    Math.ceil(
                        filteredCourses.length /
                        coursesPerPage
                    )
                );


            if (
                currentPage >= totalPages
            ) {
                return;
            }


            currentPage++;

            renderCourses();

        }
    );

}

/* ==========================================================
   END - PAGINATION
========================================================== */


/* ==========================================================
   START - SEARCH / FILTER EVENTS
========================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        applyFilters
    );

}


if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        applyFilters
    );

}


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        applyFilters
    );

}

/* ==========================================================
   END - SEARCH / FILTER EVENTS
========================================================== */


/* ==========================================================
   START - COURSE ACTION EVENTS
========================================================== */

function addCourseActionEvents() {

    const viewButtons =
        document.querySelectorAll(
            ".view-course-btn"
        );


    const editButtons =
        document.querySelectorAll(
            ".edit-course-btn"
        );


    const deleteButtons =
        document.querySelectorAll(
            ".delete-course-btn"
        );


    viewButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    openCourseDetails(
                        button.dataset.courseId
                    );

                }
            );

        }
    );


    editButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    openEditCourseModal(
                        button.dataset.courseId
                    );

                }
            );

        }
    );


    deleteButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    openDeleteCourseModal(
                        button.dataset.courseId
                    );

                }
            );

        }
    );

}

/* ==========================================================
   END - COURSE ACTION EVENTS
========================================================== */


/* ==========================================================
   START - VIEW COURSE
========================================================== */

function openCourseDetails(courseDocumentId) {

    const selectedCourse =
        findCourseById(
            courseDocumentId
        );


    if (
        !selectedCourse ||
        !viewCourseModal
    ) {
        return;
    }


    if (viewCourseTitle) {

        viewCourseTitle.textContent =
            getCourseTitle(
                selectedCourse
            );

    }


    if (viewCourseCategory) {

        viewCourseCategory.textContent =
            selectedCourse.category ||
            "Uncategorized";

    }


    if (viewCourseTeacher) {

        viewCourseTeacher.textContent =
            getCourseTeacherName(
                selectedCourse
            );

    }


    if (viewCourseEnrollments) {

        viewCourseEnrollments.textContent =
            getEnrollmentCount(
                selectedCourse
            );

    }


    if (viewCourseStatus) {

        viewCourseStatus.textContent =
            formatCourseStatus(
                selectedCourse.status
            );

    }


    if (viewCourseCreated) {

        viewCourseCreated.textContent =
            formatCourseDate(
                selectedCourse
            );

    }


    if (viewCourseDescription) {

        viewCourseDescription.textContent =
            selectedCourse.description ||
            "No description available.";

    }


    openModal(
        viewCourseModal
    );

}

/* ==========================================================
   END - VIEW COURSE
========================================================== */


/* ==========================================================
   START - ADD COURSE
========================================================== */

if (addCourseBtn) {

    addCourseBtn.addEventListener(
        "click",
        () => {

            openAddCourseModal();

        }
    );

}


function openAddCourseModal() {

    if (
        !courseFormModal ||
        !courseForm
    ) {
        return;
    }


    courseForm.reset();


    if (courseId) {
        courseId.value = "";
    }


    if (courseStatus) {
        courseStatus.value = "active";
    }


    if (courseFormLabel) {

        courseFormLabel.textContent =
            "ADD COURSE";

    }


    if (courseFormTitle) {

        courseFormTitle.textContent =
            "Create New Course";

    }


    renderTeacherOptions();

    hideCourseFormMessage();

    openModal(
        courseFormModal
    );


    setTimeout(() => {

        courseTitle?.focus();

    }, 100);

}

/* ==========================================================
   END - ADD COURSE
========================================================== */


/* ==========================================================
   START - EDIT COURSE
========================================================== */

function openEditCourseModal(
    courseDocumentId
) {

    const selectedCourse =
        findCourseById(
            courseDocumentId
        );


    if (
        !selectedCourse ||
        !courseFormModal
    ) {
        return;
    }


    if (courseId) {

        courseId.value =
            selectedCourse.id;

    }


    if (courseTitle) {

        courseTitle.value =
            selectedCourse.title || "";

    }


    if (courseCategory) {

        courseCategory.value =
            selectedCourse.category || "";

    }


    renderTeacherOptions(
        selectedCourse.teacherId || ""
    );


    if (courseStatus) {

        courseStatus.value =
            normalizeCourseStatus(
                selectedCourse.status
            );

    }


    if (courseDescription) {

        courseDescription.value =
            selectedCourse.description || "";

    }


    if (courseFormLabel) {

        courseFormLabel.textContent =
            "EDIT COURSE";

    }


    if (courseFormTitle) {

        courseFormTitle.textContent =
            "Update Course";

    }


    hideCourseFormMessage();


    openModal(
        courseFormModal
    );


    setTimeout(() => {

        courseTitle?.focus();

    }, 100);

}

/* ==========================================================
   END - EDIT COURSE
========================================================== */


/* ==========================================================
   START - COURSE FORM SUBMIT
========================================================== */

if (courseForm) {

    courseForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const editingCourseId =
                courseId?.value.trim() || "";


            const title =
                courseTitle?.value.trim() || "";


            const category =
                courseCategory?.value.trim() || "";


            const teacherId =
                courseTeacher?.value.trim() || "";


            const status =
                normalizeCourseStatus(
                    courseStatus?.value
                );


            const description =
                courseDescription?.value.trim() || "";


            if (title.length < 3) {

                showCourseFormMessage(
                    "Please enter a valid course title.",
                    "error"
                );

                return;
            }


            if (category.length < 2) {

                showCourseFormMessage(
                    "Please enter a valid category.",
                    "error"
                );

                return;
            }


            if (!teacherId) {

                showCourseFormMessage(
                    "Please assign a teacher.",
                    "error"
                );

                return;
            }


            const selectedTeacher =
                allTeachers.find(
                    (teacher) => {

                        return (
                            teacher.id ===
                            teacherId
                        );

                    }
                );


            if (!selectedTeacher) {

                showCourseFormMessage(
                    "Selected teacher is not available.",
                    "error"
                );

                return;
            }


            if (description.length < 10) {

                showCourseFormMessage(
                    "Course description must contain at least 10 characters.",
                    "error"
                );

                return;
            }


            const teacherName =
                getUserName(
                    selectedTeacher
                );


            try {

                setCourseFormLoading(true);


                if (editingCourseId) {

                    await updateExistingCourse(
                        editingCourseId,
                        {
                            title,
                            category,
                            teacherId,
                            teacherName,
                            status,
                            description
                        }
                    );


                    showCourseFormMessage(
                        "Course updated successfully.",
                        "success"
                    );


                } else {

                    await createNewCourse({
                        title,
                        category,
                        teacherId,
                        teacherName,
                        status,
                        description
                    });


                    showCourseFormMessage(
                        "Course created successfully.",
                        "success"
                    );

                }


                await loadCourses();


                setTimeout(() => {

                    closeCourseForm();

                }, 700);


            } catch (error) {

                console.error(
                    "Save Course Error:",
                    error
                );


                showCourseFormMessage(
                    getCourseSaveErrorMessage(
                        error
                    ),
                    "error"
                );


            } finally {

                setCourseFormLoading(false);

            }

        }
    );

}

/* ==========================================================
   END - COURSE FORM SUBMIT
========================================================== */


/* ==========================================================
   START - CREATE NEW COURSE
========================================================== */

async function createNewCourse(data) {

    await addDoc(
        collection(
            db,
            "courses"
        ),
        {
            title: data.title,
            category: data.category,

            teacherId: data.teacherId,
            teacherName: data.teacherName,

            description: data.description,
            status: data.status,

            /*
               Temporary count only.

               Later the real enrollment system will
               calculate this from Firestore enrollments.
            */
            enrollmentCount: 0,

            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }
    );

}

/* ==========================================================
   END - CREATE NEW COURSE
========================================================== */


/* ==========================================================
   START - UPDATE COURSE
========================================================== */

async function updateExistingCourse(
    courseDocumentId,
    data
) {

    await updateDoc(
        doc(
            db,
            "courses",
            courseDocumentId
        ),
        {
            title: data.title,
            category: data.category,

            teacherId: data.teacherId,
            teacherName: data.teacherName,

            description: data.description,
            status: data.status,

            updatedAt: serverTimestamp()
        }
    );

}

/* ==========================================================
   END - UPDATE COURSE
========================================================== */


/* ==========================================================
   START - DELETE COURSE
========================================================== */

function openDeleteCourseModal(
    courseDocumentId
) {

    const selectedCourse =
        findCourseById(
            courseDocumentId
        );


    if (
        !selectedCourse ||
        !deleteCourseModal
    ) {
        return;
    }


    courseToDeleteId =
        selectedCourse.id;


    if (deleteCourseName) {

        deleteCourseName.textContent =
            getCourseTitle(
                selectedCourse
            );

    }


    openModal(
        deleteCourseModal
    );

}


if (confirmDeleteBtn) {

    confirmDeleteBtn.addEventListener(
        "click",
        async () => {

            if (!courseToDeleteId) {
                return;
            }


            try {

                setDeleteLoading(true);


                await deleteDoc(
                    doc(
                        db,
                        "courses",
                        courseToDeleteId
                    )
                );


                courseToDeleteId = null;


                closeDeleteCourseModal();


                await loadCourses();


            } catch (error) {

                console.error(
                    "Delete Course Error:",
                    error
                );


                alert(
                    error?.code ===
                    "permission-denied"
                        ? "Firestore does not currently allow this course to be deleted."
                        : "Unable to delete course. Please try again."
                );


            } finally {

                setDeleteLoading(false);

            }

        }
    );

}

/* ==========================================================
   END - DELETE COURSE
========================================================== */


/* ==========================================================
   START - MODAL HELPERS
========================================================== */

function openModal(modal) {

    if (!modal) {
        return;
    }


    modal.classList.add(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


function closeModal(modal) {

    if (!modal) {
        return;
    }


    modal.classList.remove(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    const anotherModalOpen =
        document.querySelector(
            ".course-modal.show"
        );


    if (!anotherModalOpen) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


function closeViewCourseModal() {

    closeModal(
        viewCourseModal
    );

}


function closeCourseForm() {

    closeModal(
        courseFormModal
    );


    if (courseForm) {

        courseForm.reset();

    }


    if (courseId) {

        courseId.value = "";

    }


    hideCourseFormMessage();

}


function closeDeleteCourseModal() {

    closeModal(
        deleteCourseModal
    );


    courseToDeleteId = null;

}

/* ==========================================================
   END - MODAL HELPERS
========================================================== */


/* ==========================================================
   START - MODAL EVENTS
========================================================== */

if (closeViewModal) {

    closeViewModal.addEventListener(
        "click",
        closeViewCourseModal
    );

}


if (closeCourseFormModal) {

    closeCourseFormModal.addEventListener(
        "click",
        closeCourseForm
    );

}


if (cancelCourseBtn) {

    cancelCourseBtn.addEventListener(
        "click",
        closeCourseForm
    );

}


if (closeDeleteModal) {

    closeDeleteModal.addEventListener(
        "click",
        closeDeleteCourseModal
    );

}


if (cancelDeleteBtn) {

    cancelDeleteBtn.addEventListener(
        "click",
        closeDeleteCourseModal
    );

}


if (viewCourseModal) {

    viewCourseModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                viewCourseModal
            ) {

                closeViewCourseModal();

            }

        }
    );

}


if (courseFormModal) {

    courseFormModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                courseFormModal
            ) {

                closeCourseForm();

            }

        }
    );

}


if (deleteCourseModal) {

    deleteCourseModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                deleteCourseModal
            ) {

                closeDeleteCourseModal();

            }

        }
    );

}

/* ==========================================================
   END - MODAL EVENTS
========================================================== */


/* ==========================================================
   START - FORM MESSAGE
========================================================== */

function showCourseFormMessage(
    message,
    type
) {

    if (!courseFormMessage) {
        return;
    }


    courseFormMessage.textContent =
        message;


    courseFormMessage.className =
        `course-form-message ${type}`;


    courseFormMessage.hidden =
        false;

}


function hideCourseFormMessage() {

    if (!courseFormMessage) {
        return;
    }


    courseFormMessage.textContent = "";


    courseFormMessage.className =
        "course-form-message";


    courseFormMessage.hidden =
        true;

}

/* ==========================================================
   END - FORM MESSAGE
========================================================== */


/* ==========================================================
   START - FORM LOADING
========================================================== */

function setCourseFormLoading(
    isLoading
) {

    if (!saveCourseBtn) {
        return;
    }


    saveCourseBtn.disabled =
        isLoading;


    const buttonText =
        saveCourseBtn.querySelector(
            "span"
        );


    if (buttonText) {

        buttonText.textContent =
            isLoading
                ? "Saving..."
                : "Save Course";

    }

}


function setDeleteLoading(
    isLoading
) {

    if (!confirmDeleteBtn) {
        return;
    }


    confirmDeleteBtn.disabled =
        isLoading;


    const buttonText =
        confirmDeleteBtn.querySelector(
            "span"
        );


    if (buttonText) {

        buttonText.textContent =
            isLoading
                ? "Deleting..."
                : "Delete Course";

    }

}

/* ==========================================================
   END - FORM LOADING
========================================================== */


/* ==========================================================
   START - COURSE HELPERS
========================================================== */

function findCourseById(
    courseDocumentId
) {

    return allCourses.find(
        (course) => {

            return (
                course.id ===
                courseDocumentId
            );

        }
    );

}


function getCourseTitle(course) {

    return (
        course.title ||
        course.name ||
        "Untitled Course"
    );

}


function getCourseTeacherName(course) {

    if (course.teacherName) {

        return course.teacherName;

    }


    if (course.teacherId) {

        const teacher =
            allTeachers.find(
                (item) => {

                    return (
                        item.id ===
                        course.teacherId
                    );

                }
            );


        if (teacher) {

            return getUserName(
                teacher
            );

        }

    }


    return "Not Assigned";

}


function getEnrollmentCount(course) {

    const possibleValues = [
        course.enrollmentCount,
        course.enrolledStudents,
        course.studentsCount
    ];


    for (const value of possibleValues) {

        const numericValue =
            Number(value);


        if (
            Number.isFinite(numericValue) &&
            numericValue >= 0
        ) {

            return Math.floor(
                numericValue
            );

        }

    }


    return 0;

}


function normalizeCourseStatus(status) {

    const normalizedStatus =
        String(
            status || ""
        )
            .trim()
            .toLowerCase();


    if (
        normalizedStatus === "draft"
    ) {

        return "draft";

    }


    if (
        normalizedStatus === "inactive"
    ) {

        return "inactive";

    }


    return "active";

}


function normalizeCourseStatusFilter(
    status
) {

    const normalizedStatus =
        String(
            status || ""
        )
            .trim()
            .toLowerCase();


    if (
        normalizedStatus === "all"
    ) {

        return "all";

    }


    return normalizeCourseStatus(
        normalizedStatus
    );

}


function formatCourseStatus(status) {

    const normalizedStatus =
        normalizeCourseStatus(
            status
        );


    return (
        normalizedStatus
            .charAt(0)
            .toUpperCase() +
        normalizedStatus.slice(1)
    );

}


function getShortDescription(
    description
) {

    const safeDescription =
        String(
            description ||
            "No description available."
        ).trim();


    if (
        safeDescription.length <= 55
    ) {

        return safeDescription;

    }


    return (
        safeDescription.slice(
            0,
            52
        ) + "..."
    );

}

/* ==========================================================
   END - COURSE HELPERS
========================================================== */


/* ==========================================================
   START - USER / TEACHER HELPERS
========================================================== */

function normalizeRole(role) {

    return String(
        role || ""
    )
        .trim()
        .toLowerCase();

}


function getUserName(user) {

    return (
        user.name ||
        user.fullName ||
        user.displayName ||
        user.username ||
        "EduVerse Teacher"
    );

}


function getInitial(name) {

    const safeName =
        String(
            name || "T"
        ).trim();


    return (
        safeName.charAt(0) ||
        "T"
    ).toUpperCase();

}

/* ==========================================================
   END - USER / TEACHER HELPERS
========================================================== */


/* ==========================================================
   START - COURSE DATE HELPERS
========================================================== */

function sortCoursesByNewest(a, b) {

    return (
        getCourseTimestamp(b) -
        getCourseTimestamp(a)
    );

}


function getCourseTimestamp(course) {

    const possibleDates = [
        course.createdAt,
        course.created_at,
        course.updatedAt
    ];


    for (const value of possibleDates) {

        if (!value) {
            continue;
        }


        if (
            typeof value.toDate ===
            "function"
        ) {

            return value
                .toDate()
                .getTime();

        }


        const parsedDate =
            new Date(value);


        if (
            !Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return parsedDate.getTime();

        }

    }


    return 0;

}


function formatCourseDate(course) {

    const timestamp =
        getCourseTimestamp(course);


    if (!timestamp) {

        return "Recently";

    }


    return new Date(timestamp)
        .toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );

}

/* ==========================================================
   END - COURSE DATE HELPERS
========================================================== */


/* ==========================================================
   START - FIRESTORE ERROR MESSAGE
========================================================== */

function getCourseSaveErrorMessage(
    error
) {

    if (
        error?.code ===
        "permission-denied"
    ) {

        return (
            "Firestore currently does not allow course changes. " +
            "We need to update the security rules."
        );

    }


    return (
        "Unable to save course. Please try again."
    );

}

/* ==========================================================
   END - FIRESTORE ERROR MESSAGE
========================================================== */


/* ==========================================================
   START - COURSES LOAD ERROR
========================================================== */

function showCoursesLoadError() {

    if (coursesTableBody) {

        coursesTableBody.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="table-message"
                >
                    Unable to load courses.
                </td>

            </tr>
        `;

    }


    if (coursesResultText) {

        coursesResultText.textContent =
            "Course data could not be loaded.";

    }


    if (noCourses) {

        noCourses.hidden = true;

    }


    if (paginationSummary) {

        paginationSummary.textContent =
            "Showing 0 courses";

    }


    if (pageInfo) {

        pageInfo.textContent =
            "Page 1 of 1";

    }


    if (prevBtn) {

        prevBtn.disabled = true;

    }


    if (nextBtn) {

        nextBtn.disabled = true;

    }

}

/* ==========================================================
   END - COURSES LOAD ERROR
========================================================== */


/* ==========================================================
   START - MOBILE SIDEBAR
========================================================== */

function openSidebar() {

    if (
        !adminSidebar ||
        !sidebarOverlay
    ) {
        return;
    }


    adminSidebar.classList.add(
        "open"
    );


    sidebarOverlay.classList.add(
        "show"
    );


    document.body.classList.add(
        "sidebar-open"
    );

}


function closeSidebar() {

    if (
        !adminSidebar ||
        !sidebarOverlay
    ) {
        return;
    }


    adminSidebar.classList.remove(
        "open"
    );


    sidebarOverlay.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "sidebar-open"
    );

}


if (menuToggle) {

    menuToggle.addEventListener(
        "click",
        openSidebar
    );

}


if (sidebarClose) {

    sidebarClose.addEventListener(
        "click",
        closeSidebar
    );

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}


document
    .querySelectorAll(
        ".sidebar-nav .nav-link"
    )
    .forEach((link) => {

        link.addEventListener(
            "click",
            () => {

                if (
                    window.innerWidth <=
                    991
                ) {

                    closeSidebar();

                }

            }
        );

    });

/* ==========================================================
   END - MOBILE SIDEBAR
========================================================== */


/* ==========================================================
   START - ESC KEY
========================================================== */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key !== "Escape"
        ) {
            return;
        }


        if (
            deleteCourseModal?.classList.contains(
                "show"
            )
        ) {

            closeDeleteCourseModal();

            return;
        }


        if (
            courseFormModal?.classList.contains(
                "show"
            )
        ) {

            closeCourseForm();

            return;
        }


        if (
            viewCourseModal?.classList.contains(
                "show"
            )
        ) {

            closeViewCourseModal();

            return;
        }


        if (
            adminSidebar?.classList.contains(
                "open"
            )
        ) {

            closeSidebar();

        }

    }
);

/* ==========================================================
   END - ESC KEY
========================================================== */


/* ==========================================================
   START - FIREBASE ADMIN LOGOUT
========================================================== */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();


            try {

                logoutBtn.style.pointerEvents =
                    "none";


                const logoutText =
                    logoutBtn.querySelector(
                        "span:last-child"
                    );


                if (logoutText) {

                    logoutText.textContent =
                        "Logging Out...";

                }


                await signOut(auth);


                window.location.replace(
                    "../../../logout.html"
                );


            } catch (error) {

                console.error(
                    "Manage Courses Logout Error:",
                    error
                );


                logoutBtn.style.pointerEvents =
                    "";


                const logoutText =
                    logoutBtn.querySelector(
                        "span:last-child"
                    );


                if (logoutText) {

                    logoutText.textContent =
                        "Logout";

                }


                alert(
                    "Unable to logout. Please try again."
                );

            }

        }
    );

}

/* ==========================================================
   END - FIREBASE ADMIN LOGOUT
========================================================== */


/* ==========================================================
   START - HTML SECURITY
========================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

/* ==========================================================
   END - HTML SECURITY
========================================================== */


/* ==========================================================
   END - EDUVERSE ADMIN MANAGE COURSES
========================================================== */