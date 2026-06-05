"""replace service account emails (@localhost) with valid ones

Revision ID: 004
Revises: 003
Create Date: 2026-06-03
"""
from alembic import op

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # @localhost не является корректным email и отклоняется валидацией формы входа.
    op.execute("UPDATE users SET email = 'admin@kupido.ru' WHERE email = 'admin@localhost'")
    op.execute("UPDATE users SET email = 'user@kupido.ru' WHERE email = 'user@localhost'")


def downgrade() -> None:
    op.execute("UPDATE users SET email = 'admin@localhost' WHERE email = 'admin@kupido.ru'")
    op.execute("UPDATE users SET email = 'user@localhost' WHERE email = 'user@kupido.ru'")
