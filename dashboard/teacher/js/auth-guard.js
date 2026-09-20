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
        START - TEACHER AUTH GUARD
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
           Only Teacher Allowed
        -------------------------------------------------- */

        if (
            normalizeRole(userData.role) !==
            "teacher"
        ) {

            await denyAccess();

            return;
        }


        /* --------------------------------------------------
           Suspended Teacher Not Allowed

           Missing status = Active.
        -------------------------------------------------- */

        if (
            normalizeStatus(userData.status) ===
            "suspended"
        ) {

            console.warn(
                "Teacher account is suspended."
            );


            await denyAccess(
                "suspended"
            );

            return;
        }


        /* --------------------------------------------------
           Teacher Verified - Show Page
        -------------------------------------------------- */

        console.log(
            "Teacher page access granted."
        );


        document.documentElement.style.visibility =
            "visible";


    } catch (error) {

        console.error(
            "Teacher Auth Guard Error:",
            error
        );


        await denyAccess();

    }

});

/* ==========================================================
        END - TEACHER AUTH GUARD
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


    return normalizedStatus === "suspended"
        ? "suspended"
        : "active";

}

/* ==========================================================
        END - HELPERS
========================================================== */