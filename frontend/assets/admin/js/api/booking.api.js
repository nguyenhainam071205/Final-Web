// AJAX layer for the Booking feature — admin bundle.

async function fetchBookingList() {
    return handleRequest('GET', '/admin/booking/get_list.php');
}

async function updateBooking(payload) {
    return handleRequest('POST', '/admin/booking/update.php', payload);
}

async function deleteBooking(orderId) {
    return handleRequest('POST', '/admin/booking/delete.php', { order_id: orderId });
}
