<?php
declare(strict_types=1);

require_once '../../includes/response.php';
require_once '../../config/constants.php';
require_once '../../config/db.php';
require_once '../../includes/validator.php';
require_once '../../includes/db_user.php';
require_once '../../includes/auth.php';

header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

validate_required($_POST, ['email', 'password']);

$email    = trim((string)$_POST['email']);
$password = (string)$_POST['password'];

try {
    $user = user_find_by_email($pdo, $email);

    if ($user === null || !password_verify($password, (string)$user['Password'])) {
        error_log('BE-AUTH-003 user/login: bad credentials for ' . $email);
        json_error('Sai email hoặc mật khẩu', 401);
    }

    if ((int)$user['Status'] !== USER_STATUS_ACTIVE) {
        error_log('BE-AUTH-004 user/login: locked account ' . $email);
        json_error('Tài khoản đã bị khoá', 403);
    }

    auth_login($user);

    unset($user['Password']);
    json_success(['user' => $user]);
} catch (PDOException $e) {
    error_log('BE-DB-001 user/login: ' . $e->getMessage());
    json_error('Database error', 500);
}
