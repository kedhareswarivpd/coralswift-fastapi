import os

from upstash_redis.asyncio import Redis
from app.core.config import settings

_redis_client: Redis | None = None


def get_upstash_redis_client() -> Redis | None:
    """Create one shared Upstash Redis REST client per worker/process."""
    global _redis_client

    url = (os.getenv("UPSTASH_REDIS_REST_URL") or settings.upstash_redis_rest_url or "").strip()
    token = (os.getenv("UPSTASH_REDIS_REST_TOKEN") or settings.upstash_redis_rest_token or "").strip()
    if not url or not token:
        return None

    if _redis_client is None:
        _redis_client = Redis(url=url, token=token)
    return _redis_client
