<?php
declare(strict_types=1);

require_once '../../config/db.php';
require_once '../../config/constants.php';
require_once '../../includes/db_order.php';
require_once '../../includes/zalopay.php';

header('Content-Type: application/json');

function zp_reply(int $return_code, string $message): void
{
    echo json_encode(['return_code' => $return_code, 'return_message' => $message]);
    exit;
}

$raw     = file_get_contents('php://input') ?: '';
$decoded = json_decode($raw, true);

if (!is_array($decoded) || !isset($decoded['data'], $decoded['mac'])) {
    error_log('BE-BOOK-006 zalopay callback bad envelope: ' . substr($raw, 0, 200));
    zp_reply(-1, 'invalid envelope');
}

$data_raw = (string)$decoded['data'];
$mac      = (string)$decoded['mac'];

if (!zalopay_verify_callback($data_raw, $mac)) {
    error_log('BE-BOOK-007 zalopay callback mac mismatch');
    zp_reply(-1, 'mac not equal');
}

$data = json_decode($data_raw, true);
if (!is_array($data) || !isset($data['app_trans_id'])) {
    error_log('BE-BOOK-008 zalopay callback bad data payload');
    zp_reply(0, 'bad data');
}

$order_id = zalopay_parse_order_id_from_trans((string)$data['app_trans_id']);
if ($order_id === null) {
    error_log('BE-BOOK-009 zalopay callback unparseable app_trans_id: ' . $data['app_trans_id']);
    zp_reply(0, 'unparseable trans id');
}

try {
    order_mark_paid_by_id($pdo, $order_id);
} catch (PDOException $e) {
    error_log('BE-DB-001 zalopay callback: ' . $e->getMessage());
    zp_reply(0, 'db error');
}

zp_reply(1, 'success');
