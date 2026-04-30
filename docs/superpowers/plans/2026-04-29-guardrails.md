# Guardrails Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap minimum guardrails (branch protection rulesets, CI pipeline, auto-PR automation, baseline TS tooling) on `nathanfiorito/finew-app` per spec `2026-04-29-guardrails-design.md`.

**Architecture:** Versioned ruleset JSONs under `.github/rulesets/`, single CI workflow at `.github/workflows/ci.yml` running `lint → typecheck → test → build` with a final `open-pr` job that uses `GITHUB_TOKEN` + `gh` CLI to open PRs to the next branch in the simplified Git Flow (`feature/* → develop → main`). Rulesets applied once via `gh api`.

**Tech Stack:** Node.js 24.15.0, npm, TypeScript 5, ESLint 9 (flat config) + typescript-eslint 8, Vitest 2, GitHub Actions, GitHub Rulesets API.

---

## File Structure

| File | Purpose |
|---|---|
| `package.json` | Scripts (`lint`, `typecheck`, `test`, `build`) and devDeps |
| `tsconfig.json` | Strict TS base used by `typecheck` |
| `tsconfig.build.json` | Extends base, defines `outDir`, excludes tests |
| `eslint.config.js` | Flat config with recommended JS + TS rules |
| `.gitignore` | Ignore `node_modules`, `dist`, `coverage`, `.env*` |
| `.nvmrc` | `24.15.0` to align local with CI |
| `src/index.ts` | Smoke export so `tsc` has something to build |
| `src/index.test.ts` | Smoke test so `vitest` finds at least one test |
| `.github/workflows/ci.yml` | CI pipeline + auto-PR job |
| `.github/rulesets/main.json` | Ruleset JSON applied to `main` |
| `.github/rulesets/develop.json` | Ruleset JSON applied to `develop` |

---

## Task 1: Baseline TypeScript tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.build.json`
- Create: `eslint.config.js`
- Create: `.gitignore`
- Create: `.nvmrc`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "finew-app",
  "private": true,
  "type": "module",
  "engines": { "node": ">=24.15.0" },
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "build": "tsc -p tsconfig.build.json"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "eslint": "^9.13.0",
    "@eslint/js": "^9.13.0",
    "typescript-eslint": "^8.12.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "types": ["vitest/globals"]
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 3: Write `tsconfig.build.json`**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "declaration": true,
    "noEmit": false
  },
  "exclude": ["**/*.test.ts"]
}
```

- [ ] **Step 4: Write `eslint.config.js`**

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "coverage", "node_modules"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
```

- [ ] **Step 5: Write `.gitignore`**

```
node_modules
dist
coverage
.env
.env.*
!.env.example
```

- [ ] **Step 6: Write `.nvmrc`**

```
24.15.0
```

- [ ] **Step 7: Install dependencies and generate lockfile**

Run: `npm install`
Expected: `package-lock.json` created, `node_modules/` populated, no errors.

