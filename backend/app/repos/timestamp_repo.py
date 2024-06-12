from datetime import datetime
from typing import Any, Sequence

from sqlalchemy import select

from app.models import Incident, Organisation, Timestamp, TimestampKind, TimestampRule, TimestampValue
from app.schemas.actions import CreateTimestampSchema, PatchTimestampSchema

from .base_repo import BaseRepo


class TimestampRepo(BaseRepo):
    def get_timestamp_by_id(self, id: str) -> Timestamp:
        stmt = select(Timestamp).where(Timestamp.id == id).limit(1)
        return self.session.scalars(stmt).one()

    def create_custom_timestamp(self, organisation: Organisation, create_in: CreateTimestampSchema) -> Timestamp:
        """Create a new custom timestamp"""
        model = Timestamp()
        model.organisation_id = organisation.id
        model.label = create_in.label
        model.description = create_in.description
        model.kind = TimestampKind.CUSTOM
        model.rules = [TimestampRule(on_event="manual", first=False, last=False).model_dump()]
        model.can_delete = True

        self.session.add(model)
        self.session.flush()

        return model

    def create_timestamp(
        self,
        organisation: Organisation,
        label: str,
        kind: TimestampKind,
        rank: int,
        rules: list[dict[str, Any]],
        can_delete: bool,
    ) -> Timestamp:
        timestamp = Timestamp()
        timestamp.organisation_id = organisation.id
        timestamp.label = label
        timestamp.kind = kind
        timestamp.rank = rank
        timestamp.rules = rules
        timestamp.can_delete = can_delete

        self.session.add(timestamp)
        self.session.flush()

        return timestamp

    def create_timestamp_value(self, incident: Incident, timestamp: Timestamp, value: datetime) -> TimestampValue:
        """Create new timestamp value"""
        model = TimestampValue()
        model.incident_id = incident.id
        model.timestamp_id = timestamp.id
        model.value = value

        self.session.add(model)
        self.session.flush()

        return model

    def get_timestamp_values_for_incident(self, incident: Incident) -> Sequence[TimestampValue]:
        """Get all timestamp values for incident"""
        query = select(TimestampValue).where(TimestampValue.incident_id == incident.id)

        return self.session.scalars(query).all()

    def get_timestamp_by_kind(self, incident: Incident, kind: TimestampKind) -> Timestamp | None:
        """Get timestamp by kind"""
        stmt = (
            select(Timestamp)
            .where(Timestamp.organisation_id == incident.organisation_id, Timestamp.kind == kind)
            .limit(1)
        )

        return self.session.scalar(stmt)

    def get_timestamp_value(self, incident: Incident, timestamp: Timestamp) -> TimestampValue | None:
        """Get timestamp value for timestamp for an incident"""
        query = (
            select(TimestampValue)
            .where(TimestampValue.incident_id == incident.id, TimestampValue.timestamp_id == timestamp.id)
            .limit(1)
        )

        return self.session.scalar(query)

    def get_timestamps_for_organisation(self, organisation: Organisation) -> Sequence[Timestamp]:
        """Get timestamps for an organisation"""
        query = select(Timestamp).where(
            Timestamp.organisation_id == organisation.id,
            Timestamp.deleted_at.is_(None),
        )

        return self.session.scalars(query).all()

    def patch_timestamp(self, timestamp: Timestamp, patch_in: PatchTimestampSchema) -> None:
        pass

    def get_timestamp_by_label(self, organisation: Organisation, label: str) -> Timestamp | None:
        """Get timestamp by kind"""
        stmt = select(Timestamp).where(Timestamp.organisation_id == organisation.id, Timestamp.label == label).limit(1)

        return self.session.scalar(stmt)
