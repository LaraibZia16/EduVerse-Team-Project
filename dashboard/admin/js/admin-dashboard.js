/* ==========================================================
   START - EDUVERSE ADMIN DASHBOARD
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

const logoutBtn = document.getElementById("logoutBtn");

const menuToggle = document.getElementById("menuToggle");
const sidebarClose = document.getElementById("sidebarClose");
const adminSidebar = document.getElementById("adminSidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

const adminName = document.getElementById("adminName");

const totalUsersElement = document.getElementById("totalUsers");
const totalStudentsElement = document.getElementById("totalStudents");
const totalTeachersElement = document.getElementById("totalTeachers");
const totalCoursesElement = document.getElementById("totalCourses");

const recentUsersTable = document.getElementById("recentUsersTable");
const recentActivity = document.getElementById("recentActivity");

/* ==========================================================
   END - DOM ELEMENTS
========================================================== */


/* ==========================================================
   START - ADMIN PROFILE DOM ELEMENTS
========================================================== */

const adminProfileBtn =
    document.getElementById("adminProfileBtn");

const adminProfileModal =
    document.getElementById("adminProfileModal");

const closeAdminProfile =
    document.getElementById("closeAdminProfile");

const cancelProfileBtn =
    document.getElementById("cancelProfileBtn");


const adminAvatarInitial =
    document.getElementById("adminAvatarInitial");

const profileModalInitial =
    document.getElementById("profileModalInitial");

const profileDisplayName =
    document.getElementById("profileDisplayName");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const profileRole =
    document.getElementById("profileRole");

const profileStatus =
    document.getElementById("profileStatus");

const profileJoined =
    document.getElementById("profileJoined");

// Start - Admin Profile Save Elements

const adminProfileForm =
    document.getElementById("adminProfileForm");

const saveProfileBtn =
    document.getElementById("saveProfileBtn");

const profileMessage =
    document.getElementById("profileMessage");

// End - Admin Profile Save Elements

/* ==========================================================
   END - ADMIN PROFILE DOM ELEMENTS
========================================================== */


/* ==========================================================
   START - DASHBOARD STATE
========================================================== */

let allUsers = [];
let allCourses = [];

let dashboardStats = {
    users: 0,
    students: 0,
    teachers: 0,
    admins: 0,
    courses: 0
};

let userDistributionChart = null;
let platformOverviewChart = null;

/* ==========================================================
   END - DASHBOARD STATE
========================================================== */


/* ==========================================================
   START - ADMIN AUTH PROTECTION
========================================================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.replace(
            "../../../login.html"
        );

        return;
    }


    try {

        const userSnapshot = await getDoc(
            doc(
                db,
                "users",
                user.uid
            )
        );


        if (!userSnapshot.exists()) {

            await signOut(auth);

            window.location.replace(
                "../../../login.html"
            );

            return;
        }


        const userData = userSnapshot.data();


        if (userData.role !== "admin") {

            await signOut(auth);

            window.location.replace(
                "../../../login.html"
            );

            return;
        }


        /* ----------------------------------------------
           Admin is authenticated successfully
        ---------------------------------------------- */

        setAdminInformation(
            userData,
            user
        );


        /*
           Dashboard data is loaded separately.

           IMPORTANT:
           If dashboard data fails, the admin will NOT
           be signed out.
        */

        loadDashboardData();


    } catch (error) {

        console.error(
            "Admin Authentication Error:",
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

});

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

    const name =
        userData.name ||
        userData.fullName ||
        firebaseUser.displayName ||
        "Admin";


    const email =
        userData.email ||
        firebaseUser.email ||
        "";


    const role =
        formatRole(
            userData.role || "admin"
        );


    const status =
        userData.status
            ? formatRole(userData.status)
            : "Active";


    const joined =
        formatUserDate(userData);


    const initial =
        getInitial(name);


    /* ----------------------------------------------
       Topbar Information
    ---------------------------------------------- */

    if (adminName) {

        adminName.textContent =
            name;

    }


    if (adminAvatarInitial) {

        adminAvatarInitial.textContent =
            initial;

    }


    /* ----------------------------------------------
       Profile Modal Information
    ---------------------------------------------- */

    if (profileModalInitial) {

        profileModalInitial.textContent =
            initial;

    }


    if (profileDisplayName) {

        profileDisplayName.textContent =
            name;

    }


    if (profileName) {

        profileName.value =
            name;

    }


    if (profileEmail) {

        profileEmail.value =
            email;

    }


    if (profileRole) {

        profileRole.value =
            role;

    }


    if (profileStatus) {

        profileStatus.value =
            status;

    }


    if (profileJoined) {

        profileJoined.value =
            joined;

    }

}

