import pytest
from pydantic import ValidationError
from app.schemas.schemas import ActivityRowValidator
from app.api.v1.importacion import format_excel_error, parse_pydantic_validation_error, COLUMN_USER_LABELS

def test_format_excel_error_structure():
    err = format_excel_error(
        row_num=71,
        sheet_name="Actividades Académicas",
        column_name="gestion",
        activity_title="Cierre de revista",
        explanation="La columna 'gestion' es obligatoria."
    )
    assert err["row"] == 71
    assert err["sheet"] == "Actividades Académicas"
    assert err["column"] == "gestion"
    assert err["activity"] == "Cierre de revista"
    assert "Fila 71" in err["error"]
    assert "gestion" in err["error"]
    assert err["message"] == "La columna 'gestion' es obligatoria."

def test_parse_pydantic_validation_error_missing_field():
    raw_data = {
        "title": "Actividad sin fechas",
        "gestion_id": 20,
    }
    try:
        ActivityRowValidator(**raw_data)
        pytest.fail("Should have raised ValidationError")
    except ValidationError as e:
        parsed = parse_pydantic_validation_error(
            e=e,
            excel_row=15,
            sheet_name="Actividades Científicas",
            title_val="Actividad sin fechas"
        )
        assert len(parsed) >= 1
        cols = [p["column"] for p in parsed]
        # start_date should be among missing fields mapped to fecha_inicio
        assert "fecha_inicio" in cols
        for item in parsed:
            assert item["row"] == 15
            assert item["sheet"] == "Actividades Científicas"
            assert item["activity"] == "Actividad sin fechas"
            assert "fecha_inicio" in item["error"] or "end_date" in item["error"] or "fecha_fin" in item["error"]

def test_column_user_labels_mapping():
    assert COLUMN_USER_LABELS["gestion_id"] == "gestion"
    assert COLUMN_USER_LABELS["start_date"] == "fecha_inicio"
    assert COLUMN_USER_LABELS["end_date"] == "fecha_fin"
    assert COLUMN_USER_LABELS["career_id"] == "carrera"
    assert COLUMN_USER_LABELS["title"] == "titulo"
