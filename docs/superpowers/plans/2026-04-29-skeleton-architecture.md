# Skeleton Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the `finew-app` frontend skeleton (Vite 8 + React 19.2 + React Router 7 + Tailwind + TanStack Query + Zustand) following Feature-Sliced Design, with two-layer architectural-boundary enforcement and per-directory `CLAUDE.md` files for Progressive Disclosure.

**Architecture:** SPA PWA, frontend-only repo. Six FSD layers (`app`, `pages`, `widgets`, `features`, `entities`, `shared`) with strict downward-only dependencies. The future Design System will plug into `src/shared/ui/`. Boundary rules are enforced both by `eslint-plugin-boundaries` (fast feedback) and a Vitest test that runs `dependency-cruiser` (inviolable).

**Tech Stack:** Vite 8.0.10, React 19.2, React Router 7, TypeScript 5.6+, Tailwind CSS, vite-plugin-pwa, @tanstack/react-query, Zustand, Vitest + @testing-library/react + jsdom, ESLint 10.2.1 (flat config) + typescript-eslint type-aware preset + eslint-plugin-boundaries + React/hooks/jsx-a11y, dependency-cruiser, Prettier.

**Spec:** `docs/superpowers/specs/2026-04-29-skeleton-architecture-design.md`

**Branch convention:** Implementation runs on a feature branch (e.g., `feature/skeleton-architecture-impl`). The repo blocks direct pushes to `develop`/`main` (see `CLAUDE.md`). The spec already lives on `feature/skeleton-architecture-spec`; create a new branch from `develop` for this work or extend the spec branch — pick one approach and stay consistent.

---

## File map

**Created:**
- `index.html` — Vite entry HTML
- `vite.config.ts` — Vite config (React plugin + PWA plugin)
- `tailwind.config.ts` — Tailwind config consuming CSS vars
- `postcss.config.js` — PostCSS pipeline
- `.prettierrc`, `.prettierignore`
- `.dependency-cruiser.cjs`
- `public/icons/.gitkeep` (real icons added as placeholder later)
- `src/main.tsx`
- `src/architecture.test.ts`
- `src/app/{App.tsx,App.test.tsx,router.tsx,CLAUDE.md}`
- `src/app/providers/{QueryProvider.tsx,ThemeProvider.tsx}`
- `src/app/styles/index.css`
- `src/pages/CLAUDE.md`
- `src/pages/home/HomePage.tsx`
- `src/pages/not-found/NotFoundPage.tsx`
- `src/widgets/CLAUDE.md`, `src/widgets/.gitkeep`
- `src/features/CLAUDE.md`, `src/features/.gitkeep`
- `src/entities/CLAUDE.md`, `src/entities/.gitkeep`
- `src/shared/CLAUDE.md`
- `src/shared/ui/{CLAUDE.md,primitives/.gitkeep}`
- `src/shared/ui/styles/{tokens.css,globals.css}`
- `src/shared/api/{CLAUDE.md,client.ts}`
- `src/shared/lib/{CLAUDE.md,.gitkeep}`
- `src/shared/config/{CLAUDE.md,.gitkeep}`
- `src/shared/types/{CLAUDE.md,.gitkeep}`

**Modified:**
- `package.json` — deps + scripts
- `tsconfig.json` — JSX, types, parser project
- `tsconfig.build.json` — exclude tests
- `eslint.config.js` — type-aware + boundaries + React + a11y + extra typing rules
- `CLAUDE.md` (root) — add Architecture section indexing per-layer files

**Deleted:**
- `src/index.ts`, `src/index.test.ts`

---

## Task 1: Install runtime dependencies and Vite/React scaffolding

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add runtime + dev dependencies**

Run from repo root:

```bash
npm install --save-exact \
  react@19.2.0 react-dom@19.2.0 \
  react-router@7 \
  @tanstack/react-query@^5 \
  zustand@^5
```

```bash
npm install --save-dev --save-exact \
  vite@8.0.10 \
  @vitejs/plugin-react@^5 \
  @types/react@^19 @types/react-dom@^19 \
  vite-plugin-pwa@^0.21 \
  tailwindcss@^4 postcss@^8 autoprefixer@^10 \
  @testing-library/react@^16 @testing-library/jest-dom@^6 \
  jsdom@^25 \
  eslint@10.2.1 \
  eslint-plugin-react@^7 eslint-plugin-react-hooks@^5 eslint-plugin-jsx-a11y@^6 \
  eslint-plugin-boundaries@^5 \
  dependency-cruiser@^16 \
  prettier@^3
```

