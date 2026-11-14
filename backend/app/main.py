import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.v1.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure core admin user credentials on startup
    from app.db.session import SessionLocal
    from app.models.models import User, RoleEnum
    from app.core.security import get_password_hash, verify_password
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@unitepc.edu.bo").first()
        if not admin:
            admin = User(
                email="admin@unitepc.edu.bo",
                full_name="Administrador General UNITEPC",
                role=RoleEnum.super_admin,
                hashed_password=get_password_hash("unitepc123"),
                is_active=True,
            )
            db.add(admin)
            db.commit()
        else:
            if not verify_password("unitepc123", admin.hashed_password):
                admin.hashed_password = get_password_hash("unitepc123")
                admin.is_active = True
                db.commit()
    except Exception as e:
        print(f"Notice on startup ensuring core admin: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

cors_origins = [
    f"http://localhost:{port}" for port in range(3000, 3016)
] + [
    f"http://127.0.0.1:{port}" for port in range(3000, 3016)
] + [
    "http://localhost",
    "http://127.0.0.1",
    "https://agenda.unitepc.pro",
    "http://agenda.unitepc.pro",
]
if hasattr(settings, "BACKEND_CORS_ORIGINS") and settings.BACKEND_CORS_ORIGINS:
    for o in settings.BACKEND_CORS_ORIGINS:
        if str(o) not in cors_origins:
            cors_origins.append(str(o))

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|.*\.unitepc\.(pro|edu\.bo|solutions))(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Error interno del servidor: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": origin if origin else "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount(f"{settings.API_V1_STR}/uploads", StaticFiles(directory="uploads"), name="api_uploads")

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}
