# Design System — Wave 4: Form Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land six form primitives (Input, Select, Checkbox, Radio, Switch, DateRangePicker) in `src/shared/ui/primitives/`, each with TS source, co-located CSS, tests, and barrel exports.

**Architecture:** Per the Wave 4 spec (`docs/superpowers/specs/2026-04-30-design-system-wave-4-design.md`): each primitive lives in its own folder with `<Name>.tsx`, `<Name>.css` (rules wrapped in `@layer components`), `<Name>.test.tsx`, and `index.ts`. Radix UI backs Select / Checkbox / Radio / Switch and the popover for DateRangePicker. Input is a plain styled `<input>`. DateRangePicker uses `react-day-picker` for the calendar.

**Tech stack additions (Task 1):** `@radix-ui/react-select`, `@radix-ui/react-checkbox`, `@radix-ui/react-radio-group`, `@radix-ui/react-switch`, `@radix-ui/react-popover`, `react-day-picker`, `date-fns`.

**Hard prerequisite:** Wave 3 merged into `develop`. The `<Icon>` primitive must exist; the `LocaleProvider` must live in `src/shared/config/locale/`.

---

### Task 1: Branch and install runtime dependencies

- [ ] **Step 1:** Branch from `develop`:

```bash
git switch develop && git pull
git switch -c feature/ds-wave-4-form-primitives
```

- [ ] **Step 2:** Install pinned runtime deps:

```bash
npm install \
  @radix-ui/react-select@2.2.6 \
  @radix-ui/react-checkbox@1.3.3 \
  @radix-ui/react-radio-group@1.3.8 \
  @radix-ui/react-switch@1.2.6 \
  @radix-ui/react-popover@1.1.15 \
  react-day-picker@9.14.0 \
  date-fns@4.1.0
```

- [ ] **Step 3:** Verify pipeline still green:

```bash
npm run lint && npm run typecheck && npm test -- --run
```

- [ ] **Step 4:** Commit:

```bash
git add package.json package-lock.json
git commit -m "chore(ds): add Radix UI + react-day-picker for wave 4"
```

---

### Task 2: Extend the Icon registry with `check` and `minus`

Checkbox indicator needs both. Adding via the central registry preserves the rule that `lucide-react` is imported only inside `Icon.tsx`.

- [ ] **Step 1:** Edit `src/shared/ui/primitives/Icon/Icon.tsx` to import `Check` and `Minus` from `lucide-react` and add `check: Check, minus: Minus` to the registry.

- [ ] **Step 2:** Verify:

```bash
npm run typecheck
```

(No commit yet — fold this into the Checkbox commit, since Checkbox is the only consumer.)

---

### Task 3: Input

**Files:**
- Create: `src/shared/ui/primitives/Input/{Input.tsx, Input.css, Input.test.tsx, index.ts}`
- Modify: `src/shared/ui/primitives/index.ts`

- [ ] **Step 1:** Write `Input.test.tsx` covering: smoke render; each size class; ref forwarding to `HTMLInputElement`; leading/trailing icons render an SVG; `error` prop renders the message + sets `aria-invalid="true"` + `aria-describedby`; typing fires `onChange`.
- [ ] **Step 2:** Write `Input.css` (`.fw-field`, `.fw-input`, `.fw-input-sm/md/lg`, `.fw-field-error`, focus + error states).
- [ ] **Step 3:** Write `Input.tsx` using `forwardRef<HTMLInputElement, InputProps>`. Generate a stable error id with `useId()`.
- [ ] **Step 4:** Write barrel + append to primitives index.
- [ ] **Step 5:** `npm test -- --run src/shared/ui/primitives/Input` then `npm run lint && npm run typecheck`.
- [ ] **Step 6:** Commit `feat(ds): add <Input> primitive`.

---

### Task 4: Select (Radix)

**Files:** `src/shared/ui/primitives/Select/{Select.tsx, Select.css, Select.test.tsx, index.ts}` + index update.

- [ ] **Step 1:** Write `Select.test.tsx` covering: smoke render with placeholder; ref forwarding to the trigger button; clicking trigger then an option fires `onValueChange`; `error` wires `aria-invalid` + describedby; controlled `value` updates the trigger label.
- [ ] **Step 2:** Write `Select.css` styling `.fw-select-trigger` (matches `.fw-input`), `.fw-select-content`, `.fw-select-item` (with `[data-highlighted]` and `[data-state="checked"]` selectors).
- [ ] **Step 3:** Write `Select.tsx`. The Radix imports go via `import * as SelectPrimitive from "@radix-ui/react-select"`. ForwardRef target is the trigger button (`HTMLButtonElement`). Use `<Icon name="chevronDown">` as trailing.
- [ ] **Step 4:** Barrel + index. Test, lint, typecheck.
- [ ] **Step 5:** Commit `feat(ds): add <Select> primitive`.

