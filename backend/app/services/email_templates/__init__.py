"""Email template sub-package.

Structure
---------
renderer.py           — template loader + variable substitution engine
base.html             — shared branded wrapper (header / footer)
auth/                 — authentication & security email templates
crm/                  — CRM / workflow email templates

Usage (from email_service.py)
------------------------------
    from app.services.email_templates.renderer import render

    html = render("auth/verify_email.html", {
        "name":       "Jane",
        "verify_url": "https://...",
        ...
    })
"""
