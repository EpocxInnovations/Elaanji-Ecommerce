"""
Thin wrapper around Cloudinary's upload API. If credentials aren't configured
yet, this fails loudly with a 503 rather than silently accepting an image
and losing it — the admin panel should never look like an upload succeeded
when it didn't.
"""
import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

_configured = False


def _ensure_configured():
    global _configured
    if _configured:
        return
    if not all([settings.cloudinary_cloud_name, settings.cloudinary_api_key, settings.cloudinary_api_secret]):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Image storage is not configured on this server yet",
        )
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )
    _configured = True


def upload_image(file: UploadFile, folder: str = "elaanji/products") -> str:
    _ensure_configured()
    result = cloudinary.uploader.upload(file.file, folder=folder, resource_type="image")
    return result["secure_url"]
