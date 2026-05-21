<?php
declare(strict_types=1);

require_once '../../../includes/response.php';
require_once '../../../config/db.php';
require_once '../../../includes/auth.php';
require_once '../../../includes/db_order.php';
require_once '../../../includes/db_booking.php';

header('Access-Control-Allow-Origin: *');

require_login();
require_role('admin');

$order_id = (int)($_POST['order_id']);
 
try {
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