/* ==========================================================
   END - ADMIN INFORMATION
========================================================== */


/* ==========================================================
   START - LOAD DASHBOARD DATA
========================================================== */

async function loadDashboardData() {

    try {

        await loadUsers();

        await loadCourses();

        calculateStatistics();

        updateStatistics();

        renderRecentUsers();

        renderPlatformOverview();

        renderCharts();


    } catch (error) {

        /*
           IMPORTANT:
           Dashboard data error must NEVER log the
           authenticated admin out.
        */

        console.error(
            "Admin Dashboard Data Error:",
            error
        );


        showDashboardDataError();

    }

}

/* ==========================================================
   END - LOAD DASHBOARD DATA
========================================================== */


/* ==========================================================
   START - LOAD REAL FIRESTORE USERS
========================================================== */

async function loadUsers() {

    const usersSnapshot = await getDocs(
        collection(
            db,
            "users"
        )
    );


    allUsers = usersSnapshot.docs.map(
        (userDocument) => {

            return {
                id: userDocument.id,
                ...userDocument.data()
            };

        }
    );

}

/* ==========================================================
   END - LOAD REAL FIRESTORE USERS
========================================================== */


/* ==========================================================
   START - LOAD REAL FIRESTORE COURSES
========================================================== */

async function loadCourses() {

    const coursesSnapshot = await getDocs(
        collection(
            db,
            "courses"
        )
    );


    allCourses = coursesSnapshot.docs.map(
        (courseDocument) => {

            return {
                id: courseDocument.id,
                ...courseDocument.data()
            };

        }
    );

}

/* ==========================================================
   END - LOAD REAL FIRESTORE COURSES
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
   START - CALCULATE STATISTICS
========================================================== */

function calculateStatistics() {

    dashboardStats.users =
        allUsers.length;


    dashboardStats.students =
        allUsers.filter((user) => {

            return normalizeRole(user.role) === "student";

        }).length;


    dashboardStats.teachers =
        allUsers.filter((user) => {

            return normalizeRole(user.role) === "teacher";

        }).length;


    dashboardStats.admins =
        allUsers.filter((user) => {

            return normalizeRole(user.role) === "admin";

        }).length;


    /* Start - Calculate Real Available Courses */

    dashboardStats.courses =
        allCourses.filter((course) => {

            const status =
                String(
                    course.status || ""
                )
                    .trim()
                    .toLowerCase();


            return status === "active";

        }).length;

    /* End - Calculate Real Available Courses */

}

/* ==========================================================
   END - CALCULATE STATISTICS
========================================================== */


/* ==========================================================
   START - UPDATE STAT CARDS
========================================================== */

function updateStatistics() {

    if (totalUsersElement) {

        totalUsersElement.textContent =
            dashboardStats.users;

    }


    if (totalStudentsElement) {

        totalStudentsElement.textContent =
            dashboardStats.students;

    }


    if (totalTeachersElement) {

        totalTeachersElement.textContent =
            dashboardStats.teachers;

    }


    if (totalCoursesElement) {

        totalCoursesElement.textContent =
            dashboardStats.courses;

    }

}

/* ==========================================================
   END - UPDATE STAT CARDS
========================================================== */


/* ==========================================================
   START - RECENT USERS
========================================================== */

