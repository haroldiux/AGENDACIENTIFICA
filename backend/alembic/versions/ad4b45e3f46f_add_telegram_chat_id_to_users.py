"""add_telegram_chat_id_to_users

Revision ID: ad4b45e3f46f
Revises: f95ac6262c2d
Create Date: 2026-08-09 15:09:54.297652

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ad4b45e3f46f'
down_revision: Union[str, None] = 'f95ac6262c2d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('telegram_chat_id', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'telegram_chat_id')
