<?php
declare(strict_types=1);

require_once '../../../includes/response.php';
require_once '../../../config/constants.php';
require_once '../../../config/db.php';
require_once '../../../includes/auth.php';
require_once '../../../includes/validator.php';
require_once '../../../includes/db_order.php';
require_once '../../../includes/db_booking.php';

header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

require_login();
require_role(USER_ROLE_ADMIN);

validate_required($_POST, ['order_id']);
$order_id = (int)$_POST['order_id'];
validate_positive_int($order_id, 'order_id');

try {
    if (!order_exists($pdo, $order_id)) {
        json_error('Không tìm thấy đơn hàng', 404);
    }

    $pdo->beginTransaction();
    booking_delete_by_order($pdo, $order_id);
    order_delete($pdo, $order_id);
    $pdo->commit();

    json_success(['order_id' => $order_id]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('BE-DB-001 admin/booking/delete: ' . $e->getMessage());
    json_error('Database error', 500);
}
