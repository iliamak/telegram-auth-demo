document.addEventListener('DOMContentLoaded', function() {
    // Форма для ввода телефона
    const phoneForm = document.getElementById('phone-form');
    
    if (phoneForm) {
        phoneForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const phoneInput = document.getElementById('phone');
            const phoneNumber = phoneInput.value.trim();
            
            // Проверка формата номера телефона (простая)
            if (!isValidPhoneNumber(phoneNumber)) {
                alert('Пожалуйста, введите корректный номер телефона в формате +XXXXXXXXXXX');
                return;
            }
            
            // Сохраняем номер телефона и перенаправляем на страницу с кодом
            // В реальном приложении здесь был бы API запрос
            localStorage.setItem('phone_number', phoneNumber);
            window.location.href = 'verify-code.html';
        });
    }
    
    // Функция для проверки номера телефона (простая)
    function isValidPhoneNumber(phone) {
        // Проверяем, что номер начинается с + и содержит 7-15 цифр
        return /^\+[0-9]{7,15}$/.test(phone);
    }
});