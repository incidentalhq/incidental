import signal
import threading
import time
import typing
from types import FrameType
from typing import Type

import structlog
import typer
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import session_factory
from app.models.job import Job, JobStatus
from app.repos import TaskRepo
from app.tasks import *
from app.tasks.base import BaseTask
from app.utils import setup_logger

setup_logger()
logger = structlog.get_logger(logger_name="worker")
app = typer.Typer(no_args_is_help=True)


class BackgroundJobScheduler:
    def __init__(self):
        self.session = session_factory()
        self.job_service = TaskRepo(session=self.session)
        self.exit_flag = False
        self.max_tasks = 10
        self.total_running_tasks = 0
        self._lock = threading.Lock()

        # For ctrl-c from terminal
        signal.signal(signal.SIGINT, self.signal_handler)
        # for normal Unix usage
        signal.signal(signal.SIGTERM, self.signal_handler)

    def add_task(self, func):
        pass

    def start(self):
        logger.info("Starting", max_tasks=self.max_tasks)

        while True:
            if self.exit_flag:
                logger.info("Exiting")
                return

            fetch_size = self.max_tasks - self.total_running_tasks
            if fetch_size == 0:
                logger.info("Max tasks running")
                time.sleep(0.1)
                continue

            jobs = self.job_service.get_pending_tasks(limit=fetch_size)
            if not jobs:
                logger.info("No tasks found")
                time.sleep(1)
                continue

            for job in jobs:
                logger.info("Starting new task", job_id=job.id, current_running_tasks=self.total_running_tasks)
                job.status = JobStatus.PROCESSING
                task_thread = threading.Thread(target=self.work, daemon=True, args=(job.id,))
                task_thread.start()

                self.total_running_tasks += 1

            self.session.commit()

    def signal_handler(self, signal: int, frame: FrameType | None) -> None:
        logger.info("Received exit signal", signal=signal)
        self.exit_flag = True

    def work(self, job_id: str) -> None:
        with session_factory() as session:
            job_service = TaskRepo(session=session)
            job = job_service.get_task(id=job_id)
            if job:
                try:
                    self.run_job(job, session)
                    job.status = JobStatus.PROCESSED
                except Exception as e:
                    job.status = JobStatus.ERROR
                    job.exception = str(e)
                    logger.exception("Problem with processing this task", job_id=job_id)
                finally:
                    session.commit()

            self.total_running_tasks -= 1

    def run_job(self, job: Job, session: Session):
        logger.info("Preparing to run new task", job_id=job.id)

        job_class: Type[BaseTask] = globals().get(job.name, None)
        if not job_class:
            raise Exception("Task class not found")

        kwargs = {}
        for key, hint in typing.get_type_hints(job_class.execute).items():
            if issubclass(hint, BaseModel):
                kwargs[key] = hint.model_validate(job.payload)
            else:
                raise Exception("Unknown parameter type")

        logger.info("Running task", name=job.name)
        job_class_instance = job_class(session)
        job_class_instance.execute(**kwargs)
