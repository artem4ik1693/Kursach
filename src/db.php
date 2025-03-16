<?php
// db.php
$host = 'localhost'; // Хост базы данных
$dbname = 'fitness_app'; // Имя базы данных
$username = 'root'; // Имя пользователя базы данных (по умолчанию root)
$password = ''; // Пароль базы данных (по умолчанию пустой)

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Ошибка подключения к базе данных: " . $e->getMessage());
}
?>