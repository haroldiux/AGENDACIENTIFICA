from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, Career
from app.schemas.schemas import UserResponse, UserCreate, UserUpdate, RoleEnum
from app.api.deps import get_current_active_user
from app.core.security import get_password_hash
from app.workers.notification_worker import send_telegram_message

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_user_me(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Get current user.
    """
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Update current user's profile (name, phone, telegram chat id, email).
    """
    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/test-telegram", status_code=status.HTTP_200_OK)
def test_telegram_notification(
    current_user: User = Depends(get_current_active_user),
):
    """Send a test message to the current user's Telegram chat ID."""
    if not current_user.telegram_chat_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No tenés un Telegram Chat ID configurado. Guardalo primero en tu perfil.",
        )

    message = (
        f"Hola {current_user.full_name or current_user.email},\n\n"
        "Este es un mensaje de prueba del Sistema Agenda Científica UNITEPC.\n"
        "Si llegaste a leer esto, tu bot de Telegram está funcionando correctamente."
    )

    sent = send_telegram_message(current_user.telegram_chat_id, message)
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo enviar el mensaje de prueba. Verificá que el TELEGRAM_BOT_TOKEN esté configurado.",
        )

    return {"message": "Mensaje de prueba enviado correctamente por Telegram"}


@router.post("/", response_model=UserResponse)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Create new user.
    """
    if user_in.role == RoleEnum.admin and current_user.role != RoleEnum.super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super_admin can create admin users"
        )

    # Only global roles can create users
    if current_user.role not in (RoleEnum.super_admin, RoleEnum.admin, RoleEnum.vicerrectorado, RoleEnum.director_investigacion):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create users"
        )

    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
        
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        is_active=True,
    )
    
    if user_in.career_ids:
        careers = db.query(Career).filter(Career.id.in_(user_in.career_ids)).all()
        user.careers.extend(careers)

    db.add(user)
    db.commit()
    db.refresh(user)
    return user
