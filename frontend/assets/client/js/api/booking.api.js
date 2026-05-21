// AJAX layer for the Booking feature — client bundle.

/**
 * @param {{items: Array<{tour_id:number, quantity:number}>, payment_method:string, client_name:string, client_phone:string, client_note?:string}} payload
 */
async function submitBooking(payload) {
    return handleRequest('POST', '/booking/create.php', payload);
}
