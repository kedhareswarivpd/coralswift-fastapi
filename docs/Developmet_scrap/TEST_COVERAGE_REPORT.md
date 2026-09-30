# Unit & Integration Testing Coverage Report

**Project:** CoralSwift  
**Date:** 2026-08-11  
**Scope:** Full codebase (Backend + Frontend)

---

## Executive Summary

| Metric | Count |
|--------|-------|
| **Total Backend API Endpoints** | 199 |
| **Endpoints with ANY test coverage** | 30 (15.1%) |
| **Endpoints with ZERO test coverage** | 169 (84.9%) |
| **Backend test files** | 7 + conftest |
| **Frontend components** | 80 |
| **Frontend components tested** | 3 (3.75%) |
| **Total test cases** | ~83 backend + 7 frontend = **90** |

---

## Test Type Distribution (Backend)

| Type | Count | Percentage |
|------|-------|------------|
| **Unit Tests** | 3 | 3.6% |
| **Integration Tests (shallow — validation/auth only)** | 80 | 96.4% |
| **Integration Tests (deep — real DB/data flow)** | 0 | **0%** |

---

## Backend Test Files Breakdown

### `test_config.py` — 1 test
| Test | Type | Coverage |
|------|------|----------|
| `test_settings_read_dotenv_from_backend_root_when_cwd_changes` | **UNIT** | `app.core.config.Settings` dotenv loading |

### `test_health.py` — 3 tests
| Test | Type | Coverage |
|------|------|----------|
| `test_package_exports_fastapi_app` | **UNIT** | `app/__init__.py` exports |
| `test_health_check` | **INTEGRATION** | `GET /health` → 200 |
| `test_register_requires_valid_email` | **INTEGRATION** | `POST /auth/register` → 422 |

### `test_auth.py` — 11 tests
| Test | Type | Coverage |
|------|------|----------|
| `test_register_requires_valid_email` | **INTEGRATION** | register email validation |
| `test_register_requires_min_password_length` | **INTEGRATION** | register password validation |
| `test_register_requires_name` | **INTEGRATION** | register name validation |
| `test_login_requires_email_and_password` | **INTEGRATION** | login validation |
| `test_register_returns_service_unavailable_when_auth_client_is_unavailable` | **UNIT** | `app.routers.auth.register` error handling |
| `test_me_without_token` | **INTEGRATION** | `/auth/me` → 401 |
| `test_me_with_invalid_token` | **INTEGRATION** | `/auth/me` → 401 |
| `test_logout_with_empty_token` | **INTEGRATION** | `/auth/logout` |
| `test_forgot_password_validation` | **INTEGRATION** | forgot-password validation |
| `test_reset_password_validation` | **INTEGRATION** | reset-password validation |
| `test_refresh_token_validation` | **INTEGRATION** | refresh-token validation |

### `test_migrations.py` — 1 test
| Test | Type | Coverage |
|------|------|----------|
| `test_reports_migration_helper_detects_existing_tables` | **UNIT** | `alembic` migration `table_exists()` |

### `test_services.py` — 7 tests
| Test | Type | Coverage |
|------|------|----------|
| `test_list_services_pagination_validation` | **INTEGRATION** | services pagination → 422 |
| `test_list_services_bad_limit` | **INTEGRATION** | services limit → 422 |
| `test_create_service_requires_auth` | **INTEGRATION** | services create → 401 |
| `test_create_service_with_invalid_token` | **INTEGRATION** | services create → 401 |
| `test_update_service_requires_auth` | **INTEGRATION** | services update → 401/404 |
| `test_delete_service_requires_auth` | **INTEGRATION** | services delete → 401/404 |
| `test_get_service_blank_id_redirects` | **INTEGRATION** | services blank ID → 307 |

### `test_projects.py` — 5 tests
| Test | Type | Coverage |
|------|------|----------|
| `test_create_project_requires_auth` | **INTEGRATION** | projects create → 401 |
| `test_update_project_requires_auth` | **INTEGRATION** | projects update → 401 |
| `test_delete_project_requires_auth` | **INTEGRATION** | projects delete → 401 |
| `test_list_projects_bad_page_params` | **INTEGRATION** | projects pagination → 422 |
| `test_get_project_blank_id_redirects` | **INTEGRATION** | projects blank ID → 307 |

