/*======================================
    OUR STORY GSAP ANIMATION START
======================================*/

const storyImage = document.querySelector(".about-story-image img");

if (storyImage && typeof gsap !== "undefined") {

    gsap.fromTo(
        storyImage,
        {
            opacity: 0,
            y: 50,
            scale: 0.92,
            filter: "blur(8px)"
        },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.8,
            ease: "power3.out"
        }
    );

}

/*======================================
    OUR STORY GSAP ANIMATION END
======================================*/