Note: `@eslint/js`, `typescript-eslint`, `typescript`, `vitest` are already installed (see existing `package.json`). If any version above conflicts, prefer the latest version compatible with `eslint@10.2.1` and `react@19.2.0` (npm will report peer-dep conflicts; resolve by bumping the offending package, not by `--legacy-peer-deps`).

- [ ] **Step 2: Update `package.json` scripts**

Replace the `scripts` block in `package.json` with:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -p tsconfig.build.json && vite build",
    "preview": "vite preview",
    "lint": "eslint . --cache",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "format": "prettier --write ."
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add Vite 8 + React 19.2 + DS skeleton dev/runtime deps"
```

---

## Task 2: Bootstrap Vite entry (`index.html`, `main.tsx`, minimal `App.tsx`)

**Files:**
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx` (temporary minimal version; rewritten in Task 4)
- Modify: `tsconfig.json`

- [ ] **Step 1: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Finew</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Write `vite.config.ts`** (PWA wired in Task 8 — keep minimal here)

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 3: Update `tsconfig.json`** to add JSX and Vite/Vitest types

Set `compilerOptions` to include `"jsx": "react-jsx"`, `"types": ["vite/client", "vitest/globals"]`, and `"lib": ["ES2023", "DOM", "DOM.Iterable"]`. Keep all existing strict flags. Ensure `"include": ["src", "vite.config.ts"]`.

- [ ] **Step 4: Write `src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App.js";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root element in index.html");

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 5: Write minimal `src/app/App.tsx`** (placeholder; replaced in Task 4)

```tsx
export function App(): JSX.Element {
  return <h1>Finew</h1>;
}
```

- [ ] **Step 6: Verify it runs**

Run: `npm run dev`
Expected: Vite serves at `http://localhost:5173/` showing "Finew". Stop with Ctrl-C.

Run: `npm run build`
Expected: build succeeds; `dist/index.html` and JS bundle emitted.

- [ ] **Step 7: Commit**

```bash
git add index.html vite.config.ts tsconfig.json src/main.tsx src/app/App.tsx
git commit -m "feat: scaffold Vite + React entry"
```

---

## Task 3: Replace old skeleton files

**Files:**
- Delete: `src/index.ts`, `src/index.test.ts`
- Modify: `tsconfig.build.json`

- [ ] **Step 1: Delete old entry files**

```bash
git rm src/index.ts src/index.test.ts
```

- [ ] **Step 2: Update `tsconfig.build.json`** to exclude tests and config files

Replace contents:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "noEmit": false
  },
  "include": ["src"],
  "exclude": ["**/*.test.ts", "**/*.test.tsx", "src/architecture.test.ts"]
}
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: PASS (zero errors).

- [ ] **Step 4: Commit**

```bash
git add tsconfig.build.json
git commit -m "chore: remove placeholder src/index.ts and update build tsconfig"
```

---

## Task 4: Add React Router 7 with Home + NotFound routes

**Files:**
- Create: `src/app/router.tsx`
- Create: `src/pages/home/HomePage.tsx`
- Create: `src/pages/not-found/NotFoundPage.tsx`
- Modify: `src/app/App.tsx`

- [ ] **Step 1: Write `src/pages/home/HomePage.tsx`**

```tsx
export function HomePage(): JSX.Element {
  return (
    <main>
      <h1>Finew</h1>
      <p>Personal finance, in progress.</p>
    </main>
  );
}
```

- [ ] **Step 2: Write `src/pages/not-found/NotFoundPage.tsx`**

```tsx
export function NotFoundPage(): JSX.Element {
  return (
    <main>
      <h1>Not found</h1>
    </main>
  );
}
```

- [ ] **Step 3: Write `src/app/router.tsx`**

```tsx
import { createBrowserRouter } from "react-router";
import { HomePage } from "../pages/home/HomePage.js";
import { NotFoundPage } from "../pages/not-found/NotFoundPage.js";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "*", element: <NotFoundPage /> },
]);
```

- [ ] **Step 4: Replace `src/app/App.tsx`**

```tsx
import { RouterProvider } from "react-router";
import { router } from "./router.js";

export function App(): JSX.Element {
  return <RouterProvider router={router} />;
}
```

