(function () {
    let currentOrder = null;

    function escapeHtml(s) {
        return $('<div>').text(s == null ? '' : String(s)).html();
    }

    function getOrderIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const raw = parseInt(params.get('order_id'), 10);
        return Number.isFinite(raw) && raw > 0 ? raw : null;
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
        const thumb = t.TourThumbnail || '../assets/admin/images/section-3-picture.png';
        return `
            <div class="inner-item">
                <div class="inner-image"><img src="${thumb}" alt=""></div>
                <div class="inner-desc">
                    <div class="inner-item-title">${escapeHtml(t.Title)}</div>
                    <div class="inner-item-text">Người lớn: ${t.Quantity} x ${formatPrice(t.PriceAtBooking)}đ</div>
                </div>
            </div>`;
    }

    function fillForm(order) {
        currentOrder = order;
        $('#js-order-title').text('Đơn hàng: ' + renderOrderCode(order.OrderID));
        $('#fullName').val(order.FullName || '');
        $('#phone').val(order.PhoneNumber || '');
        $('#notes').val(order.Note || '');
        $('#paymentMethod').val(order.PaymentMethod || '');
        const paymentStatus = order.PaymentStatus != null
            ? String(order.PaymentStatus)
            : (PAID_PAYMENT_METHODS.includes(order.PaymentMethod) ? '1' : '0');
        $('#paymentStatus').val(paymentStatus);
        $('#createdAt').val(toDatetimeLocal(order.OrderDate));
        $('#status').val(String(order.OrderStatus));

        const tours = (order.tours || []).map(renderTourItem).join('');
        $('#js-tour-list').html(tours);

        $('#js-order-total').html(`
            <div>Tổng tiền: ${formatPrice(order.TotalPrice)}đ</div>
            <div>Thanh toán: <span class="inner-number">${formatPrice(order.TotalPrice)}đ</span></div>
        `);
    }

    function renderNotFound() {
        $('#js-order-title').text('Không tìm thấy đơn hàng');
        $('#order-edit-form').hide();
    }

    function bindSubmit() {
        $('#order-edit-form').on('submit', async function (e) {
            e.preventDefault();
            if (!currentOrder) return;

            const payload = {
                order_id:       currentOrder.OrderID,
                user_id:        currentOrder.UserID,
                full_name:      ($('#fullName').val() || '').toString().trim(),
                phone_number:   ($('#phone').val() || '').toString().trim(),
                note:           ($('#notes').val() || '').toString().trim(),
                payment_method: ($('#paymentMethod').val() || '').toString(),
                payment_status: ($('#paymentStatus').val() || '0').toString(),
                order_status:   ($('#status').val() || '1').toString(),
            };

            const $btn = $(this).find('button').last();
            $btn.prop('disabled', true);
            try {
                await updateBooking(payload);
                currentOrder.FullName      = payload.full_name;
                currentOrder.PhoneNumber   = payload.phone_number;
                currentOrder.Note          = payload.note;
                currentOrder.PaymentMethod = payload.payment_method;
                currentOrder.PaymentStatus = parseInt(payload.payment_status, 10);
                currentOrder.OrderStatus   = parseInt(payload.order_status, 10);
                showToast('Cập nhật đơn hàng thành công', 'success');
            } catch (err) {
                console.error('FE-BOOK-004', err);
            } finally {
                $btn.prop('disabled', false);
            }
        });
    }

    async function init() {
        const orderId = getOrderIdFromUrl();
        if (!orderId) {
            renderNotFound();
            return;
        }
        try {
            const data = await fetchBookingList();
            const order = (data && data.orders || []).find(o => Number(o.OrderID) === orderId);
            if (!order) {
                renderNotFound();
                return;
            }
            fillForm(order);
            bindSubmit();
        } catch (err) {
            console.error('FE-BOOK-003', err);
            renderNotFound();
        }
    }

    $(function () { init(); });
})();
