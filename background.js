// Получение данных из формы всплывающего окна
function getFormData() {
    const serverAddress = document.getElementById('serverAddress').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const cookieAddress = document.getElementById('cookieAddress').value;
    return {serverAddress, username, password, cookieAddress};
}

// Функция обновления куков для указанного адреса
async function updateCookies(cookieAddress, token) {
    // Отправляем GET-запрос, чтобы установить куки
    await fetch(cookieAddress, {
        headers: {Authorization: `Bearer ${token}`},
        credentials: 'include',
    });
}

// Функция для обработки запросов
function backgroundRequestListener(details) {
    const {serverAddress, username, password, cookieAddress} = getFormData();
    const headers = details.requestHeaders;
    const url = new URL(details.url);

    // Проверяем, что запрос проходит через нужный адрес
    if (url.origin === cookieAddress) {
        // Отправляем POST-запрос для авторизации
        fetch(`${serverAddress}/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password}),
        })
            .then((response) => response.json())
            .then((data) => {
                // Обновляем куки с токеном
                const token = data.token;
                updateCookies(cookieAddress, token);
                // Добавляем куки к заголовкам запроса
                headers.push({name: 'Authorization', value: `Bearer ${token}`});
                const authHeaderIndex = headers.findIndex((h) => h.name === 'Authorization');
                return {requestHeaders: headers};
            });
    }

    // Возвращаем заголовки запроса
    return {requestHeaders: headers};
}

// Регистрация функции обработки запросов
chrome.webRequest.onBeforeSendHeaders.addListener(
    backgroundRequestListener,
    {urls: ['<all_urls>']},
    ['requestHeaders', 'blocking'],
);
