# Design System Briefing — Finew

**Date:** 2026-04-30
**Status:** Approved (pending user review of this document)
**Scope:** Capture the brand and design-system decisions that will be pasted into Claude Design to generate the first wave of Finew's design system. This document is the *briefing*, not the implementation plan. The implementation plan for wiring the generated DS into `src/shared/ui/` will be a separate spec/plan.

## 1. Why this document exists

The skeleton wave (`2026-04-29-skeleton-architecture-design.md`) intentionally left `src/shared/ui/styles/tokens.css` with placeholder token names and `src/shared/ui/primitives/` empty, so the design system could be plugged in cleanly in a later wave. We will use **Claude Design** to generate that first wave. Claude Design takes two free-form fields — a company blurb and a "notes" field — and amplifies whatever is in them. This spec fixes the answers to those fields so the generation is reproducible and the decisions are reviewable.

## 2. Field 1 — Company name and blurb

> **Finew** — personal-finance management PWA for serious self-directed planners. Mobile-first with full desktop parity (collapsible sidebar on desktop, bottom-tab + secondary drawer on mobile). Data-dense by default, with a `compact` ↔ `comfortable` density toggle so the same surfaces serve both spreadsheet-minded planners and casual users who just want to see where the money went. Canonical language is Brazilian Portuguese (BRL, parcelas, faturas de cartão); English is a fully supported second locale.

## 3. Field 2 — Other notes

> **Aesthetic:** editorial/sophisticated — "premium financial magazine" feel. Dense in content, calm in chrome. Generous whitespace despite high information density. Think Stripe + Financial Times + Notion Calendar, never Bloomberg-terminal or retail-bank.
>
> **Typography:** open-source serif + sans pairing. Serif for headings, large monetary values, and editorial moments (suggested: Source Serif 4 or Fraunces). Sans-serif for UI and body (suggested: Inter or Geist). Tabular lining figures in tables and KPIs; old-style figures allowed in serif headings. No display/decorative fonts.
>
> **Color — light is canonical, dark is a first-class courtesy:**
>
> - Surfaces: warm neutrals — off-white slightly beige background, graphite (not pure black) for text, warm grays for layers.
> - Primary accent: **moss green** (~`#3F5E4A`), used for CTAs, links, focus rings, and the primary chart series.
> - Semantic gain/loss: **moss green / bordeaux** (not classic green/red). Always paired with a `+`/`−` sign and arrow so color is reinforcement, not the sole signal.
> - Series palette for multi-category charts: curated **categorical-editorial** set of ~8 hues, all desaturated to coexist (moss, teal-petrol, bordeaux, mustard, terracotta, dusty lavender, slate-blue, olive).
>
> **Form language:** medium radii (8–12px) or square; hairline 1px borders in translucent gray; near-imperceptible shadows; depth comes from background layering, not elevation effects.
>
> **Iconography:** Lucide or Phosphor regular (1.5–2px outline, slightly rounded corners). Open-source, MIT-compatible.
>
> **Motion:** contained — 150–200ms transitions with standard easing, focused on state feedback. No spring physics, no page-transition theatrics. Respect `prefers-reduced-motion`.
>
> **Density:** ship every primitive in two density variants — `compact` (planner-friendly, tight table rows, smaller padding) and `comfortable` (default, mobile-friendly).
>
> **Native gestures (mobile):** swipe-to-delete on transaction rows, pull-to-refresh on lists, long-press for contextual menus. Bottom sheet for long forms on mobile; centered modal on desktop.
>
> **Voice (microcopy):** experienced financial advisor — formal-neutral second person in pt-BR ("Sua reserva de emergência cobre 4,2 meses de despesas"), complete sentences, no slang, no emoji. Empty states explain *why*, not just *what*. English mirrors the same register.
>
> **Scope of v1 primitives (~25):** Button, Input, Select, Checkbox, Radio, Switch, Card, Badge, Modal, BottomSheet, Toast, Table, Tabs, Accordion, Tooltip, Popover, Drawer, Stepper, Skeleton, EmptyState, Avatar, Breadcrumb, Pagination, plus finance-aware: `Money` (BRL/USD-aware, tabular), `Sparkline`, `KPIStat`, `DateRangePicker`, `CategoryPill`.
>
> **Charts:** sparklines minimalist and inline (no axis/grid); full charts in editorial sober style (thin lines, translucent fills, near-invisible grid, serif labels).
>
> **Constraints:** all fonts and icon sets must be open-source (OFL/MIT or equivalent). WCAG AA is the floor. Theme switching via `[data-theme="dark"]` on `<html>`; tokens already live as CSS custom properties in `src/shared/ui/styles/tokens.css` and are consumed by Tailwind v4 `@theme`. Project is Vite + React 19 + TypeScript strict + FSD architecture; primitives go in `src/shared/ui/primitives/` and must be presentational only (no domain knowledge, no API calls, no stores).

## 4. Decisions log (the "why" behind the briefing)

The interactive brainstorming that produced fields 1 and 2 picked one option from each menu below. Recorded here so future revisions can see what was rejected and why.

