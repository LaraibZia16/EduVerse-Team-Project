/* ==========================================================
   START - EDUVERSE ADMIN STUDENTS
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
    updateDoc,
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

const totalStudentsElement =
    document.getElementById("totalStudents");

const activeStudentsElement =
    document.getElementById("activeStudents");

const suspendedStudentsElement =
    document.getElementById("suspendedStudents");

const enrolledStudentsElement =
    document.getElementById("enrolledStudents");


/* ----------------------------------------------------------
   Search / Filter
---------------------------------------------------------- */

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");


/* ----------------------------------------------------------
   Table
---------------------------------------------------------- */

const studentsTableBody =
    document.getElementById("studentsTableBody");

const studentsResultText =
    document.getElementById("studentsResultText");

const noStudents =
    document.getElementById("noStudents");


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
   View Student Modal
---------------------------------------------------------- */

const viewStudentModal =
    document.getElementById("viewStudentModal");

const closeViewModal =
    document.getElementById("closeViewModal");

const viewStudentAvatar =
    document.getElementById("viewStudentAvatar");

const viewStudentName =
    document.getElementById("viewStudentName");

const viewStudentEmail =
    document.getElementById("viewStudentEmail");

const viewStudentRole =
    document.getElementById("viewStudentRole");

const viewStudentStatus =
    document.getElementById("viewStudentStatus");

const viewStudentEnrollments =
    document.getElementById("viewStudentEnrollments");

const viewStudentJoined =
    document.getElementById("viewStudentJoined");


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

const statusStudentName =
    document.getElementById("statusStudentName");

const statusHelpText =
    document.getElementById("statusHelpText");

/* ==========================================================
   END - DOM ELEMENTS
========================================================== */


/* ==========================================================
   START - PAGE STATE
========================================================== */

let allStudents = [];
let filteredStudents = [];

let currentPage = 1;

const studentsPerPage = 5;

let selectedStudentId = null;
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


            await loadStudents();


        } catch (error) {

            console.error(
                "Students Authentication Error:",
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
   START - LOAD REAL STUDENTS
========================================================== */

async function loadStudents() {

    try {

        const usersSnapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );


        allStudents =
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
                        "student"
                    );

                });


        allStudents.sort(
            sortStudentsByNewest
        );


        updateStatistics();

        applyFilters();


    } catch (error) {

        console.error(
            "Load Students Error:",
            error
        );


        showStudentsLoadError();

    }

}

/* ==========================================================
   END - LOAD REAL STUDENTS
========================================================== */


/* ==========================================================
   START - STATISTICS
========================================================== */

function updateStatistics() {

    const total =
        allStudents.length;


    const active =
        allStudents.filter(
            (student) => {

                return (
                    getStudentStatus(student) ===
                    "active"
                );

            }
        ).length;


    const suspended =
        allStudents.filter(
            (student) => {

                return (
                    getStudentStatus(student) ===
                    "suspended"
                );

            }
        ).length;


    /*
       Enrollment collection is not created yet.

       For now this function checks possible enrollment
       count fields. Later we will connect this stat with
       the real enrollment system.
    */

    const enrolled =
        allStudents.filter(
            (student) => {

                return (
                    getEnrollmentCount(student) > 0
                );

            }
        ).length;


    if (totalStudentsElement) {

        totalStudentsElement.textContent =
            total;

    }


    if (activeStudentsElement) {

        activeStudentsElement.textContent =
            active;

    }


    if (suspendedStudentsElement) {

        suspendedStudentsElement.textContent =
            suspended;

    }


    if (enrolledStudentsElement) {

        enrolledStudentsElement.textContent =
            enrolled;

    }

}

/* ==========================================================
   END - STATISTICS
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


    const selectedStatus =
        normalizeStatusFilter(
            statusFilter?.value || "all"
        );


    filteredStudents =
        allStudents.filter(
            (student) => {

                const name =
                    getStudentName(student)
                        .toLowerCase();


                const email =
                    getStudentEmail(student)
                        .toLowerCase();


                const status =
                    getStudentStatus(student);


                const matchesSearch =
                    name.includes(searchTerm) ||
                    email.includes(searchTerm);


                const matchesStatus =
                    selectedStatus === "all" ||
                    status === selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    currentPage = 1;

    renderStudents();

}

/* ==========================================================
   END - SEARCH AND FILTER
========================================================== */


