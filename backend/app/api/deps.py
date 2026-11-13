from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.config import settings
from app.core.security import ALGORITHM
from app.models.models import User
from app.schemas.schemas import TokenData, RoleEnum

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """Retrieves the current user from the JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except (JWTError, ValidationError):
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Returns the currently authenticated active user."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def check_activity_scope_permission(
    user: User,
    career_id: Optional[int],
    sede_id: Optional[int] = None,
    pilar: Optional[str] = None
) -> None:
    """
    Validates if the user has permission to manage (create/update/delete) an activity
    with the specified career_id, sede_id, and pilar.
    Raises HTTP 403 Forbidden if unauthorized.
    """
    # 1. Enforce specialized pillar constraints:
    if pilar:
        pilar_norm = pilar.strip().lower()
        if user.role == RoleEnum.director_academico_sede and pilar_norm != "academica":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El rol Dirección Académica de Sede sólo puede gestionar actividades académicas",
            )
        if user.role == RoleEnum.jefe_investigacion and pilar_norm != "investigacion":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El rol Jefatura de Investigación sólo puede gestionar actividades de investigación",
            )

    # 2. Global allowed roles (National / Super Admin)
    global_allowed_roles = {
        RoleEnum.super_admin,
        RoleEnum.admin,
        RoleEnum.vicerrectorado,
        RoleEnum.research,
    }
    if user.role in global_allowed_roles:
        return

    # 3. Sede-scoped roles: vicerrector_sede, director_academico_sede, director_investigacion (Cochabamba)
    sede_scoped_roles = {
        RoleEnum.vicerrector_sede,
        RoleEnum.director_academico_sede,
        RoleEnum.director_investigacion,
    }
    if user.role in sede_scoped_roles:
        if user.sede_id is not None and sede_id is not None and user.sede_id != sede_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No está autorizado para gestionar actividades de otra sede",
            )
        return

    # 4. Career-scoped roles: coordinator, jefe_investigacion
    career_scoped_roles = {
        RoleEnum.coordinator,
        RoleEnum.jefe_investigacion,
    }
    if user.role in career_scoped_roles:
        if career_id is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to manage global institutional activities",
            )
        user_career_ids = [c.id for c in user.careers]
        if career_id not in user_career_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to manage activities for this career",
            )
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not authorized to modify activities",
    )

def check_category_manage_permission(user: User) -> None:
    """
    Validates if the user has permission to manage activity categories.
    Allowed roles: vicerrectorado, admin, super_admin, director_investigacion, vicerrector_sede.
    Raises HTTP 403 Forbidden if unauthorized.
    """
    allowed_roles = {
        RoleEnum.vicerrectorado,
        RoleEnum.admin,
        RoleEnum.super_admin,
        RoleEnum.director_investigacion,
        RoleEnum.vicerrector_sede,
        RoleEnum.research,
    }
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to manage activity categories",
        )


def require_read_only_get(
    request: Request,
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Dependency that allows read_only users to perform GET requests only.
    Any non-GET method performed by a read_only user is rejected with 403.
    """
    if current_user.role == RoleEnum.read_only and request.method != "GET":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Read-only users are only allowed to perform GET requests",
        )
    return current_user


def require_admin_role(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Dependency that enforces that the user has an administrative role.
    Allowed admin roles: super_admin, admin, vicerrectorado, director_investigacion.
    """
    allowed_roles = {
        RoleEnum.super_admin,
        RoleEnum.admin,
        RoleEnum.vicerrectorado,
        RoleEnum.director_investigacion,
    }
    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required for user administration",
        )
    return current_user


