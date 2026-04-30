# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All scripts run via npm. Node 24.15.0 (`.nvmrc`).

- `npm run lint` — ESLint flat config (`@eslint/js` + `typescript-eslint` recommended)
- `npm run typecheck` — `tsc --noEmit` against `tsconfig.json` (strict, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`)
- `npm test` — Vitest watch mode. For CI-style single run: `npm test -- --run`. Single file: `npm test -- --run src/path/file.test.ts`. Single test by name: `npm test -- --run -t "<test name pattern>"`
- `npm run build` — `tsc -p tsconfig.build.json` (emits `dist/`, excludes `*.test.ts`)

ESM-only: `package.json` has `"type": "module"`. Relative imports inside `src/` MUST use the `.js` extension (e.g., `import { app } from "./index.js"`) even though the source is `.ts` — required by `verbatimModuleSyntax` + `moduleResolution: Bundler`.

## Branching and merging — strictly enforced

The repo enforces a simplified Git Flow via GitHub Rulesets (`.github/rulesets/{main,develop}.json`). **Direct push to `main` or `develop` is rejected by the server.** All work goes through `feature/*` branches.

**Workflow:**

```
git switch develop && git pull
git switch -c feature/<short-kebab-description>
# ... commits ...
git push -u origin feature/<name>
```

CI (`.github/workflows/ci.yml`) runs `lint`, `typecheck`, `test`, `build` on every push to `feature/**` and `develop`, and on pull requests targeting `develop` and `main`. After the four checks pass on a `push`, the `open-pr` job opens (or reuses) a PR to the next branch in the flow:

- push to `feature/*` → auto-PR to `develop`
- push to `develop` (after merge) → auto-PR to `main`

**Merge strategy is squash-only** (enforced by the rulesets). Conventional Commits is a manual convention applied to PR titles — there is no automated commitlint enforcement; edit the PR title before squash-merging if the source commit subject is not in `<type>(<scope>): <subject>` form.

When merging the `develop → main` PR, do **not** delete the branch (`develop` is long-lived).

## Architecture (Feature-Sliced Design)

The frontend is organized in six layers. Dependencies flow downward only — a layer may import from any layer **below** it, never sideways or upward.

| Layer       | Purpose                                 | May import from                            |
| ----------- | --------------------------------------- | ------------------------------------------ |
| `app/`      | composition, router, providers          | pages, widgets, features, entities, shared |
| `pages/`    | routes; compose widgets/features        | widgets, features, entities, shared        |
| `widgets/`  | composite reusable blocks               | features, entities, shared                 |
| `features/` | functional units (slices)               | entities, shared (NOT other features)      |
| `entities/` | domain models                           | shared                                     |
| `shared/`   | generic building blocks (DS lives here) | shared only                                |

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

## Repo configuration that the design depends on

These are not in code but the design assumes them. Don't break them without updating `docs/superpowers/specs/2026-04-29-guardrails-design.md`:

- Repository visibility is **public** (Rulesets require GitHub Pro on private repos).
- _Settings → Actions → General → Workflow permissions_: "Allow GitHub Actions to create and approve pull requests" must be enabled (see spec §5.4). Without it, the `open-pr` job fails.
- `main` is the default branch; `feature/*` must be branched from `develop`.

## Documentation conventions

This repo uses the Superpowers spec/plan workflow under `docs/superpowers/`:

- `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` — design specs, written before implementation.
- `docs/superpowers/plans/YYYY-MM-DD-<topic>.md` — bite-sized implementation plans derived from a spec, with checkbox steps.

When making non-trivial changes, follow the same flow: spec first, plan second, implementation last. The existing guardrails spec/plan are the reference for tone and structure.
