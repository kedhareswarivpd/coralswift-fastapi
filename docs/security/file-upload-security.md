# File Upload Security

`app/utils/uploads.py::save_upload()` — every upload in this codebase
(media, career resumes, client/partner files) goes through this one
function, regardless of destination (local disk or S3-compatible storage —
see `architecture/integrations.md`). Four validation layers, in order,
each independently rejecting:

1. **Declared MIME type allowlist** (`ALLOWED_MIME`) — images, common
   office document formats, PDF, plain text/CSV, common video formats,
   common archive formats. **`image/svg+xml` is deliberately excluded** —
   an SVG served with that content type can carry embedded scripts (stored
   XSS), and magic-byte checks can't reliably distinguish a safe SVG from a
   malicious one, so it's simply never allowed rather than attempting a
   sanitization pass.
2. **File extension allowlist** (`ALLOWED_EXTENSIONS`) — checked
   independently of the declared MIME type, so a file can't pass by lying
   about its extension while the MIME type is checked, or vice versa.
3. **Size cap** (`MAX_FILE_SIZE_MB`, default 10MB).
4. **Magic-byte verification** (`_verify_magic()`) — the file's actual
   leading bytes are checked against a known signature for the *declared*
   MIME type (e.g. PNG must start with `\x89PNG\r\n\x1a\n`). A file whose
   content doesn't match what it claims to be is rejected regardless of
   what its extension/declared MIME type say. `text/plain`/`text/csv`
   can't be magic-byte-verified the same way — instead, NUL bytes and
   non-UTF-8 content are rejected, catching a binary file masquerading as
   text.

## Subfolder allowlist

`ALLOWED_SUBFOLDERS` is a fixed set (`careers`, `misc`, `media`, `projects`,
`events`, `blog`, `downloads`) — a caller can never write outside these,
and path-traversal attempts (`../../etc`) are rejected by resolving the
subfolder through `PurePosixPath` and checking against this allowlist, not
by string-matching `..` alone.

## Public vs. private

`careers` is the one subfolder in `PRIVATE_SUBFOLDERS` — a resume upload
never gets a public URL; the returned reference is a bare
`"careers/<filename>"` string, only resolvable through the authenticated
`GET /careers/admin/applications/{id}/resume` endpoint
(`load_private_file()`), never the public `/uploads` static mount or a
public bucket URL. This holds identically whether `STORAGE_BACKEND` is
`local` or `s3` (see `architecture/integrations.md`).

## What this does NOT do

- No malware/virus scanning — content-type and magic-byte validation catch
  a mismatched or spoofed file type, not a legitimately-typed file that
  happens to carry a malicious payload (e.g. a real PDF with an embedded
  exploit). If that's a real threat model concern, it needs a dedicated
  scanning step (e.g. ClamAV), which doesn't exist here.
- No per-file virus/AV re-scan on download — a file already accepted at
  upload time is trusted at download time.
