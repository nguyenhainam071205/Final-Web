// Orchestrator for tour-detail.html
// Reads tour_id from URL, fetches tour data, renders all sections.

function renderPageTitle(tour) {
    $('#js-tour-title').text(tour.Title);
    document.title = tour.Title;
}

function renderBreadcrumb(tour) {
    $('#js-breadcrumb').html(`
        <li class="inner-item">
            <a href="index.html">Trang chủ</a>
            <a href="#"><i class="fa-solid fa-angles-right"></i></a>
        </li>
        <li class="inner-item">
            <a href="#">${tour.CategoryName}</a>
            <a href="#"><i class="fa-solid fa-angles-right"></i></a>
        </li>
        <li class="inner-item">
            <a href="#">${tour.Title}</a>
            <a href="#"><i class="fa-solid fa-angles-right"></i></a>
        </li>
    `);
}

function renderImages(tour) {
    const images = (tour.images && tour.images.length > 0)
        ? tour.images
        : [{ Source: tour.TourThumbnail || 'assets/images/tour-1.png' }];

    const slideHtml = images.map(img => `
        <div class="swiper-slide">
            <div class="inner-image">
                <img class="inner-image" src="${img.Source}" alt="${tour.Title}">
            </div>
        </div>`).join('');

    $('#js-main-swiper-wrapper').html(slideHtml);
    $('#js-thumb-swiper-wrapper').html(slideHtml);
}

function renderTourInfo(tour) {
    if (tour.TourDescription) {
        $('#js-tour-info-content').html(
            tour.TourDescription.split('\n').map(line => `<p>${line}</p>`).join('')
        );
    } else {
        $('#js-tour-info-content').html('<p>Chưa có thông tin mô tả cho tour này.</p>');
    }
}

function renderSchedule(tour) {
    const source = tour.TourSchedule || tour.Timeline;
    if (!source) {
        $('#js-tour-schedule-list').html(
            '<p class="tour-list-empty">Chưa có lịch trình.</p>'
        );
        return;
    }

    // Split on lines that look like day headings (e.g. "NGÀY 1", "Ngày 1", "Day 1")
    const dayPattern = /(?=(?:NGÀY|Ngày|NGÀ|ngày)\s*\d+|(?:Day|DAY)\s*\d+)/;
    const parts = source.split(dayPattern).filter(p => p.trim());

    if (parts.length <= 1) {
        const html = source
            .split('\n')
            .map(line => line.trim() ? `<p>${line}</p>` : '')
            .join('');
        $('#js-tour-schedule-list').html(
            `<div class="inner-item"><div class="inner-content">${html}</div></div>`
        );
        return;
    }

    const items = parts.map(part => {
        const lines = part.split('\n').filter(l => l.trim());
        const title = lines[0] || '';
        const body  = lines.slice(1).map(l => `<p>${l}</p>`).join('');
        return `
            <div class="inner-item">
                <div class="inner-title">${title}</div>
                <div class="inner-content">${body}</div>
            </div>`;
    }).join('');

    $('#js-tour-schedule-list').html(items);
}

function renderTourDetails(tour) {
    const tourCode = String(tour.TourID).padStart(9, '0');

    $('#js-detail-thumbnail').attr('src', tour.TourThumbnail || 'assets/images/tour-1.png')
                             .attr('alt', tour.Title);
    $('#js-detail-name').text(tour.Title);
    $('#js-detail-code').text(tourCode);
    $('#js-detail-duration').text(tour.Duration || '—');
    $('#js-detail-vehicle').text(tour.Vehicle || '—');
    $('#js-detail-date').text(formatDate(tour.DepartureDate));
    $('#js-detail-adult-price').text(formatPrice(tour.CostPerPerson));
    $('#js-detail-departure').html(
        `<option value="">${tour.DeparturePlace || '—'}</option>`
    );

    bindQuantityTotal(tour.CostPerPerson);
}

function bindQuantityTotal(unitPrice) {
    const price = parseFloat(unitPrice) || 0;
    const $qty = $('#js-detail-adult-quantity');
    const $total = $('#js-detail-total-price');

    const updateTotal = () => {
        const qty = Math.max(0, parseInt($qty.val(), 10) || 0);
        $total.text(`${formatPrice(price * qty)} đ`);
    };

    $qty.off('input.qty').on('input.qty', updateTotal);
    updateTotal();
}

function initDetailSwiper() {
    if (typeof imageThumb !== 'undefined') imageThumb.update();
    if (typeof imageMain  !== 'undefined') imageMain.update();
}

function bindAddToCart(tour) {
    $('#js-add-to-cart').off('click.cart').on('click.cart', () => {
        const qty = Math.max(1, parseInt($('#js-detail-adult-quantity').val(), 10) || 1);
        addToCart(tour.TourID, qty);
        window.location.href = 'cart.html';
    });
}

async function initTourDetail() {
    const params = new URLSearchParams(location.search);
    const tourId = parseInt(params.get('tour_id') ?? '0', 10);
    if (!tourId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const result = await fetchTourDetail(tourId);
        const { tour } = result;

        renderPageTitle(tour);
        renderBreadcrumb(tour);
        renderImages(tour);
        renderTourInfo(tour);
        renderSchedule(tour);
        renderTourDetails(tour);
        bindAddToCart(tour);
        initDetailSwiper();
    } catch (err) {
        console.error('FE-TOUR-002', err);
    }
}

$(function () {
    initTourDetail();
});
