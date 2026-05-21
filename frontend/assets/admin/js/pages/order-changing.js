(function () {
    let currentOrder = null;

    function getOrderIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const raw = parseInt(params.get('order_id'));
        return raw;
    }

    function renderOrderCode(orderId) {
        return 'OD' + String(orderId).padStart(6, '0');
    }

    function toDatetimeLocal(raw) {
        if (!raw) return '';
        const [datePart, timePart] = String(raw).split(' ');
        const time = timePart ? timePart.slice(0, 5) : '00:00';
        return datePart ? `${datePart}T${time}` : '';
    }

    function renderTourItem(t) {
        const thumb = t.TourThumbnail;
        return `
            <div class="inner-item">
                <div class="inner-image"><img src="${thumb}" alt=""></div>
                <div class="inner-desc">
                    <div class="inner-item-title">${t.Title}</div>
                    <div class="inner-item-text">Người lớn: ${t.Quantity} x ${formatPrice(t.PriceAtBooking)}đ</div>
                </div>
            </div>`;
    }

    function fillForm(order) {
        currentOrder = order;
        $('#js-order-title').text('Đơn hàng: ' + renderOrderCode(order.OrderID));
        $('#fullName').val(order.ClientName);
        $('#phone').val(order.ClientPhone);
        $('#notes').val(order.ClientNote);
        $('#paymentMethod').val(order.PaymentMethod);
        $('#paymentStatus').val(order.PaymentStatus);
        $('#createdAt').val(toDatetimeLocal(order.OrderDate));
        $('#status').val(String(order.OrderStatus));

        const tours = order.tours.map(renderTourItem).join('');
        $('#js-tour-list').html(tours);

        $('#js-order-total').html(`
            <div>Thanh toán: <span class="inner-number">${formatPrice(order.TotalPrice)}đ</span></div>
        `);
    }

    function bindSubmit() {
        $('#order-edit-form').on('submit', async function (e) {
            e.preventDefault();

            const payload = {
                order_id:       currentOrder.OrderID,
                client_name:    $('#fullName').val().trim(),
                client_phone:   $('#phone').val().trim(),
                client_note:    $('#notes').val().trim(),
                payment_method: $('#paymentMethod').val(),
                payment_status: $('#paymentStatus').val(),
                order_status:   $('#status').val(),
            };

            await updateBooking(payload);
            currentOrder.ClientName    = payload.client_name;
            currentOrder.ClientPhone   = payload.client_phone;
            currentOrder.ClientNote    = payload.client_note;
            currentOrder.PaymentMethod = payload.payment_method;
            currentOrder.PaymentStatus = parseInt(payload.payment_status);
            currentOrder.OrderStatus   = parseInt(payload.order_status);
            alert('Cập nhật đơn hàng thành công');
        });
    }

    async function init() {
        const orderId = getOrderIdFromUrl();

        const data = await fetchBookingList();
        const order = data.orders.find(o => o.OrderID === orderId);
        fillForm(order);
        bindSubmit();
    }

    $(function () { init(); });
})();