### `test_phase2.py` — 22 tests
| Test | Type | Coverage |
|------|------|----------|
| `test_list_products_returns_200` | **INTEGRATION** | products list → 200 |
| `test_create_product_requires_auth` | **INTEGRATION** | products create → 401 |
| `test_get_product_by_id_returns_404_for_missing` | **INTEGRATION** | products get → 404 |
| `test_create_product_with_invalid_token` | **INTEGRATION** | products create → 401 |
| `test_list_solutions_returns_200` | **INTEGRATION** | solutions list → 200 |
| `test_create_solution_requires_auth` | **INTEGRATION** | solutions create → 401 |
| `test_list_resources_returns_200` | **INTEGRATION** | resources list → 200 |
| `test_create_resource_requires_auth` | **INTEGRATION** | resources create → 401 |
| `test_subscribe_validation` | **INTEGRATION** | newsletter subscribe → 422 |
| `test_subscribe_requires_email` | **INTEGRATION** | newsletter subscribe → 422 |
| `test_list_subscribers_requires_auth` | **INTEGRATION** | newsletter list → 401 |
| `test_get_seo_returns_null_for_unknown` | **INTEGRATION** | SEO get → 200 |
| `test_upsert_seo_requires_auth` | **INTEGRATION** | SEO upsert → 401 |
| `test_get_page_returns_404_for_missing` | **INTEGRATION** | pages get → 404 |
| `test_upsert_page_requires_auth` | **INTEGRATION** | pages upsert → 401 |
| `test_list_courses_returns_200` | **INTEGRATION** | trainings list → 200 |
| `test_create_course_requires_auth` | **INTEGRATION** | trainings create → 401 |
| `test_list_reviews_requires_auth` | **INTEGRATION** | performance reviews → 401 |
| `test_track_page_view_returns_200` | **INTEGRATION** | analytics track → 200 |
| `test_summary_requires_auth` | **INTEGRATION** | analytics summary → 401 |
| `test_sitemap_returns_xml` | **INTEGRATION** | sitemap → 200 |

---

## Frontend Test Files Breakdown

### `App.test.jsx` — 2 tests
| Test | Type | Coverage |
|------|------|----------|
| `renders without crashing` | **UNIT** | `App.jsx` renders on `/` |
| `renders a route for /services` | **UNIT** | `/services` route renders |

### `Badge.test.jsx` — 2 tests
| Test | Type | Coverage |
|------|------|----------|
| `renders with children` | **UNIT** | Badge renders text |
| `accepts className and merges it` | **UNIT** | className merging |

### `Button.test.jsx` — 3 tests
| Test | Type | Coverage |
|------|------|----------|
| `renders with children` | **UNIT** | Button renders text |
| `accepts variant props and applies correct classes` | **UNIT** | variant CSS classes |
| `fires onClick handler` | **UNIT** | click handler |

---

## Backend Coverage by Module

### Modules WITH Tests (Partial)

| Module | Endpoints | Tested | Coverage |
|--------|-----------|--------|----------|
| `auth.py` | 9 | 7 | 78% (validation only) |
| `projects.py` | 6 | 5 | 83% (auth/validation only) |
| `services.py` | 5 | 5 | 100% (auth/validation only) |
| `products.py` | 5 | 4 | 80% (auth/validation only) |
| `solutions.py` | 5 | 2 | 40% |
| `resources.py` | 6 | 2 | 33% |
| `training.py` | 7 | 2 | 29% |
| `newsletter.py` | 3 | 2 | 67% |
| `seo.py` | 3 | 2 | 67% |
| `page_content.py` | 3 | 2 | 67% |
| `analytics.py` | 2 | 2 | 100% (auth/validation only) |
| `performance_review.py` | 5 | 1 | 20% |

### Modules with ZERO Tests

