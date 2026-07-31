from fastapi import APIRouter
from app.api.v1 import auth, careers, gestiones, academic, scientific, fusion, reports, sedes, actividades, importacion

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(careers.router, prefix="/careers", tags=["careers"])
api_router.include_router(gestiones.router, prefix="/gestiones", tags=["gestiones"])
api_router.include_router(academic.router, prefix="/academic", tags=["academic"])
api_router.include_router(scientific.router, prefix="/scientific", tags=["scientific"])
api_router.include_router(fusion.router, prefix="/fusion", tags=["fusion"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(sedes.router, prefix="/sedes", tags=["sedes"])
api_router.include_router(actividades.router, prefix="/actividades", tags=["actividades"])
api_router.include_router(importacion.router, prefix="", tags=["importacion"])
