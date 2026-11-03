// Инициализация MAX WebApp (если открыто внутри MAX)
const MAX = window.Max || null;
if (MAX?.WebApp) {
    MAX.WebApp.ready();
    MAX.WebApp.expand();
    if (MAX.WebApp.BackButton) {
        MAX.WebApp.BackButton.onClick(() => goBack());
    }
}

// === Роутинг ===
const pages = {
    mainMenu:     { el: document.getElementById('mainMenu'),     title: 'Детский сад' },
    schedulePage: { el: document.getElementById('schedulePage'), title: 'График работы' },
    contactsPage: { el: document.getElementById('contactsPage'), title: 'Контакты' },
    addressPage:  { el: document.getElementById('addressPage'),  title: 'Адрес' },
    gamePage:     { el: document.getElementById('gamePage'),     title: 'Игра для детей' }
};

let history = ['mainMenu'];

function showPage(id, pushHistory = true) {
    Object.values(pages).forEach(p => p.el.classList.remove('active'));
    if (!pages[id]) return;
    pages[id].el.classList.add('active');
    document.getElementById('pageTitle').textContent = pages[id].title;

    const backBtn = document.getElementById('backBtn');
    if (id === 'mainMenu') {
        backBtn.style.display = 'none';
        if (MAX?.WebApp?.BackButton) MAX.WebApp.BackButton.hide();
    } else {
        backBtn.style.display = 'flex';
        if (MAX?.WebApp?.BackButton) MAX.WebApp.BackButton.show();
    }

    window.scrollTo({ top: 0 });

    if (pushHistory && history[history.length - 1] !== id) {
        history.push(id);
    }

    // Останавливаем игру при уходе со страницы
    if (id !== 'gamePage') stopGame();
}

function goBack() {
    if (history.length > 1) {
        history.pop();
        showPage(history[history.length - 1], false);
    } else {
        showPage('mainMenu', false);
    }
}

document.getElementById('backBtn').addEventListener('click', goBack);

// === Главное меню: клики ===
document.querySelectorAll('.menu-card[data-route]').forEach(btn => {
    btn.addEventListener('click', () => {
        const map = {
            schedule: 'schedulePage',
            contacts: 'contactsPage',
            address:  'addressPage',
            game:     'gamePage'
        };
        if (map[btn.dataset.route]) showPage(map[btn.dataset.route]);
    });
});

// === Заполнение данных ===
function initData() {
    // Заголовок на главной
    document.getElementById('heroName').innerHTML =
        DB.kindergarten.name.replace('«', '<br>«');

    // === График работы ===
    const scheduleContainer = document.getElementById('scheduleList');
    scheduleContainer.innerHTML = '';

    // Создаём карточку-обёртку
    const scheduleCard = document.createElement('div');
    scheduleCard.className = 'card';
    scheduleCard.style.flexDirection = 'column';
    scheduleCard.style.alignItems = 'stretch';

    // Наполняем карточку строками
    DB.schedule.forEach(s => {
        const row = document.createElement('div');
        row.className = 'schedule-row' + (s.closed ? ' closed' : '');
        row.innerHTML = `<span class="day">${s.day}</span><span class="time">${s.time}</span>`;
        scheduleCard.appendChild(row);
    });

    // Кладём карточку в контейнер (а не наоборот)
    scheduleContainer.appendChild(scheduleCard);

    // === Контакты ===
    const contactsContainer = document.getElementById('contactsList');
    contactsContainer.innerHTML = '';

    const contactsCard = document.createElement('div');
    contactsCard.className = 'card';
    contactsCard.style.flexDirection = 'column';
    contactsCard.style.alignItems = 'stretch';

    DB.contacts.forEach(c => {
        const item = document.createElement('div');
        item.className = 'contact-item';

        let valueHtml;
        if (c.type === 'tel') {
            valueHtml = `<a href="tel:${c.value.replace(/[^+\d]/g, '')}">${c.value}</a>`;
        } else if (c.type === 'mail') {
            valueHtml = `<a href="mailto:${c.value}">${c.value}</a>`;
        } else if (c.type === 'max') {
            valueHtml = `<a href="${c.url}" target="_blank">${c.value}</a>`;
        } else {
            valueHtml = `<span>${c.value}</span>`;
        }

        item.innerHTML = `
            <div class="contact-icon">${c.icon}</div>
            <div class="contact-info">
                <strong>${c.label}</strong>
                ${valueHtml}
            </div>`;
        contactsCard.appendChild(item);
    });

    contactsContainer.appendChild(contactsCard);

    // === Адрес ===
    document.getElementById('addressText').textContent = DB.address.text;
    document.getElementById('transportText').textContent = DB.address.transport;

    document.getElementById('openMapBtn').addEventListener('click', () => {
        window.open(DB.address.mapUrl, '_blank');
    });
}

