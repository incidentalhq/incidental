from typing import TypedDict

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
        create_incident_form = self.form_repo.create_form(
            organisation=organisation, name="Create incident", _type=FormType.CREATE_INCIDENT
        )

        self.form_repo.create_form_field(
            create_incident_form,
            name="Name",
            kind=FormFieldKind.TEXT,
            position=0,
            description="A descriptive name for the incident",
        )
        self.form_repo.create_form_field(
            create_incident_form, name="Incident type", kind=FormFieldKind.INCIDENT_TYPE, position=1
        )
        self.form_repo.create_form_field(
            create_incident_form, name="Severity", kind=FormFieldKind.SEVERITY_TYPE, position=2
        )

        # give a status update form
        update_status_form = self.form_repo.create_form(
            organisation=organisation, name="Update status", _type=FormType.UPDATE_INCIDENT
        )
        self.form_repo.create_form_field(
            update_status_form, name="Status", kind=FormFieldKind.INCIDENT_STATUS, position=1
        )
        self.form_repo.create_form_field(
            update_status_form, name="Severity", kind=FormFieldKind.SEVERITY_TYPE, position=2
        )
        self.form_repo.create_form_field(
            update_status_form,
            name="Message",
            kind=FormFieldKind.TEXT,
            position=3,
            description="Give an update of the current status of the incident",
        )

        return [create_incident_form, update_status_form]

    def _setup_severities(self, organisation: Organisation):
        descriptors = [
            {"name": "Critical", "description": "A critical incident with very high impact"},
            {"name": "Major", "description": "A major incident with significant impact"},
            {"name": "Minor", "description": "A minor incident with low impact"},
        ]

        for idx, item in enumerate(descriptors):
            self.severity_repo.create_severity(
                organisation=organisation, name=item["name"], description=item["description"], rating=idx
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
            {"name": "Resolved", "category": IncidentStatusCategoryEnum.POST_INCIDENT},
            {"name": "Closed", "category": IncidentStatusCategoryEnum.CLOSED},
        ]

        for idx, item in enumerate(descriptors):
            self.incident_repo.create_incident_status(
                organisation=organisation, name=item["name"], sort_order=idx, category=item["category"]
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
            self.incident_repo.create_role(
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
            ],
            actions=[
                AnnouncementActions.HOMEPAGE,
            ],
        )