| Decision               | Chosen                                                          | Rejected alternatives (and why not)                                                                                                                                                                |
| ---------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Positioning            | **Serious tool for self-directed planners** (YNAB/Monarch lane) | Casual mass-market (Nubank/Mint) — too soft for the data density; minimalist "calm" (Copilot) — too opinionated against power users.                                                               |
| Visual personality     | **Editorial/sophisticated** (Stripe/FT)                         | Institutional-classic — too bank/brokerage; modern dense fintech (Linear/Bloomberg) — too cold, fights the warm-neutral language we want; Swiss/utilitarian — too engineer-coded for the audience. |
| Primary accent         | **Moss green**                                                  | Teal-petrol, bordeaux (carries "loss" baggage in finance), graphite + gold (too monochrome).                                                                                                       |
| Theme priority         | **Light canonical, dark first-class courtesy**                  | Dark-first (matches the modern-fintech lane we rejected); light-only (excludes a non-trivial chunk of users).                                                                                      |
| Voice                  | **Experienced financial advisor**, pt-BR canonical              | Editorial magazine voice (too detached for advice moments); technical companion (too terse, undermines the "premium" register).                                                                    |
| Primitive scope        | **Full ~25 set** in v1                                          | Lean ~10 (would force a second wave too soon); core+finance ~15 (compromise that still delays Tabs/Popover/etc.).                                                                                  |
| Density                | **Two variants** (`compact` / `comfortable`)                    | High-density only (alienates casual users); medium-only (alienates planners — the primary audience).                                                                                               |
| Mobile nav             | **Bottom tab + secondary drawer**                               | Drawer-only (hides primary destinations behind a tap); bottom-tab-only (forces flattening of rare areas).                                                                                          |
| Desktop nav            | **Collapsible sidebar**                                         | Top bar (loses vertical real estate for dense pages); fixed sidebar (no escape valve on small laptops).                                                                                            |
| Native gestures        | **Yes**                                                         | Conservative web-only — undermines the mobile-first promise.                                                                                                                                       |
| Long forms             | **Bottom sheet (mobile) / centered modal (desktop)**            | Full-page on mobile (loses context); side panel on desktop (overkill for typical form sizes).                                                                                                      |
| Chart style            | **Sparkline + editorial expanded**                              | Pure editorial everywhere (heavy for inline use); pure modern-clean (fights the editorial register).                                                                                               |
| Series palette         | **Categorical editorial (~8, desaturated)**                     | Monochromatic (caps at ~5 series); analogous warm (less distinguishable when categories are unrelated).                                                                                            |
| Gain/loss color        | **Moss green / bordeaux**                                       | Classic green/red (universal but at odds with the editorial palette); neutral + sign-only (loses preattentive scanability in dense tables).                                                        |
| Iconography            | **Lucide / Phosphor regular**                                   | Phosphor-light (too thin against sans body text); custom-from-day-one (premature investment).                                                                                                      |
| Motion                 | **Contained (150–200ms)**                                       | Expressive/spring (fights the "calm" register); near-zero (loses critical state feedback).                                                                                                         |
| Font licensing         | **Open-source mandatory**                                       | Commercial faces (e.g., Söhne, GT Super) — would block any open-source distribution path.                                                                                                          |

## 5. What this briefing does *not* decide

These are intentionally left for Claude Design (or a later wave) to settle:

- Exact font choices (Source Serif 4 vs Fraunces; Inter vs Geist).
- Exact hex values for the moss-green scale, the warm-neutral surface ramp, and the categorical-editorial series palette.
- The complete token list and naming convention beyond what already exists in `tokens.css`.
- Logo / wordmark — not yet defined.
- Whether dark mode inverts the warm-neutral palette or shifts hue (e.g., warm-charcoal vs cool-graphite).

## 6. How this briefing connects to the codebase

The skeleton already provides the slots Claude Design's output will fill:

- **Tokens:** `src/shared/ui/styles/tokens.css` (`--finew-*` custom properties exposed to Tailwind v4 via `@theme`). Today the file declares `--finew-color-bg/fg/accent`, a 6-step spacing scale, three radii, and a sans font. The DS wave will expand this to the full token set the briefing implies (warm-neutral ramp, semantic gain/loss, series palette, two type families, density tokens).
- **Primitives:** `src/shared/ui/primitives/` (currently empty, with `.gitkeep`). Each generated primitive lands here behind a barrel export, presentational only.
- **Theme switching:** `[data-theme="dark"]` on `<html>` is owned by `src/app/providers/ThemeProvider.tsx`.
- **Architecture:** primitives must respect FSD — `shared/ui` may import only from `shared/*`, and is enforced by both `eslint-plugin-boundaries` and the dependency-cruiser test in `src/architecture.test.ts`.

## 7. Acceptance criteria for this briefing

This document is "done" when:

1. The two fields in §2 and §3 can be pasted verbatim into Claude Design without further editing.
2. The decisions log in §4 records every choice made during brainstorming with its rejected alternatives, so a future contributor can challenge any single decision without re-running the whole conversation.
3. The user has reviewed the document and approved it.

A separate spec/plan will cover *integrating* the Claude Design output into `src/shared/ui/` (token migration, primitive review, FSD compliance, tests).

## 8. Out of scope

- Generating the actual primitives or token values (Claude Design's job).
- Wiring the generated output into the codebase (next spec).
- Storybook or a primitives gallery page.
- Marketing site, logo, wordmark, brand guidelines beyond what informs UI.
