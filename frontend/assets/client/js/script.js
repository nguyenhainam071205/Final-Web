// AOS init
AOS.init();
// End AOS init

// Header
    // Mobile Menu
        // Click để ẩn/hiện Menu
        const buttonMenuMobile = document.querySelector(".header .inner-menu-bars")
        if(buttonMenuMobile) {
            const menu = document.querySelector(".header .inner-menu")
            // Click vào icon menu thì mở ra menu
            buttonMenuMobile.addEventListener("click", () => {
                menu.classList.add("active")
            })

            // Click vào overlay để đóng menu
            const overlay = document.querySelector(".header .inner-overlay")
            if(overlay) {
                overlay.addEventListener("click", () => {
                    menu.classList.remove("active")
                })
            }

            // CLick vào icon dropdown để mở sub menu
            const dropdownIcon = menu.querySelectorAll("ul > li > i")
            dropdownIcon.forEach((button) => {
                button.addEventListener("click", () => {
                    button.parentNode.classList.toggle("active")
                })
            })
        }
    // End of Mobile Menu
// End of Header


// Footer
    //Validate Email-form
    const emailForm = document.querySelector("#email-form");
    if(emailForm) {
        const validator = new JustValidate('#email-form');
        validator
            .addField('#email-input', [
                {
                    rule: 'required',
                    errorMessage: 'Vui lòng nhập email của bạn!'
                },
                {
                    rule: 'email',
                    errorMessage: 'Email đinh dạng không phù hợp!'
                }
            ])
            .onSuccess((event)=> {
                const email = event.target.email.value;
                console.log(email);
            })
    }
// End of Footer


// Section 1
    // Box Address Section 1
    const boxAddressSection1 = document.querySelector(".section-1 .inner-form .inner-box.inner-address")
    if(boxAddressSection1) {
        // Ẩn/Hiện box suggest
        const input = boxAddressSection1.querySelector(".inner-input")
        input.addEventListener("focus", () => {
            boxAddressSection1.classList.add("active")
        })
        input.addEventListener("blur", () => {
            boxAddressSection1.classList.remove("active")
        })

        // Copy giá trị lên thanh input
        const listItem = boxAddressSection1.querySelectorAll(".inner-suggest-list .inner-suggest-item")
        listItem.forEach((item) => {
            item.addEventListener("mousedown", () => {
                const title = item.querySelector(".inner-item-content .inner-item-title").innerHTML
                input.value = title
            })
        })
    }

    // Box Quantity Section 1
    const boxQuantitySection1 = document.querySelector(".section-1 .inner-form .inner-box.inner-number")
    if(boxQuantitySection1) {
        // Hiển thị box quantity
        const input = boxQuantitySection1.querySelector(".inner-input")
        input.addEventListener("focus", () => {
            boxQuantitySection1.classList.add("active")
        })

        // Ẩn box quantity
        document.addEventListener("click", (event) => {
            if(!boxQuantitySection1.contains(event.target)) {
                boxQuantitySection1.classList.remove("active")
            }
        })

        // Hiện số lượng trong ô input
        const updateQuantityInput = () => {
            const listBoxNumber = boxQuantitySection1.querySelectorAll(".inner-box.inner-number .inner-quantity .inner-people-number")
            const listArr = []
            listBoxNumber.forEach((item) => {
                const value = parseInt(item.innerHTML)
                listArr.push(value)
            })
            const value = `NL: ${listArr[0]}, TE: ${listArr[1]}, EB: ${listArr[2]}`
            input.value = value
        }


        // Tăng số lượng người đăng ký
        const listPlusButton = boxQuantitySection1.querySelectorAll(".inner-count .inner-plus")
        listPlusButton.forEach((button) => {
            button.addEventListener("click", () => {
                const parent = button.parentNode
                const boxNumber = parent.querySelector(".inner-people-number")
                const number = parseInt(boxNumber.innerHTML)
                const numberUpdate = number + 1
                boxNumber.innerHTML = numberUpdate
                updateQuantityInput()
            })
        })

        // Giảm số lượng người đăng ký
        const listMinusButton = boxQuantitySection1.querySelectorAll(".inner-count .inner-minus")
        listMinusButton.forEach((button) => {
            button.addEventListener("click", () => {
                const parent = button.parentNode
                const boxNumber = parent.querySelector(".inner-people-number")
                const number = parseInt(boxNumber.innerHTML)
                if(number > 0) {
                    const numberUpdate = number - 1
                    boxNumber.innerHTML = numberUpdate
                }
                updateQuantityInput()
            })
        })
    }
// End of Section 1


