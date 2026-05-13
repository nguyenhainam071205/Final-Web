<?php
declare(strict_types=1);

require_once __DIR__ . '/response.php';

function auth_start_session(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

/**
 * @param array<string, mixed> $user — row from db_user.php with UserID, Email, FullName, role
 */
function auth_login(array $user): void
{
    auth_start_session();
    $_SESSION['currentUser'] = [
        'UserID'   => (int)$user['UserID'],
        'Email'    => (string)$user['Email'],
        'FullName' => (string)$user['FullName'],
        'role'     => (string)$user['role'],
    ];
}

function auth_logout(): void
{
    auth_start_session();
    $_SESSION = [];
    session_destroy();
}

function is_logged_in(): bool
{
    auth_start_session();
    return isset($_SESSION['currentUser']);
}

/**
 * @return array<string, mixed>|null
 */
function auth_get_current_user(): array|null
{
    auth_start_session();
    return $_SESSION['currentUser'] ?? null;
}

function require_login(): void
{
    if (!is_logged_in()) {
        error_log('BE-AUTH-001 require_login: no session');
        json_error('Unauthenticated', 401);
    }
}

function require_role(string $role): void
{
    require_login();
    $current = auth_get_current_user();
    if (($current['role'] ?? null) !== $role) {
        error_log('BE-AUTH-002 require_role: expected ' . $role);
        json_error('Forbidden', 403);
    }
}
