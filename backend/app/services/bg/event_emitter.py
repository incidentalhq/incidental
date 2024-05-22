from kafka import KafkaProducer
from shortuuid import uuid

from app.env import settings
from app.schemas.events import BaseEvent

global_producer: KafkaProducer | None = None


class EventEmitter:
    def __init__(self) -> None:
        global global_producer

        if global_producer is None:
            global_producer = KafkaProducer(bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS)

        self.producer = global_producer

    def emit(self, event: BaseEvent):
        self.producer.send(
            event._topic.value,
            value=event.model_dump_json().encode("utf8"),
            headers=[("event_id", uuid().encode("utf8"))],
        )
