import json
from typing import Annotated, Union

import structlog
import typer

from app.db import session_factory
from app.repos import TaskRepo
from app.services.bg.job_scheduler import BackgroundJobScheduler
from app.utils import setup_logger

setup_logger()
logger = structlog.get_logger(logger_name="worker.cli")
app = typer.Typer(no_args_is_help=True)


@app.command()
def start_bg_scheduler():
    worker = BackgroundJobScheduler()
    worker.start()


@app.command()
def produce_tasks(name: str, queue: str = "default", payload: Annotated[Union[str, None], typer.Option()] = None):
    session = session_factory()
    job_service = TaskRepo(session=session)

    job_service.queue_task(name, queue, payload=json.loads(payload) if payload else None)
    session.commit()


conf = {
    "bootstrap.servers": "kafka:9092",
}


@app.command()
def kafka_producer():
    import time

    from kafka import KafkaAdminClient, KafkaProducer

    admin = KafkaAdminClient(bootstrap_servers=conf["bootstrap.servers"])

    producer = KafkaProducer(bootstrap_servers=conf["bootstrap.servers"])
    index = 0
    while True:
        msg = {"incident_id": f"abc_{index}"}
        producer.send("incident.model_created", value=json.dumps(msg).encode("utf8"))
        index += 1
        time.sleep(1)


@app.command()
def kafka_consumer():
    from kafka import KafkaConsumer

    consumer = KafkaConsumer(
        "incident.model_created",
        "incident.role_assigned",
        group_id="test",
        bootstrap_servers=conf["bootstrap.servers"],
    )
    # consumer.subscribe(["test-topic"])

    for msg in consumer:
        print(msg.value)


if __name__ == "__main__":
    app()
