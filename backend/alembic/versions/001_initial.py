"""initial schema and seed data

Revision ID: 001
Revises:
Create Date: 2026-05-27
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import date

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password", sa.String(255), nullable=False),
        sa.Column("first_name", sa.String(100)),
        sa.Column("last_name", sa.String(100)),
        sa.Column("phone", sa.String(20)),
        sa.Column("role", sa.Enum("admin", "user", name="user_role"), default="user", nullable=False),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "building_projects",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), unique=True, nullable=False),
        sa.Column("type", sa.Enum("multi_apartment", "private_house_group", name="project_type")),
        sa.Column("description", sa.Text()),
        sa.Column("location", sa.String(255)),
        sa.Column("address", sa.String(500)),
        sa.Column("status", sa.Enum("active", "sold_out", "upcoming", name="project_status"), default="active"),
        sa.Column("price_from", sa.Numeric(15, 2)),
        sa.Column("deadline", sa.Date()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "units",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", UUID(as_uuid=True), sa.ForeignKey("building_projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(255)),
        sa.Column("type", sa.Enum("apartment", "house", "studio", "penthouse", name="unit_type")),
        sa.Column("area", sa.Numeric(8, 2)),
        sa.Column("floor", sa.Integer()),
        sa.Column("rooms", sa.Integer()),
        sa.Column("price", sa.Numeric(15, 2)),
        sa.Column("status", sa.Enum("available", "booked", "sold", name="unit_status"), default="available"),
        sa.Column("description", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "photos",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", UUID(as_uuid=True), sa.ForeignKey("building_projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("unit_id", UUID(as_uuid=True), sa.ForeignKey("units.id", ondelete="CASCADE"), nullable=True),
        sa.Column("url", sa.String(1000), nullable=False),
        sa.Column("caption", sa.String(255)),
        sa.Column("order", sa.Integer(), default=0),
        sa.Column("is_cover", sa.Boolean(), default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "bookings",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("unit_id", UUID(as_uuid=True), sa.ForeignKey("units.id"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("status", sa.Enum("pending", "confirmed", "cancelled", name="booking_status"), default="pending"),
        sa.Column("comment", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "consultation_requests",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("email", sa.String(255)),
        sa.Column("project_id", UUID(as_uuid=True), sa.ForeignKey("building_projects.id", ondelete="SET NULL"), nullable=True),
        sa.Column("message", sa.Text()),
        sa.Column("is_processed", sa.Boolean(), default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Seed data
    import bcrypt as _bcrypt

    def _hash(pw: str) -> str:
        return _bcrypt.hashpw(pw.encode(), _bcrypt.gensalt(rounds=10)).decode()

    admin_hash = _hash("admin")
    user_hash = _hash("user")

    admin_id = str(uuid.uuid4())
    user_id = str(uuid.uuid4())
    p1_id = str(uuid.uuid4())
    p2_id = str(uuid.uuid4())
    p3_id = str(uuid.uuid4())

    op.execute(f"""
        INSERT INTO users (id, email, password, first_name, last_name, role, is_active)
        VALUES
          ('{admin_id}', 'admin@localhost', '{admin_hash}', 'Игорь', 'Петров', 'admin', true),
          ('{user_id}', 'user@localhost', '{user_hash}', 'Анна', 'Маркова', 'user', true)
    """)

    op.execute(f"""
        INSERT INTO building_projects (id, title, slug, type, description, location, address, status, price_from, deadline)
        VALUES
          ('{p1_id}', 'Полянка 18', 'polyanka-18', 'multi_apartment',
           'Клубный дом в квартале Якиманки. 84 резиденции, лобби с камином, приватный двор.',
           'Якиманка', 'Москва, ул. Большая Полянка, 18', 'active', 32400000, '2027-12-31'),
          ('{p2_id}', 'Сосны Парк', 'sosny-park', 'private_house_group',
           'Загородный посёлок в Истринском районе. 42 коттеджа с участками.',
           'Истринский р-н', 'Московская обл., Истринский р-н', 'active', 24100000, '2026-06-30'),
          ('{p3_id}', 'Лефортово Sound', 'lefortovo-sound', 'multi_apartment',
           'Бизнес-класс у парка. 4 корпуса, уже сдан.',
           'Лефортово', 'Москва, Лефортово', 'active', 18900000, null)
    """)

    u1 = str(uuid.uuid4()); u2 = str(uuid.uuid4()); u3 = str(uuid.uuid4())
    u4 = str(uuid.uuid4()); u5 = str(uuid.uuid4())

    op.execute(f"""
        INSERT INTO units (id, project_id, title, type, area, floor, rooms, price, status)
        VALUES
          ('{u1}', '{p1_id}', '2к евро · К3', 'apartment', 76.4, 8, 2, 38900000, 'available'),
          ('{u2}', '{p1_id}', 'Студия · К1', 'studio', 38.2, 3, 0, 19500000, 'available'),
          ('{u3}', '{p1_id}', '1к · К2', 'apartment', 52.0, 12, 1, 26600000, 'booked'),
          ('{u4}', '{p2_id}', 'Коттедж 280 м²', 'house', 280.0, 1, 5, 24100000, 'booked'),
          ('{u5}', '{p3_id}', 'Студия · 28 м²', 'studio', 28.4, 4, 0, 8900000, 'sold')
    """)

    b1 = str(uuid.uuid4()); b2 = str(uuid.uuid4()); b3 = str(uuid.uuid4())
    op.execute(f"""
        INSERT INTO bookings (id, unit_id, user_id, status, comment)
        VALUES
          ('{b1}', '{u1}', '{user_id}', 'pending', 'Ипотека · Сбер'),
          ('{b2}', '{u4}', '{user_id}', 'confirmed', 'Загородный дом'),
          ('{b3}', '{u5}', '{user_id}', 'confirmed', null)
    """)

    for i in range(5):
        cid = str(uuid.uuid4())
        op.execute(f"""
            INSERT INTO consultation_requests (id, name, phone, project_id, message, is_processed)
            VALUES ('{cid}', 'Клиент {i+1}', '+7 999 000-00-0{i}', '{p1_id}', 'Интересует квартира', {'true' if i < 2 else 'false'})
        """)


def downgrade() -> None:
    op.drop_table("consultation_requests")
    op.drop_table("bookings")
    op.drop_table("photos")
    op.drop_table("units")
    op.drop_table("building_projects")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS user_role")
    op.execute("DROP TYPE IF EXISTS project_type")
    op.execute("DROP TYPE IF EXISTS project_status")
    op.execute("DROP TYPE IF EXISTS unit_type")
    op.execute("DROP TYPE IF EXISTS unit_status")
    op.execute("DROP TYPE IF EXISTS booking_status")
