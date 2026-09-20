/* ==========================================================
   START - EDUVERSE ADMIN MANAGE USERS
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
const totalAdminsElement = document.getElementById("totalAdmins");

const searchInput = document.getElementById("searchInput");
const roleFilter = document.getElementById("roleFilter");

const usersTableBody = document.getElementById("usersTableBody");
const usersResultText = document.getElementById("usersResultText");

const noUsers = document.getElementById("noUsers");

const paginationSummary = document.getElementById("paginationSummary");
const pageInfo = document.getElementById("pageInfo");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const viewUserModal = document.getElementById("viewUserModal");
const closeViewModal = document.getElementById("closeViewModal");

const viewUserAvatar = document.getElementById("viewUserAvatar");
const viewUserName = document.getElementById("viewUserName");
const viewUserEmail = document.getElementById("viewUserEmail");
const viewUserRole = document.getElementById("viewUserRole");
const viewUserJoined = document.getElementById("viewUserJoined");
const viewUserStatus = document.getElementById("viewUserStatus");
const viewUserId = document.getElementById("viewUserId");


/* ==========================================================
   START - EDIT USER DOM ELEMENTS
========================================================== */

const editUserModal = document.getElementById("editUserModal");
const closeEditModal = document.getElementById("closeEditModal");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const editUserForm = document.getElementById("editUserForm");
const editUserId = document.getElementById("editUserId");
const editUserName = document.getElementById("editUserName");
const editUserEmail = document.getElementById("editUserEmail");
const editUserRole = document.getElementById("editUserRole");

const editFormMessage = document.getElementById("editFormMessage");
const saveEditBtn = document.getElementById("saveEditBtn");

/* ==========================================================
   END - EDIT USER DOM ELEMENTS
========================================================== */


/* ==========================================================
   END - DOM ELEMENTS
========================================================== */


/* ==========================================================
   START - PAGE STATE
========================================================== */

let allUsers = [];
let filteredUsers = [];

let currentPage = 1;

/*
   Logged-in Admin UID.

   We use this to make sure the Admin cannot
   suspend their own account from Manage Users.
*/
let currentAdminId = null;

const usersPerPage = 5;

