/*======================================
        CONTACT FORM
======================================*/

const contactForm = document.getElementById("contactForm");

const submitBtn = document.getElementById("submitBtn");

const nameInput = document.getElementById("name");

const emailInput = document.getElementById("email");

const phoneInput = document.getElementById("phone");

const contactMethodInput = document.getElementById("contactMethod");

const subjectInput = document.getElementById("subject");

const userTypeInput = document.getElementById("userType");

const messageInput = document.getElementById("message");

/*======================================
        Error Elements
======================================*/

const nameError = document.getElementById("nameError");

const emailError = document.getElementById("emailError");

const phoneError = document.getElementById("phoneError");

const contactMethodError = document.getElementById("contactMethodError");

const subjectError = document.getElementById("subjectError");

const userTypeError = document.getElementById("userTypeError");

const messageError = document.getElementById("messageError");

/*======================================
        Validation Regex
======================================*/

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const phonePattern = /^[0-9]{10,15}$/;

/*======================================
        Helper Functions
======================================*/

function showError(input, errorElement, message){

    input.classList.add("is-invalid");

    input.classList.remove("is-valid");

    errorElement.innerText = message;

}

function showSuccess(input, errorElement){

    input.classList.remove("is-invalid");

    input.classList.add("is-valid");

    errorElement.innerText = "";

}

function resetField(input, errorElement){

    input.classList.remove("is-valid");

    input.classList.remove("is-invalid");

    errorElement.innerText = "";

}

/*======================================
        Live Validation
======================================*/

/* Name */

nameInput.addEventListener("input",()=>{

    if(nameInput.value.trim().length>=3){

        showSuccess(nameInput,nameError);

    }

    else{

        showError(

            nameInput,

            nameError,

            "Name must contain at least 3 characters."

        );

    }

});

/* Email */

emailInput.addEventListener("input",()=>{

    if(emailPattern.test(emailInput.value.trim())){

        showSuccess(emailInput,emailError);

    }

    else{

        showError(

            emailInput,

            emailError,

            "Enter a valid email address."

        );

    }

});

/* Phone */

phoneInput.addEventListener("input",()=>{

    phoneInput.value=phoneInput.value.replace(/[^0-9]/g,"");

    if(phonePattern.test(phoneInput.value)){

        showSuccess(phoneInput,phoneError);

    }

    else{

        showError(

            phoneInput,

            phoneError,

            "Enter a valid phone number."

        );

    }

});

/* Message */

messageInput.addEventListener("input",()=>{

    if(messageInput.value.trim().length>=20){

        showSuccess(messageInput,messageError);

    }

    else{

        showError(

            messageInput,

            messageError,

            "Message should be at least 20 characters."

        );

    }

});

/*======================================
        FORM SUBMIT
======================================*/

contactForm.addEventListener("submit", function (e) {

    e.preventDefault();

    let valid = true;

    /*========== Name ==========*/

    if (nameInput.value.trim().length < 3) {

        showError(
            nameInput,
            nameError,
            "Name must contain at least 3 characters."
        );

        valid = false;

    }

    /*========== Email ==========*/

    if (!emailPattern.test(emailInput.value.trim())) {

        showError(
            emailInput,
            emailError,
            "Enter a valid email address."
        );

        valid = false;

    }

    /*========== Phone ==========*/

    if (!phonePattern.test(phoneInput.value.trim())) {

        showError(
            phoneInput,
            phoneError,
            "Enter a valid phone number."
        );

        valid = false;

    }

    /*========== Preferred Contact ==========*/

    if (contactMethodInput.selectedIndex === 0) {

        showError(
            contactMethodInput,
            contactMethodError,
            "Please select a preferred contact method."
        );

        valid = false;

    } else {

        showSuccess(contactMethodInput, contactMethodError);

    }

    /*========== Subject ==========*/

    if (subjectInput.selectedIndex === 0) {

        showError(
            subjectInput,
            subjectError,
            "Please select a subject."
        );

        valid = false;

    } else {

        showSuccess(subjectInput, subjectError);

    }

    /*========== User Type ==========*/

    if (userTypeInput.selectedIndex === 0) {

        showError(
            userTypeInput,
            userTypeError,
            "Please select who you are."
        );

        valid = false;

    } else {

        showSuccess(userTypeInput, userTypeError);

    }

    /*========== Message ==========*/

    if (messageInput.value.trim().length < 20) {

        showError(
            messageInput,
            messageError,
            "Message must contain at least 20 characters."
        );

        valid = false;

    }

    if (!valid) return;

    /*======================================
            Loading Button
    ======================================*/

    submitBtn.disabled = true;

    submitBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2"></span>
        Sending...
    `;

    /*======================================
            Fake Submit
    ======================================*/

    setTimeout(function () {

        showToast();

        contactForm.reset();

        [
            nameInput,
            emailInput,
            phoneInput,
            contactMethodInput,
            subjectInput,
            userTypeInput,
            messageInput
        ].forEach(function(input){

            input.classList.remove("is-valid");

            input.classList.remove("is-invalid");

        });

        [
            nameError,
            emailError,
            phoneError,
            contactMethodError,
            subjectError,
            userTypeError,
            messageError
        ].forEach(function(error){

            error.innerText="";

        });

        submitBtn.disabled = false;

        submitBtn.innerHTML = `
            Send Message
            <i class="fa-solid fa-paper-plane ms-2"></i>
        `;

    },1800);

});

/*======================================
        SUCCESS TOAST
======================================*/

function showToast(){

    const toast=document.createElement("div");

    toast.className="contact-toast";

    toast.innerHTML=`

        <i class="fa-solid fa-circle-check"></i>

        <div>

            <strong>Message Sent!</strong>

            <p>Your message has been received successfully.</p>

        </div>

    `;

    document.body.appendChild(toast);

    setTimeout(()=>{

        toast.classList.add("show");

    },100);

    setTimeout(()=>{

        toast.classList.remove("show");

        setTimeout(()=>{

            toast.remove();

        },300);

    },3000);

}