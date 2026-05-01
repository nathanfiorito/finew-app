# Design System — Storybook (Ladle) Spec

**Date:** 2026-04-30
**Status:** Draft — pending user review
**Scope:** Add a local Storybook-style sandbox using Ladle so the 26 primitives in `src/shared/ui/primitives/` can be browsed, exercised in all theme/density/locale combinations, and demoed without consuming them in real pages. Local-only for now (no GitHub Pages deploy).

## 1. Goal

Give the design system a place where each primitive is a single link away — rendered in isolation, switchable between light/dark/comfortable/compact/pt-BR/en-US, with the smallest possible setup overhead.

After this PR:

- `npm run ladle` (or `npm run storybook` if we alias it) opens a local URL with a navigable list of primitives.
- Each primitive renders a single default story showing it with sensible props.
- A toolbar lets the user flip theme, density, and locale globally without code changes.

## 2. Tool: Ladle

Ladle is the Vite-native alternative to Storybook 9. Trade-off captured: ~3MB install, 1-line config, native Vite dev server, no separate build, no addon ecosystem. Sufficient for a solo-dev DS sandbox; if we ever need Chromatic-style visual regression or a11y CI, we revisit.

The integration spec (`§10` of `docs/superpowers/specs/2026-04-30-design-system-integration-design.md`) already named Storybook as a future spec; this is that spec.

## 3. Decisions resolved

| Decision | Choice |
| --- | --- |
| Tool | **Ladle** |
| Story location | **Co-located** with each primitive: `<Name>.stories.tsx` next to `<Name>.tsx` and `<Name>.test.tsx`. |
| Scope | **Phase 1 only** — one default story per primitive (26 total). Variant matrices and controls deferred to Phase 2 if usage warrants. |
| Toolbar globals | **Theme + Density + Locale switchers** as Ladle decorators. Apply via the existing providers / config. |
| Deploy | **Local-only** for now. GitHub Pages deferred until shared with non-dev users. |
| Foundation pages | **Out of scope** for Phase 1. Token/spacing/typography showcases come in Phase 3. |

## 4. Files added or modified

New:
- `.ladle/config.mjs` — minimal Ladle config (title, addons, default theme).
- `.ladle/components.tsx` — global decorator wrapping every story in `<ThemeProvider><DensityProvider><LocaleProvider>` with toolbar bindings.
- `<Name>.stories.tsx` for every primitive (26 files) under `src/shared/ui/primitives/<Name>/`.

Modified:
- `package.json` — add `@ladle/react` dev dep, add `ladle` script (`"ladle": "ladle serve"`) and a `ladle:build` script for sanity checks (`"ladle:build": "ladle build"`).
- `eslint.config.js` — `*.stories.tsx` files inherit the test-file relaxed override (return-type rules off; story functions are like tests, not exported APIs).
- `tsconfig.json` — no change expected; Ladle handles its own build.
- `.gitignore` — add `.ladle/dist/` (Ladle build output).

No change to:
- `src/app/`, `src/shared/ui/styles/`, primitive source files. Stories consume the public API only.
- The CI workflow. Ladle is local-only.

## 5. Story contract per primitive

Each `<Name>.stories.tsx` exports at least one default story:

```tsx
import { Name } from "./Name.js";

export const Default = (): JSX.Element => (
  <Name {...sensibleProps} />
);
```

Sensible props per primitive (kept minimal — Phase 2 expands):

