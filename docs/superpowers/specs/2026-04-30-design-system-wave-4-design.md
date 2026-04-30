# Design System — Wave 4: Form Primitives Spec

**Date:** 2026-04-30
**Status:** Draft — pending user review
**Scope:** Implementation spec for the fourth wave of the design system: ship the six form primitives so `pages/` and `widgets/` can compose real inputs. Implementation plan derived from this spec lives at `docs/superpowers/plans/2026-04-30-design-system-wave-4.md`.

## 1. Goal

Land six presentational form primitives in `src/shared/ui/primitives/`, each with:

- a TS source (`<Name>.tsx`) and a co-located stylesheet (`<Name>.css`) wrapping rules in `@layer components`
- a barrel `index.ts`
- a Vitest test (`<Name>.test.tsx`) covering at least: smoke render, every variant/state, ref forwarding, A11y attributes, and basic interaction
- exported through `src/shared/ui/primitives/index.ts`

The six primitives: **Input, Select, Checkbox, Radio, Switch, DateRangePicker**.

After Wave 4, page-level work can compose real form surfaces (deferred to a separate PR; not part of this wave).

## 2. Cross-cutting decisions resolved

The integration spec (§6) and the briefing left several decisions open. This wave resolves them:

| Decision | Choice | Rationale |
| --- | --- | --- |
| Radix UI adoption for stateful form primitives | **Adopt Radix** for Select, Checkbox, Radio, Switch, and as the popover host for DateRangePicker. | Radix gives focus traps, keyboard navigation, A11y, controlled/uncontrolled state machines for free; restyling is mechanical. |
| Input | **Plain styled `<input>`**, no Radix. | Native input is already accessible; Radix offers nothing here. |
| DateRangePicker calendar engine | **`react-day-picker` v9** with `date-fns` peer for pt-BR locale. | Headless, ~4 kB, pt-BR built in via `date-fns/locale`. We wrap with our trigger button + Radix Popover. |
| Form integration | **Spreadable HTML props**: each primitive accepts standard HTML props (`name`, `value`/`defaultValue`, `onChange` where applicable) so `react-hook-form`'s `register()` spread "just works". The primitive itself is form-library-agnostic. | Brief §6 recommendation. |
| Validation slot | **`error?: string`** prop on every primitive renders a small message below in `var(--loss)` and wires `aria-invalid` / `aria-describedby`. | Self-contained: consumers don't need to render errors themselves. |
| Locale source | **`useLocale()` from `src/shared/config/locale/`**. The DateRangePicker resolves its month/weekday strings from `date-fns/locale` keyed by the current locale. | FSD: shared can't import from `app/`. The Wave 3 LocaleProvider already lives in `shared/config`. |
| Class-name prefix | **`fw-*`** (consistent with Waves 2 and 3). | Greppable; doesn't collide with Tailwind utilities. |
| Forward refs | **Always forward**, via `forwardRef`. For Radix primitives that already forward, we forward the same DOM ref out. | Same pattern as Waves 2 and 3. |

If any of these should flip, raise before the plan is written.

## 3. Primitives in scope

Six primitives. Five are net-new construction (no kit equivalent). The styled `.fw-input` skeleton in `kit.css` is the only kit material we reuse, and only for visual vocabulary (radii, hairlines, focus rings).

### 3.1 Input (build, no Radix)

```tsx
type InputSize = "sm" | "md" | "lg";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize;            // default "md"
  iconLeading?: IconName;      // optional Icon by registry key
  iconTrailing?: IconName;
  error?: string;              // renders below in var(--loss); wires aria-invalid + aria-describedby
}
```

Renders a `<span class="fw-field">` wrapper containing the optional leading icon, the `<input class="fw-input fw-input-{size}">`, the optional trailing icon, and (when `error` is set) a `<span class="fw-field-error" role="alert">`. The wrapper picks up `data-state="error"` for styling and the input gets `aria-invalid="true"` + `aria-describedby={errorId}`.

### 3.2 Select (Radix)

Wraps `@radix-ui/react-select`. Props mirror the Radix root + trigger but with our visual contract:

```tsx
interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}
interface SelectProps {
  name?: string;
  value?: string;                        // controlled
  defaultValue?: string;                 // uncontrolled
  onValueChange?: (next: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";             // default "md"
  error?: string;
  "aria-label"?: string;
}
```

