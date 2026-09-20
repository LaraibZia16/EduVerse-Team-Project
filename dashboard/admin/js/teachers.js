/* ==========================================================
   START - EDUVERSE ADMIN TEACHERS
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
    doc,
    getDoc,
    getDocs,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

/* ==========================================================
   END - FIREBASE IMPORTS
========================================================== */


/* ==========================================================
   START - DOM ELEMENTS
========================================================== */

const logoutBtn =
    document.getElementById("logoutBtn");

const menuToggle =
    document.getElementById("menuToggle");

const sidebarClose =
    document.getElementById("sidebarClose");

const adminSidebar =
    document.getElementById("adminSidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const adminName =
    document.getElementById("adminName");


/* ----------------------------------------------------------
   Statistics
---------------------------------------------------------- */

const totalTeachersElement =
    document.getElementById("totalTeachers");

const activeTeachersElement =
    document.getElementById("activeTeachers");

const suspendedTeachersElement =
    document.getElementById("suspendedTeachers");

const assignedTeachersElement =
    document.getElementById("assignedTeachers");


/* ----------------------------------------------------------
   Search / Filters
---------------------------------------------------------- */

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const assignmentFilter =
    document.getElementById("assignmentFilter");


/* ----------------------------------------------------------
   Table
---------------------------------------------------------- */

const teachersTableBody =
    document.getElementById("teachersTableBody");

const teachersResultText =
    document.getElementById("teachersResultText");

const noTeachers =
    document.getElementById("noTeachers");


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
   View Teacher Modal
---------------------------------------------------------- */

const viewTeacherModal =
    document.getElementById("viewTeacherModal");

const closeViewModal =
    document.getElementById("closeViewModal");

const viewTeacherAvatar =
    document.getElementById("viewTeacherAvatar");

const viewTeacherName =
    document.getElementById("viewTeacherName");

const viewTeacherEmail =
    document.getElementById("viewTeacherEmail");

const viewTeacherRole =
    document.getElementById("viewTeacherRole");

const viewTeacherStatus =
    document.getElementById("viewTeacherStatus");

const viewTeacherCourseCount =
    document.getElementById("viewTeacherCourseCount");

const viewTeacherJoined =
    document.getElementById("viewTeacherJoined");

const viewCourseCountBadge =
    document.getElementById("viewCourseCountBadge");

const viewAssignedCourses =
    document.getElementById("viewAssignedCourses");


/* ----------------------------------------------------------
   Status Modal
---------------------------------------------------------- */

const statusModal =
    document.getElementById("statusModal");

const closeStatusModal =
    document.getElementById("closeStatusModal");

const cancelStatusBtn =
    document.getElementById("cancelStatusBtn");

const confirmStatusBtn =
    document.getElementById("confirmStatusBtn");

const statusModalLabel =
    document.getElementById("statusModalLabel");

const statusModalTitle =
    document.getElementById("statusModalTitle");

const statusConfirmationIcon =
    document.getElementById("statusConfirmationIcon");

const statusConfirmationHeading =
    document.getElementById("statusConfirmationHeading");

const statusTeacherName =
    document.getElementById("statusTeacherName");

const statusHelpText =
    document.getElementById("statusHelpText");

/* ==========================================================
   END - DOM ELEMENTS
========================================================== */


/* ==========================================================
   START - PAGE STATE
========================================================== */

let allTeachers = [];
let allCourses = [];

let filteredTeachers = [];

let currentPage = 1;

const teachersPerPage = 5;

let selectedTeacherId = null;
let selectedNewStatus = null;

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


            await loadTeachersAndCourses();


        } catch (error) {

            console.error(
                "Teachers Authentication Error:",
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


    adminName.textContent =
        name;

}

/* ==========================================================
   END - ADMIN INFORMATION
========================================================== */


/* ==========================================================
   START - LOAD TEACHERS AND COURSES
========================================================== */

async function loadTeachersAndCourses() {

    try {

        const [
            usersSnapshot,
            coursesSnapshot
        ] = await Promise.all([

            getDocs(
                collection(
                    db,
                    "users"
                )
            ),

            getDocs(
                collection(
                    db,
                    "courses"
                )
            )

        ]);


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


        allCourses =
            coursesSnapshot.docs
                .map((courseDocument) => {

                    return {
                        id: courseDocument.id,
                        ...courseDocument.data()
                    };

                });


        allTeachers.sort(
            sortTeachersByNewest
        );


        updateStatistics();

        applyFilters();


    } catch (error) {

        console.error(
            "Load Teachers/Courses Error:",
            error
        );


        showTeachersLoadError();

    }

}

/* ==========================================================
   END - LOAD TEACHERS AND COURSES
========================================================== */


/* ==========================================================
   START - STATISTICS
========================================================== */

function updateStatistics() {

    const total =
        allTeachers.length;


    const active =
        allTeachers.filter(
            (teacher) => {

                return (
                    getTeacherStatus(teacher) ===
                    "active"
                );

            }
        ).length;


    const suspended =
        allTeachers.filter(
            (teacher) => {

                return (
                    getTeacherStatus(teacher) ===
                    "suspended"
                );

            }
        ).length;


    const assigned =
        allTeachers.filter(
            (teacher) => {

                return (
                    getTeacherCourses(
                        teacher
                    ).length > 0
                );

            }
        ).length;


    if (totalTeachersElement) {

        totalTeachersElement.textContent =
            total;

    }


    if (activeTeachersElement) {

        activeTeachersElement.textContent =
            active;

    }


    if (suspendedTeachersElement) {

        suspendedTeachersElement.textContent =
            suspended;

    }


    if (assignedTeachersElement) {

        assignedTeachersElement.textContent =
            assigned;

    }

}

/* ==========================================================
   END - STATISTICS
========================================================== */


/* ==========================================================
   START - TEACHER COURSE MATCHING
========================================================== */

function getTeacherCourses(teacher) {

    if (!teacher) {
        return [];
    }


    const teacherId =
        String(
            teacher.id || ""
        ).trim();


    const teacherUid =
        String(
            teacher.uid || teacher.id || ""
        ).trim();


    const teacherEmail =
        getTeacherEmail(teacher)
            .trim()
            .toLowerCase();


    return allCourses.filter(
        (course) => {

            const courseTeacherId =
                String(
                    course.teacherId ||
                    course.teacherUid ||
                    course.instructorId ||
                    ""
                ).trim();


            const courseTeacherEmail =
                String(
                    course.teacherEmail ||
                    course.instructorEmail ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            /*
               Primary matching:
               course.teacherId === Firebase teacher UID

               Extra fallbacks are included so existing
               EduVerse course records remain compatible.
            */

            const matchesId =
                courseTeacherId !== "" &&
                (
                    courseTeacherId === teacherId ||
                    courseTeacherId === teacherUid
                );


            const matchesEmail =
                courseTeacherEmail !== "" &&
                teacherEmail !== "" &&
                courseTeacherEmail === teacherEmail;


            return (
                matchesId ||
                matchesEmail
            );

        }
    );

}

/* ==========================================================
   END - TEACHER COURSE MATCHING
========================================================== */


/* ==========================================================
   START - SEARCH AND FILTERS
========================================================== */

function applyFilters() {

    const searchTerm =
        String(
            searchInput?.value || ""
        )
            .trim()
            .toLowerCase();


    const selectedStatus =
        normalizeStatusFilter(
            statusFilter?.value || "all"
        );


    const selectedAssignment =
        normalizeAssignmentFilter(
            assignmentFilter?.value || "all"
        );


    filteredTeachers =
        allTeachers.filter(
            (teacher) => {

                const name =
                    getTeacherName(teacher)
                        .toLowerCase();


                const email =
                    getTeacherEmail(teacher)
                        .toLowerCase();


                const status =
                    getTeacherStatus(teacher);


                const assignedCourseCount =
                    getTeacherCourses(
                        teacher
                    ).length;


                const matchesSearch =
                    name.includes(searchTerm) ||
                    email.includes(searchTerm);


                const matchesStatus =
                    selectedStatus === "all" ||
                    status === selectedStatus;


                let matchesAssignment =
                    true;


                if (
                    selectedAssignment ===
                    "assigned"
                ) {

                    matchesAssignment =
                        assignedCourseCount > 0;

                }


                if (
                    selectedAssignment ===
                    "unassigned"
                ) {

                    matchesAssignment =
                        assignedCourseCount === 0;

                }


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesAssignment
                );

            }
        );


    currentPage = 1;

    renderTeachers();

}

/* ==========================================================
   END - SEARCH AND FILTERS
========================================================== */


/* ==========================================================
   START - RENDER TEACHERS
========================================================== */

function renderTeachers() {

    if (!teachersTableBody) {
        return;
    }


    const totalFilteredTeachers =
        filteredTeachers.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalFilteredTeachers /
                teachersPerPage
            )
        );


    if (currentPage > totalPages) {

        currentPage =
            totalPages;

    }


    const startIndex =
        (currentPage - 1) *
        teachersPerPage;


    const endIndex =
        startIndex +
        teachersPerPage;


    const teachersForCurrentPage =
        filteredTeachers.slice(
            startIndex,
            endIndex
        );


    if (
        totalFilteredTeachers === 0
    ) {

        teachersTableBody.innerHTML =
            "";


        if (noTeachers) {

            noTeachers.hidden =
                false;

        }


        updateResultText(0);


        updatePagination(
            0,
            1,
            0,
            0
        );


        return;
    }


    if (noTeachers) {

        noTeachers.hidden =
            true;

    }


    teachersTableBody.innerHTML =
        teachersForCurrentPage
            .map(createTeacherRow)
            .join("");


    addTeacherActionEvents();


    updateResultText(
        totalFilteredTeachers
    );


    updatePagination(
        totalFilteredTeachers,
        totalPages,
        startIndex,
        teachersForCurrentPage.length
    );

}

