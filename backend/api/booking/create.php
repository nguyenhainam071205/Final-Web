<?php
declare(strict_types=1);

require_once '../../includes/response.php';
require_once '../../config/db.php';
require_once '../../includes/db_tour.php';
require_once '../../includes/db_order.php';
require_once '../../includes/db_booking.php';

header('Access-Control-Allow-Origin: *');

// $_POST = [
//  'items' => [['tour_id' => '1', 'quantity' => '2'], ['tour_id' => '2', 'quantity' => '3']],
//  'client_name' => 'fjksldjfls',
//  'client_phone' => '12312',
//  'payment_method' => 'bank', 
//]

$client_name    = trim((string)($_POST['client_name']));
$client_phone   = trim((string)($_POST['client_phone']));
$client_note    = isset($_POST['client_note']) ? trim((string)$_POST['client_note']) : null;
$payment_method = trim((string)($_POST['payment_method'] ?? ''));
$items_raw      = $_POST['items'];

if ($client_name === '') {
    json_error('Vui lòng nhập họ tên', 422);
}
if ($client_phone === '') {
    json_error('Vui lòng nhập số điện thoại', 422);
}
if (!in_array($payment_method, ['cash', 'bank'], true)) {
    json_error('Phương thức thanh toán không hợp lệ', 422);
}
if (!is_array($items_raw) || count($items_raw) === 0) {
    json_error('Giỏ hàng trống', 422);
}

$items = [];
foreach ($items_raw as $it) {
    $items[] = [
        'tour_id'  => (int)($it['tour_id']),
        'quantity' => (int)($it['quantity']),
    ];
}

try {
    $pdo->beginTransaction();

    $order_id = order_create($pdo, $client_name, $client_phone, $client_note, $payment_method);

    foreach ($items as $it) {
        $tour = tour_get_by_id($pdo, $it['tour_id']);
        if ($tour === null) {
            $pdo->rollBack();
            error_log('BE-BOOK-001 tour not found: ' . $it['tour_id']);
            json_error('Tour không tồn tại', 404);
        }
        booking_create(
            $pdo,
            (int)$tour['TourID'],
            $order_id,
            $it['quantity'],
            (float)$tour['CostPerPerson']
        );
    }

    $pdo->commit();
    json_success(['order_id' => $order_id], 201);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('BE-DB-001 booking/create: ' . $e->getMessage());
    json_error('Database error', 500);
}
