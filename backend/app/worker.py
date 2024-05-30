import json

from celery import Celery
from kombu.serialization import register
from pydantic import BaseModel

from app.env import settings
from app.schemas import tasks


class PydanticSerializer(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, BaseModel):
            return obj.model_dump() | {"__type__": type(obj).__name__}
        else:
            return json.JSONEncoder.default(self, obj)


def pydantic_decoder(obj):
    if "__type__" in obj:
        if obj["__type__"] in dir(tasks):
            cls = getattr(tasks, obj["__type__"])
            return cls.parse_obj(obj)
    return obj


# Encoder function
def pydantic_dumps(obj):
    return json.dumps(obj, cls=PydanticSerializer)


# Decoder function
def pydantic_loads(obj):
    return json.loads(obj, object_hook=pydantic_decoder)


# Register new serializer methods into kombu
register(
    "pydantic",
    pydantic_dumps,
    pydantic_loads,
    content_type="application/x-pydantic",
    content_encoding="utf-8",
)

celery = Celery(__name__)

celery.conf.update(
    task_serializer="pydantic",
    result_serializer="pydantic",
    event_serializer="pydantic",
    accept_content=["application/json", "application/x-pydantic"],
    result_accept_content=["application/json", "application/x-pydantic"],
    imports=("app.tasks.celerytasks",),
    broker_url=settings.CELERY_BROKER_URL,
)