/* ==========================================================
   START - RENDER STUDENTS
========================================================== */

function renderStudents() {

    if (!studentsTableBody) {
        return;
    }


    const totalFilteredStudents =
        filteredStudents.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalFilteredStudents /
                studentsPerPage
            )
        );


    if (currentPage > totalPages) {

        currentPage = totalPages;

    }


    const startIndex =
        (currentPage - 1) *
        studentsPerPage;


    const endIndex =
        startIndex +
        studentsPerPage;


    const studentsForCurrentPage =
        filteredStudents.slice(
            startIndex,
            endIndex
        );


    if (totalFilteredStudents === 0) {

        studentsTableBody.innerHTML = "";


        if (noStudents) {

            noStudents.hidden = false;

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


    if (noStudents) {

        noStudents.hidden = true;

    }


    studentsTableBody.innerHTML =
        studentsForCurrentPage
            .map(createStudentRow)
            .join("");


    addStudentActionEvents();


    updateResultText(
        totalFilteredStudents
    );


    updatePagination(
        totalFilteredStudents,
        totalPages,
        startIndex,
        studentsForCurrentPage.length
    );

}

/* ==========================================================
   END - RENDER STUDENTS
========================================================== */


/* ==========================================================
   START - CREATE STUDENT ROW
========================================================== */

function createStudentRow(student) {

    const name =
        getStudentName(student);


    const email =
        getStudentEmail(student);


    const initial =
        getInitial(name);


    const status =
        getStudentStatus(student);


    const statusText =
        formatStatus(status);


    const enrollments =
        getEnrollmentCount(student);


    const joined =
        formatJoinedDate(student);


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

                <div class="table-student">

                    <span class="table-student-avatar">
                        ${escapeHTML(initial)}
                    </span>


                    <div class="table-student-info">

                        <strong>
                            ${escapeHTML(name)}
                        </strong>

                        <span>
                            Student
                        </span>

                    </div>

                </div>

            </td>


            <td>
                ${escapeHTML(email)}
            </td>


            <td>

                <span
                    class="student-status-badge status-${escapeHTML(status)}"
                >
                    ${escapeHTML(statusText)}
                </span>

            </td>


            <td>

                <span class="student-enrollment-count">

                    <i class="fa-solid fa-book-open"></i>

                    ${enrollments}

                </span>

            </td>


            <td>

                <span class="student-joined-date">
                    ${escapeHTML(joined)}
                </span>

            </td>


            <td>

                <div class="student-action-buttons">


                    <button
                        type="button"
                        class="view-student-btn"
                        data-student-id="${escapeHTML(student.id)}"
                    >

                        <i class="fa-regular fa-eye"></i>

                        <span>
                            View
                        </span>

                    </button>


                    <button
                        type="button"
                        class="status-student-btn ${statusAction}"
                        data-student-id="${escapeHTML(student.id)}"
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
   END - CREATE STUDENT ROW
========================================================== */


/* ==========================================================
   START - RESULT TEXT
========================================================== */

function updateResultText(total) {

    if (!studentsResultText) {
        return;
    }


    if (total === 0) {

        studentsResultText.textContent =
            "No students match your search.";

        return;
    }


    if (total === 1) {

        studentsResultText.textContent =
            "1 student found.";

        return;
    }


    studentsResultText.textContent =
        `${total} students found.`;

}

/* ==========================================================
   END - RESULT TEXT
========================================================== */


/* ==========================================================
   START - PAGINATION
========================================================== */

function updatePagination(
    totalStudents,
    totalPages,
    startIndex,
    currentPageStudentCount
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
            totalStudents === 0;

    }


    if (!paginationSummary) {
        return;
    }


    if (totalStudents === 0) {

        paginationSummary.textContent =
            "Showing 0 students";

        return;
    }


    const firstStudentNumber =
        startIndex + 1;


    const lastStudentNumber =
        startIndex +
        currentPageStudentCount;


    paginationSummary.textContent =
        `Showing ${firstStudentNumber}–${lastStudentNumber} of ${totalStudents} students`;

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

            renderStudents();

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
                        filteredStudents.length /
                        studentsPerPage
                    )
                );


            if (
                currentPage >= totalPages
            ) {
                return;
            }


            currentPage++;

            renderStudents();

        }
    );

}

