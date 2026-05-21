// Orchestrator for cart.html — reads cart from localStorage, fetches each
// tour, renders rows, computes totals.

function renderCartItem(tour, quantity) {
    const tourCode = String(tour.TourID).padStart(9, '0');
    const thumb = tour.TourThumbnail;
    const price = parseFloat(tour.CostPerPerson);

    return `
        <div class="inner-item" data-tour-id="${tour.TourID}">
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
    $('#js-cart-total').text('0 đ');
}

function computeTotals(rows) {
    const subtotal = rows.reduce((sum, { tour, quantity }) => {
        return sum + (parseFloat(tour.CostPerPerson)) * quantity;
    }, 0);

    $('#js-cart-subtotal').text(`${formatPrice(subtotal)} đ`);
    $('#js-cart-total').text(`${formatPrice(subtotal)} đ`);
}

async function initCart() {
    const items = getCart();
    if (items.length === 0) {
        renderEmptyCart();
        return;
    }

    const rows = await Promise.all(
        items.map(it => fetchTourDetail(it.TourID).then(r => ({
            tour: r.tour,
            quantity: it.quantity,
        })))
    );

    $('#js-cart-list').html(rows.map(r => renderCartItem(r.tour, r.quantity)).join(''));
    computeTotals(rows);
}

function bindOrderSubmit() {
    $('#order-form').on('submit', async function (e) {
        e.preventDefault();

        const items = getCart()
            .map(it => ({ tour_id: it.TourID, quantity: it.quantity }));

        if (items.length === 0) {
            alert('Giỏ hàng trống');
            return;
        }

        const client_name = ($('#full-name-input').val());
        const client_phone = ($('#phone-input').val());
        const client_note = ($('#textarea-input').val());
        const payment_method = ($('input[name="method"]:checked').val());

        if (!client_name) {
            alert('Vui lòng nhập họ và tên');
            return;
        }
        if (!client_phone) {
            alert('Vui lòng nhập số điện thoại');
            return;
        }
        if (!payment_method) {
            alert('Vui lòng chọn phương thức thanh toán');
            return;
        }

        await submitBooking({
            items,
            payment_method,
            client_name,
            client_phone,
            client_note,
        });
        localStorage.removeItem('cart');

        alert('Đặt tour thành công');
        setTimeout(() => { window.location.href = 'index.html'; }, 1200);
    });
}

$(function () {
    initCart();
    bindOrderSubmit();
});
