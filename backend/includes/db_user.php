<?php
declare(strict_types=1);

function user_find_by_email(PDO $pdo, string $email): array|null
{
    $stmt = $pdo->prepare(
        "SELECT UserID, FullName, DateOfBirth, Address, Email, Password,
                PhoneNumber, Status, role
         FROM User
         WHERE Email = :email
         LIMIT 1"
    );
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();
    return $user ?: null;
}

