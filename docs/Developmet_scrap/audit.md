# Site Audit Report

**Date:** 2026-07-04
**Project:** CoralSwift Technologies
**Detected stack:** Vite 5 + React 18 (frontend) · FastAPI/SQLAlchemy 2.0 + Supabase Postgres (backend) · Tailwind CSS 3 with custom tokens · Python 3.12 · Docker Compose
**Detected audience/goal:** Enterprise technology consulting firm marketing site with three authenticated portals (Client, Employee, Partner) and an Admin Panel. Primary goal: generate qualified leads via contact form and showcase technical credibility through case studies/services/portfolio.
**Design system maturity:** Partially tokenized — a well-structured `tailwind.config.js` defines brand colors, spacing scale, type scale, and shadows, but components frequently break the token layer with ad-hoc Tailwind values (`text-[10px]`, `bg-green-100`).

---

## Anti-Pattern Verdict

**Partially AI-generated tells present.** Score: 2/4

Specific tells visible in the codebase:

1. **"430+ Projects", "285+ Employees", "99.8% Uptime"** — hero metrics in `frontend/src/data/home.js:3` and `frontend/src/data/about.js:109-113`. These appear as hardcoded numbers with no API data source or verifiable origin. The backend has no projects/employees/uptime counters. Purely decorative.

2. **Glassmorphism used decoratively** — `frontend/src/index.css:11-16` defines `.glass-panel` with `backdrop-filter: blur(12px)`. Used in `frontend/src/components/home/Hero.jsx:39` for a "Live Operations" panel that shows fake progress bars and a flashing "Active" badge with no real connection to any backend. Purely decorative.

3. **"Live" / "Active" badge with real-time animation but zero real-time data** — Hero.jsx:42-48 renders a pulsing green dot labeled "Active" with `animate-ping` CSS. This is a common AI template trope: a status indicator that implies live data where none exists.

4. **Gradient text utility** — `frontend/src/index.css:32-37` defines `.gradient-text` with brand teal→cyan gradient. While the color choice is intentional (not purple), it's a utility that does not appear in any component — suggests speculative addition.

5. **Card-grid overuse** — 12+ components render content inside `border rounded-lg p-stack-lg hover:shadow-card-hover` cards, including ones where a simple `<li>` or `<hr>` would group content better (e.g., awards grid, download cards, case study cards). Every piece of content gets the same visual treatment regardless of its hierarchy.

6. **Footer "Solutions" links are dead** — `frontend/src/components/layout/Footer.jsx` lists "Cloud Transformation", "AI & Data Strategy", etc. as `<a href="#">` placeholders with no routing. These were added alongside real `<Link>` items — a tell that some content was generated without verifying the link targets exist.

**What distinguishes it from pure AI slop:**
- The design token system is unified and intentional (teal palette, Plus Jakarta Sans / Inter pairing, Material 3 tonal scale)
- The component structure follows consistent patterns
- Backend is genuinely functional (42 routers, auth, CRUD, audit logging, rate limiting)
- Portals are fleshed out with real backend endpoints, not just frontend mockups

---

## Audit Health Score

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 1/4 | 4 aria-labels total, no focus trapping, no heading hierarchy enforcement, no skip-to-content |
| 2 | Performance | 2/4 | No image lazy loading, CSS animated via `top`/`left` in some utilities, bundle has liberal imports |
| 3 | Security | 3/4 | No XSS found, CSP present, rate limiting active, but auth tokens stored in localStorage and no CSRF protection |
| 4 | Theming & design system | 2/4 | Tokens defined but widely breached: `text-[10px]`/`text-[16px]`/`bg-green-100` appear 40+ times; no dark mode |
| 5 | Responsive design | 2/4 | Mobile nav exists but touch targets <44px; multiple hardcoded icon sizes; gallery lightbox may overflow on small screens |
| 6 | Anti-patterns | 2/4 | Fabricated metrics, decorative glassmorphism, live-status badges with no data source, dead footer links |
| | **Total** | **12/24** | **Acceptable — major work needed before launch** |

