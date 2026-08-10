"""create_user_notification_preferences_table

Revision ID: b1c2d3e4f5a6
Revises: ad4b45e3f46f
Create Date: 2026-08-10 09:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b1c2d3e4f5a6'
down_revision: Union[str, None] = 'ad4b45e3f46f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'user_notification_preferences',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('email_enabled', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('whatsapp_enabled', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('telegram_enabled', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('custom_email', sa.String(), nullable=True),
        sa.Column('custom_whatsapp', sa.String(), nullable=True),
        sa.Column('custom_telegram_chat_id', sa.String(), nullable=True),
        sa.Column('notify_academic', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('notify_scientific', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('digest_frequency', sa.String(), nullable=False, server_default='weekly'),
        sa.Column('lookahead_days', sa.Integer(), nullable=False, server_default='7'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_user_notification_preferences_id'), 'user_notification_preferences', ['id'], unique=False)
    op.create_index(op.f('ix_user_notification_preferences_user_id'), 'user_notification_preferences', ['user_id'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_user_notification_preferences_user_id'), table_name='user_notification_preferences')
    op.drop_index(op.f('ix_user_notification_preferences_id'), table_name='user_notification_preferences')
    op.drop_table('user_notification_preferences')
