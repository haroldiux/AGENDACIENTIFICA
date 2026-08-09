"""add_missing_role_enum_values

Revision ID: f95ac6262c2d
Revises: a7ca6b286774
Create Date: 2026-08-09 13:54:22.378216

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f95ac6262c2d'
down_revision: Union[str, None] = 'a7ca6b286774'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # PostgreSQL requires ALTER TYPE ... ADD VALUE to run outside a transaction.
    # Alembic runs migrations in a transaction by default, so we commit first.
    op.execute("COMMIT")
    for value in (
        "super_admin",
        "vicerrectorado",
        "director_investigacion",
        "jefe_investigacion",
    ):
        op.execute(f"ALTER TYPE roleenum ADD VALUE IF NOT EXISTS '{value}'")


def downgrade() -> None:
    # PostgreSQL does not support removing enum values. To roll back safely we
    # would need to recreate the enum, which is destructive. Leaving as no-op.
    pass
