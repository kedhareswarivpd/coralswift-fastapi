# Module: Careers

**Purpose**: public job listings and applications.

**Users**: public (browse/apply), `admin`/`hr` (manage).

## Data model

`Career` (slug unique, employment_type, status `open|closed` default
`open`, `responsibilities`/`requirements` as Postgres arrays), `Application`
(career_id CASCADE, resume_url, status `applied|shortlisted|interview|
offered|rejected|hired` default `applied`).

## Endpoints

```
GET  /careers                                      (public, force-filtered to status=open)
POST /careers/{id}/apply                            (public, rate-limited 5/hour, multipart + resume file)
POST /careers                                        (admin, hr)
GET  /careers/admin/applications                     (admin, hr)
PATCH /careers/admin/applications/{id}/status        (admin, hr)
GET  /careers/admin/applications/{id}/resume         (admin, hr — streams the file)
```

## Business rules

- Applying to a career whose `status != "open"` → `400`.
- **Resumes are private** — uploaded via `save_upload(resume, "careers")`,
  and `"careers"` is in `uploads.py`'s `PRIVATE_SUBFOLDERS`: the file never
  gets a public URL (not under the local `/uploads` mount, not a public
  bucket key). `resume_url` stores an opaque `"careers/<filename>"`
  reference, resolved only through the authenticated download endpoint —
  see [security/file-upload-security.md](../../security/file-upload-security.md).

## Events

None — no confirmation email to the applicant, no new-application alert to
HR.

## Dependencies

None significant.

## Known gaps

- No endpoint to close/reopen a `Career` posting's status (only creation
  exists in this router).
- No applicant-facing status notification when their application moves
  through the pipeline.
