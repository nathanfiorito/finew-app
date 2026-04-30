# Design System — Wave 6: Table Primitive Spec

**Date:** 2026-04-30
**Status:** Draft — pending user review
**Scope:** Implementation spec for the sixth wave of the design system: ship the data `Table` primitive that the kit's `.fw-table` styles already define. Implementation plan derived from this spec lives at `docs/superpowers/plans/2026-04-30-design-system-wave-6.md`.

## 1. Goal

Land a single, presentational, generically-typed `Table<T>` primitive in `src/shared/ui/primitives/Table/`. The component:

- renders its own `<table><thead><tbody>` DOM using the kit's `.fw-table*` visual vocabulary (already in `kit.css`),
- delegates **logic only** to `@tanstack/react-table` v8 (sort state, column models),
- composes existing primitives — `<Pagination>`, `<Skeleton>`, `<EmptyState>`, `<Icon>` — for non-table chrome,
- is domain-free: `Money` formatting, locale, and number/date semantics belong to the consumer's `cell` renderer.

After Wave 6, `widgets/` and `pages/` can build a Transactions/Accounts view by composing `<Table>` with `<Money>` cells.

## 2. Decisions resolved

| Decision | Choice | Rationale |
| --- | --- | --- |
| Headless logic library | **`@tanstack/react-table` v8** pinned `8.21.3` | Best-in-class headless table; sort/column models are exactly what we need, nothing more. |
| Rendering | **Custom DOM** — do **not** use `flexRender` or any TanStack rendering helpers | Preserves the kit's `.fw-table` visual contract. TanStack v8 is rendering-agnostic by design. |
| Virtualization | **No** in v1 | Defer until a real Transactions screen demonstrates the need. Adding `@tanstack/react-virtual` later is additive. |
| Pagination | **External** — consumer owns page state | The primitive doesn't fetch. It accepts `{ page, pageCount, onPageChange }` and renders our existing `<Pagination>` below the scroll container. |
| Sticky header | **Yes** — `position: sticky` on `<thead>` inside a scrollable wrapper | Standard pattern, no JS needed. |
| Density | **Inherits** from the global `[data-density]` attribute | The kit's `.fw-table` already swaps `th`/`td` padding under `[data-density="compact"]`. The primitive contributes no new density logic. |
| Loading state | **N skeleton rows** (default 5) when `loading={true}` | Uses `<Skeleton variant="rect">` cells. |
| Empty state | **`<EmptyState>`** when `data.length === 0 && !loading`; the consumer can override via the `empty` prop | Matches the briefing's "explain why, not just what" rule. |
| A11y for the wrapper | Consumer **must** pass `aria-label` on the wrapper | The primitive has no header text by itself; an explicit label is required. |

## 3. API

```ts
interface TableColumn<T> {
  id: string;                            // column key
  header: ReactNode;                     // string or node
  accessor: (row: T) => unknown;         // pure read; sortable columns must return string | number | Date
  cell?: (row: T) => ReactNode;          // optional render override; defaults to String(accessor(row))
  align?: "left" | "right" | "center";   // default "left"; Money columns use "right"
  sortable?: boolean;                    // default false
  width?: string | number;               // any CSS length; numbers are px
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  rowKey: (row: T) => string;
  sort?: { id: string; desc: boolean };
  onSortChange?: (next: { id: string; desc: boolean }) => void;
  pagination?: { page: number; pageCount: number; onPageChange: (n: number) => void };
  loading?: boolean;
  empty?: ReactNode;                     // defaults to <EmptyState title="Sem dados" />
  "aria-label": string;                  // required on the wrapper
  skeletonRows?: number;                 // default 5
  className?: string;
}
```

The component is `forwardRef<HTMLDivElement, TableProps<T>>` — the ref points at the outer `<div class="fw-table-wrap">`.

### 3.1 Sortable columns

When `sortable: true`, the header renders a `<button>` with the column's content and a chevron. The chevron uses `<Icon name="chevronUp"|"chevronDown" />`. Inactive sortable columns show a faint dual-arrow (rendered as a stack of two muted chevrons; pure CSS via `.fw-table-sort-idle`). Clicking the header calls `onSortChange({ id, desc })`. ARIA: `aria-sort="ascending" | "descending" | "none"` on the `<th>`.

Cycle: idle → desc → asc → desc → asc … (the kit favours desc-first for finance views — the largest values bubble up). Resetting back to "none" is the consumer's job (don't toggle through none).

### 3.2 Sort comparator

The primitive provides a built-in comparator that handles `string`, `number`, `Date`, plus `null`/`undefined` (sorted last). Anything else falls back to `String(a).localeCompare(String(b))`. This is the only place where `unknown` from `accessor()` is narrowed; no `any`.

### 3.3 Pagination integration

When `pagination` is provided, `<Pagination>` is rendered **outside** the scroll container, in a `<footer class="fw-table-foot">`. The primitive forwards the props 1:1; it does not slice `data` itself.

### 3.4 Loading and empty

