# Module-wise Test Report

**Project:** CoralSwift  
**Generated:** 2026-08-15  

## 1. Backend - Endpoint Coverage by Module

Every endpoint is exercised by `tests/test_api_comprehensive.py` (211 API cases) plus targeted unit/integration suites. Total backend tests: **368 passed**.

| Module (router) | Endpoints | Public | Auth-only | Role-restricted | Used by FE | Not used by FE | Tested |
|-----------------|-----------|--------|-----------|-----------------|-----------|----------------|--------|
| auth | 4 | 3 | 1 | 0 | 4 | 0 | yes |
| users | 6 | 0 | 0 | 6 | 6 | 0 | yes |
| gdpr | 2 | 0 | 0 | 2 | 2 | 0 | yes |
| stats | 1 | 1 | 0 | 0 | 1 | 0 | yes |
| employees | 17 | 0 | 11 | 6 | 17 | 0 | yes |
| clients | 13 | 0 | 9 | 4 | 13 | 0 | yes |
| projects | 6 | 0 | 0 | 4 | 6 | 0 | yes |
| task | 3 | 0 | 2 | 1 | 3 | 0 | yes |
| finance | 5 | 0 | 0 | 5 | 5 | 0 | yes |
| career | 5 | 2 | 0 | 3 | 5 | 0 | yes |
| contact | 2 | 1 | 0 | 1 | 2 | 0 | yes |
| blog | 4 | 0 | 0 | 3 | 4 | 0 | yes |
| service | 5 | 2 | 0 | 3 | 5 | 0 | yes |
| case_study | 5 | 2 | 0 | 3 | 5 | 0 | yes |
| testimonial | 5 | 2 | 0 | 3 | 5 | 0 | yes |
| download | 5 | 2 | 0 | 3 | 5 | 0 | yes |
| event | 5 | 2 | 0 | 3 | 5 | 0 | yes |
| ticket | 4 | 0 | 0 | 4 | 4 | 0 | yes |
| award | 5 | 2 | 0 | 3 | 5 | 0 | yes |
| category | 5 | 2 | 0 | 3 | 5 | 0 | yes |
| faq | 5 | 2 | 0 | 3 | 5 | 0 | yes |
| gallery | 5 | 2 | 0 | 3 | 5 | 0 | yes |
| industry | 5 | 2 | 0 | 3 | 5 | 0 | yes |
| partner | 5 | 2 | 0 | 3 | 5 | 0 | yes |
| portfolio | 5 | 2 | 0 | 3 | 5 | 0 | yes |
| product | 5 | 2 | 0 | 3 | 5 | 0 | yes |
| resource | 5 | 2 | 0 | 3 | 5 | 0 | yes |
| technology | 5 | 2 | 0 | 3 | 5 | 0 | yes |
| notification | 4 | 0 | 3 | 1 | 4 | 0 | yes |
| media | 3 | 0 | 0 | 3 | 3 | 0 | yes |
| audit_log | 1 | 0 | 0 | 1 | 1 | 0 | yes |
| dashboard | 2 | 0 | 0 | 2 | 2 | 0 | yes |
| role | 10 | 0 | 0 | 10 | 10 | 0 | yes |
| solution | 5 | 2 | 0 | 3 | 5 | 0 | yes |
| training | 4 | 2 | 2 | 0 | 3 | 1 | yes |
| analytics | 1 | 0 | 0 | 1 | 1 | 0 | yes |
| reports | 3 | 0 | 0 | 3 | 3 | 0 | yes |
| leads | 5 | 0 | 0 | 5 | 5 | 0 | yes |
| proposals | 5 | 0 | 0 | 5 | 5 | 0 | yes |
| contracts | 3 | 0 | 0 | 3 | 3 | 0 | yes |
| department | 5 | 0 | 2 | 3 | 5 | 0 | yes |

**Totals:** 198 endpoints across 41 router modules.

## 2. Backend - Unit / Integration Test Files