/* ==========================================================
   END - PAGE STATE
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

        const adminSnapshot = await getDoc(
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
            normalizeRole(adminData.role) !== "admin"
        ) {

            await signOut(auth);

            window.location.replace(
                "../../../login.html"
            );

            return;
        }


        /*
           Save current Admin UID.
        */

        currentAdminId = user.uid;


        /*
           Admin authenticated successfully.
        */

        setAdminInformation(
            adminData,
            user
        );


        /*
           User data loading is intentionally separate
           from authentication.

           If users fail to load, Admin stays logged in.
        */

        loadUsers();


    } catch (error) {

        console.error(
            "Manage Users Authentication Error:",
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
   START - LOAD FIRESTORE USERS
========================================================== */

async function loadUsers() {

    try {

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


        /*
           Newest registered users appear first.
        */

        allUsers.sort(sortUsersByNewest);


        updateStatistics();

        applyFilters();


    } catch (error) {

        console.error(
            "Manage Users Data Error:",
            error
        );


        showUsersLoadError();

    }

}

/* ==========================================================
   END - LOAD FIRESTORE USERS
========================================================== */


/* ==========================================================
   START - USER STATISTICS
========================================================== */

function updateStatistics() {

    const students =
        allUsers.filter((user) => {

            return normalizeRole(user.role) === "student";

        }).length;


    const teachers =
        allUsers.filter((user) => {

            return normalizeRole(user.role) === "teacher";

        }).length;


    const admins =
        allUsers.filter((user) => {

            return normalizeRole(user.role) === "admin";

        }).length;


    if (totalUsersElement) {

        totalUsersElement.textContent =
            allUsers.length;

    }


    if (totalStudentsElement) {

        totalStudentsElement.textContent =
            students;

    }


    if (totalTeachersElement) {

        totalTeachersElement.textContent =
            teachers;

    }


    if (totalAdminsElement) {

        totalAdminsElement.textContent =
            admins;

    }

}

/* ==========================================================
   END - USER STATISTICS
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


    const selectedRole =
        normalizeRole(
            roleFilter?.value || "all"
        );


    filteredUsers = allUsers.filter(
        (user) => {

            const name =
                getUserName(user)
                    .toLowerCase();


            const email =
                String(
                    user.email || ""
                ).toLowerCase();


            const role =
                normalizeRole(user.role);


            const matchesSearch =
                name.includes(searchTerm) ||
                email.includes(searchTerm);


            const matchesRole =
                selectedRole === "all" ||
                role === selectedRole;


            return (
                matchesSearch &&
                matchesRole
            );

        }
    );


    /*
       Whenever search/filter changes,
       return to page 1.
    */

    currentPage = 1;


    renderUsers();

}

/* ==========================================================
   END - SEARCH AND FILTER
========================================================== */


/* ==========================================================
   START - RENDER USERS
========================================================== */

function renderUsers() {

    if (!usersTableBody) {
        return;
    }


    const totalFilteredUsers =
        filteredUsers.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalFilteredUsers /
                usersPerPage
            )
        );


    if (currentPage > totalPages) {

        currentPage = totalPages;

    }


    const startIndex =
        (currentPage - 1) *
        usersPerPage;


    const endIndex =
        startIndex +
        usersPerPage;


    const usersForCurrentPage =
        filteredUsers.slice(
            startIndex,
            endIndex
        );


    /* ------------------------------------------------------
       No users found
    ------------------------------------------------------ */

    if (totalFilteredUsers === 0) {

        usersTableBody.innerHTML = "";


        if (noUsers) {

            noUsers.hidden = false;

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


    /* ------------------------------------------------------
       Users found
    ------------------------------------------------------ */

    if (noUsers) {

        noUsers.hidden = true;

    }


    usersTableBody.innerHTML =
        usersForCurrentPage
            .map(createUserRow)
            .join("");


    /*
       Buttons are recreated whenever the table
       renders, so events are attached again.
    */

    addViewButtonEvents();

    addEditButtonEvents();

    addStatusButtonEvents();


    updateResultsText(
        totalFilteredUsers
    );


    updatePagination(
        totalFilteredUsers,
        totalPages,
        startIndex,
        usersForCurrentPage.length
    );

}

/* ==========================================================
   END - RENDER USERS
========================================================== */


/* ==========================================================
   START - CREATE USER ROW
========================================================== */

function createUserRow(user) {

    const name =
        getUserName(user);


    const email =
        user.email ||
        "No email available";


    const role =
        normalizeRole(user.role);


    const formattedRole =
        formatRole(role);


    const joinedDate =
        formatUserDate(user);


    const initial =
        getInitial(name);


    /*
       Existing users may not have a status field yet.
       Missing status is treated as Active.
    */

    const status =
        normalizeStatus(user.status);


    const formattedStatus =
        formatStatus(status);


    /*
       Current logged-in Admin must not be able
       to suspend themselves.
    */

    const isCurrentAdmin =
        user.id === currentAdminId;


    return `
        <tr>

            <td>

                <div class="table-user">

                    <span class="table-user-avatar">
                        ${escapeHTML(initial)}
                    </span>


                    <div class="table-user-info">

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
                    class="role-badge role-${escapeHTML(role)}"
                >
                    ${escapeHTML(formattedRole)}
                </span>

            </td>


            <td>
                ${escapeHTML(joinedDate)}
            </td>


            <td>

                <span
                    class="status-badge status-${escapeHTML(status)}"
                >
                    ${escapeHTML(formattedStatus)}
                </span>

            </td>


            <td>

                <div class="user-action-buttons">

                    <button
                        type="button"
                        class="view-user-btn"
                        data-user-id="${escapeHTML(user.id)}"
                    >

                        <i class="fa-regular fa-eye"></i>

                        <span>View</span>

                    </button>


                    <button
                        type="button"
                        class="edit-user-btn"
                        data-user-id="${escapeHTML(user.id)}"
                    >

                        <i class="fa-regular fa-pen-to-square"></i>

                        <span>Edit</span>

                    </button>


                    ${
                        isCurrentAdmin
                            ? ""
                            : `
                                <button
                                    type="button"
                                    class="status-user-btn ${
                                        status === "suspended"
                                            ? "reactivate-user-btn"
                                            : "suspend-user-btn"
                                    }"
                                    data-user-id="${escapeHTML(user.id)}"
                                >

                                    <i class="fa-solid ${
                                        status === "suspended"
                                            ? "fa-user-check"
                                            : "fa-user-slash"
                                    }"></i>

                                    <span>
                                        ${
                                            status === "suspended"
                                                ? "Reactivate"
                                                : "Suspend"
                                        }
                                    </span>

                                </button>
                            `
                    }

                </div>

            </td>

        </tr>
    `;

}