/* ==========================================================
   END - RENDER TEACHERS
========================================================== */


/* ==========================================================
   START - CREATE TEACHER ROW
========================================================== */

function createTeacherRow(teacher) {

    const name =
        getTeacherName(teacher);


    const email =
        getTeacherEmail(teacher);


    const initial =
        getInitial(name);


    const status =
        getTeacherStatus(teacher);


    const statusText =
        formatStatus(status);


    const assignedCourses =
        getTeacherCourses(teacher);


    const courseCount =
        assignedCourses.length;


    const joined =
        formatJoinedDate(teacher);


    const statusAction =
        status === "suspended"
            ? "reactivate"
            : "suspend";


    const statusButtonText =
        status === "suspended"
            ? "Reactivate"
            : "Suspend";


    const statusIcon =
        status === "suspended"
            ? "fa-user-check"
            : "fa-user-lock";


    return `
        <tr>

            <td>

                <div class="table-teacher">

                    <span class="table-teacher-avatar">
                        ${escapeHTML(initial)}
                    </span>


                    <div class="table-teacher-info">

                        <strong>
                            ${escapeHTML(name)}
                        </strong>

                        <span>
                            Teacher
                        </span>

                    </div>

                </div>

            </td>


            <td>
                ${escapeHTML(email)}
            </td>


            <td>

                <span
                    class="teacher-status-badge status-${escapeHTML(status)}"
                >
                    ${escapeHTML(statusText)}
                </span>

            </td>


            <td>

                <span class="teacher-course-count">

                    <i class="fa-solid fa-book-open"></i>

                    ${courseCount}

                </span>

            </td>


            <td>

                <span class="teacher-joined-date">
                    ${escapeHTML(joined)}
                </span>

            </td>


            <td>

                <div class="teacher-action-buttons">


                    <button
                        type="button"
                        class="view-teacher-btn"
                        data-teacher-id="${escapeHTML(teacher.id)}"
                    >

                        <i class="fa-regular fa-eye"></i>

                        <span>
                            View
                        </span>

                    </button>


                    <button
                        type="button"
                        class="status-teacher-btn ${statusAction}"
                        data-teacher-id="${escapeHTML(teacher.id)}"
                    >

                        <i class="fa-solid ${statusIcon}"></i>

                        <span>
                            ${statusButtonText}
                        </span>

                    </button>


                </div>

            </td>

        </tr>
    `;

}

