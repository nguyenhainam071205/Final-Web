// Base $.ajax wrapper — all AJAX must go through handleRequest().
// Never call $.ajax directly outside this file.

const BASE_URL = '/Project/backend/api';

/**
 * @param {'GET'|'POST'} method
 * @param {string} url    — relative to BASE_URL, e.g. '/tour/get_list.php'
 * @param {Object} [data] — query params (GET) or body (POST)
 * @returns {Promise<any>} — resolves to response.data (inner payload, not the envelope)
 */
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
        if (typeof showToast === 'function') {
            showToast(message, 'error');
        }
        throw err;
    }
}
