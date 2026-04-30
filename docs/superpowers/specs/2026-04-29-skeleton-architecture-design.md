# Skeleton Architecture Design

**Date:** 2026-04-29
**Status:** Approved (pending user review of this document)
**Scope:** Bootstrap the `finew-app` frontend skeleton with an architectural pattern (Feature-Sliced Design) and automated boundary enforcement, so a design system can be plugged in cleanly in a later iteration.

## 1. Context and goals

`finew-app` will be a personal-finance management web app, mobile-first PWA with full desktop parity, frontend-only in this repository (backend lives elsewhere or will be added in a separate repo). Today the repo is a near-empty TypeScript ESM project with a single `src/index.ts`. The repository-wide tooling (CI, rulesets, branch flow) is already in place per `2026-04-29-guardrails-design.md`.

The goal of this spec is **not** to build the design system, and **not** to ship features. It is to:

1. Pick a frontend stack (framework, styling, state, data).
2. Lay down the directory skeleton following Feature-Sliced Design (FSD).
3. Wire two layers of automated checks that enforce architectural boundaries between layers, so the structure cannot erode silently.
4. Reserve the right "slots" where the future design system will be plugged in (`src/shared/ui/`).
5. Adopt **per-directory `CLAUDE.md`** files for Progressive Disclosure: each layer documents its own rules locally, and the root `CLAUDE.md` indexes them.

Out of scope for this wave: authentication, real design tokens / DS components, MSW mocks, Storybook, i18n, error tracking, server-side rendering.

## 2. Stack decisions

| Concern | Choice | Rationale |
|---|---|---|
| Build tool | **Vite 8.0.10** | Fastest DX for SPA; first-class PWA via `vite-plugin-pwa`. |
| UI library | **React 19.2** | Latest stable; matches React Router 7 expectations. |
| Routing | **React Router 7** (library mode) | Use `createBrowserRouter` with optional loaders; no framework mode (we are not using Remix-style server data here). |
| PWA | **vite-plugin-pwa** (Workbox) | Standard PWA pipeline: manifest, service worker, icons. |
| Styling | **Tailwind CSS** + **CSS variables** | Tokens live as CSS vars under `src/shared/ui/styles/tokens.css`; Tailwind consumes them via `theme.extend`. Theme switching via `[data-theme="dark"]`. The future DS only needs to populate token values. |
| Server state | **@tanstack/react-query** | Cache, fetch, invalidation. Provider in `src/app/providers/`. |
| Client state | **Zustand** | One store per feature in `features/<x>/model/`. |
| HTTP client | Thin `fetch` wrapper in `src/shared/api/client.ts`, base URL via `import.meta.env.VITE_API_URL`. | No backend yet, but the extension point exists. |
| Test runner | **Vitest** + **@testing-library/react** + **jsdom** | Vitest already present. |
| Linting | ESLint 9 (flat config) — type-aware preset + boundary rules + extra typing rules (see §4). | |
| Formatter | **Prettier**. | |

Pinned versions are illustrative; the implementation plan will pin exact compatible versions at install time.

## 3. Directory layout (FSD)

```
finew-app/
├── CLAUDE.md                         # root: indexes per-layer CLAUDE.md files
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── public/
│   └── icons/                        # PWA icons (placeholders)
├── src/
│   ├── main.tsx                      # entrypoint: renders <App/>
│   ├── app/                          # layer 1 — global composition
│   │   ├── CLAUDE.md
│   │   ├── App.tsx                   # <RouterProvider/>
│   │   ├── router.tsx                # createBrowserRouter, lazy imports
│   │   ├── providers/
│   │   │   ├── QueryProvider.tsx
│   │   │   └── ThemeProvider.tsx     # toggles data-theme=light|dark
│   │   └── styles/
│   │       └── index.css             # @tailwind + import tokens.css
│   ├── pages/                        # layer 2 — routes; compose widgets/features
│   │   ├── CLAUDE.md
│   │   ├── home/HomePage.tsx
│   │   └── not-found/NotFoundPage.tsx
│   ├── widgets/                      # layer 3 — composite reusable blocks
│   │   └── CLAUDE.md                 # empty body for now
│   ├── features/                     # layer 4 — functional units
│   │   └── CLAUDE.md                 # empty body for now
│   ├── entities/                     # layer 5 — domain models
│   │   └── CLAUDE.md                 # empty body for now
│   └── shared/                       # layer 6 — leaf; nothing imports upward
│       ├── CLAUDE.md
│       ├── ui/                       # entry point of the future Design System
│       │   ├── CLAUDE.md
│       │   ├── styles/
│       │   │   ├── tokens.css        # CSS vars (placeholder names, no values)
│       │   │   └── globals.css
│       │   └── primitives/           # empty now; Button/Input/etc. later
│       ├── api/
│       │   ├── CLAUDE.md
│       │   └── client.ts             # typed fetch wrapper
│       ├── lib/
│       │   └── CLAUDE.md             # pure helpers (cn, formatters, ...)
│       ├── config/
│       │   └── CLAUDE.md             # env, constants
│       └── types/
│           └── CLAUDE.md             # shared types
├── .dependency-cruiser.cjs           # rules mirrored from §3.1; see §5
└── docs/superpowers/{specs,plans}/
```

