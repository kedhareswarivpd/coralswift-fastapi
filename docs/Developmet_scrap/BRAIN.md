# BRAIN.md — CoralSwift Technologies Platform

> Single source of truth. Read this before making any change.

---

## 1. PROJECT MAP

```
coralswift-platform/
├── frontend/                        # Vite + React 18 SPA (port 5173 dev, port 80 prod)
│   ├── src/
│   │   ├── api/                     # Thin fetch wrappers, one file per resource
│   │   │   ├── client.js            #   apiRequest() + ApiRequestError class
│   │   │   ├── auth.js              #   login, fetchCurrentUser, logout
│   │   │   ├── services.js          #   fetchServices
│   │   │   ├── projects.js          #   fetchProjects
│   │   │   ├── contact.js           #   submitContactForm
│   │   │   ├── clients.js           #   client portal API
│   │   │   ├── employees.js         #   employee portal API
│   │   │   ├── admin.js             #   admin/panel API
│   │   │   └── adapters.js          #   snake_case → camelCase mapping
│   │   ├── context/
│   │   │   └── AuthContext.jsx       #   Auth provider: login/logout/session persistence
│   │   ├── hooks/
│   │   │   ├── useApiResource.js     #   Fetch with graceful fallback to demo data
│   │   │   ├── useDocumentTitle.js   #   Sets document.title per page
│   │   │   ├── useScrollReveal.js   #   IntersectionObserver hook
│   │   │   └── useScrollToTop.js    #   Scrolls to top on route change
│   │   ├── data/                    # Static demo/fallback data files
│   │   │   ├── home.js              #   homeStats, whyChooseUs
│   │   │   ├── services.js          #   services, engagementProcess, faqs
│   │   │   ├── projects.js          #   featuredCaseStudy, projects
│   │   │   ├── about.js             #   coreValues, timeline, leadership, offices
│   │   │   ├── solutions.js         #   6 solutions
│   │   │   ├── products.js          #   6 products with statuses
│   │   │   ├── technologies.js      #   5 categories with proficiency bars
│   │   │   ├── industries.js        #   6 industries
│   │   │   ├── caseStudies.js       #   6 case studies
│   │   │   ├── careers.js           #   6 jobs + benefits + cultureValues
│   │   │   ├── blog.js              #   6 posts + categories
│   │   │   ├── events.js            #   6 events + typeFilters
│   │   │   ├── gallery.js           #   3 albums with images
│   │   │   ├── awards.js            #   6 awards + yearFilters
│   │   │   ├── downloads.js         #   6 downloads + categoryFilters
│   │   │   ├── resources.js         #   6 resources + typeFilters
│   │   │   ├── faq.js               #   4 categories with items
│   │   │   ├── legal.js             #   privacy, terms, cookie content
│   │   │   └── portal.js            #   demo data for all portals
│   │   ├── components/
│   │   │   ├── ui/                  # Atomic primitives (Button, Badge, Icon, etc.)
│   │   │   ├── layout/              # Navbar, Footer, Layout (Outlet wrapper)
│   │   │   ├── auth/                # LoginModal
│   │   │   ├── home/                # Hero, StatsBar, WhyChooseUs, CtaBanner
│   │   │   ├── services/            # ServicesHero, ServiceCard, EngagementProcess, FaqAccordion
│   │   │   ├── portfolio/           # PortfolioHero, FilterBar, ProjectCard, GlobalMap
│   │   │   ├── about/               # AboutHero, MissionVision, ValuesGrid, Timeline, LeadershipGrid
│   │   │   ├── solutions/           # SolutionsHero, SolutionsGrid
│   │   │   ├── products/            # ProductsHero, ProductsGrid
│   │   │   ├── technologies/        # TechHero, TechGrid
│   │   │   ├── industries/          # IndustriesHero, IndustriesGrid
│   │   │   ├── caseStudies/         # CaseStudiesHero, CaseStudyCard, CaseStudiesGrid
│   │   │   ├── careers/             # CareersHero, JobCard, JobListings, CultureSection
│   │   │   ├── blog/                # BlogHero, BlogCard, BlogGrid
│   │   │   ├── events/              # EventsHero, EventsGrid
│   │   │   ├── gallery/             # GalleryHero, GalleryGrid
│   │   │   ├── awards/              # AwardsHero, AwardsGrid
│   │   │   ├── downloads/           # DownloadsHero, DownloadsGrid
│   │   │   ├── resources/           # ResourcesHero, ResourcesGrid
│   │   │   ├── faq/                 # FaqSection
│   │   │   └── legal/               # LegalContent (reusable for privacy/terms/cookies)
│   │   ├── pages/                   # 26 route components
│   │   ├── App.jsx                  # Route definitions
│   │   ├── main.jsx                 # Entry point + providers
│   │   └── index.css                # Tailwind + custom utilities
│   ├── docker/                      # Dockerfile + nginx.conf
│   ├── tailwind.config.js           # Design token system
│   └── vite.config.js               # Proxy config
│
├── backend/                         # FastAPI + SQLAlchemy 2.0 async
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py            #   Pydantic Settings (.env)
│   │   │   ├── database.py          #   Async engine + session factory
│   │   │   ├── security.py          #   JWT decode (Supabase)
│   │   │   ├── dependencies.py      #   get_current_user, require_roles
│   │   │   ├── errors.py            #   ApiError exception class
│   │   │   ├── audit.py             #   Audit logging utility
│   │   │   └── logger.py            #   Logging config
│   │   ├── models/                  # 35+ SQLAlchemy models + enums
│   │   │   ├── __init__.py          #   Imports all models for Alembic/mapper resolution
│   │   │   ├── user.py              #   Users (FK to auth.users)
│   │   │   └── ...                  #   Employee, Client, Project, Task, etc.
│   │   ├── schemas/                 # Pydantic v2 request/response models
│   │   ├── crud/
│   │   │   └── base.py              #   CRUDBase — generic async CRUD
│   │   ├── routers/                 # 42 router files
│   │   │   ├── __init__.py          #   Combines all routers into api_router
│   │   │   ├── auth.py              #   Login, register, refresh, me
│   │   │   ├── users.py, role.py    #   User & role management
│   │   │   ├── clients.py           #   Client portal (me/*)
│   │   │   ├── employees.py         #   Employee portal (me/*)
│   │   │   ├── dashboard.py         #   Admin dashboard KPIs
│   │   │   ├── partner.py           #   Partner CRUD
│   │   │   ├── service.py, industry.py, technology.py, portfolio.py  # CMS
│   │   │   ├── case_study.py, projects.py, career.py, blog.py        # Content
│   │   │   ├── event.py, gallery.py, award.py, download.py, faq.py   # More content
│   │   │   ├── resource.py, product.py, solution.py                  # Phase 2
│   │   │   ├── contact.py, newsletter.py, testimonial.py             # Engagement
│   │   │   ├── finance.py, task.py, ticket.py, meeting.py            # Operations
│   │   │   ├── training.py, course.py, performance_review.py         # HR/L&D
│   │   │   ├── media.py, notification.py, setting.py, category.py    # Admin
│   │   │   ├── audit_log.py, seo.py, page_content.py, analytics.py  # Admin
│   │   │   └── ... (other misc routers)
│   │   ├── services/
│   │   │   └── email_service.py     # SMTP contact form
│   │   ├── utils/
│   │   │   ├── router_factory.py    # build_crud_router (auto REST)
│   │   │   ├── responses.py         # success_response, error_response
│   │   │   ├── pagination.py        # PageParams, apply_sort
│   │   │   └── uploads.py           # File upload validation + save
│   │   ├── seeders/
│   │   │   └── seed.py              # Creates super admin + reference data
│   │   └── main.py                  # FastAPI app: middleware, handlers, routes
│   ├── alembic/                     # Migration environment (async-aware)
│   ├── docker/                      # Dockerfile, docker-compose.yml, nginx.conf
│   ├── tests/                       # 47 pytest tests
│   ├── requirements.txt
│   └── alembic.ini
│
├── docker-compose.yml               # Combined stack (frontend + backend + redis)
├── .github/workflows/               # CI/CD
├── audit.md                         # (this run) Comprehensive audit
└── BRAIN.md                         # (this file) You are here
```