/* ==========================================================
   END - CREATE USER ROW
========================================================== */


/* ==========================================================
   START - RESULT TEXT
========================================================== */

function updateResultsText(total) {

    if (!usersResultText) {
        return;
    }


    if (total === 0) {

        usersResultText.textContent =
            "No registered users match your search.";

        return;
    }


    if (total === 1) {

        usersResultText.textContent =
            "1 registered user found.";

        return;
    }


    usersResultText.textContent =
        `${total} registered users found.`;

}

/* ==========================================================
   END - RESULT TEXT
========================================================== */


/* ==========================================================
   START - PAGINATION
========================================================== */

function updatePagination(
    totalUsers,
    totalPages,
    startIndex,
    currentPageUserCount
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
            totalUsers === 0;

    }


    if (!paginationSummary) {
        return;
    }


    if (totalUsers === 0) {

        paginationSummary.textContent =
            "Showing 0 users";

        return;
    }


    const firstUserNumber =
        startIndex + 1;


    const lastUserNumber =
        startIndex +
        currentPageUserCount;


    paginationSummary.textContent =
        `Showing ${firstUserNumber}–${lastUserNumber} of ${totalUsers} users`;

}


/* ==========================================================
   PREVIOUS PAGE
========================================================== */

if (prevBtn) {

    prevBtn.addEventListener(
        "click",
        () => {

            if (currentPage <= 1) {
                return;
            }


            currentPage--;


            renderUsers();

        }
    );

}


/* ==========================================================
   NEXT PAGE
========================================================== */

if (nextBtn) {

    nextBtn.addEventListener(
        "click",
        () => {

            const totalPages =
                Math.max(
                    1,
                    Math.ceil(
                        filteredUsers.length /
                        usersPerPage
                    )
                );


            if (
                currentPage >= totalPages
            ) {
                return;
            }


            currentPage++;


            renderUsers();

        }
    );

}

/* ==========================================================
   END - PAGINATION
========================================================== */


/* ==========================================================
   START - SEARCH EVENTS
========================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        applyFilters
    );

}


if (roleFilter) {

    roleFilter.addEventListener(
        "change",
        applyFilters
    );

}

/* ==========================================================
   END - SEARCH EVENTS
========================================================== */


/* ==========================================================
   START - VIEW USER BUTTON EVENTS
========================================================== */

function addViewButtonEvents() {

    const viewButtons =
        document.querySelectorAll(
            ".view-user-btn"
        );


    viewButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const userId =
                        button.dataset.userId;


                    openUserDetails(
                        userId
                    );

                }
            );

        }
    );

}

/* ==========================================================
   END - VIEW USER BUTTON EVENTS
========================================================== */


/* ==========================================================
   START - OPEN USER DETAILS
========================================================== */

