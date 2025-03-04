require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');
const path = require('path');

// Инициализация приложения Express
const app = express();
const PORT = process.env.PORT || 3000;

// Проверка наличия токена бота
if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN не найден. Убедитесь, что файл .env настроен правильно.');
    process.exit(1);
}

// Инициализация бота Telegram
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Настройка Express middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Настройка сессий
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// База данных для хранения кодов подтверждения (в реальном приложении используйте базу данных)
const verificationCodes = new Map();

// База данных для хранения информации о пользователях (в реальном приложении используйте базу данных)
const users = new Map();

// Функция для генерации случайного кода
function generateCode() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

// Маршрут для отправки кода подтверждения
app.post('/api/send-code', async (req, res) => {
    try {
        const { phone } = req.body;
        
        if (!phone || !/^\+7\d{10}$/.test(phone)) {
            return res.status(400).json({ success: false, message: 'Некорректный формат номера телефона' });
        }
        
        // Генерируем код подтверждения
        const code = generateCode();
        
        // Сохраняем код в нашей "базе данных"
        verificationCodes.set(phone, {
            code,
            createdAt: new Date(),
            attempts: 0
        });
        
        // Имитация отправки сообщения через Telegram Bot API
        // В реальном приложении здесь будет логика для отправки сообщения конкретному пользователю
        // Но поскольку у нас нет привязки номера телефона к ID чата Telegram,
        // мы просто будем выводить код в консоль для демонстрации
        console.log(`Код для ${phone}: ${code}`);
        
        // Эта строка закомментирована, так как в реальности нужно знать chat_id пользователя
        // await bot.sendMessage(chatId, `Ваш код подтверждения: ${code}`);
        
        // В реальном приложении вы бы использовали Telegram API для отправки сообщения
        // Например, через Telegram Client API или специальный сервис
        
        res.json({ success: true, message: 'Код подтверждения отправлен' });
    } catch (error) {
        console.error('Ошибка при отправке кода:', error);
        res.status(500).json({ success: false, message: 'Произошла ошибка при отправке кода' });
    }
});

// Маршрут для проверки кода подтверждения
app.post('/api/verify-code', (req, res) => {
    try {
        const { phone, code } = req.body;
        
        if (!phone || !code) {
            return res.status(400).json({ success: false, message: 'Не указан телефон или код' });
        }
        
        // Получаем данные верификации из нашей "базы данных"
        const verificationData = verificationCodes.get(phone);
        
        // Проверяем, есть ли данный телефон в базе
        if (!verificationData) {
            return res.status(400).json({ success: false, message: 'Код не запрашивался или истек' });
        }
        
        // Проверяем количество попыток
        if (verificationData.attempts >= 3) {
            // Удаляем код после 3 неудачных попыток
            verificationCodes.delete(phone);
            return res.status(400).json({ success: false, message: 'Превышено количество попыток. Запросите новый код' });
        }
        
        // Проверяем срок действия кода (5 минут)
        const codeAge = (new Date() - verificationData.createdAt) / 1000 / 60; // в минутах
        if (codeAge > 5) {
            verificationCodes.delete(phone);
            return res.status(400).json({ success: false, message: 'Срок действия кода истек. Запросите новый код' });
        }
        
        // Проверяем код
        if (verificationData.code !== code) {
            // Увеличиваем счетчик попыток
            verificationData.attempts++;
            verificationCodes.set(phone, verificationData);
            
            return res.status(400).json({ 
                success: false, 
                message: 'Неверный код',
                attemptsLeft: 3 - verificationData.attempts
            });
        }
        
        // Код верный, удаляем его из базы
        verificationCodes.delete(phone);
        
        // Создаем запись о пользователе (в реальном приложении здесь была бы логика для получения профиля из Telegram)
        const userId = Date.now().toString();
        const user = {
            id: userId,
            phone_number: phone,
            first_name: 'Пользователь', // В реальном приложении получаем из Telegram
            last_name: '', // В реальном приложении получаем из Telegram
            auth_date: Math.floor(Date.now() / 1000)
        };
        
        // Сохраняем пользователя в нашей "базе данных"
        users.set(userId, user);
        
        // Сохраняем пользователя в сессии
        req.session.userId = userId;
        
        res.json({ success: true, message: 'Код подтвержден успешно' });
    } catch (error) {
        console.error('Ошибка при проверке кода:', error);
        res.status(500).json({ success: false, message: 'Произошла ошибка при проверке кода' });
    }
});

// Маршрут для получения информации о пользователе
app.get('/api/user-info', (req, res) => {
    try {
        // Проверяем, авторизован ли пользователь
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Не авторизован' });
        }
        
        // Получаем данные пользователя из нашей "базы данных"
        const user = users.get(req.session.userId);
        
        if (!user) {
            req.session.destroy();
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }
        
        res.json({ success: true, user });
    } catch (error) {
        console.error('Ошибка при получении информации о пользователе:', error);
        res.status(500).json({ success: false, message: 'Произошла ошибка при получении информации о пользователе' });
    }
});

// Маршрут для выхода из системы
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Ошибка при выходе из системы' });
        }
        res.json({ success: true, message: 'Успешный выход из системы' });
    });
});

// Обработка маршрутов для одностраничного приложения
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

// Обработка сообщений от Telegram бота
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    // Обработка команды /start
    if (text === '/start') {
        bot.sendMessage(chatId, 'Привет! Я бот для демонстрации авторизации через Telegram. Используйте веб-приложение для входа.');
    }
});

// Обработка ошибок бота
bot.on('polling_error', (error) => {
    console.error('Ошибка в боте:', error);
});

// Обработка необработанных исключений
process.on('uncaughtException', (error) => {
    console.error('Необработанное исключение:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Необработанное отклонение Promise:', error);
});