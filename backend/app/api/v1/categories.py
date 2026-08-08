from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_active_user, check_category_manage_permission
from app.models.models import ActivityCategory, User
from app.schemas.schemas import (
    ActivityCategoryCreate,
    ActivityCategoryUpdate,
    ActivityCategoryResponse,
)

router = APIRouter()


@router.get("/", response_model=List[ActivityCategoryResponse])
def get_categories(
    scope: Optional[str] = Query(default=None, description="Filter by scope ('academic', 'scientific', 'both')"),
    include_inactive: bool = Query(default=False, description="Include soft-deleted/inactive categories"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Retrieve activity categories with optional scope and active status filtering."""
    query = db.query(ActivityCategory)

    if not include_inactive:
        query = query.filter(ActivityCategory.is_active.is_(True))

    if scope:
        scope_clean = scope.lower().strip()
        if scope_clean in ("academic", "scientific"):
            query = query.filter(ActivityCategory.scope.in_([scope_clean, "both"]))
        elif scope_clean == "both":
            query = query.filter(ActivityCategory.scope == "both")
        else:
            query = query.filter(ActivityCategory.scope == scope_clean)

    categories = query.order_by(ActivityCategory.id).offset(skip).limit(limit).all()
    return categories


@router.post("/", response_model=ActivityCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category: ActivityCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new activity category. Requires admin or vicerrectorado permissions."""
    check_category_manage_permission(current_user)

    code_clean = category.code.upper().strip()
    existing = db.query(ActivityCategory).filter(func.upper(ActivityCategory.code) == code_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with code '{code_clean}' already exists",
        )

    db_category = ActivityCategory(
        name=category.name.strip(),
        code=code_clean,
        scope=category.scope,
        color=category.color,
        description=category.description,
        is_active=category.is_active,
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.get("/{id}", response_model=ActivityCategoryResponse)
def get_category(id: int, db: Session = Depends(get_db)):
    """Retrieve a single category by ID."""
    category = db.query(ActivityCategory).filter(ActivityCategory.id == id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


@router.put("/{id}", response_model=ActivityCategoryResponse)
def update_category(
    id: int,
    category_update: ActivityCategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update an existing category. Requires admin or vicerrectorado permissions."""
    check_category_manage_permission(current_user)

    db_category = db.query(ActivityCategory).filter(ActivityCategory.id == id).first()
    if not db_category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    update_data = category_update.model_dump(exclude_unset=True)

    if "code" in update_data and update_data["code"]:
        new_code = update_data["code"].upper().strip()
        existing = db.query(ActivityCategory).filter(
            func.upper(ActivityCategory.code) == new_code,
            ActivityCategory.id != id,
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category with code '{new_code}' already exists",
            )
        update_data["code"] = new_code

    if "name" in update_data and update_data["name"]:
        update_data["name"] = update_data["name"].strip()

    for key, value in update_data.items():
        setattr(db_category, key, value)

    db_category.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_category)
    return db_category


@router.delete("/{id}", response_model=ActivityCategoryResponse)
def delete_category(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Soft-delete a category by setting is_active=False. Requires admin or vicerrectorado permissions."""
    check_category_manage_permission(current_user)

    db_category = db.query(ActivityCategory).filter(ActivityCategory.id == id).first()
    if not db_category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    db_category.is_active = False
    db_category.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_category)
    return db_category