- [ ] **Step 5: Verify**

Run: `npm run dev` → visit `/` (shows HomePage), `/anything` (shows NotFoundPage). Stop.

- [ ] **Step 6: Commit**

```bash
git add src/app/router.tsx src/app/App.tsx src/pages
git commit -m "feat: wire React Router 7 with Home and NotFound routes"
```

---

## Task 5: Smoke test for App routing

**Files:**
- Create: `src/app/App.test.tsx`
- Modify: `vite.config.ts` (add Vitest config)

- [ ] **Step 1: Add Vitest config** in `vite.config.ts`

Replace contents:

```ts
/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

- [ ] **Step 2: Create `src/test/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Write the failing smoke test**

`src/app/App.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router";
import { HomePage } from "../pages/home/HomePage.js";
import { NotFoundPage } from "../pages/not-found/NotFoundPage.js";

function renderAt(path: string): void {
  const router = createMemoryRouter(
    [
      { path: "/", element: <HomePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
}

describe("App routing", () => {
  it("renders HomePage at /", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { name: /finew/i })).toBeInTheDocument();
  });

  it("renders NotFoundPage on unknown route", () => {
    renderAt("/does-not-exist");
    expect(screen.getByRole("heading", { name: /not found/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run tests**

Run: `npm test -- --run`
Expected: PASS — 2/2 tests green.

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts src/test/setup.ts src/app/App.test.tsx
git commit -m "test: add App routing smoke tests"
```

---

## Task 6: Tailwind + CSS variables tokens scaffolding

**Files:**
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `src/shared/ui/styles/tokens.css`
- Create: `src/shared/ui/styles/globals.css`
- Create: `src/app/styles/index.css`
- Modify: `src/main.tsx`

- [ ] **Step 1: `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 2: `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        fg: "var(--color-fg)",
        accent: "var(--color-accent)",
      },
      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
      },
    },
  },
} satisfies Config;
```

- [ ] **Step 3: `src/shared/ui/styles/tokens.css`** (placeholder values; the DS wave overwrites them)

```css
:root {
  --color-bg: #ffffff;
  --color-fg: #111111;
  --color-accent: #2563eb;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;

  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;

  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

[data-theme="dark"] {
  --color-bg: #0b0b0c;
  --color-fg: #f5f5f5;
  --color-accent: #60a5fa;
}
```

- [ ] **Step 4: `src/shared/ui/styles/globals.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body,
#root {
  height: 100%;
  margin: 0;
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-fg);
}
```

- [ ] **Step 5: `src/app/styles/index.css`** — single import surface

```css
@import "../../shared/ui/styles/tokens.css";
@import "../../shared/ui/styles/globals.css";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 6: Import the stylesheet in `src/main.tsx`**

Add as the first import (before `App`):

```tsx
import "./app/styles/index.css";
```

- [ ] **Step 7: Verify**

Run: `npm run dev` → confirm the page renders with the system font and white background; toggling `data-theme="dark"` on `<html>` in DevTools flips colors. Stop.
Run: `npm run build`
Expected: PASS.
Run: `npm test -- --run`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add tailwind.config.ts postcss.config.js src/shared/ui/styles src/app/styles src/main.tsx
git commit -m "feat: wire Tailwind with CSS-variable tokens"
```

---

## Task 7: TanStack Query + Theme providers and shared API client

**Files:**
- Create: `src/app/providers/QueryProvider.tsx`
- Create: `src/app/providers/ThemeProvider.tsx`
- Create: `src/shared/api/client.ts`
- Modify: `src/app/App.tsx`

- [ ] **Step 1: `src/app/providers/QueryProvider.tsx`**

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }): JSX.Element {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

- [ ] **Step 2: `src/app/providers/ThemeProvider.tsx`** (Zustand store + side-effect on `<html>`)

```tsx
import { useEffect, type ReactNode } from "react";
import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",
  setTheme: (theme) => set({ theme }),
}));

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.dataset["theme"] = theme;
  }, [theme]);
  return <>{children}</>;
}
```

- [ ] **Step 3: `src/shared/api/client.ts`**

```ts
const baseUrl = import.meta.env.VITE_API_URL ?? "";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const response = await fetch(`${baseUrl}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}
```

- [ ] **Step 4: Update `src/app/App.tsx`** to wrap providers

```tsx
import { RouterProvider } from "react-router";
import { router } from "./router.js";
import { QueryProvider } from "./providers/QueryProvider.js";
import { ThemeProvider } from "./providers/ThemeProvider.js";

export function App(): JSX.Element {
  return (
    <QueryProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryProvider>
  );
}
```

- [ ] **Step 5: Verify**

Run: `npm test -- --run` (smoke still passes — providers are transparent)
Run: `npm run typecheck`
Expected: both PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/providers src/shared/api/client.ts src/app/App.tsx
git commit -m "feat: add Query and Theme providers and shared fetch client"
```

---

## Task 8: PWA via vite-plugin-pwa

**Files:**
- Modify: `vite.config.ts`
- Create: `public/icons/.gitkeep`

- [ ] **Step 1: Add `.gitkeep`**

```bash
mkdir -p public/icons
touch public/icons/.gitkeep
```

- [ ] **Step 2: Update `vite.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Finew",
        short_name: "Finew",
        description: "Personal finance management",
        theme_color: "#0b0b0c",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [],
      },
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

