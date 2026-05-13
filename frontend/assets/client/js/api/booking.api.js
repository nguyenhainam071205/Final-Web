// AJAX layer for the Booking feature — client bundle.

/**
 * @param {{items: Array<{tour_id:number, quantity:number}>, payment_method:string, note?:string}} payload
 */
async function submitBooking(payload) {
    return handleRequest('POST', '/booking/create.php', payload);
}

async function createZaloPayOrder(orderId) {
    return handleRequest('POST', '/booking/zalopay_create.php', { order_id: orderId });
}
