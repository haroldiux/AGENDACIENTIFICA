from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, Career
from app.schemas.schemas import UserResponse, UserCreate, RoleEnum
from app.api.deps import get_current_active_user
from app.core.security import get_password_hash

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_user_me(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Get current user.
    """
    return current_user


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