/* ==========================================================
   END - CREATE TEACHER ROW
========================================================== */


/* ==========================================================
   START - RESULT TEXT
========================================================== */

function updateResultText(total) {

    if (!teachersResultText) {
        return;
    }


    if (total === 0) {

        teachersResultText.textContent =
            "No teachers match your search.";

        return;
    }


    if (total === 1) {

        teachersResultText.textContent =
            "1 teacher found.";

        return;
    }


    teachersResultText.textContent =
        `${total} teachers found.`;

}

/* ==========================================================
   END - RESULT TEXT
========================================================== */


/* ==========================================================
   START - PAGINATION
========================================================== */

function updatePagination(
    totalTeachers,
    totalPages,
    startIndex,
    currentPageTeacherCount
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
            totalTeachers === 0;

    }


    if (!paginationSummary) {
        return;
    }


    if (totalTeachers === 0) {

        paginationSummary.textContent =
            "Showing 0 teachers";

        return;
    }


    const firstTeacherNumber =
        startIndex + 1;


    const lastTeacherNumber =
        startIndex +
        currentPageTeacherCount;


    paginationSummary.textContent =
        `Showing ${firstTeacherNumber}–${lastTeacherNumber} of ${totalTeachers} teachers`;

}

/* ==========================================================
   END - PAGINATION
========================================================== */


