// Переключение между вкладками "Вход" и "Регистрация"
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authMessage = document.getElementById('authMessage');

loginTab.addEventListener('click', () => {
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  loginForm.style.display = 'block';
  registerForm.style.display = 'none';
  authMessage.textContent = '';
});

registerTab.addEventListener('click', () => {
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
  loginForm.style.display = 'none';
  registerForm.style.display = 'block';
  authMessage.textContent = '';
});

// Регистрация нового пользователя
registerForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('registerEmail').value;
  const username = document.getElementById('registerUsername').value; // Убедитесь, что это поле есть
  const password = document.getElementById('registerPassword').value;

  // Отправка данных на сервер
  fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, username }), // Убедитесь, что username передается
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === 'Регистрация прошла успешно!') {
        authMessage.textContent = data.message;
        registerForm.reset();
        window.location.href = 'index.html'; // Переход на главную страницу
      } else {
        authMessage.textContent = data.message;
      }
    })
    .catch((error) => {
      console.error('Ошибка:', error);
      authMessage.textContent = 'Ошибка при регистрации.';
    });
});

// Авторизация пользователя
loginForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  // Отправка данных на сервер
  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === 'Авторизация успешна!') {
        sessionStorage.setItem('currentUser', JSON.stringify(data.user));
        window.location.href = 'index.html'; // Переход на главную страницу
      } else {
        authMessage.textContent = data.message;
      }
    })
    .catch((error) => {
      console.error('Ошибка:', error);
      authMessage.textContent = 'Ошибка при авторизации.';
    });
});