/* ==========================================================
   END - PAGINATION EVENTS
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
   START - STUDENT ACTION EVENTS
========================================================== */

function addStudentActionEvents() {

    document
        .querySelectorAll(
            ".view-student-btn"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    openStudentDetails(
                        button.dataset.studentId
                    );

                }
            );

        });


    document
        .querySelectorAll(
            ".status-student-btn"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    openStatusConfirmation(
                        button.dataset.studentId
                    );

                }
            );

        });

}

/* ==========================================================
   END - STUDENT ACTION EVENTS
========================================================== */


/* ==========================================================
   START - VIEW STUDENT
========================================================== */

function openStudentDetails(
    studentId
) {

    const student =
        findStudentById(
            studentId
        );


    if (
        !student ||
        !viewStudentModal
    ) {
        return;
    }


    const name =
        getStudentName(student);


    if (viewStudentAvatar) {

        viewStudentAvatar.textContent =
            getInitial(name);

    }


    if (viewStudentName) {

        viewStudentName.textContent =
            name;

    }


    if (viewStudentEmail) {

        viewStudentEmail.textContent =
            getStudentEmail(student);

    }


    if (viewStudentRole) {

        viewStudentRole.textContent =
            "Student";

    }


    if (viewStudentStatus) {

        viewStudentStatus.textContent =
            formatStatus(
                getStudentStatus(student)
            );

    }


    if (viewStudentEnrollments) {

        viewStudentEnrollments.textContent =
            getEnrollmentCount(student);

    }


    if (viewStudentJoined) {

        viewStudentJoined.textContent =
            formatJoinedDate(student);

    }


    openModal(
        viewStudentModal
    );

}

/* ==========================================================
   END - VIEW STUDENT
========================================================== */


/* ==========================================================
   START - STATUS CONFIRMATION
========================================================== */

