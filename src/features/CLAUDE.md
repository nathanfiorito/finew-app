# `src/features/` — functional units

**Purpose:** vertical slices of behavior — one folder per feature. A feature owns its UI, its hooks/state, and its API calls.

**May import from:** `entities`, `shared`.
**Must NOT import from:** `app`, `pages`, `widgets`, **other features**.

**Slice layout:**

```
features/<feature>/
  ui/        # React components
  model/     # Zustand stores, selectors, custom hooks
  api/       # data-fetching (uses shared/api/client)
  index.ts   # barrel — only this file is part of the public surface
```

**Conventions:**

- Cross-feature composition belongs in `widgets/` or `pages/`, never inside another feature.
- Importing internals (`features/foo/model/store.ts`) from outside the slice is forbidden.