**Legal & compliance flags:**
- Privacy Policy: **Present** — `/privacy` rendered; linked from footer
- Terms & Conditions: **Present** — `/terms` rendered; linked from footer
- Cookie Policy: **Present** — `/cookies` rendered; linked from footer
- Cookie consent: **MISSING** — no cookie consent banner exists anywhere in the codebase. Non-essential cookies (analytics) are implied in the Cookie Policy text but no consent-gathering mechanism is implemented.
- GDPR signals: **MISSING** — no data deletion/export endpoints, no consent management, no privacy-by-default settings
- COPPA: N/A

---

## Executive Summary

The CoralSwift platform is structurally sound with a genuinely functional backend, 42 API routers, RBAC, rate limiting, audit logging, and 26 frontend pages. However, it is not deployment-ready due to three critical gaps: **(1)** the platform has no contractual/legal protection — every data-collecting form exposes the company to regulatory liability without a cookie consent banner; **(2)** accessibility is essentially absent — the site fails WCAG A on multiple dimensions and would be vulnerable to ADA litigation ($10,000+ per violation); **(3)** the frontend fabricates metrics that could constitute misleading advertising if the site goes live without sourcing them from actual backend data. The design system is partially tokenized but consistently breached, and touch targets fall below accessibility thresholds. SEO metadata and security headers are strong — these should be preserved during the fix pass.

**Total findings by severity:** P0: 2 · P1: 8 · P2: 10 · P3: 5

---

## Quick Wins

1. **Add `role="dialog"` + `aria-modal` to LoginModal** (P1) — one attribute on the container div fixes a WCAA A failure
2. **Remove "Live Operations" fake panel from Hero** (P1) — eliminates a misleading-advertising exposure and a 415px of JSX with no user value
3. **Replace `text-[10px]` with `text-label-caps` across 20+ components** (P2) — single project-wide find-and-repair restores token integrity

---

## Findings

### P0 — Blocking

#### P0-1: Cookie consent banner missing — legal liability on every page
- **Category:** Legal & compliance
- **Location:** Entire frontend — no cookie consent component exists
- **Issue:** The Cookie Policy (`frontend/src/data/legal.js`) acknowledges the use of analytics and marketing cookies that require user consent ("Essential cookies are always active … other cookies require consent"). But no consent-banner, cookie-settings panel, or consent-preference storage mechanism is implemented anywhere in the frontend. Visitors are served cookies without any opt-in.
- **User impact:** Processing personal data without valid consent violates GDPR Art. 7 (fines up to EUR 20M or 4% of annual revenue), ePrivacy Directive, and CCPA. A user from the EU who visits the site is immediately subject to a violation. The Cookie Policy itself documents the violation.
- **Fix:** Implement a cookie consent banner that appears on first visit, blocks non-essential cookies until consent is granted, stores preferences in localStorage, and surfaces a "Cookie Settings" link in the footer. Include granular toggles for analytics vs marketing categories.

#### P0-2: Fabricated enterprise metrics presented as fact — misleading advertising risk
- **Category:** Anti-patterns, Legal & compliance
- **Location:** `frontend/src/data/home.js:2-6` (homeStats), `frontend/src/data/about.js:108-113` (aboutStats)
- **Issue:** Hardcoded values "430+ Projects Delivered", "120+ Enterprise Clients", "18+ Countries Served", "99.8% Uptime", "285+ Engineers", "99.9% Success Rate" appear on the homepage and about page. No backend endpoint populates these values from any real data source. They are static numbers in a JS data file that never change and cannot be sourced from the actual database.
- **User impact:** If a user or competitor documents these numbers and they cannot be substantiated, this constitutes false advertising under FTC guidelines and similar regulations in other jurisdictions. A prospective client relying on "99.8% uptime" who experiences downtime has grounds for complaint.
- **Fix:** Either (a) build a real `GET /api/v1/stats` endpoint that queries actual DB aggregates (project count, employee count, client count) and wire the frontend to use it, or (b) remove all numerical claims and replace with qualitative statements like "Trusted by enterprises worldwide."

