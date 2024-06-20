import logging
import os
import re
import secrets
import string

import structlog
from structlog.contextvars import merge_contextvars


def setup_logger() -> None:
    """Setup structlog with defaults"""
    level_name = os.environ.get("LOGLEVEL", "DEBUG")
    level = logging.getLevelName(level_name)

    structlog.configure(
        processors=[
            merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.format_exc_info,
            structlog.dev.ConsoleRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(level),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=False,
    )


def to_channel_name(name: str) -> str:
    slug = name.lower()

    # Replace spaces with underscores
    slug = re.sub(r"\s+", "-", slug)

    # Remove special characters
    slug = re.sub(r"[^a-zA-Z0-9-]", "", slug)
    return slug


def generate_password(length: int = 16) -> str:
    """Generate a random password"""
    alphabet = string.ascii_letters + string.digits
    password = "".join(secrets.choice(alphabet) for i in range(length))
    return password
