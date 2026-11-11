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


def upgrade() -> None:
    bind = op.get_bind()

    # 1. Ensure Gestiones 1-2027 and 2-2027 exist
    gestiones_table = table(
        'gestiones',
        column('id', sa.Integer),
        column('name', sa.String),
        column('start_date', sa.Date),
        column('end_date', sa.Date)
    )

    new_gestiones = [
        {"name": "1-2027", "start_date": date(2027, 1, 1), "end_date": date(2027, 6, 30)},
        {"name": "2-2027", "start_date": date(2027, 7, 1), "end_date": date(2027, 12, 31)},
    ]

    for g in new_gestiones:
        res = bind.execute(
            sa.text("SELECT id FROM gestiones WHERE name = :name"),
            {"name": g["name"]}
        ).fetchone()
        if not res:
            op.bulk_insert(gestiones_table, [g])

    # 2. Ensure Dra. María Lorena Orellana Aguilar exists
    users_table = table(
        'users',
        column('id', sa.Integer),
        column('email', sa.String),
        column('full_name', sa.String),
        column('role', sa.String),
        column('hashed_password', sa.String),
        column('is_active', sa.Boolean)
    )

    directora_email = "morellana_med@unitepc.edu.bo"
    res_user = bind.execute(
        sa.text("SELECT id FROM users WHERE email = :email"),
        {"email": directora_email}
    ).fetchone()

    if not res_user:
        hashed_pw = pwd_context.hash("unitepc123")
        op.bulk_insert(users_table, [{
            "email": directora_email,
            "full_name": "Dra. María Lorena Orellana Aguilar",
            "role": "director_investigacion",
            "hashed_password": hashed_pw,
            "is_active": True
        }])


def downgrade() -> None:
    bind = op.get_bind()
    bind.execute(
        sa.text("DELETE FROM gestiones WHERE name IN ('1-2027', '2-2027')")
    )
    bind.execute(
        sa.text("DELETE FROM users WHERE email = 'morellana_med@unitepc.edu.bo'")
    )
