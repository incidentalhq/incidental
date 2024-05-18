import os

import structlog

from app.events.fast_stream import StreamProducer, StreamRouter
from app.schemas.events import IncidentModelCreated, IncidentUpdateModelCreated, Topics

logger = structlog.get_logger(logger_name=__name__)
router = StreamRouter()


@router.topic_consumer(Topics.INCIDENT_MODEL_CREATED)
def incident_model_created(params: IncidentModelCreated, producer: StreamProducer):
    return "ok"


@router.topic_consumer(Topics.INCIDENT_UPDATE_MODEL_CREATED)
def incident_update_model_created(params: IncidentUpdateModelCreated, producer: StreamProducer):
    return "ok"