function openUserDetails(userId) {

    const selectedUser =
        allUsers.find(
            (user) => {

                return user.id === userId;

            }
        );


    if (!selectedUser) {

        console.error(
            "Selected user could not be found."
        );

        return;
    }


    const name =
        getUserName(selectedUser);


    if (viewUserAvatar) {

        viewUserAvatar.textContent =
            getInitial(name);

    }


    if (viewUserName) {

        viewUserName.textContent =
            name;

    }


    if (viewUserEmail) {

        viewUserEmail.textContent =
            selectedUser.email ||
            "No email available";

    }


    if (viewUserRole) {

        viewUserRole.textContent =
            formatRole(
                selectedUser.role
            );

    }


    if (viewUserJoined) {

        viewUserJoined.textContent =
            formatUserDate(
                selectedUser
            );

    }


    /*
       Show real Firestore account status.
    */

    if (viewUserStatus) {

        viewUserStatus.textContent =
            formatStatus(
                selectedUser.status
            );

    }


    if (viewUserId) {

        viewUserId.textContent =
            selectedUser.id;

    }


    openViewModal();

}

/* ==========================================================
   END - OPEN USER DETAILS
========================================================== */


/* ==========================================================
   START - VIEW USER MODAL
========================================================== */

function openViewModal() {

    if (!viewUserModal) {
        return;
    }


    viewUserModal.classList.add(
        "show"
    );


    viewUserModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


function closeUserModal() {

    if (!viewUserModal) {
        return;
    }


    viewUserModal.classList.remove(
        "show"
    );


    viewUserModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );

}


/* ==========================================================
   CLOSE VIEW MODAL BUTTON
========================================================== */

if (closeViewModal) {

    closeViewModal.addEventListener(
        "click",
        closeUserModal
    );

}


/* ==========================================================
   CLICK OUTSIDE VIEW MODAL
========================================================== */

if (viewUserModal) {

    viewUserModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                viewUserModal
            ) {

                closeUserModal();

            }

        }
    );

}

/* ==========================================================
   END - VIEW USER MODAL
========================================================== */


/* ==========================================================
   START - EDIT USER
========================================================== */

function addEditButtonEvents() {

    const editButtons =
        document.querySelectorAll(
            ".edit-user-btn"
        );


    editButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const userId =
                    button.dataset.userId;


                openEditUserModal(
                    userId
                );

            }
        );

    });

}


/* ==========================================================
   START - OPEN EDIT USER MODAL
========================================================== */

function openEditUserModal(userId) {

    const selectedUser =
        allUsers.find((user) => {

            return user.id === userId;

        });


    if (
        !selectedUser ||
        !editUserModal
    ) {
        return;
    }


    if (editUserId) {

        editUserId.value =
            selectedUser.id;

    }


    if (editUserName) {

        editUserName.value =
            getUserName(
                selectedUser
            );

    }


    if (editUserEmail) {

        editUserEmail.value =
            selectedUser.email || "";

    }


    if (editUserRole) {

        editUserRole.value =
            formatRole(
                selectedUser.role
            );

    }


    hideEditMessage();


    editUserModal.classList.add(
        "show"
    );


    editUserModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );


    setTimeout(() => {

        editUserName?.focus();

    }, 100);

}

/* ==========================================================
   END - OPEN EDIT USER MODAL
========================================================== */


/* ==========================================================
   START - CLOSE EDIT USER MODAL
========================================================== */

function closeEditUserModal() {

    if (!editUserModal) {
        return;
    }


    editUserModal.classList.remove(
        "show"
    );


    editUserModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );


    if (editUserForm) {

        editUserForm.reset();

    }


    hideEditMessage();

}

/* ==========================================================
   END - CLOSE EDIT USER MODAL
========================================================== */


/* ==========================================================
   START - EDIT FORM SUBMIT
========================================================== */

