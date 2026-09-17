"use strict";

/* =========================================================
   EDUVERSE ADMIN - USERS
   Frontend only
   Data is stored in localStorage
========================================================= */


/* =========================================================
   INITIAL USER DATA
========================================================= */

const defaultUsers = [
    {
        name: "Ali Khan",
        email: "ali@example.com",
        role: "Student",
        joined: "15 Sep 2026",
        status: "Active"
    },
    {
        name: "Fatima Noor",
        email: "fatima@example.com",
        role: "Student",
        joined: "14 Sep 2026",
        status: "Active"
    },
    {
        name: "Ahmed Raza",
        email: "ahmed@example.com",
        role: "Student",
        joined: "12 Sep 2026",
        status: "Active"
    },
    {
        name: "Usman Ali",
        email: "usman@example.com",
        role: "Teacher",
        joined: "10 Sep 2026",
        status: "Active"
    },
    {
        name: "Zain Ali",
        email: "zain@example.com",
        role: "Student",
        joined: "8 Sep 2026",
        status: "Active"
    },
    {
        name: "Sara Ahmed",
        email: "sara@example.com",
        role: "Teacher",
        joined: "5 Sep 2026",
        status: "Active"
    },
    {
        name: "Admin User",
        email: "admin@example.com",
        role: "Admin",
        joined: "1 Sep 2026",
        status: "Active"
    }
];


/* =========================================================
   LOAD USERS FROM LOCAL STORAGE
========================================================= */

let users = JSON.parse(
    localStorage.getItem("eduverseUsers")
) || defaultUsers;


/* =========================================================
   PAGINATION
========================================================= */

let currentPage = 1;

const usersPerPage = 5;

let deleteIndex = null;


/* =========================================================
   ELEMENTS
========================================================= */

const tableBody = document.getElementById("usersTableBody");

const searchInput = document.getElementById("searchInput");

const roleFilter = document.getElementById("roleFilter");

const noUsers = document.getElementById("noUsers");

const totalUsers = document.getElementById("totalUsers");

const totalStudents = document.getElementById("totalStudents");

const totalTeachers = document.getElementById("totalTeachers");

const prevBtn = document.getElementById("prevBtn");

const nextBtn = document.getElementById("nextBtn");

const pageInfo = document.getElementById("pageInfo");


/* =========================================================
   MODALS
========================================================= */

const viewModal = document.getElementById("viewModal");

const userFormModal = document.getElementById("userFormModal");

const deleteModal = document.getElementById("deleteModal");


/* =========================================================
   VIEW ELEMENTS
========================================================= */

const viewName = document.getElementById("viewName");

const viewEmail = document.getElementById("viewEmail");

const viewRole = document.getElementById("viewRole");

const viewJoined = document.getElementById("viewJoined");

const viewStatus = document.getElementById("viewStatus");


/* =========================================================
   FORM ELEMENTS
========================================================= */

const userForm = document.getElementById("userForm");

const formTitle = document.getElementById("formTitle");

const editIndex = document.getElementById("editIndex");

const userName = document.getElementById("userName");

const userEmail = document.getElementById("userEmail");

const userRole = document.getElementById("userRole");

const userStatus = document.getElementById("userStatus");


/* =========================================================
   DELETE ELEMENTS
========================================================= */

const deleteUserName = document.getElementById("deleteUserName");

const confirmDeleteBtn =
    document.getElementById("confirmDeleteBtn");


/* =========================================================
   ADD USER BUTTON
========================================================= */

const addUserBtn =
    document.getElementById("addUserBtn");


/* =========================================================
   SAVE DATA
========================================================= */

function saveUsers() {

    localStorage.setItem(
        "eduverseUsers",
        JSON.stringify(users)
    );
}


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics() {

    totalUsers.textContent = users.length;

    totalStudents.textContent =
        users.filter(user => user.role === "Student").length;

    totalTeachers.textContent =
        users.filter(user => user.role === "Teacher").length;
}