---

## 2. ARCHITECTURE OVERVIEW

### Frontend → Backend Communication

```
Browser ──HTTPS──▶ Nginx (:80) ──proxy──▶ FastAPI (:8000)
                        │                       │
                   static files             Supabase Postgres
                   (dist/)                   (external)
                                            Redis (:6379)
```

**Dev mode:** Vite dev proxy (`/api/*` → `http://localhost:8000`). No CORS needed.
**Production:** Nginx in frontend container proxies `/api/` and `/uploads/` to the backend container over the Docker internal network.

### Auth Flow

```
Frontend                  Backend                   Supabase
   │                        │                         │
   ├── POST /auth/login ──▶ │ ──────────▶ sign_in ──▶ │
   │                        │ ◀────────── JWT ◀────── │
   │◀───── { user + tokens }                         │
   │                        │                         │
   │── Store tokens in ──▶ localStorage               │
   │   localStorage        │                         │
   │                        │                         │
   ├── GET /auth/me ──────▶ │ ── decode_jwt ──────────│
   │   (Bearer token)       │ ── resolve_user ────────│
   │◀───── { user }         │                         │
```

- JWTs are issued by Supabase, verified by backend via `supabase_jwt_secret`
- `public.users` table has FK to `auth.users.id` for profile data (role, name, phone, avatar)
- Auto-provisioning: if JWT is valid but no profile row exists, backend creates one automatically
- `require_roles("admin", "hm")` decorator gates admin endpoints; `super_admin` always bypasses