function openStatusConfirmation(
    studentId
) {

    const student =
        findStudentById(
            studentId
        );


    if (
        !student ||
        !statusModal
    ) {
        return;
    }


    const currentStatus =
        getStudentStatus(student);


    const willReactivate =
        currentStatus === "suspended";


    selectedStudentId =
        student.id;


    selectedNewStatus =
        willReactivate
            ? "active"
            : "suspended";


    const studentName =
        getStudentName(student);


    if (statusStudentName) {

        statusStudentName.textContent =
            studentName;

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
            "Suspend Student";

    }


    if (statusConfirmationHeading) {

        statusConfirmationHeading.textContent =
            "Suspend this student?";

    }


    if (statusHelpText) {

        statusHelpText.textContent =
            "A suspended student will not be allowed to access the student dashboard until the account is reactivated.";

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
                Suspend Student
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
            "Reactivate Student";

    }


    if (statusConfirmationHeading) {

        statusConfirmationHeading.textContent =
            "Reactivate this student?";

    }


    if (statusHelpText) {

        statusHelpText.textContent =
            "The student will regain access to the student dashboard after the account is reactivated.";

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
                Reactivate Student
            </span>
        `;

    }

}

/* ==========================================================
   END - REACTIVATE MODAL
========================================================== */


/* ==========================================================
   START - UPDATE STUDENT STATUS
========================================================== */

if (confirmStatusBtn) {

    confirmStatusBtn.addEventListener(
        "click",
        async () => {

            if (
                !selectedStudentId ||
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
                        selectedStudentId
                    ),
                    {
                        status: selectedNewStatus
                    }
                );


                closeStatusConfirmation();


                await loadStudents();


            } catch (error) {

                console.error(
                    "Student Status Update Error:",
                    error
                );


                if (
                    error?.code ===
                    "permission-denied"
                ) {

                    alert(
                        "Firestore does not currently allow this student status change."
                    );

                } else {

                    alert(
                        "Unable to update student status. Please try again."
                    );

                }


            } finally {

                setStatusLoading(false);

            }

        }
    );

}

/* ==========================================================
   END - UPDATE STUDENT STATUS
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
            ? "Reactivate Student"
            : "Suspend Student";

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
            ".student-modal.show"
        );


    if (!anotherModalOpen) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


function closeStudentDetails() {

    closeModal(
        viewStudentModal
    );

}


function closeStatusConfirmation() {

    closeModal(
        statusModal
    );


    selectedStudentId = null;
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
        closeStudentDetails
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


if (viewStudentModal) {

    viewStudentModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                viewStudentModal
            ) {

                closeStudentDetails();

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
   START - STUDENT HELPERS
========================================================== */

function findStudentById(
    studentId
) {

    return allStudents.find(
        (student) => {

            return (
                student.id ===
                studentId
            );

        }
    );

}


function getStudentName(student) {

    return (
        student.name ||
        student.fullName ||
        student.displayName ||
        student.username ||
        "EduVerse Student"
    );

}


function getStudentEmail(student) {

    return (
        student.email ||
        "No email available"
    );

}


function getStudentStatus(student) {

    const status =
        String(
            student.status || "active"
        )
            .trim()
            .toLowerCase();


    if (status === "suspended") {

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


    if (normalizedStatus === "suspended") {

        return "suspended";

    }


    if (normalizedStatus === "active") {

        return "active";

    }


    return "all";

}


function formatStatus(status) {

    return (
        getStudentStatus({
            status: status
        }) === "suspended"
            ? "Suspended"
            : "Active"
    );

}


function getInitial(name) {

    const safeName =
        String(
            name || "S"
        ).trim();


    return (
        safeName.charAt(0) ||
        "S"
    ).toUpperCase();

}

/* ==========================================================
   END - STUDENT HELPERS
========================================================== */


/* ==========================================================
   START - ENROLLMENT HELPERS
========================================================== */

function getEnrollmentCount(student) {

    const possibleValues = [
        student.enrollmentCount,
        student.enrolledCourses,
        student.enrolledCoursesCount,
        student.courseCount
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

/* ==========================================================
   END - ENROLLMENT HELPERS
========================================================== */


/* ==========================================================
   START - DATE HELPERS
========================================================== */

function sortStudentsByNewest(a, b) {

    return (
        getStudentTimestamp(b) -
        getStudentTimestamp(a)
    );

}


function getStudentTimestamp(student) {

    const possibleDates = [
        student.createdAt,
        student.created_at,
        student.joinedAt,
        student.registeredAt
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


function formatJoinedDate(student) {

    const timestamp =
        getStudentTimestamp(student);


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

function showStudentsLoadError() {

    allStudents = [];
    filteredStudents = [];


    if (studentsTableBody) {

        studentsTableBody.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="table-message"
                >
                    Unable to load students.
                </td>

            </tr>
        `;

    }


    if (studentsResultText) {

        studentsResultText.textContent =
            "Student data could not be loaded.";

    }


    if (noStudents) {

        noStudents.hidden = true;

    }


    if (totalStudentsElement) {

        totalStudentsElement.textContent =
            "0";

    }


    if (activeStudentsElement) {

        activeStudentsElement.textContent =
            "0";

    }


    if (suspendedStudentsElement) {

        suspendedStudentsElement.textContent =
            "0";

    }


    if (enrolledStudentsElement) {

        enrolledStudentsElement.textContent =
            "0";

    }


    if (paginationSummary) {

        paginationSummary.textContent =
            "Showing 0 students";

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
            event.key !== "Escape"
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
            viewStudentModal?.classList.contains(
                "show"
            )
        ) {

            closeStudentDetails();

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
                    "Students Logout Error:",
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
   END - EDUVERSE ADMIN STUDENTS
========================================================== */