### 3.1 Layer dependency rules

Allowed import direction (each layer can import from any layer **below** it; never sideways or upward):

| From ↓ / Allowed ↓ | app | pages | widgets | features | entities | shared |
|---|---|---|---|---|---|---|
| **app**      | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| **pages**    | ✗ | — | ✓ | ✓ | ✓ | ✓ |
| **widgets**  | ✗ | ✗ | — | ✓ | ✓ | ✓ |
| **features** | ✗ | ✗ | ✗ | — (sibling features forbidden) | ✓ | ✓ |
| **entities** | ✗ | ✗ | ✗ | ✗ | — | ✓ |
| **shared**   | ✗ | ✗ | ✗ | ✗ | ✗ | — (intra-shared OK) |

Notably: **feature → feature imports are forbidden**. Cross-feature composition happens at `widgets/` or `pages/`.

Within each layer, slices (e.g., `features/transactions`) expose only via their `index.ts` barrel. Importing internals (`features/transactions/model/store.ts` from outside the slice) is forbidden.

### 3.2 Per-directory `CLAUDE.md` (Progressive Disclosure)

Each directory listed above gets a small `CLAUDE.md` covering:
- The layer's purpose in one sentence.
- Its allowed dependencies (mirroring §3.1).
- The local code style (slice layout, barrel rule, naming).

The root `CLAUDE.md` gains an "Architecture" section that lists the layers and links to the per-layer files. The intent is that Claude Code, when working inside `src/features/transactions/`, only needs to load that directory's `CLAUDE.md` (plus the root) to know the rules.

## 4. Lint configuration

### 4.1 Type-aware base

Replace the current `@eslint/js` + `typescript-eslint` "recommended" with the type-aware presets, requiring `parserOptions.project: true`:

- `tseslint.configs.strictTypeChecked`
- `tseslint.configs.stylisticTypeChecked`

Enable additional rules to enforce explicit typing on variables and function boundaries:

| Rule | Level | Notes |
|---|---|---|
| `@typescript-eslint/no-explicit-any` | error | |
| `@typescript-eslint/no-unsafe-argument` | error | |
| `@typescript-eslint/no-unsafe-assignment` | error | |
| `@typescript-eslint/no-unsafe-call` | error | |
| `@typescript-eslint/no-unsafe-member-access` | error | |
| `@typescript-eslint/no-unsafe-return` | error | |
| `@typescript-eslint/explicit-module-boundary-types` | error | exported function/component signatures must be annotated |
| `@typescript-eslint/explicit-function-return-type` | error | `{ allowExpressions: true }` so inline arrow callbacks/JSX handlers stay terse |
| `@typescript-eslint/consistent-type-imports` | error | aligns with `verbatimModuleSyntax` |
| `@typescript-eslint/no-non-null-assertion` | error | |
| `@typescript-eslint/no-floating-promises` | error | |
| `@typescript-eslint/await-thenable` | error | |

Test files (`*.test.ts(x)`) get a relaxed override that turns off `explicit-function-return-type` and `explicit-module-boundary-types` to keep test code readable.

Performance: type-aware linting is slower; the `lint` script enables ESLint cache.

### 4.2 React-specific rules

Add `eslint-plugin-react` (recommended), `eslint-plugin-react-hooks` (recommended), and `eslint-plugin-jsx-a11y` (recommended). React 19 settings; the new JSX transform means `react/react-in-jsx-scope` is off.

### 4.3 Boundary rules (Layer A enforcement)

`eslint-plugin-boundaries`:

```js
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
      { from: "app",      allow: ["pages","widgets","features","entities","shared"] },
      { from: "pages",    allow: ["widgets","features","entities","shared"] },
      { from: "widgets",  allow: ["features","entities","shared"] },
      { from: "features", allow: ["entities","shared"] },
      { from: "entities", allow: ["shared"] },
      { from: "shared",   allow: ["shared"] },
    ],
  }],
  "boundaries/no-private": "error",
}
```

This catches violations during `npm run lint` (and in IDE) — fast feedback, but bypassable with inline disable comments.

## 5. Architectural test (Layer B enforcement)

Because ESLint can be locally disabled, a Vitest test runs `dependency-cruiser` programmatically and fails on any violation — **no inline-disable escape hatch**. This is the inviolable line of defense.