### Data Flow

```
Static Data (src/data/*.js) ──▶ Used by 24 of 26 pages
         │
         │  fallback
         ▼
useApiResource hook ──▶ GET /api/v1/{resource} ──▶ FastAPI ──▶ SQLAlchemy ORM ──▶ Supabase PG
         │                    │                          │
         │              returns paginated           joins, filters,
         │              { data, meta }               search, sort
```

Only Services and Portfolio pages connect to the backend currently. All Phase 2/3 pages use static data files exclusively.

---

## 3. DESIGN SYSTEM

### Colors
```
brand       #3D6268  (teal — CTAs, links, interactive states)
brand-dark  #2C3E41  (deep teal — footers, dark sections, headings)
brand-light #5A7F86  (lighter accent)
brand-tint  #7BA1A8  (muted icon backgrounds)

accent-cyan      #A7CDD5  (highlights on dark bg)
accent-cyan-pale #E2F1F3  (badge/chip bg on light bg)

warning #FD5521

surface (Material 3 tonal palette)
  DEFAULT #F7F9FB  dim #D8DADC  bright #F7F9FB  low #F2F4F6
  container #ECEEF0  high #E6E8EA  highest #E0E3E5  white #FFFFFF

ink (text colors)
  DEFAULT #191C1E  muted #43474D  inverse #EFF1F3

outline DEFAULT #74777E  variant #C4C6CE
```

### Typography
```
display: Plus Jakarta Sans (headings, hero titles)
body:    Inter (paragraphs, descriptions)
stat:    Montserrat (numbers, statistics)
mono:    JetBrains Mono (code snippets)

Scale:
  display-lg    48px/56px -0.02em weight 700
  headline-lg   32px/40px -0.02em weight 600
  headline-md   30px/38px weight 600
  headline-sm   24px/32px weight 600
  body-lg       18px/28px weight 400
  body-md       16px/24px weight 400
  body-sm       14px/20px weight 400
  stat-lg       40px/48px -0.01em weight 700
  label-caps    12px/16px 0.05em weight 600 (uppercase)
  code-snippet  14px/20px weight 400
```

### Spacing (8px grid)
```
base: 8px
stack-sm: 8px   stack-md: 16px   stack-lg: 32px   stack-xl: 48px
gutter: 24px
margin-mobile: 16px   margin-desktop: 40px
section-padding: 80px
max-container: 1280px
```

