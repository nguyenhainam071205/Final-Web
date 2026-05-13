function formatPrice(price) {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '0';
    return num.toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

/**
 * Splits a "YYYY-MM-DD HH:MM:SS" (or just "YYYY-MM-DD") into { time, date } strings,
 * formatted "HH:MM" and "DD/MM/YYYY". time is empty if no time component is present.
 */
function splitDateTime(raw) {
    if (!raw) return { time: '', date: '' };
    const [datePart, timePart] = String(raw).split(' ');
    const [year, month, day] = (datePart || '').split('-');
    const time = timePart ? timePart.slice(0, 5) : '';
    return { time, date: day && month && year ? `${day}/${month}/${year}` : '' };
}

const ORDER_STATUS_LABEL = {
    0: { text: 'Tạm dừng', cls: 'badge-red' },
    1: { text: 'Khởi tạo', cls: 'badge-orange' },
    2: { text: 'Hoàn thành', cls: 'badge-green' },
};

const PAYMENT_METHOD_LABEL = {
    cash: 'Tiền mặt',
    zalopay: 'Ví ZaloPay',
    bank: 'Chuyển khoản',
};

const PAID_PAYMENT_METHODS = ['bank', 'zalopay'];

function getPaymentStatusLabel(paymentMethod) {
    return PAID_PAYMENT_METHODS.includes(paymentMethod) ? 'Đã thanh toán' : 'Chưa thanh toán';
}
