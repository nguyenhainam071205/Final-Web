const BASE_URL = '/Project/backend/api';

async function handleRequest(method, url, data) {
    const response = await $.ajax({
        url: BASE_URL + url,
        method,
        data,
        dataType: 'json',
    });
    return response.data;
}