### Shadows
```
card:       0px 4px 20px rgba(10, 37, 64, 0.05)
card-hover: 0px 12px 32px rgba(10, 37, 64, 0.1)
```

---

## 4. ROUTE MAP

### Public Pages (all under `<Layout />`)
| Path | Component | Auth | Backend |
|------|-----------|------|---------|
| `/` | Home | ✗ | — |
| `/services` | Services | ✗ | `GET /api/v1/services` |
| `/solutions` | Solutions | ✗ | `GET /api/v1/solutions` |
| `/industries` | Industries | ✗ | `GET /api/v1/industries` |
| `/products` | Products | ✗ | `GET /api/v1/products` |
| `/technologies` | Technologies | ✗ | `GET /api/v1/technologies` |
| `/portfolio` | Portfolio | ✗ | `GET /api/v1/portfolio` |
| `/case-studies` | CaseStudies | ✗ | `GET /api/v1/case-studies` |
| `/projects` | (via portfolio) | ✗ | (redirect) |
| `/careers` | Careers | ✗ | `GET /api/v1/careers` |
| `/resources` | Resources | ✗ | `GET /api/v1/resources` |
| `/blog` | Blog | ✗ | `GET /api/v1/blog` |
| `/events` | Events | ✗ | `GET /api/v1/events` |
| `/gallery` | Gallery | ✗ | `GET /api/v1/gallery` |
| `/awards` | Awards | ✗ | `GET /api/v1/awards` |
| `/downloads` | Downloads | ✗ | `GET /api/v1/downloads` |
| `/faq` | Faq | ✗ | `GET /api/v1/faq` |
| `/about` | About | ✗ | — |
| `/contact` | Contact | ✗ | `POST /api/v1/contact` |
| `/privacy` | Privacy | ✗ | — |
| `/terms` | Terms | ✗ | — |
| `/cookies` | Cookies | ✗ | — |

### Portals (auth-gated, under `<Layout />`)
| Path | Component | Auth | Backend |
|------|-----------|------|---------|
| `/client` | ClientPortal | ✓ | `GET /api/v1/clients/me/*` |
| `/employee` | EmployeePortal | ✓ | `GET /api/v1/employees/me/*` |
| `/partner` | PartnerPortal | ✓ | `GET /api/v1/partners` |
| `/admin` | AdminPanel | ✓ | `GET /api/v1/dashboard/*` |

### Backend-only endpoints
| Path | Purpose |
|------|---------|
| `GET /health` | Health check (used by Docker HEALTHCHECK) |
| `GET /sitemap.xml` | SEO sitemap |
| `GET /docs` | Swagger UI |
| `GET /redoc` | ReDoc |
| `/uploads/` | Static file serving for uploaded assets |
| `POST /api/v1/auth/login` | JWT login via Supabase |
| `POST /api/v1/auth/register` | Admin-initiated user creation |
| `POST /api/v1/auth/refresh-token` | Token refresh |
| `GET /api/v1/auth/me` | Current user profile |

---

## 5. KEY CONVENTIONS

### Frontend
- **File naming:** PascalCase for components (`Button.jsx`), camelCase for utilities (`useScrollReveal.js`)
- **Imports:** Use `.jsx` extension. Import data files as `import { x } from '../data/x.js'`
- **Data flow:** Static data from `src/data/*.js` → components. API-backed data via `useApiResource` hook + `src/api/*.js`
- **Styling:** Tailwind utility classes. Never use inline `style={{}}` unless for dynamic values (gradient positions, etc.)
- **Routing:** All routes in `App.jsx`. New pages must:
  1. Create `frontend/src/pages/PageName.jsx`
  2. Create components in `frontend/src/components/pagename/`
  3. Create data in `frontend/src/data/pagename.js` (if static)
  4. Add import + `<Route>` in `App.jsx`
  5. Add nav link in `Navbar.jsx` + footer link

