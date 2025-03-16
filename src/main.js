console.log('Скрипт main.js загружен');

// Обработка формы отзывов
const reviewForm = document.getElementById('reviewForm');
const reviewsContainer = document.querySelector('.reviews-container');
const workoutDetails = document.getElementById('workoutDetails');

if (!reviewForm) console.error('Элемент #reviewForm не найден');
if (!reviewsContainer) console.error('Элемент .reviews-container не найден');
if (!workoutDetails) console.error('Элемент #workoutDetails не найден');

// Функция загрузки отзывов с сервера
function loadReviews() {
  console.log('Вызываем loadReviews()');
  fetch('http://localhost:3000/reviews')
    .then((response) => {
      console.log('Ответ сервера:', response.status, response.statusText);
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((reviews) => {
      console.log('Полученные отзывы:', reviews);
      reviewsContainer.innerHTML = ''; // Очищаем контейнер

      if (!reviews || reviews.length === 0) {
        reviewsContainer.innerHTML = '<p>Пока нет отзывов.</p>';
        return;
      }

      reviews.forEach((review) => {
        const reviewDiv = document.createElement('div');
        reviewDiv.classList.add('review');

        const reviewTextElement = document.createElement('p');
        reviewTextElement.classList.add('review-text');
        reviewTextElement.textContent = `"${review.review_text}"`;

        const reviewAuthorElement = document.createElement('p');
        reviewAuthorElement.classList.add('review-author');
        reviewAuthorElement.textContent = `- ${review.username} (${new Date(review.review_date).toLocaleDateString()})`;

        reviewDiv.appendChild(reviewTextElement);
        reviewDiv.appendChild(reviewAuthorElement);

        reviewsContainer.appendChild(reviewDiv);
      });
    })
    .catch((error) => {
      console.error('Ошибка при загрузке отзывов:', error);
      reviewsContainer.innerHTML = '<p>Не удалось загрузить отзывы.</p>';
    });
}

// Обработчик отправки формы
if (reviewForm) {
  reviewForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const reviewText = document.getElementById('reviewText').value;
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

    if (!currentUser) {
      alert('Пожалуйста, войдите в систему, чтобы оставить отзыв.');
      return;
    }

    console.log('Отправляемые данные:', { userId: currentUser.id, reviewText });

    fetch('http://localhost:3000/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: currentUser.id, reviewText }),
    })
      .then((response) => {
        console.log('Ответ на POST:', response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Ответ сервера на POST:', data);
        if (data.message === 'Отзыв успешно добавлен!') {
          reviewForm.reset();
          loadReviews(); // Обновляем список отзывов
        } else {
          alert('Ошибка при добавлении отзыва.');
        }
      })
      .catch((error) => {
        console.error('Ошибка при отправке отзыва:', error);
        alert('Ошибка при добавлении отзыва.');
      });
  });
}

// Данные для готовых тренировок
const workouts = {
  chest: {
    title: 'Грудь и трицепсы',
    exercises: [
      'Отжимания от пола - 3 подхода по 15 повторений',
      'Алмазные отжимания - 3 подхода по 10 повторений',
      'Разведения рук с гантелями - 3 подхода по 12 повторений',
    ],
  },
  legs: {
    title: 'Ноги и ягодицы',
    exercises: [
      'Приседания с собственным весом - 4 подхода по 20 повторений',
      'Выпады вперёд - 3 подхода по 12 повторений на каждую ногу',
      'Ягодичный мостик - 3 подхода по 15 повторений',
    ],
  },
  shoulders: {
    title: 'Плечи и корпус',
    exercises: [
      'Подъём рук с гантелями в стороны - 3 подхода по 12 повторений',
      'Планка с подъёмом ног - 3 подхода по 30 секунд',
      'Жим над головой с бутылками воды - 3 подхода по 10 повторений',
    ],
  },
  abs: {
    title: 'Пресс',
    exercises: [
      'Скручивания - 3 подхода по 20 повторений',
      'Подъём ног лёжа - 3 подхода по 15 повторений',
      'Планка - 3 подхода по 40 секунд',
    ],
  },
  fullbody: {
    title: 'Всё тело',
    exercises: [
      'Бёрпи - 3 подхода по 10 повторений',
      'Приседания с прыжком - 3 подхода по 15 повторений',
      'Отжимания - 3 подхода по 12 повторений',
      'Планка - 3 подхода по 30 секунд',
    ],
  },
};

// Функция отображения тренировки
function showWorkout(type) {
  console.log('Выбрана тренировка:', type);
  const workout = workouts[type];

  if (!workout) {
    workoutDetails.innerHTML = '<p>Тренировка не найдена.</p>';
    return;
  }

  // Формируем HTML для тренировки
  workoutDetails.innerHTML = `
    <h2>${workout.title}</h2>
    <ul>
      ${workout.exercises.map((exercise) => `<li>${exercise}</li>`).join('')}
    </ul>
  `;
}

// Вызываем загрузку отзывов сразу
console.log('Пытаемся загрузить отзывы сразу...');
loadReviews();


// Функция добавления тренировки
function addWorkout() {
  const workoutName = document.getElementById('workoutName').value;
  const workoutDate = document.getElementById('workoutDate').value;
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

  if (!currentUser) {
    showNotification('Пожалуйста, войдите в систему, чтобы добавить тренировку.');
    return;
  }

  console.log('Отправляемые данные:', {
    userId: currentUser.id,
    workoutName,
    workoutDate
  });

  fetch('http://localhost:3000/workouts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId: currentUser.id, workoutName, workoutDate }),
  })
    .then((response) => {
      console.log('Ответ на POST:', response.status, response.statusText);
      if (!response.ok) {
        return response.text().then(text => { throw new Error(text) });
      }
      return response.json();
    })
    .then((data) => {
      console.log('Ответ сервера на POST:', data);
      if (data.message === 'Тренировка успешно добавлена!') {
        showNotification('Тренировка успешно добавлена!'); // Показываем уведомление
        document.getElementById('workoutName').value = ''; // Очищаем поле ввода
        document.getElementById('workoutDate').value = ''; // Очищаем поле ввода
      } else {
        showNotification('Ошибка при добавлении тренировки.'); // Показываем уведомление
      }
    })
    .catch((error) => {
      console.error('Ошибка при отправке тренировки:', error);
      showNotification('Ошибка при добавлении тренировки.'); // Показываем уведомление
    });
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = 'green';
  notification.style.color = 'white';
  notification.style.padding = '10px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '1000';
  document.body.appendChild(notification);

  // Убираем уведомление через 3 секунды
  setTimeout(() => {
    notification.remove();
  }, 3000);
}