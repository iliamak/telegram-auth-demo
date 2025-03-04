document.addEventListener('DOMContentLoaded', function() {
    const userNameElement = document.getElementById('userName');
    const userPhoneElement = document.getElementById('userPhone');
    const userAvatarElement = document.getElementById('userAvatar');
    const authDataElement = document.getElementById('authData');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Загружаем данные пользователя
    fetch('/api/user-info')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const user = data.user;
                
                // Устанавливаем данные пользователя
                userNameElement.textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
                userPhoneElement.textContent = formatPhoneNumber(user.phone_number);
                
                // Устанавливаем аватар пользователя или плейсхолдер
                if (user.photo_url) {
                    userAvatarElement.src = user.photo_url;
                } else {
                    // Устанавливаем плейсхолдер с инициалами
                    userAvatarElement.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.first_name) + '&background=0088cc&color=fff';
                }
                
                // Отображаем данные авторизации в формате JSON
                const userData = {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    phone_number: user.phone_number,
                    auth_date: user.auth_date
                };
                
                authDataElement.textContent = JSON.stringify(userData, null, 2);
            } else {
                // Если данные не получены, перенаправляем на страницу авторизации
                window.location.href = '/';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.href = '/';
        });
    
    // Обработка выхода
    logoutBtn.addEventListener('click', function() {
        fetch('/api/logout', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Очищаем локальное хранилище и перенаправляем
                localStorage.removeItem('userPhone');
                window.location.href = '/';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
    
    // Функция для форматирования номера телефона
    function formatPhoneNumber(phone) {
        if (!phone) return '';
        
        // Предполагаем формат +7XXXXXXXXXX
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^7(\d{3})(\d{3})(\d{2})(\d{2})$/);
        
        if (match) {
            return `+7 ${match[1]} ${match[2]}-${match[3]}-${match[4]}`;
        }
        
        return phone;
    }
});