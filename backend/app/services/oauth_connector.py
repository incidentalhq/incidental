import base64
import json
import urllib.parse
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any

import httpx
import structlog

from app.env import settings
from app.exceptions import ApplicationException

logger = structlog.get_logger(logger_name=__name__)


@dataclass
class Credentials:
    access_token: str
    refresh_token: str | None
    expires_at: datetime | None
    token_type: str
    id_token: str | None  # openid
    original_data: dict[str, Any]


class OAuthConnectorService:
    def __init__(self, authorize_url: str, token_url: str, client_id: str, client_secret: str) -> None:
        self.authorize_url = authorize_url
        self.token_url = token_url
        self.client_id = client_id
        self.client_secret = client_secret

    def redirect_url(self) -> str:
        return f"{settings.FRONTEND_URL}/oauth/complete"

    def create_authorization_url(self, scopes: list[str], state: dict[str, str] | None = None) -> str:
        """Create the authorization url"""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_url(),
            "scope": " ".join(scopes),
            "response_type": "code",
        }

        if state:
            params["state"] = base64.b64encode(json.dumps(state).encode("utf8"))

        url = self.authorize_url + "?" + urllib.parse.urlencode(params)

        return url

    def complete(self, code: str):
        """Complete oauth exchange"""
        payload = {
            "code": code,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "redirect_uri": self.redirect_url(),
        }

        response = httpx.post(self.token_url, data=payload)

        if not response.is_success:
            logger.error("OAuth error", response=response.content, payload=response.request.body)
            raise ApplicationException("There was a problem completing Google oauth")

        data = response.json()
        logger.info("Oauth response", data=data)

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

    def refresh_credentials(self, refresh_token: str) -> Credentials:
        """Update the current token with a new one"""
        params = {
            "refresh_token": refresh_token,
            "client_id": self.integration.client_id,
            "client_secret": self.integration.client_secret,
            "grant_type": "refresh_token",
        }
        response = httpx.post(self.token_url, data=params)
        if not response.is_success:
            logger.error("Refresh error", content=response.content)

        response.raise_for_status()

        data = response.json()
        logger.debug("credentials refreshed", data=data)

        expires_at = None
        if data.get("expires_in"):
            expires_at = datetime.now() + timedelta(seconds=data.get("expires_in"))

        credentials = Credentials(
            access_token=data["access_token"],
            refresh_token=refresh_token,
            expires_at=expires_at,
            token_type=data["token_type"],
        )

        return credentials
