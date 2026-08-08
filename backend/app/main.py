from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api import auth, admin_dashboard

app = FastAPI(
    title="Garments E-Commerce API",
    description="Backend for the garments storefront + admin panel.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.frontend_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin_dashboard.router)


@app.get("/api/health", tags=["health"])
def health_check():
    return {"status": "ok", "environment": settings.environment}
