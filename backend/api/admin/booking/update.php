<?php
declare(strict_types=1);

require_once '../../../includes/response.php';
require_once '../../../config/constants.php';
require_once '../../../config/db.php';
require_once '../../../includes/auth.php';
require_once '../../../includes/validator.php';
require_once '../../../includes/db_order.php';
require_once '../../../includes/db_user.php';

header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

require_login();
require_role(USER_ROLE_ADMIN);

validate_required($_POST, ['order_id', 'payment_method', 'payment_status', 'order_status']);

$order_id       = (int)$_POST['order_id'];
$payment_method = trim((string)$_POST['payment_method']);
$payment_status = (int)$_POST['payment_status'];
$order_status   = (int)$_POST['order_status'];
$note           = isset($_POST['note']) ? trim((string)$_POST['note']) : null;
$user_id        = isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0;
$full_name      = isset($_POST['full_name']) ? trim((string)$_POST['full_name']) : '';
$phone_number   = isset($_POST['phone_number']) ? trim((string)$_POST['phone_number']) : null;

validate_positive_int($order_id, 'order_id');

$allowed_methods = ['cash', 'zalopay', 'bank'];
if (!in_array($payment_method, $allowed_methods, true)) {
    json_error('Phương thức thanh toán không hợp lệ', 422);
}
if (!in_array($payment_status, [0, 1, 2], true)) {
    json_error('Trạng thái thanh toán không hợp lệ', 422);
}
if (!in_array($order_status, [ORDER_STATUS_CANCEL, ORDER_STATUS_PENDING, ORDER_STATUS_SUCCESS], true)) {
    json_error('Trạng thái đơn hàng không hợp lệ', 422);
}

try {
    if (!order_exists($pdo, $order_id)) {
        json_error('Không tìm thấy đơn hàng', 404);
    }

    $pdo->beginTransaction();
    order_update_admin($pdo, $order_id, $payment_method, $payment_status, $order_status, $note);

    if ($user_id > 0 && $full_name !== '') {
        user_update_contact($pdo, $user_id, $full_name, $phone_number);
    }
    $pdo->commit();

    json_success(['order_id' => $order_id]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('BE-DB-001 admin/booking/update: ' . $e->getMessage());
    json_error('Database error', 500);
}
