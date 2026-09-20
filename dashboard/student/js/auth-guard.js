/* ==========================================================
        START - HIDE PAGE UNTIL AUTH CHECK
========================================================== */

document.documentElement.style.visibility = "hidden";

/* ==========================================================
        END - HIDE PAGE UNTIL AUTH CHECK
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
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

/* ==========================================================
        END - FIREBASE IMPORTS
========================================================== */


/* ==========================================================
        START - STUDENT AUTH GUARD
========================================================== */

onAuthStateChanged(auth, async (user) => {

    /* ------------------------------------------------------
       User Not Logged In
    ------------------------------------------------------ */

    if (!user) {

        window.location.replace(
            "../../../login.html"
        );

        return;
    }


    try {

        /* --------------------------------------------------
           Get Firestore User Profile
        -------------------------------------------------- */

        const userRef = doc(
            db,
            "users",
            user.uid
        );


        const userSnapshot =
            await getDoc(userRef);


        /* --------------------------------------------------
           Profile Not Found
        -------------------------------------------------- */

        if (!userSnapshot.exists()) {

            await denyAccess();

            return;
        }


        const userData =
            userSnapshot.data();


        /* --------------------------------------------------
           Only Student Allowed
        -------------------------------------------------- */

        if (
            normalizeRole(userData.role) !==
            "student"
        ) {

            await denyAccess();

            return;
        }


        /* --------------------------------------------------
           Suspended Student Not Allowed

           Old users may not have a status field.
           Missing status is treated as Active.
        -------------------------------------------------- */

        if (
            normalizeStatus(userData.status) ===
            "suspended"
        ) {

            console.warn(
                "Student account is suspended."
            );


            await denyAccess(
                "suspended"
            );

            return;
        }


        /* --------------------------------------------------
           Student Verified - Show Page
        -------------------------------------------------- */

        console.log(
            "Student page access granted."
        );


        document.documentElement.style.visibility =
            "visible";


    } catch (error) {

        console.error(
            "Student Auth Guard Error:",
            error
        );


        await denyAccess();

    }

});

/* ==========================================================
        END - STUDENT AUTH GUARD
========================================================== */


/* ==========================================================
        START - ACCESS DENIED
========================================================== */

async function denyAccess(reason = "") {

    try {

        await signOut(auth);

    } catch (signOutError) {

        console.error(
            "Sign Out Error:",
            signOutError
        );

    }


    /*
       Suspended reason is passed to login page.

       Later we can use this to show a proper
       "Account Suspended" message.
    */

    if (reason === "suspended") {

        window.location.replace(
            "../../../login.html?reason=suspended"
        );

        return;
    }


    window.location.replace(
        "../../../login.html"
    );

}

/* ==========================================================
        END - ACCESS DENIED
========================================================== */


/* ==========================================================
        START - HELPERS
========================================================== */

function normalizeRole(role) {

    return String(
        role || ""
    )
        .trim()
        .toLowerCase();

}


function normalizeStatus(status) {

    const normalizedStatus =
        String(
            status || ""
        )
            .trim()
            .toLowerCase();


    /*
       Only an explicit "suspended"
       value blocks access.

       Missing status = Active.
    */

    return normalizedStatus === "suspended"
        ? "suspended"
        : "active";

}

/* ==========================================================
        END - HELPERS
========================================================== */