| Test file | Count | Focus |
|-----------|-------|-------|
| `tests/test_api_comprehensive.py` | 211 | Every endpoint, role/auth matrix |
| `tests/test_uploads.py` | 28 | File validation, magic bytes, path traversal |
| `tests/test_pagination_errors.py` | 21 | Pagination, sorting, ApiError |
| `tests/test_security.py` | 21 | JWT decode, JWKS caching, key construction |
| `tests/test_dependencies.py` | 19 | Auth deps, role checking, IP resolution |
| `tests/test_services.py` | 18 | Email, notifications, Supabase client |
| `tests/test_crud_base.py` | 17 | CRUD operations, error handling |
| `tests/test_db_integration.py` | 14 | True SQLite DB integration |
| `tests/test_integration.py` | 13 | CRUD flow, mocked async DB |
| `tests/test_health.py` | 3 | Health endpoint, package exports |
| `tests/test_auth.py` | 1 | Register service unavailable fallback |
| `tests/test_config.py` | 1 | Settings dotenv loading |
| `tests/test_migrations.py` | 1 | Alembic migration helper |
| **Total** | **368** | |

## 3. Frontend - Tests by Module

| Test file | Count | Coverage |
|-----------|-------|----------|
| `api/__tests__/client.test.js` | 20 | apiRequest (incl. FormData), ApiRequestError, toQueryString |
| `hooks/__tests__/hooks.test.jsx` | 18 | ScrollToTop, ScrollReveal, FocusTrap, DocumentTitle, CountUp, role guard |
| `components/ui/__tests__/Badge.test.jsx` | 15 | Badge rendering + className |
| `components/ui/__tests__/Button.test.jsx` | 11 | Button variants, sizes, onClick |
| `context/__tests__/AuthContext.test.jsx` | 8 | Login / register / logout flows via Supabase + backend |
| `context/__tests__/ThemeContext.test.jsx` | 7 | Dark mode toggle + localStorage persistence |
| `hooks/__tests__/useApiResource.test.js` | 7 | Data fetching, fallback, error states |
| `components/admin/__tests__/ContentManager.test.jsx` | 4 | CMS resource tabs, listing, create form |
| `test/App.test.jsx` | 2 | App rendering + route wiring |
| **Total** | **92** | |

## 4. Quality Gates

| Gate | Result |
|------|--------|
| Backend pytest | 368 passed |
| Frontend vitest | 92 passed (9 files) |
| ESLint | 0 errors |
| Production build | passes |

## 5. Cleanup Performed (2026-08-15)

**Unused backend endpoints deleted** (no frontend consumer; Supabase covers auth flows): 47 route methods across 14 routers —
auth forgot/reset-password + refresh-token, analytics/track, blogs/{id}/comments, downloads+resources `/{id}/track`,
meetings CRUD, newsletter subscribe/unsubscribe/subscribers, pages/{slug} CRUD, proposals + contracts detail GET/PATCH,
tasks/{id} GET/PUT/DELETE, employees/{id} CRUD + documents endpoints, clients/{id} CRUD, careers/{slug} GET + {id} PUT/DELETE,
performance-reviews CRUD (admin), seo/{page_path}, settings CRUD, users/me DELETE + export, contact/{id}/status,
trainings courses POST/PUT/DELETE (admin).

**Routers removed entirely:** `meeting.py`, `newsletter.py`, `page_content.py`, `performance_review.py`, `seo.py`, `setting.py`
(unregistered from `app/routers/__init__.py`). Remaining routers, models and schemas are all imported/registered.

**Features added to use previously-orphaned endpoints:**
- Careers page: apply form (`ApplyForm.jsx`) posting multipart FormData to `POST /careers/{id}/apply` (resume upload).
- Employee Portal Training tab: catalog (`GET /trainings/courses`) with per-course Enroll (`POST /trainings/enroll`).
- `apiRequest` now sends `FormData` bodies as-is (multipart) instead of JSON-encoding.

**Dead/duplicate frontend files removed** (6, no imports anywhere):

- `src/components/auth/LoginModal.jsx`
- `src/components/ui/Eyebrow.jsx`
- `src/components/ui/StatBlock.jsx`
- `src/components/ui/ThemeToggle.jsx` (duplicated a local ThemeToggle in `Navbar.jsx`)
- `src/data/adminDemo.js` (superseded by `src/data/portal.js`)
- `src/lib/portalAuth.js`

