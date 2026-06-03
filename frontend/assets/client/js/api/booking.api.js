async function submitBooking(payload) {
    return handleRequest('POST', '/booking/create.php', payload);
}
