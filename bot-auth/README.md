# Авторизация через Telegram Bot API

Эта часть проекта демонстрирует авторизацию через Telegram Bot API с использованием номера телефона и проверочного кода.

## Как это работает

1. Пользователь вводит свой номер телефона на странице авторизации
2. Наше приложение отправляет номер телефона в Telegram Bot API
3. Telegram отправляет код верификации пользователю
4. Пользователь вводит код на нашем сайте
5. Приложение проверяет код и авторизует пользователя

## Настройка

### 1. Создание бота в Telegram

1. Откройте Telegram и найдите бота [BotFather](https://t.me/botfather)
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните полученный API токен

### 2. Настройка проекта

1. Установите зависимости:
   ```
   npm install
   ```

2. Создайте файл `.env` на основе `.env.example` и добавьте ваш Telegram API токен:
   ```
   TELEGRAM_BOT_TOKEN=your_token_here
   ```

3. Запустите сервер:
   ```
   node server.js
   ```

## Структура проекта

- `index.html` - страница ввода номера телефона
- `verify-code.html` - страница ввода проверочного кода
- `auth-success.html` - страница успешной авторизации
- `server.js` - Node.js сервер для обработки запросов
- `script.js` - клиентский JavaScript
- `style.css` - стили оформления
- `.env.example` - пример файла окружения

## Технические детали

Проект использует:
- Express.js для сервера
- node-telegram-bot-api для работы с Telegram Bot API
- dotenv для управления переменными окружения
- Express-session для управления сессиями пользователей