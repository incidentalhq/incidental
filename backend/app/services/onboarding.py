from typing import Any, TypedDict

from app.models import (
    AnnouncementActions,
    AnnouncementFields,
    Form,
    Organisation,
    Settings,
)
from app.models.form import FormType
from app.models.form_field import FormFieldKind
from app.models.incident_role import IncidentRoleKind
from app.models.incident_status import IncidentStatusCategoryEnum
from app.repos import AnnouncementRepo, FormRepo, IncidentRepo, SeverityRepo


class CategoryItemType(TypedDict):
    name: str
    category: IncidentStatusCategoryEnum


class IncidentRoleItemType(TypedDict):
    name: str
    description: str
    kind: IncidentRoleKind
    slack_reference: str


class OnboardingService:
    def __init__(
        self,
        form_repo: FormRepo,
        severity_repo: SeverityRepo,
        incident_repo: IncidentRepo,
        announcement_repo: AnnouncementRepo,
    ):
        self.form_repo = form_repo
        self.severity_repo = severity_repo
        self.incident_repo = incident_repo
        self.announcement_repo = announcement_repo

    def setup_organisation(self, organisation: Organisation) -> None:
        self._setup_forms(organisation)
        self._setup_severities(organisation)
        self._setup_incident_types(organisation)
        self._setup_incident_statuses(organisation)
        self._setup_settings(organisation)
        self._setup_incident_roles(organisation)
        self._setup_announcement(organisation)

    def _setup_forms(self, organisation: Organisation) -> list[Form]:
        # create incident form
        create_form = self.form_repo.create_form(
            organisation=organisation, name="Create incident", _type=FormType.CREATE_INCIDENT
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
                "label": "Message",
                "is_required": False,
                "kind": FormFieldKind.TEXTAREA,
                "description": "Give a summary of the current state of the incident.",
                "is_deletable": False,
            },
        ]
        self._create_form_fields(form=create_form, field_descriptions=create_form_fields_descriptor)

        # create a status update form
        update_status_form = self.form_repo.create_form(
            organisation=organisation, name="Update status", _type=FormType.UPDATE_INCIDENT
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
                "is_deletable": False,
            },
        ]
        self._create_form_fields(form=update_status_form, field_descriptions=update_status_form_fields)

        return [create_form, update_status_form]

    def _create_form_fields(self, form: Form, field_descriptions: list[dict[str, Any]]):
        for idx, item in enumerate(field_descriptions):
            self.form_repo.create_form_field(
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
            self.incident_repo.create_incident_status(
                organisation=organisation,
                name=item["name"],
                sort_order=idx,
                category=item["category"],
            )

    def _setup_settings(self, organisation: Organisation):
        model = Settings()
        model.organisation_id = organisation.id
        model.slack_announcement_channel_name = "incidents"

        self.incident_repo.session.add(model)
        self.incident_repo.session.flush()

        return model

    def _setup_incident_roles(self, organisation: Organisation):
        descriptors: list[IncidentRoleItemType] = [
            {
                "name": "Reporter",
                "kind": IncidentRoleKind.REPORTER,
                "description": "The user responsible for first reporting the incident",
                "slack_reference": "reporter",
            },
            {
                "name": "Incident Lead",
                "kind": IncidentRoleKind.LEAD,
                "description": "An incident lead takes charge of coordinating and overseeing the response to an incident, ensuring effective communication, resource allocation, and resolution efforts to mitigate and manage the impact on an organization.",
                "slack_reference": "lead",
            },
        ]

        for _, item in enumerate(descriptors):
            self.incident_repo.create_incident_role(
                organisation=organisation,
                name=item["name"],
                description=item["description"],
                kind=item["kind"],
                slack_reference=item["slack_reference"],
            )

    def _setup_announcement(self, organisation: Organisation):
        # todo: create a default announcement when incident is created!

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
