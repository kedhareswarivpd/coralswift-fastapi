import os

from app.core.config import settings

_redis_client = None


def get_upstash_redis_client():
    """Create one shared Upstash Redis REST client per worker/process."""
    global _redis_client

    url = (os.getenv("UPSTASH_REDIS_REST_URL") or settings.upstash_redis_rest_url or "").strip()
    token = (os.getenv("UPSTASH_REDIS_REST_TOKEN") or settings.upstash_redis_rest_token or "").strip()
    if not url or not token:
        return None

    if _redis_client is None:
        try:
            from upstash_redis.asyncio import Redis
            _redis_client = Redis(url=url, token=token)
        except ImportError:
            return None
    return _redis_client

