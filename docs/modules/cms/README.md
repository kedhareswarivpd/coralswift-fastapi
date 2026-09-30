# Module: CMS / Content

**Purpose**: public-facing content — blog, and everything built through
the generic `build_crud_router` factory (`app/utils/router_factory.py`):
Services, Testimonials, FAQs, Case Studies, Downloads, Events, Industries,
Technologies, Products, Awards, Gallery, Portfolio, Partners (public logo
grid — distinct from the Partner Portal's `partner_accounts` tenant table),
Resources, SEO metadata, Page Content, Solutions.

**Users**: public (read), `admin`/`marketing` (write — the standard write
role pair for nearly every CMS resource; a handful narrow this further,
e.g. Blog).

## Blog & Comments (the one CMS resource with real workflow logic)

- `Blog`: `status` (`BlogStatus`: `draft, published, archived`),
  `author_id`, `category_id`, `tags` (array), `views`.
- `Comment`: `blog_id` CASCADE, `status` (`CommentStatus`: `pending,
  approved, spam`, always starts `pending` — **never auto-approved**).

```
GET    /blogs                (public/non-staff forced to status=published)
POST   /blogs                (admin, marketing — auto-slugifies, sets published_at only if status=published)
PUT    /blogs/{id}            DELETE /blogs/{id}          (admin, marketing)

GET    /comments             (public sees only status=approved)
POST   /comments             (public, rate-limited 5/minute)
PATCH  /comments/{id}         DELETE /comments/{id}       (admin, marketing — moderation)
```

## Generic CRUD resources

Every other resource in this module follows the identical shape from
`build_crud_router`: `GET` (list + one, `public_read=True` → no auth on
reads), `POST`/`PUT`/`DELETE` gated by that resource's `write_roles`
(default `("admin",)`, several extend it to include `marketing`). This is
intentional — 15+ resources share one audited, tested implementation
rather than each having a bespoke router; see
[architecture/README.md](../../architecture/README.md).

## Business rules

- `moderate_comment` has **no status-transition guard** — any of the three
  `CommentStatus` values can be set directly from any current state (e.g.
  `spam` back to `approved` is allowed, with no restriction).
- Comment creation always returns a message stating it "will appear once
  approved" — the pending default is a deliberate moderation gate, not a
  bug.

## Events

None — no notification to the author when their post is commented on, no
notification to moderators when a new comment arrives.

## Dependencies

None significant — this module is largely self-contained aside from
`Blog.author_id`→`users`.

## Known gaps (code-confirmed, observation, not a verified TODO)

- `Blog.views` exists as a column but no increment endpoint/logic was
  found in `blog.py` — view counting may be intended but isn't wired up in
  this router (not confirmed elsewhere in the codebase).
