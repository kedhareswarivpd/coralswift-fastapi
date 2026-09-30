# UI/UX Quality Report — CoralSwift

Generated: Aug 15, 2026 · Frontend: React 18 + Vite 5 + Tailwind 3 · Scope: `frontend/src`

---

## 1. Executive Summary

| Area | Verdict |
|---|---|
| Overall UI quality | **Good** — cohesive design system, consistent component library, real polish |
| Accessibility | **Fair** — solid foundations, several inconsistent gaps (motion, modals, focus) |
| Responsiveness | **Good** — mobile nav, fluid spacing scale, responsive type |
| Consistency | **Good** — token-driven; a few dead/invalid classes and dark-mode stragglers |
| Quality gates | Build passes, 92/92 tests pass, lint: **0 errors / 1556 warnings** |

**Top 5 things to fix (priority order)**
1. Add `prefers-reduced-motion` support — no animation is currently disabled for motion-sensitive users (WCAG 2.3.3).
2. Standardize modal/dialog behavior — trap focus + Escape + focus return on **all** dialogs, not just CookieConsent/GalleryGrid.
3. Fix `#FD5521` warning-orange used as KPI text on white (`AdminPanel.jsx:39`) — contrast ~3.0:1, fails WCAG AA.
4. Convert icon-only buttons from `title` to `aria-label` (`ContentManager.jsx:376,379`, gallery controls).
5. Strip invalid `font-label-caps` classes (not a real Tailwind utility) and run `eslint --fix` to clear ~1,306 auto-fixable warnings.

---

## 2. Design System & Visual Consistency

**What's working well**
- Single token source in `tailwind.config.js`: brand scale (`#2563EB` primary, `#0A2540` navy), Material-3-style `surface`/`ink`/`outline` scales, status palette, shadows, radii, and a full `dark:` palette.
- Deliberate typographic scale — `display-lg` → `body-sm` + `label-caps`, with mobile variants (`display-lg-mobile`) and correct line-heights/tracking.
- Four font families with clear roles: Plus Jakarta Sans (display), Inter (body), Montserrat (stat), JetBrains Mono (code).
- Reusable spacing/margin rhythm (`stack-sm…xl`, `margin-mobile/desktop`, `section-padding`, `max-w-container`).
- Dark mode via `class` strategy; most components carry `dark:` variants.

**Issues**
- **Invalid utility classes** — `font-label-caps` is used in ~30+ spots (e.g. `Navbar.jsx`, `CookieConsent.jsx:63`, `RowAction.jsx:9`) but `fontFamily` only defines `display/body/stat/mono`, so the class is dead. It coexists with `text-label-caps` (valid, includes `fontWeight:600`), so visuals are fine — remove the dead class.
- **Dark-mode stragglers** — `CtaBanner.jsx` uses `bg-white text-brand-dark` with no `dark:` variant; spot-check all sections for surfaces that stay light in dark mode.
- **Orphan CSS vars** — `index.css` still defines `--chart-1…5`, `--radius`, `--sidebar-*` etc. after `@theme inline` was removed; chart utilities are no longer generated (no `*-chart-*` classes used), so these vars are dead weight.

---

## 3. Component Library & Reusability

**Strengths**
- Shared primitives: `Button` (variants/sizes/`as` prop → button/`a`/`Link`), `Badge`, `StatusBadge`, `EmptyState`, `LoadingSpinner`, `Reveal`, `Breadcrumbs`, `Icon`, `RowAction`, `SectionHeading`.
- Centralized form styling (`formClasses.js` → `FORM_INPUT_CLASS`).
- `Button.jsx` handles the primary CTA pattern cleanly with hover/active feedback.
- Per-domain components (Hero, AboutHero, AwardsGrid, ServicesGrid, etc.) follow one naming/structure convention.

**Issues**
- Modals/overlays are implemented three different ways (see §5).
- Icon-only controls inconsistently labeled: `title` (ContentManager edit/delete) vs `aria-label` (EmployeePortal download, ApplyForm close).

---

## 4. Responsive & Layout

**Strengths**
- Navbar collapses to a hamburger menu below `md`; mobile menu present with link-closes-on-click.
- Spacing/padding uses `margin-mobile` / `margin-desktop`; grids use responsive columns (`sm:grid-cols-2` in forms, etc.).
- Portal routes (`/client`, `/employee`, `/admin`, …) render as standalone shells — no navbar/breadcrumbs/padding (`Layout.jsx`), giving portals full-bleed admin UIs.
- `body { overflow-x: hidden }` guards against horizontal scroll.

**Issues**
- Mobile menu is not focus-trapped, has no `aria-expanded`, no Escape-to-close.
- Header height animates (h-16/h-20) and `main` uses a fixed `pt-20`; verify no overlap/blank space at the 20–80px scroll threshold across breakpoints.

---

## 5. Accessibility (WCAG 2.x)

