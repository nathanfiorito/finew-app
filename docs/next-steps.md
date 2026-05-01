# Finew — Next Steps (Handoff)

**Date:** 2026-04-30
**Last branch worked on:** `feature/ds-storybook-ladle`
**Last session highlight:** Storybook (Ladle) — 29 stories for 26 primitives + global theme/density/locale toolbar. PR #27 open.

This is a fast-orientation doc for picking up in a new session. Read this first, then jump into whichever section is relevant.

---

## 1. Current state

- **Develop and main are aligned in content.** `main` is `develop + N release-marker merge commits` (cosmetic "behind" badge on develop is intentional — see TD section).
- **Design System v1 is feature-complete:** 26 primitives across Waves 1–6, Storybook (Ladle) on PR #27.
  - Wave 1: tokens, fonts, theme/density/locale providers, `<Icon>`
  - Wave 2: Button, Card, Avatar, CategoryPill, Badge, Skeleton, EmptyState, Breadcrumb, Pagination
  - Wave 3: Money, Sparkline, KPIStat (+ LocaleProvider in `shared/config/locale/`)
  - Wave 4: Input, Select, Checkbox, Radio, Switch, DateRangePicker (Radix-backed)
  - Wave 5: Modal, BottomSheet, Toast, Tabs, Accordion, Tooltip, Popover, Drawer, Stepper (Radix + vaul + sonner)
  - Wave 6: Table (TanStack Table v8 headless)
  - Storybook: Ladle 4 (Ladle 5 broken — see TD-5), 29 stories, toolbar globals.
- **Pages layer:** `HomePage` is still the placeholder from the skeleton wave. Has not been refactored to use real primitives.
- **Domain layer (`entities/`, `features/`):** empty. No real data model yet.

## 2. Open PRs to land

| PR | Branch | Status | Action |
|---|---|---|---|
| #27 | `feature/ds-storybook-ladle` | MERGEABLE | Squash-merge to develop. Then squash-merge develop → main as a release. |

After merging, that's the entire DS story closed.

## 3. Open tech debt

Tracked in `docs/tech-debt/`. Ordered by impact:

### TD-1 / TD-2 — `package.json` overrides + `eslint-plugin-react` `version: "detect"` disabled

In `2026-04-29-skeleton-overrides.md`. Cosmetic; revisit when each plugin officially supports our majors.

### TD-3 — Squash-vs-merge-commit discipline

In `2026-04-30-merge-strategy.md`. Manual: when opening a sync/back-merge PR, must remember to choose "Create a merge commit" not "Squash and merge". Bit me once with PR #13. **Repay** by adding a workflow that fails squash on `feature/sync-*` branch heads. Until then, watch the dropdown.

### TD-4 — `develop` ruleset relaxed beyond strict need

In `2026-04-30-merge-strategy.md`. `develop` allows `["squash", "merge"]` to leave the back-merge escape valve. Tighten back to `["squash"]` once TD-3 is automated.

### TD-5 (NEW — add to register if you want) — Ladle pinned to `^4`

Ladle 5.x ships a Vite that uses the experimental rolldown bundler. Its built-in `vite-react-refresh-wrapper` plugin throws "Missing field `moduleType`" on every transform, blocking the dev server. **Repay** by re-trying `@ladle/react@latest` after a few releases — likely a 5.2/5.3 fix. Until then, `^4.1` is rock-solid.

### TD-6 (NEW — add to register if you want) — Accordion first-open stutter

`<Accordion>` content uses keyframes with `--radix-accordion-content-height`. The first time an item opens, a slight stutter is visible — likely caused by Radix needing one frame to measure content + set the CSS var while the keyframe is already running. We tried two alternatives this session:

- `transition` instead of keyframes + inner `.fw-accordion-content-inner` wrapper to keep padding off the animated outer. **It removed the stutter but degraded the typography** (user feedback). Reverted.
- The current keyframe version is acceptable but has the stutter.

**Repay** when you want to revisit — a few approaches to try: FLIP animation, View Transitions API (Chromium-only for now), preloading Source Serif 4 with `<link rel="preload">` (font load could be contributing), or measuring content with `forceMount` on first render to warm Radix's measurement.

## 4. Next natural waves (pick one)

In rough priority order:

### A. Refactor `HomePage` to use real primitives (smallest, most visual)

Currently `HomePage` is a placeholder. Now that we have 26 primitives, we can rebuild it with a real dashboard layout:

- `<Card title="Saldo">` with a `<KPIStat>`
- `<Table>` of recent transactions using `<Money>`
- `<Pagination>`
- `<EmptyState>` when no data