/* ==========================================================
   START - PAGINATION EVENTS
========================================================== */

if (prevBtn) {

    prevBtn.addEventListener(
        "click",
        () => {

            if (currentPage <= 1) {
                return;
            }


            currentPage--;

            renderTeachers();

        }
    );

}


if (nextBtn) {

    nextBtn.addEventListener(
        "click",
        () => {

            const totalPages =
                Math.max(
                    1,
                    Math.ceil(
                        filteredTeachers.length /
                        teachersPerPage
                    )
                );


            if (
                currentPage >= totalPages
            ) {
                return;
            }


            currentPage++;

            renderTeachers();

        }
    );

}

/* ==========================================================
   END - PAGINATION EVENTS
========================================================== */


/* ==========================================================
   START - FILTER EVENTS
========================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        applyFilters
    );

}


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        applyFilters
    );

}


if (assignmentFilter) {

    assignmentFilter.addEventListener(
        "change",
        applyFilters
    );

}

/* ==========================================================
   END - FILTER EVENTS
========================================================== */


/* ==========================================================
   START - TEACHER ACTION EVENTS
========================================================== */

function addTeacherActionEvents() {

    document
        .querySelectorAll(
            ".view-teacher-btn"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    openTeacherDetails(
                        button.dataset.teacherId
                    );

                }
            );

        });


    document
        .querySelectorAll(
            ".status-teacher-btn"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    openStatusConfirmation(
                        button.dataset.teacherId
                    );

                }
            );

        });

}

/* ==========================================================
   END - TEACHER ACTION EVENTS
========================================================== */


/* ==========================================================
   START - VIEW TEACHER
========================================================== */

function openTeacherDetails(
    teacherId
) {

    const teacher =
        findTeacherById(
            teacherId
        );


    if (
        !teacher ||
        !viewTeacherModal
    ) {
        return;
    }


    const name =
        getTeacherName(teacher);


    const assignedCourses =
        getTeacherCourses(teacher);


    if (viewTeacherAvatar) {

        viewTeacherAvatar.textContent =
            getInitial(name);

    }


    if (viewTeacherName) {

        viewTeacherName.textContent =
            name;

    }


    if (viewTeacherEmail) {

        viewTeacherEmail.textContent =
            getTeacherEmail(teacher);

    }


    if (viewTeacherRole) {

        viewTeacherRole.textContent =
            "Teacher";

    }


    if (viewTeacherStatus) {

        viewTeacherStatus.textContent =
            formatStatus(
                getTeacherStatus(
                    teacher
                )
            );

    }


    if (viewTeacherCourseCount) {

        viewTeacherCourseCount.textContent =
            assignedCourses.length;

    }


    if (viewTeacherJoined) {

        viewTeacherJoined.textContent =
            formatJoinedDate(
                teacher
            );

    }


    if (viewCourseCountBadge) {

        viewCourseCountBadge.textContent =
            assignedCourses.length;

    }


    renderAssignedCourses(
        assignedCourses
    );


    openModal(
        viewTeacherModal
    );

}

/* ==========================================================
   END - VIEW TEACHER
========================================================== */


/* ==========================================================
   START - RENDER ASSIGNED COURSES
========================================================== */

