# Design System — Wave 6: Table Primitive Implementation Plan

**Goal:** Land a generically-typed `<Table>` primitive that uses `@tanstack/react-table` v8 for headless logic and renders our own `.fw-table*` DOM. Composes existing `<Pagination>`, `<Skeleton>`, `<EmptyState>`, and `<Icon>` primitives.

**Architecture:** Per the Wave 6 spec (`docs/superpowers/specs/2026-04-30-design-system-wave-6-design.md`): `src/shared/ui/primitives/Table/` follows the Wave 2 template — `Table.tsx`, `Table.css` (rules wrapped in `@layer components`), `Table.test.tsx`, `index.ts`. CSS uses the kit's `fw-*` prefix verbatim. `forwardRef` to the outer wrapper. Density behaviour comes from the kit's existing `[data-density="compact"]` rules.

**Tech Stack:** TypeScript strict, React 19, `@tanstack/react-table@8.21.3`, Vitest + `@testing-library/react`.

**Hard prerequisite:** Wave 1, 2, 3 merged into `develop`. `<Pagination>`, `<Skeleton>`, `<EmptyState>`, `<Icon>` exist.

---

### Task 1: Branch and install dependency

- [ ] **Step 1: Branch from develop**

```bash
git switch develop && git pull
git switch -c feature/ds-wave-6-table
```

- [ ] **Step 2: Install `@tanstack/react-table` (pinned)**

```bash
npm install @tanstack/react-table@8.21.3 --save-exact
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(ds): add @tanstack/react-table for wave 6"
```

---

### Task 2: Add `chevronUp` to the Icon registry

- [ ] **Step 1:** Edit `src/shared/ui/primitives/Icon/Icon.tsx` to import `ChevronUp` from `lucide-react` and add `chevronUp: ChevronUp` to the `REGISTRY` object.

- [ ] **Step 2:** Run `npm run typecheck && npm test -- --run src/shared/ui/primitives/Icon`. PASS expected (existing tests don't reference the new entry).

(No commit yet — bundle into the Table commit so the Icon change is justified by the Table consumer.)

---

### Task 3: Author the Table primitive (TDD)

- [ ] **Step 1: Write `Table.test.tsx`** with the §6 test contract (smoke, sortable click, aria-sort, loading skeleton rows, empty state, pagination, aria-label, ref forwarding, alignment class).

- [ ] **Step 2: Run, verify FAIL** (module not found).

- [ ] **Step 3: Write `Table.css`** wrapping rules in `@layer components`. Selectors: `.fw-table-wrap`, `.fw-table-sort-btn`, `.fw-table-sort-icon`, `.fw-table-sort-idle`, `.fw-table-foot`, `.fw-table-empty`, `.fw-table-align-right`, `.fw-table-align-center`. Sticky header: `thead { position: sticky; top: 0; z-index: 1; background: var(--surface-1); }`.

- [ ] **Step 4: Write `Table.tsx`.** Generic `<T>`. Use `useReactTable` from `@tanstack/react-table` with `getCoreRowModel` and `getSortedRowModel`; pass `state.sorting` and `onSortingChange` synced to the consumer's `sort`/`onSortChange`. Define a built-in comparator handling `string | number | Date | null | undefined`. Render `<table>` manually using `table.getHeaderGroups()` for headers and `table.getRowModel().rows` for body. Render the consumer's `cell?(row)` if present, else `String(accessor(row))`.
  - `forwardRef` produces `Table` typed via `as <T,>(props: TableProps<T> & { ref?: Ref<HTMLDivElement> }) => JSX.Element` cast to keep the generic.
  - Loading: render N skeleton rows; header still visible.
  - Empty: single row with `<td colSpan>` containing `props.empty ?? <EmptyState ...>`.
  - Pagination: render `<Pagination>` in `.fw-table-foot` outside the scrollable wrap.

- [ ] **Step 5: Barrel + index**

```ts
// src/shared/ui/primitives/Table/index.ts
export { Table } from "./Table.js";
export type { TableProps, TableColumn } from "./Table.js";
```

Append `export * from "./Table/index.js";` to `src/shared/ui/primitives/index.ts`.

- [ ] **Step 6: Run test to verify it passes**

```bash
npm test -- --run src/shared/ui/primitives/Table/Table.test.tsx
```

- [ ] **Step 7: Lint, typecheck**

```bash
npm run lint && npm run typecheck
```

- [ ] **Step 8: Commit**

```bash
git add src/shared/ui/primitives/Table src/shared/ui/primitives/index.ts src/shared/ui/primitives/Icon/Icon.tsx
git commit -m "feat(ds): add <Table> primitive (TanStack Table headless + custom DOM)"
```

---

### Task 4: Final verification + push + PR

- [ ] **Step 1: Full pipeline**

```bash
npm run lint && npm run typecheck && npm test -- --run && npm run build
```

PASS on all four.

- [ ] **Step 2: Push**

```bash
git push -u origin feature/ds-wave-6-table
```

- [ ] **Step 3: Edit PR title and body** to `feat(ds): wave 6 — Table primitive`. Body lists composition map (Pagination/Skeleton/EmptyState/Icon), TanStack adoption note, Test Plan, "What this does NOT do" (no virtualization, no row selection, etc.).

---

## Acceptance criteria

1. `npm run lint`, `npm run typecheck`, `npm test -- --run`, `npm run build` all pass.
2. `<Table>` exports from `src/shared/ui/primitives/index.ts`.
3. `Table.test.tsx` covers the §6 spec contract.
4. Architecture test still passes.
5. `chevronUp` is in the Icon registry.
