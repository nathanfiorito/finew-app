# Design System Integration — Decomposition Spec

**Date:** 2026-04-30
**Status:** Draft — pending user review
**Scope:** Decompose the integration of the Claude Design output (committed under `docs/design-system-reference/`) into independent waves, each producing working, testable software on its own. This document does **not** define implementation tasks; each wave will get its own spec + plan when its turn comes.

## 0. Decisions resolved during review

The user resolved the cross-cutting decisions before any wave plan is written:

| Decision                                                | Choice                                                                |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| Token prefix (`--finew-*` vs unprefixed)                | **Drop the prefix.** Tokens become `--bg`, `--accent`, etc.           |
| Style strategy for primitives (Wave 2 — Options A/B/C)  | **Option C** — per-primitive CSS files inside `@layer components`.    |
| Radix UI adoption (Waves 4 and 5)                       | **Adopt Radix** for non-trivial interactions.                         |
| Where `docs/design-system-reference/` lives             | **Vendored** under `docs/design-system-reference/` (already done).    |
| `Finew v2.0.zip` archive                                | **Gitignored** (already done).                                        |

The "Open decisions" subsections in each wave below now list only the decisions still open for that wave's own spec.

## 1. Why decompose

The Claude Design output is substantial:

- **`docs/design-system-reference/colors_and_type.css`** — full token set (light + dark + density override), ready to migrate.
- **`docs/design-system-reference/ui_kits/finew-pwa/kit.css`** — vanilla CSS classes (`fw-*`) covering buttons, cards, KPI, tabs, table, transaction rows, sidebar, mobile shell, sheets, forms.
- **`docs/design-system-reference/ui_kits/finew-pwa/Components.jsx`** — React 18 vanilla (no TypeScript) using `fw-*` classes, covering Money, Sparkline, Button, CategoryPill, KPIStat, Card, TransactionRow, plus inline Lucide icons.
- **HTML previews** (`docs/design-system-reference/preview/*.html`) — token demos useful as Storybook seeds later.
- **Full PWA mockup** — high-fidelity reference, not production code.

Two facts make a single mega-plan unworkable:

1. The output covers only ~7 of the briefing's ~25 primitives. Half the work is *creation*, not *port*.
2. The four kinds of work involved — token migration, CSS-vs-Tailwind reconciliation, React 18 → React 19 + TS + FSD port, primitive creation — have different rhythms, dependencies, and review criteria.

Splitting into waves lets each one ship independently, gives reviewers a manageable diff, and surfaces architectural decisions one at a time.

## 2. Wave map

```
                ┌──────────────────┐
                │  Wave 1: Founda- │
                │  tions (tokens,  │
                │  fonts, theme,   │
                │  density, base)  │
                └────────┬─────────┘
                         │
        ┌────────────────┼────────────────┬─────────────┐
        │                │                │             │
        ▼                ▼                ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌─────────────┐ ┌────────────┐
│ Wave 2:      │ │ Wave 3:      │ │ Wave 4:     │ │ Wave 5:    │
│ Basic        │ │ Finance-     │ │ Form        │ │ Overlay /  │
│ primitives   │ │ aware        │ │ primitives  │ │ composi-   │
│ (port)       │ │ primitives   │ │ (build)     │ │ tion (build│
│              │ │ (port)       │ │             │ │ — Radix?)  │
└──────┬───────┘ └──────┬───────┘ └─────────────┘ └────────────┘
       │                │
       └────────┬───────┘
                ▼
        ┌──────────────┐
        │ Wave 6:      │
        │ Table & data │
        │ surfaces     │
        └──────────────┘
```

Waves 2–5 can run in parallel after Wave 1 lands. Wave 6 reuses primitives from 2–4 (Pagination, Button, Skeleton).

## 3. Wave 1 — Foundations

**Goal:** every later wave can `import` from `src/shared/ui/` and have tokens, fonts, icons, theme switching, and density switching already wired.

**Deliverables:**