| Module | Endpoints | Risk Level |
|--------|-----------|------------|
| `employees.py` | 20 | 🔴 HIGH — attendance, leaves, timesheets, payslips |
| `clients.py` | 17 | 🔴 HIGH — client portal, invoices, tickets |
| `users.py` | 7 | 🔴 HIGH — user management |
| `tasks.py` | 6 | 🟡 MEDIUM — task CRUD |
| `finance.py` | 6 | 🔴 HIGH — invoices, payments |
| `careers.py` | 8 | 🟡 MEDIUM — job postings, applications |
| `contact.py` | 3 | 🟡 MEDIUM — contact form |
| `blog.py` | 7 | 🟡 MEDIUM — blog CRUD, comments |
| `categories.py` | 5 | 🟢 LOW |
| `industries.py` | 5 | 🟢 LOW |
| `technologies.py` | 5 | 🟢 LOW |
| `case_study.py` | 5 | 🟢 LOW |
| `portfolio.py` | 5 | 🟢 LOW |
| `testimonials.py` | 5 | 🟢 LOW |
| `partners.py` | 5 | 🟢 LOW |
| `awards.py` | 5 | 🟢 LOW |
| `faqs.py` | 5 | 🟢 LOW |
| `gallery.py` | 5 | 🟢 LOW |
| `downloads.py` | 6 | 🟡 MEDIUM |
| `events.py` | 5 | 🟢 LOW |
| `tickets.py` | 4 | 🟡 MEDIUM |
| `meetings.py` | 5 | 🟡 MEDIUM |
| `notifications.py` | 4 | 🟡 MEDIUM |
| `media.py` | 3 | 🟡 MEDIUM — file upload |
| `settings.py` | 3 | 🟡 MEDIUM |
| `audit_log.py` | 1 | 🟡 MEDIUM |
| `dashboard.py` | 2 | 🟡 MEDIUM |
| `role.py` | 10 | 🔴 HIGH — access control |
| `gdpr.py` | 4 | 🔴 HIGH — data export/deletion |
| `stats.py` | 1 | 🟢 LOW |
| `reports.py` | 3 | 🟡 MEDIUM |
| `leads.py` | 6 | 🟡 MEDIUM |
| `proposals.py` | 7 | 🟡 MEDIUM |
| `contracts.py` | 4 | 🟡 MEDIUM |
| `departments.py` | 5 | 🟢 LOW |

### Core/Service Modules with ZERO Tests

| Module | Lines | What it does | Risk |
|--------|-------|--------------|------|
| `core/security.py` | 158 | JWT verification (HS256/ES256/RS256), JWKS | 🔴 CRITICAL |
| `core/dependencies.py` | 107 | Auth deps, role checking, IP resolution | 🔴 CRITICAL |
| `core/database.py` | 57 | SQLAlchemy engine, session factory | 🟡 MEDIUM |
| `core/errors.py` | 34 | ApiError class | 🟢 LOW |
| `core/config.py` | 120 | Settings (1 test exists) | 🟢 LOW |
| `core/audit.py` | 30 | Audit logging | 🟢 LOW |
| `core/logger.py` | 28 | Logging config | 🟢 LOW |
| `core/sitemap.py` | 24 | Sitemap routes | 🟢 LOW |
| `core/csrf.py` | 29 | CSRF docs | 🟢 LOW |
| `services/supabase_client.py` | 35 | Supabase client factory | 🟡 MEDIUM |
| `services/email_service.py` | 65 | SMTP email sending | 🟡 MEDIUM |
| `services/notification_service.py` | 23 | Notification dispatch | 🟡 MEDIUM |
| `crud/base.py` | 121 | Generic CRUD operations | 🔴 HIGH |
| `utils/router_factory.py` | 79 | CRUD router generator | 🟡 MEDIUM |
| `utils/pagination.py` | 39 | Pagination + sort | 🟡 MEDIUM |
| `utils/responses.py` | 35 | API response formatting | 🟢 LOW |
| `utils/uploads.py` | 134 | File upload + magic-byte verification | 🔴 CRITICAL |

---

## Frontend Coverage Summary

| Category | Total | Tested | Coverage |
|----------|-------|--------|----------|
| UI Components | 19 | 2 | 10.5% |
| Layout Components | 4 | 0 | 0% |
| Page Components | 30 | 0 | 0% |
| Feature Components | 24 | 0 | 0% |
| Custom Hooks | 6 | 0 | 0% |
| API Modules | 12 | 0 | 0% |
| Contexts | 2 | 0 | 0% |

### Frontend Untested (High Priority)

