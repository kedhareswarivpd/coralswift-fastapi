"""Template renderer — loads .html files and substitutes {{variable}} placeholders.

How it works
────────────
1. Loads the body template from  email_templates/<relative_path>
2. Substitutes all {{key}} tokens with values from the `context` dict
3. Wraps the result inside base.html (header + footer) using the same
   substitution mechanism

Template syntax
────────────────
Use  {{variable_name}}  anywhere in the HTML.
Any key present in the context dict is replaced; unknown keys are left as-is.
Escaping is the caller's responsibility — use `esc()` before passing user data.

Example
────────
    from app.services.email_templates.renderer import render, esc

    html = render("auth/verify_email.html", {
        "name":       esc(user.name),
        "verify_url": esc(verify_url),
        "app_name":   esc(settings.app_name),
        ...
    })
"""
import html as _html
import re
from pathlib import Path

_TEMPLATE_DIR = Path(__file__).parent


def esc(value: object) -> str:
    """HTML-escape any value before embedding it in a template."""
    return _html.escape(str(value if value is not None else ""), quote=True)


def _load(relative_path: str) -> str:
    """Read a template file relative to the email_templates/ directory."""
    path = _TEMPLATE_DIR / relative_path
    if not path.exists():
        raise FileNotFoundError(f"Email template not found: {path}")
    return path.read_text(encoding="utf-8")


def _substitute(template: str, context: dict) -> str:
    """Replace every {{key}} token in `template` with context[key].

    Unknown tokens (keys not in context) are left unchanged so the caller
    can spot missing variables easily rather than silently rendering garbage.
    """
    def replace(match: re.Match) -> str:
        key = match.group(1).strip()
        return str(context[key]) if key in context else match.group(0)

    return re.sub(r"\{\{(\s*[\w.]+\s*)\}\}", replace, template)


def render(template_path: str, context: dict) -> str:
    """Load, substitute, and wrap a body template inside base.html.

    Parameters
    ──────────
    template_path   Relative path under email_templates/, e.g. "auth/welcome.html"
    context         Dict of variable values. Caller must HTML-escape user data
                    using esc() before passing it here.

    Returns the full HTML string ready to pass to send_email().
    """
    body_html = _substitute(_load(template_path), context)

    base_html = _load("base.html")
    return _substitute(base_html, {**context, "body": body_html})