function renderAssignedCourses(courses) {

    if (!viewAssignedCourses) {
        return;
    }


    if (
        !Array.isArray(courses) ||
        courses.length === 0
    ) {

        viewAssignedCourses.innerHTML = `
            <p class="no-assigned-course">
                No courses assigned.
            </p>
        `;

        return;
    }


    viewAssignedCourses.innerHTML =
        courses
            .map((course) => {

                const title =
                    getCourseTitle(course);


                const category =
                    getCourseCategory(course);


                const status =
                    getCourseStatus(course);


                return `
                    <div class="assigned-course-item">

                        <div class="assigned-course-info">

                            <strong>
                                ${escapeHTML(title)}
                            </strong>

                            <span>
                                ${escapeHTML(category)}
                            </span>

                        </div>


                        <span
                            class="assigned-course-status ${escapeHTML(status)}"
                        >
                            ${escapeHTML(
                                formatCourseStatus(
                                    status
                                )
                            )}
                        </span>

                    </div>
                `;

            })
            .join("");

}

/* ==========================================================
   END - RENDER ASSIGNED COURSES
========================================================== */


/* ==========================================================
   START - STATUS CONFIRMATION
========================================================== */

function openStatusConfirmation(
    teacherId
) {

    const teacher =
        findTeacherById(
            teacherId
        );


    if (
        !teacher ||
        !statusModal
    ) {
        return;
    }


    const currentStatus =
        getTeacherStatus(
            teacher
        );


    const willReactivate =
        currentStatus ===
        "suspended";


    selectedTeacherId =
        teacher.id;


    selectedNewStatus =
        willReactivate
            ? "active"
            : "suspended";


    if (statusTeacherName) {

        statusTeacherName.textContent =
            getTeacherName(
                teacher
            );

    }


    if (willReactivate) {

        setupReactivateModal();

    } else {

        setupSuspendModal();

    }


    openModal(
        statusModal
    );

}

/* ==========================================================
   END - STATUS CONFIRMATION
========================================================== */


/* ==========================================================
   START - SUSPEND MODAL
========================================================== */

function setupSuspendModal() {

    if (statusModalLabel) {

        statusModalLabel.textContent =
            "ACCOUNT ACCESS";

    }


    if (statusModalTitle) {

        statusModalTitle.textContent =
            "Suspend Teacher";

    }


    if (statusConfirmationHeading) {

        statusConfirmationHeading.textContent =
            "Suspend this teacher?";

    }


    if (statusHelpText) {

        statusHelpText.textContent =
            "A suspended teacher will not be allowed to access the teacher dashboard until the account is reactivated.";

    }


    if (statusConfirmationIcon) {

        statusConfirmationIcon.classList.remove(
            "reactivate"
        );


        statusConfirmationIcon.innerHTML = `
            <i class="fa-solid fa-user-lock"></i>
        `;

    }


    if (confirmStatusBtn) {

        confirmStatusBtn.classList.remove(
            "reactivate"
        );


        confirmStatusBtn.innerHTML = `
            <i class="fa-solid fa-user-lock"></i>

            <span>
                Suspend Teacher
            </span>
        `;

    }

}

/* ==========================================================
   END - SUSPEND MODAL
========================================================== */


/* ==========================================================
   START - REACTIVATE MODAL
========================================================== */

function setupReactivateModal() {

    if (statusModalLabel) {

        statusModalLabel.textContent =
            "ACCOUNT ACCESS";

    }


    if (statusModalTitle) {

        statusModalTitle.textContent =
            "Reactivate Teacher";

    }


    if (statusConfirmationHeading) {

        statusConfirmationHeading.textContent =
            "Reactivate this teacher?";

    }


    if (statusHelpText) {

        statusHelpText.textContent =
            "The teacher will regain access to the teacher dashboard after the account is reactivated.";

    }


    if (statusConfirmationIcon) {

        statusConfirmationIcon.classList.add(
            "reactivate"
        );


        statusConfirmationIcon.innerHTML = `
            <i class="fa-solid fa-user-check"></i>
        `;

    }


    if (confirmStatusBtn) {

        confirmStatusBtn.classList.add(
            "reactivate"
        );


        confirmStatusBtn.innerHTML = `
            <i class="fa-solid fa-user-check"></i>

            <span>
                Reactivate Teacher
            </span>
        `;

    }

}

