<?php
declare(strict_types=1);

function tour_get_list(PDO $pdo, int $category_id): array
{
    $stmt = $pdo->prepare(
        "SELECT TourID, Title, Vehicle, Timeline, DeparturePlace,
                DepartureDate, Duration, CostPerPerson,
                TourThumbnail, TourStatus, MaxParticipants, CategoryID
            FROM Tour
            WHERE TourStatus = :status
            AND CategoryID = :category_id
            ORDER BY DepartureDate ASC"
    );
    $stmt->execute([
        ':status'      => 'Available',
        ':category_id' => $category_id,
    ]);

    return $stmt->fetchAll();
}

/**
 * Returns a single tour with its images and category name.
 * Returns null if the tour does not exist.
 *
 * @return array<string, mixed>|null
 */
function tour_get_by_id(PDO $pdo, int $tour_id): array
{
    $stmt = $pdo->prepare(
        "SELECT t.TourID, t.Title, t.Vehicle, t.Timeline, t.TourSchedule, t.TourDescription,
                t.DeparturePlace, t.DepartureDate, t.Duration,
                t.CostPerPerson, t.TourThumbnail, t.TourStatus,
                t.MaxParticipants, t.CategoryID, c.Name AS CategoryName
         FROM Tour t
         LEFT JOIN Category c ON t.CategoryID = c.CategoryID
         WHERE t.TourID = :id"
    );
    $stmt->execute([':id' => $tour_id]);
    return $stmt->fetch();
}
