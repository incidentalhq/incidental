from datetime import datetime, timezone

import structlog

from app.models import Incident, TimestampKind, TimestampRule
from app.repos import IncidentRepo, TimestampRepo
from app.schemas.tasks import IncidentDeclaredTaskParameters

from .base import BaseTask

logger = structlog.get_logger(logger_name=__name__)


class IncidentDeclaredTask(BaseTask["IncidentDeclaredTaskParameters"]):
    def execute(self, parameters: "IncidentDeclaredTaskParameters"):
        incident_repo = IncidentRepo(session=self.session)

        incident = incident_repo.get_incident_by_id(id=parameters.incident_id)
        if not incident:
            raise RuntimeError("could not find incident")

        self._add_timestamp(incident=incident)

        self.session.commit()

    def _add_timestamp(self, incident: Incident):
        """If the reported at timestamp is active; create a new timestamp value for the incident"""
        timestamp_repo = TimestampRepo(session=self.session)
        timestamp = timestamp_repo.get_timestamp_by_kind(incident=incident, kind=TimestampKind.REPORTED_AT)
        if timestamp:
            value = timestamp_repo.get_timestamp_value(incident=incident, timestamp=timestamp)
            rule = TimestampRule.model_validate(timestamp.rules[0])
            if not value:
                timestamp_repo.create_timestamp_value(
                    incident=incident, timestamp=timestamp, value=datetime.now(tz=timezone.utc)
                )
                logger.info("Creating timestamp value")
            else:
                if rule.last:
                    value.value = datetime.now(tz=timezone.utc)
