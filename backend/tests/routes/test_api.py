from fastapi.testclient import TestClient

from app.main import app
from app.schemas.actions import CreateUserSchema

client = TestClient(app)


def test_create_register():
    data_in = CreateUserSchema(name="Test User", email_address="test@test.com", password="password")

    response = client.post(
        "/users/",
        json=data_in.model_dump(),
    )

    assert response.status_code == 200
