/*======================================
            LOGOUT PAGE
======================================*/

document.addEventListener("DOMContentLoaded",()=>{

    /*==================================
            CARD ANIMATION
    ==================================*/

    const logoutCard=document.querySelector(".logout-card");

    logoutCard.style.opacity="0";

    logoutCard.style.transform="translateY(40px)";

    setTimeout(()=>{

        logoutCard.style.transition=".8s ease";

        logoutCard.style.opacity="1";

        logoutCard.style.transform="translateY(0)";

    },200);

    /*==================================
        FEATURE CARD ANIMATION
    ==================================*/

    const featureCards=document.querySelectorAll(".logout-feature-card");

    featureCards.forEach((card,index)=>{

        card.style.opacity="0";

        card.style.transform="translateY(30px)";

        setTimeout(()=>{

            card.style.transition=".6s ease";

            card.style.opacity="1";

            card.style.transform="translateY(0)";

        },500+(index*150));

    });

});

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