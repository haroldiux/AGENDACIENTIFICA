from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, DateTime, Enum, Text, Table
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.db.base_class import Base

class RoleEnum(str, enum.Enum):
    super_admin = "super_admin"
    admin = "admin"
    research = "research"
    coordinator = "coordinator"
    teacher = "teacher"
    read_only = "read_only"
    vicerrectorado = "vicerrectorado"
    director_investigacion = "director_investigacion"
    jefe_investigacion = "jefe_investigacion"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    role = Column(Enum(RoleEnum), default=RoleEnum.teacher, nullable=False)
    is_active = Column(Boolean, default=True)
    phone_number = Column(String, nullable=True)
    telegram_chat_id = Column(String, nullable=True)

    careers = relationship("Career", secondary="user_career", back_populates="users")

user_career_association = Table(
    "user_career",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("career_id", Integer, ForeignKey("careers.id"), primary_key=True)
)

sede_career_association = Table(
    "sede_career",
    Base.metadata,
    Column("sede_id", Integer, ForeignKey("sedes.id"), primary_key=True),
    Column("career_id", Integer, ForeignKey("careers.id"), primary_key=True)
)

scientific_activity_collaboration_careers = Table(
    "scientific_activity_collaboration_careers",
    Base.metadata,
    Column("activity_id", Integer, ForeignKey("scientific_activities.id"), primary_key=True),
    Column("career_id", Integer, ForeignKey("careers.id"), primary_key=True)
)

class Sede(Base):
    __tablename__ = "sedes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    
    careers = relationship("Career", secondary=sede_career_association, back_populates="sedes")

class Career(Base):
    __tablename__ = "careers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    faculty = Column(String, index=True, nullable=False)

    academic_activities = relationship("AcademicActivity", back_populates="career")
    scientific_activities = relationship("ScientificActivity", back_populates="career")
    sedes = relationship("Sede", secondary=sede_career_association, back_populates="careers")
    users = relationship("User", secondary="user_career", back_populates="careers")

class Gestion(Base):
    __tablename__ = "gestiones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    academic_activities = relationship("AcademicActivity", back_populates="gestion")
    scientific_activities = relationship("ScientificActivity", back_populates="gestion")

class ActivityCategory(Base):
    __tablename__ = "activity_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    scope = Column(String, nullable=False, default="both")  # 'academic', 'scientific', 'both'
    color = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class AcademicActivity(Base):
    __tablename__ = "academic_activities"

    id = Column(Integer, primary_key=True, index=True)
    career_id = Column(Integer, ForeignKey("careers.id"), nullable=True)
    gestion_id = Column(Integer, ForeignKey("gestiones.id"))
    category_id = Column(Integer, ForeignKey("activity_categories.id"), nullable=True)
    title = Column(String, index=True, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    start_time = Column(String, nullable=True)
    end_time = Column(String, nullable=True)
    category = Column(String, nullable=False)
    origin_color = Column(String)

    career = relationship("Career", back_populates="academic_activities")
    gestion = relationship("Gestion", back_populates="academic_activities")
    activity_category = relationship("ActivityCategory")

class ScientificActivityType(str, enum.Enum):
    congreso = "congreso"
    webinar = "webinar"
    defensa = "defensa"
    feria = "feria"
    olimpiada = "olimpiada"
    master_class = "master_class"

class ScientificActivityStatus(str, enum.Enum):
    scheduled = "scheduled"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"

class ScientificActivity(Base):
    __tablename__ = "scientific_activities"

    id = Column(Integer, primary_key=True, index=True)
    career_id = Column(Integer, ForeignKey("careers.id"), nullable=True)
    gestion_id = Column(Integer, ForeignKey("gestiones.id"))
    category_id = Column(Integer, ForeignKey("activity_categories.id"), nullable=True)
    title = Column(String, index=True, nullable=False)
    activity_type = Column(Enum(ScientificActivityType), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    start_time = Column(String, nullable=True)
    end_time = Column(String, nullable=True)
    responsible_name = Column(String, nullable=False)
    status = Column(Enum(ScientificActivityStatus), default=ScientificActivityStatus.scheduled, nullable=False)
    evidence_url = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    career = relationship("Career", back_populates="scientific_activities")
    gestion = relationship("Gestion", back_populates="scientific_activities")
    evidences = relationship("ScientificActivityEvidence", back_populates="scientific_activity", cascade="all, delete-orphan")
    audits = relationship("ScientificActivityAudit", back_populates="scientific_activity", cascade="all, delete-orphan")
    activity_category = relationship("ActivityCategory")
    collaboration_careers = relationship("Career", secondary=scientific_activity_collaboration_careers, viewonly=False)

    @property
    def collaboration_career_ids(self):
        return [c.id for c in self.collaboration_careers]

class ScientificActivityEvidence(Base):
    __tablename__ = "scientific_activity_evidences"

    id = Column(Integer, primary_key=True, index=True)
    scientific_activity_id = Column(Integer, ForeignKey("scientific_activities.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    scientific_activity = relationship("ScientificActivity", back_populates="evidences")
    uploaded_by = relationship("User")

class ScientificActivityAudit(Base):
    __tablename__ = "scientific_activity_audits"

    id = Column(Integer, primary_key=True, index=True)
    scientific_activity_id = Column(Integer, ForeignKey("scientific_activities.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)  # 'CREACION', 'EDICION', 'CAMBIO_ESTADO', 'SUBIDA_EVIDENCIA', 'ELIMINACION_EVIDENCIA'
    description = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    scientific_activity = relationship("ScientificActivity", back_populates="audits")
    user = relationship("User")