// Section 2
    // Clock expire
    const clockExpire = document.querySelector("[clock-expire]")
    if(clockExpire) {
        const expiringDateTimeString = clockExpire.getAttribute("clock-expire")

        // Chuyển đổi chuỗi thời gian thành đối tượng object thời gian
        const expiringDateTime = new Date(expiringDateTimeString)

        // Hàm cập nhật đồng đồ
        const updateClock = () => {
            const now = new Date()
            let remainingDateTime = expiringDateTime - now
            if(remainingDateTime > 0) {
                const days = Math.floor(remainingDateTime / (24 * 60 * 60 * 1000))
                const hours = Math.floor(remainingDateTime / (60 * 60 * 1000) % 24)
                const minutes = Math.floor(remainingDateTime / (60 * 1000) % 60)
                const seconds = Math.floor(remainingDateTime / (1000) % 60)

                const listItemNumber = clockExpire.querySelectorAll(".inner-number")
                listItemNumber[0].innerHTML = `${days}`.padStart(2, "0")
                listItemNumber[1].innerHTML = `${hours}`.padStart(2, "0")
                listItemNumber[2].innerHTML = `${minutes}`.padStart(2, "0")
                listItemNumber[3].innerHTML = `${seconds}`.padStart(2, "0");
            }
            else{
                clearInterval(intervalCLock)
            }
        }

        // Gọi hàm cập nhật đồng hồ
        const intervalCLock = setInterval(updateClock, 1000)
    }

    // Slider
    const swiperSection2 = document.querySelector(".section-2 .swiper-section2")
    if(swiperSection2) {
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
        if(swiperSection3) {
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


// Section 9
    // Box filter
        // Click để ẩn/hiện box filter
        const buttonFilterMobile = document.querySelector(".section-9 .inner-right .inner-filter")
        if(buttonFilterMobile) {
            const boxFilter = document.querySelector(".section-9 .inner-left")
            buttonFilterMobile.addEventListener("click", () => {
                boxFilter.classList.add("active")
            })

            const overlay = document.querySelector(".section-9 .inner-overlay")
            overlay.addEventListener("click", () => {
                boxFilter.classList.remove("active")
            })
        }
    // End Box filter
// End of Section 9


// Section 10
    // Tour images
        // Slider
        const boxImageSection10 = document.querySelector(".section-10 .box-image")
        if(boxImageSection10) {
            var imageThumb = new Swiper(".swiper-thumb-images", {
                spaceBetween: 5,
                slidesPerView: 4,
                observer: true,
                observeParents: true,
                breakpoints: {
                    576: {
                        spaceBetween: 10,
                    },
                },
            });
            var imageMain = new Swiper(".swiper-main-image", {
                spaceBetween: 10,
                observer: true,
                observeParents: true,
                thumbs: {
                    swiper: imageThumb,
                },
            })
        }

        // Zoom ảnh
        const boxImageMain = document.querySelector(".section-10 .inner-main-image")
        if(boxImageMain) {
            new Viewer(boxImageMain)
        }
    // End of Tour images

    // Tour info
        const boxTourInfo = document.querySelector(".box-tour-info")
        if(boxTourInfo) {
            // Chức năng xem tất cả/ẩn bớt
            const buttonReadMore = boxTourInfo.querySelector((".inner-read-more button"))
            buttonReadMore.addEventListener("click", () => {
                if(boxTourInfo.classList.contains("active")) {
                    boxTourInfo.classList.remove("active")
                    buttonReadMore.textContent = "Xem tất cả"
                }
                else{
                    boxTourInfo.classList.add("active")
                    buttonReadMore.textContent = "Ẩn bớt"
                }
            })

            // Zoom ảnh
            new Viewer(boxTourInfo)
        }

    // End of Tour info

    // Tour schedule
        // Zoom ảnh
        const tourScheduleImage = document.querySelector(".section-10 .box-tour-schedule")
        if(tourScheduleImage) {
            new Viewer(tourScheduleImage)
        }
    // End of Tour schedule
// End of Section 10


// Section 11
    // Validate Coupon-form
    const couponForm = document.querySelector(".section-11 .inner-discount-code")
    if(couponForm) {
        const validator = new JustValidate('#coupon-form')
        validator
            .addField('#coupon-input', [
                {
                    rule: 'required',
                    errorMessage: 'Bạn chưa nhập coupon!',
                }
            ])
            .onSuccess((event)  => {
                const coupon = event.target.coupon.value
                console.log(coupon)
            })
    }

    // Validate Guest-Information Form
    const orderForm = document.querySelector(".section-12 #order-form")
    if(orderForm) {
        const validator = new JustValidate('#order-form')
        validator
            .addField('#full-name-input', [
                {
                    rule: 'required',
                    errorMessage: 'Bạn chưa nhập họ tên !',
                },
                {
                    rule: 'minLength',
                    value: 5,
                    errorMessage: 'Họ tên phải chứa ít nhất 5 ký tự',
                },
                {
                    rule: 'maxLength',
                    value: 50,
                    errorMessage: 'Họ tên không được chứa hơn 50 ký tự',
                },
            ])
            .addField('#phone-input', [
                {
                    rule: 'required',
                    errorMessage: 'Bạn chưa nhập số điện thoại !',
                },
                {
                    rule:  'customRegexp',
                    value: /(84|0[3|5|7|8|9])+([0-9]){8}\b/g,
                    errorMessage: 'Số điện thoại không hợp lệ !',
                },
            ])
            .onSuccess((event)  => {
                const fullName = event.target.fullName.value
                const phoneNumber = event.target.phone.value
                const note = event.target.note.value
                const method = event.target.method.value
                console.log(fullName)
                console.log(phoneNumber)
                console.log(note)
                console.log(method)
            })

        // Phương thức thanh toán
        const listInputMethod = orderForm.querySelectorAll(`input[name="method"]`)
        const elementBankInfo = orderForm.querySelector(".section-12 .payment-info")

        listInputMethod.forEach((inputMethod) => {
            inputMethod.addEventListener("change", () => {
                if(inputMethod.value == 'bank') {
                    elementBankInfo.classList.add('active')
                }
                else {
                    elementBankInfo.classList.remove('active')
                }
            })
        })
    }
// End of Section 11





