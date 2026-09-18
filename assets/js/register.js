/*======================================
        START - FIREBASE IMPORTS
======================================*/

import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    updateProfile,
    deleteUser,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

/*======================================
        END - FIREBASE IMPORTS
======================================*/


/*======================================
        START - REGISTER PAGE
======================================*/

const registerForm = document.getElementById("registerForm");
const registerBtn = document.getElementById("registerBtn");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const termsCheckbox = document.getElementById("agreeTerms");
const termsError = document.getElementById("termsError");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const phoneError = document.getElementById("phoneError");
const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");

const roleButtons = document.querySelectorAll(".role-btn");

const googleRegisterBtn =
    document.getElementById("googleRegisterBtn");

/*======================================
        END - REGISTER PAGE
======================================*/


/*======================================
        START - PASSWORD TOGGLE
======================================*/

const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

/*======================================
        END - PASSWORD TOGGLE
======================================*/


/*======================================
        START - PASSWORD RULES
======================================*/

const ruleLength = document.getElementById("ruleLength");
const ruleUpper = document.getElementById("ruleUpper");
const ruleLower = document.getElementById("ruleLower");
const ruleNumber = document.getElementById("ruleNumber");
const ruleSpecial = document.getElementById("ruleSpecial");

/*======================================
        END - PASSWORD RULES
======================================*/


/*======================================
        START - ROLE SELECTOR
======================================*/

let selectedRole = "student";

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


toggleConfirmPassword.addEventListener("click", () => {

    if (confirmPasswordInput.type === "password") {

        confirmPasswordInput.type = "text";

        toggleConfirmPassword.innerHTML =
            '<i class="fa-regular fa-eye-slash"></i>';

    } else {

        confirmPasswordInput.type = "password";

        toggleConfirmPassword.innerHTML =
            '<i class="fa-regular fa-eye"></i>';

    }

});

/*======================================
        END - SHOW / HIDE PASSWORD
======================================*/


/*======================================
        START - VALIDATION FUNCTIONS
======================================*/

function validEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}


function validPhone(phone) {

    return /^03[0-9]{9}$/.test(phone);

}


function validPassword(password) {

    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    return (
        hasLength &&
        hasUpper &&
        hasLower &&
        hasNumber &&
        hasSpecial
    );

}

/*======================================
        END - VALIDATION FUNCTIONS
======================================*/


/*======================================
        START - INPUT STATE
======================================*/

function showError(input, message, errorElement) {

    input.classList.remove("is-valid");
    input.classList.add("is-invalid");

    errorElement.innerText = message;

}


function showSuccess(input, errorElement) {

    input.classList.remove("is-invalid");
    input.classList.add("is-valid");

    errorElement.innerText = "";

}

/*======================================
        END - INPUT STATE
======================================*/


/*======================================
        START - PASSWORD RULE DISPLAY
======================================*/

passwordInput.addEventListener("input", () => {

    const value = passwordInput.value;

    updateRule(ruleLength, value.length >= 8);
    updateRule(ruleUpper, /[A-Z]/.test(value));
    updateRule(ruleLower, /[a-z]/.test(value));
    updateRule(ruleNumber, /[0-9]/.test(value));
    updateRule(ruleSpecial, /[^A-Za-z0-9]/.test(value));

});


function updateRule(rule, valid) {

    if (valid) {

        rule.classList.add("valid");

        rule.querySelector("i").className =
            "fa-solid fa-circle-check";

    } else {

        rule.classList.remove("valid");

        rule.querySelector("i").className =
            "fa-solid fa-circle";

    }

}

/*======================================
        END - PASSWORD RULE DISPLAY
======================================*/


/*======================================
        START - PHONE RESTRICTION
======================================*/

phoneInput.addEventListener("input", () => {

    phoneInput.value = phoneInput.value
        .replace(/[^0-9]/g, "")
        .slice(0, 11);

});

/*======================================
        END - PHONE RESTRICTION
======================================*/


/*======================================
        START - LIVE VALIDATION
======================================*/

fullNameInput.addEventListener("input", () => {

    if (fullNameInput.value.trim().length >= 3) {

        showSuccess(fullNameInput, nameError);

    }

});


emailInput.addEventListener("input", () => {

    if (validEmail(emailInput.value.trim())) {

        showSuccess(emailInput, emailError);

    }

});


phoneInput.addEventListener("input", () => {

    if (validPhone(phoneInput.value.trim())) {

        showSuccess(phoneInput, phoneError);

    }

});


confirmPasswordInput.addEventListener("input", () => {

    if (
        confirmPasswordInput.value === passwordInput.value &&
        confirmPasswordInput.value !== ""
    ) {

        showSuccess(
            confirmPasswordInput,
            confirmPasswordError
        );

    }

});

/*======================================
        END - LIVE VALIDATION
======================================*/


/*======================================
        START - FIREBASE ERROR MESSAGE
======================================*/

function getFirebaseErrorMessage(errorCode) {

    switch (errorCode) {

        case "auth/email-already-in-use":
            return "This email is already registered.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/weak-password":
            return "Please choose a stronger password.";

        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        default:
            return "Registration failed. Please try again.";

    }

}

/*======================================
        END - FIREBASE ERROR MESSAGE
======================================*/


/*======================================
        START - EMAIL REGISTRATION
======================================*/

registerForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    let valid = true;


    /* Full Name */

    if (fullNameInput.value.trim().length < 3) {

        showError(
            fullNameInput,
            "Please enter your full name.",
            nameError
        );

        valid = false;

    } else {

        showSuccess(fullNameInput, nameError);

    }


    /* Email */

    if (!validEmail(emailInput.value.trim())) {

        showError(
            emailInput,
            "Please enter a valid email address.",
            emailError
        );

        valid = false;

    } else {

        showSuccess(emailInput, emailError);

    }


    /* Phone */

    if (!validPhone(phoneInput.value.trim())) {

        showError(
            phoneInput,
            "Please enter a valid phone number.",
            phoneError
        );

        valid = false;

    } else {

        showSuccess(phoneInput, phoneError);

    }


    /* Password */

    if (!validPassword(passwordInput.value)) {

        showError(
            passwordInput,
            "Password must meet all password requirements.",
            passwordError
        );

        valid = false;

    } else {

        showSuccess(passwordInput, passwordError);

    }


    /* Confirm Password */

    if (
        confirmPasswordInput.value !== passwordInput.value ||
        confirmPasswordInput.value === ""
    ) {

        showError(
            confirmPasswordInput,
            "Passwords do not match.",
            confirmPasswordError
        );

        valid = false;

    } else {

        showSuccess(
            confirmPasswordInput,
            confirmPasswordError
        );

    }


    /* Terms */

    if (!termsCheckbox.checked) {

        termsError.innerText =
            "Please accept the Terms & Conditions.";

        valid = false;

    } else {

        termsError.innerText = "";

    }


    if (!valid) {
        return;
    }


    /* Public roles only */

    if (
        selectedRole !== "student" &&
        selectedRole !== "teacher"
    ) {

        alert("Invalid account role.");
        return;

    }


    registerBtn.disabled = true;

    registerBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2"></span>
        Creating Account...
    `;


    try {

        /* Create Firebase Authentication account */

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                emailInput.value.trim(),
                passwordInput.value
            );

        const user = userCredential.user;


        /* Add display name */

        await updateProfile(user, {

            displayName: fullNameInput.value.trim()

        });


        /* Save Firestore profile */

        try {

            await setDoc(
                doc(db, "users", user.uid),
                {
                    uid: user.uid,
                    fullName: fullNameInput.value.trim(),
                    email: emailInput.value.trim(),
                    phone: phoneInput.value.trim(),
                    role: selectedRole,
                    provider: "password",
                    createdAt: serverTimestamp()
                }
            );

        } catch (firestoreError) {

            /*
                Roll back Authentication account if
                Firestore profile creation fails.
            */

            try {

                await deleteUser(user);

            } catch (deleteError) {

                console.error(
                    "Could not rollback Auth user:",
                    deleteError
                );

            }

            throw firestoreError;

        }


        /* Success */

        registerBtn.innerHTML = `
            <i class="fa-solid fa-circle-check me-2"></i>
            Registration Successful
        `;

        registerBtn.style.background = "#198754";


        setTimeout(() => {

            window.location.href = "login.html";

        }, 1200);


    } catch (error) {

        console.error(
            "Firebase Registration Error:",
            error
        );


        const message =
            getFirebaseErrorMessage(error.code);


        if (
            error.code === "auth/email-already-in-use" ||
            error.code === "auth/invalid-email"
        ) {

            showError(
                emailInput,
                message,
                emailError
            );

        } else {

            passwordError.innerText = message;

        }


        registerBtn.disabled = false;

        registerBtn.innerHTML = `
            Register Now
            <i class="fa-solid fa-arrow-right"></i>
        `;

        registerBtn.style.background = "";

    }

});

/*======================================
        END - EMAIL REGISTRATION
======================================*/


/*======================================
        START - GOOGLE REGISTRATION
======================================*/

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});


googleRegisterBtn.addEventListener("click", async () => {

    /*
        User selects Student or Teacher using
        the same role buttons at the top.
    */

    if (
        selectedRole !== "student" &&
        selectedRole !== "teacher"
    ) {

        alert("Please select Student or Teacher.");
        return;

    }


    googleRegisterBtn.disabled = true;

    googleRegisterBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2"></span>
        Connecting with Google...
    `;


    try {

        /* Open Google account popup */

        const result = await signInWithPopup(
            auth,
            googleProvider
        );

        const user = result.user;


        /* Check whether profile already exists */

        const userRef = doc(
            db,
            "users",
            user.uid
        );

        const userSnapshot =
            await getDoc(userRef);


        if (!userSnapshot.exists()) {

            /*
                New Google user:
                create profile with currently selected role.
            */

            await setDoc(
                userRef,
                {
                    uid: user.uid,
                    fullName:
                        user.displayName || "EduVerse User",
                    email:
                        user.email || "",
                    phone: "",
                    role: selectedRole,
                    provider: "google",
                    createdAt: serverTimestamp()
                }
            );

        }

        /*
            Existing Google user:
            do NOT overwrite the existing Firestore profile
            or role.
        */


        googleRegisterBtn.innerHTML = `
            <i class="fa-solid fa-circle-check me-2"></i>
            Registration Successful
        `;


        setTimeout(() => {

            window.location.href = "login.html";

        }, 1200);


    } catch (error) {

        console.error(
            "Google Registration Error:",
            error
        );


        if (
            error.code === "auth/popup-closed-by-user"
        ) {

            alert(
                "Google sign-in was cancelled."
            );

        } else if (
            error.code === "auth/popup-blocked"
        ) {

            alert(
                "Google popup was blocked. Please allow popups and try again."
            );

        } else if (
            error.code === "auth/network-request-failed"
        ) {

            alert(
                "Network error. Please check your internet connection."
            );

        } else {

            alert(
                "Google registration failed. Please try again."
            );

        }


        googleRegisterBtn.disabled = false;

        googleRegisterBtn.innerHTML = `
            <i class="fa-brands fa-google"></i>
            Continue with Google
        `;

    }

});

/*======================================
        END - GOOGLE REGISTRATION
======================================*/