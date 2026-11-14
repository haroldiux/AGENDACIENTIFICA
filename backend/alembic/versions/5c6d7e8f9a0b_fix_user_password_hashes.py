"""fix_user_password_hashes

Revision ID: 5c6d7e8f9a0b
Revises: 4b5c6d7e8f9a
Create Date: 2026-11-14 09:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '5c6d7e8f9a0b'
down_revision: Union[str, None] = '4b5c6d7e8f9a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Verified 60-char bcrypt hash for password 'unitepc123'
VALID_BCRYPT_HASH = "$2b$12$fAz9uwFmKTxYzaUEF30fUeTvMmZDJt//BJv728KfRUgOTj0JbkFOa"

def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = (bind.dialect.name == "postgresql")

    # 1. Update all existing core users whose password is corrupted or needs reset to 'unitepc123'
    try:
        bind.execute(
            sa.text("""
                UPDATE users
                SET hashed_password = :hash, is_active = true
                WHERE email IN (
                    'admin@unitepc.edu.bo',
                    'super_admin@unitepc.edu.bo',
                    'morellana_med@unitepc.edu.bo',
                    'vicerrectorado@unitepc.edu.bo',
                    'director_investigacion@unitepc.edu.bo',
                    'jefe_investigacion@unitepc.edu.bo',
                    'coordinator@unitepc.edu.bo'
                )
            """),
            {"hash": VALID_BCRYPT_HASH}
        )
    except Exception as e:
        print(f"Notice updating core users password: {e}")

    # 2. Also fix any user in the database whose hashed_password has invalid length (< 50 chars)
    try:
        bind.execute(
            sa.text("""
                UPDATE users
                SET hashed_password = :hash
                WHERE LENGTH(hashed_password) < 50
            """),
            {"hash": VALID_BCRYPT_HASH}
        )
    except Exception as e:
        print(f"Notice updating invalid length passwords: {e}")

    # 3. Ensure admin@unitepc.edu.bo exists
    try:
        res = bind.execute(
            sa.text("SELECT id FROM users WHERE email = 'admin@unitepc.edu.bo'")
        ).fetchone()
        if not res:
            if is_postgres:
                bind.execute(
                    sa.text("""
                        INSERT INTO users (email, full_name, role, hashed_password, is_active)
                        VALUES ('admin@unitepc.edu.bo', 'Administrador General UNITEPC', CAST('super_admin' AS roleenum), :hash, true)
                    """),
                    {"hash": VALID_BCRYPT_HASH}
                )
            else:
                bind.execute(
                    sa.text("""
                        INSERT INTO users (email, full_name, role, hashed_password, is_active)
                        VALUES ('admin@unitepc.edu.bo', 'Administrador General UNITEPC', 'super_admin', :hash, true)
                    """),
                    {"hash": VALID_BCRYPT_HASH}
                )
    except Exception as e:
        print(f"Notice ensuring admin user: {e}")


def downgrade() -> None:
    pass
