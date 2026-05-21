

const BASE_URL = '/Project/backend/api';

async function handleRequest(method, url, data = {}) {
    try {
        const response = await $.ajax({
            url: BASE_URL + url,
            method,
            data,
            dataType: 'json',
        });
        return response.data;
    } catch (err) {
        const message = err.responseJSON?.message ?? 'Something went wrong';
        console.error('FE-HTTP-001', err);
        alert(message);
        throw err;
    }
}
