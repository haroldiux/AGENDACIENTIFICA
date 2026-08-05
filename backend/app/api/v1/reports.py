from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from typing import Dict, Any
from app.schemas.schemas import ReportRequest
from app.workers.reports_worker import generate_pdf_report_task, generate_excel_report_task
from app.core.celery_app import celery_app
from celery.result import AsyncResult
import os

router = APIRouter()

@router.post("/generate")
def generate_report(request: ReportRequest):
    if request.format == "pdf":
        task = generate_pdf_report_task.delay(request.career_id, request.gestion_id, request.report_type)
    elif request.format == "excel":
        task = generate_excel_report_task.delay(request.career_id, request.gestion_id, request.report_type)
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Must be 'pdf' or 'excel'")

    return {"task_id": task.id}

@router.get("/{task_id}/status")
def get_report_status(task_id: str):
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
def download_report(task_id: str):
    task_result = AsyncResult(task_id, app=celery_app)
    if task_result.state != "SUCCESS":
        raise HTTPException(status_code=400, detail="Report not ready or task failed")
    
    result = task_result.result
    file_path = result.get("file_path")
    file_name = result.get("file_name")
    
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    return FileResponse(path=file_path, filename=file_name)
