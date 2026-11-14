"""
Script de utilidad para vaciar todas las actividades (académicas y científicas)
junto con sus auditorías y evidencias, manteniendo intactos usuarios, sedes, carreras y gestiones.

Uso en local:
    docker exec unitepc_backend python scripts/clear_activities.py
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.models import (
    AcademicActivity,
    ScientificActivity,
    ScientificActivityEvidence,
    ScientificActivityAudit,
    scientific_activity_collaboration_careers,
)
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def clear_all_activities():
    db = SessionLocal()
    try:
        logger.info("Eliminando colaboraciones, evidencias y auditorías...")
        db.execute(scientific_activity_collaboration_careers.delete())
        deleted_audits = db.query(ScientificActivityAudit).delete()
        deleted_evidences = db.query(ScientificActivityEvidence).delete()

        logger.info("Eliminando actividades científicas y académicas...")
        deleted_sci = db.query(ScientificActivity).delete()
        deleted_acad = db.query(AcademicActivity).delete()

        db.commit()
        logger.info(
            f"Vaciado completado: {deleted_acad} académicas, {deleted_sci} científicas, "
            f"{deleted_evidences} evidencias y {deleted_audits} auditorías eliminadas."
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error al vaciar actividades: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    clear_all_activities()
