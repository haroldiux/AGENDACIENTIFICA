"""add_collaboration_careers

Revision ID: a1b2c3d4e5f6
Revises: f9b2c3d4e5f6
Create Date: 2026-08-08 11:49:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'f9b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'scientific_activity_collaboration_careers',
        sa.Column('activity_id', sa.Integer(), sa.ForeignKey('scientific_activities.id'), nullable=False, primary_key=True),
        sa.Column('career_id', sa.Integer(), sa.ForeignKey('careers.id'), nullable=False, primary_key=True),
    )


def downgrade() -> None:
    op.drop_table('scientific_activity_collaboration_careers')
