"""replace demo catalog with full showcase (projects + units)

Заменяет 3 демо-проекта из миграции 001 на расширенный демонстрационный
каталог: 5 проектов и 16 объектов, покрывающих все категории, типы сделок,
статусы и ценовые диапазоны. Выполняется штатным `alembic upgrade head`
при старте контейнера, поэтому каталог наполняется «из коробки» —
даже после `docker compose down -v`.

Пользователи (admin@kupido.ru / user@kupido.ru) не трогаются —
они создаются миграциями 001 и 004.

Revision ID: 005
Revises: 004
Create Date: 2026-06-05
"""
import uuid
from datetime import date

from alembic import op

revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


# price_from у проекта = минимальная цена объекта (для аренды — NULL,
# чтобы карточка показывала «по запросу», а не «0,0 млн ₽»).
PROJECTS = [
    {
        "slug": "svetlogorsky",
        "title": "ЖК «Светлогорский»",
        "type": "multi_apartment",
        "deal_type": "sale",
        "status": "active",
        "location": "Москва",
        "address": "Москва, ул. Светлогорская, 12",
        "deadline": date(2026, 9, 30),
        "description": "Монолитный жилой комплекс комфорт-класса в 10 минутах от метро. "
                       "Закрытый двор без машин, подземный паркинг, дизайнерские лобби.",
        "units": [
            {"title": "Студия", "type": "studio", "area": 28.5, "floor": 4, "rooms": 0, "price": 7200000, "status": "available"},
            {"title": "1-комнатная", "type": "apartment", "area": 42.0, "floor": 7, "rooms": 1, "price": 10500000, "status": "available"},
            {"title": "2-комнатная", "type": "apartment", "area": 64.0, "floor": 9, "rooms": 2, "price": 15800000, "status": "booked"},
            {"title": "3-комнатная", "type": "apartment", "area": 88.0, "floor": 12, "rooms": 3, "price": 21400000, "status": "available"},
            {"title": "Пентхаус", "type": "penthouse", "area": 145.0, "floor": 18, "rooms": 4, "price": 48000000, "status": "available"},
        ],
    },
    {
        "slug": "sosnovy-bereg",
        "title": "КП «Сосновый Берег»",
        "type": "private_house_group",
        "deal_type": "sale",
        "status": "active",
        "location": "Московская область",
        "address": "Московская обл., Истринский р-н, кп Сосновый Берег",
        "deadline": date(2026, 6, 30),
        "description": "Коттеджный посёлок на берегу водохранилища. Газ, центральные "
                       "коммуникации, охрана 24/7, собственный пляж и пирс.",
        "units": [
            {"title": "Дом 120 м²", "type": "house", "area": 120.0, "floor": 2, "rooms": 4, "price": 18500000, "status": "available"},
            {"title": "Дом 165 м²", "type": "house", "area": 165.0, "floor": 2, "rooms": 5, "price": 24900000, "status": "available"},
            {"title": "Дом 210 м²", "type": "house", "area": 210.0, "floor": 3, "rooms": 6, "price": 31200000, "status": "booked"},
        ],
    },
    {
        "slug": "lesnaya-usadba",
        "title": "КП «Лесная Усадьба»",
        "type": "private_house_group",
        "deal_type": "sale",
        "status": "upcoming",
        "location": "Ленинградская область",
        "address": "Ленинградская обл., Всеволожский р-н, кп Лесная Усадьба",
        "deadline": date(2027, 3, 31),
        "description": "Новый посёлок премиум-класса в сосновом лесу. Старт продаж — "
                       "первая очередь из 24 домовладений с участками от 12 соток.",
        "units": [
            {"title": "Дом 140 м²", "type": "house", "area": 140.0, "floor": 2, "rooms": 4, "price": 16800000, "status": "available"},
            {"title": "Дом 190 м²", "type": "house", "area": 190.0, "floor": 2, "rooms": 5, "price": 22300000, "status": "available"},
        ],
    },
    {
        "slug": "centralny",
        "title": "ЖК «Центральный»",
        "type": "multi_apartment",
        "deal_type": "sale",
        "status": "sold_out",
        "location": "Казань",
        "address": "Казань, ул. Баумана, 47",
        "deadline": date(2025, 12, 31),
        "description": "Бизнес-класс в историческом центре города. Дом сдан и полностью "
                       "распродан — оставлен в каталоге как реализованный проект.",
        "units": [
            {"title": "1-комнатная", "type": "apartment", "area": 40.0, "floor": 5, "rooms": 1, "price": 8900000, "status": "sold"},
            {"title": "2-комнатная", "type": "apartment", "area": 60.0, "floor": 8, "rooms": 2, "price": 12700000, "status": "sold"},
            {"title": "Пентхаус", "type": "penthouse", "area": 130.0, "floor": 16, "rooms": 4, "price": 39000000, "status": "sold"},
        ],
    },
    {
        "slug": "nevskaya-rezidentsiya",
        "title": "ЖК «Невская Резиденция»",
        "type": "multi_apartment",
        "deal_type": "rent",
        "status": "active",
        "location": "Санкт-Петербург",
        "address": "Санкт-Петербург, Петроградская наб., 18",
        "deadline": None,
        "description": "Аренда видовых квартир с дизайнерским ремонтом и мебелью. "
                       "Консьерж, фитнес, подземный паркинг. Цены указаны за месяц.",
        "units": [
            {"title": "Студия", "type": "studio", "area": 30.0, "floor": 6, "rooms": 0, "price": 45000, "status": "available"},
            {"title": "1-комнатная", "type": "apartment", "area": 44.0, "floor": 10, "rooms": 1, "price": 65000, "status": "available"},
            {"title": "2-комнатная", "type": "apartment", "area": 70.0, "floor": 14, "rooms": 2, "price": 95000, "status": "booked"},
        ],
    },
]


