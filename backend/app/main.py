import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

cors_origins = list(settings.BACKEND_CORS_ORIGINS) if hasattr(settings, "BACKEND_CORS_ORIGINS") and settings.BACKEND_CORS_ORIGINS else [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://127.0.0.1",
    "https://agenda.unitepc.pro",
    "http://agenda.unitepc.pro",
]
if "https://agenda.unitepc.pro" not in cors_origins:
    cors_origins.append("https://agenda.unitepc.pro")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|.*\.unitepc\.(pro|edu\.bo|solutions))(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount(f"{settings.API_V1_STR}/uploads", StaticFiles(directory="uploads"), name="api_uploads")

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}
