<?php
declare(strict_types=1);

require_once '../../includes/response.php';
require_once '../../config/db.php';
require_once '../../config/constants.php';
require_once '../../includes/auth.php';
require_once '../../includes/validator.php';
require_once '../../includes/db_order.php';
require_once '../../includes/db_booking.php';
require_once '../../includes/zalopay.php';

header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

require_login();
$user = auth_get_current_user();

validate_required($_POST, ['order_id']);
$order_id = (int)$_POST['order_id'];
validate_positive_int($order_id, 'order_id');

$order = order_get_for_payment($pdo, $order_id);
if ($order === null) {
    json_error('Không tìm thấy đơn hàng', 404);
}
if ($order['PaymentMethod'] !== 'zalopay') {
    json_error('Đơn hàng không dùng ZaloPay', 422);
}
if ($order['PaymentStatus'] !== 0) {
    json_error('Đơn hàng đã được thanh toán', 409);
}

$items = booking_get_by_order($pdo, $order_id);
if (count($items) === 0) {
    json_error('Đơn hàng không có tour', 422);
}

try {
    $response = zalopay_create_order(
        $order_id,
        $order['TotalPrice'],
        (string)($user['Email'] ?? ''),
        $items
    );
} catch (RuntimeException $e) {
    error_log('BE-BOOK-003 zalopay create transport: ' . $e->getMessage());
    json_error('Không kết nối được ZaloPay', 502);
}

if ((int)($response['return_code'] ?? 0) !== 1) {
    error_log('BE-BOOK-004 zalopay create returned: ' . json_encode($response));
    $msg = (string)($response['sub_return_message'] ?? $response['return_message'] ?? 'ZaloPay từ chối yêu cầu');
    json_error($msg, 502);
}

json_success([
    'order_url'    => (string)($response['order_url'] ?? ''),
    'app_trans_id' => (string)($response['_app_trans_id'] ?? ''),
]);
