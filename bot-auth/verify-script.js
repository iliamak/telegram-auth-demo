document.addEventListener('DOMContentLoaded', function() {
    const verifyForm = document.getElementById('verifyForm');
    const resendCodeBtn = document.getElementById('resendCode');
    const userPhoneElement = document.getElementById('userPhone');
    const codeInput = document.getElementById('verification-code');
    
    // Получаем телефон пользователя из localStorage
    const userPhone = localStorage.getItem('userPhone');
    
    // Если телефон не найден, перенаправляем на главную
    if (!userPhone) {
        window.location.href = '/';
        return;
    }
    
    // Отображаем номер телефона
    userPhoneElement.textContent = formatPhoneNumber(userPhone);
    
    // Автоматически фокусируем поле ввода кода
    codeInput.focus();
    
    // Отправка формы с кодом
    verifyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const code = codeInput.value.trim();
        
        // Валидация кода
        if (!/^\d{5}$/.test(code)) {
            showError('Пожалуйста, введите корректный код подтверждения (5 цифр)');
            return;
        }
        
        // Показываем индикатор загрузки
        toggleLoading(true);
        
        // Отправка запроса на сервер
        fetch('/api/verify-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone: userPhone, code })
        })
        .then(response => response.json())
        .then(data => {
            toggleLoading(false);
            
            if (data.success) {
                // При успешной верификации перенаправляем на страницу успеха
                window.location.href = '/auth-success.html';
            } else {
                showError(data.message || 'Неверный код подтверждения');
            }
        })
        .catch(error => {
            toggleLoading(false);
            showError('Ошибка соединения с сервером');
            console.error('Error:', error);
        });
    });
    
    // Повторная отправка кода
    resendCodeBtn.addEventListener('click', function() {
        // Показываем индикатор загрузки
        toggleLoading(true);
        
        // Отправка запроса на сервер
        fetch('/api/send-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone: userPhone })
        })
        .then(response => response.json())
        .then(data => {
            toggleLoading(false);
            
            if (data.success) {
                showSuccess('Код успешно отправлен повторно');
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
    
    // Функция для отображения ошибки
    function showError(message) {
        // Проверяем, есть ли уже сообщение об ошибке
        let errorElement = document.querySelector('.error-message');
        let successElement = document.querySelector('.success-message');
        
        if (successElement) {
            successElement.remove();
        }
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            verifyForm.insertBefore(errorElement, verifyForm.firstChild);
        }
        
        errorElement.textContent = message;
    }
    
    // Функция для отображения сообщения об успехе
    function showSuccess(message) {
        // Проверяем, есть ли уже сообщение об успехе
        let successElement = document.querySelector('.success-message');
        let errorElement = document.querySelector('.error-message');
        
        if (errorElement) {
            errorElement.remove();
        }
        
        if (!successElement) {
            successElement = document.createElement('div');
            successElement.className = 'success-message';
            successElement.style.backgroundColor = '#e8f5e9';
            successElement.style.color = '#388e3c';
            successElement.style.padding = '10px';
            successElement.style.borderRadius = '6px';
            successElement.style.marginBottom = '15px';
            successElement.style.fontSize = '14px';
            verifyForm.insertBefore(successElement, verifyForm.firstChild);
        }
        
        successElement.textContent = message;
    }
    
    // Функция для переключения индикатора загрузки
    function toggleLoading(isLoading) {
        if (isLoading) {
            verifyForm.classList.add('loading');
        } else {
            verifyForm.classList.remove('loading');
        }
    }
});