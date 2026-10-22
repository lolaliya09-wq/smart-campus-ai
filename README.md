# Smart Campus AI

Учебный административный dashboard умного кампуса: помещения, IoT-устройства, энергопотребление, инциденты и AI-аналитика (обнаружение аномалий).

**Демо:** `https://ВАШ_ЛОГИН.github.io/smart-campus-ai/`

## Стек
HTML5, CSS3 (Grid/Flexbox, тёмная/светлая тема), JavaScript, localStorage, Chart.js (CDN), Git + GitHub Pages. Backend не нужен, показания датчиков имитируются.

## Запуск
Откройте папку в VS Code → Live Server → `index.html`. Вход: любое имя и пароль, роль на выбор (Administrator / Engineer / Operator; имитация, не защита).

## Структура
```
index.html        вход
dashboard.html    KPI, 3 графика, уведомления
rooms.html        12 помещений, поиск и фильтры, симуляция датчиков
devices.html      28 устройств, поиск, фильтры, включение/отключение
incidents.html    CRUD инцидентов
analytics.html    аномалии, z-score, рекомендации, графики
settings.html     тема, название кампуса, сброс данных
assets/css/style.css
assets/js/  data.js (данные) · storage.js (localStorage, симуляция) · ai.js (пороги, z-score, рекомендации)
            layout.js (sidebar, topbar, уведомления, тема) · dashboard.js · rooms.js · devices.js · incidents.js · analytics.js · settings.js
```

## AI Analytics
1. **Пороги:** температура 28/32 °C, CO₂ 1000/1500 ppm, энергия +30%/+60% к базовой линии.
2. **Z-score:** значение сравнивается со средним по 10 предыдущим показаниям; z > 2 — аномалия.
3. **Рекомендации:** набор правил `getRecommendation(room)`.

Это статистика и правила, а не генеративный AI. Внешний AI API нужно подключать только через backend, ключ нельзя хранить в браузерном JS.

## Публикация на GitHub Pages
```
git init
git add .
git commit -m "Create Smart Campus AI dashboard"
git branch -M main
git remote add origin URL_РЕПОЗИТОРИЯ
git push -u origin main
```
Settings → Pages → Deploy from a branch → `main` → `/(root)` → Save.
Для 5+ осмысленных коммитов делайте их по этапам: каркас и CSS · данные и storage · Rooms/Devices · Incidents (CRUD) · Dashboard и графики · AI Analytics · README.
