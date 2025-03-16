console.log('Скрипт workout.js загружен');

let selectedExercise = null; // Переменная для хранения выбранного упражнения
let selectedWorkoutId = null; // Переменная для хранения ID выбранной тренировки

// Функция для отображения уведомлений
function showNotification(message, isError = false) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.padding = '10px 20px';
  notification.style.backgroundColor = isError ? '#ff4d4d' : '#4CAF50';
  notification.style.color = 'white';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '1000';
  notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  document.body.appendChild(notification);

  // Удаляем уведомление через 3 секунды
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Функция для открытия модального окна с выбором тренировки
function openWorkoutModal(exerciseName) {
  const modal = document.getElementById('workoutModal');
  const modalWorkoutsList = document.getElementById('modalWorkoutsList');
  modal.style.display = 'block';

  // Загружаем список тренировок
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  if (!currentUser) {
    showNotification('Пожалуйста, войдите в систему, чтобы добавить упражнение.', true);
    return;
  }

  fetch(`http://localhost:3000/workouts?userId=${currentUser.id}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((workouts) => {
      modalWorkoutsList.innerHTML = ''; // Очищаем список тренировок в модальном окне

      if (!workouts || workouts.length === 0) {
        modalWorkoutsList.innerHTML = '<p>У вас пока нет тренировок.</p>';
        return;
      }

      workouts.forEach((workout) => {
        const workoutDiv = document.createElement('div');
        workoutDiv.classList.add('workout-item');
        workoutDiv.textContent = workout.workout_name;

        workoutDiv.addEventListener('click', () => {
          addExerciseToWorkout(workout.id, exerciseName);
          modal.style.display = 'none'; // Закрываем модальное окно после выбора
        });

        modalWorkoutsList.appendChild(workoutDiv);
      });
    })
    .catch((error) => {
      console.error('Ошибка при загрузке тренировок:', error);
      showNotification('Не удалось загрузить тренировки.', true);
    });
}

// Функция для добавления упражнения в тренировку
function addExerciseToWorkout(workoutId, exerciseName) {
  fetch('http://localhost:3000/workouts/exercises', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workoutId: workoutId,
      exerciseName: exerciseName,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      showNotification('Упражнение успешно добавлено в тренировку!');
    })
    .catch((error) => {
      console.error('Ошибка при добавлении упражнения:', error);
      showNotification('Ошибка при добавлении упражнения.', true);
    });
}

// Закрытие модального окна при клике на крестик
document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('workoutModal').style.display = 'none';
});

// Закрытие модального окна при клике вне его области
window.addEventListener('click', (event) => {
  const modal = document.getElementById('workoutModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

// Функция загрузки тренировок
function loadWorkouts() {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

  if (!currentUser) {
    showNotification('Пожалуйста, войдите в систему, чтобы просмотреть тренировки.', true);
    window.location.href = 'login.html'; // Перенаправляем на страницу входа
    return;
  }

  fetch(`http://localhost:3000/workouts?userId=${currentUser.id}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((workouts) => {
      const workoutsList = document.getElementById('workoutsList');
      workoutsList.innerHTML = ''; // Очищаем список

      if (!workouts || workouts.length === 0) {
        workoutsList.innerHTML = '<p>У вас пока нет тренировок.</p>';
        return;
      }

      workouts.forEach((workout) => {
        const workoutDiv = document.createElement('div');
        workoutDiv.classList.add('workout-item');
        workoutDiv.dataset.workoutId = workout.id; // Добавляем ID тренировки в data-атрибут

        const workoutName = document.createElement('h4');
        workoutName.textContent = workout.workout_name;

        const workoutDate = document.createElement('p');
        workoutDate.textContent = `Дата: ${new Date(workout.workout_date).toLocaleDateString()}`;

        // Кнопка завершения тренировки
        const completeButton = document.createElement('button');
        completeButton.textContent = 'Завершить тренировку';
        completeButton.classList.add('complete-workout-button');
        completeButton.addEventListener('click', (e) => {
          e.stopPropagation(); // Останавливаем всплытие события, чтобы не сработал клик на тренировку
          completeWorkout(workout.id);
        });

        workoutDiv.appendChild(workoutName);
        workoutDiv.appendChild(workoutDate);
        workoutDiv.appendChild(completeButton);
        workoutsList.appendChild(workoutDiv);

        // Добавляем обработчик клика на тренировку
        workoutDiv.addEventListener('click', () => {
          selectedWorkoutId = workout.id; // Сохраняем ID выбранной тренировки
          loadExercisesForWorkout(workout.id); // Загружаем упражнения для выбранной тренировки
        });
      });
    })
    .catch((error) => {
      console.error('Ошибка при загрузке тренировок:', error);
      showNotification('Не удалось загрузить тренировки.', true);
    });
}

