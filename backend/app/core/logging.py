"""
Structured logging module for production telemetry and audit readiness.
"""
import logging
import sys
from typing import Any, Dict


class ContextualFormatter(logging.Formatter):
    """Formats log records with standard timestamp, severity, and context."""

    def format(self, record: logging.LogRecord) -> str:
        # Standard attributes
        time_str = self.formatTime(record, "%Y-%m-%d %H:%M:%S")
        level = record.levelname.ljust(5)
        name = record.name
        msg = record.getMessage()

        # Extra context
        req_id = getattr(record, "request_id", "-")
        user_id = getattr(record, "user_id", "-")

        formatted = f"[{time_str}] [{level}] [{name}] [req:{req_id}] [user:{user_id}] {msg}"
        if record.exc_info:
            formatted += "\n" + self.formatException(record.exc_info)
        return formatted


def setup_logging(log_level: str = "INFO") -> logging.Logger:
    """Configures application-wide root and uvicorn loggers."""
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    # Clear existing handlers
    if root_logger.handlers:
        root_logger.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(ContextualFormatter())
    root_logger.addHandler(handler)

    # Align uvicorn logger
    logging.getLogger("uvicorn.access").handlers = [handler]
    logging.getLogger("uvicorn.error").handlers = [handler]

    app_logger = logging.getLogger("elaanji")
    app_logger.info("Structured contextual logging initialized successfully.")
    return app_logger


logger = logging.getLogger("elaanji")
