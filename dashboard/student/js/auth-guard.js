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

    /* User Not Logged In */

    if (!user) {

        window.location.replace(
            "../../../login.html"
        );

        return;
    }


    try {

        /* Get Firestore User Profile */

        const userRef = doc(
            db,
            "users",
            user.uid
        );

        const userSnapshot =
            await getDoc(userRef);


        /* Profile Not Found */

        if (!userSnapshot.exists()) {

            await signOut(auth);

            window.location.replace(
                "../../../login.html"
            );

            return;
        }


        const userData =
            userSnapshot.data();


        /* Only Student Allowed */

        if (userData.role !== "student") {

            await signOut(auth);

            window.location.replace(
                "../../../login.html"
            );

            return;
        }


        console.log(
            "Student page access granted."
        );


    } catch (error) {

        console.error(
            "Student Auth Guard Error:",
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
        END - STUDENT AUTH GUARD
========================================================== */