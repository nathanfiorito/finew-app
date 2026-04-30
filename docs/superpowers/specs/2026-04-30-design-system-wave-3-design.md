# Design System — Wave 3: Finance-Aware Primitives Spec

**Date:** 2026-04-30
**Status:** Draft — pending user review
**Scope:** Implementation spec for the third wave of the design system: ship the three finance-domain primitives (`Money`, `Sparkline`, `KPIStat`) plus the small `LocaleProvider` they depend on. Implementation plan derived from this spec lives at `docs/superpowers/plans/2026-04-30-design-system-wave-3.md`.

## 1. Goal

Land the primitives that make Finew look like a finance app (instead of a generic CRUD): tabular money with currency awareness and explicit signs, inline sparklines, KPI stats that compose money + sparkline + delta. After this wave, the future Overview/Transactions pages can render real data presentations.

## 2. Open decisions resolved (proposed)

| Decision | Choice | Rationale |
| --- | --- | --- |
| Locale source | **`LocaleContext`** with default `pt-BR`, override via prop | Single source of truth; future i18n swap is one provider change. |
| `Money` invalid input handling | **Render `—` (em-dash, U+2014)** in production; `console.warn` in dev only | Avoid layout-breaking throws in real surfaces; surface bugs in dev. |
| Sparkline tone | **`tone="gain" \| "loss" \| "neutral"`** mapping to `--gain` / `--loss` / `--accent` | Consumers don't compute color from amount sign — they declare intent. |
| KPI delta A11y | **Verbal `aria-label`** on the delta line ("alta de 2,4 por cento vs período anterior") | Screen readers shouldn't announce "+2.4%" as "plus two point four percent" untranslated. |

## 3. Primitives in scope

Three primitives + one provider. All exist as references in the Claude Design kit (`docs/design-system-reference/ui_kits/finew-pwa/Components.jsx`); ports to TS/React 19/FSD with the additions above.

### 3.1 `LocaleProvider` + `useLocale` (new in Wave 3, lives in `src/app/providers/`)

`Money` formatting depends on locale rules (decimal separator, thousands separator, currency symbol position). Putting locale in a context lets every Money in the tree pick it up without prop-drilling.

```tsx
type Locale = "pt-BR" | "en-US";
interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}
```

Default `pt-BR`. Persisted to `localStorage` under `finew:locale` (mirroring `ThemeProvider` and `DensityProvider`). `<App>` wraps `<RouterProvider>` with `<LocaleProvider>` — same shape as the existing two providers.

`Money` consumes `useLocale()` for default; an explicit `locale` prop overrides for one-off cases (e.g., showing a USD account balance in a pt-BR app).

### 3.2 `<Money>` (port + generalize)

The kit's `formatMoney` already uses `Intl.NumberFormat` correctly but is hardcoded to BRL/USD. Generalize.

```tsx
type MoneySign = "auto" | "always" | "never";

interface MoneyProps extends HTMLAttributes<HTMLSpanElement> {
  amount: number | null | undefined;     // null/undefined → em-dash
  currency?: string;                     // ISO 4217; default "BRL"
  locale?: "pt-BR" | "en-US";            // overrides context
  sign?: MoneySign;                      // default "auto"
  display?: boolean;                     // hero serif rendering, used in KPIStat
}
```

Behavior:

- Valid amount: format via `Intl.NumberFormat(locale, { style: "currency", currency, ... })`. Override the sign rendering: never use the locale's default minus glyph; always use **U+2212** (real minus). Sign rules per `sign` prop:
  - `"auto"` (default): render leading `−` for negatives, no leading char for non-negatives.
  - `"always"`: render leading `+` for non-negatives, `−` for negatives.
  - `"never"`: never render a leading sign (used in KPIStat hero values where the magnitude is the headline).