// Функция завершения тренировки
function completeWorkout(workoutId) {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

  if (!currentUser) {
    showNotification('Пожалуйста, войдите в систему, чтобы завершить тренировку.', true);
    return;
  }

  // Удаляем связанные упражнения
  fetch(`http://localhost:3000/workouts/${workoutId}/exercises`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log('Упражнения удалены:', data.message);

      // Удаляем связанный прогресс
      return fetch(`http://localhost:3000/workouts/${workoutId}/progress`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log('Прогресс удален:', data.message);

      // Удаляем саму тренировку
      return fetch(`http://localhost:3000/workouts/${workoutId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.message === 'Тренировка успешно удалена!') {
        showNotification('Тренировка завершена и удалена!');
        loadWorkouts(); // Обновляем список тренировок
        document.getElementById('workoutExercisesSection').style.display = 'none'; // Скрываем секцию упражнений
        document.getElementById('completeWorkoutButton').style.display = 'none'; // Скрываем кнопку завершения
      } else {
        showNotification('Ошибка при завершении тренировки.', true);
      }
    })
    .catch((error) => {
      console.error('Ошибка при завершении тренировки:', error);
      showNotification('Ошибка при завершении тренировки.', true);
    });
}

// Обработчик для кнопки "Завершить тренировку"
document.getElementById('completeWorkoutButton').addEventListener('click', () => {
  if (selectedWorkoutId) {
    completeWorkout(selectedWorkoutId);
  } else {
    showNotification('Тренировка не выбрана.', true);
  }
});

// Вызываем загрузку тренировок при загрузке страницы
loadWorkouts();

// Получаем хэш из URL (например, "#chest")
const hash = window.location.hash;

// Если хэш есть, прокручиваем страницу к соответствующему разделу
if (hash) {
  const targetSection = document.querySelector(hash);
  if (targetSection) {
    targetSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Функция для сохранения прогресса упражнения
function saveExerciseProgress(exerciseName, sets, reps) {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

  if (!currentUser) {
    showNotification('Пожалуйста, войдите в систему, чтобы сохранить прогресс.', true);
    return;
  }

  fetch('http://localhost:3000/progress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: currentUser.id,
      workoutId: selectedWorkoutId,
      exerciseName: exerciseName,
      sets: sets,
      reps: reps,
      date: new Date().toISOString().split('T')[0], // Текущая дата в формате YYYY-MM-DD
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      showNotification('Прогресс успешно сохранен!');
    })
    .catch((error) => {
      console.error('Ошибка при сохранении прогресса:', error);
      showNotification('Ошибка при сохранении прогресса.', true);
    });
}

// Добавляем кнопку для сохранения прогресса в каждом упражнении
function addProgressButton(exerciseName) {
  const progressForm = document.createElement('div');
  progressForm.innerHTML = `
    <label for="sets">Подходы:</label>
    <input type="number" id="sets" required>
    <label for="reps">Повторения:</label>
    <input type="number" id="reps" required>
    <button onclick="saveExerciseProgress('${exerciseName}', document.getElementById('sets').value, document.getElementById('reps').value)">Сохранить прогресс</button>
  `;
  return progressForm;
}

// Модифицируем функцию для отображения упражнений
function loadExercisesForWorkout(workoutId) {
  fetch(`http://localhost:3000/workouts/${workoutId}/exercises`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((exercises) => {
      const workoutExercisesList = document.getElementById('workoutExercisesList');
      workoutExercisesList.innerHTML = ''; // Очищаем список

      exercises.forEach((exercise) => {
        const exerciseDiv = document.createElement('div');
        exerciseDiv.classList.add('exercise-item');

        const exerciseName = document.createElement('p');
        exerciseName.textContent = exercise.exercise_name;

        const progressForm = addProgressButton(exercise.exercise_name);

        exerciseDiv.appendChild(exerciseName);
        exerciseDiv.appendChild(progressForm);
        workoutExercisesList.appendChild(exerciseDiv);
      });

      document.getElementById('workoutExercisesSection').style.display = 'block';
    })
    .catch((error) => {
      console.error('Ошибка при загрузке упражнений:', error);
      showNotification('Не удалось загрузить упражнения.', true);
    });
}

// Обработчик для кнопки "Добавить тренировку"
document.getElementById('addWorkoutButton').addEventListener('click', () => {
  const addWorkoutForm = document.getElementById('addWorkoutForm');
  addWorkoutForm.style.display = 'block'; // Показываем форму
});

// Обработчик для кнопки "Отмена"
document.getElementById('cancelWorkoutButton').addEventListener('click', () => {
  const addWorkoutForm = document.getElementById('addWorkoutForm');
  addWorkoutForm.style.display = 'none'; // Скрываем форму
});

// Обработчик для кнопки "Сохранить"
document.getElementById('saveWorkoutButton').addEventListener('click', () => {
  const workoutName = document.getElementById('workoutNameInput').value;
  const workoutDate = document.getElementById('workoutDateInput').value;

  if (!workoutName || !workoutDate) {
    showNotification('Пожалуйста, заполните все поля.', true);
    return;
  }

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

  if (!currentUser) {
    showNotification('Пожалуйста, войдите в систему, чтобы добавить тренировку.', true);
    return;
  }

  // Отправляем запрос на сервер для добавления тренировки
  fetch('http://localhost:3000/workouts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: currentUser.id,
      workoutName: workoutName,
      workoutDate: workoutDate,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      showNotification('Тренировка успешно добавлена!');
      document.getElementById('addWorkoutForm').style.display = 'none'; // Скрываем форму
      loadWorkouts(); // Обновляем список тренировок
    })
    .catch((error) => {
      console.error('Ошибка при добавлении тренировки:', error);
      showNotification('Ошибка при добавлении тренировки.', true);
    });
});