if (editUserForm) {

    editUserForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const userId =
                editUserId?.value.trim();


            const newName =
                editUserName?.value.trim();


            if (!userId) {

                showEditMessage(
                    "Unable to identify this user.",
                    "error"
                );

                return;
            }


            if (
                !newName ||
                newName.length < 2
            ) {

                showEditMessage(
                    "Please enter a valid name.",
                    "error"
                );

                return;
            }


            const selectedUser =
                allUsers.find((user) => {

                    return user.id === userId;

                });


            if (!selectedUser) {

                showEditMessage(
                    "User could not be found.",
                    "error"
                );

                return;
            }


            if (
                newName ===
                getUserName(selectedUser)
            ) {

                showEditMessage(
                    "No changes were made.",
                    "error"
                );

                return;
            }


            try {

                setEditLoading(true);


                /*
                   Only profile name is updated.

                   Email, UID and role are intentionally
                   protected.
                */

                await updateDoc(
                    doc(
                        db,
                        "users",
                        userId
                    ),
                    {
                        name: newName
                    }
                );


                const userIndex =
                    allUsers.findIndex(
                        (user) => {

                            return user.id === userId;

                        }
                    );


                if (userIndex !== -1) {

                    allUsers[userIndex] = {
                        ...allUsers[userIndex],
                        name: newName
                    };

                }


                showEditMessage(
                    "User profile updated successfully.",
                    "success"
                );


                applyFilters();


                setTimeout(() => {

                    closeEditUserModal();

                }, 800);


            } catch (error) {

                console.error(
                    "Edit User Error:",
                    error
                );


                showEditMessage(
                    "Unable to update user. Please try again.",
                    "error"
                );


            } finally {

                setEditLoading(false);

            }

        }
    );

}

/* ==========================================================
   END - EDIT FORM SUBMIT
========================================================== */


/* ==========================================================
   START - EDIT MESSAGE
========================================================== */

function showEditMessage(
    message,
    type
) {

    if (!editFormMessage) {
        return;
    }


    editFormMessage.textContent =
        message;


    editFormMessage.className =
        `edit-form-message ${type}`;


    editFormMessage.hidden =
        false;

}


function hideEditMessage() {

    if (!editFormMessage) {
        return;
    }


    editFormMessage.textContent =
        "";


    editFormMessage.className =
        "edit-form-message";


    editFormMessage.hidden =
        true;

}

/* ==========================================================
   END - EDIT MESSAGE
========================================================== */


/* ==========================================================
   START - EDIT LOADING STATE
========================================================== */

function setEditLoading(
    isLoading
) {

    if (!saveEditBtn) {
        return;
    }


    saveEditBtn.disabled =
        isLoading;


    const text =
        saveEditBtn.querySelector(
            "span"
        );


    if (text) {

        text.textContent =
            isLoading
                ? "Saving..."
                : "Save Changes";

    }

}

/* ==========================================================
   END - EDIT LOADING STATE
========================================================== */


/* ==========================================================
   START - EDIT MODAL EVENTS
========================================================== */

if (closeEditModal) {

    closeEditModal.addEventListener(
        "click",
        closeEditUserModal
    );

}


if (cancelEditBtn) {

    cancelEditBtn.addEventListener(
        "click",
        closeEditUserModal
    );

}


if (editUserModal) {

    editUserModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                editUserModal
            ) {

                closeEditUserModal();

            }

        }
    );

}

/* ==========================================================
   END - EDIT MODAL EVENTS
========================================================== */


/* ==========================================================
   END - EDIT USER
========================================================== */


/* ==========================================================
   START - SUSPEND / REACTIVATE USER
========================================================== */

function addStatusButtonEvents() {

    const statusButtons =
        document.querySelectorAll(
            ".status-user-btn"
        );


    statusButtons.forEach((button) => {

        button.addEventListener(
            "click",
            async () => {

                const userId =
                    button.dataset.userId;


                await changeUserStatus(
                    userId,
                    button
                );

            }
        );

    });

}


/* ==========================================================
   START - CHANGE USER STATUS
========================================================== */

