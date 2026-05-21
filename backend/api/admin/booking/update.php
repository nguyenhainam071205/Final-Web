<?php
declare(strict_types=1);

require_once '../../../includes/response.php';
require_once '../../../config/db.php';
require_once '../../../includes/auth.php';
require_once '../../../includes/db_order.php';

header('Access-Control-Allow-Origin: *');

require_login();
require_role('admin');

$order_id       = (int)($_POST['order_id']);
$client_name    = trim((string)($_POST['client_name']));
$client_phone   = trim((string)($_POST['client_phone']));
$client_note    = isset($_POST['client_note']) ? trim((string)$_POST['client_note']) : null;
$payment_method = trim((string)($_POST['payment_method']));
$payment_status = (int)($_POST['payment_status']);
$order_status   = (int)($_POST['order_status']);

try {
    order_update_admin(
        $pdo,
        $order_id,
        $client_name,
        $client_phone,
        $client_note,
        $payment_method,
        $payment_status,
        $order_status
    );

    json_success(['order_id' => $order_id]);
} catch (PDOException $e) {
    error_log('BE-DB-001 admin/booking/update: ' . $e->getMessage());
    json_error('Database error', 500);
}