(Real icons added in a future wave; the empty `icons` array is intentional and acceptable to the plugin during dev/build.)

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: PASS; `dist/sw.js` and `dist/manifest.webmanifest` exist.

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts public/icons/.gitkeep
git commit -m "feat: enable PWA via vite-plugin-pwa"
```

---

## Task 9: Create FSD layer directories with `.gitkeep`

**Files:**
- Create: `src/widgets/.gitkeep`
- Create: `src/features/.gitkeep`
- Create: `src/entities/.gitkeep`
- Create: `src/shared/lib/.gitkeep`
- Create: `src/shared/config/.gitkeep`
- Create: `src/shared/types/.gitkeep`
- Create: `src/shared/ui/primitives/.gitkeep`

- [ ] **Step 1: Create empty layer directories**

```bash
mkdir -p src/widgets src/features src/entities \
         src/shared/lib src/shared/config src/shared/types \
         src/shared/ui/primitives
touch src/widgets/.gitkeep src/features/.gitkeep src/entities/.gitkeep \
      src/shared/lib/.gitkeep src/shared/config/.gitkeep src/shared/types/.gitkeep \
      src/shared/ui/primitives/.gitkeep
```

- [ ] **Step 2: Commit**

```bash
git add src/widgets src/features src/entities src/shared/lib src/shared/config src/shared/types src/shared/ui/primitives
git commit -m "chore: scaffold empty FSD layer directories"
```

---

## Task 10: Per-directory `CLAUDE.md` files (Progressive Disclosure)

**Files:**
- Create: `src/app/CLAUDE.md`
- Create: `src/pages/CLAUDE.md`
- Create: `src/widgets/CLAUDE.md`
- Create: `src/features/CLAUDE.md`
- Create: `src/entities/CLAUDE.md`
- Create: `src/shared/CLAUDE.md`
- Create: `src/shared/ui/CLAUDE.md`
- Create: `src/shared/api/CLAUDE.md`
- Create: `src/shared/lib/CLAUDE.md`
- Create: `src/shared/config/CLAUDE.md`
- Create: `src/shared/types/CLAUDE.md`

- [ ] **Step 1: `src/app/CLAUDE.md`**

```markdown
# `src/app/` — composition layer

**Purpose:** wire the application together: providers, the router, global styles. Code that runs once at startup lives here.

**May import from:** `pages`, `widgets`, `features`, `entities`, `shared`.
**Imported by:** only `src/main.tsx`.

**Conventions:**
- One `App.tsx` exporting `App`.
- Provider components in `providers/` are React components named `<XProvider>`.
- Global stylesheet entry: `styles/index.css` (imported by `main.tsx`).
- Do NOT put feature logic here — only composition.
```

- [ ] **Step 2: `src/pages/CLAUDE.md`**

```markdown
# `src/pages/` — route components

**Purpose:** one folder per route. A page composes widgets/features and is mounted by `app/router.tsx`. Pages should contain almost no business logic — only composition + page-level layout.

**May import from:** `widgets`, `features`, `entities`, `shared`.
**Must NOT import from:** `app`, other `pages`.

**Conventions:**
- Folder per page, e.g. `home/HomePage.tsx`.
- Default export is forbidden — export the named component (`export function HomePage`).
- Page components return `JSX.Element` and take no props (data comes from loaders or hooks).
```

- [ ] **Step 3: `src/widgets/CLAUDE.md`**

```markdown
# `src/widgets/` — composite reusable blocks

