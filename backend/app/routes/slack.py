import structlog
from fastapi import APIRouter, Request

from app.schemas.actions import SlackEventsSchema

logger = structlog.get_logger(logger_name=__name__)

router = APIRouter(tags=["Slack"])


@router.post("/events")
async def slack_events(slack_event: SlackEventsSchema):
    logger.info("request", body=slack_event)

    return {"challenge": slack_event.challenge}


@router.post("/slash/inc")
async def slack_slash_inc(request: Request):
    body = await request.body()
    logger.info("slash command", b=body)

    return "okay"
