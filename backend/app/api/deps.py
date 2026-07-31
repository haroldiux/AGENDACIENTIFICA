from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db


def get_current_active_user(db: Session = Depends(get_db)):
    """Authentication dependency stub.

    Returns the currently authenticated active user. Tests and routers that
    need to bypass auth can override this dependency via
    ``app.dependency_overrides``.
    """
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
