"""reviews, favorites, consultation result/user link, project deal_type;
clean fake bookings and consultation requests

Revision ID: 003
Revises: 002
Create Date: 2026-06-03
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.dialects.postgresql import UUID

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- Тип сделки проекта (продажа / аренда) ---
    op.execute("CREATE TYPE deal_type AS ENUM ('sale', 'rent')")
    op.add_column(
        "building_projects",
        sa.Column(
            "deal_type",
            postgresql.ENUM("sale", "rent", name="deal_type", create_type=False),
            nullable=False,
            server_default="sale",
        ),
    )

    # --- Доп. поля заявки: результат обработки и привязка к клиенту ---
    op.add_column("consultation_requests", sa.Column("result", sa.Text(), nullable=True))
    op.add_column(
        "consultation_requests",
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
    )

    # --- Отзывы ---
    op.create_table(
        "reviews",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("project_id", UUID(as_uuid=True), sa.ForeignKey("building_projects.id", ondelete="SET NULL"), nullable=True),
        sa.Column("rating", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # --- Избранное ---
    op.create_table(
        "favorites",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("project_id", UUID(as_uuid=True), sa.ForeignKey("building_projects.id", ondelete="CASCADE"), nullable=True),
        sa.Column("unit_id", UUID(as_uuid=True), sa.ForeignKey("units.id", ondelete="CASCADE"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "project_id", name="uq_fav_user_project"),
        sa.UniqueConstraint("user_id", "unit_id", name="uq_fav_user_unit"),
    )

    # --- Очистка фейковых данных (брони и заявки из seed) ---
    # Дашборд показывал «странное количество броней» из-за демо-записей.
    op.execute("DELETE FROM bookings")
    op.execute("DELETE FROM consultation_requests")


def downgrade() -> None:
    op.drop_table("favorites")
    op.drop_table("reviews")
    op.drop_column("consultation_requests", "user_id")
    op.drop_column("consultation_requests", "result")
    op.drop_column("building_projects", "deal_type")
    op.execute("DROP TYPE IF EXISTS deal_type")
