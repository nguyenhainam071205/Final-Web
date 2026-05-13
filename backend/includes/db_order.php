<?php
declare(strict_types=1);

/**
 * Inserts a row into `order` and returns the new OrderID.
 * Caller must wrap in a transaction together with booking_create() rows.
 *
 * PaymentStatus initial value:
 *   bank    → 1 (manual transfer, optimistic)
 *   zalopay → 0 (waiting for ZaloPay callback to flip to 1)
 *   cash    → 0
 */
function order_create(PDO $pdo, string $payment_method, ?string $note): int
{
    $payment_status = $payment_method === 'bank' ? 1 : 0;

    $stmt = $pdo->prepare(
        "INSERT INTO `order` (PaymentMethod, OrderDate, OrderStatus, Note, PaymentStatus)
         VALUES (:pm, NOW(), :status, :note, :ps)"
    );
    $stmt->execute([
        ':pm'     => $payment_method,
        ':status' => ORDER_STATUS_PENDING,
        ':note'   => $note,
        ':ps'     => $payment_status,
    ]);
    return (int)$pdo->lastInsertId();
}

/**
 * Idempotently flips Order.PaymentStatus from 0 → 1. Returns true if a row was changed.
 */
function order_mark_paid_by_id(PDO $pdo, int $order_id): bool
{
    $stmt = $pdo->prepare(
        "UPDATE `order` SET PaymentStatus = 1
         WHERE OrderID = :id AND PaymentStatus = 0"
    );
    $stmt->execute([':id' => $order_id]);
    return $stmt->rowCount() > 0;
}

/**
 * Returns OrderID + PaymentMethod + PaymentStatus + total price
 * (sum of Quantity * PriceAtBooking) for one order, or null if missing.
 *
 * @return array{OrderID:int, PaymentMethod:string, PaymentStatus:int, TotalPrice:float, UserID:int}|null
 */
function order_get_for_payment(PDO $pdo, int $order_id): ?array
{
    $stmt = $pdo->prepare(
        "SELECT  o.OrderID, o.PaymentMethod, o.PaymentStatus,
                 SUM(bt.Quantity * bt.PriceAtBooking) AS TotalPrice,
                 MIN(bt.UserID) AS UserID
         FROM    `order` o
         JOIN    bookedtour bt ON bt.OrderID = o.OrderID
         WHERE   o.OrderID = :id
         GROUP BY o.OrderID"
    );
    $stmt->execute([':id' => $order_id]);
    $row = $stmt->fetch();
    if (!$row) return null;
    return [
        'OrderID'       => (int)$row['OrderID'],
        'PaymentMethod' => (string)$row['PaymentMethod'],
        'PaymentStatus' => (int)$row['PaymentStatus'],
        'TotalPrice'    => (float)$row['TotalPrice'],
        'UserID'        => (int)$row['UserID'],
    ];
}

/**
 * Returns all orders with aggregated tour list and customer info,
 * ordered by OrderDate DESC. Used by admin order-management.
 *
 * Each row shape:
 * {
 *   OrderID, PaymentMethod, OrderDate, OrderStatus, Note,
 *   UserID, FullName, PhoneNumber, Email,
 *   TotalPrice,            // sum(Quantity * PriceAtBooking)
 *   tours: [{ TourID, Title, TourThumbnail, Quantity, PriceAtBooking }, ...]
 * }
 *
 * @return array<int, array<string, mixed>>
 */
function order_get_list_admin(PDO $pdo): array
{
    $sql = "
        SELECT  o.OrderID, o.PaymentMethod, o.OrderDate, o.OrderStatus, o.Note,
                o.PaymentStatus,
                u.UserID, u.FullName, u.PhoneNumber, u.Email,
                t.TourID, t.Title, t.TourThumbnail,
                bt.Quantity, bt.PriceAtBooking
        FROM    `order` o
        JOIN    bookedtour bt ON bt.OrderID = o.OrderID
        JOIN    user u        ON u.UserID   = bt.UserID
        JOIN    tour t        ON t.TourID   = bt.TourID
        ORDER BY o.OrderDate DESC, o.OrderID DESC, t.TourID ASC
    ";
    $rows = $pdo->query($sql)->fetchAll();

    $orders = [];
    foreach ($rows as $r) {
        $oid = (int)$r['OrderID'];
        if (!isset($orders[$oid])) {
            $orders[$oid] = [
                'OrderID'       => $oid,
                'PaymentMethod' => (string)$r['PaymentMethod'],
                'OrderDate'     => (string)$r['OrderDate'],
                'OrderStatus'   => (int)$r['OrderStatus'],
                'PaymentStatus' => (int)$r['PaymentStatus'],
                'Note'          => $r['Note'],
                'UserID'        => (int)$r['UserID'],
                'FullName'      => (string)$r['FullName'],
                'PhoneNumber'   => $r['PhoneNumber'],
                'Email'         => $r['Email'],
                'TotalPrice'    => 0.0,
                'tours'         => [],
            ];
        }
        $line_total = (float)$r['PriceAtBooking'] * (int)$r['Quantity'];
        $orders[$oid]['TotalPrice'] += $line_total;
        $orders[$oid]['tours'][] = [
            'TourID'         => (int)$r['TourID'],
            'Title'          => (string)$r['Title'],
            'TourThumbnail'  => $r['TourThumbnail'],
            'Quantity'       => (int)$r['Quantity'],
            'PriceAtBooking' => (float)$r['PriceAtBooking'],
        ];
    }
    return array_values($orders);
}

function order_exists(PDO $pdo, int $order_id): bool
{
    $stmt = $pdo->prepare("SELECT 1 FROM `order` WHERE OrderID = :id LIMIT 1");
    $stmt->execute([':id' => $order_id]);
    return (bool)$stmt->fetchColumn();
}

/**
 * Deletes the Order row. Caller must delete BookedTour rows first (FK constraint).
 */
function order_delete(PDO $pdo, int $order_id): void
{
    $stmt = $pdo->prepare("DELETE FROM `order` WHERE OrderID = :id");
    $stmt->execute([':id' => $order_id]);
}

/**
 * Updates editable fields on an existing order. Caller must verify existence first.
 */
function order_update_admin(
    PDO $pdo,
    int $order_id,
    string $payment_method,
    int $payment_status,
    int $order_status,
    ?string $note
): void {
    $stmt = $pdo->prepare(
        "UPDATE `order`
         SET    PaymentMethod = :pm,
                PaymentStatus = :ps,
                OrderStatus   = :os,
                Note          = :note
         WHERE  OrderID = :id"
    );
    $stmt->execute([
        ':pm'   => $payment_method,
        ':ps'   => $payment_status,
        ':os'   => $order_status,
        ':note' => $note,
        ':id'   => $order_id,
    ]);
}
