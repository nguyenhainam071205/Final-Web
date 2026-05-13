<?php
declare(strict_types=1);

/**
 * Returns tours whose TourStatus = 'Available'.
 * When $category_id is 0, returns all available tours regardless of category.
 *
 * @return array<int, array<string, mixed>>
 */
function tour_get_list(PDO $pdo, int $category_id = 0): array
{
    if ($category_id > 0) {
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
            ':status'      => TOUR_STATUS_AVAILABLE,
            ':category_id' => $category_id,
        ]);
    } else {
        $stmt = $pdo->prepare(
            "SELECT TourID, Title, Vehicle, Timeline, DeparturePlace,
                    DepartureDate, Duration, CostPerPerson,
                    TourThumbnail, TourStatus, MaxParticipants, CategoryID
             FROM Tour
             WHERE TourStatus = :status
             ORDER BY DepartureDate ASC"
        );
        $stmt->execute([':status' => TOUR_STATUS_AVAILABLE]);
    }

    return $stmt->fetchAll();
}

/**
 * Returns a single tour with its images and category name.
 * Returns null if the tour does not exist.
 *
 * @return array<string, mixed>|null
 */
function tour_get_by_id(PDO $pdo, int $tour_id): array|null
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
    $tour = $stmt->fetch();
    if (!$tour) return null;

    $stmt2 = $pdo->prepare(
        "SELECT ImageID, Source FROM Tour_Image WHERE TourID = :id ORDER BY ImageID ASC"
    );
    $stmt2->execute([':id' => $tour_id]);
    $tour['images'] = $stmt2->fetchAll();

    return $tour;
}
