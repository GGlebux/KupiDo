# КупиДо — Real Estate Platform

Полнофункциональная платформа для девелопера. Включает клиентский сайт, личный кабинет и административную панель.

---

## Быстрый старт

```bash
docker compose up --build -d
```

| Сервис | URL |
|---|---|
| Сайт | http://localhost |
| Админ-панель | http://localhost/admin |
| API (Swagger) | http://localhost:8000/docs |

---

## Данные для входа

### Администратор

Вход через ту же форму, что и у пользователя (http://localhost). После входа
у администратора в шапке появляется кнопка перехода в админ-панель (http://localhost/admin).

| Поле | Значение |
|---|---|
| Email | `admin@kupido.ru` |
| Пароль | `admin` |

### Тестовый пользователь (Сайт → http://localhost)

| Поле | Значение |
|---|---|
| Email | `user@kupido.ru` |
| Пароль | `user` |

---

## Стек

| Слой | Технологии |
|---|---|
| Backend | FastAPI, SQLAlchemy 2 (async), Alembic, asyncpg, Pydantic v2 |
| Frontend | React 19, TypeScript, Vite, React Router v7, react-hook-form |
| Admin | React 19, TypeScript, Vite, Recharts |
| База данных | PostgreSQL 16 |
| Инфраструктура | Docker Compose, Nginx |

---

## Структура проекта

```
КупиДон/
├── backend/          # FastAPI приложение
│   ├── app/
│   │   ├── api/v1/   # Эндпоинты
│   │   ├── crud/     # Запросы к БД
│   │   ├── models/   # SQLAlchemy модели
│   │   ├── schemas/  # Pydantic схемы
│   │   └── core/     # Конфиг, зависимости, JWT
│   ├── alembic/      # Миграции
│   └── requirements.txt
├── frontend/         # Клиентский сайт
│   └── src/
│       ├── pages/    # Страницы
│       ├── components/
│       └── api/
├── admin/            # Административная панель
│   └── src/
│       ├── pages/    # Страницы админки
│       └── api/
└── docker-compose.yml
```

---

## API

Полная документация: **http://localhost:8000/docs** (Swagger UI)

Основные эндпоинты:

| Метод | Путь | Описание |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Вход |
| `POST` | `/api/v1/auth/register` | Регистрация |
| `GET` | `/api/v1/projects` | Список проектов |
| `GET` | `/api/v1/projects/{slug}` | Проект по slug |
| `GET` | `/api/v1/projects/{id}/units` | Квартиры проекта |
| `GET` | `/api/v1/units/{id}` | Квартира |
| `POST` | `/api/v1/bookings` | Создать бронирование |
| `GET` | `/api/v1/bookings` | Список бронирований |
| `POST` | `/api/v1/photos` | Загрузить фото (multipart) |
| `POST` | `/api/v1/photos/from-url` | Добавить фото по URL |
| `PATCH` | `/api/v1/photos/{id}/order` | Изменить порядок фото |
| `POST` | `/api/v1/consultations` | Заявка на консультацию |

Защищённые эндпоинты требуют заголовок:
```
Authorization: Bearer <token>
```

---

## Функциональность

### Клиентский сайт
- Каталог проектов с фильтрацией
- Страницы проектов с фотогалереей
- Список и карточки квартир
- Бронирование квартиры
- Личный кабинет (история бронирований)
- Ипотечный калькулятор
- Рассрочка с калькулятором
- Trade-in
- Сопровождение сделки
- Контакты с Яндекс Картами
- Страницы: Инвесторам, Для жителей, Вакансии, О компании, Команда, Гарантии, Документы

### Административная панель
- Дашборд с графиками
- CRUD проектов (с загрузкой фото, drag-and-drop порядок)
- CRUD квартир
- Управление бронированиями (статус, статус оплаты, сумма)
- Заявки на консультацию
- Управление пользователями

---

## Переменные окружения (backend)

| Переменная | По умолчанию | Описание |
|---|---|---|
| `DATABASE_URL` | — | Строка подключения PostgreSQL |
| `SECRET_KEY` | — | Секрет для JWT (минимум 32 символа) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Срок жизни токена (24 ч) |
| `CORS_ORIGINS` | `["http://localhost"]` | Разрешённые CORS-источники |
| `MEDIA_DIR` | `/app/media` | Путь для хранения загруженных файлов |
| `MAX_FILE_SIZE` | `10485760` | Максимальный размер фото (10 МБ) |

---

## Разработка (без Docker)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

### Admin

```bash
cd admin
npm install
npm run dev                  # http://localhost:5174
```

---

## Миграции

```bash
# Применить все миграции
alembic upgrade head

# Создать новую миграцию
alembic revision --autogenerate -m "описание"

# Откатить последнюю
alembic downgrade -1
```

---

## Дизайн-токены

| Токен | Значение | Использование |
|---|---|---|
| `--cream` | `#F6F2E8` | Основной фон |
| `--ink` | `#14110D` | Основной текст |
| `--gold` | `#C9A961` | Акценты |
| Шрифт заголовков | Cormorant Garamond | Display-текст |
| Шрифт текста | Manrope | UI и body |
