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
