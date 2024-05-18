import functools
import threading
import typing
from collections import defaultdict
from multiprocessing import Process
from queue import Queue
from typing import Callable

import structlog
from kafka import KafkaConsumer
from kafka.consumer.fetcher import ConsumerRecord
from pydantic import BaseModel

from app.env import settings
from app.schemas.events import Topics

NUM_OF_WORKERS = 2
NUM_OF_THREADS = 2
GROUP_ID = "events-stream"
logger = structlog.get_logger(logger_name=__name__)


class FastStream:
    def __init__(self) -> None:
        self.routes: dict[Topics, list[Callable]] = {}

    def add_router(self, router: "StreamRouter") -> None:
        self.routes.update(router.routes)

    def start(self):
        workers: list[Process] = []
        while True:
            alive_processes = len([p for p in workers if p.is_alive()])
            if alive_processes == NUM_OF_WORKERS:
                continue

            for _ in range(NUM_OF_WORKERS - alive_processes):
                p = Process(target=self._consume, daemon=True)
                p.start()
                workers.append(p)
                logger.info("Starting worker", id=p.pid)

    def _consume(self):
        """Start the server"""
        topics = [key.value for key in self.routes.keys()]

        consumer = KafkaConsumer(bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS, group_id=GROUP_ID)
        consumer.subscribe(topics=topics)

        queue = Queue(maxsize=NUM_OF_THREADS)

        for msg in consumer:
            queue.put(msg)
            t = threading.Thread(target=self._process_message, args=(queue, consumer))
            t.start()

        consumer.close()

    def _process_message(self, queue: Queue, consumer: KafkaConsumer):
        msg: ConsumerRecord = queue.get(timeout=60)
        registered_functions = self.routes[msg.topic]
        kwargs = {}

        for func in registered_functions:
            for key, hint in typing.get_type_hints(func).items():
                print(key, hint)
                if issubclass(hint, BaseModel):
                    kwargs[key] = hint.model_validate_json(msg.value)
                else:
                    raise Exception("Unknown parameter type")

            logger.info("Handling message", topic=msg.topic, kwargs=kwargs)
            func(**kwargs)

        queue.task_done()
        consumer.commit()


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


class StreamProducer:
    def __init__(self):
        pass

    def emit(self, task: str):
        pass
