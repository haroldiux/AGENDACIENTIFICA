"""add_activity_categories

Revision ID: f9b2c3d4e5f6
Revises: e8a1f2b3c4d5
Create Date: 2026-08-08 09:15:00.000000

"""
from typing import Sequence, Union
from datetime import datetime

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f9b2c3d4e5f6'
down_revision: Union[str, None] = 'e8a1f2b3c4d5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create activity_categories table
    categories_table = op.create_table(
        'activity_categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('code', sa.String(), nullable=False),
        sa.Column('scope', sa.String(), nullable=False, server_default='both'),
        sa.Column('color', sa.String(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_activity_categories_id'), 'activity_categories', ['id'], unique=False)
    op.create_index(op.f('ix_activity_categories_code'), 'activity_categories', ['code'], unique=True)

    # 2. Add category_id FK to activity tables with explicit constraint names for SQLite batch mode
    with op.batch_alter_table('academic_activities') as batch_op:
        batch_op.add_column(
            sa.Column(
                'category_id',
                sa.Integer(),
                sa.ForeignKey('activity_categories.id', name='fk_academic_activities_category_id'),
                nullable=True,
            )
        )

    with op.batch_alter_table('scientific_activities') as batch_op:
        batch_op.add_column(
            sa.Column(
                'category_id',
                sa.Integer(),
                sa.ForeignKey('activity_categories.id', name='fk_scientific_activities_category_id'),
                nullable=True,
            )
        )

    # 3. Seed default categories
    now = datetime.utcnow()
    default_categories = [
        {"name": "General", "code": "GENERAL", "scope": "academic", "color": "#3B82F6", "description": "Actividad académica general", "is_active": True, "created_at": now, "updated_at": now},
        {"name": "Feriado", "code": "FERIADO", "scope": "academic", "color": "#EF4444", "description": "Feriado / Asueto", "is_active": True, "created_at": now, "updated_at": now},
        {"name": "Examen Parcial", "code": "PARCIAL", "scope": "academic", "color": "#F59E0B", "description": "Evaluación parcial", "is_active": True, "created_at": now, "updated_at": now},
        {"name": "Examen Final", "code": "FINAL", "scope": "academic", "color": "#8B5CF6", "description": "Evaluación final", "is_active": True, "created_at": now, "updated_at": now},
        {"name": "Congreso", "code": "CONGRESO", "scope": "scientific", "color": "#10B981", "description": "Congreso científico", "is_active": True, "created_at": now, "updated_at": now},
        {"name": "Seminario", "code": "SEMINARIO", "scope": "scientific", "color": "#06B6D4", "description": "Seminario de investigación", "is_active": True, "created_at": now, "updated_at": now},
        {"name": "Webinar", "code": "WEBINAR", "scope": "scientific", "color": "#6366F1", "description": "Seminario web / Webinar", "is_active": True, "created_at": now, "updated_at": now},
        {"name": "Taller", "code": "TALLER", "scope": "both", "color": "#EC4899", "description": "Taller práctico / Workshop", "is_active": True, "created_at": now, "updated_at": now},
        {"name": "Investigación", "code": "INVESTIGACION", "scope": "scientific", "color": "#14B8A6", "description": "Actividad de investigación", "is_active": True, "created_at": now, "updated_at": now},
    ]

    op.bulk_insert(categories_table, default_categories)


def downgrade() -> None:
    with op.batch_alter_table('scientific_activities') as batch_op:
        batch_op.drop_column('category_id')

    with op.batch_alter_table('academic_activities') as batch_op:
        batch_op.drop_column('category_id')

    op.drop_index(op.f('ix_activity_categories_code'), table_name='activity_categories')
    op.drop_index(op.f('ix_activity_categories_id'), table_name='activity_categories')
    op.drop_table('activity_categories')