function renderRecentUsers() {

    if (!recentUsersTable) {
        return;
    }


    if (allUsers.length === 0) {

        recentUsersTable.innerHTML = `
            <tr>
                <td
                    colspan="3"
                    class="table-message"
                >
                    No registered users found.
                </td>
            </tr>
        `;

        return;
    }


    const recentUsers =
        [...allUsers]
            .sort(sortUsersByNewest)
            .slice(0, 5);


    recentUsersTable.innerHTML =
        recentUsers.map((user) => {

            const name =
                getUserName(user);


            const email =
                user.email ||
                "No email";


            const role =
                formatRole(user.role);


            const joined =
                formatUserDate(user);


            const initial =
                getInitial(name);


            return `
                <tr>

                    <td>

                        <div class="recent-user">

                            <span class="recent-user-avatar">
                                ${escapeHTML(initial)}
                            </span>

                            <div class="recent-user-info">

                                <strong>
                                    ${escapeHTML(name)}
                                </strong>

                                <span>
                                    ${escapeHTML(email)}
                                </span>

                            </div>

                        </div>

                    </td>


                    <td>

                        <span
                            class="role-badge role-${escapeHTML(
                                normalizeRole(user.role)
                            )}"
                        >
                            ${escapeHTML(role)}
                        </span>

                    </td>


                    <td>
                        ${escapeHTML(joined)}
                    </td>

                </tr>
            `;

        }).join("");

}

/* ==========================================================
   END - RECENT USERS
========================================================== */


/* ==========================================================
   START - USER DATE HELPERS
========================================================== */

function sortUsersByNewest(a, b) {

    return (
        getTimestampValue(b) -
        getTimestampValue(a)
    );

}


function getTimestampValue(user) {

    const possibleDates = [
        user.createdAt,
        user.created_at,
        user.joinedAt,
        user.registeredAt
    ];


    for (const value of possibleDates) {

        if (!value) {
            continue;
        }


        if (
            typeof value.toDate === "function"
        ) {

            return value
                .toDate()
                .getTime();

        }


        const date =
            new Date(value);


        if (
            !Number.isNaN(
                date.getTime()
            )
        ) {

            return date.getTime();

        }

    }


    return 0;

}


