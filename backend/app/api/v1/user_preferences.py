from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_active_user, get_db
from app.models.models import User, UserNotificationPreference
from app.schemas.schemas import (
    UserNotificationPreferenceResponse,
    UserNotificationPreferenceUpdate,
)

router = APIRouter()


def get_or_create_user_preference(db: Session, user_id: int) -> UserNotificationPreference:
    """Retrieve existing notification preference or auto-initialize default preference matrix."""
    pref = db.query(UserNotificationPreference).filter(
        UserNotificationPreference.user_id == user_id
    ).first()

    if not pref:
        pref = UserNotificationPreference(user_id=user_id)
        db.add(pref)
        db.commit()
        db.refresh(pref)

    return pref


@router.get("/me/notification-preferences", response_model=UserNotificationPreferenceResponse)
def get_user_notification_preferences(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> UserNotificationPreference:
    """Get current user's notification preferences with auto-initialization for missing records."""
    return get_or_create_user_preference(db, current_user.id)


@router.put("/me/notification-preferences", response_model=UserNotificationPreferenceResponse)
def update_user_notification_preferences(
    payload: UserNotificationPreferenceUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> UserNotificationPreference:
    """Update current user's notification preference matrix."""
    pref = get_or_create_user_preference(db, current_user.id)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pref, field, value)

    db.add(pref)
    db.commit()
    db.refresh(pref)
    return pref