/* =========================================================
   GET FILTERED USERS
========================================================= */

function getFilteredUsers() {

    const searchValue =
        searchInput.value.toLowerCase().trim();

    const selectedRole =
        roleFilter.value;

    return users.filter(user => {

        const matchesSearch =
            user.name.toLowerCase().includes(searchValue) ||
            user.email.toLowerCase().includes(searchValue);

        const matchesRole =
            selectedRole === "all" ||
            user.role === selectedRole;

        return matchesSearch && matchesRole;
    });
}


/* =========================================================
   DISPLAY USERS
========================================================= */

function displayUsers() {

    const filteredUsers = getFilteredUsers();

    tableBody.innerHTML = "";

    const totalPages =
        Math.ceil(filteredUsers.length / usersPerPage);


    /* No users */

    if (filteredUsers.length === 0) {

        noUsers.style.display = "block";

        pageInfo.textContent = "Page 1";

        prevBtn.disabled = true;

        nextBtn.disabled = true;

        return;
    }


    noUsers.style.display = "none";


    /* Fix current page */

    if (currentPage > totalPages) {

        currentPage = totalPages;
    }


    const start =
        (currentPage - 1) * usersPerPage;

    const end =
        start + usersPerPage;


    const pageUsers =
        filteredUsers.slice(start, end);


    /* Create rows */

    pageUsers.forEach(user => {

        const realIndex =
            users.indexOf(user);

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${escapeHTML(user.name)}</td>

            <td>${escapeHTML(user.email)}</td>

            <td>
                <span class="role ${user.role.toLowerCase()}">
                    ${escapeHTML(user.role)}
                </span>
            </td>

            <td>${escapeHTML(user.joined)}</td>

            <td>
                <span class="status ${user.status.toLowerCase()}">
                    ${escapeHTML(user.status)}
                </span>
            </td>

            <td class="action-buttons">

                <button
                    class="view-btn"
                    data-action="view"
                    data-index="${realIndex}">
                    View
                </button>

                <button
                    class="edit-btn"
                    data-action="edit"
                    data-index="${realIndex}">
                    Edit
                </button>

                <button
                    class="delete-btn"
                    data-action="delete"
                    data-index="${realIndex}">
                    Delete
                </button>

            </td>
        `;


        tableBody.appendChild(row);
    });


    /* Pagination */

    pageInfo.textContent =
        `Page ${currentPage} of ${totalPages}`;


    prevBtn.disabled =
        currentPage === 1;


    nextBtn.disabled =
        currentPage === totalPages;
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   VIEW USER
========================================================= */

function viewUser(index) {

    const user = users[index];

    if (!user) return;


    viewName.textContent = user.name;

    viewEmail.textContent = user.email;

    viewRole.textContent = user.role;

    viewJoined.textContent = user.joined;

    viewStatus.textContent = user.status;


    openModal(viewModal);
}


/* =========================================================
   OPEN ADD USER FORM
========================================================= */

function openAddUser() {

    formTitle.textContent = "Add User";

    editIndex.value = "";

    userForm.reset();

    userRole.value = "Student";

    userStatus.value = "Active";

    openModal(userFormModal);
}


/* =========================================================
   OPEN EDIT USER FORM
========================================================= */

function editUser(index) {

    const user = users[index];

    if (!user) return;


    formTitle.textContent = "Edit User";

    editIndex.value = index;

    userName.value = user.name;

    userEmail.value = user.email;

    userRole.value = user.role;

    userStatus.value = user.status;


    openModal(userFormModal);
}


/* =========================================================
   SAVE USER
========================================================= */

userForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const name =
        userName.value.trim();

    const email =
        userEmail.value.trim();

    const role =
        userRole.value;

    const status =
        userStatus.value;


    if (!name || !email) return;


    const index =
        editIndex.value;


    /* Edit existing user */

    if (index !== "") {

        users[Number(index)] = {

            ...users[Number(index)],

            name: name,

            email: email,

            role: role,

            status: status
        };

    }

    /* Add new user */

    else {

        const newUser = {

            name: name,

            email: email,

            role: role,

            joined: getTodayDate(),

            status: status
        };


        users.unshift(newUser);

        currentPage = 1;
    }


    saveUsers();

    updateStatistics();

    displayUsers();

    closeModal(userFormModal);

});


/* =========================================================
   DELETE USER
========================================================= */

function openDeleteUser(index) {

    const user = users[index];

    if (!user) return;


    deleteIndex = index;

    deleteUserName.textContent = user.name;

    openModal(deleteModal);
}


/* =========================================================
   CONFIRM DELETE
========================================================= */

confirmDeleteBtn.addEventListener(
    "click",
    function () {

        if (deleteIndex === null) return;


        users.splice(deleteIndex, 1);


        saveUsers();

        updateStatistics();

        displayUsers();


        deleteIndex = null;

        closeModal(deleteModal);
    }
);


/* =========================================================
   TABLE ACTIONS
========================================================= */

tableBody.addEventListener("click", function (event) {

    const button =
        event.target.closest("button");


    if (!button) return;


    const index =
        Number(button.dataset.index);

    const action =
        button.dataset.action;


    if (action === "view") {

        viewUser(index);
    }


    if (action === "edit") {

        editUser(index);
    }


    if (action === "delete") {

        openDeleteUser(index);
    }

});


/* =========================================================
   OPEN MODAL
========================================================= */

function openModal(modal) {

    modal.classList.add("show");

    document.body.classList.add("modal-open");
}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal(modal) {

    modal.classList.remove("show");

    document.body.classList.remove("modal-open");
}


/* =========================================================
   CLOSE BUTTONS
========================================================= */

document.querySelectorAll("[data-close]").forEach(button => {

    button.addEventListener("click", function () {

        const modalId =
            button.dataset.close;

        const modal =
            document.getElementById(modalId);

        if (modal) {

            closeModal(modal);
        }

    });

});


/* =========================================================
   CLOSE WHEN CLICKING OUTSIDE
========================================================= */

document.querySelectorAll(".modal").forEach(modal => {

    modal.addEventListener("click", function (event) {

        if (event.target === modal) {

            closeModal(modal);
        }

    });

});


/* =========================================================
   ESC KEY CLOSE
========================================================= */

document.addEventListener("keydown", function (event) {

    if (event.key !== "Escape") return;


    document.querySelectorAll(".modal.show")
        .forEach(modal => {

            closeModal(modal);

        });

});


/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener("input", function () {

    currentPage = 1;

    displayUsers();
});


/* =========================================================
   ROLE FILTER
========================================================= */

roleFilter.addEventListener("change", function () {

    currentPage = 1;

    displayUsers();
});


/* =========================================================
   PREVIOUS PAGE
========================================================= */

prevBtn.addEventListener("click", function () {

    if (currentPage > 1) {

        currentPage--;

        displayUsers();
    }
});


/* =========================================================
   NEXT PAGE
========================================================= */

nextBtn.addEventListener("click", function () {

    const filteredUsers =
        getFilteredUsers();

    const totalPages =
        Math.ceil(
            filteredUsers.length /
            usersPerPage
        );


    if (currentPage < totalPages) {

        currentPage++;

        displayUsers();
    }

});


/* =========================================================
   ADD USER
========================================================= */

addUserBtn.addEventListener(
    "click",
    openAddUser
);


/* =========================================================
   TODAY'S DATE
========================================================= */

function getTodayDate() {

    const today =
        new Date();

    const day =
        String(today.getDate())
            .padStart(2, "0");

    const month =
        today.toLocaleString(
            "en-US",
            { month: "short" }
        );

    const year =
        today.getFullYear();


    return `${day} ${month} ${year}`;
}


/* =========================================================
   INITIAL LOAD
========================================================= */

updateStatistics();

displayUsers();