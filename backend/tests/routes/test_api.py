from fastapi.testclient import TestClient

from app.main import app
from app.schemas.actions import AuthUserSchema, CreateUserSchema
from tests.factories import make_organisation, make_user

client = TestClient(app)


def test_create_register():
    data_in = CreateUserSchema(name="Test User", email_address="test@test.com", password="password")

    response = client.post(
        "/users/",
        json=data_in.model_dump(),
    )

    assert response.status_code == 200


def test_login():
    organisation = make_organisation()
    make_user_result = make_user(organisation=organisation)
    auth_in = AuthUserSchema(
        email_address=make_user_result.user.email_address,
        password=make_user_result.password,
    )

    response = client.post(
        "/users/auth",
        json=auth_in.model_dump(),
    )

    assert response.status_code == 200


def test_login_wrong_password():
    organisation = make_organisation()
    make_user_result = make_user(organisation=organisation)
    auth_in = AuthUserSchema(
        email_address=make_user_result.user.email_address,
        password="incorrect-password",
    )

    response = client.post(
        "/users/auth",
        json=auth_in.model_dump(),
    )

    assert response.status_code == 422
    assert response.json()["detail"] == "Could not login, please try again"