function formatUserDate(user) {

    const timestamp =
        getTimestampValue(user);


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
   END - USER DATE HELPERS
========================================================== */


/* ==========================================================
   START - USER HELPERS
========================================================== */

function getUserName(user) {

    return (
        user.name ||
        user.fullName ||
        user.displayName ||
        user.username ||
        "EduVerse User"
    );

}


function getInitial(name) {

    const safeName =
        String(
            name || "U"
        ).trim();


    return (
        safeName.charAt(0) || "U"
    ).toUpperCase();

}


function formatRole(role) {

    const value =
        normalizeRole(role);


    if (!value) {

        return "User";

    }


    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}

/* ==========================================================
   END - USER HELPERS
========================================================== */


/* ==========================================================
   START - PLATFORM OVERVIEW
========================================================== */

function renderPlatformOverview() {

    if (!recentActivity) {
        return;
    }


    recentActivity.innerHTML = `

        <div class="activity-item">

            <span class="activity-icon">
                <i class="fa-solid fa-users"></i>
            </span>

            <div>

                <strong>
                    ${dashboardStats.users} Registered Users
                </strong>

                <p>
                    Total accounts available on EduVerse.
                </p>

            </div>

        </div>


        <div class="activity-item">

            <span class="activity-icon">
                <i class="fa-solid fa-user-graduate"></i>
            </span>

            <div>

                <strong>
                    ${dashboardStats.students} Students
                </strong>

                <p>
                    Student accounts on the platform.
                </p>

            </div>

        </div>


        <div class="activity-item">

            <span class="activity-icon">
                <i class="fa-solid fa-chalkboard-user"></i>
            </span>

            <div>

                <strong>
                    ${dashboardStats.teachers} Teachers
                </strong>

                <p>
                    Teacher accounts on the platform.
                </p>

            </div>

        </div>


        <div class="activity-item">

            <span class="activity-icon">
                <i class="fa-solid fa-shield-halved"></i>
            </span>

            <div>

                <strong>
                    ${dashboardStats.admins}
                    ${
                        dashboardStats.admins === 1
                            ? "Admin"
                            : "Admins"
                    }
                </strong>

                <p>
                    Administrator accounts with access.
                </p>

            </div>

        </div>

    `;

}

/* ==========================================================
   END - PLATFORM OVERVIEW
========================================================== */


/* ==========================================================
   START - CHARTS
========================================================== */

function renderCharts() {

    if (
        typeof Chart === "undefined"
    ) {

        console.warn(
            "Chart.js could not be loaded."
        );

        return;
    }


    renderUserDistributionChart();

    renderPlatformOverviewChart();

}

/* ==========================================================
   END - CHARTS
========================================================== */


/* ==========================================================
   START - USER DISTRIBUTION CHART
========================================================== */

function renderUserDistributionChart() {

    const canvas =
        document.getElementById(
            "userDistributionChart"
        );


    if (!canvas) {
        return;
    }


    if (userDistributionChart) {

        userDistributionChart.destroy();

    }


    userDistributionChart =
        new Chart(
            canvas,
            {

                type: "doughnut",


                data: {

                    labels: [
                        "Students",
                        "Teachers",
                        "Admins"
                    ],


                    datasets: [
                        {

                            data: [
                                dashboardStats.students,
                                dashboardStats.teachers,
                                dashboardStats.admins
                            ],


                            backgroundColor: [
                                "#123A8F",
                                "#FFC107",
                                "#22C55E"
                            ],


                            borderWidth: 0,

                            hoverOffset: 5

                        }
                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "70%",


                    plugins: {

                        legend: {

                            position: "bottom",


                            labels: {

                                usePointStyle: true,

                                pointStyle: "circle",

                                padding: 18,


                                font: {
                                    family: "Poppins",
                                    size: 12
                                }

                            }

                        }

                    }

                }

            }
        );

}

/* ==========================================================
   END - USER DISTRIBUTION CHART
========================================================== */


/* ==========================================================
   START - PLATFORM OVERVIEW CHART
========================================================== */

function renderPlatformOverviewChart() {

    const canvas =
        document.getElementById(
            "platformOverviewChart"
        );


    if (!canvas) {
        return;
    }


    if (platformOverviewChart) {

        platformOverviewChart.destroy();

    }


    platformOverviewChart =
        new Chart(
            canvas,
            {

                type: "bar",


                data: {

                    labels: [
                        "Students",
                        "Teachers",
                        "Courses"
                    ],


                    datasets: [
                        {

                            label: "Total",


                            data: [
                                dashboardStats.students,
                                dashboardStats.teachers,
                                dashboardStats.courses
                            ],


                            backgroundColor: [
                                "#123A8F",
                                "#FFC107",
                                "#0F2F74"
                            ],


                            borderRadius: 8,

                            borderSkipped: false,

                            maxBarThickness: 60

                        }
                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,


                    scales: {

                        x: {

                            grid: {
                                display: false
                            }

                        },


                        y: {

                            beginAtZero: true,


                            ticks: {
                                precision: 0
                            },


                            grid: {
                                color:
                                    "rgba(99, 111, 143, 0.10)"
                            }

                        }

                    },


                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            }
        );

}

/* ==========================================================
   END - PLATFORM OVERVIEW CHART
========================================================== */


/* ==========================================================
   START - DASHBOARD DATA ERROR
========================================================== */

function showDashboardDataError() {

    /*
       Dashboard remains accessible because authentication
       has already succeeded.
    */


    if (recentUsersTable) {

        recentUsersTable.innerHTML = `
            <tr>

                <td
                    colspan="3"
                    class="table-message"
                >
                    Unable to load dashboard users.
                </td>

            </tr>
        `;

    }


    if (recentActivity) {

        recentActivity.innerHTML = `

            <div class="activity-item">

                <span class="activity-icon">
                    <i class="fa-solid fa-circle-exclamation"></i>
                </span>

                <div>

                    <strong>
                        Dashboard data unavailable
                    </strong>

                    <p>
                        Authentication is working,
                        but platform data could not be loaded.
                    </p>

                </div>

            </div>

        `;

    }

}

/* ==========================================================
   END - DASHBOARD DATA ERROR
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
                    window.innerWidth <= 991
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
   START - ADMIN PROFILE MODAL
========================================================== */

function openAdminProfileModal() {

    if (!adminProfileModal) {
        return;
    }


    adminProfileModal.classList.add(
        "show"
    );


    adminProfileModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "profile-modal-open"
    );

}


function closeAdminProfileModal() {

    if (!adminProfileModal) {
        return;
    }


    adminProfileModal.classList.remove(
        "show"
    );


    adminProfileModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "profile-modal-open"
    );

}


/* Start - Profile Button */

if (adminProfileBtn) {

    adminProfileBtn.addEventListener(
        "click",
        openAdminProfileModal
    );

}

/* End - Profile Button */


/* Start - Close Button */

if (closeAdminProfile) {

    closeAdminProfile.addEventListener(
        "click",
        closeAdminProfileModal
    );

}

/* End - Close Button */


/* Start - Cancel Button */

if (cancelProfileBtn) {

    cancelProfileBtn.addEventListener(
        "click",
        closeAdminProfileModal
    );

}

/* End - Cancel Button */


/* Start - Click Outside Modal */

if (adminProfileModal) {

    adminProfileModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                adminProfileModal
            ) {

                closeAdminProfileModal();

            }

        }
    );

}

