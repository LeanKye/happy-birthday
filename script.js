/* ========================================
   МОБИЛЬНЫЙ САЙТ-ПОЗДРАВЛЕНИЕ
   JavaScript логика
   ======================================== */

// ========================================
// КОНФИГУРАЦИЯ
// ========================================

/**
 * ЗАГЛУШКА: Правильный ответ для квеста
 * Замените на свои 3 слова-ключа
 * Формат: слова через пробел, нижний регистр
 */
const CORRECT_ANSWER = 'радость улыбка победа';

/**
 * ЗАГЛУШКА: Путь к звуку уведомления
 * Раскомментируйте и укажите путь к вашему аудио файлу
 */
// const NOTIFICATION_SOUND_PATH = 'assets/audio/notification.mp3';
const NOTIFICATION_SOUND_PATH = null; // Пока отключено

// ========================================
// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ========================================

let soundEnabled = false;
let notificationSound = null;
let fullPageInstance = null;

// ========================================
// ИНИЦИАЛИЗАЦИЯ
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initFullPage();
    initSoundToggle();
    initQuiz();
    initBackToTop();

    // Загружаем звук уведомления если путь указан
    if (NOTIFICATION_SOUND_PATH) {
        notificationSound = new Audio(NOTIFICATION_SOUND_PATH);
        notificationSound.preload = 'auto';
    }
});

// ========================================
// FULLPAGE.JS ИНИЦИАЛИЗАЦИЯ
// ========================================

function initFullPage() {
    fullPageInstance = new fullpage('#fullpage', {
        // Основные настройки
        autoScrolling: true,
        scrollHorizontally: false,

        // Скорость и анимация
        scrollingSpeed: 700,
        easing: 'easeInOutCubic',

        // Мобильные настройки
        fitToSection: true,
        fitToSectionDelay: 600,

        // Навигация
        keyboardScrolling: true,
        animateAnchor: true,
        recordHistory: false,

        // Тач-настройки для iOS
        touchSensitivity: 15,
        normalScrollElements: '.quiz-input',

        // Убираем лицензионное предупреждение (для личного использования)
        licenseKey: 'gplv3-license',

        // Колбэк при переходе на секцию
        onLeave: function (origin, destination, direction) {
            // Активируем секцию для анимаций
            const destSection = destination.item;
            destSection.classList.add('active');

            // Проигрываем звук для чат-секций
            if (destSection.classList.contains('chat-screen') && soundEnabled && notificationSound) {
                playNotificationSound();
            }
        },

        afterLoad: function (origin, destination, direction) {
            destination.item.classList.add('active');
        }
    });
}

// ========================================
// ПЕРЕКЛЮЧАТЕЛЬ ЗВУКА
// ========================================

function initSoundToggle() {
    const soundBtn = document.getElementById('soundBtn');
    const soundIcon = soundBtn.querySelector('.sound-icon');
    const soundText = soundBtn.querySelector('.sound-text');

    soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;

        if (soundEnabled) {
            soundBtn.classList.add('active');
            soundIcon.textContent = '🔊';
            soundText.textContent = 'Звук вкл';

            // Проигрываем тестовый звук для активации аудио контекста (iOS)
            if (notificationSound) {
                notificationSound.volume = 0.3;
                notificationSound.play().catch(() => {
                    // Игнорируем ошибку если браузер блокирует
                });
            }
        } else {
            soundBtn.classList.remove('active');
            soundIcon.textContent = '🔇';
            soundText.textContent = 'Звук выкл';
        }
    });
}

// ========================================
// НАБЛЮДАТЕЛЬ ЗА СКРОЛЛОМ (IntersectionObserver)
// ========================================

function initScrollObserver() {
    const screens = document.querySelectorAll('.screen');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -20% 0px',
        threshold: 0.3
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                // Проигрываем звук уведомления для чат-секций
                if (entry.target.classList.contains('chat-screen') && soundEnabled && notificationSound) {
                    playNotificationSound();
                }
            }
        });
    }, observerOptions);

    screens.forEach(screen => {
        observer.observe(screen);
    });
}

function playNotificationSound() {
    if (notificationSound && soundEnabled) {
        // Сбрасываем и проигрываем заново
        notificationSound.currentTime = 0;
        notificationSound.volume = 0.5;
        notificationSound.play().catch(() => {
            // Игнорируем ошибку
        });
    }
}

// ========================================
// КВЕСТ: ПРОВЕРКА КОДА
// ========================================

function initQuiz() {
    const quizInput = document.getElementById('quizInput');
    const quizBtn = document.getElementById('quizBtn');
    const quizError = document.getElementById('quizError');
    const giftLocked = document.getElementById('giftLocked');
    const giftUnlocked = document.getElementById('giftUnlocked');

    quizBtn.addEventListener('click', () => {
        checkAnswer();
    });

    // Также проверяем по Enter
    quizInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });

    function checkAnswer() {
        const userAnswer = normalizeAnswer(quizInput.value);
        const correctAnswer = normalizeAnswer(CORRECT_ANSWER);

        if (userAnswer === correctAnswer) {
            // Успех!
            unlockGift();
        } else if (userAnswer.length === 0) {
            quizError.textContent = 'Введите 3 слова 😊';
        } else {
            quizError.textContent = 'Почти! Подсказка: слова были выделены в поздравлениях 💡';
            quizInput.classList.add('shake');
            setTimeout(() => quizInput.classList.remove('shake'), 500);
        }
    }

    function normalizeAnswer(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' '); // Множественные пробелы в один
    }

    function unlockGift() {
        // Скрываем закрытый подарок
        giftLocked.classList.add('hidden');

        // Показываем открытый подарок
        giftUnlocked.classList.add('visible');

        // Запускаем stagger-анимацию для элементов
        const revealItems = giftUnlocked.querySelectorAll('.gift-reveal');
        revealItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, 300 + (index * 200)); // 200ms задержка между элементами
        });

        // Скроллим к подарку
        setTimeout(() => {
            giftUnlocked.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

// ========================================
// КНОПКА "ВЕРНУТЬСЯ НАВЕРХ"
// ========================================

function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');

    backToTopBtn.addEventListener('click', () => {
        // Используем fullPage.js API для перехода на первый экран
        if (fullPageInstance) {
            fullpage_api.moveTo(1);
        }
    });
}

// ========================================
// АНИМАЦИЯ ТРЯСКИ (для ошибки ввода)
// ========================================

// Добавляем CSS для анимации тряски динамически
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-5px); }
        40%, 80% { transform: translateX(5px); }
    }
    
    .shake {
        animation: shake 0.4s ease;
    }
`;
document.head.appendChild(shakeStyle);