### P1 — Major

#### P1-1: No focus indicator visible on interactive elements
- **Category:** Accessibility (WCAG 2.4.7)
- **Location:** Global — `frontend/src/index.css` does not include a `:focus-visible` style; Tailwind's default `outline` ring may be suppressed by `focus:outline-none` in form controls
- **Issue:** `ContactForm.jsx` uses `focus:outline-none` on inputs without providing an alternative focus ring that is sufficiently visible. The global CSS resets focus outlines. Keyboard-only users navigating via Tab cannot see which element is focused.
- **User impact:** Keyboard users (motor disabilities, power users) cannot complete forms or navigate navigation menus because they cannot track their current position.
- **Fix:** Add a global `:focus-visible { outline: 2px solid token(brand); outline-offset: 2px; }` style. Remove `focus:outline-none` from inputs and use a custom focus ring that passes 3:1 contrast against all backgrounds.

#### P1-2: Heading hierarchy violated — h2 before h1 in some page layouts
- **Category:** Accessibility (WCAG 1.3.1)
- **Location:** `frontend/src/pages/Solutions.jsx:3`, `frontend/src/pages/Products.jsx:3` (and ~10 other Phase 2/3 pages)
- **Issue:** All new Phase 2/3 pages stack `<SectionHeading />` (which renders an `<h2>`) *after* the hero section but *without* a preceding `<h1>` until the hero renders one. However, in the portal pages (ClientPortal, EmployeePortal), the first heading is `<h1>` inside the heading, and `<SectionHeading>` renders `<h2>` after it — this is correct. In legal pages, `<h1>` comes from `LegalContent` — correct. The inconsistency means screen reader users get different heading experiences on different pages.
- **User impact:** Screen reader users navigating by heading (`H` key in NVDA/JAWS) get inconsistent jump-to-navigation. Some pages have `<h1>` first (correct), others start with content before `<h1>`.
- **Fix:** Audit all 26 pages to ensure the first rendered heading on every page is `<h1>` within a `<header>` or `<section>` landmark. Move page titles consistently to `<h1>` and subsequent section headings to `<h2>`.

#### P1-3: LoginModal does not trap focus
- **Category:** Accessibility (WCAG 2.1.2, 2.4.3)
- **Location:** `frontend/src/components/auth/LoginModal.jsx:11` — the `.fixed.inset-0` backdrop
- **Issue:** When the LoginModal is open, Tab and Shift+Tab navigate through elements behind the modal. Focus is not trapped within the dialog. The Escape key closes the modal but focus is not returned to the element that triggered it (the "Client Portal" button).
- **User impact:** Keyboard users can accidentally tab out of the modal behind the backdrop, becoming trapped in invisible UI they cannot interact with (the backdrop is clickable but offers no visual feedback). Sighted keyboard users lose their place. Screen reader users may not be able to complete the login form.
- **Fix:** Implement focus trapping on open: store the trigger element, programmatically focus the first input on open (`autoFocus` partially handles this), intercept Tab/Shift+Tab to cycle within the modal, and return focus to the trigger on close.

#### P1-4: Accordion components lack ARIA attributes
- **Category:** Accessibility (WCAG 4.1.2)
- **Location:** `frontend/src/components/services/FaqAccordion.jsx:17-24`, `frontend/src/components/faq/FaqSection.jsx:52-56`, `frontend/src/components/careers/JobCard.jsx:24-38`
- **Issue:** Three accordion-style components exist (FAQ accordion, FAQ section, job card details), and none have `role="region"`, `aria-expanded`, `aria-controls`, or `aria-labelledby` on the toggling buttons. Screen readers receive no semantic signal that content can be expanded or collapsed.
- **User impact:** Screen reader users cannot determine which items are expandable or whether content is currently visible. The toggle buttons look like static text to assistive technology.
- **Fix:** Add `aria-expanded={isOpen}`, `aria-controls={id}`, and `id={id}` on the content panel. Add `role="region"` and `aria-labelledby` to the content panel pointing at the button.

