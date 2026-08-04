from pydantic import BaseModel, ConfigDict, Field, model_validator
from datetime import date
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
    responsible_name: Optional[str] = None
    career_id: int
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
    role: RoleEnum = RoleEnum.teacher

class UserCreate(UserBase):
    password: str
    career_ids: List[int] = []

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

# --- Academic Activity Schemas ---
class AcademicActivityBase(BaseModel):
    title: str
    start_date: date
    end_date: date
    category: str
    origin_color: Optional[str] = None

class AcademicActivityCreate(AcademicActivityBase):
    career_id: int
    gestion_id: int

class AcademicActivityUpdate(BaseModel):
    title: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    category: Optional[str] = None
    origin_color: Optional[str] = None

class AcademicActivityResponse(AcademicActivityBase):
    id: int
    career_id: int
    gestion_id: int
    model_config = ConfigDict(from_attributes=True)

# --- Scientific Activity Schemas ---
class ScientificActivityBase(BaseModel):
    title: str
    activity_type: ScientificActivityType
    start_date: date
    end_date: date
    responsible_name: str
    notes: Optional[str] = None

class ScientificActivityCreate(ScientificActivityBase):
    career_id: int
    gestion_id: int

class ScientificActivityUpdate(BaseModel):
    title: Optional[str] = None
    activity_type: Optional[ScientificActivityType] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    responsible_name: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[ScientificActivityStatus] = None

class ScientificActivityStatusUpdate(BaseModel):
    status: ScientificActivityStatus
    evidence_url: Optional[str] = None

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

class ScientificActivityResponse(ScientificActivityBase):
    id: int
    career_id: int
    gestion_id: int
    status: ScientificActivityStatus
    evidence_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# --- Fusion Schemas ---
class MergedCalendarItem(BaseModel):
    id: int
    title: str
    start_date: date
    end_date: date
    source_type: str # 'academic' or 'scientific'
    # Additional common or specific fields can be optional
    category: Optional[str] = None
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
    activity_type: Optional[ScientificActivityType] = None
    category: Optional[str] = None
    responsible_name: Optional[str] = None
    career_id: int
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
    career_id: int
    gestion_id: int
    format: str
    report_type: Literal["table", "research-agenda", "conflict"] = "table"