---

### Task 5: Checkbox (Radix) — also adds icon registry entries

**Files:** `src/shared/ui/primitives/Checkbox/...` + index update + Icon.tsx update from Task 2.

- [ ] **Step 1:** Write `Checkbox.test.tsx`: smoke render; ref forwarding to `HTMLButtonElement` (Radix root); clicking toggles `aria-checked` and fires `onCheckedChange`; `defaultChecked="indeterminate"` renders the minus icon; `error` wires `aria-invalid`; label text is associated.
- [ ] **Step 2:** Apply Task 2's edit to `Icon.tsx` (add `check`, `minus`).
- [ ] **Step 3:** Write `Checkbox.css`, `Checkbox.tsx` using `@radix-ui/react-checkbox`.
- [ ] **Step 4:** Barrel + index. Test, lint, typecheck.
- [ ] **Step 5:** Commit `feat(ds): add <Checkbox> primitive` (also stages `Icon.tsx` change).

---

### Task 6: Radio (Radix)

**Files:** `src/shared/ui/primitives/Radio/...` + index update.

- [ ] **Step 1:** Write `Radio.test.tsx`: smoke render renders one labeled radio per option; ref forwarding to the group root; clicking an option fires `onValueChange`; controlled `value`; `error` wires `aria-invalid` on the group; `orientation="horizontal"` applies the corresponding class.
- [ ] **Step 2:** Write `Radio.css`, `Radio.tsx` using `@radix-ui/react-radio-group`. Component name is `Radio` (group-level, exported once).
- [ ] **Step 3:** Barrel + index. Test, lint, typecheck.
- [ ] **Step 4:** Commit `feat(ds): add <Radio> primitive`.

---

### Task 7: Switch (Radix)

**Files:** `src/shared/ui/primitives/Switch/...` + index update.

- [ ] **Step 1:** Write `Switch.test.tsx`: smoke; ref forwarding; click toggles `aria-checked` and fires `onCheckedChange`; `error`; label association.
- [ ] **Step 2:** Write `Switch.css`, `Switch.tsx` using `@radix-ui/react-switch`.
- [ ] **Step 3:** Barrel + index. Test, lint, typecheck.
- [ ] **Step 4:** Commit `feat(ds): add <Switch> primitive`.

---

### Task 8: DateRangePicker (react-day-picker + Radix Popover)

**Files:** `src/shared/ui/primitives/DateRangePicker/...` + index update.

- [ ] **Step 1:** Write `DateRangePicker.test.tsx`: trigger renders placeholder when no value; trigger renders formatted range when value provided; ref forwarded to the trigger button; clicking trigger opens the popover (use `findByRole`); selecting two days fires `onChange` with `{ from, to }`; pt-BR locale formats `dd/MM/yyyy`.
- [ ] **Step 2:** Write `DateRangePicker.css` (uses Popover + DayPicker class hooks).
- [ ] **Step 3:** Write `DateRangePicker.tsx`:
  - Resolve `Locale` → `date-fns/locale` via a small map (`{ "pt-BR": ptBR, "en-US": enUS }`).
  - Format the range with `Intl.DateTimeFormat`.
  - Wrap with `@radix-ui/react-popover` and render `<DayPicker mode="range">` inside.
- [ ] **Step 4:** Barrel + index. Test, lint, typecheck.
- [ ] **Step 5:** Commit `feat(ds): add <DateRangePicker> primitive`.

---

### Task 9: Final verification

- [ ] **Step 1:** Run the full pipeline:

```bash
npm run lint && npm run typecheck && npm test -- --run && npm run build
```

Expected: PASS on all four. Test count climbs by ~30 (six primitives × ~5 tests each).

- [ ] **Step 2:** If any small lint fixups are needed (unused imports, etc.), commit `chore(ds): wave 4 lint fixups` and re-run the pipeline.

- [ ] **Step 3:** Push:

```bash
git push -u origin feature/ds-wave-4-form-primitives
```

CI auto-opens a PR to `develop`.

- [ ] **Step 4:** Edit PR title to `feat(ds): wave 4 — form primitives (Radix-backed)` with a body listing the six primitives, the Radix adoption note, references to the spec/plan, the test plan checklist, and a "What this does NOT do" section.

---

## Acceptance criteria

This wave is done when:

1. All four pipeline gates pass on `feature/ds-wave-4-form-primitives`.
2. The six primitives import successfully from `src/shared/ui/primitives` and render without console errors.
3. The architecture test still passes.
4. The PR is open against `develop` with CI green.