/* ==========================================================
   END - REACTIVATE MODAL
========================================================== */


/* ==========================================================
   START - UPDATE TEACHER STATUS
========================================================== */

if (confirmStatusBtn) {

    confirmStatusBtn.addEventListener(
        "click",
        async () => {

            if (
                !selectedTeacherId ||
                !selectedNewStatus
            ) {
                return;
            }


            try {

                setStatusLoading(true);


                await updateDoc(
                    doc(
                        db,
                        "users",
                        selectedTeacherId
                    ),
                    {
                        status:
                            selectedNewStatus
                    }
                );


                closeStatusConfirmation();


                await loadTeachersAndCourses();


            } catch (error) {

                console.error(
                    "Teacher Status Update Error:",
                    error
                );


                if (
                    error?.code ===
                    "permission-denied"
                ) {

                    alert(
                        "Firestore does not currently allow this teacher status change."
                    );

                } else {

                    alert(
                        "Unable to update teacher status. Please try again."
                    );

                }


            } finally {

                setStatusLoading(false);

            }

        }
    );

}

/* ==========================================================
   END - UPDATE TEACHER STATUS
========================================================== */


/* ==========================================================
   START - STATUS LOADING
========================================================== */

function setStatusLoading(
    isLoading
) {

    if (!confirmStatusBtn) {
        return;
    }


    confirmStatusBtn.disabled =
        isLoading;


    const text =
        confirmStatusBtn.querySelector(
            "span"
        );


    if (!text) {
        return;
    }


    if (isLoading) {

        text.textContent =
            "Updating...";

        return;
    }


    text.textContent =
        selectedNewStatus === "active"
            ? "Reactivate Teacher"
            : "Suspend Teacher";

}

/* ==========================================================
   END - STATUS LOADING
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
            ".teacher-modal.show"
        );


    if (!anotherModalOpen) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


function closeTeacherDetails() {

    closeModal(
        viewTeacherModal
    );

}


function closeStatusConfirmation() {

    closeModal(
        statusModal
    );


    selectedTeacherId = null;
    selectedNewStatus = null;

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
        closeTeacherDetails
    );

}


if (closeStatusModal) {

    closeStatusModal.addEventListener(
        "click",
        closeStatusConfirmation
    );

}


if (cancelStatusBtn) {

    cancelStatusBtn.addEventListener(
        "click",
        closeStatusConfirmation
    );

}


if (viewTeacherModal) {

    viewTeacherModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                viewTeacherModal
            ) {

                closeTeacherDetails();

            }

        }
    );

}


if (statusModal) {

    statusModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                statusModal
            ) {

                closeStatusConfirmation();

            }

        }
    );

}

/* ==========================================================
   END - MODAL EVENTS
========================================================== */


/* ==========================================================
   START - TEACHER HELPERS
========================================================== */

function findTeacherById(
    teacherId
) {

    return allTeachers.find(
        (teacher) => {

            return (
                teacher.id ===
                teacherId
            );

        }
    );

}


function getTeacherName(teacher) {

    return (
        teacher.name ||
        teacher.fullName ||
        teacher.displayName ||
        teacher.username ||
        "EduVerse Teacher"
    );

}


function getTeacherEmail(teacher) {

    return (
        teacher.email ||
        "No email available"
    );

}


function getTeacherStatus(teacher) {

    const status =
        String(
            teacher.status || "active"
        )
            .trim()
            .toLowerCase();


    if (
        status === "suspended"
    ) {

        return "suspended";

    }


    return "active";

}


function normalizeStatusFilter(status) {

    const normalizedStatus =
        String(
            status || "all"
        )
            .trim()
            .toLowerCase();


    if (
        normalizedStatus ===
        "active"
    ) {

        return "active";

    }


    if (
        normalizedStatus ===
        "suspended"
    ) {

        return "suspended";

    }


    return "all";

}


function normalizeAssignmentFilter(
    assignment
) {

    const normalizedAssignment =
        String(
            assignment || "all"
        )
            .trim()
            .toLowerCase();


    if (
        normalizedAssignment ===
        "assigned"
    ) {

        return "assigned";

    }


    if (
        normalizedAssignment ===
        "unassigned"
    ) {

        return "unassigned";

    }


    return "all";

}


