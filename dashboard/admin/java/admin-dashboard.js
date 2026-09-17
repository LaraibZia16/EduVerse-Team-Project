"use strict";

/* =========================================================
   EduVerse | Admin Dashboard
   Frontend data shared with Users page
   ========================================================= */


/* =========================================================
   DEFAULT DATA
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
   COURSES
========================================================= */

const courses = [
    "HTML & CSS",
    "JavaScript",
    "React JS",
    "Python"
];


/* =========================================================
   GET USERS FROM LOCAL STORAGE
========================================================= */

function getUsers() {

    const savedUsers =
        localStorage.getItem("eduverseUsers");

    if (savedUsers) {

        try {

            return JSON.parse(savedUsers);

        } catch (error) {

            console.error(
                "Could not read saved users.",
                error
            );
        }
    }


    localStorage.setItem(
        "eduverseUsers",
        JSON.stringify(defaultUsers)
    );


    return defaultUsers;
}


/* =========================================================
   INITIALIZE DASHBOARD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateStatistics();

        displayRecentUsers();

        displayRecentActivity();

    }
);


/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics() {

    const users = getUsers();


    const totalUsersElement =
        document.getElementById("totalUsers");

    const totalStudentsElement =
        document.getElementById("totalStudents");

    const totalTeachersElement =
        document.getElementById("totalTeachers");

    const totalCoursesElement =
        document.getElementById("totalCourses");


    const totalUsers =
        users.length;


    const totalStudents =
        users.filter(function (user) {

            return user.role === "Student";

        }).length;


    const totalTeachers =
        users.filter(function (user) {

            return user.role === "Teacher";

        }).length;


    if (totalUsersElement) {

        totalUsersElement.textContent =
            totalUsers;
    }


    if (totalStudentsElement) {

        totalStudentsElement.textContent =
            totalStudents;
    }


    if (totalTeachersElement) {

        totalTeachersElement.textContent =
            totalTeachers;
    }


    if (totalCoursesElement) {

        totalCoursesElement.textContent =
            courses.length;
    }

}


/* =========================================================
   RECENT USERS
========================================================= */

function displayRecentUsers() {

    const tableBody =
        document.getElementById(
            "recentUsersTable"
        );


    if (!tableBody) {

        return;
    }


    const users =
        getUsers();


    tableBody.innerHTML = "";


    const recentUsers =
        users.slice(0, 5);


    if (recentUsers.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    No users found.
                </td>
            </tr>
        `;

        return;
    }


    recentUsers.forEach(function (user) {

        const row =
            document.createElement("tr");


        row.innerHTML = `
            <td>
                ${escapeHTML(user.name)}
            </td>

            <td>
                ${escapeHTML(user.email)}
            </td>

            <td>
                ${escapeHTML(user.role)}
            </td>

            <td>
                ${escapeHTML(user.joined)}
            </td>
        `;


        tableBody.appendChild(row);

    });

}


/* =========================================================
   RECENT ACTIVITY
========================================================= */

function displayRecentActivity() {

    const activityContainer =
        document.getElementById(
            "recentActivity"
        );


    if (!activityContainer) {

        return;
    }


    const users =
        getUsers();


    activityContainer.innerHTML = "";


    const studentCount =
        users.filter(function (user) {

            return user.role === "Student";

        }).length;


    const teacherCount =
        users.filter(function (user) {

            return user.role === "Teacher";

        }).length;


    const activities = [

        {
            icon: "👥",
            title: "Users",
            text:
                `${users.length} users are currently registered.`
        },

        {
            icon: "🎓",
            title: "Students",
            text:
                `${studentCount} student accounts are available.`
        },

        {
            icon: "👨‍🏫",
            title: "Teachers",
            text:
                `${teacherCount} teacher accounts are available.`
        },

        {
            icon: "📚",
            title: "Courses",
            text:
                `${courses.length} courses are currently available.`
        }

    ];


    activities.forEach(function (activity) {

        const item =
            document.createElement("div");


        item.className =
            "activity-item";


        item.innerHTML = `
            <span>
                ${activity.icon}
            </span>

            <div>
                <strong>
                    ${escapeHTML(activity.title)}
                </strong>

                <p>
                    ${escapeHTML(activity.text)}
                </p>
            </div>
        `;


        activityContainer.appendChild(item);

    });

}


/* =========================================================
   SECURITY HELPER
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}