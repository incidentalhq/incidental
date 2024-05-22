import os
import threading
import typing
from multiprocessing import Process
from queue import Queue
from typing import Callable

import structlog
from kafka import KafkaConsumer
from kafka.consumer.fetcher import ConsumerRecord
from pydantic import BaseModel

from app.env import settings
from app.services.bg.event_emitter import EventEmitter

if typing.TYPE_CHECKING:
    from app.events.core.router import StreamRouter
    from app.schemas.events import Topics

NUM_OF_WORKERS = 2
NUM_OF_THREADS = 2
GROUP_ID = "events-stream"
logger = structlog.get_logger(logger_name=__name__)


class FastStream:
    def __init__(self) -> None:
        self.routes: dict["Topics", list[Callable]] = {}

    def add_router(self, router: "StreamRouter") -> None:
        self.routes.update(router.routes)

    def start(self) -> None:
        workers: list[Process] = []
        while True:
            alive_processes = len([p for p in workers if p.is_alive()])
            if alive_processes == NUM_OF_WORKERS:
                continue

            for _ in range(NUM_OF_WORKERS - alive_processes):
                p = Process(target=self._consume, daemon=True)
                p.start()
                workers.append(p)
                logger.info("Worker started", id=p.pid)

    def _consume(self) -> None:
        """Start the server"""
        topics = [key.value for key in self.routes.keys()]
        consumer = KafkaConsumer(bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS, group_id=GROUP_ID)
        consumer.subscribe(topics=topics)
        queue: Queue = Queue(maxsize=NUM_OF_THREADS)

        for msg in consumer:
            queue.put(msg)
            t = threading.Thread(target=self._process_message, args=(queue, consumer))
            t.start()

        consumer.close()

    def _process_message(self, queue: Queue, consumer: KafkaConsumer) -> None:
        msg: ConsumerRecord = queue.get(timeout=60)
        registered_functions = self.routes[msg.topic]
        kwargs = {}

        for func in registered_functions:
            for key, hint in typing.get_type_hints(func).items():
                if issubclass(hint, BaseModel):
                    kwargs[key] = hint.model_validate_json(msg.value)
                elif issubclass(hint, EventEmitter):
                    kwargs[key] = hint()
                else:
                    raise Exception("Unknown parameter type")

            logger.info(
                "Handling message",
                topic=msg.topic,
                tid=threading.get_ident(),
                pid=os.getpid(),
                event_id=self._get_event_id(msg.headers),
            )
            func(**kwargs)

        queue.task_done()
        consumer.commit()

    def _get_event_id(self, headers: list[tuple[str, bytes]]) -> str | None:
        for key, value in headers:
            if key == "event_id":
                return value.decode("utf8")
        return None
