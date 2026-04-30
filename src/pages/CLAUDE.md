# `src/pages/` — route components

**Purpose:** one folder per route. A page composes widgets/features and is mounted by `app/router.tsx`. Pages should contain almost no business logic — only composition + page-level layout.

**May import from:** `widgets`, `features`, `entities`, `shared`.
**Must NOT import from:** `app`, other `pages`.

**Conventions:**
- Folder per page, e.g. `home/HomePage.tsx`.
- Default export is forbidden — export the named component (`export function HomePage`).
- Page components return `JSX.Element` and take no props (data comes from loaders or hooks).