function formatStatus(status) {

    return (
        String(status)
            .toLowerCase() ===
        "suspended"
            ? "Suspended"
            : "Active"
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
   END - TEACHER HELPERS
========================================================== */


/* ==========================================================
   START - COURSE HELPERS
========================================================== */

function getCourseTitle(course) {

    return (
        course.title ||
        course.name ||
        course.courseTitle ||
        "Untitled Course"
    );

}


function getCourseCategory(course) {

    return (
        course.category ||
        course.level ||
        "EduVerse Course"
    );

}


function getCourseStatus(course) {

    const status =
        String(
            course.status || "active"
        )
            .trim()
            .toLowerCase();


    if (
        status === "published"
    ) {

        return "active";

    }


    if (
        status === "active"
    ) {

        return "active";

    }


    if (
        status === "draft"
    ) {

        return "draft";

    }


    return "inactive";

}


function formatCourseStatus(status) {

    if (status === "active") {

        return "Active";

    }


    if (status === "draft") {

        return "Draft";

    }


    return "Inactive";

}

/* ==========================================================
   END - COURSE HELPERS
========================================================== */


/* ==========================================================
   START - DATE HELPERS
========================================================== */

function sortTeachersByNewest(
    a,
    b
) {

    return (
        getTeacherTimestamp(b) -
        getTeacherTimestamp(a)
    );

}


function getTeacherTimestamp(
    teacher
) {

    const possibleDates = [
        teacher.createdAt,
        teacher.created_at,
        teacher.joinedAt,
        teacher.registeredAt
    ];


    for (
        const value of possibleDates
    ) {

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


function formatJoinedDate(
    teacher
) {

    const timestamp =
        getTeacherTimestamp(
            teacher
        );


    if (!timestamp) {

        return "Not available";

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
   END - DATE HELPERS
========================================================== */


/* ==========================================================
   START - ROLE HELPER
========================================================== */

function normalizeRole(role) {

    return String(
        role || ""
    )
        .trim()
        .toLowerCase();

}

/* ==========================================================
   END - ROLE HELPER
========================================================== */


/* ==========================================================
   START - LOAD ERROR
========================================================== */

function showTeachersLoadError() {

    allTeachers = [];
    allCourses = [];
    filteredTeachers = [];


    if (teachersTableBody) {

        teachersTableBody.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="table-message"
                >
                    Unable to load teachers.
                </td>

            </tr>
        `;

    }


    if (teachersResultText) {

        teachersResultText.textContent =
            "Teacher data could not be loaded.";

    }


    if (noTeachers) {

        noTeachers.hidden =
            true;

    }


    if (totalTeachersElement) {

        totalTeachersElement.textContent =
            "0";

    }


    if (activeTeachersElement) {

        activeTeachersElement.textContent =
            "0";

    }


    if (suspendedTeachersElement) {

        suspendedTeachersElement.textContent =
            "0";

    }


    if (assignedTeachersElement) {

        assignedTeachersElement.textContent =
            "0";

    }


    if (paginationSummary) {

        paginationSummary.textContent =
            "Showing 0 teachers";

    }


    if (pageInfo) {

        pageInfo.textContent =
            "Page 1 of 1";

    }


    if (prevBtn) {

        prevBtn.disabled =
            true;

    }


    if (nextBtn) {

        nextBtn.disabled =
            true;

    }

}

/* ==========================================================
   END - LOAD ERROR
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
   START - ESCAPE KEY
========================================================== */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key !==
            "Escape"
        ) {
            return;
        }


        if (
            statusModal?.classList.contains(
                "show"
            )
        ) {

            closeStatusConfirmation();

            return;
        }


        if (
            viewTeacherModal?.classList.contains(
                "show"
            )
        ) {

            closeTeacherDetails();

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
   END - ESCAPE KEY
========================================================== */


/* ==========================================================
   START - ADMIN LOGOUT
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
                    "Teachers Logout Error:",
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
   END - ADMIN LOGOUT
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
   END - EDUVERSE ADMIN TEACHERS
========================================================== */