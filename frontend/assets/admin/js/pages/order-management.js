

(function () {
    function escapeHtml(s) {
        return $('<div>').text(s == null ? '' : String(s)).html();
    }

    function renderOrderCode(orderId) {
        return 'OD' + String(orderId).padStart(6, '0');
    }

    function renderTourItem(t) {
        const thumb = t.TourThumbnail || '../assets/admin/images/section-3-picture.png';
        return `
            <div class="inner-item">
                <div class="inner-image"><img src="${thumb}"></div>
                <div class="inner-content">
                    <div class="inner-name">${escapeHtml(t.Title)}</div>
                    <div class="inner-quantity">Người lớn: ${t.Quantity} x ${formatPrice(t.PriceAtBooking)}đ</div>
                </div>
            </div>`;
    }

    function renderRow(order) {
        const status = ORDER_STATUS_LABEL[order.OrderStatus] || ORDER_STATUS_LABEL[1];
        const pm = PAYMENT_METHOD_LABEL[order.PaymentMethod] || order.PaymentMethod || '—';
        const paymentStatus = getPaymentStatusLabel(order.PaymentMethod);
        const dt = splitDateTime(order.OrderDate);
        const tours = (order.tours || []).map(renderTourItem).join('');
        const note = order.Note ? `<div>Ghi chú: ${escapeHtml(order.Note)}</div>` : '';

        return `
            <tr>
                <td><div class="inner-code">${renderOrderCode(order.OrderID)}</div></td>
                <td>
                    <div>Họ tên: ${escapeHtml(order.FullName)}</div>
                    <div>SĐT: ${escapeHtml(order.PhoneNumber || '—')}</div>
                    ${note}
                </td>
                <td><div class="inner-list">${tours}</div></td>
                <td>
                    <div>Tổng tiền: ${formatPrice(order.TotalPrice)}đ</div>
                    <div>PTTT: ${escapeHtml(pm)}</div>
                    <div>TTTT: ${paymentStatus}</div>
                </td>
                <td><div class="badge ${status.cls}">${status.text}</div></td>
                <td class="inner-right">
                    <div>${dt.time}</div>
                    <div>${dt.date}</div>
                </td>
                <td class="inner-right"> 
                    <div class="inner-buttons"> 
                        <a class="inner-edit" href="order-changing.html?order_id=${order.OrderID}">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </a>
                        <button class="inner-delete js-order-delete" data-order-id="${order.OrderID}">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    }

    function renderEmpty() {
        return `<tr><td colspan="6" style="text-align:center; padding:24px;">Chưa có đơn hàng nào.</td></tr>`;
    }

    const PAGE_SIZE = 3;
    const STATUS_PARAM = 'order-status';
    const PAYMENT_STATUS_PARAM = 'payment-status';
    const PAYMENT_METHOD_PARAM = 'payment-method';
    const START_DATE_PARAM = 'start-date';
    const END_DATE_PARAM = 'end-date';
    const KEYWORD_PARAM = 'keyword';
    let allOrders = [];
    let currentPage = 1;

    function slugify(s) {
        return String(s == null ? '' : s)
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[đĐ]/g, 'd')
            .toLowerCase()
            .trim();
    }

    function applyKeywordFilter(orders) {
        const term = getParamFromUrl(KEYWORD_PARAM);
        if (term === null) return orders;
        const q = slugify(term);
        if (q === '') return orders;
        return orders.filter(o => {
            const haystack = [
                renderOrderCode(o.OrderID),
                o.FullName,
                o.PhoneNumber,
            ].map(slugify).join(' ');
            return haystack.includes(q);
        });
    }

    function getParamFromUrl(name) {
        const raw = new URLSearchParams(window.location.search).get(name);
        return raw === null || raw === '' ? null : raw;
    }

    function bindUrlSelectFilter(selectId, paramName) {
        const initial = getParamFromUrl(paramName);
        if (initial !== null) $(selectId).val(initial);

        $(selectId).off('change.filter').on('change.filter', function () {
            const value = $(this).val();
            const params = new URLSearchParams(window.location.search);
            if (value === '') {
                params.delete(paramName);
            } else {
                params.set(paramName, value);
            }
            const qs = params.toString();
            window.location.href = window.location.pathname + (qs ? '?' + qs : '');
        });
    }

    function applyIntFieldFilter(orders, paramName, field) {
        const filter = getParamFromUrl(paramName);
        if (filter === null) return orders;
        const wanted = parseInt(filter, 10);
        if (!Number.isFinite(wanted)) return orders;
        return orders.filter(o => Number(o[field]) === wanted);
    }

    function applyStringFieldFilter(orders, paramName, field) {
        const filter = getParamFromUrl(paramName);
        if (filter === null) return orders;
        return orders.filter(o => String(o[field]) === filter);
    }

    function applyDateRangeFilter(orders, field) {
        const start = getParamFromUrl(START_DATE_PARAM);
        const end   = getParamFromUrl(END_DATE_PARAM);
        if (!start && !end) return orders;
        return orders.filter(o => {
            const datePart = String(o[field] || '').split(' ')[0];
            if (!datePart) return false;
            if (start && datePart < start) return false;
            if (end && datePart > end) return false;
            return true;
        });
    }

    function totalPages() {
        return Math.max(1, Math.ceil(allOrders.length / PAGE_SIZE));
    }

    function renderPage(page) {
        const $tbody = $('#js-order-tbody');
        if (allOrders.length === 0) {
            $tbody.html(renderEmpty());
            $('#js-page-info').text('Hiển thị 0 - 0 của 0');
            return;
        }
        const pages = totalPages();
        currentPage = Math.min(Math.max(1, page), pages);

        const start = (currentPage - 1) * PAGE_SIZE;
        const end   = Math.min(start + PAGE_SIZE, allOrders.length);
        const slice = allOrders.slice(start, end);
        $tbody.html(slice.map(renderRow).join(''));
        $('#js-page-info').text(`Hiển thị ${start + 1} - ${end} của ${allOrders.length}`);
    }

    function bindSearch() {
        const initial = getParamFromUrl(KEYWORD_PARAM);
        if (initial !== null) $('#js-search-input').val(initial);

        $('#js-search-input').off('keydown.search').on('keydown.search', function (e) {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            const value = String($(this).val() || '').trim();
            const params = new URLSearchParams(window.location.search);
            if (value === '') {
                params.delete(KEYWORD_PARAM);
            } else {
                params.set(KEYWORD_PARAM, value);
            }
            const qs = params.toString();
            window.location.href = window.location.pathname + (qs ? '?' + qs : '');
        });
    }

    function renderPageSelect() {
        const $select = $('#js-page-select');
        const pages = totalPages();
        const opts = [];
        for (let i = 1; i <= pages; i++) {
            opts.push(`<option value="${i}">Trang ${i}</option>`);
        }
        $select.html(opts.join(''));
        $select.val(currentPage);
    }

    function bindPageSelect() {
        $('#js-page-select').off('change.page').on('change.page', function () {
            renderPage(parseInt($(this).val(), 10) || 1);
        });
    }

    function bindDelete() {
        $('#js-order-tbody').off('click.delete').on('click.delete', '.js-order-delete', async function () {
            const orderId = parseInt($(this).data('order-id'), 10);
            if (!Number.isFinite(orderId) || orderId <= 0) return;

            const $btn = $(this).prop('disabled', true);
            try {
                await deleteBooking(orderId);
                showToast('Xoá đơn hàng thành công', 'success');
                setTimeout(() => window.location.reload(), 600);
            } catch (err) {
                console.error('FE-BOOK-005', err);
                $btn.prop('disabled', false);
            }
        });
    }

    async function init() {
        const $tbody = $('#js-order-tbody');
        bindUrlSelectFilter('#js-filter-status', STATUS_PARAM);
        bindUrlSelectFilter('#js-filter-payment-status', PAYMENT_STATUS_PARAM);
        bindUrlSelectFilter('#js-filter-payment-method', PAYMENT_METHOD_PARAM);
        bindUrlSelectFilter('#js-filter-start-date', START_DATE_PARAM);
        bindUrlSelectFilter('#js-filter-end-date', END_DATE_PARAM);
        $('#js-clear-filters').off('click.clear').on('click.clear', function () {
            window.location.href = window.location.pathname;
        });
        try {
            const data = await fetchBookingList();
            let orders = (data && data.orders) || [];
            orders = applyIntFieldFilter(orders, STATUS_PARAM, 'OrderStatus');
            orders = applyIntFieldFilter(orders, PAYMENT_STATUS_PARAM, 'PaymentStatus');
            orders = applyStringFieldFilter(orders, PAYMENT_METHOD_PARAM, 'PaymentMethod');
            orders = applyDateRangeFilter(orders, 'OrderDate');
            orders = applyKeywordFilter(orders);
            allOrders = orders;
            currentPage = 1;
            renderPageSelect();
            renderPage(1);
            bindPageSelect();
            bindDelete();
            bindSearch();
        } catch (err) {
            console.error('FE-BOOK-002', err);
            $tbody.html(renderEmpty());
        }
    }

    $(function () { init(); });
})();
