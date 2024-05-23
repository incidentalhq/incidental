from typing import Sequence

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Job
from app.models.job import JobStatus


class TaskRepo:
    DEFAULT_QUEUE = "default"

    def __init__(self, session: Session):
        self.session = session

    def get_pending_tasks(self, limit=10) -> Sequence[Job]:
        query = (
            select(Job)
            .where(Job.status == JobStatus.PENDING)
            .order_by(Job.created_at.desc())
            .with_for_update(skip_locked=True)
            .limit(limit=limit)
        )
        jobs = self.session.scalars(query).all()
        return jobs

    def queue_task(
        self,
        task_params: BaseModel,
        queue: str | None = None,
    ) -> Job:
        job = Job()

        job.name = task_params.task.__name__
        job.queue = queue if queue else self.DEFAULT_QUEUE
        job.status = JobStatus.PENDING
        job.payload = task_params.model_dump(exclude=set(["task"]))

        self.session.add(job)
        self.session.flush()

        return job

    def get_task(self, id: str) -> Job | None:
        query = select(Job).where(Job.id == id)
        return self.session.scalar(query)
