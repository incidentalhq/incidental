from typing import TYPE_CHECKING, Any, Sequence, Type

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Job
from app.models.job import JobStatus

if TYPE_CHECKING:
    from app.jobs.base import BaseTask


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
        name_or_class: str | Type["BaseTask"],
        queue: str | None = None,
        payload: dict[str, Any] | BaseModel | None = None,
    ) -> Job:
        job = Job()

        if isinstance(name_or_class, str):
            job.name = name_or_class
        else:
            job.name = name_or_class.__name__

        job.queue = queue if queue else self.DEFAULT_QUEUE
        job.status = JobStatus.PENDING

        if payload is not None:
            if isinstance(payload, dict):
                job.payload = payload
            elif isinstance(payload, BaseModel):
                job.payload = payload.model_dump()

        self.session.add(job)
        self.session.flush()

        return job

    def get_task(self, id: str) -> Job | None:
        query = select(Job).where(Job.id == id)
        return self.session.scalar(query)
