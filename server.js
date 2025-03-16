import express from 'express';
import mysql from 'mysql';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Подключение к базе данных MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'myuser',
  password: process.env.DB_PASSWORD || 'mypassword',
  database: process.env.DB_NAME || 'fitness_app',
  charset: 'utf8mb4',
});

db.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
  } else {
    console.log('Подключение к базе данных успешно!');
  }
});

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'src')));

// Маршрут для корневого пути
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Регистрация пользователя
app.post('/register', (req, res) => {
  const { email, password, username } = req.body;

  console.log('Полученные данные:', { email, password, username });

  const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkUserQuery, [email], (err, results) => {
    if (err) {
      console.error('Ошибка при проверке пользователя:', err);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует.' });
    }

    const insertUserQuery = 'INSERT INTO users (email, password, username) VALUES (?, ?, ?)';
    db.query(insertUserQuery, [email, password, username], (err, results) => {
      if (err) {
        console.error('Ошибка при регистрации пользователя:', err);
        return res.status(500).json({ message: 'Ошибка сервера' });
      }

      res.status(201).json({ message: 'Регистрация прошла успешно!' });
    });
  });
});

// Авторизация пользователя
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log('Получен запрос на авторизацию:', { email, password });

  const findUserQuery = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(findUserQuery, [email, password], (err, results) => {
    if (err) {
      console.error('Ошибка при поиске пользователя:', err);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Неверный email или пароль.' });
    }

    res.status(200).json({ message: 'Авторизация успешна!', user: results[0] });
  });
});

