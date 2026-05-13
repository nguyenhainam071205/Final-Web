/**
 * Formats a number with Vietnamese thousand separators (dots).
 * e.g. 2590000 → "2.590.000"
 * @param {number|string} price
 * @returns {string}
 */
function formatPrice(price) {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '0';
    return num.toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

/**
 * Converts a DATE string from the DB (YYYY-MM-DD) to DD/MM/YYYY.
 * e.g. "2026-07-15" → "15/07/2026"
 * @param {string} dateStr
 * @returns {string}
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    const datePart = dateStr.split(' ')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
}