**No spec needed** — small enough to do directly. Validates the DS in actual page composition.

### B. Real domain (`entities/Account`, `entities/Transaction`)

Start typing the data model. Each entity gets its own folder under `src/entities/<name>/` with TS types and zero behavior. Pure shape:

```ts
// src/entities/transaction/Transaction.ts
export interface Transaction {
  id: string;
  date: string;            // ISO yyyy-mm-dd
  amount: number;          // negative for outflow
  currency: string;
  description: string;
  categoryId: string | null;
  accountId: string;
}
```

Then `features/transactions/` for UI slices that consume entities. Spec needed (small one — model decisions, not implementation).

### C. Auth / API client

`src/shared/api/client.ts` exists as a typed `fetch` wrapper but has no consumer. Once you have a backend (or a mock service), wire it. Spec needed.

### D. PWA polish

App is technically a PWA (vite-plugin-pwa) but icons are placeholders (`public/icons/.gitkeep`), no manifest tuning, no install prompt UX. Small, mostly cosmetic.

### E. CI back-merge automation (closes TD-3)

GitHub Action that opens an automatic back-merge PR after every `develop → main` merge, with the right merge method enforced. Spec needed.

**My recommendation:** **A** first (~1 hour, instant gratification, validates the DS). Then **B** (the foundation for everything else app-related).

## 5. Quick reference

### Commands

```bash
npm run dev              # Vite dev server
npm run lint             # ESLint flat config
npm run typecheck        # tsc --noEmit
npm test -- --run        # Vitest single run
npm run build            # tsc + vite build (prod PWA)
npm run ladle            # Ladle local sandbox
npm run ladle:build      # Ladle production build
```

### File-layout conventions

- Primitive: `src/shared/ui/primitives/<Name>/{<Name>.tsx, <Name>.css, <Name>.test.tsx, <Name>.stories.tsx, index.ts}`
- Provider/config: `src/shared/config/<topic>/` (locale lives here, not in `app/providers/` — see Wave 3 lesson)
- Spec: `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
- Plan: `docs/superpowers/plans/YYYY-MM-DD-<topic>.md`
- Tech debt: `docs/tech-debt/YYYY-MM-DD-<topic>.md`

### Architectural rules (FSD)

- Layers: `app > pages > widgets > features > entities > shared`. Imports flow downward only.
- `shared` cannot import from `app`. Lesson learned with Wave 3 — `LocaleProvider` lives in `shared/config/locale/` because it's consumed by `Money` and `KPIStat` (both `shared`).
- Sibling features cannot import each other. Compose at `widgets/` or `pages/`.
- ESM + `verbatimModuleSyntax`: relative imports inside `src/` MUST use `.js` extension on `.ts`/`.tsx` source.

### Branching

- `feature → develop`: **squash-only** (per ruleset).
- `develop → main`: **merge-commit-only** (per ruleset). Drop "linear history" was deliberate.
- Branch always from latest `develop`.
- Never push directly to `develop` or `main` — server rejects. Always via PR.

### When opening a sync / back-merge PR

Pick **"Create a merge commit"** in the GitHub merge dropdown, NOT "Squash and merge". Squashing strips the merge metadata and the lineage fix is lost (this happened with PR #13).

## 6. Reference docs

| Topic | Path |
|---|---|
| Skeleton architecture (FSD bootstrap) | `docs/superpowers/specs/2026-04-29-skeleton-architecture-design.md` |
| Guardrails (rulesets, CI) | `docs/superpowers/specs/2026-04-29-guardrails-design.md` |
| Design System briefing | `docs/superpowers/specs/2026-04-30-design-system-briefing.md` |
| Design System integration / wave map | `docs/superpowers/specs/2026-04-30-design-system-integration-design.md` |
| Wave 1–6 specs and plans | `docs/superpowers/specs/2026-04-30-design-system-wave-{1..6}-design.md` and `docs/superpowers/plans/2026-04-30-design-system-wave-{1..6}.md` |
| Storybook spec/plan | `docs/superpowers/specs/2026-04-30-design-system-storybook-design.md`, `.../plans/2026-04-30-design-system-storybook.md` |
| Tech debt | `docs/tech-debt/` |
| Claude Design source-of-truth | `docs/design-system-reference/` |

## 7. Memory bookmark

The Claude Code memory system at `~/.claude/projects/C--Users-pesso-dev-finew-app/memory/` may have user-preference notes accumulated during the session — worth a glance when picking up.

---

**Suggested first action in the next session:** open this file, read §3 (open TDs), §4 (pick a next wave), and tell the agent which letter (A–E) to pursue.
