# Design System — Wave 5: Overlay & Composition Primitives Spec

**Date:** 2026-04-30
**Status:** Implementation
**Scope:** Implementation spec for the fifth wave of the design system: ship the nine overlay and composition primitives so feature/page work can compose Modals, BottomSheets, Toasts, Tabs, Accordions, Tooltips, Popovers, Drawers, and Steppers. Plan derived from this spec lives at `docs/superpowers/plans/2026-04-30-design-system-wave-5.md`.

## 1. Goal

Land nine overlay/composition primitives in `src/shared/ui/primitives/`, each with:

- a TS source (`<Name>.tsx`) and co-located stylesheet (`<Name>.css`) wrapping rules in `@layer components`
- a barrel `index.ts`
- a Vitest test (`<Name>.test.tsx`) covering the §5 contract
- exported through `src/shared/ui/primitives/index.ts`

After Wave 5, the `pages/` and `widgets/` layers can compose dialogs, drawers, and tabbed interfaces against the same `fw-*` vocabulary used by Waves 2/3.

## 2. Open decisions resolved

The integration spec (§7) left three things open. This spec resolves them:

| Decision | Choice | Rationale |
| --- | --- | --- |
| `vaul` vs Radix Dialog for BottomSheet | **`vaul`** | Drag-to-dismiss is a first-class interaction on mobile sheets and Radix Dialog can't model it well. `vaul` was built for this. Drawer (side variant) reuses the same library — one mental model. |
| `sonner` vs Radix Toast | **`sonner`** | Radix Toast requires explicit provider mount per-toast and gives less ergonomic API. `sonner` ships an imperative `toast()` function that drops into any component, with a single `<Toaster />` mount. Smaller integration surface. |
| Stepper API: linear-only or freely-navigable? | **Both, controlled by prop.** `mode="linear"` (default) blocks forward jumps past the current step; `mode="free"` lets the user click any step. Composes Radix Tabs internally for keyboard navigation and ARIA — Stepper adds the linear-mode guard on top. |

Beyond §7:

