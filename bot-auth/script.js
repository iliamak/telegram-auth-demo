document.addEventListener('DOMContentLoaded', function() {
    const phoneForm = document.getElementById('phoneForm');
    
    // Форматирование номера телефона
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        // Удаляем все, кроме цифр
        let value = e.target.value.replace(/\D/g, '');
        
        // Форматируем номер
        if (value.length > 0) {
            value = value.substring(0, 10); // Ограничиваем 10 цифрами (без кода страны)
            
            if (value.length > 3 && value.length <= 6) {
                value = value.substring(0, 3) + ' ' + value.substring(3);
            } else if (value.length > 6 && value.length <= 8) {
                value = value.substring(0, 3) + ' ' + value.substring(3, 6) + '-' + value.substring(6);
            } else if (value.length > 8) {
                value = value.substring(0, 3) + ' ' + value.substring(3, 6) + '-' + value.substring(6, 8) + '-' + value.substring(8);
            }
        }
        
        e.target.value = value;
    });
    
    // Отправка формы
    phoneForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const phone = '+7' + phoneInput.value.replace(/\D/g, '');
        
        // Валидация номера телефона
        if (phone.length !== 12) { // +7 + 10 цифр
            showError('Пожалуйста, введите корректный номер телефона');
            return;
        }
        
        // Показываем индикатор загрузки
        toggleLoading(true);
        
        // Отправка запроса на сервер
        fetch('/api/send-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone })
        })
        .then(response => response.json())
        .then(data => {
            toggleLoading(false);
            
            if (data.success) {
                // Сохраняем телефон в localStorage для использования на странице верификации
                localStorage.setItem('userPhone', phone);
                window.location.href = '/verify-code.html';
            } else {
                showError(data.message || 'Произошла ошибка при отправке кода');
            }
        })
        .catch(error => {
            toggleLoading(false);
            showError('Ошибка соединения с сервером');
            console.error('Error:', error);
        });
    });
    
    // Функция для отображения ошибки
    function showError(message) {
        // Проверяем, есть ли уже сообщение об ошибке
        let errorElement = document.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            phoneForm.insertBefore(errorElement, phoneForm.firstChild);
        }
        
        errorElement.textContent = message;
    }
    
    // Функция для переключения индикатора загрузки
    function toggleLoading(isLoading) {
        if (isLoading) {
            phoneForm.classList.add('loading');
        } else {
            phoneForm.classList.remove('loading');
        }
    }
});