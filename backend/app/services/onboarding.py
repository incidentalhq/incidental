from typing import Any, TypedDict

import yaml

from app.models import (
    AnnouncementActions,
    AnnouncementFields,
    FieldKind,
    Form,
    FormKind,
    InterfaceKind,
    Organisation,
    Settings,
    TimestampKind,
)
from app.models.incident_role import IncidentRoleKind
from app.models.incident_status import IncidentStatusCategoryEnum
from app.repos import AnnouncementRepo, FieldRepo, FormRepo, IncidentRepo, SeverityRepo, TimestampRepo


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
TIMESTAMPS_SEED_DATA_PATH = "/srv/data/timestamps.yaml"
SEVERITIES_SEED_DATA_PATH = "/srv/data/severities.yaml"
STATUSES_SEED_DATA_PATH = "/srv/data/statuses.yaml"


class OnboardingService:
    def __init__(
        self,
        form_repo: FormRepo,
        severity_repo: SeverityRepo,
        incident_repo: IncidentRepo,
        announcement_repo: AnnouncementRepo,
        timestamp_repo: TimestampRepo,
        field_repo: FieldRepo,
    ):
        self.form_repo = form_repo
        self.severity_repo = severity_repo
        self.incident_repo = incident_repo
        self.announcement_repo = announcement_repo
        self.timestamp_repo = timestamp_repo
        self.field_repo = field_repo

    def setup_organisation(self, organisation: Organisation) -> None:
        self._setup_fields(organisation=organisation)
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
                "label": "Name",
                "field_kind": FieldKind.INCIDENT_NAME,
                "is_required": True,
                "description": "A descriptive name for the incident",
                "is_deletable": False,
            },
            {
                "label": "Incident type",
                "field_kind": FieldKind.INCIDENT_TYPE,
                "is_required": True,
                "is_deletable": False,
            },
            {
                "label": "Severity",
                "field_kind": FieldKind.INCIDENT_SEVERITY,
                "is_required": True,
                "is_deletable": False,
            },
            {
                "label": "Summary",
                "field_kind": FieldKind.INCIDENT_SUMMARY,
                "is_required": False,
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
                "label": "Status",
                "field_kind": FieldKind.INCIDENT_STATUS,
                "is_required": True,
                "is_deletable": False,
            },
            {
                "label": "Severity",
                "field_kind": FieldKind.INCIDENT_SEVERITY,
                "is_required": True,
                "is_deletable": False,
            },
            {
                "label": "Summary",
                "field_kind": FieldKind.INCIDENT_SUMMARY,
                "is_required": False,
                "description": "Give a summary of the current state of the incident.",
                "is_deletable": False,
            },
        ]
        self._create_form_fields(form=update_status_form, field_descriptions=update_status_form_fields)

        return [create_form, update_status_form]

    def _create_form_fields(self, form: Form, field_descriptions: list[dict[str, Any]]):
        """Setup the form fields for a form"""

        for idx, item in enumerate(field_descriptions):
            form_field = self.form_repo.get_form_field_by_label(form=form, label=item["label"])
            field = self.field_repo.get_field_by_kind(organisation=form.organisation, kind=item["field_kind"])
            if not form_field:
                if not field:
                    raise RuntimeError(f"Could not find custom field: {item['field_kind']}")
                form_field = self.form_repo.create_form_field(
                    form=form,
                    field=field,
                    label=item["label"],
                    is_required=item["is_required"],
                    position=idx,
                    description=item.get("description"),
                    is_deletable=item["is_deletable"],
                )

    def _setup_severities(self, organisation: Organisation):
        with open(SEVERITIES_SEED_DATA_PATH) as fp:
            data = yaml.load(fp, Loader=yaml.CLoader)
            for idx, item in enumerate(data["severities"]):
                severity = self.severity_repo.get_severity_by_name(organisation=organisation, name=item["name"])
                if not severity:
                    self.severity_repo.create_severity(
                        organisation=organisation,
                        name=item["name"],
                        description=item["description"],
                        rating=idx,
                    )

    def _setup_incident_types(self, organisation: Organisation):
        descriptors: list[dict[str, Any]] = [
            {
                "name": "Default",
                "description": "Default incident type",
                "is_deletable": False,
                "is_editable": True,
                "is_default": True,
            },
        ]

        for item in descriptors:
            incident_type = self.incident_repo.get_incident_type_by_name(organisation=organisation, name=item["name"])
            if not incident_type:
                self.incident_repo.create_incident_type(
                    organisation=organisation,
                    name=item["name"],
                    description=item["description"],
                    is_editable=item["is_editable"],
                    is_deletable=item["is_deletable"],
                    is_default=item["is_default"],
                )

    def _setup_incident_statuses(self, organisation: Organisation):
        with open(STATUSES_SEED_DATA_PATH) as fp:
            data = yaml.load(fp, Loader=yaml.CLoader)
            for idx, item in enumerate(data["statuses"]):
                status = self.incident_repo.get_incident_status_by_name(organisation=organisation, name=item["name"])
                category = IncidentStatusCategoryEnum(item["category"])
                if not status:
                    self.incident_repo.create_incident_status(
                        organisation=organisation,
                        name=item["name"],
                        sort_order=idx,
                        category=category,
                        description=item["description"],
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

    def _setup_fields(self, organisation: Organisation):
        # create core custom fields
        field_descriptors: list[dict[str, Any]] = [
            {
                "label": "Incident name",
                "interface_kind": InterfaceKind.TEXT,
                "kind": FieldKind.INCIDENT_NAME,
            },
            {
                "label": "Incident type",
                "interface_kind": InterfaceKind.SINGLE_SELECT,
                "kind": FieldKind.INCIDENT_TYPE,
            },
            {
                "label": "Incident severity",
                "interface_kind": InterfaceKind.SINGLE_SELECT,
                "kind": FieldKind.INCIDENT_SEVERITY,
            },
            {
                "label": "Incident summary",
                "interface_kind": InterfaceKind.TEXTAREA,
                "kind": FieldKind.INCIDENT_SUMMARY,
            },
            {
                "label": "Incident status",
                "interface_kind": InterfaceKind.SINGLE_SELECT,
                "kind": FieldKind.INCIDENT_STATUS,
            },
        ]
        for field_descriptor in field_descriptors:
            custom_form_field = self.field_repo.get_field_by_kind(
                organisation=organisation, kind=field_descriptor["kind"]
            )
            if not custom_form_field:
                self.field_repo.create_field(
                    organisation=organisation,
                    label=field_descriptor["label"],
                    interface_kind=field_descriptor["interface_kind"],
                    kind=field_descriptor["kind"],
                )
