<?php
declare(strict_types=1);

/**
 * Returns the user row matching $email, or null if no row matches.
 * Includes the bcrypt-hashed password so callers can verify with password_verify().
 *
 * @return array<string, mixed>|null
 */
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

/**
 * Updates the FullName / PhoneNumber on a User row. Used by admin order edit.
 */
function user_update_contact(PDO $pdo, int $user_id, string $full_name, ?string $phone_number): void
{
    $stmt = $pdo->prepare(
        "UPDATE User
         SET    FullName    = :fn,
                PhoneNumber = :phone
         WHERE  UserID = :id"
    );
    $stmt->execute([
        ':fn'    => $full_name,
        ':phone' => $phone_number,
        ':id'    => $user_id,
    ]);
}
