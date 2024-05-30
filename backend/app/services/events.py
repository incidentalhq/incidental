import typing

from pydantic import BaseModel

from app.worker import celery

prefix = "app.tasks"


class Events:
    def __init__(self):
        self.queued_events = []

    def queue_job(self, model: BaseModel):
        self.queued_events.append(model)

    def build_lookup(self):
        # load all celery tasks, do it here to avoid circular imports
        from app.tasks import celerytasks  # noqa: F401

        lookup = {}

        for task_name, task_func in celery.tasks.items():
            if task_name.startswith(prefix):
                hints = typing.get_type_hints(task_func)
                for param_name, type_ in hints.items():
                    lookup[type_] = task_func

        return lookup

    def commit(self):
        cache = self.build_lookup()

        for task_param in self.queued_events:
            func = cache.get(task_param.__class__)
            if func:
                func.apply_async([task_param])
