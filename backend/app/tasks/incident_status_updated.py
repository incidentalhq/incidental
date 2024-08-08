from datetime import datetime, timezone

import structlog

from app.models import Incident, IncidentStatus, IncidentStatusCategoryEnum, Timestamp, TimestampRule
from app.repos import IncidentRepo, TimestampRepo
from app.schemas.tasks import IncidentStatusUpdatedTaskParameters

from .base import BaseTask

logger = structlog.get_logger(logger_name=__name__)


class IncidentStatusUpdatedTask(BaseTask["IncidentStatusUpdatedTaskParameters"]):
    def execute(self, parameters: "IncidentStatusUpdatedTaskParameters"):
        incident_repo = IncidentRepo(session=self.session)

        new_status = incident_repo.get_incident_status_by_id_or_throw(parameters.new_status_id)
        old_status = incident_repo.get_incident_status_by_id_or_throw(parameters.old_status_id)

        if not new_status or not old_status:
            raise RuntimeError("Could not find new status or old status")

        incident = incident_repo.get_incident_by_id(id=parameters.incident_id)
        if not incident:
            raise RuntimeError("could not find incident")

        triggers = self.get_rule_triggers(new_status=new_status, old_status=old_status)

        self._add_timestamp(incident=incident, triggers=triggers)

        self.session.commit()

    def get_rule_triggers(self, new_status: IncidentStatus, old_status: IncidentStatus) -> list[str]:
        """Get matching triggers for status change"""
        triggers: list[str] = []

        # transition from triage to active
        if (
            old_status.category == IncidentStatusCategoryEnum.TRIAGE
            and new_status.category == IncidentStatusCategoryEnum.ACTIVE
        ):
            triggers.append("incident.accepted")

        # transition from active to closed
        if (
            new_status.category == IncidentStatusCategoryEnum.CLOSED
            and old_status.category == IncidentStatusCategoryEnum.ACTIVE
        ):
            triggers.append("incident.closed")

        # transition from active to close or post-incident flow
        if (
            new_status.category == IncidentStatusCategoryEnum.POST_INCIDENT
            or new_status.category == IncidentStatusCategoryEnum.CLOSED
            and old_status.category == IncidentStatusCategoryEnum.ACTIVE
        ):
            triggers.append("incident.resolved")

        return triggers

    def _add_timestamp(self, incident: Incident, triggers: list[str]):
        """If the reported at timestamp is active; create a new timestamp value for the incident"""
        timestamp_repo = TimestampRepo(session=self.session)

        timestamps = timestamp_repo.get_timestamps_for_organisation(organisation=incident.organisation)

        for timestamp in timestamps:
            rule = TimestampRule.model_validate(timestamp.rules[0])
            for trigger in triggers:
                if trigger == rule.on_event:
                    self._apply_timestamp(timestamp, incident)

    def _apply_timestamp(self, timestamp: Timestamp, incident: Incident) -> None:
        timestamp_repo = TimestampRepo(session=self.session)
        value = timestamp_repo.get_timestamp_value(incident=incident, timestamp=timestamp)

        rule = TimestampRule.model_validate(timestamp.rules[0])

        # no previous value, always create the timestamp
        if not value:
            timestamp_repo.create_timestamp_value(
                incident=incident, timestamp=timestamp, value=datetime.now(tz=timezone.utc)
            )
            logger.info("Creating timestamp value", label=timestamp.label, incident=incident.id)
        else:
            if rule.last:
                value.value = datetime.now(tz=timezone.utc)
                logger.info("Updating timestamp value", label=timestamp.label, incident=incident.id)
