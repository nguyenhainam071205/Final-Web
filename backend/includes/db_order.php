<?php
declare(strict_types=1);

function order_create(
    PDO $pdo,
    string $client_name,
    string $client_phone,
    ?string $client_note,
    string $payment_method
): int {
    $payment_status = $payment_method === 'bank' ? 1 : 0;

    $stmt = $pdo->prepare(
        "INSERT INTO `order` (ClientName, ClientPhone, ClientNote, PaymentMethod, OrderDate, OrderStatus, PaymentStatus)
         VALUES (:cn, :cp, :note, :pm, NOW(), :status, :ps)"
    );
    $stmt->execute([
        ':cn'     => $client_name,
        ':cp'     => $client_phone,
        ':note'   => $client_note,
        ':pm'     => $payment_method,
        ':status' => 1,
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
 * @return array{OrderID:int, PaymentMethod:string, PaymentStatus:int, TotalPrice:float, ClientPhone:string}|null
 */
function order_get_for_payment(PDO $pdo, int $order_id): ?array
{
    $stmt = $pdo->prepare(
        "SELECT  o.OrderID, o.PaymentMethod, o.PaymentStatus, o.ClientPhone,
                 SUM(bt.Quantity * bt.PriceAtBooking) AS TotalPrice
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
        'ClientPhone'   => (string)$row['ClientPhone'],
    ];
}

function order_get_list_admin(PDO $pdo): array
{
    $sql = "
        SELECT  o.OrderID, o.PaymentMethod, o.OrderDate, o.OrderStatus, o.PaymentStatus,
                o.ClientName, o.ClientPhone, o.ClientNote,
                t.TourID, t.Title, t.TourThumbnail,
                bt.Quantity, bt.PriceAtBooking
        FROM    `order` o
        JOIN    bookedtour bt ON bt.OrderID = o.OrderID
        JOIN    tour t        ON t.TourID   = bt.TourID
        ORDER BY o.OrderDate DESC, o.OrderID DESC, t.TourID ASC
    ";
    $rows = $pdo->query($sql)->fetchAll();

    // [
    //     ["OrderID" => 5, "TourID" => 1, "Title" => "Tour Đà Nẵng",   "Quantity" => 2, "PriceAtBooking" => 1000],
    //     ["OrderID" => 5, "TourID" => 3, "Title" => "Tour Phú Quốc",  "Quantity" => 1, "PriceAtBooking" => 2000],
    //     ["OrderID" => 7, "TourID" => 2, "Title" => "Tour Sapa",      "Quantity" => 4, "PriceAtBooking" => 500]
    // ];

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
                'ClientName'    => (string)$r['ClientName'],
                'ClientPhone'   => (string)$r['ClientPhone'],
                'ClientNote'    => $r['ClientNote'],
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

    // 5 => [
    //     'OrderID' => 5,
    //     'PaymentMethod' => 'bank',
    //     'OrderDate' => 'fsadfasdf',
    //     'OrderStatus' => 1,
    //      ...
    //     'tours' => [
    //         0 => ['TourID' => 1, 'Title' => 'asdfasdfa', 'Quantity' => 2, 'PriceAtBooking' => 1000]
    //         1 => ['TourID' => 3, ...]
    //         ...
    //     ]
    // ],
    return array_values($orders);
}

function order_exists(PDO $pdo, int $order_id): bool
{
    $stmt = $pdo->prepare("SELECT 1 FROM `order` WHERE OrderID = :id LIMIT 1");
    $stmt->execute([':id' => $order_id]);
    return (bool)$stmt->fetchColumn();
}

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
    string $client_name,
    string $client_phone,
    ?string $client_note,
    string $payment_method,
    int $payment_status,
    int $order_status
): void {
    $stmt = $pdo->prepare(
        "UPDATE `order`
         SET    ClientName    = :cn,
                ClientPhone   = :cp,
                ClientNote    = :note,
                PaymentMethod = :pm,
                PaymentStatus = :ps,
                OrderStatus   = :os
         WHERE  OrderID = :id"
    );
    $stmt->execute([
        ':cn'   => $client_name,
        ':cp'   => $client_phone,
        ':note' => $client_note,
        ':pm'   => $payment_method,
        ':ps'   => $payment_status,
        ':os'   => $order_status,
        ':id'   => $order_id,
    ]);
}