- Config: `.dependency-cruiser.cjs` mirrors the rules in §3.1, plus a `no-orphans` rule and a `no-circular` rule.
- Test: `src/architecture.test.ts` invokes `cruise(['src'], options)`, asserts `result.summary.violations` is empty, and prints offending modules on failure.

Both layers must pass on CI for a PR to merge (CI already runs `lint`, `typecheck`, `test`, `build` per `guardrails-design.md`).

## 6. Smoke test

`src/app/App.test.tsx` renders `<App/>` inside a `MemoryRouter` (or with `createMemoryRouter` if using the React Router 7 data API) and asserts:

1. Route `/` shows `HomePage` content.
2. Route `/does-not-exist` shows `NotFoundPage` content.

This is a wiring test, not a feature test — it proves `main.tsx → providers → router → page` is connected.

Optionally, `src/shared/ui/styles/tokens.test.ts` reads `tokens.css` and asserts that the agreed list of custom properties (`--color-bg`, `--color-fg`, `--color-accent`, `--space-1..6`, `--radius-sm|md|lg`, `--font-sans`) is declared. This guards the contract the future DS will fill in.

## 7. Files added or changed

**New files**
- `index.html`, `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`
- `public/icons/` (placeholder icons)
- `src/main.tsx`
- `src/app/{App.tsx,router.tsx,App.test.tsx,CLAUDE.md}`
- `src/app/providers/{QueryProvider.tsx,ThemeProvider.tsx}`
- `src/app/styles/index.css`
- `src/pages/{CLAUDE.md,home/HomePage.tsx,not-found/NotFoundPage.tsx}`
- `src/widgets/CLAUDE.md`
- `src/features/CLAUDE.md`
- `src/entities/CLAUDE.md`
- `src/shared/CLAUDE.md`
- `src/shared/ui/{CLAUDE.md,styles/tokens.css,styles/globals.css,primitives/.gitkeep}`
- `src/shared/api/{CLAUDE.md,client.ts}`
- `src/shared/lib/CLAUDE.md`
- `src/shared/config/CLAUDE.md`
- `src/shared/types/CLAUDE.md`
- `src/architecture.test.ts`
- `.dependency-cruiser.cjs`
- `.prettierrc` (and `.prettierignore`)

**Modified files**
- `eslint.config.js` — type-aware preset, `eslint-plugin-boundaries`, React plugins, type-rigor rules.
- `tsconfig.json` — add `"jsx": "react-jsx"`, `"types": ["vite/client", "vitest/globals"]`, ensure `parserOptions.project` works.
- `tsconfig.build.json` — exclude `*.test.tsx` and `*.test.ts`.
- `package.json` — runtime + dev dependencies, scripts (`dev`, `preview`, `format`, `lint:cache`).
- `CLAUDE.md` (root) — new "Architecture" section indexing per-layer `CLAUDE.md` files.

**Deleted files**
- `src/index.ts`, `src/index.test.ts` (replaced by the new entrypoint and skeleton tests).

## 8. Risk and YAGNI register

- **Type-aware ESLint is slow.** Mitigated by `--cache`. If CI gets painful, evaluate `eslint --max-warnings=0 --cache --cache-strategy=content`.
- **`explicit-function-return-type` can be noisy.** Allowing expressions (`allowExpressions: true`) keeps inline JSX handlers ergonomic; we accept noise on top-level functions as an intentional cost.
- **Two boundary checkers (ESLint + dependency-cruiser).** Slight duplication, but they fail at different times and one is bypassable. The duplication is the point.
- **No design tokens with real values yet.** The tokens file declares names only; this is intentional — the DS wave will populate values.
- **No backend yet.** `client.ts` is a typed `fetch` wrapper but is not consumed; this preserves the boundary slot without inventing fake endpoints.

## 9. Acceptance criteria

The skeleton wave is done when:

1. `npm run dev` opens the app at `/` and shows the placeholder `HomePage`.
2. `npm run build` produces a working PWA artifact (`dist/` includes `sw.js`, `manifest.webmanifest`).
3. `npm run lint` passes with the new type-aware + boundary rules.
4. `npm run typecheck` passes.
5. `npm test -- --run` passes, including the smoke test and the dependency-cruiser architectural test.
6. Introducing a deliberate violation (e.g., `features/foo` importing `features/bar`) is rejected by **both** lint and the architectural test.
7. Each FSD layer directory contains a `CLAUDE.md` describing its purpose, allowed dependencies, and local conventions.
8. The root `CLAUDE.md` links to each per-layer `CLAUDE.md`.

## 10. Out of scope (future waves)

- Real design tokens and primitive components (DS wave).
- Authentication / session handling.
- MSW or any HTTP mocking layer.
- Storybook or docs site.
- i18n.
- Error tracking (Sentry et al.).
- Real domain entities (`Account`, `Transaction`, `Budget`) and their features.
