/*======================================
        NAVBAR JAVASCRIPT START
======================================*/

const navbar = document.querySelector(".custom-navbar");
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const mobileOverlay = document.getElementById("mobileOverlay");
const closeMenu = document.getElementById("closeMenu");
const mobileLinks = document.querySelectorAll(".mobile-nav a");

/*======================================
        OPEN MENU
======================================*/

function openMenu() {

    mobileMenu.classList.add("active");
    mobileOverlay.classList.add("active");

    document.body.style.overflow = "hidden";

    menuToggle.setAttribute("aria-expanded", "true");

}

/*======================================
        CLOSE MENU
======================================*/

function closeMobileMenu() {

    mobileMenu.classList.remove("active");
    mobileOverlay.classList.remove("active");

    document.body.style.overflow = "";

    menuToggle.setAttribute("aria-expanded", "false");

}

/*======================================
        TOGGLE MENU
======================================*/

menuToggle.addEventListener("click", () => {

    if (mobileMenu.classList.contains("active")) {
        closeMobileMenu();
    } else {
        openMenu();
    }

});

/*======================================
        CLOSE BUTTON
======================================*/

closeMenu.addEventListener("click", closeMobileMenu);

/*======================================
        OVERLAY CLICK
======================================*/

mobileOverlay.addEventListener("click", closeMobileMenu);

/*======================================
        CLOSE AFTER LINK CLICK
======================================*/

mobileLinks.forEach(link => {

    link.addEventListener("click", closeMobileMenu);

});

/*======================================
        ESC KEY
======================================*/

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape" && mobileMenu.classList.contains("active")) {

        closeMobileMenu();

    }

});

/*======================================
        NAVBAR SCROLL
======================================*/

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        navbar.classList.add("scrolled");

    } else {

        navbar.classList.remove("scrolled");

    }

});

/*======================================
        ACTIVE DESKTOP LINK
======================================*/

const currentPage = window.location.pathname.split("/").pop() || "index.html";

document.querySelectorAll(".nav-link").forEach(link => {

    if (link.getAttribute("href") === currentPage) {

        link.classList.add("active");

    } else {

        link.classList.remove("active");

    }

});

/*======================================
        ACTIVE MOBILE LINK
======================================*/

document.querySelectorAll(".mobile-nav a").forEach(link => {

    if (link.getAttribute("href") === currentPage) {

        link.classList.add("active");

    } else {

        link.classList.remove("active");

    }

});
/*======================================
        NAVBAR JAVASCRIPT END
======================================*/

/*======================================
      TESTIMONIAL CAROUSEL
======================================*/

const slider = document.querySelector(".testimonial-wrapper");
const track = document.querySelector(".testimonial-track");
const cards = document.querySelectorAll(".testimonial-card");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");

if (slider && track && cards.length) {

    let currentIndex = 0;
    let autoSlide;

    function getVisibleCards() {

        if (window.innerWidth < 768) return 1;

        if (window.innerWidth < 992) return 2;

        return 3;

    }

    function moveSlider() {

        const visible = getVisibleCards();

        const gap = 30;

        const cardWidth = (slider.clientWidth - (gap * (visible - 1))) / visible;

        const move = (cardWidth + gap) * currentIndex;

        track.style.transform = `translateX(-${move}px)`;

    }

    function maxIndex() {

        return cards.length - getVisibleCards();

    }

    function nextSlide() {

        currentIndex++;

        if (currentIndex > maxIndex()) {

            currentIndex = 0;

        }

        moveSlider();

    }

    function prevSlide() {

        currentIndex--;

        if (currentIndex < 0) {

            currentIndex = maxIndex();

        }

        moveSlider();

    }

    function startAuto() {

        stopAuto();

        autoSlide = setInterval(nextSlide, 3000);

    }

    function stopAuto() {

        clearInterval(autoSlide);

    }

    nextBtn.addEventListener("click", () => {

        nextSlide();

        startAuto();

    });

    prevBtn.addEventListener("click", () => {

        prevSlide();

        startAuto();

    });

    slider.addEventListener("mouseenter", stopAuto);

    slider.addEventListener("mouseleave", startAuto);

    window.addEventListener("resize", () => {

        currentIndex = 0;

        moveSlider();

    });

    moveSlider();

    startAuto();

}