| Module | What it does | Risk |
|--------|--------------|------|
| `api/client.js` | `apiRequest`, `ApiRequestError` | 🔴 CRITICAL |
| `api/auth.js` | login, register, fetchCurrentUser | 🔴 CRITICAL |
| `api/admin.js` | 40+ admin API functions | 🔴 HIGH |
| `context/AuthContext.jsx` | Auth state, login, register, logout | 🔴 CRITICAL |
| `context/ThemeContext.jsx` | Dark/light theme | 🟢 LOW |
| `hooks/useApiResource.js` | Data fetching with fallback | 🟡 MEDIUM |
| `hooks/useScrollToTop.js` | Scroll management | 🟢 LOW |
| `hooks/useScrollReveal.js` | IntersectionObserver reveal | 🟢 LOW |
| `hooks/useFocusTrap.js` | Keyboard focus trapping | 🟢 LOW |
| `hooks/useDocumentTitle.js` | Document title | 🟢 LOW |
| `hooks/useCountUp.js` | Animated counter | 🟢 LOW |

---

## Critical Findings

### 🔴 CRITICAL — No Tests

1. **Security code** — JWT verification, JWKS caching, role-based access (`core/security.py:158`, `core/dependencies.py:107`)
2. **File upload security** — Magic-byte verification, MIME validation, path traversal prevention (`utils/uploads.py:134`)
3. **CRUD base** — All generic CRUD operations (`crud/base.py:121`)
4. **Frontend API layer** — `apiRequest` error handling, `ApiRequestError` (`api/client.js`)
5. **AuthContext** — Central auth state management (`context/AuthContext.jsx`)

### 🟡 HIGH RISK — Shallow Tests Only

6. **Auth endpoints** — Only validation (422) and auth-gate (401) tested; no success-path tests
7. **Finance** — Invoice calculations, payment recording completely untested
8. **Employee self-service** — Check-in/out, leaves, timesheets untested
9. **CRM workflow** — Lead-to-client conversion, proposals, contracts untested
10. **Role-based access** — Only 401 checks; no role-specific behavior tested

### 🔴 MISSING — No Deep Integration Tests

11. **No real database tests** — All DB interactions mocked; no SQL query/transaction/data integrity tests
12. **No E2E tests** — No complete user flow tests (register → login → create → verify)
13. **No contract tests** — No tests verifying API response shape matches frontend expectations

---

## Coverage Percentage Summary

### Backend
| Category | Total | Tested | Coverage |
|----------|-------|--------|----------|
| API Endpoints | 199 | 30 | **15.1%** |
| Core modules | 9 | 1 | **11.1%** |
| Service modules | 3 | 0 | **0%** |
| CRUD module | 1 | 0 | **0%** |
| Utility modules | 4 | 0 | **0%** |
| Model files | 40+ | 0 | **0%** |

### Frontend
| Category | Total | Tested | Coverage |
|----------|-------|--------|----------|
| Components | 80 | 3 | **3.75%** |
| Hooks | 6 | 0 | **0%** |
| API modules | 12 | 0 | **0%** |
| Contexts | 2 | 0 | **0%** |
| Pages | 30 | 0 | **0%** |

---

## Recommendations (Priority Order)

### Priority 1 — Critical Security & Business Logic (Unit Tests)
1. `app/core/security.py` — JWT decode, JWKS fetch, token expiration
2. `app/utils/uploads.py` — Magic-byte, MIME validation, size limits
3. `app/core/dependencies.py` — `get_current_user`, `require_roles`
4. `app/services/email_service.py` — HTML escaping, SMTP error handling
5. `app/crud/base.py` — All CRUD operations with test DB

### Priority 2 — Deep Integration Tests (Real Database)
6. Set up test database (SQLite or test PostgreSQL)
7. Auth flow — register → login → access protected route
8. Finance flow — invoice → payment → status update
9. CRM workflow — lead → proposal → contract → client

### Priority 3 — Frontend Unit Tests
10. `api/client.js` — `apiRequest`, `ApiRequestError`
11. `context/AuthContext.jsx` — login, register, logout
12. `hooks/useApiResource.js` — data fetching, error states
13. Components — `ContactForm`, `LoginModal`

### Priority 4 — Coverage Expansion
14. Add tests for all `router_factory`-generated endpoints
15. Add tests for employee self-service endpoints
16. Add tests for notification service
17. Add tests for pagination/sort logic
18. Add contract tests (API response shape vs frontend adapters)

---

## How to Run Tests

```powershell
# Backend
cd C:\Users\VPD\CF\backend
pytest -v

# Frontend
cd C:\Users\VPD\CF\frontend
npm test
```

---

*Report generated: 2026-08-11*
