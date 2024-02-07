import json
from typing import Any

from fastapi import Form

from app.schemas.base import BaseSchema


class SlackCommandDataSchema(BaseSchema):
    token: str
    team_id: str
    team_domain: str
    enterprise_id: str | None = None
    enterprise_name: str | None = None
    channel_id: str
    channel_name: str
    user_id: str
    user_name: str
    command: str
    text: str | None
    response_url: str
    trigger_id: str
    api_app_id: str

    @classmethod
    def as_form(
        cls,
        token: str = Form(...),
        team_id: str = Form(...),
        team_domain: str = Form(...),
        enterprise_id: str | None = Form(None),
        enterprise_name: str | None = Form(None),
        channel_id: str = Form(...),
        channel_name: str = Form(...),
        user_id: str = Form(...),
        user_name: str = Form(...),
        command: str = Form(...),
        text: str | None = Form(None),
        response_url: str = Form(...),
        trigger_id: str = Form(...),
        api_app_id: str = Form(...),
    ):
        return cls(
            token=token,
            team_id=team_id,
            team_domain=team_domain,
            enterprise_id=enterprise_id,
            enterprise_name=enterprise_name,
            channel_id=channel_id,
            channel_name=channel_name,
            user_id=user_id,
            user_name=user_name,
            command=command,
            text=text,
            response_url=response_url,
            trigger_id=trigger_id,
            api_app_id=api_app_id,
        )


class SlackInteractionPayloadSchema(BaseSchema):
    pass


class SlackInteractionSchema(BaseSchema):
    payload: dict[str, Any]

    @classmethod
    def as_form(cls, payload: str = Form(...)):
        return cls(payload=json.loads(payload))
