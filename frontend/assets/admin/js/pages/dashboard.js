(function () {
    async function init() {
        try {
            const data = await fetchBookingList();
            const orders = (data && data.orders) || [];

            const orderCount = orders.length;
            const revenue = orders
                .filter(o => Number(o.PaymentStatus) === 1 && Number(o.OrderStatus) !== 0)
                .reduce((sum, o) => sum + (parseFloat(o.TotalPrice) || 0), 0);

            $('#js-stat-order-count').text(formatPrice(orderCount));
            $('#js-stat-revenue').text(formatPrice(revenue) + 'đ');
        } catch (err) {
            console.error('FE-DASH-001', err);
        }
    }

    $(function () { init(); });
})();