/* End - Click Outside Modal */


/* Start - ESC Key */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            adminProfileModal &&
            adminProfileModal.classList.contains(
                "show"
            )
        ) {

            closeAdminProfileModal();

        }

    }
);

/* End - ESC Key */

/* ==========================================================
   START - SAVE ADMIN PROFILE
========================================================== */

if (adminProfileForm) {

    adminProfileForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const currentUser =
                auth.currentUser;


            if (!currentUser) {

                if (profileMessage) {

                    profileMessage.textContent =
                        "Unable to identify logged-in admin.";

                    profileMessage.className =
                        "profile-message error";

                }

                return;
            }


            const newName =
                profileName
                    ? profileName.value.trim()
                    : "";


            if (!newName) {

                if (profileMessage) {

                    profileMessage.textContent =
                        "Please enter your full name.";

                    profileMessage.className =
                        "profile-message error";

                }

                return;
            }


            try {

                /* Start - Loading State */

                if (saveProfileBtn) {

                    saveProfileBtn.disabled = true;

                    saveProfileBtn.innerHTML = `
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        <span>Saving...</span>
                    `;

                }

                if (profileMessage) {

                    profileMessage.textContent = "";

                    profileMessage.className =
                        "profile-message";

                }

                /* End - Loading State */


                /* Start - Update Firestore */

                await updateDoc(
                    doc(
                        db,
                        "users",
                        currentUser.uid
                    ),
                    {
                        name: newName
                    }
                );

                /* End - Update Firestore */


                /* Start - Update Screen */

                const initial =
                    getInitial(newName);


                if (adminName) {

                    adminName.textContent =
                        newName;

                }


                if (profileDisplayName) {

                    profileDisplayName.textContent =
                        newName;

                }


                if (adminAvatarInitial) {

                    adminAvatarInitial.textContent =
                        initial;

                }


                if (profileModalInitial) {

                    profileModalInitial.textContent =
                        initial;

                }

                /* End - Update Screen */


                /* Start - Success Message */

                if (profileMessage) {

                    profileMessage.textContent =
                        "Profile updated successfully.";

                    profileMessage.className =
                        "profile-message success";

                }

                /* End - Success Message */


            } catch (error) {

                console.error(
                    "Admin Profile Update Error:",
                    error
                );


                if (profileMessage) {

                    profileMessage.textContent =
                        "Unable to update profile.";

                    profileMessage.className =
                        "profile-message error";

                }


            } finally {

                if (saveProfileBtn) {

                    saveProfileBtn.disabled = false;

                    saveProfileBtn.innerHTML = `
                        <i class="fa-solid fa-floppy-disk"></i>
                        <span>Save Changes</span>
                    `;

                }

            }

        }
    );

}

/* ==========================================================
   END - SAVE ADMIN PROFILE
========================================================== */

/* ==========================================================
   END - ADMIN PROFILE MODAL
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
                    "Admin Logout Error:",
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
   START - SECURITY HELPER
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
   END - SECURITY HELPER
========================================================== */


/* ==========================================================
   END - EDUVERSE ADMIN DASHBOARD
========================================================== */