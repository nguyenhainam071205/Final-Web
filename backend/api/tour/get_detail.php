<?php
declare(strict_types=1);

require_once '../../includes/response.php';
require_once '../../config/constants.php';
require_once '../../config/db.php';
require_once '../../includes/validator.php';
require_once '../../includes/db_tour.php';

header('Access-Control-Allow-Origin: *');

validate_required($_GET, ['tour_id']);
$tour_id = (int)$_GET['tour_id'];
validate_positive_int($tour_id, 'tour_id');

try {
    $tour = tour_get_by_id($pdo, $tour_id);
    if (!$tour) {
        json_error('Tour not found', 404);
    }
    json_success(['tour' => $tour]);
} catch (PDOException $e) {
    error_log('BE-DB-001 tour/get_detail: ' . $e->getMessage());
    json_error('Database error', 500);
}
