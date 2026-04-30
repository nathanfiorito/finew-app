# Skeleton Architecture — Tech Debt Register

**Created:** 2026-04-29
**Origin:** Skeleton bootstrap wave (`feature/skeleton-architecture-spec`).
**Owner:** Nathan Fiorito.

This document records the tech debt incurred while bootstrapping the FSD skeleton on bleeding-edge versions (Vite 8, React 19.2, ESLint 10) ahead of plugin-ecosystem support. Each item should either be closed (debt repaid) or re-evaluated on a recurring basis.

---

## TD-1 — `package.json` overrides forcing peer-dep ranges

**Where:** `package.json` → `overrides`.

**What:** The following plugins still declare peer-dep ranges that don't list our installed `vite@8` / `eslint@10`. We force-resolve them via `overrides`:

| Plugin                        | Declared peer range                       | We force                |
| ----------------------------- | ----------------------------------------- | ----------------------- |
| `vite-plugin-pwa@^1.2.0`      | `vite@^3.1.0 \|\| ^4 \|\| ^5 \|\| ^6 \|\| ^7` | `vite@$vite` (= 8.0.10) |
| `eslint-plugin-react@^7.37`   | `eslint@^3 ... ^9`                        | `eslint@$eslint` (= 10.2.1) |
| `eslint-plugin-react-hooks@^5`| `eslint@^3 ... ^9`                        | `eslint@$eslint`        |
| `eslint-plugin-jsx-a11y@^6`   | `eslint@^3 ... ^9`                        | `eslint@$eslint`        |

**Risk:** plugins haven't been validated against these majors by their authors. If a plugin makes API assumptions that break under v10/v8, lint or build can fail with confusing errors.

**Repay when:** each plugin publishes a release whose peer range officially includes our version.

**How to repay:**
1. `npm view <plugin> peerDependencies` — confirm the range now includes our major.
2. Bump the plugin to the latest version.
3. Remove its entry from `overrides` (one block at a time).
4. Run `npm run lint && npm test -- --run && npm run build`. All must pass.
5. Commit: `chore(deps): drop <plugin> peer-dep override`.

**Verify status:** see scheduled agent (TD-1 review on 2026-05-13 — recurring monthly until cleared).

---

## TD-2 — `eslint-plugin-react` `version: "detect"` disabled

**Where:** `eslint.config.js` → `settings.react.version: "19.2.0"`.

**What:** `eslint-plugin-react@7.x` calls `context.getFilename()` for runtime React-version detection; that method was removed in ESLint 10. We pin the version literal as a workaround.

**Risk:** when React is upgraded, the literal must be bumped manually. If we forget, lint will report behavior tuned to the wrong React version.

**Repay when:** `eslint-plugin-react` ships a flat-config-native release (sometimes shipped under `eslint-plugin-react/configs/recommended-flat`) or migrates off `getFilename()`. Alternatively, switch to the `@eslint-react/eslint-plugin` family if it is mature.

**How to repay:**
1. Try setting `settings.react.version: "detect"` again with the latest `eslint-plugin-react`.
2. Run `npm run lint`. If it errors, revert and keep the pin.
3. If clean, commit: `chore(lint): re-enable react version auto-detect`.

---

## TD-3 — Test-file ESLint overrides for `@testing-library` types

**Where:** `eslint.config.js` → `files: ["**/*.test.ts", "**/*.test.tsx", "src/test/**"]` block.

**What:** disabled in test files:

- `@typescript-eslint/no-unsafe-call`
- `@typescript-eslint/no-unsafe-member-access`

This was needed because `@testing-library/react@16` returns values typed as `any` in some places, tripping the type-aware rules.

**Risk:** tests can shadow real type problems, since `unknown`/`any` returns aren't policed there.

**Repay when:** `@testing-library/react` publishes stricter type defs (or once we wrap render helpers in our own typed module that satisfies the rules).

**How to repay:**
1. Remove the two overrides.
2. `npm run lint`. If it surfaces violations, fix them in the test code or in a small typed helper under `src/test/`.
3. Commit: `chore(lint): re-enable no-unsafe-* in test files`.

---

## TD-4 — `eslint-import-resolver-typescript` installed via `--legacy-peer-deps`

**Where:** `package.json` (devDependencies).

**What:** the resolver's peer range conflicted with `vite-plugin-pwa@1.2.0`'s peer range during install, so `--legacy-peer-deps` was used. Functionally fine; principle violation.

**Risk:** if a future install touches the same peer graph, we may rediscover the conflict and forget the workaround.

**Repay when:** TD-1 (`vite-plugin-pwa` override) is repaid — at that point a clean install should succeed without `--legacy-peer-deps`.

**How to repay:** ride alongside TD-1 cleanup.

---

## TD-5 — `npm audit` advisories

**What:** `npm audit` reports several high/critical advisories in transitive dev dependencies (e.g., deprecated `sourcemap-codec`, old `glob`).

**Risk:** dev tooling only — no runtime impact for end users. Still worth a scheduled sweep.

**Repay when:** during a routine maintenance pass (quarterly is reasonable).

**How to repay:**
1. `npm audit`.
2. Try `npm audit fix` (no `--force`).
3. For anything left, evaluate manually whether the parent package has a newer version.
4. If a fix requires a breaking parent bump, weigh against effort and treat as a separate small task.

---

## TD-6 — `vite-plugin-pwa` ships an empty icons array

**Where:** `vite.config.ts`.

**What:** the manifest declares `icons: []`. Real PWA icons are out of scope for the skeleton wave but a real install on a phone won't have a usable home-screen icon.

**Risk:** PWA "Add to Home Screen" UX broken until icons are added.

**Repay when:** the design-system wave (or a dedicated PWA polish task) generates the icon set.

**How to repay:**
1. Generate icons (typical sizes: 192×192, 512×512, plus maskable variants) in `public/icons/`.
2. Populate `manifest.icons` in `vite.config.ts`.
3. Commit: `feat(pwa): add manifest icons`.

---

## Review cadence

A scheduled agent re-evaluates this register periodically. The most relevant signal each cycle is whether any plugin in TD-1 has updated its peer-dep range so the override can be dropped.

If the agent finds nothing actionable, it should leave a short note here updating the "last reviewed" line below — do not delete the entries.

**Last reviewed:** 2026-04-29 (initial creation).
