"""add read_only role

Revision ID: a7ca6b286774
Revises: ccf4319e06db
Create Date: 2026-08-09 16:18:45.661000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'a7ca6b286774'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add the read_only value to the role enum on PostgreSQL.

    SQLite does not use a native ENUM type (SQLAlchemy stores the value as
    VARCHAR), so no DDL is required there.
    """
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("ALTER TYPE roleenum ADD VALUE 'read_only'")


def downgrade() -> None:
    """Removing a value from a PostgreSQL ENUM requires recreating the type.

    Because read_only is a new, additive value and no rows are expected to use
    it in existing datasets, this migration leaves the enum value in place on
    downgrade. A full enum recreation migration can be added if the value must
    be removed.
    """
    pass
