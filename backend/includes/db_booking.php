<?php
declare(strict_types=1);

/**
 * Inserts a single line-item into BookedTour. Snapshots the price at booking time.
 * Caller resolves CostPerPerson via tour_get_by_id() so this helper has no Tour dependency.
 *
 * Composite PK is (UserID, TourID, OrderID); a duplicate within the same order is impossible
 * because OrderID is freshly generated, so no upsert handling is needed.
 */
function booking_create(
    PDO $pdo,
    int $user_id,
    int $tour_id,
    int $order_id,
    int $quantity,
    float $price_at_booking
): void {
    $stmt = $pdo->prepare(
        "INSERT INTO bookedtour (UserID, TourID, OrderID, Quantity, PriceAtBooking)
         VALUES (:user_id, :tour_id, :order_id, :qty, :price)"
    );
    $stmt->execute([
        ':user_id'  => $user_id,
        ':tour_id'  => $tour_id,
        ':order_id' => $order_id,
        ':qty'      => $quantity,
        ':price'    => $price_at_booking,
    ]);
}

/**
 * Deletes every BookedTour row tied to a specific OrderID.
 */
function booking_delete_by_order(PDO $pdo, int $order_id): void
{
    $stmt = $pdo->prepare("DELETE FROM bookedtour WHERE OrderID = :id");
    $stmt->execute([':id' => $order_id]);
}

/**
 * Returns line-item rows for a single OrderID. Used to build ZaloPay's `item` JSON.
 *
 * @return array<int, array{TourID:int, Title:string, Quantity:int, PriceAtBooking:float}>
 */
function booking_get_by_order(PDO $pdo, int $order_id): array
{
    $stmt = $pdo->prepare(
        "SELECT  bt.TourID, t.Title, bt.Quantity, bt.PriceAtBooking
         FROM    bookedtour bt
         JOIN    tour t ON t.TourID = bt.TourID
         WHERE   bt.OrderID = :id"
    );
    $stmt->execute([':id' => $order_id]);
    $rows = $stmt->fetchAll();
    $items = [];
    foreach ($rows as $r) {
        $items[] = [
            'TourID'         => (int)$r['TourID'],
            'Title'          => (string)$r['Title'],
            'Quantity'       => (int)$r['Quantity'],
            'PriceAtBooking' => (float)$r['PriceAtBooking'],
        ];
    }
    return $items;
}