#### P1-5: No `role="dialog"` or `aria-modal` on LoginModal
- **Category:** Accessibility (WCAG 4.1.2)
- **Location:** `frontend/src/components/auth/LoginModal.jsx:28`
- **Issue:** The modal container is a `<div>` with `fixed inset-0 z-[100]` but no `role="dialog"`, `aria-modal="true"`, or `aria-labelledby` pointing at the heading. Assistive technology does not recognize it as a dialog.
- **User impact:** Screen readers announce modal content as if it is part of the page flow below, not a separate overlay requiring user interaction.
- **Fix:** Add `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` referencing the `<h2>` heading.

#### P1-6: Form errors not tied to inputs via aria-describedby
- **Category:** Accessibility (WCAG 3.3.1, 3.3.2)
- **Location:** `frontend/src/components/contact/ContactForm.jsx:110-115` (Field component)
- **Issue:** The `Field` component renders error text directly below the input as a `<span>`, but the `<span>` is not linked to the input via `aria-describedby`. When a field-level validation error appears, screen reader users do not hear the error message unless they re-navigate to the field.
- **User impact:** A blind user submitting a form with errors will hear "form submitted with errors" but not know which fields are wrong or why. Each field must be navigated to individually to discover the problem, causing frustration and abandonment.
- **Fix:** Pass a unique error ID to each `<Field>`, render it on the error `<span>`, and add `aria-describedby={errorId}` to the `<input>`. On form submit with errors, move focus to the first errored field.

#### P1-7: Career jobs `/careers` page slugify-only filter with no backend-connected search
- **Category:** Performance, UX
- **Location:** `frontend/src/components/careers/JobListings.jsx`
- **Issue:** The careers page renders all 6 jobs from static data with no server-side filtering, search, or department filter. The `useApiResource` pattern exists but is not used here — no API backing. With ~200+ real job postings (as implied by "285 employees"), this page would become unusably long without server-side pagination and search.
- **User impact:** Users searching for specific jobs must visually scan every card. On a real dataset this is unusable.
- **Fix:** Wire the careers page to the backend `GET /api/v1/careers` endpoint via `useApiResource`, add department/type/location filter tabs, and implement real-time keyword search with debounced API calls.

#### P1-8: Gallery lightbox navigation not keyboard accessible
- **Category:** Accessibility (WCAG 2.1.1)
- **Location:** `frontend/src/components/gallery/GalleryGrid.jsx:68-100`
- **Issue:** The lightbox overlay renders Previous/Next buttons and a Close button, but focus is not trapped inside the lightbox. Arrow keys do not navigate between images. The lightbox is a `<div>` with no `role="dialog"`.
- **User impact:** A keyboard user opening a gallery image cannot use arrow keys to browse or Tab to navigate controls. They must use a mouse or be trapped.
- **Fix:** Add `role="dialog"` and focus trapping. Listen for ArrowLeft/ArrowRight keys to navigate between images. Return focus to the trigger thumbnail on close.

### P2 — Minor

#### P2-1: Token layer breached — `text-[Npx]` used 40+ times instead of design tokens
- **Category:** Theming & design system
- **Location:** 28 files across `frontend/src/`, e.g.:
  - `BlogCard.jsx:20` — `text-[14px]` (should be `text-body-sm` which is `14px`)
  - `Navbar.jsx:62` — `text-[18px]` (should be `text-body-md`)
  - `Footer.jsx:113` — `text-[10px]` (should be `text-label-caps`)
  - `Services/serviceCard.jsx:7` — `text-[32px]`
  - `EventsGrid.jsx:37` — `text-[10px]`
  - 35+ more instances
