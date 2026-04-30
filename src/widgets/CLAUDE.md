# `src/widgets/` — composite reusable blocks

**Purpose:** larger UI blocks that compose multiple features/entities and are reused across pages (e.g., a "Balance summary" or a "Top app bar"). Currently empty — added as needed.

**May import from:** `features`, `entities`, `shared`.
**Must NOT import from:** `app`, `pages`, other `widgets`.

**Conventions:**
- One folder per widget. Public surface via `index.ts` barrel.
- A widget is allowed to know about multiple features; a feature must not.
