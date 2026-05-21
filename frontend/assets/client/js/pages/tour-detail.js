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
    $('#js-tour-thumbnail')
        .attr('src', tour.TourThumbnail)
        .attr('alt', tour.Title);
}

function renderTourInfo(tour) {
    $('#js-tour-info-content').html(tour.TourDescription);
}

function renderTourDetails(tour) {
    const tourCode = String(tour.TourID).padStart(9, '0');

    $('#js-detail-thumbnail')
        .attr('src', tour.TourThumbnail)
        .attr('alt', tour.Title);
    $('#js-detail-name').text(tour.Title);
    $('#js-detail-code').text(tourCode);
    $('#js-detail-duration').text(tour.Duration);
    $('#js-detail-vehicle').text(tour.Vehicle);
    $('#js-detail-date').text(formatDate(tour.DepartureDate));
    $('#js-detail-adult-price').text(formatPrice(tour.CostPerPerson));
    $('#js-detail-departure').html(`<option value="">${tour.DeparturePlace}</option>`);

    bindQuantityTotal(tour.CostPerPerson);
}

function bindQuantityTotal(unitPrice) {
    const price = parseFloat(unitPrice);
    const $qty = $('#js-detail-adult-quantity');
    const $total = $('#js-detail-total-price');

    const updateTotal = () => {
        const qty = parseInt($qty.val());
        $total.text(`${formatPrice(price * qty)} đ`);
    };

    $qty.off('input.qty').on('input.qty', updateTotal);
    updateTotal();
}

function bindAddToCart(tour) {
    $('#js-add-to-cart').off('click.cart').on('click.cart', () => {
        const qty = parseInt($('#js-detail-adult-quantity').val());
        addToCart(tour.TourID, qty);
        window.location.href = 'cart.html';
    });
}

async function initTourDetail() {
    const params = new URLSearchParams(location.search);
    const tourId = parseInt(params.get('tour_id'));

    const result = await fetchTourDetail(tourId);
    const { tour } = result;

    renderPageTitle(tour);
    renderBreadcrumb(tour);
    renderImages(tour);
    renderTourInfo(tour);
    renderTourDetails(tour);
    bindAddToCart(tour);
}

$(function () {
    initTourDetail();
});
