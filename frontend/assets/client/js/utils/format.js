function formatPrice(price) {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return num.toLocaleString('vi-VN');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const datePart = dateStr.split(' ')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
}
