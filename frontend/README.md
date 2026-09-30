# CoralSwift Technologies — Frontend

A React + Tailwind CSS rebuild of the four Stitch-exported pages (Homepage,
Services, Project Portfolio, About Us), converted into a proper multi-page
Vite application with shared layout, componentized sections, and real
interactivity (routing, filtering, accordions, scroll-reveal).

---

## Stack

- **Vite** + **React 18** (JavaScript, not TypeScript)
- **Tailwind CSS** (installed via PostCSS — the source files used the Tailwind
  CDN script, which isn't meant for production)
- **react-router-dom** for client-side routing between the four pages
- **Material Symbols Outlined** (Google Fonts icon font) — kept as-is from the
  source designs rather than swapped for an npm icon library, so every icon
  matches the original pixel-for-pixel

## Getting Started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview the production build locally
```

## Testing

```bash
npm test            # Vitest — unit/component tests (src/**/__tests__)
npm run test:e2e     # Playwright — auth E2E (e2e/), against a *running* stack
```

`test:e2e` targets an already-running backend+frontend stack (defaults to
`http://localhost:8081`; override with `PLAYWRIGHT_BASE_URL`) rather than
spawning its own dev server — CoralSwift's httpOnly-cookie auth needs the
frontend and backend to share an origin the way the real reverse proxy
provides, so `docker compose up -d backend frontend` (see the root
`docker-compose.yml`) first. `e2e/global-setup.js` performs one real API
login and reuses it as a Playwright `storageState` fixture for tests that
don't need to exercise the login form itself — this keeps the suite well
under the backend's real per-IP login rate limit (10/minute); if you add new
E2E tests, prefer that fixture over a fresh UI login unless the test is
specifically about the login flow.

## Production (Docker)

`docker/Dockerfile` is a multi-stage build: it compiles the Vite app, then
serves the static output with nginx, which also proxies `/api/*` and
`/uploads/*` to a `backend` container on the same Docker network (see
`docker/nginx.conf`). This is normally run via the combined
`docker-compose.yml` one level up (in `coralswift-platform/`) rather than
standalone — see the root README for the full stack.

## Connecting to the Backend

This frontend is wired to the companion **FastAPI backend**
(the sibling `../backend` folder in the `coralswift-platform` monorepo). Here's how the pieces fit together:

1. **Start the backend first** (see its own README): `uvicorn app.main:app --reload`
   — it listens on `http://localhost:8000` by default.
2. **Copy the frontend env file**: `cp .env.example .env`. The default
   `VITE_API_URL=/api/v1` is a *relative* path on purpose — see the proxy
   note below.
3. **Run the frontend**: `npm run dev`.

### Why a relative API URL + dev proxy, not CORS?

`vite.config.js` proxies any request to `/api/*` (and `/uploads/*`) straight
through to the backend (`VITE_API_PROXY_TARGET`, default
`http://localhost:8000`). That means the browser only ever talks to the Vite
dev server on `5173` — there's no cross-origin request, so no CORS
configuration is needed for local development at all. This also mirrors how
you'd deploy in production: put both apps behind one reverse proxy (nginx,
etc.) that routes `/api` to the backend and everything else to this app's
static build.

The backend's CORS middleware (`app/main.py`) still allows
`http://localhost:5173` directly, as a fallback for `npm run preview` or any
setup that doesn't use the proxy.

### What's actually wired up

| Frontend | Backend endpoint | Behavior |
|---|---|---|
| Services page | `GET /api/v1/services` | Falls back to the local demo data in `src/data/services.js` if the API is unreachable or returns no records |
| Portfolio page | `GET /api/v1/projects?industry=...` | Industry filter is applied server-side; falls back to local demo data + client-side filtering otherwise |
| Contact page (`/contact`) | `POST /api/v1/contact` | Real form submission, with field-level validation errors surfaced from the backend |
| "Client Portal" button (Navbar) | `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout` | Opens a login modal; on success shows the signed-in user's name and a sign-out option. Session persists across reloads via `localStorage` |

`src/api/` holds the thin fetch wrapper (`client.js`) and one module per
resource. `src/hooks/useApiResource.js` is the shared "fetch with graceful
fallback to demo data" hook used by the Services and Portfolio pages —
adapters in `src/api/adapters.js` translate the backend's snake_case CMS
fields into the shape the existing presentation components expect.

**Note:** on a freshly seeded backend, `/services` and `/projects` will be
empty (the seed script only creates a super admin, departments, and a few
settings — see the backend README) — you'll see the demo data with a small
"Showing sample projects" notice on the Portfolio page until you add real
records through the Admin Panel API.


## Structure

