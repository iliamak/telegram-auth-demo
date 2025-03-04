/**
 * Пример серверной проверки данных от Telegram Login Widget
 * 
 * ВАЖНО: Этот файл предназначен только для демонстрации и обучения.
 * В реальном проекте он должен быть интегрирован в ваш серверный код.
 */

const crypto = require('crypto');

/**
 * Проверяет данные, полученные от Telegram Login Widget
 * 
 * @param {Object} telegramData - Данные, полученные от виджета
 * @param {string} botToken - Токен вашего бота
 * @return {boolean} Результат проверки
 */
function verifyTelegramData(telegramData, botToken) {
    // Делаем копию данных для обработки
    const data = { ...telegramData };
    
    // Извлекаем хеш для сравнения
    const receivedHash = data.hash;
    delete data.hash;
    
    // Создаем строку для проверки, сортируя ключи в алфавитном порядке
    const dataCheckArr = Object.entries(data)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, value]) => `${key}=${value}`);
    
    const dataCheckString = dataCheckArr.join('\n');
    
    // Создаем секретный ключ на основе токена бота
    const secretKey = crypto
        .createHash('sha256')
        .update(botToken)
        .digest();
    
    // Вычисляем хеш для сравнения
    const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');
    
    // Проверяем, совпадают ли хеши
    return calculatedHash === receivedHash;
}

/**
 * Проверяем актуальность данных (не старше 24 часов)
 * 
 * @param {Object} telegramData - Данные, полученные от виджета
 * @return {boolean} Результат проверки
 */
function isDataFresh(telegramData) {
    const authDate = telegramData.auth_date;
    const now = Math.floor(Date.now() / 1000);
    
    // Данные не должны быть старше 24 часов (86400 секунд)
    return (now - authDate) < 86400;
}

/**
 * Пример использования в Express.js
 */
/* 
app.get('/auth/telegram/callback', (req, res) => {
    const telegramData = req.query;
    const BOT_TOKEN = 'YOUR_BOT_TOKEN'; // Замените на токен вашего бота
    
    // Проверяем данные
    if (!verifyTelegramData(telegramData, BOT_TOKEN)) {
        return res.status(401).json({ error: 'Данные недостоверны' });
    }
    
    // Проверяем свежесть данных
    if (!isDataFresh(telegramData)) {
        return res.status(401).json({ error: 'Данные устарели' });
    }
    
    // Данные прошли проверку, авторизуем пользователя
    // В реальном приложении здесь будет код для создания сессии
    // или выдачи JWT токена
    
    // Пример создания пользователя в базе данных
    const user = {
        telegram_id: telegramData.id,
        first_name: telegramData.first_name,
        last_name: telegramData.last_name || '',
        username: telegramData.username || '',
        photo_url: telegramData.photo_url || '',
        auth_date: telegramData.auth_date
    };
    
    // Сохранение пользователя и создание сессии...
    
    // Перенаправление на страницу после успешной авторизации
    res.redirect('/profile');
});
*/

// Для тестирования функции можно использовать следующий код:
const exampleData = {
    id: 12345678,
    first_name: 'John',
    last_name: 'Doe',
    username: 'johndoe',
    photo_url: 'https://t.me/i/userpic/320/johndoe.jpg',
    auth_date: Math.floor(Date.now() / 1000),
    hash: 'abcdef123456789...' // В реальности это будет настоящий хеш
};

const BOT_TOKEN = 'YOUR_BOT_TOKEN'; // Замените на токен вашего бота

// Для локального тестирования раскомментируйте:
// console.log('Проверка данных:', verifyTelegramData(exampleData, BOT_TOKEN));
// console.log('Данные свежие:', isDataFresh(exampleData));

module.exports = {
    verifyTelegramData,
    isDataFresh
};