**Purpose:** larger UI blocks that compose multiple features/entities and are reused across pages (e.g., a "Balance summary" or a "Top app bar"). Currently empty — added as needed.

**May import from:** `features`, `entities`, `shared`.
**Must NOT import from:** `app`, `pages`, other `widgets`.

**Conventions:**
- One folder per widget. Public surface via `index.ts` barrel.
- A widget is allowed to know about multiple features; a feature must not.
```

- [ ] **Step 4: `src/features/CLAUDE.md`**

```markdown
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
```

- [ ] **Step 5: `src/entities/CLAUDE.md`**

```markdown
# `src/entities/` — domain models

**Purpose:** representations of domain concepts (e.g., `Account`, `Transaction`, `Budget`) — types, schemas, basic UI atoms tied to the entity (e.g., `<TransactionRow>`).

**May import from:** `shared`.
**Must NOT import from:** `app`, `pages`, `widgets`, `features`, other entities.

**Conventions:**
- One folder per entity. Public surface via `index.ts`.
- No HTTP calls here — those belong in features or shared/api.
```

- [ ] **Step 6: `src/shared/CLAUDE.md`**

```markdown
# `src/shared/` — leaf layer

**Purpose:** generic, domain-agnostic building blocks: UI primitives, helpers, the API client, configuration, and shared types.

**May import from:** only other `shared/*` subfolders.
**Imported by:** every other layer.

**Subfolders:**
- `ui/`       — design-system surface (tokens, primitives, styles)
- `api/`      — HTTP client and shared request types
- `lib/`      — pure helpers (formatting, classnames, date utils)
- `config/`   — environment, feature flags, constants
- `types/`    — cross-cutting TypeScript types

**Conventions:**
- Nothing here may know about a feature or entity. If it does, move it.
```

- [ ] **Step 7: `src/shared/ui/CLAUDE.md`**

```markdown
# `src/shared/ui/` — design-system surface

**Purpose:** the place the future Design System plugs into. Today it hosts CSS-variable tokens, global styles, and an empty `primitives/` folder for reusable UI components (Button, Input, etc.).

**Conventions:**
- Tokens are CSS custom properties in `styles/tokens.css`. Tailwind reads them via `tailwind.config.ts`.
- Theme switching: `[data-theme="dark"]` on `<html>` is owned by `app/providers/ThemeProvider.tsx`.
- Primitives must be presentational — no domain knowledge, no API calls, no Zustand stores.
- Export every primitive via the folder's `index.ts`.
```

- [ ] **Step 8: `src/shared/api/CLAUDE.md`**

```markdown
# `src/shared/api/` — HTTP transport

**Purpose:** thin, typed `fetch` wrapper used by features. Base URL via `import.meta.env.VITE_API_URL`.

**Conventions:**
- One generic `request<T>` function. Auth, retries, interceptors are added here when needed — never duplicated across features.
- Do not import feature/entity types here; this layer is domain-agnostic.
```

- [ ] **Step 9: `src/shared/lib/CLAUDE.md`**

```markdown
# `src/shared/lib/` — pure helpers

**Purpose:** small, pure utilities (e.g., `cn` for classnames, money/date formatters). No React state, no DOM access, no network.

**Conventions:**
- Each helper lives in its own file and is exported by name.
- Side-effect-free; trivially unit-testable.
```

- [ ] **Step 10: `src/shared/config/CLAUDE.md`**

```markdown
# `src/shared/config/` — environment and constants

**Purpose:** central place for env-derived values and project-wide constants. Read `import.meta.env` here, validate, and export typed values.

**Conventions:**
- No conditional logic depending on the environment elsewhere — read the typed config from this folder.
```

- [ ] **Step 11: `src/shared/types/CLAUDE.md`**

```markdown
# `src/shared/types/` — cross-cutting TypeScript types

**Purpose:** types reused across multiple layers that don't belong to any single entity (e.g., `Result<T, E>`, branded primitives).

