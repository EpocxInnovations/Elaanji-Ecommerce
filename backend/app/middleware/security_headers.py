"""
Production security middleware:
1. Adds cryptographic Request-ID tracing to requests and responses.
2. Injects standard OWASP security headers (HSTS, nosniff, frame options, referrer policy).
"""
import uuid
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Request-ID tracking
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id

        # Process downstream request
        response: Response = await call_next(request)

        # Inject security headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

        # Strict Transport Security in production/HTTPS
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response