### Good practices already in place
- Global `:focus-visible` outline (`index.css`) with `:focus:not(:focus-visible)` cleanup.
- `aria-expanded` + `aria-controls` + `role="region"` + `aria-labelledby` on accordions (`FaqSection.jsx`, `FaqAccordion.jsx`).
- `ContactForm.jsx` — real `<label>`s + `aria-describedby` wired to per-field errors.
- `Breadcrumbs.jsx` — `nav` landmark with `BreadcrumbList` JSON-LD schema.
- Decorative images use `alt=""`; informative images have meaningful alt.
- `useFocusTrap` hook + Escape handling in `GalleryGrid` lightbox and `CookieConsent` settings dialog.

### Gaps (by severity)

| Severity | Issue | Where |
|---|---|---|
| **High** | No `prefers-reduced-motion` anywhere — reveal, float, hero, shimmer, pulse all run unconditionally | `index.css`, `Reveal.jsx`, all Hero components |
| **Medium** | Job-apply modal: `role="dialog"` + `aria-modal` but **no focus trap, no Escape, no `aria-labelledby`** | `ApplyForm.jsx:50-62` |
| **Medium** | Event-registration overlay is a plain `div` — not announced as a dialog, no trap/Escape/label | `EventsGrid.jsx:32-49` |
| **Medium** | Icon-only buttons rely on `title` instead of `aria-label` | `ContentManager.jsx:376,379` |
| **Medium** | Mobile hamburger lacks `aria-expanded`, no trap/Escape | `Navbar.jsx:101-107` |
| **Low** | Cookie banner is a `region` without a live/polite announcement; links to a policy page are absent | `CookieConsent.jsx` |
| **Low** | Some `<button>` elements with only icons in galleries lack visible + screen-reader labels | `GalleryGrid.jsx:117` |

---

## 6. Color & Contrast

| Pairing | Ratio (approx.) | Verdict |
|---|---|---|
| `#FD5521` (warning) text on white — KPI "Open Tasks" | ~3.0:1 | **FAIL** AA for small text (needs ≥4.5:1) |
| `#2563EB` (brand) text/buttons on white | ~4.6:1 | Pass AA (borderline; OK for bold/large) |
| `#334155` (ink-muted) on white | ~8:1 | Pass |
| `#00D4FF` (accent-cyan) on `#0A2540` | >10:1 | Pass |
| Status badges (success/warning/error/info) | bg/text pairs in config are AA-safe | Pass |

**Note:** `bg-warning`/`text-warning` is only used once; if it must stay, darken it (e.g. `#C2410C`) or use a badge (status colors) instead of body text.

---

## 7. Motion & Interaction Feedback

**Strengths**
- Staged hero entrance (`.animate-hero-1..4`), scroll-reveal variants (up/left/right/zoom), float orbs, shimmer load bars, `active:scale-95` press feedback.
- Count-up stat animation (`StatsBar.jsx`).
- Feedback states: `EmptyState`, `LoadingSpinner`, disabled submit buttons, inline success/error in `ContactForm`.

**Issues**
- No reduced-motion fallback (High, see §5).
- `Reveal` starts elements at `opacity: 0` — if JS fails or the observer never fires, content stays invisible. Add a no-JS/reduced-motion fallback that forces `reveal-visible`.

---

## 8. Performance

- Vite code-splitting works well: heavy libs (`jspdf` 390 KB, `html2canvas` 201 KB) are isolated in lazy chunks, not the main bundle.
- Main entry `index-BCIqCrx_.js` ≈ 256 KB (gzip 69 KB); `About` page 124 KB (gzip 43 KB) — acceptable.
- Hero uses a background video + heavy gradients; ensure `preload="metadata"` / poster and consider lazy-loading below-the-fold imagery.
- Scroll-reveal + float animations run continuously — a `prefers-reduced-motion` guard would also save battery.

---

## 9. Quality Gates (measured)

| Gate | Result |
|---|---|
| `npm run build` | ✅ Pass (5.9 s) |
| `npm test` | ✅ 92/92 tests, 9 files |
| `npm run lint` | ⚠️ 0 errors, **1556 warnings** (~1,306 auto-fixable) |
| Dominant warnings | `tailwindcss/classnames-order` · `tailwindcss/no-custom-classname` (`font-label-caps`) |
| Test hygiene | `act(...)` warnings in `ContentManager.test.jsx` |

---

## 10. Prioritized Recommendations

**High (do first)**
1. Add a global `prefers-reduced-motion` block in `index.css` disabling reveal/float/hero/shimmer/pulse animations, and force `reveal-visible` for reduced-motion users.
2. Extract one `Modal`/`Dialog` component (focus trap + Escape + `aria-labelledby` + focus return) and use it in ApplyForm, EventsGrid, GalleryGrid, CookieConsent.
3. Fix warning-orange KPI contrast.

**Medium**
4. Replace `title`-only icon buttons with `aria-label`.
5. Add `aria-expanded` + Escape handling to the mobile nav.
6. Run `eslint --fix`, remove invalid `font-label-caps`, prune dead CSS vars (`--chart-*`, `--radius`, sidebar tokens if unused).
7. Audit sections missing `dark:` variants (e.g. `CtaBanner`).

**Low**
8. Add `Reveal` no-JS fallback so content is never hidden.
9. Add `aria-live="polite"` for cookie banner and form status messages.
10. Add E2E smoke checks (Playwright) for: mobile nav, one modal open/close/tab-cycle, dark-mode toggle persistence.
