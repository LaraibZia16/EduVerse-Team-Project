/*======================================
        START - FIREBASE IMPORTS
======================================*/

import { auth } from "./firebase-config.js";

import {
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

/*======================================
        END - FIREBASE IMPORTS
======================================*/


/*======================================
        START - FORGOT PASSWORD
======================================*/

const forgotForm = document.getElementById("forgotForm");

const emailInput = document.getElementById("email");

const emailError = document.getElementById("emailError");

const resetBtn = document.getElementById("resetBtn");

const successCard = document.getElementById("resetSuccess");

const successEmail = document.getElementById("successEmail");

const resendLink =
    document.querySelector(".resend-link a");

let lastResetEmail = "";

/*======================================
        END - FORGOT PASSWORD
======================================*/


/*======================================
        START - EMAIL VALIDATION
======================================*/

const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/*======================================
        END - EMAIL VALIDATION
======================================*/


/*======================================
        START - HELPER FUNCTIONS
======================================*/

function showError(message) {

    emailInput.classList.remove("is-valid");

    emailInput.classList.add("is-invalid");

    emailError.innerText = message;

}


function showSuccess() {

    emailInput.classList.remove("is-invalid");

    emailInput.classList.add("is-valid");

    emailError.innerText = "";

}


function resetButton() {

    resetBtn.disabled = false;

    resetBtn.innerHTML = `
        Send Reset Link
        <i class="fa-solid fa-arrow-right ms-2"></i>
    `;

}

/*======================================
        END - HELPER FUNCTIONS
======================================*/


/*======================================
        START - LIVE VALIDATION
======================================*/

emailInput.addEventListener("input", () => {

    if (
        emailPattern.test(
            emailInput.value.trim()
        )
    ) {

        showSuccess();

    } else {

        showError(
            "Please enter a valid email address."
        );

    }

});

/*======================================
        END - LIVE VALIDATION
======================================*/


/*======================================
        START - SEND RESET EMAIL
======================================*/

async function sendResetLink(email) {

    await sendPasswordResetEmail(
        auth,
        email
    );

}

/*======================================
        END - SEND RESET EMAIL
======================================*/


/*======================================
        START - FORM SUBMIT
======================================*/

forgotForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();


        const userEmail =
            emailInput.value.trim();


        /* Email Validation */

        if (
            !emailPattern.test(userEmail)
        ) {

            showError(
                "Please enter a valid email address."
            );

            return;

        }


        showSuccess();


        /* Loading */

        resetBtn.disabled = true;

        resetBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2"></span>
            Sending Reset Link...
        `;


        try {

            /* Firebase Reset Email */

            await sendResetLink(
                userEmail
            );


            lastResetEmail =
                userEmail;


            /* Hide Form */

            forgotForm.style.display =
                "none";


            /* Show Success Card */

            successCard.classList.add(
                "active"
            );


            /* Show Email */

            successEmail.innerHTML = `
                We've sent a password reset link to

                <br><br>

                <strong>${userEmail}</strong>

                <br><br>

                Please check your inbox and spam folder.
            `;


            /* Reset Form */

            forgotForm.reset();

            emailInput.classList.remove(
                "is-valid"
            );

            emailInput.classList.remove(
                "is-invalid"
            );

            emailError.innerText = "";


            /* Reset Button */

            resetButton();


        } catch (error) {

            console.error(
                "Firebase Password Reset Error:",
                error
            );


            if (
                error.code ===
                "auth/invalid-email"
            ) {

                showError(
                    "Please enter a valid email address."
                );

            } else if (
                error.code ===
                "auth/too-many-requests"
            ) {

                showError(
                    "Too many requests. Please try again later."
                );

            } else if (
                error.code ===
                "auth/network-request-failed"
            ) {

                showError(
                    "Network error. Please check your internet connection."
                );

            } else {

                showError(
                    "Unable to send reset link. Please try again."
                );

            }


            resetButton();

        }

    }
);

/*======================================
        END - FORM SUBMIT
======================================*/


/*======================================
        START - RESEND RESET LINK
======================================*/

if (resendLink) {

    resendLink.addEventListener(
        "click",
        async (e) => {

            e.preventDefault();


            if (!lastResetEmail) {
                return;
            }


            const originalText =
                resendLink.innerText;

            resendLink.innerText =
                "Sending...";

            resendLink.style.pointerEvents =
                "none";


            try {

                await sendResetLink(
                    lastResetEmail
                );


                resendLink.innerText =
                    "Link Sent ✓";


                setTimeout(() => {

                    resendLink.innerText =
                        originalText;

                    resendLink.style.pointerEvents =
                        "";

                }, 3000);


            } catch (error) {

                console.error(
                    "Firebase Resend Error:",
                    error
                );


                if (
                    error.code ===
                    "auth/too-many-requests"
                ) {

                    alert(
                        "Too many requests. Please wait before requesting another reset email."
                    );

                } else {

                    alert(
                        "Unable to resend the reset link. Please try again."
                    );

                }


                resendLink.innerText =
                    originalText;

                resendLink.style.pointerEvents =
                    "";

            }

        }
    );

}

/*======================================
        END - RESEND RESET LINK
======================================*/
/*======================================
    START - FORGOT IMAGE GSAP ANIMATION
======================================*/

const forgotImage = document.querySelector(".forgot-image");

if (forgotImage && typeof gsap !== "undefined") {

    const forgotImageTimeline = gsap.timeline();

    // Slow reveal and settle
    forgotImageTimeline.fromTo(
        forgotImage,
        {
            opacity: 0,
            y: 55,
            scale: 0.90,
            filter: "blur(10px)"
        },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 2,
            ease: "power3.out"
        }
    );

    // Gentle continuous floating
    forgotImageTimeline.to(forgotImage, {
        y: -10,
        duration: 2.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
    });

}

/*======================================
    END - FORGOT IMAGE GSAP ANIMATION
======================================*/