- **Tokens.** Replace `src/shared/ui/styles/tokens.css` (currently ~50 lines of placeholders) with the full token set from `docs/design-system-reference/colors_and_type.css` — surfaces, fg, borders, accent, semantic, 8 series, typography scale, spacing scale, radii, shadows, motion, layout. Both light (canonical, `:root` and `[data-theme="light"]`) and dark (`[data-theme="dark"]`) themes. Density override on `[data-density="compact"]`.
- **`@theme` re-export.** Keep the existing skeleton pattern: raw unprefixed custom properties on `:root` (per §0), plus a Tailwind v4 `@theme` block that re-exports the subset we want as utilities (`bg-*`, `text-*`, `rounded-*`, `gap-*`, etc.).
- **Semantic type classes.** Port `.t-display`, `.t-h1`…`.t-h4`, `.t-body`, `.t-body-strong`, `.t-body-sm`, `.t-caption`, `.t-micro`, `.t-money`, `.t-money-display` into `src/shared/ui/styles/typography.css` (new file) and import from `globals.css`. These remain plain CSS classes (not Tailwind utilities) because they are semantic, not atomic.
- **Fonts (self-hosted).** Install Source Serif 4 (variable, OFL) and Inter (variable, OFL) under `public/fonts/`. Define `@font-face` rules in `src/shared/ui/styles/fonts.css` using `font-display: swap` and a single variable axis per family. **Reject** the Google Fonts CDN `@import` from the output — it breaks offline PWA and adds a third-party request.
- **Icons.** Install `lucide-react`. Add a thin `<Icon>` re-export in `src/shared/ui/primitives/Icon/` that fixes `strokeWidth={1.75}` and exports the curated set from the kit (home, list, pie, card, target, search, bell, plus, menu, user, arrowUp, arrowDown, chevR/L/D, close, filter, calendar, cog, wallet). New icons added by reference, not by drawing.
- **Theme provider.** `src/app/providers/ThemeProvider.tsx` already exists per the skeleton spec — extend it to (a) read `prefers-color-scheme` on first load, (b) honor a `localStorage` user override, (c) write `[data-theme]` on `<html>`, (d) expose a `useTheme()` hook returning `{ theme, setTheme, systemTheme }`.
- **Density provider.** New: `src/app/providers/DensityProvider.tsx`. Same shape as ThemeProvider, but writes `[data-density]` on `<html>` (default `comfortable`) with the option to scope `[data-density="compact"]` to subtrees later via a wrapper component. Persisted to `localStorage`.
- **Tests.** Architectural test (already present) keeps passing. Add a token contract test: `src/shared/ui/styles/tokens.test.ts` parses `tokens.css` and asserts that the agreed list of custom properties is declared in both `:root` and `[data-theme="dark"]`. Add a smoke test that mounts `<App>` with each theme/density combination and confirms no console errors.

**Out of scope for Wave 1:** any `fw-*` styles, any primitive React component beyond `<Icon>`, Storybook, charts library.

**Open decisions to settle in the Wave 1 spec:**

1. Keep semantic `.t-*` classes as plain CSS, or migrate to Tailwind `@layer components`? (Recommendation: plain CSS in `typography.css`. Easier to reason about.)
2. Where do the `@font-face` and the semantic typography imports live in the cascade order? Order matters for FOUT/FOIT.
3. Density scoping: app-wide via `<html>` only, or also a `<DensityScope density="compact">` wrapper component for cards/tables that locally override? (Recommendation: ship the global toggle now; add the wrapper in Wave 2 if the first ported card needs it.)

## 4. Wave 2 — Basic primitives (port from kit)

**Goal:** ship presentational primitives that already exist in `Components.jsx` / `kit.css`, ported to TS + React 19 + FSD.

**In scope:** Button, Badge, Card, CategoryPill, Avatar, Skeleton, EmptyState, Breadcrumb, Pagination.

Of these, **Button, Card, CategoryPill, Avatar** exist in the kit. **Badge, Skeleton, EmptyState, Breadcrumb, Pagination** are referenced but unbuilt — they need to be created in this wave following the kit's vocabulary.

**Style strategy (resolved in §0):** **Option C — per-primitive CSS files inside `@layer components`.** Each primitive gets `Button.tsx` + `Button.css`, where `Button.css` wraps its rules in `@layer components { .fw-btn { … } }`. Co-located with the component for grep-ability; layered so Tailwind utilities can override or compose without specificity wars; round-trips with the Claude Design kit because the `.fw-*` selectors are preserved verbatim.

**FSD compliance:** every primitive is presentational (no API, no stores, no domain). Located at `src/shared/ui/primitives/<Name>/`. Exports `<Name>` and `<Name>Props` via `index.ts`. Goes in the `src/shared/ui/primitives/index.ts` barrel.