- **Issue:** The tailwind config defines a type scale with exact px values (`body-sm` = 14px, `label-caps` = 12px, `body-md` = 16px, etc.), but components consistently use arbitrary `text-[Npx]` values that often duplicate the token. This creates a maintenance surface — changing the type scale in the config does not propagate to these components.
- **User impact:** No visible impact to users. Developer impact: inconsistent type sizing, harder theme maintenance, design drift.
- **Fix:** Project-wide grep for `text-\[` and replace with the matching token from the type scale. Most `text-[14px]` → `text-body-sm`, `text-[10px]` → `text-label-caps`, `text-[16px]` → `text-body-md`, `text-[18px]` → `text-body-lg`.

#### P2-2: No dark mode support
- **Category:** Theming & design system
- **Issue:** No `darkMode:` configuration in `tailwind.config.js`. No `dark:` variants used anywhere. All backgrounds, text colors, and surface colors are hardcoded for light mode only. The backend's client base spans 18+ countries including regions with high dark-mode adoption (US, EU, Singapore), and no enterprise panel should ship without dark mode in 2026.
- **User impact:** Users who prefer dark mode (OS-level setting) get a bright white experience that may cause eye strain during extended use, particularly in the portals where users spend significant time.
- **Fix:** Add `darkMode: 'class'` to tailwind config. Create a dark-theme palette (dark surfaces, inverted text). Add a theme toggle in the Navbar. Use CSS custom properties or Tailwind `dark:` variants for color-aware components.

#### P2-3: Color status badges use Tailwind utility colors, not theme tokens
- **Category:** Theming & design system
- **Location:** `ClientPortal.jsx:6-14` (STATUS_COLORS), `EmployeePortal.jsx` (`bg-green-100 text-green-800`, `bg-amber-100 text-amber-800`), `EventsGrid.jsx:37`, `AwardsGrid.jsx:45`, `DownloadsGrid.jsx:40`
- **Issue:** Status badges use ad-hoc Tailwind color utilities like `bg-green-100 text-green-800`, `bg-red-100 text-red-800`, `bg-amber-100 text-amber-800`. These are not design tokens. If the brand palette changes, these colors remain. They also may not have sufficient contrast ratios against various backgrounds.
- **User impact:** Minor visual inconsistency — green/amber/red badges in portals look differently saturated than the brand teal badges used in other components.
- **Fix:** Define a status-color token map in tailwind config (e.g., `status-success: { bg: '#…', text: '#…' }`) and create reusable `<StatusBadge>` components that reference the tokens.

#### P2-4: No breadcrumb navigation on any page
- **Category:** Usability (Recognition over recall)
- **Location:** All pages
- **Issue:** No page renders breadcrumbs. Users navigating from /services to /services/enterprise-software have no visual indicator of their current depth in the site hierarchy. The only navigation is the top-level navbar and footer.
- **User impact:** Users who navigated 3-4 levels deep into the site (e.g., Portfolio → Case Study → Technical Report) cannot quickly jump back one level without using the browser Back button repeatedly or scrolling to the top navbar.
- **Fix:** Implement a shared `<Breadcrumbs>` component wired to React Router's location. Render it below the hero section of inner pages.

#### P2-5: Icon sizes inconsistent — multiple competing values
- **Category:** Theming & design system
- **Location:** `Navbar.jsx:62` (`text-[18px]`), `JobCard.jsx:13-21` (three `text-[16px]` icons), `BlogCard.jsx:20-24` (`text-[14px]`), `ServiceCard.jsx:7` (`text-[32px]`), `WhyChooseUs.jsx:20` (`text-[28px]`), `GlobalMap.jsx:16` (`text-[200px]`)
- **Issue:** Material Symbols are sized with arbitrary font-size values across components. There is no shared icon-size scale. Icon sizes vary inconsistently even within the same context (e.g., blog card icons are 14px, job card icons are 16px, navbar search icon is 18px).
- **User impact:** Visual inconsistency — icons have different apparent weights and sizes within the same page.
- **Fix:** Define an icon-size scale (e.g., `icon-sm: 16px`, `icon-md: 24px`, `icon-lg: 32px`) in the design token layer and reference it consistently.