| Decision | Choice | Rationale |
| --- | --- | --- |
| Modal sizes | 480 / 640 / 800 (px) via `size="sm" \| "md" \| "lg"` (default `md`) | Matches the design brief. |
| BottomSheet snap points | 50% / 90% / fullscreen via `snapPoints={[0.5, 0.9, 1]}` (default) | Matches the design brief. The `vaul` API natively models snap points. |
| Backdrop | `var(--overlay)` token, no blur | Paper-and-ink aesthetic. The token already exists in both light and dark themes. |
| Motion duration | 150–200ms via existing `--duration-1` / `--duration-2` tokens; `prefers-reduced-motion` respected by the global guard in `globals.css` (primitives don't override) | Already wired. |
| Stepper composition | Build on top of **Radix Tabs internally** (not our own Tabs primitive) to avoid double-wrapping and to keep Stepper as a single-responsibility primitive | Trying to compose our own Tabs introduces a circular import within `primitives/`. Using Radix Tabs directly is the pragmatic choice. The integration spec called this out as "compose our Tabs" but the reality is: our Tabs already wraps Radix; Stepper wrapping our Tabs would be Tabs-in-Tabs. We document the deviation here. |

## 3. Primitives in scope

Nine primitives. None exist in the kit beyond a fragment of BottomSheet (`.fw-sheet*`). Five wrap Radix UI primitives, two wrap `vaul`, one wraps `sonner`, one is custom.

### 3.1 Modal (Radix Dialog)

```tsx
type ModalSize = "sm" | "md" | "lg"; // 480 / 640 / 800

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: ModalSize;          // default "md"
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;        // right-aligned action bar slot
}
```

Renders `<Dialog.Root>` with token-aware overlay (`var(--overlay)`) and a centered `Dialog.Content` whose `max-width` matches `size`. Title/description are rendered through `Dialog.Title`/`Dialog.Description` for ARIA. Close icon at top-right.

### 3.2 BottomSheet (`vaul`)

```tsx
interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapPoints?: (number | string)[]; // default [0.5, 0.9, 1]
  title?: ReactNode;
  children?: ReactNode;
}
```

Mobile-first sheet that slides from the bottom. Drag handle at top. Backdrop uses `var(--overlay)`. Re-uses the kit's `.fw-sheet*` selectors verbatim where possible.

### 3.3 Toast (`sonner`)

Two surfaces:

```tsx
// Imperative API — re-exported from sonner
import { toast } from "@shared/ui/primitives/Toast";
toast.success("Saved");
toast.error("Network error");
toast("Plain message");

// Provider — one mount per app
<Toaster position="top-right" />
```

Wrapped to read tokens (`--surface-1`, `--fg-1`, `--gain`, `--loss`, `--warn`) and fixed corner-radius `--radius-md`.

### 3.4 Tabs (Radix Tabs, dot-namespaced)

```tsx
<Tabs.Root value={tab} onValueChange={setTab}>
  <Tabs.List>
    <Tabs.Trigger value="a">Aba A</Tabs.Trigger>
    <Tabs.Trigger value="b">Aba B</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="a">…</Tabs.Content>
  <Tabs.Content value="b">…</Tabs.Content>
</Tabs.Root>
```

Renders via Radix; restyled with `fw-tabs` selectors (kit already defines `.fw-tabs` for desktop tab strip).

### 3.5 Accordion (Radix Accordion)

```tsx
<Accordion.Root type="single" collapsible>
  <Accordion.Item value="q1">
    <Accordion.Trigger>Pergunta 1</Accordion.Trigger>
    <Accordion.Content>Resposta…</Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
```

Chevron rotation animated via CSS (respecting reduced-motion guard in `globals.css`).

### 3.6 Tooltip (Radix Tooltip)

```tsx
<Tooltip content="Atalho: ⌘K">
  <Button>Buscar</Button>
</Tooltip>
```

Single-prop ergonomic API. Wraps `<Tooltip.Provider>`, `<Tooltip.Root>`, `<Tooltip.Trigger asChild>`, `<Tooltip.Portal>`, `<Tooltip.Content>` internally. Default `delayDuration={200}`.

### 3.7 Popover (Radix Popover, dot-namespaced)

```tsx
<Popover.Root>
  <Popover.Trigger asChild><Button>Filtros</Button></Popover.Trigger>
  <Popover.Content>…</Popover.Content>
</Popover.Root>
```

Exposes the dot-namespaced API (more flexible than Tooltip's single-prop convenience because Popover content can be arbitrarily complex).

### 3.8 Drawer (`vaul`, side variant)

```tsx
interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right";   // default "right"
  title?: ReactNode;
  children?: ReactNode;
}
```

Side-anchored sheet. Same backdrop and motion as BottomSheet.

### 3.9 Stepper (custom)

```tsx
interface StepperStep {
  value: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: StepperStep[];
  current: string;
  onChange: (next: string) => void;
  mode?: "linear" | "free";  // default "linear"
  children?: ReactNode;       // panel content; rendered for the current step
}
```

Renders a numbered step strip + the panel for the active step. In `linear` mode, step buttons after `current` are disabled. Internally uses Radix Tabs primitives for keyboard nav and ARIA.

## 4. Cross-cutting conventions

- **File layout per primitive:** `src/shared/ui/primitives/<Name>/{<Name>.tsx, <Name>.css, <Name>.test.tsx, index.ts}`. Compound primitives (Tabs, Accordion, Popover) export a dot-namespaced object plus their part types.
- **CSS:** every `.css` wraps rules in `@layer components`. Co-located `.css` imported as side effect at the top of the `.tsx`.
- **Class names:** preserve/extend the kit's `fw-*` prefix. New selectors: `fw-modal*`, `fw-sheet*` (already present), `fw-toast*`, `fw-tabs*`, `fw-accordion*`, `fw-tooltip*`, `fw-popover*`, `fw-drawer*`, `fw-stepper*`.
- **Refs:** simple primitives forward refs to the root DOM node. Compound primitives forward refs at each part where the underlying Radix part forwards them (which is all of them).
- **Density / motion:** rely on existing tokens; do not override the global reduced-motion guard.
- **A11y:** rely on Radix / vaul / sonner for focus trapping, keyboard nav, ARIA. Stepper exposes `aria-current="step"` on the active step.
- **Barrel:** each primitive's `index.ts` re-exports the public surface; `src/shared/ui/primitives/index.ts` re-exports everything.

## 5. Test contract per primitive

Every `<Name>.test.tsx` covers at minimum:

1. Smoke render with required props (open / closed where applicable).
2. Open/close behavior: `open={true}` renders; clicking close or pressing Esc calls `onOpenChange(false)` (where applicable).
3. Compound primitives: each part renders the correct ARIA attribute (e.g. `role="tab"`, `aria-selected`, `aria-controls`).
4. Ref forwarding for the root element where one exists.
5. For Toast: `toast.success("msg")` queues a toast that becomes visible in the DOM after `<Toaster />` is mounted.
6. For Stepper: `mode="linear"` blocks clicks on future steps; `mode="free"` allows them.

## 6. Out of scope for Wave 5

- `<Switch>`, `<Input>`, `<Select>`, `<Checkbox>`, `<Radio>`, `<DateRangePicker>` — Wave 4.
- `<Table>`, `<TransactionRow>` — Wave 6.
- Storybook or any documentation surface beyond the test files.
- Page-level integrations (e.g. wiring a real Tabs widget into HomePage).
- Domain logic — all primitives are presentational and FSD-shared-pure.

## 7. Acceptance criteria

The wave is done when:

1. All nine primitives are exported from `src/shared/ui/primitives/index.ts`.
2. Each primitive has a passing `.test.tsx` covering the §5 contract.
3. `npm run lint && npm run typecheck && npm test -- --run && npm run build` all pass.
4. The architectural test (`src/architecture.test.ts`) still passes.
5. Three new runtime dependencies appear in `package.json`: Radix UI primitives (5 packages), `vaul`, and `sonner`. Versions pinned.

## 8. Files added or modified

New per primitive:

```
src/shared/ui/primitives/<Name>/<Name>.tsx
src/shared/ui/primitives/<Name>/<Name>.css
src/shared/ui/primitives/<Name>/<Name>.test.tsx
src/shared/ui/primitives/<Name>/index.ts
```

Modified:

- `src/shared/ui/primitives/index.ts` — append nine new exports.
- `package.json` / `package-lock.json` — add Radix, vaul, sonner.

No changes to `src/app/`, `tokens.css`, `tailwind.config`, or any of the existing primitives.

## 9. Risk register

- **Radix portals + jsdom.** Radix Tooltip/Popover/Dialog render content into a portal. Tests assert portal content via `screen.getByRole(...)` — testing-library walks the document, including portals. No special `container` setup needed.
- **`vaul` and pointer events.** vaul drag-to-dismiss uses `pointerdown`/`pointermove`. jsdom simulates these but the exact drag interaction isn't tested — only the open/close prop contract.
- **`sonner` global state.** `toast()` mutates a singleton store. Tests must reset the toaster between tests (sonner exposes `toast.dismiss()` for cleanup).
- **Stepper-on-Tabs deviation.** The integration spec implied "build on top of our Tabs"; this spec uses Radix Tabs directly to avoid Tabs-in-Tabs nesting. Documented above (§2) so reviewers see the choice.
