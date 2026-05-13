// Orchestrator for cart.html — reads cart from localStorage, fetches each
// tour, renders rows, computes totals, binds qty/remove handlers.

function renderCartItem(tour, quantity) {
    const tourCode = String(tour.TourID).padStart(9, '0');
    const thumb    = tour.TourThumbnail || 'assets/images/cart.png';
    const price    = parseFloat(tour.CostPerPerson) || 0;

    return `
        <div class="inner-item" data-tour-id="${tour.TourID}">
            <div class="inner-action">
                <i class="fa-solid fa-x js-cart-remove" data-tour-id="${tour.TourID}"></i>
                <input type="checkbox" class="js-cart-check" data-tour-id="${tour.TourID}" checked>
            </div>
            <div class="inner-tour-info">
                <div class="inner-image">
                    <img src="${thumb}" alt="${tour.Title}">
                </div>
                <div class="inner-desc">
                    <div class="inner-title">
                        <a href="tour-detail.html?tour_id=${tour.TourID}">${tour.Title}</a>
                    </div>
                    <div class="inner-meta">
                        <span>Mã Tour: <b>${tourCode}</b></span>
                        <span>Ngày Khởi Hành: <b>${formatDate(tour.DepartureDate)}</b></span>
                        <span>Khởi Hành Tại: <b>${tour.DeparturePlace || '—'}</b></span>
                    </div>
                </div>
            </div>
            <div class="inner-quantity">
                <div class="inner-title">Số Lượng Hành Khách</div>
                <div class="inner-list">
                    <div class="inner-item">
                        <label class="inner-label">Người lớn:</label>
                        <input type="number" class="inner-input js-cart-qty"
                               data-tour-id="${tour.TourID}"
                               value="${quantity}" min="1">
                        <div class="inner-number">
                            <span>${quantity}</span>
                            <span>x</span>
                            <span class="inner-highlight">${formatPrice(price)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}

function renderEmptyCart() {
    $('#js-cart-list').html(
        '<p class="cart-empty">Giỏ hàng đang trống. <a href="index.html">Tiếp tục mua sắm</a>.</p>'
    );
    $('#js-cart-subtotal').text('0 đ');
    $('#js-cart-discount').text('0 đ');
    $('#js-cart-total').text('0 đ');
}

function isItemChecked(tourId) {
    return $(`.js-cart-check[data-tour-id="${tourId}"]`).is(':checked');
}

function computeTotals(rows) {
    const subtotal = rows.reduce((sum, { tour, quantity }) => {
        if (!isItemChecked(tour.TourID)) return sum;
        return sum + (parseFloat(tour.CostPerPerson) || 0) * quantity;
    }, 0);
    const discount = 0;
    const total    = subtotal - discount;

    $('#js-cart-subtotal').text(`${formatPrice(subtotal)} đ`);
    $('#js-cart-discount').text(`${formatPrice(discount)} đ`);
    $('#js-cart-total').text(`${formatPrice(total)} đ`);
}

function bindCartEvents(rowsRef) {
    $('#js-cart-list').off('input.cart').on('input.cart', '.js-cart-qty', function () {
        const tourId = parseInt($(this).data('tour-id'), 10);
        const qty    = Math.max(1, parseInt($(this).val(), 10) || 1);
        $(this).val(qty);
        updateCartQuantity(tourId, qty);

        const row = rowsRef.find(r => r.tour.TourID === tourId);
        if (row) row.quantity = qty;

        const $item = $(this).closest('.inner-item[data-tour-id]');
        $item.find('.inner-number span:first-child').text(qty);
        computeTotals(rowsRef);
    });

    $('#js-cart-list').off('change.cart').on('change.cart', '.js-cart-check', function () {
        computeTotals(rowsRef);
    });

    $('#js-cart-list').off('click.cart').on('click.cart', '.js-cart-remove', function () {
        const tourId = parseInt($(this).data('tour-id'), 10);
        removeFromCart(tourId);
        const idx = rowsRef.findIndex(r => r.tour.TourID === tourId);
        if (idx >= 0) rowsRef.splice(idx, 1);

        if (rowsRef.length === 0) {
            renderEmptyCart();
        } else {
            $(this).closest('.inner-item[data-tour-id]').remove();
            computeTotals(rowsRef);
        }
    });
}

async function initCart() {
    const items = getCart();
    if (items.length === 0) {
        renderEmptyCart();
        return;
    }

    try {
        const results = await Promise.all(
            items.map(it => fetchTourDetail(it.TourID).then(r => ({
                tour: r.tour,
                quantity: it.quantity,
            })))
        );

        const rows = results.filter(r => r.tour);
        if (rows.length === 0) {
            renderEmptyCart();
            return;
        }

        $('#js-cart-list').html(rows.map(r => renderCartItem(r.tour, r.quantity)).join(''));
        computeTotals(rows);
        bindCartEvents(rows);
    } catch (err) {
        console.error('FE-CART-002', err);
    }
}

function bindOrderSubmit() {
    $('#order-form').on('submit', async function (e) {
        e.preventDefault();

        const items = getCart()
            .filter(it => isItemChecked(it.TourID))
            .map(it => ({ tour_id: it.TourID, quantity: it.quantity }));

        if (items.length === 0) {
            showToast('Giỏ hàng trống', 'error');
            return;
        }

        redirectIfNotLoggedIn('cart.html');
        if (!isLoggedIn()) return;

        const payment_method = ($('input[name="method"]:checked').val() || '').toString();
        const note           = ($('#textarea-input').val() || '').toString().trim();

        const $btn = $(this).find('button').last();
        $btn.prop('disabled', true);
        try {
            const result = await submitBooking({ items, payment_method, note });
            localStorage.removeItem('cart');
            updateCartBadge();

            if (payment_method === 'zalopay') {
                const zp = await createZaloPayOrder(result.order_id);
                if (!zp || !zp.order_url) {
                    showToast('Không tạo được phiên ZaloPay', 'error');
                    return;
                }
                window.location.href = zp.order_url;
                return;
            }

            showToast('Đặt tour thành công', 'success');
            setTimeout(() => { window.location.href = 'index.html'; }, 1200);
        } catch (err) {
            console.error('FE-BOOK-001', err);
        } finally {
            $btn.prop('disabled', false);
        }
    });
}

$(function () {
    initCart();
    bindOrderSubmit();
});