#### P2-6: Sitemap XML is hardcoded string, not generated from DB or routes
- **Category:** Maintainability
- **Location:** `backend/app/main.py:156-183`
- **Issue:** The `/sitemap.xml` endpoint returns a static XML string. Adding a new page requires editing this string. It will go out of sync with actual routes, and priority values are subjective.
- **User impact:** None initially, but pages added later may not appear in sitemaps for months until someone remembers to update this string.
- **Fix:** Generate the sitemap dynamically from a registry of known routes, or at minimum extract the URL list into a shared configuration file referenced by both the router and the sitemap.

#### P2-7: No empty states in any list component
- **Category:** Usability (Recognition over recall)
- **Location:** All grid/list components (EventsGrid, BlogGrid, JobListings, etc.)
- **Issue:** When filters return zero results, the grid renders nothing — an empty container with no message, illustration, or hint. The user has no way to know whether the filter is wrong, the data is loading, or the page is broken.
- **User impact:** User applies a filter combination, sees a blank area, and has no guidance. May assume the site is broken and leave.
- **Fix:** Add a conditional empty-state component with a clear message ("No events match your filter"), a reset-filter button, and an icon that communicates "nothing found" rather than "nothing exists."

#### P2-8: No loading states — all data appears synchronously from static files
- **Category:** Usability (Visibility of system status)
- **Location:** All pages that use `useApiResource` pattern (Services, Portfolio) and all static-data pages (Solutions, Products, Events, etc.)
- **Issue:** Pages that use static data (`from '../data/*.js'`) render instantly with no loading skeleton. Pages that use `useApiResource` show a white flash during the API call. Neither pattern provides skeleton/shimmer loading states. The Services and Portfolio pages switch from demo data to API data with no transition.
- **User impact:** Users on slow connections see blank page areas or content that shifts after an unpredictable delay (layout shift). Users with cognitive disabilities may find sudden content replacements disorienting.
- **Fix:** Implement skeleton loading states for every page section. Use `<Skeleton>` components with pulse animation that mirror the content layout.

#### P2-9: Footer social/media links are `<a href="#">` with no real URLs
- **Category:** UX, Completeness
- **Location:** `frontend/src/components/layout/Footer.jsx:33-38`, also "Speak with a Solution Architect" link in FaqAccordion.jsx
- **Issue:** Social media icons and the FAQ CTA link point to `"#"`. These are dead links.
- **User impact:** Users clicking these links are taken to the top of the current page with no feedback or error. Perceived as broken or unfinished.
- **Fix:** Either add real URLs or remove the links entirely. A disabled-looking icon is better than a link that maps to `#`.

#### P2-10: No data deletion/export endpoints for GDPR compliance
- **Category:** Legal & compliance
- **Location:** Backend — no route exists for user data export or deletion
- **Issue:** GDPR Article 15 (right of access) and Article 17 (right to erasure) require controllers to provide data export and deletion on request. Neither endpoint exists in the backend. The Privacy Policy promises these rights ("You may have rights including … deletion of your data") but the API cannot fulfill the promise.
- **User impact:** EU users exercising their legal rights will receive a non-functional response, exposing the company to regulatory complaints.
- **Fix:** Add `GET /api/v1/users/me/export` (returns all user data as JSON) and `DELETE /api/v1/users/me` (anonymizes or deletes user profile, invoices anonymized, support tickets retained with user ID stripped). Audit trail entries must be retained but disassociated from the user identity.

### P3 — Polish

#### P3-1: "Live Operations" panel in Hero has no business purpose
- **Category:** Anti-patterns, Aesthetic and minimalist design
- **Location:** `frontend/src/components/home/Hero.jsx:38-64`
- **Issue:** The "Live Operations" glass panel on the desktop hero contains three animated progress bars with no labels, a "Live" badge with pulsing animation, and the heading "Live Operations" — none of which represents real data or operations. It occupies ~50% of the hero's horizontal space on desktop and 0 lines of JSX with no backend connection.
- **User impact:** Color, motion, and the word "Live" imply real-time data. Users who later discover the numbers are fabricated lose trust in the brand. Developer impact: 415px of dead code that must be maintained.
- **Fix:** Remove the panel entirely. Replace with a genuine value proposition (client logos, testimonial, or an interactive product demo) or leave the hero as single-column typography with the CTA.

