"""add_multisede_roles_and_pillars

Revision ID: 4b5c6d7e8f9a
Revises: 3a4b5c6d7e8f
Create Date: 2026-11-13 14:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column

# revision identifiers, used by Alembic.
revision: str = '4b5c6d7e8f9a'
down_revision: Union[str, None] = '3a4b5c6d7e8f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

OFFICIAL_SEDES = [
    "Sede Cochabamba",
    "Sede La Paz",
    "Sede El Alto",
    "Sede Santa Cruz",
    "Sede Cobija",
    "Sede Guayaramerín",
    "Sede Puerto Quijarro",
    "Sede Ivirgarzama",
]

PILLAR_CATEGORIES = [
    {
        "code": "ACADEMICA",
        "name": "Docencia y Gestión Académica",
        "scope": "academic",
        "color": "#3B82F6",
        "description": "Actividades académicas, exámenes parciales/finales, inducciones docentes y gestión curricular",
    },
    {
        "code": "INVESTIGACION",
        "name": "Ciencia, Tecnología e Innovación",
        "scope": "scientific",
        "color": "#8B5CF6",
        "description": "Proyectos científicos, congresos, ferias de innovación, publicaciones y semilleros",
    },
    {
        "code": "INTERACCION_SOCIAL",
        "name": "Extensión e Interacción Social",
        "scope": "both",
        "color": "#10B981",
        "description": "Campañas de vinculación comunitaria, consultorios populares, voluntariado y proyectos de impacto social",
    },
    {
        "code": "INTERNACIONALIZACION",
        "name": "Cooperación y Movilidad Internacional",
        "scope": "both",
        "color": "#F59E0B",
        "description": "Convenios interinstitucionales, movilidad estudiantil y docente, redes académicas globales",
    },
]


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = (bind.dialect.name == "postgresql")

    # 1. Update PostgreSQL roleenum if running on Postgres
    if is_postgres:
        op.execute("COMMIT")
        for val in ("vicerrector_sede", "director_academico_sede"):
            try:
                op.execute(f"ALTER TYPE roleenum ADD VALUE IF NOT EXISTS '{val}'")
            except Exception as e:
                print(f"Notice adding enum value {val}: {e}")

    # 2. Add columns to tables
    # users.sede_id
    try:
        op.add_column('users', sa.Column('sede_id', sa.Integer(), sa.ForeignKey('sedes.id'), nullable=True))
    except Exception as e:
        print(f"Column users.sede_id might already exist: {e}")

    # academic_activities: sede_id, regimen, plan_estudio, pilar
    try:
        op.add_column('academic_activities', sa.Column('sede_id', sa.Integer(), sa.ForeignKey('sedes.id'), nullable=True))
    except Exception as e:
        print(f"Notice academic_activities.sede_id: {e}")
    try:
        op.add_column('academic_activities', sa.Column('regimen', sa.String(), server_default='semestral', nullable=True))
    except Exception as e:
        print(f"Notice academic_activities.regimen: {e}")
    try:
        op.add_column('academic_activities', sa.Column('plan_estudio', sa.String(), nullable=True))
    except Exception as e:
        print(f"Notice academic_activities.plan_estudio: {e}")
    try:
        op.add_column('academic_activities', sa.Column('pilar', sa.String(), server_default='academica', nullable=True))
    except Exception as e:
        print(f"Notice academic_activities.pilar: {e}")

    # scientific_activities: sede_id, regimen, plan_estudio, pilar
    try:
        op.add_column('scientific_activities', sa.Column('sede_id', sa.Integer(), sa.ForeignKey('sedes.id'), nullable=True))
    except Exception as e:
        print(f"Notice scientific_activities.sede_id: {e}")
    try:
        op.add_column('scientific_activities', sa.Column('regimen', sa.String(), server_default='semestral', nullable=True))
    except Exception as e:
        print(f"Notice scientific_activities.regimen: {e}")
    try:
        op.add_column('scientific_activities', sa.Column('plan_estudio', sa.String(), nullable=True))
    except Exception as e:
        print(f"Notice scientific_activities.plan_estudio: {e}")
    try:
        op.add_column('scientific_activities', sa.Column('pilar', sa.String(), server_default='investigacion', nullable=True))
    except Exception as e:
        print(f"Notice scientific_activities.pilar: {e}")

    # 3. Ensure the 8 Official Sedes exist
    sedes_table = table(
        'sedes',
        column('id', sa.Integer),
        column('name', sa.String)
    )
    for sede_name in OFFICIAL_SEDES:
        res = bind.execute(
            sa.text("SELECT id FROM sedes WHERE name = :name"),
            {"name": sede_name}
        ).fetchone()
        if not res:
            op.bulk_insert(sedes_table, [{"name": sede_name}])

    # 4. Ensure Pillar Categories exist in activity_categories
    cat_table = table(
        'activity_categories',
        column('id', sa.Integer),
        column('code', sa.String),
        column('name', sa.String),
        column('scope', sa.String),
        column('color', sa.String),
        column('description', sa.Text),
        column('is_active', sa.Boolean)
    )
    for cat in PILLAR_CATEGORIES:
        res_cat = bind.execute(
            sa.text("SELECT id FROM activity_categories WHERE code = :code"),
            {"code": cat["code"]}
        ).fetchone()
        if not res_cat:
            op.bulk_insert(cat_table, [{**cat, "is_active": True}])

    # 5. Link Dra. Lorena Orellana to Sede Cochabamba
    try:
        cbba_row = bind.execute(
            sa.text("SELECT id FROM sedes WHERE name LIKE '%Cochabamba%' LIMIT 1")
        ).fetchone()
        if cbba_row:
            bind.execute(
                sa.text("UPDATE users SET sede_id = :sede_id WHERE email = 'morellana_med@unitepc.edu.bo'"),
                {"sede_id": cbba_row[0]}
            )
    except Exception as e:
        print(f"Notice linking Dra. Orellana to Cochabamba sede: {e}")


def downgrade() -> None:
    # Safe cleanup
    try:
        op.drop_column('scientific_activities', 'pilar')
        op.drop_column('scientific_activities', 'plan_estudio')
        op.drop_column('scientific_activities', 'regimen')
        op.drop_column('scientific_activities', 'sede_id')

        op.drop_column('academic_activities', 'pilar')
        op.drop_column('academic_activities', 'plan_estudio')
        op.drop_column('academic_activities', 'regimen')
        op.drop_column('academic_activities', 'sede_id')

        op.drop_column('users', 'sede_id')
    except Exception as e:
        print(f"Warning in downgrade: {e}")
