/*======================================
        FORGOT PASSWORD
======================================*/

const forgotForm = document.getElementById("forgotForm");

const emailInput = document.getElementById("email");

const emailError = document.getElementById("emailError");

const resetBtn = document.getElementById("resetBtn");

const successCard = document.getElementById("resetSuccess");

const successEmail = document.getElementById("successEmail");

/*======================================
        EMAIL VALIDATION
======================================*/

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/*======================================
        HELPER FUNCTIONS
======================================*/

function showError(message){

    emailInput.classList.remove("is-valid");

    emailInput.classList.add("is-invalid");

    emailError.innerText = message;

}

function showSuccess(){

    emailInput.classList.remove("is-invalid");

    emailInput.classList.add("is-valid");

    emailError.innerText = "";

}

/*======================================
        LIVE VALIDATION
======================================*/

emailInput.addEventListener("input",()=>{

    if(emailPattern.test(emailInput.value.trim())){

        showSuccess();

    }

    else{

        showError("Please enter a valid email address.");

    }

});

/*======================================
        FORM SUBMIT
======================================*/

forgotForm.addEventListener("submit",(e)=>{

    e.preventDefault();

    if(!emailPattern.test(emailInput.value.trim())){

        showError("Please enter a valid email address.");

        return;

    }

    showSuccess();

    resetBtn.disabled = true;

    resetBtn.innerHTML = `

        <span class="spinner-border spinner-border-sm me-2"></span>

        Sending Reset Link...

    `;

    const userEmail = emailInput.value.trim();

    setTimeout(()=>{

        /* Hide Form */

        forgotForm.style.display = "none";

        /* Show Success Card */

        successCard.classList.add("active");

        /* Show User Email */

        successEmail.innerHTML = `

            We've sent a password reset link to

            <br><br>

            <strong>${userEmail}</strong>

            <br><br>

            Please check your inbox and spam folder.

        `;

        /* Reset Form */

        forgotForm.reset();

        emailInput.classList.remove("is-valid");

        emailInput.classList.remove("is-invalid");

        emailError.innerText = "";

        /* Reset Button */

        resetBtn.disabled = false;

        resetBtn.innerHTML = `

            Send Reset Link

            <i class="fa-solid fa-arrow-right ms-2"></i>

        `;

    },1800);

});