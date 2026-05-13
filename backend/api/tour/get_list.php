<?php
declare(strict_types=1);

require_once '../../includes/response.php';
require_once '../../config/constants.php';
require_once '../../config/db.php';
require_once '../../includes/validator.php';
require_once '../../includes/db_tour.php';

header('Access-Control-Allow-Origin: *');

$category_id = (int)($_GET['category_id'] ?? 0);

try {
    $tours = tour_get_list($pdo, $category_id);
    json_success(['tours' => $tours]);
} catch (PDOException $e) {
    error_log('BE-DB-001 tour/get_list: ' . $e->getMessage());
    json_error('Database error', 500);
}