// === Игра «Лови солнышки» ===
let gameState = {
    score: 0,
    timeLeft: 30,
    running: false,
    spawnTimer: null,
    countdownTimer: null,
    cloudTimer: null
};

const gameField  = document.getElementById('gameField');
const scoreEl    = document.getElementById('score');
const timerEl    = document.getElementById('timer');
const resultEl   = document.getElementById('gameResult');
const startBtn   = document.getElementById('startGameBtn');
const restartBtn = document.getElementById('restartGameBtn');

function startGame() {
    if (gameState.running) return;
    stopGame();
    gameState = {
        score: 0,
        timeLeft: 30,
        running: true,
        spawnTimer: null,
        countdownTimer: null,
        cloudTimer: null
    };
    scoreEl.textContent = '0';
    timerEl.textContent = '30';
    resultEl.style.display = 'none';
    startBtn.style.display = 'none';
    restartBtn.style.display = 'none';

    // Спавн солнышек каждые ~700 мс
    gameState.spawnTimer = setInterval(spawnSun, 700);

    // Облака для атмосферы
    spawnCloud();
    gameState.cloudTimer = setInterval(spawnCloud, 3000);

    // Обратный отсчёт
    gameState.countdownTimer = setInterval(() => {
        gameState.timeLeft--;
        timerEl.textContent = gameState.timeLeft;
        if (gameState.timeLeft <= 0) endGame();
    }, 1000);
}

function stopGame() {
    if (!gameState.running) return;
    clearInterval(gameState.spawnTimer);
    clearInterval(gameState.countdownTimer);
    clearInterval(gameState.cloudTimer);
    gameState.running = false;
    gameField.querySelectorAll('.sun').forEach(el => el.remove());
    gameField.querySelectorAll('.cloud').forEach(el => el.remove());
    gameField.querySelectorAll('.score-pop').forEach(el => el.remove());
}

function endGame() {
    stopGame();
    const score = gameState.score;
    let emoji, title, subtitle;

    if (score >= 25) {
        emoji = '🏆'; title = 'Выдающийся ловец солнышек!';
        subtitle = 'Невероятный результат! Вы настоящий чемпион!';
    } else if (score >= 15) {
        emoji = '🌟'; title = 'Отличный результат!';
        subtitle = 'Вы очень ловкие! Попробуйте побить свой рекорд.';
    } else if (score >= 8) {
        emoji = '😊'; title = 'Хорошо!';
        subtitle = 'Неплохо получилось. Сыграйте ещё раз и улучшите результат!';
    } else {
        emoji = '🌱'; title = 'Только учимся!';
        subtitle = 'Не расстраивайтесь, попробуйте ещё раз!';
    }

    resultEl.innerHTML = `
        <div class="result-emoji">${emoji}</div>
        <h3>${title}</h3>
        <p>Ваш результат:</p>
        <p class="final-score">${score} ⭐</p>
        <p style="margin-top:8px;">${subtitle}</p>
    `;
    resultEl.style.display = 'block';
    restartBtn.style.display = 'inline-block';
    startBtn.style.display = 'none';
}

function spawnSun() {
    if (!gameState.running) return;
    const sun = document.createElement('div');
    sun.className = 'sun';
    sun.textContent = '☀️';

    const maxX = gameField.clientWidth  - 52;
    const maxY = gameField.clientHeight - 52;
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    sun.style.left = x + 'px';
    sun.style.top  = y + 'px';

    sun.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!gameState.running) return;
        gameState.score++;
        scoreEl.textContent = gameState.score;
        showScorePop(x + 16, y);

        // Небольшая анимация исчезновения
        sun.style.transition = 'transform .2s, opacity .2s';
        sun.style.transform = 'scale(1.4)';
        sun.style.opacity = '0';
        setTimeout(() => sun.remove(), 200);
    });

    gameField.appendChild(sun);

    // Солнышко живёт ~2 секунды
    setTimeout(() => {
        if (sun.parentNode) {
            sun.style.transition = 'opacity .3s';
            sun.style.opacity = '0';
            setTimeout(() => sun.remove(), 300);
        }
    }, 2000);
}

function showScorePop(x, y) {
    const pop = document.createElement('div');
    pop.className = 'score-pop';
    pop.textContent = '+1';
    pop.style.left = x + 'px';
    pop.style.top  = y + 'px';
    gameField.appendChild(pop);
    setTimeout(() => pop.remove(), 700);
}

function spawnCloud() {
    if (!gameField) return;
    const cloud = document.createElement('div');
    cloud.className = 'cloud';
    cloud.textContent = '☁️';
    cloud.style.top = Math.random() * 80 + 'px';
    cloud.style.left = '-80px';
    const duration = 12 + Math.random() * 8;
    cloud.style.animationDuration = duration + 's';
    gameField.appendChild(cloud);
    setTimeout(() => cloud.remove(), duration * 1000);
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
    resultEl.style.display = 'none';
    startGame();
});

// === Инициализация ===
initData();
showPage('mainMenu', false);