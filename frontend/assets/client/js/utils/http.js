const BASE_URL = '/Project/backend/api';

async function handleRequest(method, url, data) {
    const response = await $.ajax({
        url: BASE_URL + url, // /Project/backend/api/booking/create.php?items[0][tour_id]=1&items[0][quantity]=2&items[1][tour_id]=2&items[1][quantity]=3&client_name=fjksldjfls&client_phone=12312&payment_method=bank
        method,
        data,
        dataType: 'json',
    });
    return response.data;
}
