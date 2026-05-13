// Render layer — returns HTML strings. No DOM access. No API calls.
//
// Omissions vs. static HTML:
//   .inner-discount  — omitted (no discount field in DB)
//   .inner-old-price — omitted (no original price field in DB)
//   .inner-stock     — omitted (MaxParticipants ≠ available slots; revisit when BookedTour count is available)

/**
 * Renders a single tour card as a .product-item HTML string.
 * @param {Object} tour — raw tour object from API
 * @returns {string}
 */
function renderTourCard(tour) {
    const thumbnail = tour.TourThumbnail || 'assets/images/product-1.jpg';
    const tourCode  = String(tour.TourID).padStart(9, '0');
    const price     = formatPrice(tour.CostPerPerson);
    const date      = formatDate(tour.DepartureDate);
    const duration  = tour.Duration || '—';
    const detailUrl = `tour-detail.html?tour_id=${tour.TourID}`;

    return `
<div class="product-item">
    <div class="inner-image">
        <a href="${detailUrl}"><img src="${thumbnail}" alt="${tour.Title}"></a>
    </div>
    <div class="inner-content">
        <h3 class="inner-address">
            <a href="${detailUrl}">${tour.Title}</a>
        </h3>
        <div class="inner-price">
            <div class="inner-new-price">
                <span class="price">${price}</span><span class="unit">đ</span>
            </div>
        </div>
        <div class="inner-description">
            <div class="inner-desc-item">Mã Tour: <b>${tourCode}</b></div>
            <div class="inner-desc-item">Ngày Khởi Hành: <b>${date}</b></div>
            <div class="inner-desc-item">Thời Gian: <b>${duration}</b></div>
        </div>
        <div class="inner-rating">
            <div class="inner-rating-stars">
                <div class="inner-stars">
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                </div>
                <div class="inner-number">(5)</div>
            </div>
        </div>
    </div>
</div>`;
}

/**
 * Renders all tour cards into a DOM element, replacing its contents.
 * @param {Object[]} tours
 * @param {string}   selector — e.g. '#js-tour-list'
 */
function renderTourCards(tours, selector) {
    $(selector).html(tours.map(renderTourCard).join(''));
}
