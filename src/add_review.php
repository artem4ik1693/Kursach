<?php
// add_review.php
require 'db.php'; // Подключение к базе данных

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId = $_POST['userId'];
    $reviewText = $_POST['reviewText'];

    if (!empty($userId) && !empty($reviewText)) {
        try {
            $stmt = $conn->prepare("INSERT INTO reviews (user_id, review_text) VALUES (:user_id, :review_text)");
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':review_text', $reviewText);
            $stmt->execute();

            echo json_encode(['message' => 'Отзыв успешно добавлен!']);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Ошибка при добавлении отзыва: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['error' => 'Пожалуйста, заполните все поля.']);
    }
}
?>