### Backend
- **REST pattern:** `GET list`, `GET one`, `POST create`, `PUT update`, `DELETE delete` via `build_crud_router` for simple CRUD. Custom routers for auth, portals, dashboard
- **Response envelope:** `{ success: bool, status_code: int, message: str, data: any, meta?: { page, limit, total } }`
- **Errors:** `{ success: false, status_code: int, message: str, errors?: [{field, message}] }`
- **Auth:** `Depends(get_current_user)` for protected routes; `Depends(require_roles("admin"))` for RBAC
- **Pagination:** `?page=1&limit=20&sort=-created_at&search=keyword`
- **Migrations:** Alembic with async-aware `env.py`. Run `alembic upgrade head` on deploy
- **Adding a new model:** Create model → Create schema → Create CRUD → Create router → Import in `routers/__init__.py` → Import in `models/__init__.py` → Generate migration

### Data files vs API integration
Every public page's data file (`src/data/*.js`) should ideally be replaced by API calls via `useApiResource`. The data files serve as fallback/demo content. To wire a page to the backend:
1. Create `src/api/pagename.js` with fetch function
2. Create adapter in `src/api/adapters.js` if backend schema differs
3. In the page, replace `import { data } from '../data/x.js'` with `useApiResource(fetchX, adaptX, fallbackData, deps)`

---

## 6. DEPENDENCY MAP

### Frontend Dependencies
```
React 18                    → UI library
React Router DOM 6           → Routing
Vite 5                       → Bundler + dev server
Tailwind CSS 3               → Styling
@vitejs/plugin-react         → JSX transform
Material Symbols Outlined    → Icon font (Google Fonts CDN)
Plus Jakarta Sans            → Display font (Google Fonts)
Inter / Montserrat / JB Mono → Body/stat/code fonts
```

No state management library (Context API only), no component library, no CSS-in-JS.

### Backend Dependencies
```
FastAPI              → Web framework
SQLAlchemy 2.0        → ORM (async)
asyncpg               → Async Postgres driver
psycopg2-binary       → Sync driver (Alembic)
Alembic               → Migrations
Pydantic v2            → Validation
python-jose           → JWT verification
supabase-py            → Supabase Auth API
redis                 → Caching (wired but not actively used)
slowapi               → Rate limiting
python-multipart      → File upload parsing
aiosmtplib            → SMTP (contact form)
jinja2                → Email templates
gunicorn              → Production WSGI server
pytest + httpx        → Testing
```

---

## 7. CRITICAL WORKFLOWS

### Contact Form Submission
1. User fills form at `/contact`
2. `ContactForm.jsx` calls `POST /api/v1/contact` via `submitContactForm()`
3. Backend validates fields, saves to DB (`contact_submissions` table), sends email via SMTP
4. Returns `{ data: submission }` on success, `{ errors: [...] }` on validation failure
5. Frontend shows success message with "send another" button, or field-level errors

### Employee Portal — Check In/Out
1. User navigates to `/employee`
2. Employee dashboard shows current day attendance status
3. "Check In" button → `POST /api/v1/employees/me/attendance/check-in`
4. Backend creates attendance record for today (or returns existing one)
5. "Check Out" button → `POST /api/v1/employees/me/attendance/check-out`
6. Backend updates check_out time on today's record
7. Frontend reflects updated status immediately

### Client Portal — Create Support Ticket
1. User navigates to `/client` → Support Tickets tab
2. Clicks "New Ticket", fills subject + description
3. `POST /api/v1/clients/me/tickets` creates ticket linked to client profile
4. Ticket appears in list with "open" status
5. Admin can see all tickets via `GET /api/v1/tickets`

---

## 8. KNOWN ISSUES & RISKS

### High Priority
| Issue | File(s) | Risk |
|-------|---------|------|
| Cookie consent banner missing | Entire frontend | GDPR/ePrivacy violation (P0) |
| Fabricated metrics on hero | `data/home.js`, `data/about.js` | Misleading advertising (P0) |
| Portals use demo data only | `data/portal.js`, all 4 portal pages | No real API integration |
| Auth tokens in localStorage | `AuthContext.jsx` | XSS-triggered token theft |
| No CSRF protection | All POST/PUT/DELETE calls | Session hijacking on forms |

