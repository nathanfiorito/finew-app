# Merge Strategy — Tech Debt Register

**Created:** 2026-04-30
**Origin:** PR cycle around #9 / #11 / #12 / #13 / #14, where `develop → main` produced add/add conflicts because both branches independently created `CLAUDE.md` after the squash-only flow erased their shared lineage.
**Owner:** Nathan Fiorito.

This document records the residual debt after switching `develop → main` from squash to merge commit (Option A). Each item should be closed once a code-level guard exists, or re-evaluated.

---

## TD-3 — Manual discipline required when picking a merge method

**Where:** every PR's GitHub merge button.

**What:** The `develop` ruleset now allows `["squash", "merge"]`. The convention is:

- `feature → develop`: pick **"Squash and merge"** (clean per-feature commits on `develop`).
- `develop → main`: pick **"Create a merge commit"** (the only option allowed by `main`'s ruleset, but this is enforced server-side, so it's safe).
- **Sync / lineage-fix PRs into `develop`** (e.g., a `git merge -s ours origin/main` that records `main` as ancestor): MUST pick **"Create a merge commit"**. Squashing strips the parent reference and loses the lineage-fix entirely.

**Risk:** PR #13 was squash-merged by accident, undoing its purpose; we needed PR #14 (a retry) to fix the lineage. Future sync PRs are vulnerable to the same mistake. The PR title and body can warn, but the dropdown defaults to "Squash and merge" because that's the historical convention.

**Repay when:** either of these is true:

1. A GitHub Action posts a sticky comment on PRs whose head branch matches a sync pattern (`feature/sync-*`, `feature/merge-*`) instructing "merge with merge commit, not squash" — or, better, blocks squash-merge for those branches.
2. The repo migrates to GitHub Flow (kills `develop`), at which point the asymmetry vanishes.

**How to repay (option 1):** add `.github/workflows/squash-guard.yml` that checks the PR head ref pattern and the merge method via the `pull_request_review` or `merge_group` event, and fails the merge attempt if a sync-class branch is being squashed. Keep a tested example bookmarked rather than free-styling — squash-merge enforcement at the action level has subtle edge cases.

**Verify status:** until automated, this is enforced only by attention. Re-evaluate after any future cycle where a lineage-fix PR is opened.

---

## TD-4 — `develop` ruleset relaxed beyond what the feature flow strictly needs

**Where:** `.github/rulesets/develop.json` (`allowed_merge_methods: ["squash", "merge"]`, `required_linear_history` removed).

**What:** Strictly speaking, `feature → develop` should always be squash. We allowed `merge` to leave an escape valve for sync/lineage-fix PRs (TD-3). The cost is that a squash-discipline lapse on a regular feature PR (picking "Create a merge commit" by mistake) silently produces a merge commit on `develop`, which is uglier than the convention demands but causes no functional harm.

**Risk:** low. The author of every feature PR is currently the same person; muscle memory will keep `develop`'s history mostly clean. If multiple authors enter the picture, this becomes more important.

**Repay when:** TD-3 is automated. Once squash-merge is enforced for non-sync branches by a workflow guard, the ruleset can revert to `["squash"]` for `develop` and `merge` can be reserved for the rare sync (which the workflow guard would explicitly opt into).

**How to repay:**

1. Implement TD-3's workflow guard.
2. Update `.github/rulesets/develop.json` back to `allowed_merge_methods: ["squash"]`.
3. `gh api -X PUT /repos/nathanfiorito/finew-app/rulesets/15754154 --input .github/rulesets/develop.json`.
4. Update `docs/superpowers/specs/2026-04-29-guardrails-design.md` §4.4 to reflect the tighter rule.

---

## Closed lessons (for posterity, not actionable)

- **Squash merge erases parent metadata.** This is fundamental git, not a GitHub quirk. Any PR whose value depends on recording a merge commit (sync, lineage-fix, back-merge) cannot be squash-merged. The dropdown's existence is the trap.
- **`add/add` conflicts can't be content-resolved.** When two branches independently create a file at the same path, no amount of "take ours/theirs" resolves the structural fact. The fix is always to make one branch include the other in its history first.
- **Squash-only flows accumulate phantom divergence.** With long-lived `develop` and `main`, every squash from `develop → main` produces a content-duplicated commit on `main` with a different SHA. The branches stay synchronized in *content* but diverge in *identity*, and the next squash discovers the duplication as a conflict. The fix (Option A) is to use real merge commits in at least one direction so the branches share lineage.
