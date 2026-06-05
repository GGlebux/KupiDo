"""add payment status to bookings

Revision ID: 002
Revises: 001
Create Date: 2026-05-28
"""
from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE TYPE payment_status AS ENUM ('not_paid', 'deposit_paid', 'fully_paid')")
    op.add_column("bookings", sa.Column(
        "payment_status",
        sa.Enum("not_paid", "deposit_paid", "fully_paid", name="payment_status"),
        nullable=False,
        server_default="not_paid",
    ))
    op.add_column("bookings", sa.Column("payment_amount", sa.Numeric(15, 2), nullable=True))


def downgrade() -> None:
    op.drop_column("bookings", "payment_amount")
    op.drop_column("bookings", "payment_status")
    op.execute("DROP TYPE payment_status")
