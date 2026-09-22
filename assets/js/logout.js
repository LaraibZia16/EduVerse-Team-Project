/*======================================
        START - LOGOUT GSAP ANIMATION
======================================*/

document.addEventListener("DOMContentLoaded", () => {

    if (typeof gsap === "undefined") {
        return;
    }

    const logoutCard =
        document.querySelector(".logout-card");

    const featureCards =
        document.querySelectorAll(".logout-feature-card");


    /*==================================
            GSAP TIMELINE
    ==================================*/

    const logoutTimeline = gsap.timeline();


    /*==================================
            MAIN CARD REVEAL
    ==================================*/

    if (logoutCard) {

        logoutTimeline.fromTo(
            logoutCard,
            {
                opacity: 0,
                y: 45,
                scale: 0.96
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.2,
                ease: "power3.out"
            }
        );

    }


    /*==================================
        FEATURE CARDS STAGGER REVEAL
    ==================================*/

    if (featureCards.length > 0) {

        logoutTimeline.fromTo(
            featureCards,
            {
                opacity: 0,
                y: 30
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: 0.15,
                ease: "power2.out"
            },
            "-=0.5"
        );

    }

});

/*======================================
        END - LOGOUT GSAP ANIMATION
======================================*/


/*======================================
        FUTURE BACKEND READY
======================================*/

/*

Backend Integration:

1. Destroy User Session

2. Clear Authentication Token

3. Redirect User

Example:

fetch("/logout",{

    method:"POST"

})

.then(()=>{

    window.location.href="login.html";

});

*/