#### P3-2: `img` elements have no `alt` attributes
- **Category:** Accessibility
- **Location:** No `<img>` tags found in the source codebase — all images are referenced via CSS or inline SVG/icon fonts. This is actually correct for this project.
- **Issue:** No actual findings — the icon font approach (`<Icon name="...">`) and CSS backgrounds mean no image `alt` text is needed. Documenting this as a non-issue to confirm it was checked.

#### P3-3: Gradient text utility defined but unused
- **Category:** Design system dead code
- **Location:** `frontend/src/index.css:32-37`
- **Issue:** `.gradient-text` class is defined but never referenced by any component. It is dead CSS, inflating the stylesheet by ~8 lines.
- **User impact:** None.
- **Fix:** Remove the dead utility class.

#### P3-4: `hover-lift` utility defined but unused
- **Category:** Dead code
- **Location:** `frontend/src/index.css:25-30`
- **Issue:** `.hover-lift` class is defined but never referenced in any JSX component. Components implement their own hover transforms inline (e.g., `hover:-translate-y-1`).
- **User impact:** None.
- **Fix:** Remove the dead utility class or replace all hover transforms with it.

#### P3-5: No 404 page for portal routes
- **Category:** UX, Recognition
- **Location:** `frontend/src/App.jsx`
- **Issue:** The catch-all `path="*"` redirects to `<NotFound />`. This is correct for public pages, but portal routes (`/client`, `/employee`, `/partner`, `/admin`) that are accessed without authentication redirect to `/` via `<Navigate to="/">`, which briefly flashes the homepage before the user realizes what happened. No "please sign in" error is shown on the portal route itself.
- **User impact:** Authenticated user clicks a bookmark to `/admin`, gets a flash redirect to `/` with no explanation. Unauthenticated user gets silently redirected without feedback.
- **Fix:** Render a "please sign in" page at the portal route rather than redirecting to `/`. Show a friendly message ("You need to sign in to access the Admin Panel") with a sign-in button that opens the login modal.

---

## Systemic Patterns

### Pattern 1: Token layer consistently breached (28 files, 40+ instances)
Components use `text-[Npx]`, `text-[10px]`, `bg-green-100`, `bg-amber-100` etc. instead of the defined design tokens. This is the single most widespread systemic issue — it indicates that developers are not referencing the tailwind config and instead typing arbitrary values. Every new page added this pattern.

**Root cause:** No lint rule enforces token usage. No component library enforces type/color/spacing tokens at the component level. No code review catches token drift.

**Fix:** Add an ESLint rule (`eslint-plugin-tailwindcss`) that flags arbitrary values. Create shared `<StatusBadge>`, `<Icon>` with constrained sizes, and `<Card>` components that enforce tokens.

### Pattern 2: Touch targets consistently under 44×44px across nav, footer, portal controls
The WCAG 2.5.8 target minimum of 24×24px applies to the current version, but Apple's HIG and Material Design both recommend 44×44px. Several components fall below 24px:
- Footer legal links (Footer.jsx:108-118) — `text-[10px]` uppercase with no extra padding
- Blog/Badge tags (BlogCard.jsx:31) — `text-[10px]` with `py-1 px-3` = ~20×24px
- Event type filter buttons (EventsGrid.jsx:20-32) — `px-4 py-2` = ~32px tap target

### Pattern 3: No dynamic data flow from backend to any frontend page
Every page rendering list data (events, jobs, resources, downloads, solutions, products, technologies, industries, case studies, blog posts, awards, gallery) imports from a static JS data file. The `useApiResource` hook exists and is used by only 2 of 26 pages (Services and Portfolio). The `src/api/` folder has modules for clients, employees, and admin, but none of the portal pages actually call the API — they all use demo data from `data/portal.js`.

