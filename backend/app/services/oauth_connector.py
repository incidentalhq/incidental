import base64
import json
import urllib.parse
from datetime import datetime, timedelta

import httpx
import structlog

from app.exceptions import ApplicationException
from app.schemas.resources import Credentials

logger = structlog.get_logger(logger_name=__name__)


class OAuthConnectorService:
    def __init__(
        self, authorize_url: str, token_url: str, client_id: str, client_secret: str, redirect_uri: str
    ) -> None:
        self.authorize_url = authorize_url
        self.token_url = token_url
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri

    def create_authorization_url(self, scopes: list[str], state: dict[str, str] | None = None) -> str:
        """Create the authorization url"""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": " ".join(scopes),
            "response_type": "code",
        }

        if state:
            params["state"] = base64.b64encode(json.dumps(state).encode("utf8")).decode("utf8")

        url = self.authorize_url + "?" + urllib.parse.urlencode(params)

        return url

    def complete(self, code: str) -> Credentials:
        """Complete oauth exchange"""
        payload = {
            "code": code,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "redirect_uri": self.redirect_uri,
        }

        response = httpx.post(self.token_url, data=payload)

        if not response.is_success:
            logger.error("OAuth error", response=response.content, payload=response.request.body)
            raise ApplicationException("There was a problem completing Google oauth")

        data = response.json()

        if "error" in data:
            raise ApplicationException("Error with Oauth2 token exchange")

        access_token = data.get("access_token")
        refresh_token = data.get("refresh_token")
        expires_at = None

        if data.get("expires_in"):
            expires_at = datetime.utcnow() + timedelta(seconds=data.get("expires_in"))

        credentials = Credentials(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_at=expires_at,
            token_type=data.get("token_type"),
            id_token=data.get("id_token"),
            original_data=data,
        )

        return credentials
