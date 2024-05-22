import functools
from collections import defaultdict
from typing import Callable

from app.schemas.events import Topics


class StreamRouter:
    def __init__(self) -> None:
        self.routes: dict[Topics, list[Callable]] = defaultdict(list)

    def topic_consumer(self, topic: Topics):
        """Subscribe to a topic"""

        def decorator(func):
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                value = func(*args, **kwargs)
                return value

            self.routes[topic].append(wrapper)

            return wrapper

        return decorator
