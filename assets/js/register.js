/*======================================
        REGISTER PAGE
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

/*======================================
        PASSWORD TOGGLE
======================================*/

const togglePassword = document.getElementById("togglePassword");

const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

/*======================================
        PASSWORD RULES
======================================*/

const ruleLength = document.getElementById("ruleLength");

const ruleUpper = document.getElementById("ruleUpper");

const ruleLower = document.getElementById("ruleLower");

const ruleNumber = document.getElementById("ruleNumber");

const ruleSpecial = document.getElementById("ruleSpecial");

/*======================================
        ROLE
======================================*/

let selectedRole = "student";

roleButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        roleButtons.forEach(btn=>{

            btn.classList.remove("active");

        });

        button.classList.add("active");

        selectedRole = button.dataset.role;

    });

});

/*======================================
        PASSWORD TOGGLE
======================================*/

togglePassword.addEventListener("click",()=>{

    if(passwordInput.type==="password"){

        passwordInput.type="text";

        togglePassword.innerHTML='<i class="fa-regular fa-eye-slash"></i>';

    }

    else{

        passwordInput.type="password";

        togglePassword.innerHTML='<i class="fa-regular fa-eye"></i>';

    }

});

toggleConfirmPassword.addEventListener("click",()=>{

    if(confirmPasswordInput.type==="password"){

        confirmPasswordInput.type="text";

        toggleConfirmPassword.innerHTML='<i class="fa-regular fa-eye-slash"></i>';

    }

    else{

        confirmPasswordInput.type="password";

        toggleConfirmPassword.innerHTML='<i class="fa-regular fa-eye"></i>';

    }

});

/*======================================
        VALIDATION FUNCTIONS
======================================*/

function validEmail(email){

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

function validPhone(phone){

    return /^03[0-9]{9}$/.test(phone);

}
/*======================================
        INPUT STATE
======================================*/

function showError(input,message,errorElement){

    input.classList.remove("is-valid");

    input.classList.add("is-invalid");

    errorElement.innerText=message;

}

function showSuccess(input,errorElement){

    input.classList.remove("is-invalid");

    input.classList.add("is-valid");

    errorElement.innerText="";

}

/*======================================
        PASSWORD RULES
======================================*/

passwordInput.addEventListener("input",()=>{

    const value=passwordInput.value;

    updateRule(ruleLength,value.length>=8);

    updateRule(ruleUpper,/[A-Z]/.test(value));

    updateRule(ruleLower,/[a-z]/.test(value));

    updateRule(ruleNumber,/[0-9]/.test(value));

    updateRule(ruleSpecial,/[^A-Za-z0-9]/.test(value));

});

function updateRule(rule,valid){

    if(valid){

        rule.classList.add("valid");

        rule.querySelector("i").className="fa-solid fa-circle-check";

    }

    else{

        rule.classList.remove("valid");

        rule.querySelector("i").className="fa-solid fa-circle";

    }

}
/*======================================
        PHONE INPUT RESTRICTION
======================================*/

phoneInput.addEventListener("input",()=>{

    phoneInput.value = phoneInput.value

        .replace(/[^0-9]/g,"")

        .slice(0,11);

});
/*======================================
        LIVE VALIDATION
======================================*/

fullNameInput.addEventListener("input",()=>{

    if(fullNameInput.value.trim().length>=3){

        showSuccess(fullNameInput,nameError);

    }

});

emailInput.addEventListener("input",()=>{

    if(validEmail(emailInput.value.trim())){

        showSuccess(emailInput,emailError);

    }

});

phoneInput.addEventListener("input",()=>{

    if(validPhone(phoneInput.value.trim())){

        showSuccess(phoneInput,phoneError);

    }

});

confirmPasswordInput.addEventListener("input",()=>{

    if(confirmPasswordInput.value===passwordInput.value &&
       confirmPasswordInput.value!==""){

        showSuccess(confirmPasswordInput,confirmPasswordError);

    }

});

/*======================================
        FORM SUBMIT
======================================*/

registerForm.addEventListener("submit",(e)=>{

    e.preventDefault();

    let valid=true;

    /* Full Name */

    if(fullNameInput.value.trim().length<3){

        showError(

            fullNameInput,

            "Please enter your full name.",

            nameError

        );

        valid=false;

    }

    else{

        showSuccess(fullNameInput,nameError);

    }

    /* Email */

    if(!validEmail(emailInput.value.trim())){

        showError(

            emailInput,

            "Please enter a valid email address.",

            emailError

        );

        valid=false;

    }

    else{

        showSuccess(emailInput,emailError);

    }

    /* Phone */

    if(!validPhone(phoneInput.value.trim())){

        showError(

            phoneInput,

            "Please enter a valid phone number.",

            phoneError

        );

        valid=false;

    }

    else{

        showSuccess(phoneInput,phoneError);

    }

    /* Password */

    if(passwordInput.value.length<8){

        showError(

            passwordInput,

            "Password must contain at least 8 characters.",

            passwordError

        );

        valid=false;

    }

    else{

        showSuccess(passwordInput,passwordError);

    }

    /* Confirm Password */

    if(confirmPasswordInput.value!==passwordInput.value ||
       confirmPasswordInput.value===""){

        showError(

            confirmPasswordInput,

            "Passwords do not match.",

            confirmPasswordError

        );

        valid=false;

    }

    else{

        showSuccess(confirmPasswordInput,confirmPasswordError);

    }

    /* Terms */

    if(!termsCheckbox.checked){

        termsError.innerText="Please accept the Terms & Conditions.";

        valid=false;

    }

    else{

        termsError.innerText="";

    }

    /* Stop Here */

    if(!valid){

        return;

    }

    /*==================================
            BACKEND READY
    ==================================*/

    const userData={

        role:selectedRole,

        fullName:fullNameInput.value.trim(),

        email:emailInput.value.trim(),

        phone:phoneInput.value.trim(),

        password:passwordInput.value

    };

    console.log(userData);

    /*==================================
            LOADING
    ==================================*/

    registerBtn.disabled=true;

    registerBtn.innerHTML=`

        <span class="spinner-border spinner-border-sm me-2"></span>

        Creating Account...

    `;

    /* Demo Success */

    setTimeout(()=>{

        registerBtn.innerHTML=`

            <i class="fa-solid fa-circle-check me-2"></i>

            Registration Successful

        `;

        registerBtn.style.background="#198754";

        setTimeout(()=>{

            window.location.href="login.html";

        },1200);

    },1800);

});