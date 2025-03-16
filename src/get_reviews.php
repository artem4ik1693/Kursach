<?php
// get_reviews.php
require 'db.php'; // Подключение к базе данных

try {
    $stmt = $conn->query("SELECT reviews.id, users.username, reviews.review_text, reviews.created_at
                          FROM reviews
                          JOIN users ON reviews.user_id = users.id
                          ORDER BY reviews.created_at DESC");
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($reviews);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Ошибка при получении отзывов: ' . $e->getMessage()]);
}
?>