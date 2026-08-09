from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.schemas.schemas import ReportRequest
from app.workers.reports_worker import generate_pdf_report_task, generate_excel_report_task
from app.core.celery_app import celery_app
from app.api.deps import require_read_only_get, get_db
from app.models.models import User
from celery.result import AsyncResult
from kombu.exceptions import OperationalError
import os

router = APIRouter()


def _check_celery_broker() -> None:
    """Raise 503 if the Celery broker is not reachable.

    This prevents the endpoint from hanging when Redis/Celery is down,
    giving the UI a clear failure path instead of a timeout.
    """
    try:
        with celery_app.broker_connection() as conn:
            conn.ensure_connection(max_retries=0, timeout=2)
    except (OperationalError, Exception):
        raise HTTPException(
            status_code=503,
            detail="PDF generation service is currently unavailable. Please try again later.",
        )


@router.post("/generate")
def generate_report(
    request: ReportRequest,
    current_user: User = Depends(require_read_only_get),
):
    _check_celery_broker()
    if request.format == "pdf":
        task = generate_pdf_report_task.delay(request.career_id, request.gestion_id, request.report_type, request.status_filter)
    elif request.format == "excel":
        task = generate_excel_report_task.delay(request.career_id, request.gestion_id, request.report_type, request.status_filter)
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Must be 'pdf' or 'excel'")

    return {"task_id": task.id}

@router.get("/{task_id}/status")
def get_report_status(
    task_id: str,
    current_user: User = Depends(require_read_only_get),
):
    task_result = AsyncResult(task_id, app=celery_app)
    if task_result.state == "PENDING":
        return {"status": "pending"}
    elif task_result.state == "SUCCESS":
        result = task_result.result
        if isinstance(result, dict) and result.get("status") == "failed":
            return {"status": "failed", "error": result.get("error")}
        return {"status": "completed", "result": result}
    elif task_result.state == "FAILURE":
        return {"status": "failed", "error": str(task_result.info)}
    else:
        return {"status": task_result.state}

@router.get("/{task_id}/download")
def download_report(
    task_id: str,
    current_user: User = Depends(require_read_only_get),
):
    task_result = AsyncResult(task_id, app=celery_app)
    if task_result.state != "SUCCESS":
        raise HTTPException(status_code=400, detail="Report not ready or task failed")
    
    result = task_result.result
    file_path = result.get("file_path")
    file_name = result.get("file_name")
    
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    return FileResponse(path=file_path, filename=file_name)


@router.get("/seguimiento/stats")
def get_seguimiento_stats(
    gestion_id: int,
    career_id: Optional[int] = None,
    current_user: User = Depends(require_read_only_get),
    db: Session = Depends(get_db),
):
    from app.workers.reports_worker import build_seguimiento_data
    return build_seguimiento_data(db, career_id, gestion_id)
