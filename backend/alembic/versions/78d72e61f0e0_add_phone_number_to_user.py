"""add phone_number to user

Revision ID: 78d72e61f0e0
Revises: ccf4319e06db
Create Date: 2026-08-04 14:25:53.980274

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '78d72e61f0e0'
down_revision: Union[str, None] = 'ccf4319e06db'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('phone_number', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'phone_number')
