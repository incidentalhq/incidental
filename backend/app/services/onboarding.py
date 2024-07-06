from typing import Any, TypedDict

import yaml

from app.models import (
    AnnouncementActions,
    AnnouncementFields,
    Form,
    FormFieldKind,
    FormKind,
    Organisation,
    Settings,
    TimestampKind,
)
from app.models.incident_role import IncidentRoleKind
from app.models.incident_status import IncidentStatusCategoryEnum
from app.repos import AnnouncementRepo, FormRepo, IncidentRepo, SeverityRepo, TimestampRepo


class CategoryItemType(TypedDict):
    name: str
    category: IncidentStatusCategoryEnum


class IncidentRoleItemType(TypedDict):
    name: str
    description: str
    kind: IncidentRoleKind
    slack_reference: str
    is_deletable: bool
    is_editable: bool


# data files
TIMESTAMPS_SEED_DATA_PATH = "/srv/scripts/timestamps.yaml"


class OnboardingService:
    def __init__(
        self,
        form_repo: FormRepo,
        severity_repo: SeverityRepo,
        incident_repo: IncidentRepo,
        announcement_repo: AnnouncementRepo,
        timestamp_repo: TimestampRepo,
    ):
        self.form_repo = form_repo
        self.severity_repo = severity_repo
        self.incident_repo = incident_repo
        self.announcement_repo = announcement_repo
        self.timestamp_repo = timestamp_repo

    def setup_organisation(self, organisation: Organisation) -> None:
        self._setup_forms(organisation)
        self._setup_severities(organisation)
        self._setup_incident_types(organisation)
        self._setup_incident_statuses(organisation)
        self._setup_settings(organisation)
        self._setup_incident_roles(organisation)
        self._setup_announcement(organisation)
        self._setup_timestamps(organisation)

    def _setup_forms(self, organisation: Organisation) -> list[Form]:
        # create incident form
        create_form = self.form_repo.create_form(
            organisation=organisation, name="Create incident", _type=FormKind.CREATE_INCIDENT
        )
        create_form_fields_descriptor: list[dict[str, Any]] = [
            {
                "name": "incident_name",
                "label": "Name",
                "is_required": True,
                "kind": FormFieldKind.TEXT,
                "description": "A descriptive name for the incident",
                "is_deletable": False,
            },
            {
                "name": "incident_type",
                "label": "Incident type",
                "is_required": True,
                "kind": FormFieldKind.INCIDENT_TYPE,
                "is_deletable": False,
            },
            {
                "name": "incident_severity",
                "label": "Severity",
                "is_required": True,
                "kind": FormFieldKind.SEVERITY_TYPE,
                "is_deletable": False,
            },
            {
                "name": "summary",
                "label": "Summary",
                "is_required": False,
                "kind": FormFieldKind.TEXTAREA,
                "description": "Give a summary of the current state of the incident.",
                "is_deletable": False,
            },
        ]
        self._create_form_fields(form=create_form, field_descriptions=create_form_fields_descriptor)

        # create a status update form
        update_status_form = self.form_repo.get_form(organisation=organisation, form_type=FormKind.UPDATE_INCIDENT)
        if not update_status_form:
            update_status_form = self.form_repo.create_form(
                organisation=organisation, name="Update status", _type=FormKind.UPDATE_INCIDENT
            )

        update_status_form_fields = [
            {
                "name": "incident_status",
                "label": "Status",
                "is_required": True,
                "kind": FormFieldKind.INCIDENT_STATUS,
                "is_deletable": False,
            },
            {
                "name": "incident_severity",
                "label": "Severity",
                "is_required": True,
                "kind": FormFieldKind.SEVERITY_TYPE,
                "is_deletable": False,
            },
            {
                "name": "summary",
                "label": "Summary",
                "is_required": False,
                "kind": FormFieldKind.TEXTAREA,
                "description": "Give a summary of the current state of the incident.",
                "is_deletable": False,
            },
        ]
        self._create_form_fields(form=update_status_form, field_descriptions=update_status_form_fields)

        return [create_form, update_status_form]

    def _create_form_fields(self, form: Form, field_descriptions: list[dict[str, Any]]):
        for idx, item in enumerate(field_descriptions):
            form_field = self.form_repo.get_form_field_by_name(form=form, name=item["name"])
            if not form_field:
                form_field = self.form_repo.create_form_field(
                    form=form,
                    name=item["name"],
                    kind=item["kind"],
                    label=item["label"],
                    is_required=item["is_required"],
                    position=idx,
                    description=item.get("description"),
                    is_deletable=item["is_deletable"],
                )

    def _setup_severities(self, organisation: Organisation):
        descriptors = [
            {"name": "Critical", "description": "A critical incident with very high impact"},
            {"name": "Major", "description": "A major incident with significant impact"},
            {"name": "Minor", "description": "A minor incident with low impact"},
        ]

        for idx, item in enumerate(descriptors):
            severity = self.severity_repo.get_severity_by_name(organisation=organisation, name=item["name"])
            if not severity:
                self.severity_repo.create_severity(
                    organisation=organisation,
                    name=item["name"],
                    description=item["description"],
                    rating=idx,
                )

    def _setup_incident_types(self, organisation: Organisation):
        descriptors = [
            {
                "name": "Default",
                "description": "Default incident type",
            },
        ]

        for item in descriptors:
            incident_type = self.incident_repo.get_incident_type_by_name(organisation=organisation, name=item["name"])
            if not incident_type:
                self.incident_repo.create_incident_type(
                    organisation=organisation, name=item["name"], description=item["description"]
                )

    def _setup_incident_statuses(self, organisation: Organisation):
        descriptors: list[CategoryItemType] = [
            {"name": "Triage", "category": IncidentStatusCategoryEnum.TRIAGE},
            {"name": "Investigating", "category": IncidentStatusCategoryEnum.ACTIVE},
            {"name": "Fixing", "category": IncidentStatusCategoryEnum.ACTIVE},
            {"name": "Monitoring", "category": IncidentStatusCategoryEnum.ACTIVE},
            {"name": "Documenting", "category": IncidentStatusCategoryEnum.POST_INCIDENT},
            {"name": "Closed", "category": IncidentStatusCategoryEnum.CLOSED},
        ]

        for idx, item in enumerate(descriptors):
            status = self.incident_repo.get_incident_status_by_name(organisation=organisation, name=item["name"])
            if not status:
                self.incident_repo.create_incident_status(
                    organisation=organisation,
                    name=item["name"],
                    sort_order=idx,
                    category=item["category"],
                )

    def _setup_settings(self, organisation: Organisation) -> None:
        if not organisation.settings:
            model = Settings()
            model.organisation_id = organisation.id
            model.slack_announcement_channel_name = "incidents"

            self.incident_repo.session.add(model)
            self.incident_repo.session.flush()

    def _setup_incident_roles(self, organisation: Organisation) -> None:
        descriptors: list[IncidentRoleItemType] = [
            {
                "name": "Reporter",
                "kind": IncidentRoleKind.REPORTER,
                "description": "The user responsible for first reporting the incident",
                "slack_reference": "reporter",
                "is_deletable": False,
                "is_editable": False,
            },
            {
                "name": "Incident Lead",
                "kind": IncidentRoleKind.LEAD,
                "description": "An incident lead coordinates and directs the response to an emergency or crisis, guiding teams to efficiently resolve and mitigate the situation",
                "slack_reference": "lead",
                "is_deletable": False,
                "is_editable": True,
            },
        ]

        for _, item in enumerate(descriptors):
            role = self.incident_repo.get_incident_role(organisation=organisation, kind=item["kind"])
            if not role:
                self.incident_repo.create_incident_role(
                    organisation=organisation,
                    name=item["name"],
                    description=item["description"],
                    kind=item["kind"],
                    slack_reference=item["slack_reference"],
                )

    def _setup_announcement(self, organisation: Organisation) -> None:
        # todo: create a default announcement when incident is created!
        announcement = self.announcement_repo.get_announcement(organisation=organisation)
        if not announcement:
            self.announcement_repo.create_announcement(
                organisation=organisation,
                fields=[
                    AnnouncementFields.SEVERITY,
                    AnnouncementFields.TYPE,
                    AnnouncementFields.STATUS,
                    AnnouncementFields.INCIDENT_LEAD,
                    AnnouncementFields.SLACK_CHANNEL,
                ],
                actions=[
                    AnnouncementActions.HOMEPAGE,
                ],
            )

    def _setup_timestamps(self, organisation: Organisation):
        """Setup timestamps for the organisation"""
        with open(TIMESTAMPS_SEED_DATA_PATH) as fp:
            data = yaml.load(fp, Loader=yaml.CLoader)
            for idx, item in enumerate(data["timestamps"]):
                timestamp = self.timestamp_repo.get_timestamp_by_label(organisation=organisation, label=item["label"])
                if not timestamp:
                    self.timestamp_repo.create_timestamp(
                        organisation=organisation,
                        label=item["label"],
                        kind=TimestampKind(item["kind"]),
                        rank=idx,
                        rules=[item["rule"]],
                        can_delete=False,
                    )