### Medium Priority
| Issue | File(s) | Risk |
|-------|---------|------|
| Token layer breaches (40+ instances) | 28 frontend files | Design drift, maintenance burden |
| No dark mode | `tailwind.config.js` | Poor UX for 30%+ of users |
| Static XML sitemap | `main.py:156-183` | Stale SEO |
| No empty/loading states | All grid components | Poor UX on slow connections |
| Dead footer links (`href="#"`) | `Footer.jsx`, `FaqAccordion.jsx` | User confusion |

### Low Priority
| Issue | File(s) | Risk |
|-------|---------|------|
| Dead CSS utilities | `index.css:25-37` | Dead code |
| No breadcrumbs | All pages | Navigation tax on deep content |
| Icon sizing inconsistency | 12+ components | Visual polish |
| No data export/deletion endpoints | Backend | GDPR non-compliance |

---

## 9. WHAT BREAKS IF YOU CHANGE

### If you rename a model file
- Must update `models/__init__.py` (import)
- Must update any router importing it
- Must update any schema referencing it
- Alembic will need a new migration (`revision --autogenerate`)

### If you change the response envelope
- Every `api/{resource}.js` frontend file that calls `.data` will break
- The `useApiResource` hook expects `{ data: [...] }`
- Router factory (`build_crud_router`) assumes the envelope

### If you change a tailwind token name
- All components using the old token will silently stop applying that style
- Tailwind's JIT compiler will not warn — the class silently does nothing
- Test by checking for the old class name across the codebase

### If you remove a data file
- The corresponding page will crash at import time
- The `useApiResource` fallback for that page will have no demo data
- Check all pages that import from it before removing

---

## 10. TESTING

### Backend (47 tests)
```
backend/tests/
├── test_health.py          # 1 test — GET /health returns ok
├── test_auth.py            # 10 tests — login, register, me, invalid tokens, duplicates
├── test_services.py        # 2 tests — list services, get one
├── test_projects.py        # 4 tests — list, filter by industry, get one, create (auth-gated)
├── test_contact.py         # 3 tests — submit, field validation, auth-not-required
└── test_phase2.py          # 23 tests — all Phase 2 endpoints
```

All tests use mocked database (not hitting real Supabase). Run with:
```bash
cd backend
pytest -v
```

### Frontend
No frontend tests exist. No Jest/Vitest/Testing Library setup. The README says "build compiles" is the check.

---

## 11. DEPLOYMENT

### Docker Compose (full stack)
```bash
docker compose up -d --build
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.seeders.seed
```

### Docker Compose (backend only)
```bash
docker compose -f backend/docker/docker-compose.yml up -d --build
```

### Manual (dev)
```bash
# terminal 1
cd backend && uvicorn app.main:app --reload

# terminal 2
cd frontend && npm run dev

# terminal 3 (optional, for redis)
docker run -p 6379:6379 redis:7-alpine
```

