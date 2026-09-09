"""
Thin wrapper around Cloudinary's upload API. If credentials aren't configured
yet, this fails loudly with a 503 rather than silently accepting an image
and losing it — the admin panel should never look like an upload succeeded
when it didn't.
"""
import cloudinary
import cloudinary.uploader
import cloudinary.exceptions
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

_configured = False


def _ensure_configured():
    global _configured
    cloud_name = settings.cloudinary_cloud_name.strip()
    api_key = settings.cloudinary_api_key.strip()
    api_secret = settings.cloudinary_api_secret.strip()

    if not all([cloud_name, api_key, api_secret]) or api_secret.startswith("*"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Image storage is not configured properly. Please set valid CLOUDINARY_API_SECRET in backend/.env.",
        )
    if not _configured:
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True,
        )
        _configured = True


def upload_image(file: UploadFile, folder: str = "elaanji/products") -> str:
    _ensure_configured()
    try:
        result = cloudinary.uploader.upload(file.file, folder=folder, resource_type="image")
        return result["secure_url"]
    except cloudinary.exceptions.Error as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Cloudinary upload failed ({str(e)}). Please verify your CLOUDINARY_API_SECRET in backend/.env.",
        )