// Добавление отзыва
app.post('/reviews', (req, res) => {
  const { userId, reviewText } = req.body;

  console.log('Полученные данные для отзыва:', { userId, reviewText });

  const insertReviewQuery = 'INSERT INTO reviews (user_id, review_text, review_date) VALUES (?, ?, NOW())';
  db.query(insertReviewQuery, [userId, reviewText], (err, results) => {
    if (err) {
      console.error('Ошибка при добавлении отзыва:', err);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    res.status(201).json({ message: 'Отзыв успешно добавлен!' });
  });
});

// Получение всех отзывов
app.get('/reviews', (req, res) => {
  const getReviewsQuery = `
  SELECT reviews.id, reviews.review_text, reviews.review_date, users.username 
  FROM reviews 
  JOIN users ON reviews.user_id = users.id 
  ORDER BY reviews.review_date DESC
`;

  db.query(getReviewsQuery, (err, results) => {
    if (err) {
      console.error('Ошибка при получении отзывов:', err);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    res.status(200).json(results);
  });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});


// Добавление тренировки
app.post('/workouts', (req, res) => {
  const { userId, workoutName, workoutDate } = req.body;

  console.log('Полученные данные для тренировки:', { userId, workoutName, workoutDate });

  const insertWorkoutQuery = 'INSERT INTO workouts (user_id, workout_name, workout_date) VALUES (?, ?, ?)';
  db.query(insertWorkoutQuery, [userId, workoutName, workoutDate], (err, results) => {
    if (err) {
      console.error('Ошибка при добавлении тренировки:', err);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    res.status(201).json({ message: 'Тренировка успешно добавлена!' });
  });
});


// Получение всех тренировок для конкретного пользователя
app.get('/workouts', (req, res) => {
  const userId = req.query.userId; // Получаем userId из query-параметров

  if (!userId) {
    return res.status(400).json({ message: 'Необходимо указать userId.' });
  }

  const getWorkoutsQuery = `
      SELECT id, workout_name, workout_date
      FROM workouts
      WHERE user_id = ?
      ORDER BY workout_date DESC
  `;

  db.query(getWorkoutsQuery, [userId], (err, results) => {
    if (err) {
      console.error('Ошибка при получении тренировок:', err);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    res.status(200).json(results);
  });
});


// Добавление упражнения в тренировку
app.post('/workouts/exercises', (req, res) => {
  const { workoutId, exerciseName } = req.body;

  console.log('Полученные данные для упражнения:', { workoutId, exerciseName });

  const insertExerciseQuery = 'INSERT INTO workout_exercises (workout_id, exercise_name) VALUES (?, ?)';
  db.query(insertExerciseQuery, [workoutId, exerciseName], (err, results) => {
    if (err) {
      console.error('Ошибка при добавлении упражнения:', err);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    res.status(201).json({ message: 'Упражнение успешно добавлено!' });
  });
});

// Получение упражнений для конкретной тренировки
app.get('/workouts/:id/exercises', (req, res) => {
  const workoutId = req.params.id;

  const getExercisesQuery = `
    SELECT exercise_name 
    FROM workout_exercises 
    WHERE workout_id = ?
  `;

  db.query(getExercisesQuery, [workoutId], (err, results) => {
    if (err) {
      console.error('Ошибка при получении упражнений:', err);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    res.status(200).json(results);
  });
});


// Удаление тренировки
app.delete('/workouts/:id', (req, res) => {
  const workoutId = req.params.id;

  // Удаляем связанные упражнения
  const deleteExercisesQuery = 'DELETE FROM workout_exercises WHERE workout_id = ?';
  db.query(deleteExercisesQuery, [workoutId], (err, results) => {
    if (err) {
      console.error('Ошибка при удалении упражнений:', err);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    // Удаляем связанные записи о прогрессе
    const deleteProgressQuery = 'DELETE FROM workout_progress WHERE workout_id = ?';
    db.query(deleteProgressQuery, [workoutId], (err, results) => {
      if (err) {
        console.error('Ошибка при удалении прогресса:', err);
        return res.status(500).json({ message: 'Ошибка сервера' });
      }

      // Удаляем саму тренировку
      const deleteWorkoutQuery = 'DELETE FROM workouts WHERE id = ?';
      db.query(deleteWorkoutQuery, [workoutId], (err, results) => {
        if (err) {
          console.error('Ошибка при удалении тренировки:', err);
          return res.status(500).json({ message: 'Ошибка сервера' });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'Тренировка не найдена.' });
        }

        res.status(200).json({ message: 'Тренировка успешно удалена!' });
      });
    });
  });
});
// Добавление прогресса тренировки
// Добавление прогресса тренировки
app.post('/progress', (req, res) => {
  const { userId, workoutId, exerciseName, sets, reps, weight, date } = req.body;

  const insertProgressQuery = `
      INSERT INTO workout_progress (user_id, workout_id, exercise_name, sets, reps, weight, date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(insertProgressQuery, [userId, workoutId, exerciseName, sets, reps, weight, date], (err, results) => {
    if (err) {
      console.error('Ошибка при добавлении прогресса:', err);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    res.status(201).json({ message: 'Прогресс успешно добавлен!' });
  });
});

// Получение прогресса для пользователя
app.get('/progress', (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: 'Необходимо указать userId.' });
  }

  const getProgressQuery = `
      SELECT workout_progress.*, workouts.workout_name
      FROM workout_progress
               JOIN workouts ON workout_progress.workout_id = workouts.id
      WHERE workout_progress.user_id = ?
      ORDER BY workout_progress.date DESC
  `;

  db.query(getProgressQuery, [userId], (err, results) => {
    if (err) {
      console.error('Ошибка при получении прогресса:', err);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    res.status(200).json(results);
  });
});

// Удаление упражнений по workout_id
app.delete('/workouts/:id/exercises', (req, res) => {
  const workoutId = req.params.id;

  const deleteExercisesQuery = 'DELETE FROM workout_exercises WHERE workout_id = ?';
  db.query(deleteExercisesQuery, [workoutId], (err, results) => {
    if (err) {
      console.error('Ошибка при удалении упражнений:', err);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    res.status(200).json({ message: 'Упражнения успешно удалены!' });
  });
});

// Удаление прогресса по workout_id
app.delete('/workouts/:id/progress', (req, res) => {
  const workoutId = req.params.id;

  const deleteProgressQuery = 'DELETE FROM workout_progress WHERE workout_id = ?';
  db.query(deleteProgressQuery, [workoutId], (err, results) => {
    if (err) {
      console.error('Ошибка при удалении прогресса:', err);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    res.status(200).json({ message: 'Прогресс успешно удален!' });
  });
});