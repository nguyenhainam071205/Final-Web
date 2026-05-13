<?php
declare(strict_types=1);

require_once '../../includes/response.php';
require_once '../../config/constants.php';
require_once '../../config/db.php';
require_once '../../includes/auth.php';
require_once '../../includes/validator.php';
require_once '../../includes/db_tour.php';
require_once '../../includes/db_order.php';
require_once '../../includes/db_booking.php';

header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

require_login();
$user    = auth_get_current_user();
$user_id = (int)$user['UserID'];

validate_required($_POST, ['payment_method']);

$payment_method = trim((string)$_POST['payment_method']);
$note           = isset($_POST['note']) ? trim((string)$_POST['note']) : null;
$items_raw      = $_POST['items'] ?? null;

if (!is_array($items_raw) || count($items_raw) === 0) {
    json_error('Giỏ hàng trống', 400);
}

$items = [];
foreach ($items_raw as $it) {
    $tour_id  = (int)($it['tour_id']  ?? 0);
    $quantity = (int)($it['quantity'] ?? 0);
    if ($tour_id <= 0 || $quantity <= 0) {
        json_error('Item không hợp lệ', 422);
    }
    $items[] = ['tour_id' => $tour_id, 'quantity' => $quantity];
}

try {
    $pdo->beginTransaction();

    $order_id = order_create($pdo, $payment_method, $note);

    foreach ($items as $it) {
        $tour = tour_get_by_id($pdo, $it['tour_id']);
        if ($tour === null) {
            $pdo->rollBack();
            error_log('BE-BOOK-001 tour not found: ' . $it['tour_id']);
            json_error('Tour không tồn tại', 404);
        }
        booking_create(
            $pdo,
            $user_id,
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
