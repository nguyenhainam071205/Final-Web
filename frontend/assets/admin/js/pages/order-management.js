(function () {
    function renderOrderCode(orderId) {
        return 'OD' + String(orderId).padStart(6, '0');
    }

    function renderTourItem(t) {
        const thumb = t.TourThumbnail;
        return `
            <div class="inner-item">
                <div class="inner-image"><img src="${thumb}"></div>
                <div class="inner-content">
                    <div class="inner-name">${t.Title}</div>
                    <div class="inner-quantity">Người lớn: ${t.Quantity} x ${formatPrice(t.PriceAtBooking)}đ</div>
                </div>
            </div>`;
    }

    function renderRow(order) {
        const status = ORDER_STATUS_LABEL[order.OrderStatus];
        const pm = PAYMENT_METHOD_LABEL[order.PaymentMethod];
        const paymentStatus = getPaymentStatusLabel(order.PaymentMethod);
        const dt = splitDateTime(order.OrderDate);
        const tours = order.tours.map(renderTourItem).join('');
        const note = order.ClientNote ? `<div>Ghi chú: ${order.ClientNote}</div>` : '';

        return `
            <tr>
                <td><div class="inner-code">${renderOrderCode(order.OrderID)}</div></td>
                <td>
                    <div>Họ tên: ${order.ClientName || '—'}</div>
                    <div>SĐT: ${order.ClientPhone || '—'}</div>
                    ${note}
                </td>
                <td><div class="inner-list">${tours}</div></td>
                <td>
                    <div>Tổng tiền: ${formatPrice(order.TotalPrice)}đ</div>
                    <div>PTTT: ${pm}</div>
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
        const term = getParamFromUrl('keyword');
        if (term === null) return orders;
        const q = slugify(term);
        if (q === '') return orders;
        return orders.filter(o => {
            const haystack = [
                renderOrderCode(o.OrderID),
                o.ClientName,
                o.ClientPhone,
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
        const wanted = parseInt(filter);
        return orders.filter(o => o[field] === wanted);
    }

    function applyStringFieldFilter(orders, paramName, field) {
        const filter = getParamFromUrl(paramName);
        if (filter === null) return orders;
        return orders.filter(o => String(o[field]) === filter);
    }

    function applyDateRangeFilter(orders, field) {
        const start = getParamFromUrl('start-date');
        const end   = getParamFromUrl('end-date');
        if (!start && !end) return orders;
        return orders.filter(o => {
            const datePart = String(o[field]).split(' ')[0];
            if (!datePart) return false;
            if (start && datePart < start) return false;
            if (end && datePart > end) return false;
            return true;
        });
    }

    function totalPages() {
        return Math.ceil(allOrders.length / PAGE_SIZE);
    }

    function renderPage(page) {
        const $tbody = $('#js-order-tbody');
        if (allOrders.length === 0) {
            $tbody.html(renderEmpty());
            $('#js-page-info').text('Hiển thị 0 - 0 của 0');
            return;
        }
        const pages = totalPages();
        currentPage = page;

        const start = (currentPage - 1) * PAGE_SIZE;
        const end   = start + PAGE_SIZE;
        const slice = allOrders.slice(start, end);
        $tbody.html(slice.map(renderRow).join(''));
        $('#js-page-info').text(`Hiển thị ${start + 1} - ${end} của ${allOrders.length}`);
    }

    function bindSearch() {
        const initial = getParamFromUrl('keyword');
        if (initial !== null) $('#js-search-input').val(initial);

        $('#js-search-input').off('keydown.search').on('keydown.search', function (e) {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            const value = String($(this).val() || '').trim();
            const params = new URLSearchParams(window.location.search);
            if (value === '') {
                params.delete('keyword');
            } else {
                params.set('keyword', value);
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
            renderPage(parseInt($(this).val()));
        });
    }

    function bindDelete() {
        $('#js-order-tbody').off('click.delete').on('click.delete', '.js-order-delete', async function () {
            const orderId = parseInt($(this).data('order-id'));

            await deleteBooking(orderId);
            alert('Xoá đơn hàng thành công');
            window.location.reload();
        });
    }

    async function init() {
        const $tbody = $('#js-order-tbody');
        bindUrlSelectFilter('#js-filter-status', 'order-status');
        bindUrlSelectFilter('#js-filter-payment-status', 'payment-status');
        bindUrlSelectFilter('#js-filter-payment-method', 'payment-method');
        bindUrlSelectFilter('#js-filter-start-date', 'start-date');
        bindUrlSelectFilter('#js-filter-end-date', 'end-date');
        $('#js-clear-filters').off('click.clear').on('click.clear', function () {
            window.location.href = window.location.pathname;
        });
        try {
            const data = await fetchBookingList();
            let orders = data.orders || [];
            orders = applyIntFieldFilter(orders, 'order-status', 'OrderStatus');
            orders = applyIntFieldFilter(orders, 'payment-status', 'PaymentStatus');
            orders = applyStringFieldFilter(orders, 'payment-method', 'PaymentMethod');
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
