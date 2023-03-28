// Получение данных из формы всплывающего окна
function getFormData() {
    // Получаем значения полей формы
    const serverAddress = document.getElementById('serverAddress').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const cookieAddress = document.getElementById('cookieAddress').value;
    // Возвращаем объект с полученными значениями
    return {serverAddress, username, password, cookieAddress};
}

// Функция обновления куков для указанного адреса
async function updateCookies(cookieAddress, token) {
    // Отправляем GET-запрос на указанный адрес с заголовком Authorization, содержащим токен
    await fetch(cookieAddress, {
        headers: {Authorization: `Bearer ${token}`},
        credentials: 'include',
    });
}

// Функция для обработки запросов
function backgroundRequestListener(details) {
    // Получаем значения полей формы и заголовки запроса
    const {serverAddress, username, password, cookieAddress} = getFormData();
    const headers = details.requestHeaders;
    const url = new URL(details.url);

    // Проверяем, что запрос проходит через нужный адрес
    if (url.origin === cookieAddress) {
        // Отправляем POST-запрос на сервер для авторизации
        fetch(`${serverAddress}/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password}),
        })
            // Получаем токен из ответа сервера и обновляем куки с помощью функции updateCookies()
            .then((response) => response.json())
            .then((data) => {
                // Передаем для переменной how_to_get_token_from_data значение ключа из json, в котором хранится JWT
                const how_to_get_token_from_data = "access_token"
                // Вытаскиваем jwt и присваем его переменной token
                const token = data[how_to_get_token_from_data];
                updateCookies(cookieAddress, token);
                // Добавляем заголовок Authorization с токеном к заголовкам запроса
                headers.push({name: 'Authorization', value: `Bearer ${token}`});
                // Находим индекс заголовка Authorization в массиве заголовков
                const authHeaderIndex = headers.findIndex((h) => h.name === 'Authorization');
                // Возвращаем объект с обновленными заголовками запроса
                return {requestHeaders: headers};
            });
    }

    // Возвращаем объект с заголовками запроса
    return {requestHeaders: headers};
}

// Регистрация функции обработки запросов
chrome.webRequest.onBeforeSendHeaders.addListener(
    backgroundRequestListener,
    // Отслеживаем все URL
    {urls: ['<all_urls>']},
    // Изменяем заголовки запроса перед отправкой на сервер
    ['requestHeaders', 'blocking'],
);
