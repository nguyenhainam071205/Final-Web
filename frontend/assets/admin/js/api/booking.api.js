// AJAX layer for the Booking feature — admin bundle.

async function fetchBookingList() {
    return handleRequest('GET', '/admin/booking/get_list.php');
    // "order": [
    //     {
    //         "OrderID": 5,
    //         ....
    //         "tours": [
    //             {tourID: 1, ...}
    //             ...
    //         ]
    //     }
    // ]
}

async function updateBooking(payload) {
    return handleRequest('POST', '/admin/booking/update.php', payload);
}

async function deleteBooking(orderId) {
    return handleRequest('POST', '/admin/booking/delete.php', { order_id: orderId });
}
