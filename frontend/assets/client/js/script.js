// AOS init
AOS.init();
// End AOS init

// Section 2
// Slider
const swiperSection2 = document.querySelector(".section-2 .swiper-section2")
if (swiperSection2) {
    new Swiper(".swiper-section2", {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        breakpoints: {
            992: {
                slidesPerView: 2,
            },
            1198: {
                slidesPerView: 3,
            }
        },
    })
}
// End of Section 2


// Section 3
// Slider
const swiperSection3 = document.querySelector(".section-3 .swiper-section3")
if (swiperSection3) {
    new Swiper(".swiper-section3", {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: {
            delay: 1000,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        breakpoints: {
            576: {
                slidesPerView: 2,
            },
            992: {
                slidesPerView: 3,
            }
        },
    });
}
// End of Section 3