- [ ] **Step 8: Verify scripts wire up (will fail on missing `src/`, that's fine — fixed in Task 2)**

Run: `npm run lint`
Expected: ESLint runs (may report 0 files matched — OK).

Run: `npm run typecheck`
Expected: `tsc --noEmit` exits 0 (no input files yet, no errors).

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json tsconfig.json tsconfig.build.json eslint.config.js .gitignore .nvmrc
git commit -m "chore: scaffold typescript tooling baseline"
```

---

## Task 2: Smoke source + test

**Files:**
- Create: `src/index.ts`
- Create: `src/index.test.ts`

- [ ] **Step 1: Write the failing test**

`src/index.test.ts`:
```ts
import { expect, test } from "vitest";
import { app } from "./index.js";

test("app identifier is exposed", () => {
  expect(app).toBe("finew-app");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run`
Expected: FAIL with "Cannot find module './index.js'" or equivalent.

- [ ] **Step 3: Write minimal implementation**

`src/index.ts`:
```ts
export const app = "finew-app";
```

- [ ] **Step 4: Run all pipeline scripts**

Run: `npm test -- --run`
Expected: PASS, 1 test.

Run: `npm run typecheck`
Expected: exits 0, no errors.

Run: `npm run lint`
Expected: exits 0, no errors.

Run: `npm run build`
Expected: `dist/index.js` and `dist/index.d.ts` created.

- [ ] **Step 5: Commit**

```bash
git add src/index.ts src/index.test.ts
git commit -m "chore: add smoke source and test for ci pipeline"
```

---

## Task 3: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write the workflow file**

`.github/workflows/ci.yml`:
```yaml
name: ci

on:
  push:
    branches:
      - develop
      - "feature/**"
  pull_request:
    branches:
      - develop
      - main

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "24.15.0"
          cache: "npm"
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "24.15.0"
          cache: "npm"
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "24.15.0"
          cache: "npm"
      - run: npm ci
      - run: npm test -- --run

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "24.15.0"
          cache: "npm"
      - run: npm ci
      - run: npm run build

  open-pr:
    needs: [lint, typecheck, test, build]
    if: github.event_name == 'push' && (github.ref == 'refs/heads/develop' || startsWith(github.ref, 'refs/heads/feature/'))
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - id: target
        run: |
          if [[ "${GITHUB_REF}" == "refs/heads/develop" ]]; then
            echo "base=main" >> "$GITHUB_OUTPUT"
          else
            echo "base=develop" >> "$GITHUB_OUTPUT"
          fi
      - name: Open PR if not exists
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          HEAD="${GITHUB_REF#refs/heads/}"
          BASE="${{ steps.target.outputs.base }}"
          EXISTING=$(gh pr list --head "$HEAD" --base "$BASE" --state open --json number --jq '.[0].number')
          if [[ -n "$EXISTING" ]]; then
            echo "PR #$EXISTING already exists for $HEAD -> $BASE"
            exit 0
          fi
          TITLE="$(git log -1 --pretty=%s)"
          gh pr create --base "$BASE" --head "$HEAD" \
            --title "$TITLE" \
            --body "Auto-PR from \`$HEAD\` after CI passed."
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add lint/typecheck/test/build pipeline with auto-pr"
```

---

## Task 4: Ruleset JSONs

**Files:**
- Create: `.github/rulesets/main.json`
- Create: `.github/rulesets/develop.json`

- [ ] **Step 1: Write `.github/rulesets/main.json`**

```json
{
  "name": "protect-main",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/main"],
      "exclude": []
    }
  },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "required_linear_history" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false,
        "allowed_merge_methods": ["squash"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          { "context": "lint" },
          { "context": "typecheck" },
          { "context": "test" },
          { "context": "build" }
        ]
      }
    }
  ],
  "bypass_actors": []
}
```

- [ ] **Step 2: Write `.github/rulesets/develop.json`**

```json
{
  "name": "protect-develop",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/develop"],
      "exclude": []
    }
  },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "required_linear_history" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false,
        "allowed_merge_methods": ["squash"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          { "context": "lint" },
          { "context": "typecheck" },
          { "context": "test" },
          { "context": "build" }
        ]
      }
    }
  ],
  "bypass_actors": []
}
```

> Note on context names: GitHub identifies a status check context by the **job name** of the workflow job, not `<workflow> / <job>`. Our jobs are named `lint`, `typecheck`, `test`, `build` — those exact strings go in `required_status_checks`.

- [ ] **Step 3: Validate JSON syntactically**

Run (PowerShell): `Get-Content .github/rulesets/main.json | ConvertFrom-Json | Out-Null; Get-Content .github/rulesets/develop.json | ConvertFrom-Json | Out-Null`
Expected: no output, no errors.

- [ ] **Step 4: Commit**

```bash
git add .github/rulesets/main.json .github/rulesets/develop.json
git commit -m "chore: add branch protection rulesets for main and develop"
```

---

## Task 5: Push tooling, workflows, and rulesets to `main`

**Files:** none (push only)

- [ ] **Step 1: Verify clean working tree**

Run: `git status`
Expected: `nothing to commit, working tree clean`.

- [ ] **Step 2: Push `main`**

Run: `git push origin main`
Expected: push succeeds (rulesets are NOT yet applied; `main` is currently unprotected).

- [ ] **Step 3: Confirm push completed**

Run (PowerShell): `gh run list --branch main --limit 3`
Expected: a `ci` workflow run is queued or in progress. Note: the `ci.yml` triggers `push` only on `develop` and `feature/**`, so on `main` no run is expected. This step verifies that — list will show no runs for the latest commit on `main`. That is correct.

---

## Task 6: Create `develop` branch and trigger first CI run

**Files:** none (branch operations only)

- [ ] **Step 1: Create `develop` from `main`**

Run: `git switch -c develop`
Expected: switched to new branch `develop`.

- [ ] **Step 2: Push `develop` to remote**

Run: `git push -u origin develop`
Expected: branch created on remote, upstream set.

- [ ] **Step 3: Wait for CI run on `develop` to complete**

Run (PowerShell): `gh run watch --exit-status $(gh run list --branch develop --limit 1 --json databaseId --jq '.[0].databaseId')`
Expected: workflow `ci` completes successfully. All four jobs (`lint`, `typecheck`, `test`, `build`) green. `open-pr` job runs and exits 0 — but there is no `develop -> main` PR yet because no diff exists between `develop` and `main` (gh will fail to create with "No commits between main and develop"; that is acceptable for this step — see Step 4).

- [ ] **Step 4: Inspect `open-pr` job**

Run (PowerShell): `gh run view --log-failed $(gh run list --branch develop --limit 1 --json databaseId --jq '.[0].databaseId') 2>&1 | Select-String -Pattern "No commits between" -SimpleMatch`
Expected: either no failed jobs, or `open-pr` failed only with "No commits between main and develop". Both are acceptable. The status check contexts (`lint`, `typecheck`, `test`, `build`) are now registered with the GitHub API.

---

## Task 7: Apply rulesets via `gh api`

**Files:** none (API calls only)

- [ ] **Step 1: Apply `protect-main` ruleset**

Run (PowerShell): `gh api -X POST /repos/nathanfiorito/finew-app/rulesets --input .github/rulesets/main.json`
Expected: JSON response with `"id": <number>` and `"name": "protect-main"`. Record the id.

- [ ] **Step 2: Apply `protect-develop` ruleset**

Run (PowerShell): `gh api -X POST /repos/nathanfiorito/finew-app/rulesets --input .github/rulesets/develop.json`
Expected: JSON response with `"id": <number>` and `"name": "protect-develop"`. Record the id.

- [ ] **Step 3: List rulesets to confirm**

Run (PowerShell): `gh api /repos/nathanfiorito/finew-app/rulesets`
Expected: array of 2 rulesets, both `"enforcement": "active"`.

---

## Task 8: End-to-end smoke validation

**Files:** none (validation only)

- [ ] **Step 1: Confirm direct push to `main` is rejected**

Run:
```bash
git switch main
git commit --allow-empty -m "chore: should-be-rejected"
git push origin main
```
Expected: push rejected with message containing "Changes must be made through a pull request" or "protected branch".

- [ ] **Step 2: Reset local `main` to origin (clean up the rejected empty commit)**

Run: `git reset --hard origin/main`
Expected: `HEAD` is now at the last successful commit on `main`.

- [ ] **Step 3: Confirm direct push to `develop` is rejected**

Run:
```bash
git switch develop
git commit --allow-empty -m "chore: should-be-rejected"
git push origin develop
```
Expected: push rejected.

- [ ] **Step 4: Reset local `develop` to origin**

Run: `git reset --hard origin/develop`

- [ ] **Step 5: Create a feature branch and push**

Run:
```bash
git switch -c feature/test-guardrail
git commit --allow-empty -m "chore: smoke test guardrail pipeline"
git push -u origin feature/test-guardrail
```
Expected: push succeeds.

- [ ] **Step 6: Wait for CI to pass and auto-PR to be opened**

Run (PowerShell): `gh run watch --exit-status $(gh run list --branch feature/test-guardrail --limit 1 --json databaseId --jq '.[0].databaseId')`
Expected: all jobs green; `open-pr` job creates PR.

Run (PowerShell): `gh pr list --head feature/test-guardrail --base develop`
Expected: one open PR shown.

- [ ] **Step 7: Re-push to confirm idempotency (no duplicate PR)**

Run:
```bash
git commit --allow-empty -m "chore: second commit on smoke branch"
git push
```

After the new CI run finishes:
Run (PowerShell): `gh pr list --head feature/test-guardrail --base develop --state open`
Expected: still exactly one PR (no duplicate).

- [ ] **Step 8: Confirm only `squash` merge is offered**

Run (PowerShell): `gh pr view --head feature/test-guardrail --base develop --json number --jq '.number'` to get the PR number, then open the PR in browser:
`gh pr view <number> --web`
Expected: only "Squash and merge" button is enabled in the UI.

- [ ] **Step 9: Squash-merge the feature PR**

Run (PowerShell, replacing `<number>`): `gh pr merge <number> --squash --delete-branch`
Expected: merge succeeds, branch deleted, `develop` advances by 1 squash commit.

- [ ] **Step 10: Wait for CI on `develop` and confirm auto-PR `develop -> main` is opened**

Run (PowerShell): `gh run watch --exit-status $(gh run list --branch develop --limit 1 --json databaseId --jq '.[0].databaseId')`
Expected: pipeline green.

Run (PowerShell): `gh pr list --head develop --base main`
Expected: one open PR.

- [ ] **Step 11: Squash-merge `develop -> main`**

Run (PowerShell, replacing `<number>`): `gh pr merge <number> --squash`
Expected: merge succeeds; `main` advances by 1 squash commit.

> Do NOT use `--delete-branch` here — `develop` is a long-lived branch.

- [ ] **Step 12: Sync local branches**

Run:
```bash
git switch main && git pull
git switch develop && git pull
```
Expected: both branches up to date with origin.

- [ ] **Step 13: Verify acceptance criteria checklist**

Cross-reference each item in spec section 9 against observations from Steps 1–12. Mark each as PASS in the PR body or a final note. If any item failed, file as a follow-up before declaring done.

---

## Notes

- **Conventional Commits** are enforced manually. Edit the auto-PR title before squash-merging if the source commit subject is not in `<type>(<scope>): <subject>` form.
- **Ruleset drift recovery:** if a rule is changed via the UI, re-apply with `gh api -X PUT /repos/nathanfiorito/finew-app/rulesets/<id> --input .github/rulesets/<file>.json`.
- **First feature branch creation pattern:** `git switch develop && git pull && git switch -c feature/<name>` (since `main` remains the default branch).