def _esc(text: str) -> str:
    """Экранирует одинарные кавычки для безопасной вставки в SQL."""
    return text.replace("'", "''")


def upgrade() -> None:
    # Убираем демо-контент из миграции 001 (3 проекта/5 объектов и связанные брони),
    # чтобы каталог содержал ровно набор ниже. Пользователей не трогаем.
    op.execute("DELETE FROM bookings")
    op.execute("DELETE FROM building_projects")  # CASCADE удалит units, photos, favorites

    for p in PROJECTS:
        pid = str(uuid.uuid4())
        sale_prices = [u["price"] for u in p["units"] if p["deal_type"] == "sale"]
        price_from = str(min(sale_prices)) if sale_prices else "NULL"
        deadline = f"'{p['deadline'].isoformat()}'" if p["deadline"] else "NULL"

        op.execute(f"""
            INSERT INTO building_projects
              (id, title, slug, type, deal_type, description, location, address, status, price_from, deadline)
            VALUES
              ('{pid}', '{_esc(p['title'])}', '{p['slug']}', '{p['type']}', '{p['deal_type']}',
               '{_esc(p['description'])}', '{_esc(p['location'])}', '{_esc(p['address'])}',
               '{p['status']}', {price_from}, {deadline})
        """)

        for u in p["units"]:
            uid = str(uuid.uuid4())
            op.execute(f"""
                INSERT INTO units
                  (id, project_id, title, type, area, floor, rooms, price, status)
                VALUES
                  ('{uid}', '{pid}', '{_esc(u['title'])}', '{u['type']}',
                   {u['area']}, {u['floor']}, {u['rooms']}, {u['price']}, '{u['status']}')
            """)


def downgrade() -> None:
    slugs = ", ".join(f"'{p['slug']}'" for p in PROJECTS)
    op.execute(f"DELETE FROM building_projects WHERE slug IN ({slugs})")
