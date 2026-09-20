/*======================================
        START - FIREBASE IMPORTS
======================================*/

import { auth, db } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

/*======================================
        END - FIREBASE IMPORTS
======================================*/


/*======================================
        START - LOGIN PAGE
======================================*/

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");
const rememberMe = document.getElementById("rememberMe");

const googleLoginBtn = document.getElementById("googleLoginBtn");

const roleButtons = document.querySelectorAll(".role-btn");

let selectedRole = "student";

/*======================================
        END - LOGIN PAGE
======================================*/


/*======================================
        START - ROLE SELECTOR
======================================*/

roleButtons.forEach((button) => {

    button.addEventListener("click", () => {

        roleButtons.forEach((btn) => {

            btn.classList.remove("active");

        });

        button.classList.add("active");

        selectedRole = button.dataset.role;

    });

});

/*======================================
        END - ROLE SELECTOR
======================================*/


/*======================================
        START - SHOW / HIDE PASSWORD
======================================*/

togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.innerHTML =
            '<i class="fa-regular fa-eye-slash"></i>';

    } else {

        passwordInput.type = "password";

        togglePassword.innerHTML =
            '<i class="fa-regular fa-eye"></i>';

    }

});

/*======================================
        END - SHOW / HIDE PASSWORD
======================================*/


/*======================================
        START - EMAIL VALIDATION
======================================*/

function validEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

/*======================================
        END - EMAIL VALIDATION
======================================*/


/*======================================
        START - ERROR MESSAGE
======================================*/

function showLoginError(message) {

    let errorBox =
        document.getElementById("loginError");

    if (!errorBox) {

        errorBox = document.createElement("div");

        errorBox.id = "loginError";

        errorBox.className =
            "alert alert-danger mt-3";

        loginBtn.insertAdjacentElement(
            "afterend",
            errorBox
        );

    }

    errorBox.textContent = message;

}


function clearLoginError() {

    const errorBox =
        document.getElementById("loginError");

    if (errorBox) {

        errorBox.remove();

    }

}

/*======================================
        END - ERROR MESSAGE
======================================*/


/*======================================
        START - DASHBOARD REDIRECT
======================================*/

function redirectByRole(role) {

    if (role === "student") {

        window.location.href =
            "dashboard/student/html/dashboard.html";

    } else if (role === "teacher") {

        window.location.href =
            "dashboard/teacher/html/dashboard.html";

    } else if (role === "admin") {

        window.location.href =
            "dashboard/admin/html/admin-dashboard.html";

    } else {

        throw new Error(
            "Invalid user role."
        );

    }

}

/*======================================
        END - DASHBOARD REDIRECT
======================================*/


/*======================================
        START - ACCOUNT STATUS HELPER
======================================*/

function normalizeAccountStatus(status) {

    const normalizedStatus =
        String(
            status || ""
        )
            .trim()
            .toLowerCase();


    /*
        Existing users may not have a
        status field yet.

        Missing status = Active.
    */

    return normalizedStatus === "suspended"
        ? "suspended"
        : "active";

}

/*======================================
        END - ACCOUNT STATUS HELPER
======================================*/


/*======================================
        START - EMAIL/PASSWORD LOGIN
======================================*/

loginForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        clearLoginError();

        let valid = true;


        emailInput.classList.remove(
            "is-invalid"
        );

        passwordInput.classList.remove(
            "is-invalid"
        );


        /*==================================
            EMAIL VALIDATION
        ==================================*/

        if (
            !validEmail(
                emailInput.value.trim()
            )
        ) {

            emailInput.classList.add(
                "is-invalid"
            );

            valid = false;

        }


        /*==================================
            PASSWORD VALIDATION
        ==================================*/

        if (
            passwordInput.value.length < 6
        ) {

            passwordInput.classList.add(
                "is-invalid"
            );

            valid = false;

        }


        if (!valid) {

            return;

        }


        /*==================================
            VALID LOGIN ROLES
        ==================================*/

        if (
            selectedRole !== "student" &&
            selectedRole !== "teacher" &&
            selectedRole !== "admin"
        ) {

            showLoginError(
                "Please select a valid role."
            );

            return;

        }


        /*==================================
            LOADING
        ==================================*/

        loginBtn.disabled = true;

        loginBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2"></span>
            Logging In...
        `;


        try {

            /*==================================
                REMEMBER ME
            ==================================*/

            const persistence =
                rememberMe.checked
                    ? browserLocalPersistence
                    : browserSessionPersistence;


            await setPersistence(
                auth,
                persistence
            );


            /*==================================
                FIREBASE AUTHENTICATION
            ==================================*/

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    emailInput.value.trim(),
                    passwordInput.value
                );


            const user =
                userCredential.user;


            /*==================================
                GET FIRESTORE PROFILE
            ==================================*/

            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const userSnapshot =
                await getDoc(
                    userRef
                );


            /*==================================
                PROFILE CHECK
            ==================================*/

            if (
                !userSnapshot.exists()
            ) {

                await signOut(auth);

                throw new Error(
                    "PROFILE_NOT_FOUND"
                );

            }


            const userData =
                userSnapshot.data();


            const actualRole =
                String(
                    userData.role || ""
                )
                    .trim()
                    .toLowerCase();


            /*==================================
                VERIFY SELECTED ROLE
            ==================================*/

            if (
                actualRole !==
                selectedRole
            ) {

                await signOut(auth);

                throw new Error(
                    "ROLE_MISMATCH"
                );

            }


            /*==================================
                ACCOUNT STATUS CHECK
            ==================================*/

            const accountStatus =
                normalizeAccountStatus(
                    userData.status
                );


            if (
                accountStatus ===
                "suspended"
            ) {

                /*
                    Authentication may have succeeded,
                    but suspended users must not keep
                    an authenticated Firebase session.
                */

                await signOut(auth);


                throw new Error(
                    "ACCOUNT_SUSPENDED"
                );

            }


            /*==================================
                SUCCESS
            ==================================*/

            loginBtn.innerHTML = `
                <i class="fa-solid fa-circle-check me-2"></i>
                Login Successful
            `;


            loginBtn.style.background =
                "#198754";


            showToast();


            setTimeout(() => {

                redirectByRole(
                    actualRole
                );

            }, 1000);


        } catch (error) {

            console.error(
                "Firebase Login Error:",
                error
            );


            /*==================================
                SUSPENDED ACCOUNT
            ==================================*/

            if (
                error.message ===
                "ACCOUNT_SUSPENDED"
            ) {

                showLoginError(
                    "Your account has been suspended. Please contact the EduVerse administrator."
                );


            /*==================================
                ROLE MISMATCH
            ==================================*/

            } else if (
                error.message ===
                "ROLE_MISMATCH"
            ) {

                showLoginError(
                    `This account is not registered as ${selectedRole}. Please select the correct role.`
                );


            /*==================================
                PROFILE NOT FOUND
            ==================================*/

            } else if (
                error.message ===
                "PROFILE_NOT_FOUND"
            ) {

                showLoginError(
                    "Your EduVerse profile was not found."
                );


            /*==================================
                INVALID CREDENTIALS
            ==================================*/

            } else if (
                error.code ===
                "auth/invalid-credential"
            ) {

                showLoginError(
                    "Incorrect email or password."
                );


            /*==================================
                TOO MANY REQUESTS
            ==================================*/

            } else if (
                error.code ===
                "auth/too-many-requests"
            ) {

                showLoginError(
                    "Too many login attempts. Please try again later."
                );


            /*==================================
                NETWORK ERROR
            ==================================*/

            } else if (
                error.code ===
                "auth/network-request-failed"
            ) {

                showLoginError(
                    "Network error. Please check your internet connection."
                );


            /*==================================
                GENERAL ERROR
            ==================================*/

            } else {

                showLoginError(
                    "Login failed. Please try again."
                );

            }


            /*==================================
                RESET LOGIN BUTTON
            ==================================*/

            loginBtn.disabled = false;

            loginBtn.innerHTML = `
                Login
                <i class="fa-solid fa-arrow-right ms-2"></i>
            `;

            loginBtn.style.background = "";

        }

    }
);

/*======================================
        END - EMAIL/PASSWORD LOGIN
======================================*/


/*======================================
        START - GOOGLE LOGIN
======================================*/

if (googleLoginBtn) {

    googleLoginBtn.addEventListener(
        "click",
        async () => {

            clearLoginError();


            /*==================================
                ADMIN GOOGLE LOGIN BLOCK
            ==================================*/

            if (
                selectedRole === "admin"
            ) {

                showLoginError(
                    "Admin must login using email and password."
                );

                return;

            }


            /*==================================
                GOOGLE BUTTON LOADING
            ==================================*/

            const originalButtonHTML =
                googleLoginBtn.innerHTML;


            googleLoginBtn.disabled =
                true;


            googleLoginBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2"></span>
                Connecting with Google...
            `;


            try {

                /*==================================
                    REMEMBER ME
                ==================================*/

                const persistence =
                    rememberMe.checked
                        ? browserLocalPersistence
                        : browserSessionPersistence;


                await setPersistence(
                    auth,
                    persistence
                );


                /*==================================
                    GOOGLE AUTHENTICATION
                ==================================*/

                const provider =
                    new GoogleAuthProvider();


                const result =
                    await signInWithPopup(
                        auth,
                        provider
                    );


                const user =
                    result.user;


                /*==================================
                    GET FIRESTORE PROFILE
                ==================================*/

                const userRef =
                    doc(
                        db,
                        "users",
                        user.uid
                    );


                const userSnapshot =
                    await getDoc(
                        userRef
                    );


                /*==================================
                    PROFILE CHECK
                ==================================*/

                if (
                    !userSnapshot.exists()
                ) {

                    await signOut(auth);


                    throw new Error(
                        "GOOGLE_PROFILE_NOT_FOUND"
                    );

                }


                const userData =
                    userSnapshot.data();


                const actualRole =
                    String(
                        userData.role || ""
                    )
                        .trim()
                        .toLowerCase();


                /*==================================
                    ALLOWED GOOGLE ROLES
                ==================================*/

                if (
                    actualRole !== "student" &&
                    actualRole !== "teacher"
                ) {

                    await signOut(auth);


                    throw new Error(
                        "GOOGLE_ROLE_NOT_ALLOWED"
                    );

                }


                /*==================================
                    VERIFY SELECTED ROLE
                ==================================*/

                if (
                    actualRole !==
                    selectedRole
                ) {

                    await signOut(auth);


                    throw new Error(
                        "GOOGLE_ROLE_MISMATCH"
                    );

                }


                /*==================================
                    ACCOUNT STATUS CHECK
                ==================================*/

                const accountStatus =
                    normalizeAccountStatus(
                        userData.status
                    );


                if (
                    accountStatus ===
                    "suspended"
                ) {

                    /*
                        Remove Firebase session before
                        showing suspension message.
                    */

                    await signOut(auth);


                    throw new Error(
                        "GOOGLE_ACCOUNT_SUSPENDED"
                    );

                }


                /*==================================
                    GOOGLE LOGIN SUCCESS
                ==================================*/

                googleLoginBtn.innerHTML = `
                    <i class="fa-solid fa-circle-check me-2"></i>
                    Login Successful
                `;


                showToast();


                setTimeout(() => {

                    redirectByRole(
                        actualRole
                    );

                }, 1000);


            } catch (error) {

                console.error(
                    "Google Login Error:",
                    error
                );


                /*==================================
                    GOOGLE ERROR HANDLING
                ==================================*/

                if (
                    error.message ===
                    "GOOGLE_ACCOUNT_SUSPENDED"
                ) {

                    showLoginError(
                        "Your account has been suspended. Please contact the EduVerse administrator."
                    );


                } else if (
                    error.message ===
                    "GOOGLE_PROFILE_NOT_FOUND"
                ) {

                    showLoginError(
                        "No EduVerse account found. Please register with Google first."
                    );


                } else if (
                    error.message ===
                    "GOOGLE_ROLE_MISMATCH"
                ) {

                    showLoginError(
                        `This Google account is not registered as ${selectedRole}. Please select the correct role.`
                    );


                } else if (
                    error.message ===
                    "GOOGLE_ROLE_NOT_ALLOWED"
                ) {

                    showLoginError(
                        "Google login is only available for students and teachers."
                    );


                } else if (
                    error.code ===
                    "auth/popup-closed-by-user"
                ) {

                    showLoginError(
                        "Google login was cancelled."
                    );


                } else if (
                    error.code ===
                    "auth/popup-blocked"
                ) {

                    showLoginError(
                        "Google popup was blocked by your browser."
                    );


                } else if (
                    error.code ===
                    "auth/network-request-failed"
                ) {

                    showLoginError(
                        "Network error. Please check your internet connection."
                    );


                } else {

                    showLoginError(
                        "Google login failed. Please try again."
                    );

                }


                /*==================================
                    RESET GOOGLE BUTTON
                ==================================*/

                googleLoginBtn.disabled =
                    false;


                googleLoginBtn.innerHTML =
                    originalButtonHTML;

            }

        }
    );

}

/*======================================
        END - GOOGLE LOGIN
======================================*/


/*======================================
        START - SUCCESS TOAST
======================================*/

function showToast() {

    const toast =
        document.createElement("div");


    toast.className =
        "login-toast";


    toast.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>

        <div>
            <strong>Welcome Back!</strong>
            <p>Login successful.</p>
        </div>
    `;


    document.body.appendChild(
        toast
    );


    setTimeout(() => {

        toast.classList.add(
            "show"
        );

    }, 100);


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );


        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);

}

/*======================================
        END - SUCCESS TOAST
======================================*/