async function changeUserStatus(
    userId,
    button
) {

    const selectedUser =
        allUsers.find((user) => {

            return user.id === userId;

        });


    if (!selectedUser) {

        alert(
            "User could not be found."
        );

        return;
    }


    /*
       Extra frontend protection.

       Logged-in Admin cannot suspend
       their own account.
    */

    if (userId === currentAdminId) {

        alert(
            "You cannot suspend your own Admin account."
        );

        return;
    }


    const currentStatus =
        normalizeStatus(
            selectedUser.status
        );


    const newStatus =
        currentStatus === "suspended"
            ? "active"
            : "suspended";


    const userName =
        getUserName(
            selectedUser
        );


    const actionText =
        newStatus === "suspended"
            ? "suspend"
            : "reactivate";


    const confirmed =
        window.confirm(
            `Are you sure you want to ${actionText} ${userName}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        setStatusButtonLoading(
            button,
            true
        );


        /*
           Save real account status
           inside Firestore.
        */

        await updateDoc(
            doc(
                db,
                "users",
                userId
            ),
            {
                status: newStatus
            }
        );


        /*
           Update local user data only after
           Firestore update succeeds.
        */

        const userIndex =
            allUsers.findIndex(
                (user) => {

                    return user.id === userId;

                }
            );


        if (userIndex !== -1) {

            allUsers[userIndex] = {
                ...allUsers[userIndex],
                status: newStatus
            };

        }


        /*
           Re-render table.

           Badge and Suspend/Reactivate button
           immediately update.
        */

        renderUsers();


    } catch (error) {

        console.error(
            "Change User Status Error:",
            error
        );


        alert(
            "Unable to update user status. Please try again."
        );


        setStatusButtonLoading(
            button,
            false
        );

    }

}

/* ==========================================================
   END - CHANGE USER STATUS
========================================================== */


/* ==========================================================
   START - STATUS BUTTON LOADING
========================================================== */

function setStatusButtonLoading(
    button,
    isLoading
) {

    if (!button) {
        return;
    }


    button.disabled =
        isLoading;


    const text =
        button.querySelector(
            "span"
        );


    if (
        text &&
        isLoading
    ) {

        text.textContent =
            "Updating...";

    }

}

/* ==========================================================
   END - STATUS BUTTON LOADING
========================================================== */


/* ==========================================================
   END - SUSPEND / REACTIVATE USER
========================================================== */


/* ==========================================================
   START - USER HELPERS
========================================================== */

/*
   Missing status means Active.

   This allows old Firestore users to work
   without manually adding status to every document.
*/

function normalizeStatus(status) {

    const normalizedStatus =
        String(
            status || ""
        )
            .trim()
            .toLowerCase();


    return normalizedStatus === "suspended"
        ? "suspended"
        : "active";

}


function formatStatus(status) {

    return normalizeStatus(status) === "suspended"
        ? "Suspended"
        : "Active";

}


function normalizeRole(role) {

    return String(
        role || ""
    )
        .trim()
        .toLowerCase();

}


function formatRole(role) {

    const normalizedRole =
        normalizeRole(role);


    if (!normalizedRole) {

        return "User";

    }


    return (
        normalizedRole
            .charAt(0)
            .toUpperCase() +
        normalizedRole.slice(1)
    );

}


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
        safeName.charAt(0) ||
        "U"
    ).toUpperCase();

}

/* ==========================================================
   END - USER HELPERS
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


    for (
        const value of possibleDates
    ) {

        if (!value) {
            continue;
        }


        /*
           Firestore Timestamp
        */

        if (
            typeof value.toDate ===
            "function"
        ) {

            return value
                .toDate()
                .getTime();

        }


        /*
           Normal JavaScript date
           or stored date string.
        */

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
   START - USERS LOAD ERROR
========================================================== */

function showUsersLoadError() {

    if (usersTableBody) {

        usersTableBody.innerHTML = `
            <tr>

                <td
                    colspan="5"
                    class="table-message"
                >
                    Unable to load registered users.
                </td>

            </tr>
        `;

    }


    if (usersResultText) {

        usersResultText.textContent =
            "User data could not be loaded.";

    }


    if (noUsers) {

        noUsers.hidden = true;

    }


    if (paginationSummary) {

        paginationSummary.textContent =
            "Showing 0 users";

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
   END - USERS LOAD ERROR
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
            editUserModal?.classList.contains(
                "show"
            )
        ) {

            closeEditUserModal();

            return;
        }


        if (
            viewUserModal?.classList.contains(
                "show"
            )
        ) {

            closeUserModal();

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
                    "Manage Users Logout Error:",
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
   END - EDUVERSE ADMIN MANAGE USERS
========================================================== */