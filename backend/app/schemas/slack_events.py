import enum
from typing import Annotated, Any, Literal, Union

from pydantic import ConfigDict, Discriminator, Tag

from .base import BaseSchema


class EventTypes(str, enum.Enum):
    MEMBER_JOINED_CHANNEL = "member_joined_channel"


class BaseEventTypeSchema(BaseSchema):
    """Base class for all event type schemas"""

    user: str
    model_config = ConfigDict(extra="allow")


class CatchAllEventType(BaseEventTypeSchema):
    """This is used as a fallback when we encounter an event type that doesn't yet have a pydantic schema"""

    type: str


class MemberJoinedChannelEvenType(BaseEventTypeSchema):
    type: Literal[EventTypes.MEMBER_JOINED_CHANNEL]
    channel: str
    channel_type: str
    team: str
    event_ts: str


def get_discriminator_value(v: dict[str, Any]) -> str:
    try:
        event_type_enum = EventTypes(v.get("type"))
        return event_type_enum
    except ValueError:
        return "fallback"


SlackEventTypesSchema = Annotated[
    Union[
        Annotated[MemberJoinedChannelEvenType, Tag(EventTypes.MEMBER_JOINED_CHANNEL)],
        Annotated[CatchAllEventType, Tag("fallback")],
    ],
    Discriminator(get_discriminator_value),
]
