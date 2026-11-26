import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.db.session import engine, Base
import app.models # Ensure all models are registered
from app.api.api import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("healthtwin-ai")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables if not present
    logger.info("Initializing database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="HealthTwin AI — Personalized AI-Powered Healthcare and Wellness API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Setup
origins = settings.cors_origin_list
if "*" not in origins:
    origins.extend(["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include versioned API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "online",
        "service": "HealthTwin AI Backend",
        "version": "1.0.0",
        "database": "connected"
    }

@app.get("/", tags=["System"])
def root():
    return {
        "message": "Welcome to HealthTwin AI API",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