- Invalid amount (`null` / `undefined` / `NaN`): render `—` (U+2014 em-dash). In dev, `console.warn` once per call site.
- Currency symbol is rendered in a smaller, dimmer slot (`<span class="fw-money-symbol">`) following the kit's pattern. Body in `tabular-nums lining-nums`.
- `display` adds `fw-money-display` (serif body, larger symbol offset) on top of `fw-money`.
- A11y: the `<span>` carries `aria-label` with a verbal version ("doze mil quatrocentos e oitenta e três reais e noventa centavos" is overkill — settle for "R$ 12.483,90" with the sign read out, since `Intl.NumberFormat` already produces a readable string for screen readers when the spans aren't broken up; simplest: render the formatted full string in `aria-label`, and keep the styled spans `aria-hidden="true"`).

### 3.3 `<Sparkline>` (port + tone prop)

Port the kit's hand-rolled SVG. Add `tone` prop that selects stroke color from a token; allow explicit `color` to override.

```tsx
interface SparklineProps {
  values: number[];                      // at least 1
  width?: number;                        // default 120
  height?: number;                       // default 32
  tone?: "gain" | "loss" | "neutral";    // default "neutral" → --accent
  color?: string;                        // explicit override
  fill?: boolean;                        // default true; translucent area fill at 8% opacity
}
```

Notes:

- Single hairline path (1.5px stroke), `strokeLinejoin="round"`, `strokeLinecap="round"`.
- Renders an `<svg aria-hidden="true">` with `preserveAspectRatio="none"` per the kit.
- 1-point fallback: when `values.length === 1`, render a single horizontal line at the midpoint (no slope to draw).
- 0-point safety: `values.length === 0` renders nothing (returns `null`); a console.warn in dev.

### 3.4 `<KPIStat>` (port + a11y delta)

Composes `Money` (display variant) + optional `Sparkline` + optional delta line.

```tsx
interface KPIStatProps extends HTMLAttributes<HTMLDivElement> {
  label: string;                         // micro-uppercase eyebrow
  value: number | null | undefined;      // primary metric
  currency?: string;                     // forwarded to Money
  delta?: number;                        // signed percentage; e.g., 2.4 means +2.4%
  deltaLabel?: string;                   // e.g., "vs. mês anterior"
  sparkline?: number[];                  // optional inline sparkline
  sparkTone?: "gain" | "loss" | "neutral";
}
```

Layout (per the kit):
- `t-micro` eyebrow with `label`
- `Money` rendered as `display` with `sign="never"` (the magnitude is the headline; sign moves to the delta line)
- Delta line: ▲/▼ icon + `+/−X,X%` + optional `deltaLabel`
- Optional Sparkline below

A11y: the delta line gets a verbal `aria-label` such as `"alta de 2,4 por cento vs. mês anterior"` (or `baixa` for negative). Numeric formatting uses the `LocaleProvider` locale.

## 4. Cross-cutting conventions

- File layout per primitive: same as Wave 2 (`<Name>.tsx`, `<Name>.css`, `<Name>.test.tsx`, `index.ts`), under `src/shared/ui/primitives/`.
- CSS in `@layer components`, side-effect import.
- `forwardRef` for every primitive.
- Tests reuse the Wave 2 contract: smoke render, every prop variant, ref forwarding, A11y attributes.
- `LocaleProvider` follows the `ThemeProvider`/`DensityProvider` shape exactly: Zustand store with safe localStorage access, `useLocale()` hook returning `{ locale, setLocale }`.

## 5. Files added or modified

New:

```
src/app/providers/LocaleProvider.tsx
src/app/providers/LocaleProvider.test.tsx
src/shared/ui/primitives/Money/Money.tsx
src/shared/ui/primitives/Money/Money.css
src/shared/ui/primitives/Money/Money.test.tsx
src/shared/ui/primitives/Money/index.ts
src/shared/ui/primitives/Sparkline/Sparkline.tsx
src/shared/ui/primitives/Sparkline/Sparkline.css
src/shared/ui/primitives/Sparkline/Sparkline.test.tsx
src/shared/ui/primitives/Sparkline/index.ts
src/shared/ui/primitives/KPIStat/KPIStat.tsx
src/shared/ui/primitives/KPIStat/KPIStat.css
src/shared/ui/primitives/KPIStat/KPIStat.test.tsx
src/shared/ui/primitives/KPIStat/index.ts
```

Modified:

- `src/app/App.tsx` — wrap with `<LocaleProvider>` (innermost-but-one, between Theme/Density and the Router).
- `src/shared/ui/primitives/index.ts` — append three new exports.
- `src/app/App.themes.test.tsx` — extend smoke test to also flip locale and assert no errors.

## 6. Acceptance criteria

The wave is done when:

1. `<Money>`, `<Sparkline>`, `<KPIStat>` are exported from `src/shared/ui/primitives/index.ts`.
2. `<LocaleProvider>` and `useLocale()` are exported from `src/app/providers/LocaleProvider.tsx` and wired in `<App>`.
3. Each primitive's `.test.tsx` covers the §4 contract from Wave 2 plus locale switching for `Money`.
4. `npm run lint && npm run typecheck && npm test -- --run && npm run build` all pass.
5. The architecture test still passes.
6. Switching `useLocale().setLocale("en-US")` in a render flips an existing pt-BR `Money` to `$` and the en-US separator pattern.

## 7. Out of scope

- `<DateRangePicker>` (Wave 4 — form primitive).
- Domain entities (`Account`, `Transaction`, `Budget`).
- Page composition / replacing `HomePage`'s placeholders.
- Storybook.
- Real charts beyond sparklines (deferred until a real consumer needs them; library decision lives in a future wave).

## 8. Risk register

- **`Intl.NumberFormat` minus glyph drift.** Different node/browser versions emit slightly different minus glyphs (hyphen-minus vs U+2212). We always strip and re-emit U+2212 to normalize.
- **`LocaleProvider` adding work that should be its own wave.** Mitigated: it's ~40 lines mirroring two existing providers, and `Money` is unusable without a locale source. Bundling it here is cheaper than a one-component wave.
- **`<Money>` `aria-label` cost.** Computing two strings per render (visible spans + full label) doubles formatter calls. `Intl.NumberFormat` is fast; we accept the cost. If it shows up in profiling later, memoize per (amount, currency, locale) tuple.