```
src/
├── api/                  # fetch wrapper (client.js) + one module per resource + adapters.js
├── context/               # AuthContext (login/logout/session persistence)
├── components/
│   ├── layout/        # Navbar, Footer, Layout (shared across all pages)
│   ├── ui/             # Button, Badge, Icon, SectionHeading, StatBlock, Reveal
│   ├── auth/            # LoginModal
│   ├── contact/          # ContactForm
│   ├── home/              # Hero, StatsBar, WhyChooseUs, CtaBanner
│   ├── services/           # ServicesHero, ServiceCard, EngagementProcess, FaqAccordion
│   ├── portfolio/            # PortfolioHero, FilterBar, FeaturedCaseStudy, ProjectCard, GlobalMap
│   └── about/                  # AboutHero, MissionVision, ValuesGrid, Timeline, LeadershipGrid, ...
├── pages/               # One file per route: Home, Services, Portfolio, About, Contact, NotFound
├── data/                 # Plain-JS fallback/demo content (services, projects, team, timeline, ...)
├── hooks/                  # useScrollReveal, useScrollToTop, useDocumentTitle, useApiResource
├── App.jsx                  # Route definitions
├── main.jsx                  # Entry point (wraps App in AuthProvider)
└── index.css                  # Tailwind layers + hand-authored effect classes (glass panels, map pulse, etc.)
```

Routes: `/` (Home), `/services`, `/portfolio`, `/about`, `/contact`.

## Design System Unification — read this first

The four source exports each shipped with their **own, drifted Tailwind
config** — three different "primary" colors, inconsistent border-radius
scales, and variable names that didn't match their actual hex values (e.g.
`enterprise-navy` pointing at a teal, not navy). This is a known artifact of
how the Stitch tool re-generates a fresh design token set per page.

Rather than reproduce that inconsistency, `tailwind.config.js` here defines
**one unified system**, built from whichever source most consistently used
each token:

| Token | Value | Source |
|---|---|---|
| `brand` (primary teal) | `#3D6268` | Home/Services/Portfolio exports |
| `brand-dark` | `#2C3E41` | About export (`primary`) |
| `brand-light` | `#5A7F86` | consistent "brand-teal" across all 4 exports |
| `accent-cyan` | `#A7CDD5` | Home/Services/Portfolio `inverse-primary` |
| Typography | Plus Jakarta Sans / Inter / Montserrat / JetBrains Mono | About export + `nexus_core/DESIGN.md` |
| Spacing scale, `section-padding`, `container-max` | 8px base, 1280px container | identical across all 4 exports |
| Border radius | `0.5rem` / `1rem` / `1.5rem` | `nexus_core/DESIGN.md` (richer than the ad-hoc per-page scales) |

If you'd rather match one specific exported page's exact palette instead of
the unified system, the per-page hex values are still visible in each
`code.html` in the original zip for reference.

## Notable adaptations from the static HTML

- **Homepage**: the source export only included the Hero section (the file
  was cut short). I kept the Hero pixel-faithful and added a stats bar +
  "Why CoralSwift" section + CTA banner, built from the same design tokens
  and real content-pack numbers, so `/` is a complete page rather than a
  single section.
- **Portfolio filters**: the industry/service filter buttons are now real
  React state — selecting an industry actually filters the visible project
  cards (the source only toggled a CSS class with no real filtering).
- **FAQ accordion**: converted from `<details>` elements + a vanilla-JS
  "close siblings" listener into a `useState`-driven accordion.
- **Global map**: the source used a static Google-hosted illustration image
  (a temporary Stitch asset URL). Replaced with a CSS/SVG-friendly
  icon-and-pulse-node representation built from the same office-location
  data, so it doesn't depend on an external asset that may not stay valid.
- **Scroll-reveal**: the About page's vanilla `IntersectionObserver` became a
  reusable `useScrollReveal` hook + `<Reveal>` wrapper, applied consistently
  across all four pages instead of just one.
- **Navbar/Footer**: originally each page shipped its own slightly different
  header/footer markup and copy. Consolidated into single shared
  `Navbar`/`Footer` components with working route-aware active states
  (`react-router-dom`'s `NavLink`) and a functional mobile menu (the source
  had no mobile nav at all — desktop-only `hidden md:flex`).

## Validation note

This was built and syntax-checked in a sandboxed environment without npm
registry access, so `npm install` / `npm run dev` haven't been executed
end-to-end here. Every `.jsx`/`.js` file was individually run through
esbuild's parser (bundled with a locally available tool) to catch syntax
errors, and all internal import paths were statically verified to resolve to
real files — but please run `npm install && npm run dev` as your first step
to confirm everything wires up at runtime.
