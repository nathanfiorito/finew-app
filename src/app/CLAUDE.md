# `src/app/` — composition layer

**Purpose:** wire the application together: providers, the router, global styles. Code that runs once at startup lives here.

**May import from:** `pages`, `widgets`, `features`, `entities`, `shared`.
**Imported by:** only `src/main.tsx`.

**Conventions:**

- One `App.tsx` exporting `App`.
- Provider components in `providers/` are React components named `<XProvider>`.
- Global stylesheet entry: `styles/index.css` (imported by `main.tsx`).
- Do NOT put feature logic here — only composition.
