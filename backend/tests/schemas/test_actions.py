import pytest
from pydantic import ValidationError

from app.schemas.actions import PatchIncidentTimestampsSchema


def test_update_incident_timezone_schema_invalid():
    with pytest.raises(ValidationError, match="Invalid timezone"):
        PatchIncidentTimestampsSchema(timezone="xxx", values={})


def test_update_incident_timezone_schema_valid_timezone():
    schema = PatchIncidentTimestampsSchema(timezone="Europe/London", values={})
    assert schema.timezone is not None