**Conventions:**
- Types only — no runtime code.
```

- [ ] **Step 12: Commit**

```bash
git add src/**/CLAUDE.md
git commit -m "docs: add per-layer CLAUDE.md (Progressive Disclosure)"
```

---

## Task 11: Update root `CLAUDE.md` with Architecture index

**Files:**
- Modify: `CLAUDE.md` (root)

- [ ] **Step 1: Append a new "Architecture" section** to the root `CLAUDE.md`, just below the existing "Branching and merging" section. Insert verbatim:

```markdown
## Architecture (Feature-Sliced Design)

The frontend is organized in six layers. Dependencies flow downward only — a layer may import from any layer **below** it, never sideways or upward.

| Layer        | Purpose                              | May import from                                   |
|--------------|--------------------------------------|---------------------------------------------------|
| `app/`       | composition, router, providers       | pages, widgets, features, entities, shared       |
| `pages/`     | routes; compose widgets/features     | widgets, features, entities, shared              |
| `widgets/`   | composite reusable blocks            | features, entities, shared                        |
| `features/`  | functional units (slices)            | entities, shared (NOT other features)             |
| `entities/`  | domain models                        | shared                                            |
| `shared/`    | generic building blocks (DS lives here) | shared only                                    |

Each layer has its own `CLAUDE.md` describing its rules and conventions:

- [`src/app/CLAUDE.md`](src/app/CLAUDE.md)
- [`src/pages/CLAUDE.md`](src/pages/CLAUDE.md)
- [`src/widgets/CLAUDE.md`](src/widgets/CLAUDE.md)
- [`src/features/CLAUDE.md`](src/features/CLAUDE.md)
- [`src/entities/CLAUDE.md`](src/entities/CLAUDE.md)
- [`src/shared/CLAUDE.md`](src/shared/CLAUDE.md)
  - [`src/shared/ui/CLAUDE.md`](src/shared/ui/CLAUDE.md) — Design-System surface
  - [`src/shared/api/CLAUDE.md`](src/shared/api/CLAUDE.md)
  - [`src/shared/lib/CLAUDE.md`](src/shared/lib/CLAUDE.md)
  - [`src/shared/config/CLAUDE.md`](src/shared/config/CLAUDE.md)
  - [`src/shared/types/CLAUDE.md`](src/shared/types/CLAUDE.md)

Architectural boundaries are enforced by **two** layers (do not bypass either):

1. **`eslint-plugin-boundaries`** in `eslint.config.js` — fast feedback in editor and `npm run lint`.
2. **`dependency-cruiser`** run by `src/architecture.test.ts` (Vitest) — inviolable, no inline-disable.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add Architecture index to root CLAUDE.md"
```

---

## Task 12: ESLint flat config — type-aware preset, React, hooks, a11y, typing rigor

**Files:**
- Modify: `eslint.config.js`

- [ ] **Step 1: Replace `eslint.config.js` contents**

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "coverage/**"] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "src/test/**"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
);
```

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: PASS. If failures appear in existing skeleton files, fix them inline (e.g., add explicit return types). Do NOT introduce inline `// eslint-disable` comments unless absolutely necessary.

- [ ] **Step 3: Commit**

```bash
git add eslint.config.js
git commit -m "feat(lint): type-aware ESLint with React, hooks, a11y, and typing-rigor rules"
```

---

## Task 13: Add `eslint-plugin-boundaries` rules (Layer A enforcement)

**Files:**
- Modify: `eslint.config.js`

- [ ] **Step 1: Add the boundaries plugin to the existing config block**

In `eslint.config.js`, add `import boundaries from "eslint-plugin-boundaries";` at the top, then add the following block to the `tseslint.config(...)` call (after the React block, before the test override):

```js
{
  files: ["src/**/*.{ts,tsx}"],
  plugins: { boundaries },
  settings: {
    "boundaries/elements": [
      { type: "app",      pattern: "src/app/*" },
      { type: "pages",    pattern: "src/pages/*" },
      { type: "widgets",  pattern: "src/widgets/*" },
      { type: "features", pattern: "src/features/*" },
      { type: "entities", pattern: "src/entities/*" },
      { type: "shared",   pattern: "src/shared/*" },
    ],
  },
  rules: {
    "boundaries/element-types": ["error", {
      default: "disallow",
      rules: [
        { from: "app",      allow: ["pages", "widgets", "features", "entities", "shared"] },
        { from: "pages",    allow: ["widgets", "features", "entities", "shared"] },
        { from: "widgets",  allow: ["features", "entities", "shared"] },
        { from: "features", allow: ["entities", "shared"] },
        { from: "entities", allow: ["shared"] },
        { from: "shared",   allow: ["shared"] },
      ],
    }],
    "boundaries/no-private": "error",
  },
},
```