- `loading === true`: render `skeletonRows` `<tr>`s, each with `<td>` containing a `<Skeleton variant="rect" height="14px" width="60%" />`. Header still renders so layout doesn't jump.
- `loading !== true && data.length === 0`: render `props.empty` or, by default, `<EmptyState title="Sem dados" description="Nada para mostrar aqui." />`. Inside a single `<tr><td colSpan={columns.length}>` so the table semantics stay valid.

## 4. Visual vocabulary

Reuses kit selectors verbatim where they exist; adds a small CSS layer for the new wrapper / sticky / sortable bits:

- `.fw-table` — kit
- `.fw-table .amt`, `.is-gain`, `.is-loss` — kit (consumer applies via `cell`)
- `.fw-table-wrap` — **new**: scrollable container, `overflow: auto`, `border-radius`, `border: var(--hairline)`
- `.fw-table-sort-btn` — **new**: header button reset; inherits font and cursor
- `.fw-table-sort-icon` — **new**: aligns chevron next to header text
- `.fw-table-sort-idle` — **new**: dual-arrow indicator for inactive sortable columns
- `.fw-table-foot` — **new**: pagination footer row
- `.fw-table-empty` — **new**: empty/loading row alignment

All new rules wrap in `@layer components` per Wave 2's Option C.

## 5. Icon registry change

Add **`chevronUp`** to `src/shared/ui/primitives/Icon/Icon.tsx` (mapped to `lucide-react`'s `ChevronUp`). `chevronDown` is already there from Wave 1.

## 6. Test contract

`Table.test.tsx` asserts:

1. Smoke render with sample data + columns.
2. `sortable` column: clicking a header toggles direction and calls `onSortChange`. Header chevron flips between up/down.
3. `aria-sort` is `"ascending" | "descending" | "none"` on the `<th>`.
4. Loading: `loading` shows N skeleton rows (default 5), no data rows.
5. Empty: `data.length === 0 && !loading` shows the default `<EmptyState>` (or the consumer's `empty` slot).
6. Pagination: when `pagination` is set, `<Pagination>` renders; clicking next calls `onPageChange`.
7. A11y: wrapper has the consumer-provided `aria-label`.
8. Ref forwarding to the wrapper `<div>`.
9. Alignment: `align="right"` produces a `text-align: right` `<td>` (assert via class `fw-table-align-right`).

`@testing-library/react` + `vitest`. No mocks of TanStack Table — exercise the real headless API.

## 7. FSD compliance

- Lives in `src/shared/ui/primitives/Table/`. Imports only from sibling primitives via relative paths with `.js` extensions.
- No domain logic. Money/date formatting is the consumer's responsibility.
- The architecture test (`src/architecture.test.ts`) keeps passing; no new feature→feature edges.

## 8. Files added or modified

```
src/shared/ui/primitives/Table/Table.tsx        (new)
src/shared/ui/primitives/Table/Table.css        (new)
src/shared/ui/primitives/Table/Table.test.tsx   (new)
src/shared/ui/primitives/Table/index.ts         (new)

src/shared/ui/primitives/Icon/Icon.tsx          (modified — add chevronUp)
src/shared/ui/primitives/index.ts               (modified — append Table export)

package.json, package-lock.json                 (modified — add @tanstack/react-table)
```

## 9. Out of scope

- Virtualization (`@tanstack/react-virtual`) — defer.
- Row selection, expanding rows, column reordering, column resizing, grouping, faceted filters.
- Server-driven pagination/sorting helpers — the primitive is already server-aware (consumer controls the state).
- A `<TransactionRow>` style entity-aware cell — that lives in `widgets/` later.
- Storybook surface.

## 10. Acceptance criteria

The wave is done when:

1. `<Table>` is exported from `src/shared/ui/primitives/index.ts` and importable via `import { Table } from "src/shared/ui/primitives"`.
2. `Table.test.tsx` covers the §6 contract and passes.
3. `npm run lint && npm run typecheck && npm test -- --run && npm run build` all pass.
4. The architectural test still passes.
5. `chevronUp` is in the Icon registry.
6. The PR is open against `develop` with CI green.

## 11. Risk register

- **Generic typing through `forwardRef`.** React 19 + TS strict + a generic `T` does not flow through the `forwardRef` factory cleanly. Mitigation: cast the result with `as <T,>(props: TableProps<T> & { ref?: Ref<HTMLDivElement> }) => JSX.Element` and document the pattern. No `any` necessary.
- **`unknown` from `accessor()`** triggers `no-unsafe-*` lints in the comparator. Mitigation: narrow inside the comparator with `typeof` / `instanceof Date` and fall back to `String()` for the residual.
- **Sticky header inside a scroll container** can collide with overflow corners on Safari. Mitigation: keep `border-radius` on the wrapper, not on the table itself, so the rounded corners clip the sticky header naturally.
- **Layout drift between loading and loaded states.** Skeletons must take the same row height as data rows. Mitigation: skeleton `<td>` reuses the table's normal padding; height is set on the inner `<Skeleton>` only.
