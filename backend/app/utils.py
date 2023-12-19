import calendar
import logging
import os
import random
import typing
from datetime import datetime

import structlog
from structlog.contextvars import merge_contextvars
import shortuuid

ALPHABET = "bcdfghjklmnpqrstvwxyz0123456789BCDFGHJKLMNPQRSTVWXYZ"


def public_id_gen(prefix: str) -> typing.Callable[[], str]:
    id = shortuuid.uuid()
    return lambda: f"{prefix}_{id}"


def random_id(length: int) -> str:
    return "".join([random.choice(ALPHABET) for i in range(length)])


def to_timestamp(datetime: datetime) -> int:
    """Convert to UTC datetime"""
    return calendar.timegm(datetime.timetuple())


def to_datetime(timestamp: int) -> datetime:
    """Converts unix UTC time into a UTC datetime object"""
    return datetime.utcfromtimestamp(timestamp)


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
