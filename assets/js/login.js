console.log("I'm login");

/*======================================
            LOGIN
======================================*/

const loginForm = document.getElementById("loginForm");

const loginBtn = document.getElementById("loginBtn");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");

const roleButtons = document.querySelectorAll(".role-btn");
let selectedRole = "student";

/*======================================
        ROLE SELECTOR
======================================*/

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
        SHOW PASSWORD
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

/*======================================
        EMAIL
======================================*/

function validEmail(email){

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

/*======================================
        LOGIN
======================================*/

loginForm.addEventListener("submit",(e)=>{

    e.preventDefault();

    let valid=true;

    emailInput.classList.remove("is-invalid");

    passwordInput.classList.remove("is-invalid");

    if(!validEmail(emailInput.value.trim())){

        emailInput.classList.add("is-invalid");

        valid=false;

    }

    if(passwordInput.value.trim().length<6){

        passwordInput.classList.add("is-invalid");

        valid=false;

    }

    if(!valid){

        return;

    }

    loginBtn.disabled=true;

    loginBtn.innerHTML=`

        <span class="spinner-border spinner-border-sm me-2"></span>

        Logging In...

    `;

    setTimeout(()=>{

        loginBtn.innerHTML=`

            <i class="fa-solid fa-circle-check me-2"></i>

            Login Successful

        `;

        loginBtn.style.background="#198754";

        showToast();

        setTimeout(()=>{

            loginBtn.disabled=false;

            loginBtn.innerHTML=`

                Login

                <i class="fa-solid fa-arrow-right ms-2"></i>

            `;

            loginBtn.style.background="";

        },2000);

    },1800);

});

/*======================================
            TOAST
======================================*/

function showToast(){

    const toast=document.createElement("div");

    toast.className="login-toast";

    toast.innerHTML=`

        <i class="fa-solid fa-circle-check"></i>

        <div>

            <strong>Welcome Back!</strong>

            <p>Login successful.</p>

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