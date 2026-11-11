"""add_gestiones_2027_and_directora_user

Revision ID: 3a4b5c6d7e8f
Revises: 299cc48a1ccb
Create Date: 2026-11-11 09:30:00.000000

"""
from typing import Sequence, Union
from datetime import date
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from passlib.context import CryptContext

# revision identifiers, used by Alembic.
revision: str = '3a4b5c6d7e8f'
down_revision: Union[str, None] = '299cc48a1ccb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

CAREERS_DATA = [
    ("Medicina", "Facultad de Ciencias de la Salud"),
    ("Odontología", "Facultad de Ciencias de la Salud"),
    ("Enfermería", "Facultad de Ciencias de la Salud"),
    ("Medicina Veterinaria y Zootecnia", "Facultad de Ciencias de la Salud"),
    ("Fisioterapia y Kinesiología", "Facultad de Ciencias de la Salud"),
    ("Bioquímica y Farmacia", "Facultad de Ciencias de la Salud"),
    ("Fonoaudiología", "Facultad de Ciencias de la Salud"),
    ("Nutrición y Dietética", "Facultad de Ciencias de la Salud"),
    ("Tec. Superior Prótesis Dental", "Facultad de Ciencias de la Salud"),
    ("Ingeniería de Sonido", "Facultad de Ciencias de la Ingeniería"),
    ("Ingeniería de Sistemas", "Facultad de Ciencias de la Ingeniería"),
    ("Ingeniería Electrónica", "Facultad de Ciencias de la Ingeniería"),
    ("Ingeniería Biomédica", "Facultad de Ciencias de la Ingeniería"),
    ("Contaduría Pública", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    ("Economía", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    ("Administración de Empresas", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    ("Ingeniería Comercial", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    ("Contaduría Pública (Complementaria)", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    ("Administración de Empresas (Complementaria)", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    ("Ingeniería Comercial (Complementaria)", "Facultad de Ciencias Económicas Financieras Empresariales y Administrativas"),
    ("Comunicación Social", "Facultad de Ciencias Sociales y Jurídicas"),
    ("Derecho", "Facultad de Ciencias Sociales y Jurídicas"),
    ("Artes y Escultura", "Facultad de Ciencias Sociales y Jurídicas"),
    ("Cinematografía", "Facultad de Ciencias Sociales y Jurídicas"),
]

GESTIONES_DATA = [
    {"name": "1-2024", "start_date": date(2024, 1, 1), "end_date": date(2024, 6, 30)},
    {"name": "2-2024", "start_date": date(2024, 7, 1), "end_date": date(2024, 12, 31)},
    {"name": "1-2025", "start_date": date(2025, 1, 1), "end_date": date(2025, 6, 30)},
    {"name": "2-2025", "start_date": date(2025, 7, 1), "end_date": date(2025, 12, 31)},
    {"name": "1-2026", "start_date": date(2026, 1, 1), "end_date": date(2026, 6, 30)},
    {"name": "2-2026", "start_date": date(2026, 7, 1), "end_date": date(2026, 12, 31)},
    {"name": "1-2027", "start_date": date(2027, 1, 1), "end_date": date(2027, 6, 30)},
    {"name": "2-2027", "start_date": date(2027, 7, 1), "end_date": date(2027, 12, 31)},
]


def upgrade() -> None:
    bind = op.get_bind()

    # 1. Ensure all official Gestiones exist (including 1-2027 and 2-2027)
    gestiones_table = table(
        'gestiones',
        column('id', sa.Integer),
        column('name', sa.String),
        column('start_date', sa.Date),
        column('end_date', sa.Date)
    )

    for g in GESTIONES_DATA:
        res = bind.execute(
            sa.text("SELECT id FROM gestiones WHERE name = :name"),
            {"name": g["name"]}
        ).fetchone()
        if not res:
            op.bulk_insert(gestiones_table, [g])

    # 2. Ensure all 24 official Careers exist in fresh databases
    careers_table = table(
        'careers',
        column('id', sa.Integer),
        column('name', sa.String),
        column('faculty', sa.String)
    )
    for name, faculty in CAREERS_DATA:
        res = bind.execute(
            sa.text("SELECT id FROM careers WHERE name = :name"),
            {"name": name}
        ).fetchone()
        if not res:
            op.bulk_insert(careers_table, [{"name": name, "faculty": faculty}])

    # 3. Ensure Core Users exist
    users_table = table(
        'users',
        column('id', sa.Integer),
        column('email', sa.String),
        column('full_name', sa.String),
        column('role', sa.String),
        column('hashed_password', sa.String),
        column('is_active', sa.Boolean)
    )

    hashed_pw = pwd_context.hash("unitepc123")

    core_users = [
        {
            "email": "admin@unitepc.edu.bo",
            "full_name": "Administrador General UNITEPC",
            "role": "super_admin",
            "hashed_password": hashed_pw,
            "is_active": True,
        },
        {
            "email": "morellana_med@unitepc.edu.bo",
            "full_name": "Dra. María Lorena Orellana Aguilar",
            "role": "director_investigacion",
            "hashed_password": hashed_pw,
            "is_active": True,
        },
        {
            "email": "vicerrectorado@unitepc.edu.bo",
            "full_name": "Vicerrectorado Académico Nacional",
            "role": "vicerrectorado",
            "hashed_password": hashed_pw,
            "is_active": True,
        },
    ]

    for u in core_users:
        res_user = bind.execute(
            sa.text("SELECT id FROM users WHERE email = :email"),
            {"email": u["email"]}
        ).fetchone()
        if not res_user:
            op.bulk_insert(users_table, [u])


def downgrade() -> None:
    bind = op.get_bind()
    bind.execute(
        sa.text("DELETE FROM gestiones WHERE name IN ('1-2027', '2-2027')")
    )
    bind.execute(
        sa.text("DELETE FROM users WHERE email IN ('morellana_med@unitepc.edu.bo', 'admin@unitepc.edu.bo')")
    )
