"""Shared HTML building-blocks for all CoralSwift email templates.

CoralSwift Brand Palette (mirrors frontend tailwind.config.js)
──────────────────────────────────────────────────────────────
Primary (Coral)  : #FF5500
Dark (Navy)      : #0B0F19
Light Coral      : #FF7A33
Tint (Orange)    : #FFEDD5
Surface          : #F8FAFC
Container        : #EEF2F6
Border           : #FFE3D1
Muted Text       : #334155
Subtle Text      : #94A3B8
Magenta Accent   : #E11D48
Purple Accent    : #8B5CF6
Success          : #16A34A
Warning          : #F59E0B
Error/Danger     : #DC2626
Info             : #0EA5E9
"""
import html as _html

from app.core.config import settings


# ──────────────────────────────────────────────────────────────────────────────
# Escaping
# ──────────────────────────────────────────────────────────────────────────────

def esc(value: object) -> str:
    """HTML-escape any value for safe embedding inside an email template."""
    return _html.escape(str(value if value is not None else ""), quote=True)


# ──────────────────────────────────────────────────────────────────────────────
# Typography helpers
# ──────────────────────────────────────────────────────────────────────────────

def h1(text: str) -> str:
    return (
        f'<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;'
        f'color:#0B0F19;line-height:32px;">{text}</h1>'
    )


def p(text: str) -> str:
    return (
        f'<p style="margin:0 0 16px;font-size:15px;'
        f'color:#334155;line-height:24px;">{text}</p>'
    )


def small(text: str) -> str:
    return (
        f'<p style="margin:0 0 8px;font-size:13px;'
        f'color:#94A3B8;line-height:20px;">{text}</p>'
    )


# ──────────────────────────────────────────────────────────────────────────────
# Button helpers
# ──────────────────────────────────────────────────────────────────────────────

def btn(label: str, url: str) -> str:
    """Primary CTA button — CoralSwift coral brand colour."""
    return (
        f'<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">'
        f'<tr><td style="background-color:#FF5500;border-radius:8px;">'
        f'<a href="{url}" target="_blank" style="display:inline-block;padding:14px 32px;'
        f'font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;'
        f'letter-spacing:0.02em;">{label}</a>'
        f'</td></tr></table>'
    )


def btn_danger(label: str, url: str) -> str:
    """Danger/alert CTA button — used for high-urgency security actions."""
    return (
        f'<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">'
        f'<tr><td style="background-color:#DC2626;border-radius:8px;">'
        f'<a href="{url}" target="_blank" style="display:inline-block;padding:14px 32px;'
        f'font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;'
        f'letter-spacing:0.02em;">{label}</a>'
        f'</td></tr></table>'
    )


# ──────────────────────────────────────────────────────────────────────────────
# Info-card helpers
# ──────────────────────────────────────────────────────────────────────────────

def info_row(label: str, value: str) -> str:
    """A single labelled row inside an info_card()."""
    return (
        f'<tr>'
        f'<td style="padding:8px 16px;font-size:13px;color:#334155;font-weight:600;'
        f'white-space:nowrap;border-right:2px solid #FFE3D1;">{label}</td>'
        f'<td style="padding:8px 16px;font-size:14px;color:#0B0F19;">{value}</td>'
        f'</tr>'
    )


def info_card(rows_html: str) -> str:
    """Wraps one or more info_row()s in a styled card table."""
    return (
        f'<table cellpadding="0" cellspacing="0" border="0" width="100%" '
        f'style="background-color:#FFEDD5;border-radius:8px;border:1px solid #FFE3D1;'
        f'margin:20px 0;overflow:hidden;">'
        f'{rows_html}'
        f'</table>'
    )


# ──────────────────────────────────────────────────────────────────────────────
# Alert-box helper
# ──────────────────────────────────────────────────────────────────────────────