**Root cause:** Data files were created as "demo" but no pass was made to wire them to the real API after the files were written.

### Pattern 4: Recurring hardcoded hex in inline styles
`Hero.jsx:12` has inline `style={{ background: 'radial-gradient(...) #3d6268, #191c1e' }}`. `index.css` has `.gradient-text { background: linear-gradient(135deg, #3d6268 0%, #a7cdd5 100%) }` and `.process-line { linear-gradient(90deg, #3d6268 0%, #a7cdd5 100%) }`. These duplicate the brand token values outside the token system — if the brand color changes, these are missed.

---

## Strengths

1. **Backend architecture is exceptional.** 42 routers with consistent patterns (`CRUDBase` + `build_crud_router`), async SQLAlchemy throughout, RBAC via `require_roles`, rate limiting via slowapi, audit logging middleware, structured error responses, and file upload validation with both MIME and extension whitelists. This is production-grade and would survive a security review with minor changes.

2. **Design token system is well-conceived.** The `tailwind.config.js` defines a coherent brand palette (engineering teal `#3D6268` / `#2C3E41`), a complete Material-3-inspired surface tonal scale (`surface-container`, `surface-high`, `outline`), a paired type system (Plus Jakarta Sans for display, Inter for body, Montserrat for stats, JetBrains Mono for code), and a spacing scale grounded in 8px intervals. The token structure is maintainable and extensible.

3. **Security headers and CSP are correctly configured** in both the frontend nginx config and the backend SecurityHeadersMiddleware. CSP restricts script sources, frame-src and object-src are set to `'none'`, HSTS is enabled with `includeSubDomains`, and the Permissions-Policy disables camera/microphone/geolocation. These headers would score an A on securityheaders.com.

4. **SEO foundation is strong.** The sitemap XML endpoint exists (though statically maintained), each page sets a unique `<title>` via `useDocumentTitle`, and the route structure follows a logical hierarchy (`/solutions`, `/industries`, `/case-studies`, `/blog/:slug` pattern). The navbar and footer use semantic `<nav>` and `<footer>` elements.

5. **Responsive nav with mobile hamburger menu** is correctly implemented — the navbar detects scroll position, toggles background opacity, and provides a full-screen mobile menu that shows all navigation links plus auth controls. The breakpoint (`md:`) is correctly chosen for the nav tablet transition.

6. **Component composition follows good patterns.** The split between `pages/`, `components/<area>/`, `data/`, `api/`, and `hooks/` is clean and follows React conventions. Shared UI primitives (`Button`, `Badge`, `Icon`, `SectionHeading`, `Reveal`) are genuinely reusable across all pages. The portaled pages use the same primitives consistently.

---

## Recommended Priority Order

1. **Implement cookie consent banner** — Without this, the site is non-compliant on day one of launch. Legal liability is the highest-priority risk.
2. **Wire backend stats or remove fabricated metrics** — Misleading advertising risk is P0. Either build `GET /stats` or remove the numbers.
3. **Add focus indicators and fix modal accessibility** — Two P1 WCAG A failures that affect every keyboard user. Quick wins with high impact.
4. **Add `aria-describedby` to form errors** — P1 WCAG AA failure that prevents screen reader users from completing forms. A few lines per field.
5. **Remove "Live Operations" fake panel** — Eliminates a misleading-advertising vector and 50% of hero JSX. 5-minute fix.
6. **Implement focus trapping on LoginModal** — P1 WCAG A failure. One focused component change.
7. **Add aria attributes to accordions** — P1 WCAG AA failure across three components. Well-documented pattern, 15 minutes.
8. **Token-layer cleanup: replace `text-[Npx]` across 40+ instances** — P2 systemic fix that restores design integrity. Use project-wide find-and-replace.
9. **Wire portal pages to real API endpoints** — All 4 portals use demo data from `data/portal.js`. The backend endpoints exist. Replace `import` with `useApiResource` calls.
10. **Add breadcrumbs** — P2 usability improvement for deep navigation. Implement a shared `<Breadcrumbs>` component.