- [ ] **Step 2: Sanity-check by introducing a deliberate violation**

Temporarily edit `src/pages/home/HomePage.tsx` to add an import that should fail (a from-feature import). Since `features/` is empty, instead test the inverse: edit `src/shared/ui/styles/globals.css`'s adjacent — actually simplest: edit `src/app/router.tsx` to also import from a sibling `pages` route reaching upward. Quick alternative: create a temporary file `src/features/__sanity__.ts`:

```ts
import { HomePage } from "../../pages/home/HomePage.js";
export const x = HomePage;
```

Run: `npm run lint`
Expected: ERROR — boundary violation reported on this import (`features` is not allowed to import from `pages`).

Delete the temporary file:

```bash
rm src/features/__sanity__.ts
```

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add eslint.config.js
git commit -m "feat(lint): enforce FSD layer boundaries via eslint-plugin-boundaries"
```

---

## Task 14: dependency-cruiser config + architectural test (Layer B enforcement)

**Files:**
- Create: `.dependency-cruiser.cjs`
- Create: `src/architecture.test.ts`

- [ ] **Step 1: `.dependency-cruiser.cjs`**

```js
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Circular dependencies are forbidden.",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-orphans",
      severity: "warn",
      comment: "Module is not imported anywhere and is not an entry point.",
      from: {
        orphan: true,
        pathNot: [
          "(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$",
          "\\.d\\.ts$",
          "(^|/)tsconfig\\.json$",
          "(^|/)src/main\\.tsx$",
          "(^|/)src/architecture\\.test\\.ts$",
          "(^|/)src/test/setup\\.ts$",
          "\\.test\\.(ts|tsx)$",
          "\\.css$",
        ],
      },
      to: {},
    },
    {
      name: "fsd-layer-deps",
      severity: "error",
      comment: "FSD: a layer may only import from layers below it.",
      from: { path: "^src/(app|pages|widgets|features|entities|shared)/" },
      to: {
        path: "^src/(app|pages|widgets|features|entities|shared)/",
        pathNot: "^src/$1/",
      },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
  },
};
```

The `fsd-layer-deps` rule above is a coarse "no cross-layer that isn't a strict subset" check. Refine in the test file with explicit per-layer rules so violations have actionable messages.

- [ ] **Step 2: `src/architecture.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { cruise, type IReporterOutput } from "dependency-cruiser";

const allowedFromTo: Record<string, ReadonlyArray<string>> = {
  app: ["app", "pages", "widgets", "features", "entities", "shared"],
  pages: ["pages", "widgets", "features", "entities", "shared"],
  widgets: ["widgets", "features", "entities", "shared"],
  features: ["features", "entities", "shared"],
  entities: ["entities", "shared"],
  shared: ["shared"],
};

const layerOf = (modulePath: string): string | null => {
  const match = /^src\/(app|pages|widgets|features|entities|shared)\b/.exec(modulePath);
  return match ? match[1] ?? null : null;
};