def alert_box(message: str, kind: str = "warning") -> str:
    """Coloured inline alert banner.

    kind options
    ────────────
    'warning' — amber  (non-critical notices, expiry reminders)
    'danger'  — red    (security alerts, irreversible actions)
    'info'    — blue   (informational tips, next-step guidance)
    """
    palette = {
        "warning": ("#FEF3C7", "#92400E", "#F59E0B"),
        "danger":  ("#FEE2E2", "#991B1B", "#DC2626"),
        "info":    ("#DBEAFE", "#1E40AF", "#0EA5E9"),
    }
    bg, text, border = palette.get(kind, palette["info"])
    return (
        f'<table cellpadding="0" cellspacing="0" border="0" width="100%" '
        f'style="background-color:{bg};border-radius:8px;border-left:4px solid {border};'
        f'margin:16px 0;">'
        f'<tr><td style="padding:14px 16px;font-size:14px;color:{text};line-height:20px;">'
        f'{message}</td></tr></table>'
    )


# ──────────────────────────────────────────────────────────────────────────────
# Message body block (quoted text box)
# ──────────────────────────────────────────────────────────────────────────────

def message_block(heading: str, body_text: str) -> str:
    """Renders a labelled quoted-text card — used for contact form message bodies."""
    return (
        f'<div style="background-color:#F8FAFC;border-radius:8px;border:1px solid #FFE3D1;'
        f'padding:16px;margin:16px 0;">'
        f'<p style="margin:0 0 8px;font-size:12px;color:#94A3B8;text-transform:uppercase;'
        f'font-weight:600;letter-spacing:0.05em;">{heading}</p>'
        f'<p style="margin:0;font-size:15px;color:#0B0F19;line-height:24px;'
        f'white-space:pre-wrap;">{body_text}</p>'
        f'</div>'
    )


# ──────────────────────────────────────────────────────────────────────────────
# Shared branded email wrapper
# ──────────────────────────────────────────────────────────────────────────────

def base_template(
    title: str,
    preview_text: str,
    body_html: str,
    footer_note: str = "",
) -> str:
    """Full CoralSwift-branded HTML email wrapper.

    Sections
    ────────
    • Coral-to-magenta-to-purple gradient header with app name + email title
    • White card body that receives `body_html`
    • 1px coral-tint divider
    • Footer with `footer_note` + copyright line

    All styles are inlined for maximum email-client compatibility
    (Gmail, Outlook, Apple Mail, mobile clients).
    """
    app_name = esc(settings.app_name)
    site_url = esc(settings.site_url)
    year = "2026"
    footer = esc(footer_note) if footer_note else f"This email was sent by {app_name}."

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{esc(title)}</title>
  <meta name="color-scheme" content="light" />
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#EEF2F6;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!-- Inbox preview text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    {esc(preview_text)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <!-- Outer wrapper table -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#EEF2F6;padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;background-color:#ffffff;border-radius:12px;
                      overflow:hidden;box-shadow:0 4px 24px rgba(11,15,25,0.08);">

          <!-- ── Gradient header ── -->
          <tr>
            <td style="background:linear-gradient(135deg,#FF5500 0%,#E11D48 60%,#8B5CF6 100%);
                        padding:36px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size:22px;font-weight:700;color:#ffffff;
                                  letter-spacing:-0.5px;">{app_name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:8px;">
                    <span style="font-size:12px;color:rgba(255,255,255,0.80);
                                  letter-spacing:0.05em;text-transform:uppercase;
                                  font-weight:600;">{esc(title)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Body content ── -->
          <tr>
            <td style="padding:40px 40px 32px;">
              {body_html}
            </td>
          </tr>

          <!-- ── Divider ── -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background-color:#FFE3D1;"></div>
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="padding:24px 40px 32px;">
              <p style="margin:0 0 6px;font-size:12px;color:#334155;line-height:18px;">
                {footer}
              </p>
              <p style="margin:0;font-size:12px;color:#94A3B8;line-height:18px;">
                &copy; {year}
                <a href="{site_url}" style="color:#FF5500;text-decoration:none;">{app_name}</a>.
                All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        <!-- End card -->

      </td>
    </tr>
  </table>
</body>
</html>"""
