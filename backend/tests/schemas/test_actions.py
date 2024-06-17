import pytest
from pydantic import ValidationError

from app.schemas.actions import UpdateIncidentTimestampsSchema


def test_update_incident_timezone_schema_invalid():
    with pytest.raises(ValidationError, match="Invalid timezone"):
        UpdateIncidentTimestampsSchema(timezone="xxx", values={})


def test_update_incident_timezone_schema_valid_timezone():
    schema = UpdateIncidentTimestampsSchema(timezone="Europe/London", values={})
    assert schema.timezone is not None
