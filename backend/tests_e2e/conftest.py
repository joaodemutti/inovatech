from __future__ import annotations

import os
import time

import httpx
import pytest

from tests_e2e.helpers import login


def _wait_for_api(api_url: str, timeout_seconds: int = 90) -> None:
    deadline = time.monotonic() + timeout_seconds
    last_error: Exception | None = None

    while time.monotonic() < deadline:
        try:
            response = httpx.get(api_url, timeout=3)
            if response.status_code == 200:
                return
        except Exception as exc:  # pragma: no cover - failure is reported below
            last_error = exc
        time.sleep(1)

    raise RuntimeError(f"API did not become ready at {api_url}: {last_error}")


@pytest.fixture(scope="session")
def api_url() -> str:
    return os.getenv("E2E_API_URL", "http://localhost:8000").rstrip("/")


@pytest.fixture(scope="session", autouse=True)
def api_ready(api_url: str) -> None:
    _wait_for_api(api_url)


@pytest.fixture()
def public_client(api_url: str, api_ready: None):
    with httpx.Client(base_url=api_url, timeout=15) as client:
        yield client


def _authenticated_client(api_url: str, role: str):
    client = httpx.Client(base_url=api_url, timeout=15)
    login(client, role)
    return client


@pytest.fixture()
def gestor_client(api_url: str, api_ready: None):
    with _authenticated_client(api_url, "gestor") as client:
        yield client


@pytest.fixture()
def recepcionista_client(api_url: str, api_ready: None):
    with _authenticated_client(api_url, "recepcionista") as client:
        yield client


@pytest.fixture()
def medico_client(api_url: str, api_ready: None):
    with _authenticated_client(api_url, "medico") as client:
        yield client


@pytest.fixture()
def paciente_client(api_url: str, api_ready: None):
    with _authenticated_client(api_url, "paciente") as client:
        yield client


@pytest.fixture()
def paciente_joao_client(api_url: str, api_ready: None):
    with _authenticated_client(api_url, "paciente_joao") as client:
        yield client
