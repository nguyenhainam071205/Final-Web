<?php
declare(strict_types=1);

require_once '../../includes/response.php';
require_once '../../config/db.php';
require_once '../../includes/db_tour.php';

header('Access-Control-Allow-Origin: *');

$tour_id = (int)($_GET['tour_id']);

try {
    $tour = tour_get_by_id($pdo, $tour_id);
    json_success(['tour' => $tour]);
} catch (PDOException $e) {
    error_log('BE-DB-001 tour/get_detail: ' . $e->getMessage());
    json_error('Database error', 500);
}