describe("Architecture boundaries", (): void => {
  it("respects FSD layer dependencies and has no cycles", async (): Promise<void> => {
    const result: IReporterOutput = await cruise(
      ["src"],
      { tsConfig: { fileName: "tsconfig.json" }, tsPreCompilationDeps: true },
    );
    const output = typeof result.output === "string" ? JSON.parse(result.output) : result.output;

    const violations: string[] = [];

    for (const mod of output.modules ?? []) {
      const fromLayer = layerOf(mod.source);
      if (fromLayer === null) continue;

      // Forbid sibling-slice imports inside features (feature → other feature).
      if (fromLayer === "features") {
        const fromSlice = mod.source.split("/").slice(0, 3).join("/"); // src/features/<slice>
        for (const dep of mod.dependencies ?? []) {
          if (dep.module.startsWith("src/features/")) {
            const toSlice = dep.resolved.split("/").slice(0, 3).join("/");
            if (toSlice !== fromSlice) {
              violations.push(
                `feature→feature: ${mod.source} imports ${dep.resolved} (sibling slice ${toSlice})`,
              );
            }
          }
        }
      }

      for (const dep of mod.dependencies ?? []) {
        const toLayer = layerOf(dep.resolved);
        if (toLayer === null) continue;
        const allowed = allowedFromTo[fromLayer] ?? [];
        if (!allowed.includes(toLayer)) {
          violations.push(`layer: ${mod.source} (${fromLayer}) → ${dep.resolved} (${toLayer}) is forbidden`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
```

- [ ] **Step 3: Run the architectural test**

Run: `npm test -- --run src/architecture.test.ts`
Expected: PASS — empty violations array.

- [ ] **Step 4: Sanity-check the test catches violations**

Add a deliberate violation: create `src/entities/__bad__.ts`:

```ts
import { HomePage } from "../pages/home/HomePage.js";
export const x: typeof HomePage = HomePage;
```

Run: `npm test -- --run src/architecture.test.ts`
Expected: FAIL — violation reported (`entities → pages` not allowed).

Delete the file:

```bash
rm src/entities/__bad__.ts
```

Run: `npm test -- --run src/architecture.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add .dependency-cruiser.cjs src/architecture.test.ts
git commit -m "test(arch): enforce FSD boundaries via dependency-cruiser in Vitest"
```

---

## Task 15: Prettier and final acceptance run

**Files:**
- Create: `.prettierrc`
- Create: `.prettierignore`

- [ ] **Step 1: `.prettierrc`**

```json
{
  "printWidth": 100,
  "singleQuote": false,
  "trailingComma": "all",
  "semi": true,
  "arrowParens": "always"
}
```

- [ ] **Step 2: `.prettierignore`**

```
dist
node_modules
coverage
*.lock
package-lock.json
```

- [ ] **Step 3: Format**

Run: `npm run format`
Expected: files reformatted in place; no errors.

- [ ] **Step 4: Run full acceptance suite**

```bash
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

All four must PASS.

- [ ] **Step 5: Acceptance §9.6 — deliberate cross-feature violation must fail BOTH checkers**

Create `src/features/__a__/index.ts`:

```ts
export const a = "a";
```

Create `src/features/__b__/index.ts`:

```ts
import { a } from "../__a__/index.js";
export const b = a;
```

Run: `npm run lint`
Expected: FAIL — `boundaries/element-types` error on the cross-feature import.

Run: `npm test -- --run src/architecture.test.ts`
Expected: FAIL — `feature→feature` violation listed.

Delete:

```bash
rm -rf src/features/__a__ src/features/__b__
```

Re-run:

```bash
npm run lint
npm test -- --run
```

Expected: both PASS.

- [ ] **Step 6: Commit**

```bash
git add .prettierrc .prettierignore
git commit -m "chore: add Prettier configuration"
```

(If `npm run format` modified files, include them in this commit or a follow-up `style: prettier formatting` commit.)

---

## Task 16: Push branch and open PR

- [ ] **Step 1: Push**

```bash
git push -u origin <branch-name>
```

The CI auto-PR job (per `guardrails-design.md`) opens a PR to `develop`. Verify CI passes (`lint`, `typecheck`, `test`, `build`).

- [ ] **Step 2: Polish PR title**

Ensure the PR title matches Conventional Commits, e.g.: `feat: bootstrap FSD frontend skeleton with boundary enforcement`. Squash-merge when green.

---

## Self-review notes

Spec coverage check:
- §2 stack — Tasks 1, 2, 4, 6, 7, 8 ✓
- §3 directory layout — Tasks 2, 4, 6, 7, 9 ✓
- §3.1 layer rules — Tasks 13, 14 ✓
- §3.2 per-directory `CLAUDE.md` — Tasks 10, 11 ✓
- §4 lint config (type-aware + extra typing rules) — Task 12 ✓
- §4.3 boundaries plugin — Task 13 ✓
- §5 dependency-cruiser test — Task 14 ✓
- §6 smoke test — Task 5 ✓
- §6 (optional tokens test) — intentionally omitted (spec marks it optional)
- §7 file lists — covered across tasks ✓
- §9.1 dev — Task 2/4/6 manual checks ✓
- §9.2 build — Task 8/15 ✓
- §9.3 lint — Task 12/13/15 ✓
- §9.4 typecheck — Task 3/15 ✓
- §9.5 tests — Task 5/14/15 ✓
- §9.6 violation rejected by both layers — Task 15 step 5 ✓
- §9.7 per-layer CLAUDE.md — Task 10 ✓
- §9.8 root CLAUDE.md links — Task 11 ✓
