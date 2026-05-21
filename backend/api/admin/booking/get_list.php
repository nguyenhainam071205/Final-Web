<?php
declare(strict_types=1);

require_once '../../../includes/response.php';
require_once '../../../config/db.php';
require_once '../../../includes/auth.php';
require_once '../../../includes/db_order.php';

header('Access-Control-Allow-Origin: *');

require_login();
require_role('admin');

try {
    $orders = order_get_list_admin($pdo);
    json_success(['orders' => $orders]);
} catch (PDOException $e) {
    error_log('BE-DB-001 admin/booking/get_list: ' . $e->getMessage());
    json_error('Database error', 500);
}
