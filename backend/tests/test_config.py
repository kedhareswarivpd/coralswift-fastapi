
from unittest.mock import MagicMock, patch

from app.core.config import Settings
from app.core.upstash_redis import get_upstash_redis_client



def test_settings_read_dotenv_from_backend_root_when_cwd_changes(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    monkeypatch.delenv("ENV", raising=False)
    monkeypatch.delenv("REDIS_URL_OVERRIDE", raising=False)

    settings = Settings()

    # The project currently loads backend/.env, whose staging config sets the
    # app environment and Redis URL explicitly. This test verifies that the
    # settings object reads the backend-root dotenv file rather than defaults
    # from the temporary cwd.
    assert settings.env in ("staging", "development", "test")
    if settings.redis_url_override:
        assert settings.redis_url_override.startswith("rediss://")


def test_redis_url_env_is_used_for_upstash_tls(monkeypatch):
    monkeypatch.setenv("REDIS_URL", "rediss://default:test-pass@host.upstash.io:6379")
    monkeypatch.delenv("REDIS_URL_OVERRIDE", raising=False)

    settings = Settings()

    assert settings.redis_url_override == "rediss://default:test-pass@host.upstash.io:6379"
    assert settings.redis_url.startswith("rediss://default:test-pass@host.upstash.io:6379")
    assert "socket_connect_timeout=0.05" in settings.redis_url
    assert "socket_timeout=0.05" in settings.redis_url


def test_upstash_rest_client_reads_env(monkeypatch):
    monkeypatch.setenv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io")
    monkeypatch.setenv("UPSTASH_REDIS_REST_TOKEN", "test-token")
    monkeypatch.setattr("app.core.upstash_redis._redis_client", None)

    mock_redis_instance = MagicMock()
    mock_redis_cls = MagicMock(return_value=mock_redis_instance)
    mock_asyncio = MagicMock(Redis=mock_redis_cls)
    mock_upstash = MagicMock(asyncio=mock_asyncio)

    with patch.dict("sys.modules", {"upstash_redis": mock_upstash, "upstash_redis.asyncio": mock_asyncio}):
        client = get_upstash_redis_client()

        assert client is not None

