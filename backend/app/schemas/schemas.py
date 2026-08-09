from pydantic import BaseModel, ConfigDict, Field, model_validator
from datetime import date, datetime
from typing import Optional, List, Literal
from enum import Enum

class ScientificActivityType(str, Enum):
    congreso = "congreso"
    webinar = "webinar"
    defensa = "defensa"
    feria = "feria"
    olimpiada = "olimpiada"
    master_class = "master_class"

class ScientificActivityStatus(str, Enum):
    scheduled = "scheduled"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"

# --- Sede Schemas ---
class SedeBase(BaseModel):
    name: str

class SedeCreate(SedeBase):
    pass

class SedeResponse(SedeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- ActivityCreate Schema (Unified) ---
class ActivityCreate(BaseModel):
    title: str
    start_date: date
    end_date: date
    activity_type: Optional[ScientificActivityType] = None
    category: Optional[str] = None
    category_id: Optional[int] = None
    responsible_name: Optional[str] = None
    career_id: Optional[int] = None
    gestion_id: int
    is_scientific: bool = False

# --- Career Schemas ---
class CareerBase(BaseModel):
    name: str
    faculty: str

class CareerCreate(CareerBase):
    pass

class CareerResponse(CareerBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- Role Enum ---
class RoleEnum(str, Enum):
    super_admin = "super_admin"
    admin = "admin"
    research = "research"
    coordinator = "coordinator"
    teacher = "teacher"
    read_only = "read_only"
    vicerrectorado = "vicerrectorado"
    director_investigacion = "director_investigacion"
    jefe_investigacion = "jefe_investigacion"

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- User Schemas ---
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    role: RoleEnum = RoleEnum.teacher

class UserCreate(UserBase):
    password: str
    career_ids: List[int] = []

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    email: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    careers: List[CareerResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

# --- Gestion Schemas ---
class GestionBase(BaseModel):
    name: str
    start_date: date
    end_date: date

class GestionCreate(GestionBase):
    pass

class GestionResponse(GestionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- Activity Category Schemas ---
class ActivityCategoryBase(BaseModel):
    name: str
    code: str
    scope: Literal['academic', 'scientific', 'both'] = 'both'
    color: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True

class ActivityCategoryCreate(ActivityCategoryBase):
    pass

class ActivityCategoryUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    scope: Optional[Literal['academic', 'scientific', 'both']] = None
    color: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class ActivityCategoryResponse(ActivityCategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Academic Activity Schemas ---
class AcademicActivityBase(BaseModel):
    title: str
    start_date: date
    end_date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    category: Optional[str] = "GENERAL"
    category_id: Optional[int] = None
    origin_color: Optional[str] = None

class AcademicActivityCreate(AcademicActivityBase):
    career_id: Optional[int] = None
    gestion_id: int

class AcademicActivityUpdate(BaseModel):
    title: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    category: Optional[str] = None
    category_id: Optional[int] = None
    origin_color: Optional[str] = None
    career_id: Optional[int] = None

class AcademicActivityResponse(AcademicActivityBase):
    id: int
    career_id: Optional[int] = None
    gestion_id: int
    activity_category: Optional[ActivityCategoryResponse] = None
    model_config = ConfigDict(from_attributes=True)

# --- Scientific Activity Evidence Schemas ---
class ScientificActivityEvidenceBase(BaseModel):
    filename: str
    file_type: str
    file_size: int

class ScientificActivityEvidenceCreate(ScientificActivityEvidenceBase):
    scientific_activity_id: int
    file_path: str
    uploaded_by_id: Optional[int] = None

class ScientificActivityEvidenceResponse(ScientificActivityEvidenceBase):
    id: int
    scientific_activity_id: int
    file_path: str
    uploaded_at: datetime
    uploaded_by_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

# --- Scientific Activity Schemas ---
class ScientificActivityBase(BaseModel):
    title: str
    activity_type: ScientificActivityType
    start_date: date
    end_date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    responsible_name: str
    notes: Optional[str] = None
    category_id: Optional[int] = None

class ScientificActivityCreate(ScientificActivityBase):
    career_id: Optional[int] = None
    gestion_id: int
    collaboration_career_ids: Optional[List[int]] = []

class ScientificActivityUpdate(BaseModel):
    title: Optional[str] = None
    activity_type: Optional[ScientificActivityType] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    responsible_name: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[ScientificActivityStatus] = None
    career_id: Optional[int] = None
    category_id: Optional[int] = None
    collaboration_career_ids: Optional[List[int]] = []

class ScientificActivityStatusUpdate(BaseModel):
    status: ScientificActivityStatus
    evidence_url: Optional[str] = None
    notes: Optional[str] = None

class ScientificActivityFilterParams(BaseModel):
    career_id: Optional[int] = Field(default=None, ge=1)
    gestion_id: Optional[int] = Field(default=None, ge=1)
    start_date: Optional[date] = Field(default=None)
    end_date: Optional[date] = Field(default=None)

    @model_validator(mode='after')
    def check_date_range(self) -> 'ScientificActivityFilterParams':
        if self.start_date is not None and self.end_date is not None and self.start_date > self.end_date:
            raise ValueError('start_date cannot be after end_date')
        return self

class ScientificActivityAuditResponse(BaseModel):
    id: int
    scientific_activity_id: int
    user_id: Optional[int] = None
    action: str
    description: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class ScientificActivityResponse(ScientificActivityBase):
    id: int
    career_id: Optional[int] = None
    gestion_id: int
    status: ScientificActivityStatus
    evidence_url: Optional[str] = None
    evidences: List[ScientificActivityEvidenceResponse] = []
    audits: List[ScientificActivityAuditResponse] = []
    activity_category: Optional[ActivityCategoryResponse] = None
    collaboration_career_ids: List[int] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# --- Fusion Schemas ---
class MergedCalendarItem(BaseModel):
    id: int
    title: str
    start_date: date
    end_date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    source_type: str # 'academic' or 'scientific'
    scope: str = "career" # 'global' or 'career'
    career_id: Optional[int] = None
    career_name: Optional[str] = None
    category: Optional[str] = None
    category_id: Optional[int] = None
    origin_color: Optional[str] = None
    activity_type: Optional[ScientificActivityType] = None
    status: Optional[ScientificActivityStatus] = None
    responsible_name: Optional[str] = None

class MergedCalendarResponse(BaseModel):
    items: List[MergedCalendarItem]

# --- Importation Schemas ---
class ActivityRowValidator(BaseModel):
    title: str
    start_date: date
    end_date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    activity_type: Optional[str] = None
    category: Optional[str] = None
    category_id: Optional[int] = None
    responsible_name: Optional[str] = None
    career_id: Optional[int] = None
    gestion_id: int
    is_scientific: bool = False


# --- Conflict Schemas ---
class ConflictItem(BaseModel):
    academic_id: int
    academic_title: str
    academic_start_date: date
    academic_end_date: date
    scientific_id: int
    scientific_title: str
    scientific_type: ScientificActivityType
    scientific_start_date: date
    scientific_end_date: date


class ConflictListResponse(BaseModel):
    conflicts: List[ConflictItem]


# --- Report Schemas ---
class ReportRequest(BaseModel):
    career_id: Optional[int] = None
    gestion_id: int
    format: str
    report_type: Literal[
        "table",
        "research-agenda",
        "conflict",
        "agenda-completa",
        "agenda-academica",
        "agenda-cientifica",
        "seguimiento-cumplimiento",
        "seguimiento",
    ] = "table"
    status_filter: Optional[str] = None


