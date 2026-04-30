# Design System — Wave 5: Overlay & Composition Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land nine overlay/composition primitives — Modal, BottomSheet, Toast, Tabs, Accordion, Tooltip, Popover, Drawer, Stepper — in `src/shared/ui/primitives/`.

**Architecture:** Per the Wave 5 spec (`docs/superpowers/specs/2026-04-30-design-system-wave-5-design.md`). Adopts Radix UI for Modal/Tabs/Accordion/Tooltip/Popover, `vaul` for BottomSheet/Drawer, `sonner` for Toast. Stepper composes Radix Tabs internally.

**Tech Stack:** TypeScript strict, React 19, Vitest + `@testing-library/react`, Tailwind v4 `@layer components`.

---

### Task 0: Branch and add dependencies

- [ ] **Step 1:** Branch from `develop` as `feature/ds-wave-5-overlays`.
- [ ] **Step 2:** Install pinned dependencies:
  - `@radix-ui/react-dialog@1.1.15`
  - `@radix-ui/react-tabs@1.1.13`
  - `@radix-ui/react-accordion@1.2.12`
  - `@radix-ui/react-tooltip@1.2.8`
  - `@radix-ui/react-popover@1.1.15`
  - `vaul@1.1.2`
  - `sonner@2.0.7`
- [ ] **Step 3:** Commit `chore(ds): add Radix UI + vaul + sonner for wave 5` (package.json + package-lock.json only).

### Tasks 1–9: One commit per primitive

Each primitive follows the Wave 2 template:
1. Write failing `.test.tsx`.
2. Write `<Name>.css` (rules in `@layer components`, `fw-*` selectors).
3. Write `<Name>.tsx` (forwardRef where applicable; dot-namespaced for compound primitives).
4. Write `index.ts` barrel; append to `src/shared/ui/primitives/index.ts`.
5. Run `npm test -- --run src/shared/ui/primitives/<Name>/`.
6. Commit `feat(ds): add <Name> primitive`.

Order: Modal → BottomSheet → Toast → Tabs → Accordion → Tooltip → Popover → Drawer → Stepper.

### Task 10: Final verification + push + PR

- [ ] **Step 1:** `npm run lint && npm run typecheck && npm test -- --run && npm run build` all green.
- [ ] **Step 2:** `git push -u origin feature/ds-wave-5-overlays`.
- [ ] **Step 3:** Open PR titled `feat(ds): wave 5 — overlay and composition primitives` against `develop`. Body lists primitives, libraries, tokens used, "Test Plan" checklist, "What this does NOT do".

---

## Acceptance criteria

1. All four pipeline gates pass.
2. Nine primitives exported from `src/shared/ui/primitives/index.ts`.
3. Architectural test still passes.
4. PR open against `develop` with CI green.
