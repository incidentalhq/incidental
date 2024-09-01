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
    RequirementTypeEnum,
    Settings,
    TimestampKind,
)
from app.models.incident_role import IncidentRoleKind
from app.models.incident_status import IncidentStatusCategoryEnum
from app.repos import AnnouncementRepo, FieldRepo, FormRepo, IncidentRepo, LifecycleRepo, SeverityRepo, TimestampRepo


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
FORMS_SEED_DATA_PATH = "/srv/data/forms.yaml"
FIELDS_SEED_DATA_PATH = "/srv/data/fields.yaml"
ROLES_SEED_DATA_PATH = "/srv/data/roles.yaml"
TYPES_SEED_DATA_PATH = "/srv/data/types.yaml"


class OnboardingService:
    def __init__(
        self,
        form_repo: FormRepo,
        severity_repo: SeverityRepo,
        incident_repo: IncidentRepo,
        announcement_repo: AnnouncementRepo,
        timestamp_repo: TimestampRepo,
        field_repo: FieldRepo,
        lifecycle_repo: LifecycleRepo,
    ):
        self.form_repo = form_repo
        self.severity_repo = severity_repo
        self.incident_repo = incident_repo
        self.announcement_repo = announcement_repo
        self.timestamp_repo = timestamp_repo
        self.field_repo = field_repo
        self.lifecycle_repo = lifecycle_repo

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
        self._setup_lifecycle(organisation)

    def _setup_forms(self, organisation: Organisation) -> list[Form]:
        forms: list[Form] = []

        with open(FORMS_SEED_DATA_PATH, "r") as fp:
            data = yaml.load(fp, Loader=yaml.CLoader)

        for form_key, form_data in data["forms"].items():
            form_kind = FormKind(form_data["type"])
            form = self.form_repo.get_form(organisation=organisation, form_type=form_kind)
            if not form:
                form = self.form_repo.create_form(
                    organisation=organisation,
                    name=form_data["name"],
                    form_type=form_kind,
                )

            field_descriptions = form_data["fields"]
            self._create_form_fields(form=form, field_descriptions=field_descriptions)
            forms.append(form)

        return forms

    def _create_form_fields(self, form: Form, field_descriptions: list[dict[str, Any]]):
        """Setup the form fields for a form"""

        for idx, item in enumerate(field_descriptions):
            field_kind = FieldKind(item["field_kind"])
            requirement_type = RequirementTypeEnum(item["requirement_type"])
            form_field = self.form_repo.get_form_field_by_label(form=form, label=item["label"])
            field = self.field_repo.get_field_by_kind(organisation=form.organisation, kind=field_kind)
            if not form_field:
                if not field:
                    raise RuntimeError(f"Could not find custom field: {item['field_kind']}")

                form_field = self.form_repo.create_form_field(
                    form=form,
                    field=field,
                    label=item["label"],
                    requirement_type=requirement_type,
                    rank=idx,
                    description=item.get("description"),
                    is_deletable=item["is_deletable"],
                    can_have_default_value=item["can_have_default_value"],
                    can_have_description=item["can_have_description"],
                    can_change_requirement_type=item["can_change_requirement_type"],
                )

    def _setup_severities(self, organisation: Organisation):
        """Setup incident severities"""
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
        """Setup incident types"""
        with open(TYPES_SEED_DATA_PATH) as fp:
            data = yaml.load(fp, Loader=yaml.CLoader)

        for item in data["types"]:
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
        """Setup incident statuses"""
        with open(STATUSES_SEED_DATA_PATH) as fp:
            data = yaml.load(fp, Loader=yaml.CLoader)

        for idx, item in enumerate(data["statuses"]):
            status = self.incident_repo.get_incident_status_by_name(organisation=organisation, name=item["name"])
            category = IncidentStatusCategoryEnum(item["category"])
            if not status:
                self.incident_repo.create_incident_status(
                    organisation=organisation,
                    name=item["name"],
                    rank=idx,
                    category=category,
                    description=item["description"],
                )

    def _setup_settings(self, organisation: Organisation) -> None:
        """Setup organisation setting"""
        if not organisation.settings:
            model = Settings()
            model.organisation_id = organisation.id
            model.slack_announcement_channel_name = "incidents"

            self.incident_repo.session.add(model)
            self.incident_repo.session.flush()

    def _setup_incident_roles(self, organisation: Organisation) -> None:
        """Setup incident roles"""
        with open(ROLES_SEED_DATA_PATH) as fp:
            data = yaml.load(fp, Loader=yaml.CLoader)

        descriptors = data["roles"]

        for _, item in enumerate(descriptors):
            kind = IncidentRoleKind(item["kind"])
            role = self.incident_repo.get_incident_role(organisation=organisation, kind=kind)
            if not role:
                self.incident_repo.create_incident_role(
                    organisation=organisation,
                    name=item["name"],
                    description=item["description"],
                    kind=kind,
                    slack_reference=item["slack_reference"],
                    is_deletable=item["is_deletable"],
                    is_editable=item["is_editable"],
                )

    def _setup_announcement(self, organisation: Organisation) -> None:
        # todo: create a default announcement when incident is created!
        announcement = self.announcement_repo.get_announcement(organisation=organisation)
        if announcement:
            return None

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
        """Setup custom fields"""
        with open(FIELDS_SEED_DATA_PATH, "r") as fp:
            data = yaml.load(fp, Loader=yaml.CLoader)

        field_descriptors = data["fields"]

        for field_descriptor in field_descriptors:
            field_kind = FieldKind(field_descriptor["kind"])
            interface_kind = InterfaceKind(field_descriptor["interface_kind"])
            custom_form_field = self.field_repo.get_field_by_kind(organisation=organisation, kind=field_kind)
            if not custom_form_field:
                self.field_repo.create_field(
                    organisation=organisation,
                    label=field_descriptor["label"],
                    interface_kind=interface_kind,
                    kind=field_descriptor["kind"],
                    description=field_descriptor["description"],
                )

    def _setup_lifecycle(self, organisation: Organisation):
        if not organisation.lifecycles:
            self.lifecycle_repo.create_lifecycle(organisation=organisation)
