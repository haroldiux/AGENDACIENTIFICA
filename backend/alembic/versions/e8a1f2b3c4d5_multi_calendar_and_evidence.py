"""multi_calendar_and_evidence

Revision ID: e8a1f2b3c4d5
Revises: 78d72e61f0e0
Create Date: 2026-08-05 17:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e8a1f2b3c4d5'
down_revision: Union[str, None] = '78d72e61f0e0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Make career_id nullable on academic_activities & scientific_activities
    with op.batch_alter_table('academic_activities') as batch_op:
        batch_op.alter_column('career_id', existing_type=sa.Integer(), nullable=True)
    with op.batch_alter_table('scientific_activities') as batch_op:
        batch_op.alter_column('career_id', existing_type=sa.Integer(), nullable=True)

    # Create scientific_activity_evidences table
    op.create_table(
        'scientific_activity_evidences',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('scientific_activity_id', sa.Integer(), sa.ForeignKey('scientific_activities.id'), nullable=False),
        sa.Column('filename', sa.String(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('file_type', sa.String(), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('uploaded_at', sa.DateTime(), nullable=False),
        sa.Column('uploaded_by_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_scientific_activity_evidences_id'), 'scientific_activity_evidences', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_scientific_activity_evidences_id'), table_name='scientific_activity_evidences')
    op.drop_table('scientific_activity_evidences')
    with op.batch_alter_table('academic_activities') as batch_op:
        batch_op.alter_column('career_id', existing_type=sa.Integer(), nullable=False)
    with op.batch_alter_table('scientific_activities') as batch_op:
        batch_op.alter_column('career_id', existing_type=sa.Integer(), nullable=False)

