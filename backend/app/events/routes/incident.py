import structlog

from app.events.core.router import StreamRouter
from app.schemas.events import IncidentModelCreated, IncidentUpdateModelCreated, Topics
from app.services.bg.event_emitter import EventEmitter

logger = structlog.get_logger(logger_name=__name__)
router = StreamRouter()


@router.topic_consumer(Topics.INCIDENT_MODEL_CREATED)
def incident_model_created(params: IncidentModelCreated, emitter: EventEmitter):
    return "ok"


@router.topic_consumer(Topics.INCIDENT_UPDATE_MODEL_CREATED)
def incident_update_model_created(params: IncidentUpdateModelCreated, emitter: EventEmitter):
    emitter.emit(IncidentModelCreated(incident_id="xxxx"))

    return "ok"
