# Design System — Wave 2: Basic Primitives Spec

**Date:** 2026-04-30
**Status:** Draft — pending user review
**Scope:** Implementation spec for the second wave of the design system: ship the nine basic, presentational primitives so `pages/` and `widgets/` can compose them. Implementation plan derived from this spec lives at `docs/superpowers/plans/2026-04-30-design-system-wave-2.md`.

## 1. Goal

Land nine presentational primitives in `src/shared/ui/primitives/`, each with:

- a TS source (`<Name>.tsx`) and a co-located stylesheet (`<Name>.css`) wrapping rules in `@layer components`
- a barrel `index.ts`
- a Vitest test (`<Name>.test.tsx`) covering at least: smoke render, every prop variant or value, A11y attribute mapping where applicable
- exported through `src/shared/ui/primitives/index.ts`

After Wave 2, the `pages/HomePage` can be rebuilt to use real primitives (deferred to a separate PR; not part of this wave).

## 2. Open decisions resolved (proposed)

The integration spec (§4) left three things open. This spec proposes:

| Decision | Choice | Rationale |
| --- | --- | --- |
| Class-name prefix | **Keep `fw-*`** | Round-trips with the Claude Design output; greppable; doesn't collide with Tailwind utilities. |
| Forward refs | **Always forward**, via `forwardRef` from React 19 | Cheap to add now; expensive to add later when consumers exist. |
| `asChild` (Radix-style polymorphism) | **Defer to Wave 5** | YAGNI for Wave 2 surfaces; revisit when `<Button>` needs to render as `<a>` inside Tooltips/Menus. |
| Polymorphic `as` prop | **Skip** | Overlaps with `asChild`; `<a>`-vs-`<button>` distinction handled by always rendering `<button>` and pairing with `<a>` via wrapping when needed. |
| Test file extension | **`.test.tsx`** for primitives, **`.test.ts`** for pure-logic helpers | Already established pattern in Wave 1. |

If any of these should flip, raise before the plan is written.

## 3. Primitives in scope

Nine primitives. Five exist in the Claude Design kit (`docs/design-system-reference/ui_kits/finew-pwa/Components.jsx` + `kit.css`); four are new construction.

### 3.1 Button (port — exists in kit)

Source of truth: `kit.css` `.fw-btn*` rules; `Components.jsx` `<Button>`.

```tsx
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;       // default "primary"
  size?: ButtonSize;             // default "md"
  iconLeading?: IconName;        // optional Lucide icon by registry key
  iconTrailing?: IconName;
  loading?: boolean;             // disables button + swaps icon for spinner
}
```

Notes:
- `disabled`/`loading`: both apply `aria-disabled` + 40% opacity per the brief; `loading` replaces leading icon with a spinner glyph (built inline as a CSS keyframe in `Button.css`).
- Removed from Wave 2: `asChild`, `as`. See §2.
- Ports `:active translateY(1px)` press style and `:focus-visible` 2px outline at 2px offset.

### 3.2 Badge (build — referenced in kit but no React component)

Kit has `.fw-badge*` CSS classes only.

```tsx
type BadgeTone = "neutral" | "warn" | "gain" | "loss" | "info";
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;              // default "neutral"
  iconLeading?: IconName;
}
```

Renders `<span class="fw-badge fw-badge-{tone}">`. Used for "Atrasado", "Pago", "+12,4%" markers; semantic gain/loss tones must be paired with sign + arrow per the brief — pairing is the consumer's responsibility, badge just provides the chip.

### 3.3 Card (port — exists in kit)

```tsx
interface CardProps extends HTMLAttributes<HTMLElement> {
  title?: ReactNode;
  action?: ReactNode;            // right-aligned slot in header
  padded?: boolean;              // default true; false = body has zero padding (for tables that bring their own)
}
```

Renders `<section class="fw-card">` with optional `<header class="fw-card-head">` and a `<div class="fw-card-body">` (or `<div>` without padding). Density-aware padding is handled in CSS via `[data-density="compact"]`.

### 3.4 CategoryPill (port — exists in kit)

The kit hardcodes a category-to-color map keyed by Portuguese keys (`mercado`, `transporte`, ...). For the primitive layer this is anti-FSD: `shared/ui` must not know about domain categories. Refactor:

```tsx
interface CategoryPillProps extends HTMLAttributes<HTMLSpanElement> {
  label: string;
  color?: string;                // any CSS color or var() reference; defaults to var(--fg-3)
}
```

The category-to-series mapping (`mercado → series-1`, etc.) moves out of Wave 2 to a future `entities/category` module. The pill stays presentational.

### 3.5 Avatar (port — sketched in kit's `.fw-avatar`)

```tsx
interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  initials?: string;             // 1-2 chars; auto-uppercased
  src?: string;                  // image URL; if present, overrides initials
  alt?: string;                  // required if src is set
  size?: "sm" | "md" | "lg";     // 24 / 32 / 40 px
}
```

Image takes priority over initials. Falls back to initials-on-accent if image fails to load (use `onError` to swap state).

### 3.6 Skeleton (build)

```tsx
interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "rect" | "text" | "circle";  // default "rect"
  width?: number | string;       // px or any CSS length
  height?: number | string;
  lines?: number;                // text variant only — stacks N rows
}
```