### Production checklist
1. Fill `backend/.env` with real Supabase credentials
2. Set `ENV=production` in backend `.env`
3. Build frontend: `cd frontend && npm run build`
4. Run migrations: `alembic upgrade head`
5. Seed admin: `python -m app.seeders.seed`
6. Deploy with `docker compose up -d --build`
7. Set up SSL termination (recommended: Cloudflare or Let's Encrypt via nginx on host)

---

## 12. FILE COUNTS (current)

| Category | Count |
|----------|-------|
| Frontend pages | 26 |
| Frontend components | 55+ |
| Frontend data files | 19 |
| Frontend hooks | 4 |
| Frontend API modules | 6 |
| Backend routers | 42 |
| Backend models | 35+ |
| Backend schema files | 15+ |
| Backend tests | 47 |
| Docker config files | 6 (docker-compose, Dockerfiles, nginx) |
| CI/CD workflows | 2 (backend.yml, frontend.yml) |

---

## 13. QUICK REFERENCE

### Add a new public page
```jsx
// 1. Create frontend/src/pages/NewPage.jsx
import useDocumentTitle from '../hooks/useDocumentTitle.js';
export default function NewPage() {
  useDocumentTitle('Title | CoralSwift');
  return <>{/* sections */}</>;
}

// 2. Create frontend/src/data/newPage.js
export const items = [...];

// 3. Create frontend/src/components/newPage/ components

// 4. Add to App.jsx:
import NewPage from './pages/NewPage.jsx';
// ...
<Route path="new-page" element={<NewPage />} />

// 5. Add to Navbar.jsx NAV_LINKS
// 6. Add to Footer.jsx RESOURCES or COMPANY
```

### Add a new API endpoint
```python
# 1. Create/update router
from app.crud.base import CRUDBase
from app.utils.router_factory import build_crud_router
crud = CRUDBase(MyModel, searchable_fields=["name"])
router = build_crud_router(crud, MyCreate, MyUpdate, MyOut, prefix="/my-resource", tags=["My"])

# 2. Register in app/routers/__init__.py — import router, add to api_router
```

### Wire a static-data page to the API
```jsx
// Before:
import { items } from '../data/items.js';
// ... use items directly

// After:
import { fetchItems } from '../../api/items.js';
import { adaptItem } from '../../api/adapters.js';
import { items as fallback } from '../../data/items.js';
const { items, loading, error, isFallback } = useApiResource(fetchItems, adaptItem, fallback, []);
```

---

## 14. ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (User)                         │
│  React SPA · Material Symbols · Tailwind CSS                │
│  localStorage (auth tokens)                                 │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Nginx (frontend container, port 80)                        │
│  • Serves static build (dist/)                              │
│  • Proxies /api/* → backend:8000                            │
│  • Proxies /uploads/* → backend:8000                        │
│  • CSP, HSTS, security headers                              │
└────────────────────────┬────────────────────────────────────┘
                         │ Docker internal network
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Gunicorn + Uvicorn (backend container, port 8000)          │
│  │                                                          │
│  ├─ FastAPI app                                             │
│  │  ├─ Middleware: CORS, SecurityHeaders, Audit, RateLimit  │
│  │  ├─ Routers: 42 files, public + admin + portal           │
│  │  ├─ Auth: JWT verify → RBAC → auto-provision profile    │
│  │  └─ Error handlers: ApiError, Validation, 500 catch-all │
│  │                                                          │
│  ├─ SQLAlchemy 2.0 async ORM                                │
│  │  ├─ 35+ models, UUID PKs, soft-delete-ready             │
│  │  ├─ CRUDBase generic operations                          │
│  │  └─ Relationship: public.users → auth.users (Supabase)  │
│  │                                                          │
│  └─ Services                                                │
│     ├─ email_service (SMTP contact notifications)           │
│     ├─ audit logging to DB                                  │
│     └─ file upload validation (MIME + ext + size)           │
└───────────────┬──────────────────────────┬──────────────────┘
                │                          │
                ▼                          ▼
     ┌──────────────────┐       ┌──────────────────┐
     │  Supabase PG     │       │  Redis 7         │
     │  (external)      │       │  (optional)      │
     │  • auth.users    │       │  • caching       │
     │  • public.*      │       │  • rate limiting │
     │  • RLS disabled  │       └──────────────────┘
     └──────────────────┘
```

---

## 15. GLOSSARY

| Term | Meaning |
|------|---------|
| CRUDBase | Generic async CRUD operations for any SQLAlchemy model (list/get/create/update/delete) |
| build_crud_router | Factory that generates a FastAPI router with standard CRUD routes + filtering/pagination |
| Public_read | Router flag: unauthenticated users can GET; write requires specific role |
| Require_roles | Dependency factory: `Depends(require_roles("admin", "hr"))` |
| useApiResource | Hook: fetch from API with graceful degradation to demo data |
| SectionHeading | Shared component: eyebrow + title + description with configurable alignment |
| Reveal | Scroll-triggered fade-in animation wrapper |
| Label-caps | Tailwind type class: 12px uppercase with tracking — used for form labels, badges, nav items |
| Container | Tailwind max-w class: 1280px centered layout |
| Gutter | Spacing token: 24px — used between grid columns |
| Section-padding | Spacing token: 80px — used for section vertical padding |
| Stack-lg | Spacing token: 32px — used between major content blocks |
