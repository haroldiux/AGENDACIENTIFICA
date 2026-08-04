from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Enum, Text, Table
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base

class RoleEnum(str, enum.Enum):
    super_admin = "super_admin"
    admin = "admin"
    research = "research"
    coordinator = "coordinator"
    teacher = "teacher"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    role = Column(Enum(RoleEnum), default=RoleEnum.teacher, nullable=False)
    is_active = Column(Boolean, default=True)

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

class AcademicActivity(Base):
    __tablename__ = "academic_activities"

    id = Column(Integer, primary_key=True, index=True)
    career_id = Column(Integer, ForeignKey("careers.id"))
    gestion_id = Column(Integer, ForeignKey("gestiones.id"))
    title = Column(String, index=True, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    category = Column(String, nullable=False)
    origin_color = Column(String)

    career = relationship("Career", back_populates="academic_activities")
    gestion = relationship("Gestion", back_populates="academic_activities")

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
    career_id = Column(Integer, ForeignKey("careers.id"))
    gestion_id = Column(Integer, ForeignKey("gestiones.id"))
    title = Column(String, index=True, nullable=False)
    activity_type = Column(Enum(ScientificActivityType), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    responsible_name = Column(String, nullable=False)
    status = Column(Enum(ScientificActivityStatus), default=ScientificActivityStatus.scheduled, nullable=False)
    evidence_url = Column(String)
    notes = Column(Text)

    career = relationship("Career", back_populates="scientific_activities")
    gestion = relationship("Gestion", back_populates="scientific_activities")
