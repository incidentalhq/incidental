from faker import Faker
from sqlalchemy.orm import Session

from app.models import Organisation
from app.repos import OrganisationRepo


def test_organisation_repo_create_slug(db: Session, faker: Faker):
    organisation_repo = OrganisationRepo(session=db)
    name = faker.name()
    orgs: list[Organisation] = []
    n = 10

    for _ in range(n):
        orgs.append(
            organisation_repo.create_organisation(
                name=name,
            )
        )

    slugs = set([org.slug for org in orgs])
    assert len(slugs) == n
