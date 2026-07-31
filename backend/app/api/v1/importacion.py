from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
from pydantic import ValidationError
from io import BytesIO

from app.db.session import get_db
from app.models.models import AcademicActivity, ScientificActivity
from app.schemas.schemas import ActivityRowValidator

router = APIRouter()

@router.post("/upload-excel")
async def upload_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Invalid file format. Only Excel files are supported.")
    
    try:
        contents = await file.read()
        df = pd.read_excel(BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading Excel file: {str(e)}")
        
    records = df.to_dict('records')
    valid_academic = []
    valid_scientific = []
    errors = []
    
    for i, record in enumerate(records):
        clean_record = {k: v for k, v in record.items() if pd.notnull(v)}
        try:
            validated = ActivityRowValidator(**clean_record)
            
            if validated.is_scientific:
                if not validated.activity_type:
                    errors.append({"row": i + 2, "error": "activity_type is required for scientific activities"})
                    continue
                valid_scientific.append({
                    "title": validated.title,
                    "start_date": validated.start_date,
                    "end_date": validated.end_date,
                    "activity_type": validated.activity_type.value,
                    "responsible_name": validated.responsible_name or "Unknown",
                    "career_id": validated.career_id,
                    "gestion_id": validated.gestion_id,
                    "status": "scheduled",
                })
            else:
                if not validated.category:
                    errors.append({"row": i + 2, "error": "category is required for academic activities"})
                    continue
                valid_academic.append({
                    "title": validated.title,
                    "start_date": validated.start_date,
                    "end_date": validated.end_date,
                    "category": validated.category,
                    "career_id": validated.career_id,
                    "gestion_id": validated.gestion_id,
                })
        except ValidationError as e:
            errors.append({"row": i + 2, "error": str(e)})
    
    inserted_count = 0
    try:
        if valid_academic:
            db.bulk_insert_mappings(AcademicActivity, valid_academic)
            inserted_count += len(valid_academic)
        if valid_scientific:
            db.bulk_insert_mappings(ScientificActivity, valid_scientific)
            inserted_count += len(valid_scientific)
        
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database insertion failed: {str(e)}")
    
    return {
        "inserted_count": inserted_count,
        "errors": errors
    }
