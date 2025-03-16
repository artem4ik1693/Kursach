let progressChart = null;

// Функция для загрузки прогресса и отображения диаграммы
function loadProgress() {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

  if (!currentUser) {
    showNotification('Пожалуйста, войдите в систему, чтобы просмотреть прогресс.');
    return;
  }

  fetch(`http://localhost:3000/progress?userId=${currentUser.id}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((progress) => {
      const ctx = document.getElementById('progressChart').getContext('2d');

      // Группируем данные по дате
      const groupedData = progress.reduce((acc, item) => {
        const date = item.date;
        if (!acc[date]) {
          acc[date] = { totalSets: 0, totalReps: 0, totalWeight: 0 };
        }
        acc[date].totalSets += item.sets;
        acc[date].totalReps += item.reps;
        acc[date].totalWeight += item.weight || 0;
        return acc;
      }, {});

      const labels = Object.keys(groupedData);
      const setsData = labels.map(date => groupedData[date].totalSets);
      const repsData = labels.map(date => groupedData[date].totalReps);
      const weightData = labels.map(date => groupedData[date].totalWeight);

      if (progressChart) {
        progressChart.destroy();
      }

      progressChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Подходы',
              data: setsData,
              borderColor: 'rgba(75, 192, 192, 1)',
              fill: false,
            },
            {
              label: 'Повторения',
              data: repsData,
              borderColor: 'rgba(153, 102, 255, 1)',
              fill: false,
            },
            {
              label: 'Вес (кг)',
              data: weightData,
              borderColor: 'rgba(255, 159, 64, 1)',
              fill: false,
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    })
    .catch((error) => {
      console.error('Ошибка при загрузке прогресса:', error);
      showNotification('Ошибка при загрузке прогресса.');
    });
}

// Обработчик отправки формы
document.getElementById('progressForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

  if (!currentUser) {
    showNotification('Пожалуйста, войдите в систему, чтобы добавить прогресс.');
    return;
  }

  const workoutName = document.getElementById('workoutName').value;
  const exerciseName = document.getElementById('exerciseName').value;
  const sets = parseInt(document.getElementById('sets').value);
  const reps = parseInt(document.getElementById('reps').value);
  const weight = parseInt(document.getElementById('weight').value);
  const date = document.getElementById('date').value;

  fetch('http://localhost:3000/progress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: currentUser.id,
      workoutName: workoutName,
      exerciseName: exerciseName,
      sets: sets,
      reps: reps,
      weight: weight,
      date: date,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      showNotification('Прогресс успешно добавлен!');
      loadProgress(); // Обновляем диаграмму
    })
    .catch((error) => {
      console.error('Ошибка при добавлении прогресса:', error);
      showNotification('Ошибка при добавлении прогресса.');
    });
});

// Вызываем загрузку прогресса при загрузке страницы
loadProgress();