CSS animation: a 1.4s linear infinite shimmer using a translucent gradient. Respect `prefers-reduced-motion`: skip animation.

### 3.7 EmptyState (build)

Per the brief: empty states explain *why*, not just *what*.

```tsx
interface EmptyStateProps {
  title: string;                 // sentence-case headline
  description?: string;          // single sentence explaining cause / next step
  iconName?: IconName;           // optional decorative
  action?: ReactNode;            // typically a <Button> CTA
}
```

Renders centered, padded container with optional icon, serif title, sans description, action slot.

### 3.8 Breadcrumb (build)

```tsx
interface BreadcrumbItem {
  label: string;
  href?: string;                 // last item typically has no href
}
interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: ReactNode;         // default "/"; could be U+203A (›) or chevron
}
```

Renders `<nav aria-label="Breadcrumb"><ol>...</ol></nav>`. Last item is rendered as plain text with `aria-current="page"`.

### 3.9 Pagination (build)

```tsx
interface PaginationProps {
  page: number;                  // 1-indexed
  pageCount: number;
  onPageChange: (next: number) => void;
  siblingCount?: number;         // default 1 — pages shown around current
  showFirstLast?: boolean;       // default true
}
```

Renders `<nav aria-label="Pagination">` with prev/next buttons, ellipsis for skipped ranges, current-page highlighted via `aria-current="page"`. Uses the kit's `.fw-btn fw-btn-ghost` styling for individual page buttons.

## 4. Cross-cutting conventions

- **File layout per primitive:** `src/shared/ui/primitives/<Name>/{<Name>.tsx, <Name>.css, <Name>.test.tsx, index.ts}`.
- **CSS:** every `.css` wraps its rules in `@layer components { … }` so Tailwind utilities can override without specificity wars. Co-located CSS is imported as a side-effect at the top of the `.tsx`.
- **Class names:** preserve the kit's `fw-*` prefix verbatim. New primitives use the same prefix (`.fw-skeleton`, `.fw-empty`, `.fw-breadcrumb`, `.fw-pagination`).
- **Refs:** every primitive uses `forwardRef`. Test that the ref reaches the underlying DOM node.
- **Density-awareness:** any padding/spacing that should differ between `comfortable` and `compact` is expressed via `--space-*` tokens (which already swap under `[data-density="compact"]`). Avoid hardcoded px.
- **A11y:** Buttons are always `<button type="button">` unless overridden via `type="submit"` prop pass-through. Interactive primitives expose `aria-*` attributes appropriate to their role. Decorative icons get `aria-hidden="true"` (handled by `<Icon>` already).
- **Barrel:** each primitive's `index.ts` re-exports the component and its public props type. The parent barrel `src/shared/ui/primitives/index.ts` re-exports everything.

## 5. Test contract per primitive

Every `<Name>.test.tsx` covers at minimum:

1. Smoke render with required props.
2. Each variant/tone/size produces the expected class name.
3. `forwardRef` reaches the right DOM node.
4. Any branching prop (`loading`, `disabled`, `iconLeading`, etc.) produces the expected DOM/A11y output.
5. Icon-bearing primitives reuse the `<Icon>` primitive — never inline lucide-react imports.

## 6. Out of scope for Wave 2

- `<Switch>`, `<Tooltip>`, `<Modal>`, `<BottomSheet>`, `<Toast>`, `<Tabs>`, `<Accordion>`, `<Popover>`, `<Drawer>`, `<Stepper>` — Wave 5.
- `<Input>`, `<Select>`, `<Checkbox>`, `<Radio>`, `<DateRangePicker>` — Wave 4.
- `<Money>`, `<Sparkline>`, `<KPIStat>` — Wave 3.
- `<Table>`, `<TransactionRow>` — Wave 6.
- Storybook or any documentation surface beyond the test files.
- Refactoring `pages/HomePage` to use the new primitives.
- Domain knowledge — `CategoryPill`'s color map is explicitly punted to a future `entities/category` module.

## 7. Acceptance criteria

The wave is done when:

1. All nine primitives are exported from `src/shared/ui/primitives/index.ts`.
2. Each primitive has a passing `.test.tsx` covering the §5 contract.
3. `npm run lint && npm run typecheck && npm test -- --run && npm run build` all pass.
4. The architectural test (`src/architecture.test.ts`) still passes.
5. A scratch consumer in a test file imports each primitive from `src/shared/ui/primitives` (not from internals) and renders it without a console error.

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

No changes to `src/app/`, `tokens.css`, `tailwind.config`, or any of the existing primitives (`Icon` stays as Wave 1 left it).

## 9. Risk register

- **Class name collision with future Tailwind utilities.** `fw-*` prefix gives us a private namespace; risk is theoretical.
- **CSS load order.** Each primitive imports its own `.css` as a side-effect. Order between primitives doesn't matter (they don't share selectors), but each must use `@layer components` so `tokens.css` (loaded earlier in `app/styles/index.css`) is consumed correctly. Plan task #1 will define the canonical primitive template.
- **`forwardRef` typing under React 19 + strict TS.** React 19 deprecated the implicit ref-forwarding path; the new pattern is `forwardRef<HTMLButtonElement, ButtonProps>`. The plan will lock this signature in the first primitive (Button) and reuse the shape thereafter.
