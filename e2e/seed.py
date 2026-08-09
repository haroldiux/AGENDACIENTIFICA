"""Idempotent seeding helpers for E2E tests.

These functions hit the database directly so tests do not depend on the
authentication status of the public user-creation endpoint.
"""
from __future__ import annotations

import os
import sys
from datetime import date
from pathlib import Path

# Make backend imports available
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.security import get_password_hash
from app.db.base_class import Base
from app.models.models import (
    Career,
    Gestion,
    ActivityCategory,
    User,
    RoleEnum,
)

DEFAULT_PASSWORD = "password"


def ensure_engine(database_url: str | None = None):
    if database_url is None:
        db_path = Path(__file__).resolve().parent / "test.db"
        database_url = f"sqlite:///{db_path}"
    return create_engine(database_url, connect_args={"check_same_thread": False})


def create_tables(engine):
    Base.metadata.create_all(bind=engine)


def seed_base_data(session):
    """Create the minimum reference data required by the UI."""
    careers = [
        {"id": 1, "name": "Ingeniería de Sistemas", "faculty": "Tecnología"},
        {"id": 2, "name": "Medicina", "faculty": "Salud"},
    ]
    for data in careers:
        career = session.get(Career, data["id"])
        if not career:
            career = Career(**data)
            session.add(career)

    gestion = session.get(Gestion, 1)
    if not gestion:
        gestion = Gestion(
            id=1,
            name="2026",
            start_date=date(2026, 1, 1),
            end_date=date(2026, 12, 31),
        )
        session.add(gestion)

    categories = [
        {"id": 1, "name": "Investigación Aplicada", "code": "INV", "scope": "scientific", "is_active": True},
        {"id": 2, "name": "Evento Académico", "code": "ACAD", "scope": "academic", "is_active": True},
    ]
    for data in categories:
        cat = session.get(ActivityCategory, data["id"])
        if not cat:
            cat = ActivityCategory(**data)
            session.add(cat)

    session.commit()


def seed_role_user(session, email: str, role: RoleEnum, career_ids: list[int] | None = None):
    """Create or update a test user with the given role and assigned careers."""
    user = session.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            full_name=role.value.replace("_", " ").title(),
            role=role,
            is_active=True,
            hashed_password=get_password_hash(DEFAULT_PASSWORD),
        )
        session.add(user)
    else:
        user.hashed_password = get_password_hash(DEFAULT_PASSWORD)
        user.role = role
        user.is_active = True

    session.flush()

    if career_ids:
        desired = {session.get(Career, cid) for cid in career_ids}
        desired.discard(None)
        user.careers = list(desired)

    session.commit()
    return user


def seed_all_test_users(session):
    """Seed the canonical set of users used by the E2E suite."""
    seed_role_user(session, "vicerrectorado@unitepc.edu.bo", RoleEnum.vicerrectorado)
    seed_role_user(session, "director.investigacion@unitepc.edu.bo", RoleEnum.director_investigacion)
    seed_role_user(session, "jefe.sistemas@unitepc.edu.bo", RoleEnum.jefe_investigacion, career_ids=[1])
    seed_role_user(session, "jefe.medicina@unitepc.edu.bo", RoleEnum.jefe_investigacion, career_ids=[2])
    seed_role_user(session, "coordinador.sistemas@unitepc.edu.bo", RoleEnum.coordinator, career_ids=[1])
    seed_role_user(session, "coordinador.medicina@unitepc.edu.bo", RoleEnum.coordinator, career_ids=[2])
    seed_role_user(session, "admin@unitepc.edu.bo", RoleEnum.admin)
    seed_role_user(session, "lectura@unitepc.edu.bo", RoleEnum.read_only)


def reset_database(database_url: str | None = None):
    """Drop/create tables and seed reference + user data."""
    engine = ensure_engine(database_url)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    with Session() as session:
        seed_base_data(session)
        seed_all_test_users(session)


if __name__ == "__main__":
    reset_database()