**Tests per primitive:** at minimum a smoke render in both themes and both densities, and a test for any non-trivial branching prop (e.g., `Button variant=` matrix).

**Open decisions for Wave 2:**

1. Class-name convention: keep `fw-*` prefix or drop? (Recommendation: keep — it's the visual contract, easy to grep, and aligns with the Claude Design skill output.)
2. Forwarded refs and `asChild` (Radix-style) on Button — yes from day one or YAGNI? (Recommendation: forward refs always; defer `asChild` until first need.)

## 5. Wave 3 — Finance-aware primitives (port)

**Goal:** ship the finance-domain primitives that justify having a custom DS at all.

**In scope:** Money, Sparkline, KPIStat. (DateRangePicker and CategoryPill move to Waves 4 and 2 respectively — Pill is just a styled chip; DateRangePicker is a form input.)

All three exist in the kit with reasonable fidelity. Port concerns:

- **Money.** The kit's `formatMoney` uses `Intl.NumberFormat` correctly but is tied to BRL/USD only. Generalize to accept any ISO currency code; keep BRL/USD as defaults. Re-emit U+2212 minus and U+00A0 NBSP between currency symbol and value. Add `<Money currency="BRL" amount={1234.5} />` plus computed properties for screen readers (`aria-label`).
- **Sparkline.** Hand-rolled SVG; keep it. Add prop for `'gain' | 'loss' | 'neutral'` color mode that maps to tokens. Add a 1-bar fallback when `values.length === 1`.
- **KPIStat.** Composes Money + Sparkline + delta arrow. Add A11y: the delta should be announced as "high two point four percent versus previous period", not just `+2.4%`.

Wave 3 is the smallest wave by line count and the highest by leverage — it's the part of the DS that no off-the-shelf library gives you.

**Open decisions for Wave 3:**

1. Locale source of truth: prop, context, or `navigator.language`? (Recommendation: context that defaults to pt-BR, overridable via prop. App-level switch lives in a future i18n wave.)
2. NaN/null/undefined handling on Money: render em-dash placeholder, or throw in development? (Recommendation: em-dash in production, dev-only warning.)

## 6. Wave 4 — Form primitives (build)

**Goal:** ship Input, Select, Checkbox, Radio, Switch, DateRangePicker.

**None exist in the kit** beyond a styled `.fw-input` and `.fw-input-money`. This wave is real construction.

**The pivotal decision (Wave 4 spec must settle):** **Radix UI Primitives or custom?**

- Radix gives us focus trapping, keyboard navigation, ARIA, controlled/uncontrolled state machines, and a portal system — all of which are not in the kit and cost weeks to build correctly.
- Restyling Radix with our tokens is mechanical (Radix is unstyled by design).
- The cost is a runtime dependency (`@radix-ui/react-*`, ~10kB per primitive after tree-shake) and a slightly different mental model.

**Resolved in §0: adopt Radix UI** for every primitive that has a non-trivial interaction model (Select, Checkbox, Radio, Switch). For Input and DateRangePicker:

- Input is a styled `<input>` — no Radix needed.
- DateRangePicker: use **react-day-picker** (pt-BR locale built in, headless, ~4kB) as the calendar; wrap with our trigger + popover. Don't build a calendar.

**Open decisions for Wave 4:**

1. Form integration: react-hook-form, formik, or no form library? (Recommendation: react-hook-form, but the primitive itself should be agnostic and accept the `register()` spread.)
2. Validation message slot: built into each primitive, or rendered by the form layer? (Recommendation: each primitive accepts `error?: string` and renders it; the form layer feeds it.)

## 7. Wave 5 — Overlay & composition primitives (build)

**Goal:** ship Modal, BottomSheet, Toast, Tabs, Accordion, Tooltip, Popover, Drawer, Stepper.

**Mostly net-new.** The kit has a fragment of BottomSheet (`.fw-sheet*` classes); everything else is a sketch or absent.

**This wave depends on the Radix decision from Wave 4.** If Wave 4 adopts Radix, this wave should too — Radix has excellent primitives for every overlay listed (`Dialog`, `Tooltip`, `Popover`, `Tabs`, `Accordion`, `Toast`).

- **Modal:** `@radix-ui/react-dialog`, restyled. Sizes 480 / 640 / 800 per the brief.
- **BottomSheet:** Radix Dialog with mobile-only restyling, OR `vaul` (a drawer/sheet library built specifically for this). `vaul` handles drag-to-dismiss properly; Radix doesn't. Recommendation: `vaul`.
- **Toast:** `sonner` is the obvious React choice (built by the Vercel team, headless, customizable). Recommendation: adopt.
- **Tabs, Accordion, Tooltip, Popover:** Radix.
- **Drawer:** `vaul` again, side variant.
- **Stepper:** custom — no good headless lib. Build on top of our Tabs.

**Open decisions for Wave 5:**

1. `vaul` vs Radix Dialog for BottomSheet.
2. `sonner` vs Radix Toast.
3. Stepper API: linear-only, or freely-navigable? (Recommendation: both, controlled by prop.)

## 8. Wave 6 — Table and data surfaces

**Goal:** ship the data Table primitive that the kit's `.fw-table` styles already define.

**Why last:** Table benefits from Pagination (Wave 2), Skeleton (Wave 2), Button (Wave 2), Money/KPIStat (Wave 3). Building it earlier means stub-importing primitives that don't exist.

**Scope:** sortable columns, sticky header, row hover, density-aware row padding (already in the kit's CSS), per-column alignment (`amt` right-align), per-column number formatting (Money integration), empty state slot (EmptyState primitive), loading state slot (Skeleton primitive). **No virtualization in v1** — defer until a real Transactions screen needs it.

**Open decisions for Wave 6:**

1. Headless table lib (`@tanstack/react-table`) or custom? (Recommendation: TanStack Table v8. The kit's Table is presentational; TanStack Table is logic-only. They compose perfectly.)
2. Pagination: client-side or server-aware? (Recommendation: API supports both via `pagination` prop; the primitive doesn't fetch.)

## 9. What about the full UI kit (`ui_kits/finew-pwa/`)?

The mockup screens (Overview, Transactions, Budgets, Cards, Goals) are **reference material, not source code**. They live in `docs/design-system-reference/ui_kits/finew-pwa/` and inform the page-level work that comes after the DS is in place — specifically the `pages/` and `widgets/` layers, which are out of scope for the DS itself.

When we get to the Transactions page (a future spec, post-DS), the kit's `Screens.jsx` becomes a reference for layout, copy, and density behavior — but the page will compose Wave 2/3/6 primitives, not copy the kit's JSX directly.

## 10. Open questions that still affect every wave

- **Storybook (or Ladle / Histoire):** explicit non-goal of every wave 1–6, but worth a future spec once Wave 2 ships ≥3 primitives.

## 11. Risk register

- **Token rename churn.** Dropping the `--finew-*` prefix in Wave 1 cascades into every later wave. Doing it now is cheap; doing it after Wave 3 is painful. Decide once.
- **Claude Design parity drift.** The longer we go without re-running Claude Design, the more our primitives diverge from its kit. Mitigate: when adding a new primitive, also add a card to `docs/design-system-reference/preview/` so the next Claude Design run sees it.
- **Radix lock-in.** Adopting Radix in Wave 4 means accepting it forever (or paying to remove). The decision is reasonable but should be stated explicitly in the Wave 4 spec, not absorbed silently.
- **Dark mode regressions.** The kit's dark token values are hand-tuned; any token rename or Tailwind `@theme` translation could silently break a contrast pair. Token contract test in Wave 1 must include both themes.
- **Font licensing in production.** Source Serif 4 and Inter are OFL — fine. If marketing later wants a third face, this constraint must be remembered.

## 12. Acceptance criteria for this spec

This document is "done" when:

1. The user has reviewed the wave map and decomposition rationale and approved.
2. Each wave has a one-paragraph goal, an explicit deliverable list, and an explicit list of decisions deferred to its own spec.
3. The cross-wave decisions (token prefix, style strategy, Radix adoption) are flagged and assigned to the wave that owns them.

This spec produces **no code**. The next step after approval is to write the Wave 1 plan.

## 13. Out of scope

- Implementation of any wave.
- Storybook / docs site.
- The `pages/`, `widgets/`, `features/` layers — those come after the DS.
- A logo / wordmark beyond the typeset `Finew` placeholder.
- Marketing site or landing page.