- **Button**: `Default` renders `<Button>Salvar</Button>`.
- **Card**: `Default` renders `<Card title="Saldo">R$ 12.483,90</Card>`.
- **Avatar**: `Default` renders `<Avatar initials="NF" />`.
- **CategoryPill**: `<CategoryPill label="Mercado" color="var(--series-1)" />`.
- **Badge**: `<Badge tone="gain">+12,4%</Badge>`.
- **Skeleton**: `<Skeleton width={200} height={16} />`.
- **EmptyState**: with title + description.
- **Breadcrumb**: 3-item path.
- **Pagination**: page=3, pageCount=10.
- **Money**: `<Money amount={12483.9} />`.
- **Sparkline**: `[1, 2, 3, 5, 4, 7, 6]`.
- **KPIStat**: composes Money + delta + sparkline.
- **Table**: small dataset with one Money column.
- **Input / Select / Checkbox / Radio / Switch**: with `name` and a representative value/state.
- **DateRangePicker**: empty state showing the trigger button.
- **Modal / BottomSheet / Drawer**: a `[Open]` button that toggles open state via local `useState`.
- **Toast**: a `[Show toast]` button that fires `toast.success("Lançamento salvo")`.
- **Tabs / Accordion**: 3-tab / 3-section example.
- **Tooltip / Popover**: trigger + content example.
- **Stepper**: 3-step linear example.
- **Icon**: a small grid of every icon in the registry, useful as a visual reference.

## 6. Toolbar globals

`.ladle/components.tsx` registers three toolbar controls:

- **Theme** — `light` / `dark`. Wires to `useThemeStore.setState`.
- **Density** — `comfortable` / `compact`. Wires to `useDensityStore.setState`.
- **Locale** — `pt-BR` / `en-US`. Wires to `useLocaleStore.setState`.

The decorator wraps every story in:

```tsx
<ThemeProvider>
  <DensityProvider>
    <LocaleProvider>
      <Story />
    </LocaleProvider>
  </DensityProvider>
</ThemeProvider>
```

Plus an effect that pushes the current toolbar selection into the corresponding Zustand store on change.

The `app/styles/index.css` cascade is imported once in `.ladle/components.tsx` so tokens, fonts, typography, and globals are available to every story.

## 7. Acceptance criteria

The wave is done when:

1. `npm run ladle` starts a server and opens a browser with a navigable sidebar listing all 26 primitives.
2. Each primitive's `Default` story renders without console errors.
3. Toolbar flipping `Theme=dark` swaps the page palette; `Density=compact` shrinks tokens (visible on Card, Pagination, KPIStat, Table); `Locale=en-US` flips Money/KPIStat formatting.
4. `npm run lint && npm run typecheck && npm test -- --run && npm run build && npm run ladle:build` all pass.
5. The architecture test still passes — stories live inside `src/shared/ui/primitives/<Name>/`, so they belong to the `shared` layer; they import sibling primitives + the providers/config, all within `shared`. No new boundary violations.

## 8. Out of scope

- **Phase 2**: per-primitive variant stories (Button × variant × size × loading × disabled, etc.) with Ladle controls. Open a follow-up when Phase 1 stories prove useful.
- **Phase 3**: foundation pages — color palette, type scale, spacing scale, motion easings rendered as live demos.
- **GitHub Pages deploy** — defer until needed.
- **Visual regression** (Chromatic, Playwright snapshots) — defer; covered by future tech-debt.
- **Storybook addons** (a11y, MDX docs, etc.) — by definition not on Ladle.
- Refactoring `pages/HomePage` to consume primitives — separate work.

## 9. Risk register

- **Ladle's React 19 compatibility.** Ladle has supported React 19 since `5.x`. We pin a recent version. If a breakage surfaces, we file upstream and pin previous; fallback is Histoire.
- **Tailwind v4 `@theme` directive in stories.** Ladle uses Vite, so the same `app/styles/index.css` import works. Tested by the `ladle:build` step.
- **`vaul` and Radix portal rendering inside Ladle's iframe.** Stories that use overlays (Modal, BottomSheet, Drawer, Tooltip, Popover) need to render their portal target inside the story root. Verify in the toolbar test path.
- **Stories slowing down `npm test`.** Vitest globs match `*.test.{ts,tsx}` only; `*.stories.tsx` is excluded by Vitest config (`exclude` already covers anything not `*.test.*`). Verify `npm test -- --run` count doesn't change.
