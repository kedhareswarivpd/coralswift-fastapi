# Flow: File Upload (Public and Private)

One code path (`app/utils/uploads.py::save_upload()`) serves every upload
in the app — media, career resumes, client/partner files. What differs is
only the subfolder and whether it's public or private.

```
Caller submits multipart file + subfolder
    │
    ▼
Validate: declared MIME in allowlist? → 400 if not
    │
    ▼
Validate: extension in allowlist? → 400 if not
    │
    ▼
Validate: subfolder in ALLOWED_SUBFOLDERS (no path traversal)? → 400 if not
    │
    ▼
Read bytes; size ≤ MAX_FILE_SIZE_MB? → 400 if not
    │
    ▼
Magic-byte check: do the leading bytes match the declared MIME? → 400 if not
    │
    ▼
subfolder in PRIVATE_SUBFOLDERS ("careers")?
    │
    ├─▶ YES → write to private root (disk) or `private/` bucket prefix
    │          return bare reference "careers/<filename>" — NOT a URL
    │
    └─▶ NO  → write to public root (disk, under the /uploads static mount)
               or `public/` bucket prefix (S3-compatible: MinIO/Supabase Storage)
               return a public URL
```

## Retrieving a private file

```
GET /careers/admin/applications/{id}/resume   (admin, hr only)
    │
    ▼
load_private_file(reference, "careers")
    ├─▶ validates reference shape (exactly 2 path segments, first = "careers", no "..")
    ├─▶ storage_backend == "s3"? → storage_service.get_object("private/careers/<file>")
    └─▶ else → read from PRIVATE_UPLOAD_ROOT on disk
    │
    ▼
Response streamed with Content-Disposition: attachment
```

A direct guess at the file's bucket/disk path — bypassing this endpoint —
returns `403`/`404` regardless of backend; there is no public URL for a
private-subfolder upload under any configuration.

## Related docs

[security/file-upload-security.md](../security/file-upload-security.md)
for the full validation-layer detail,
[decisions/ADR-002](../decisions/ADR-002-s3-compatible-file-storage.md) for
why one storage service serves both MinIO and Supabase Storage.