Renders Radix `Select.Root` → `Select.Trigger` (styled like `.fw-input`) → `Select.Portal` → `Select.Content` → `Select.Viewport` containing `Select.Item`s. The trigger gets a chevron icon trailing.

Ref is forwarded to the trigger button.

### 3.3 Checkbox (Radix)

Wraps `@radix-ui/react-checkbox`.

```tsx
type CheckedState = boolean | "indeterminate";

interface CheckboxProps {
  name?: string;
  value?: string;                        // form value when checked (default "on")
  checked?: CheckedState;                // controlled
  defaultChecked?: CheckedState;         // uncontrolled
  onCheckedChange?: (next: CheckedState) => void;
  disabled?: boolean;
  required?: boolean;
  label?: ReactNode;                     // renders as <label> wrapper
  error?: string;
  id?: string;                           // generated when label is provided and id is omitted
}
```

Renders a `<label class="fw-check">` wrapping the Radix `Checkbox.Root` (styled square) → `Checkbox.Indicator` (check / minus icon) and the label text. `aria-checked` is provided by Radix.

Ref forwarded to the underlying button (Radix's root element).

### 3.4 Radio (Radix)

Wraps `@radix-ui/react-radio-group`. Group-level component (not a single radio button) — radios are useless in isolation.

```tsx
interface RadioOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}
interface RadioGroupProps {
  name?: string;
  value?: string;                        // controlled
  defaultValue?: string;                 // uncontrolled
  onValueChange?: (next: string) => void;
  options: RadioOption[];
  disabled?: boolean;
  required?: boolean;
  orientation?: "vertical" | "horizontal"; // default "vertical"
  error?: string;
  "aria-label"?: string;
}
```

Renders Radix `RadioGroup.Root` → one `<label class="fw-radio">` per option containing `RadioGroup.Item` + `RadioGroup.Indicator` + label text. Exported as `Radio` (group-level component) per the brief; the brief lists "Radio" not "RadioGroup", but a single radio is meaningless so the component is the group.

Ref forwarded to the group's root div.

### 3.5 Switch (Radix)

Wraps `@radix-ui/react-switch`.

```tsx
interface SwitchProps {
  name?: string;
  value?: string;                        // form value when on (default "on")
  checked?: boolean;                     // controlled
  defaultChecked?: boolean;              // uncontrolled
  onCheckedChange?: (next: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  label?: ReactNode;
  error?: string;
  id?: string;
}
```

Renders `<label class="fw-switch">` wrapping Radix `Switch.Root` (track) → `Switch.Thumb` and the optional label text. `data-state="checked"`/`"unchecked"` is set by Radix and used for styling.

Ref forwarded to the underlying button.

### 3.6 DateRangePicker (build, react-day-picker + Radix Popover)

```tsx
interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}
interface DateRangePickerProps {
  value?: DateRange;                     // controlled
  defaultValue?: DateRange;              // uncontrolled
  onChange?: (next: DateRange) => void;
  disabled?: boolean;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  error?: string;
  locale?: Locale;                       // override the LocaleProvider value
  "aria-label"?: string;
}
```

Renders a trigger `<button class="fw-input fw-input-{size}">` showing either the placeholder or the formatted range (e.g., "01/01/2026 — 31/01/2026" in pt-BR; `MM/dd/yyyy` in en-US) and a calendar icon. Clicking opens a Radix `Popover.Content` containing `react-day-picker`'s `<DayPicker mode="range" locale={dateFnsLocale} numberOfMonths={1} ... />`. The locale comes from `useLocale()` and resolves to either `ptBR` or `enUS` from `date-fns/locale`.

Ref forwarded to the trigger button.

## 4. Cross-cutting conventions

- **File layout per primitive:** `src/shared/ui/primitives/<Name>/{<Name>.tsx, <Name>.css, <Name>.test.tsx, index.ts}`.
- **CSS:** every `.css` wraps its rules in `@layer components { … }`. Co-located CSS imported as a side-effect at the top of the `.tsx`.
- **Class names:** `fw-*` prefix. New classes for this wave: `.fw-field`, `.fw-input`, `.fw-input-{sm|md|lg}`, `.fw-select`, `.fw-check`, `.fw-radio`, `.fw-switch`, `.fw-drp` plus `-{element}` suffixes (`fw-check-indicator`, `fw-switch-thumb`, etc.).
- **Refs:** every primitive uses `forwardRef`. For Radix-backed primitives the ref reaches the underlying interactive DOM element (button, input, etc.).
- **Density:** padding/spacing uses `--space-*` tokens.
- **Focus:** every interactive primitive shows `:focus-visible` outline `2px solid var(--accent)` at `2px` offset (matches Button).
- **A11y:**
  - Labels are programmatically associated (`<label htmlFor>` or wrapping label).
  - `aria-invalid="true"` and `aria-describedby={errorId}` are set when `error` is non-empty.
  - Decorative icons use the `<Icon>` primitive (which sets `aria-hidden`).
  - Radix wrappers preserve Radix's ARIA — we don't strip it.
- **Icon usage:** any new icon must be added to the `<Icon>` registry; no ad-hoc `lucide-react` imports outside that registry. Wave 4 needs the **`check`** and **`minus`** icons added (used by Checkbox indicator).
- **Locale:** `useLocale()` from `src/shared/config/locale`. DateRangePicker maps the locale string to `date-fns/locale` via a small constant map.
- **No domain logic:** primitives do not know about transactions, categories, accounts, or any feature.

## 5. Test contract per primitive

Every `<Name>.test.tsx` covers at minimum:

1. Smoke render with required props.
2. Each variant/size produces the expected class name.
3. `forwardRef` reaches the right DOM node.
4. A11y: `aria-invalid` is present iff `error` is set; `aria-describedby` points to the rendered error message; `aria-checked` / `aria-labelledby` etc. are present where applicable.
5. Basic interaction:
   - Input: typing fires `onChange`.
   - Select: clicking trigger then an option fires `onValueChange` with the option value.
   - Checkbox/Switch: clicking toggles `aria-checked`/`data-state` and fires `onCheckedChange`.
   - Radio: clicking an option fires `onValueChange`.
   - DateRangePicker: clicking the trigger opens the popover; clicking two days fires `onChange` with the range.
6. Controlled vs uncontrolled: setting `value`/`checked` ignores user attempts to change unless the consumer updates the prop.

## 6. Out of scope for Wave 4

- File input, color picker, slider, combobox, autocomplete — Wave 5 or later.
- Internationalization beyond pt-BR / en-US.
- Form state management — primitives are agnostic.
- Refactoring existing pages to use the new primitives.
- Storybook or any documentation surface beyond the test files.

## 7. Acceptance criteria

The wave is done when:

1. All six primitives are exported from `src/shared/ui/primitives/index.ts`.
2. Each primitive has a passing `.test.tsx` covering the §5 contract.
3. `npm run lint && npm run typecheck && npm test -- --run && npm run build` all pass.
4. The architectural test (`src/architecture.test.ts`) still passes.
5. New runtime dependencies (`@radix-ui/react-*`, `react-day-picker`, `date-fns`) are pinned to specific versions in `package.json`.

## 8. Files added or modified

New per primitive:
```
src/shared/ui/primitives/<Name>/<Name>.tsx
src/shared/ui/primitives/<Name>/<Name>.css
src/shared/ui/primitives/<Name>/<Name>.test.tsx
src/shared/ui/primitives/<Name>/index.ts
```

Modified:
- `src/shared/ui/primitives/index.ts` — append six new exports.
- `src/shared/ui/primitives/Icon/Icon.tsx` — add `check` and `minus` to the registry.
- `package.json` / `package-lock.json` — add the runtime deps.

No changes to `src/app/`, `tokens.css`, `tailwind.config`, or any of the existing primitives.

## 9. Risk register

- **Radix peer-dependency conflicts.** All listed Radix packages declare `react@^18 || ^19` as a peer; we're on 19.2 — no conflict. We pin one tested version per package and don't accept a `peerDependency` override silently.
- **`react-day-picker` v9 API.** v9 is a rewrite from v8; props (`mode="range"`, `selected`, `onSelect`) differ. The Plan locks in the v9 shape via the test.
- **CSS specificity vs Radix's data attributes.** Radix attaches `data-state="checked"` etc.; our CSS uses those selectors directly, no `important`. Tested in the primitive's own snapshot/class-presence tests.
- **A11y testing with Radix.** Radix renders inside portals; `screen.getByRole(...)` must use `screen.findByRole(...)` for popover content (it appears asynchronously). Tests use `findBy*` for popover-mounted elements.
