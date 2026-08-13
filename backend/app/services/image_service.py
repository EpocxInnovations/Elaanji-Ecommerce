"""
Upload handler with automatic fallback to local disk storage
when Cloudinary credentials are not configured or unreachable.
"""
import os
import uuid
import cloudinary
import cloudinary.uploader
import cloudinary.exceptions
from fastapi import UploadFile

from app.core.config import settings

# Base directory for local file uploads fallback
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")


def upload_image(file: UploadFile, folder: str = "elaanji/products") -> str:
    cloud_name = settings.cloudinary_cloud_name.strip()
    api_key = settings.cloudinary_api_key.strip()
    api_secret = settings.cloudinary_api_secret.strip()

    # Attempt Cloudinary upload if configured
    if all([cloud_name, api_key, api_secret]) and not api_secret.startswith("*"):
        try:
            cloudinary.config(
                cloud_name=cloud_name,
                api_key=api_key,
                api_secret=api_secret,
                secure=True,
            )
            result = cloudinary.uploader.upload(file.file, folder=folder, resource_type="image")
            return result["secure_url"]
        except Exception as exc:
            print(f"Cloudinary upload failed ({exc}), falling back to local file storage.")

    # Local file storage fallback
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_ext = os.path.splitext(file.filename or "image.jpg")[1] or ".jpg"
    unique_filename = f"{uuid.uuid4().hex}{file_ext.lower()}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    file.file.seek(0)
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    # Return local static URL
    return f"http://localhost:8000/uploads/{unique_filename}"
