# Design System — Wave 3: Finance-Aware Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land `Money`, `Sparkline`, `KPIStat` plus a `LocaleProvider` so consumers can render finance-domain values consistently. After this wave, the future Overview screen can show real KPIs.

**Architecture:** Per the Wave 3 spec (`docs/superpowers/specs/2026-04-30-design-system-wave-3-design.md`): a small `LocaleProvider` (Zustand + localStorage, mirroring Theme/Density) feeds `Money`'s default locale. Each primitive uses the canonical Wave-2 template (forwardRef, co-located CSS in `@layer components`, side-effect import).

**Tech Stack:** TypeScript strict, React 19 (`forwardRef`), Vitest, Tailwind v4 `@layer components`, `Intl.NumberFormat` (no formatting library).

**Hard prerequisite:** Wave 2 PR merged into `develop`. The branch is created from a `develop` tip that already has Button/Card/Avatar/CategoryPill/Badge/Skeleton/EmptyState/Breadcrumb/Pagination.

---

### Task 1: Branch and add LocaleProvider

**Files:**
- Create: `src/app/providers/LocaleProvider.tsx`
- Create: `src/app/providers/LocaleProvider.test.tsx`

- [ ] **Step 1: Branch from develop**

```bash
git switch develop && git pull
git switch -c feature/ds-wave-3-primitives
```

- [ ] **Step 2: Write the failing test**

```tsx
// src/app/providers/LocaleProvider.test.tsx
import type { ReactNode } from "react";
import { act, render, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  LocaleProvider,
  useLocale,
  useLocaleStore,
} from "./LocaleProvider.js";

const STORAGE_KEY = "finew:locale";

beforeEach(() => {
  localStorage.clear();
  useLocaleStore.setState({ locale: "pt-BR" });
});

afterEach(() => {
  localStorage.clear();
});

describe("LocaleProvider", () => {
  it("defaults to pt-BR when nothing is stored", () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <LocaleProvider>{children}</LocaleProvider>
      ),
    });
    expect(result.current.locale).toBe("pt-BR");
  });

  it("applies stored value", () => {
    localStorage.setItem(STORAGE_KEY, "en-US");
    const { result } = renderHook(() => useLocale(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <LocaleProvider>{children}</LocaleProvider>
      ),
    });
    expect(result.current.locale).toBe("en-US");
  });

  it("setLocale persists and updates the hook value", () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <LocaleProvider>{children}</LocaleProvider>
      ),
    });
    act(() => {
      result.current.setLocale("en-US");
    });
    expect(result.current.locale).toBe("en-US");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("en-US");
  });

  it("renders children", () => {
    const { container } = render(
      <LocaleProvider>
        <span>x</span>
      </LocaleProvider>,
    );
    expect(container.textContent).toBe("x");
  });
});
```

- [ ] **Step 3: Run, verify FAIL** (`npm test -- --run src/app/providers/LocaleProvider.test.tsx`)

- [ ] **Step 4: Write LocaleProvider.tsx**

```tsx
// src/app/providers/LocaleProvider.tsx
import type { JSX, ReactNode } from "react";
import { useEffect } from "react";
import { create } from "zustand";

export type Locale = "pt-BR" | "en-US";

interface LocaleState {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const STORAGE_KEY = "finew:locale";

function readStored(): Locale {
  if (typeof window === "undefined") return "pt-BR";
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "en-US" ? "en-US" : "pt-BR";
  } catch {
    return "pt-BR";
  }
}

function safeWrite(value: Locale): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* noop */
  }
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: "pt-BR",
  setLocale: (locale) => {
    safeWrite(locale);
    set({ locale });
  },
}));

export function useLocale(): { locale: Locale; setLocale: (l: Locale) => void } {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  return { locale, setLocale };
}

export function LocaleProvider({ children }: { children: ReactNode }): JSX.Element {
  useEffect(() => {
    useLocaleStore.setState({ locale: readStored() });
  }, []);
  return <>{children}</>;
}
```

- [ ] **Step 5: Verify and commit**

```bash
npm test -- --run src/app/providers/LocaleProvider.test.tsx
git add src/app/providers/LocaleProvider.tsx src/app/providers/LocaleProvider.test.tsx
git commit -m "feat(ds): add LocaleProvider (pt-BR default, localStorage persistence)"
```

---

### Task 2: Wire LocaleProvider into App.tsx

**Files:** Modify `src/app/App.tsx`

- [ ] **Step 1: Add to App composition**

```tsx
// src/app/App.tsx
import type { JSX } from "react";
import { RouterProvider } from "react-router";
import { router } from "./router.js";
import { QueryProvider } from "./providers/QueryProvider.js";
import { ThemeProvider } from "./providers/ThemeProvider.js";
import { DensityProvider } from "./providers/DensityProvider.js";
import { LocaleProvider } from "./providers/LocaleProvider.js";

export function App(): JSX.Element {
  return (
    <QueryProvider>
      <ThemeProvider>
        <DensityProvider>
          <LocaleProvider>
            <RouterProvider router={router} />
          </LocaleProvider>
        </DensityProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
```

- [ ] **Step 2: Verify existing App tests still pass**

```bash
npm test -- --run src/app/App.test.tsx src/app/App.themes.test.tsx
```

- [ ] **Step 3: Commit**

```bash
git add src/app/App.tsx
git commit -m "feat(ds): wrap RouterProvider in LocaleProvider"
```

---

### Task 3: `<Money>` primitive

**Files:**
- Create: `src/shared/ui/primitives/Money/{Money.tsx, Money.css, Money.test.tsx, index.ts}`
- Modify: `src/shared/ui/primitives/index.ts`

- [ ] **Step 1: Write the failing test**

```tsx
// src/shared/ui/primitives/Money/Money.test.tsx
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Money } from "./Money.js";
import { useLocaleStore } from "../../../../app/providers/LocaleProvider.js";

beforeEach(() => {
  useLocaleStore.setState({ locale: "pt-BR" });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("<Money>", () => {
  it("renders BRL with comma decimal under pt-BR", () => {
    render(<Money amount={12483.9} />);
    expect(screen.getByText(/12\.483,90/)).toBeInTheDocument();
  });

  it("renders USD with period decimal under en-US locale prop", () => {
    render(<Money amount={12483.9} currency="USD" locale="en-US" />);
    expect(screen.getByText(/12,483\.90/)).toBeInTheDocument();
  });

  it('uses U+2212 minus for negative amounts', () => {
    const { container } = render(<Money amount={-100} />);
    expect(container.textContent).toContain("−");
    expect(container.textContent).not.toContain("-1");
  });

  it("renders + with sign='always' on positives", () => {
    const { container } = render(<Money amount={100} sign="always" />);
    expect(container.textContent).toContain("+");
  });

  it("never renders sign with sign='never'", () => {
    const { container } = render(<Money amount={-100} sign="never" />);
    expect(container.textContent).not.toContain("−");
    expect(container.textContent).not.toContain("-");
  });

  it("renders em-dash for null", () => {
    const { container } = render(<Money amount={null} />);
    expect(container.textContent).toBe("—");
  });

  it("renders em-dash for undefined", () => {
    const { container } = render(<Money amount={undefined} />);
    expect(container.textContent).toBe("—");
  });

  it("renders em-dash for NaN", () => {
    const { container } = render(<Money amount={NaN} />);
    expect(container.textContent).toBe("—");
  });

  it("respects useLocale context default", () => {
    useLocaleStore.setState({ locale: "en-US" });
    render(<Money amount={1000} currency="USD" />);
    expect(screen.getByText(/1,000\.00/)).toBeInTheDocument();
  });

  it("applies fw-money-display class with display prop", () => {
    const { container } = render(<Money amount={1} display />);
    expect(container.firstElementChild).toHaveClass("fw-money-display");
  });

  it("forwards refs", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Money ref={ref} amount={1} />);
    expect(ref.current?.tagName).toBe("SPAN");
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

- [ ] **Step 3: Write Money.css**

```css
/* src/shared/ui/primitives/Money/Money.css */
@layer components {
  .fw-money {
    font-variant-numeric: tabular-nums lining-nums;
    font-feature-settings: "tnum" 1, "lnum" 1;
    white-space: nowrap;
  }
  .fw-money-display {
    font-family: var(--font-serif);
    font-weight: 500;
  }
  .fw-money-sign {
    margin-right: 1px;
  }
  .fw-money-symbol {
    color: var(--fg-3);
    margin-right: 4px;
    font-size: 0.7em;
    vertical-align: 0.18em;
  }
  .fw-money-display .fw-money-symbol {
    font-size: 0.55em;
    vertical-align: 0.4em;
  }
}
```

- [ ] **Step 4: Write Money.tsx**

```tsx
// src/shared/ui/primitives/Money/Money.tsx
import type { ForwardedRef, HTMLAttributes, JSX } from "react";
import { forwardRef } from "react";
import { useLocale, type Locale } from "../../../../app/providers/LocaleProvider.js";
import "./Money.css";

export type MoneySign = "auto" | "always" | "never";

export interface MoneyProps extends HTMLAttributes<HTMLSpanElement> {
  amount: number | null | undefined;
  currency?: string;
  locale?: Locale;
  sign?: MoneySign;
  display?: boolean;
}

interface FormattedParts {
  prefix: string;
  symbol: string;
  body: string;
  ariaLabel: string;
}

function isInvalid(amount: number | null | undefined): amount is null | undefined {
  return amount === null || amount === undefined || Number.isNaN(amount);
}

function format(
  amount: number,
  currency: string,
  locale: Locale,
  sign: MoneySign,
): FormattedParts {
  const abs = Math.abs(amount);
  const fmt = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const parts = fmt.formatToParts(abs);
  const symbolPart = parts.find((p) => p.type === "currency");
  const symbol = symbolPart ? symbolPart.value : "";
  const body = parts
    .filter((p) => p.type !== "currency" && p.type !== "literal")
    .map((p) => p.value)
    .join("")
    .trim();
  let prefix = "";
  if (sign === "always") prefix = amount >= 0 ? "+" : "−";
  else if (sign === "auto" && amount < 0) prefix = "−";
  const ariaLabel = `${prefix}${fmt.format(abs).replace(/-/g, "−")}`;
  return { prefix, symbol, body, ariaLabel };
}

function MoneyImpl(
  {
    amount,
    currency = "BRL",
    locale,
    sign = "auto",
    display = false,
    className,
    ...rest
  }: MoneyProps,
  ref: ForwardedRef<HTMLSpanElement>,
): JSX.Element {
  const ctx = useLocale();
  const effectiveLocale: Locale = locale ?? ctx.locale;
  const classes = [
    "fw-money",
    display ? "fw-money-display" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (isInvalid(amount)) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(
        `<Money> received invalid amount: ${String(amount)}. Rendering em-dash.`,
      );
    }
    return (
      <span ref={ref} className={classes} aria-label="—" {...rest}>
        {"—"}
      </span>
    );
  }

  const { prefix, symbol, body, ariaLabel } = format(
    amount,
    currency,
    effectiveLocale,
    sign,
  );
  return (
    <span ref={ref} className={classes} aria-label={ariaLabel} {...rest}>
      {prefix && (
        <span className="fw-money-sign" aria-hidden="true">
          {prefix}
        </span>
      )}
      <span className="fw-money-symbol" aria-hidden="true">
        {symbol}
      </span>
      <span className="fw-money-body" aria-hidden="true">
        {body}
      </span>
    </span>
  );
}

export const Money = forwardRef(MoneyImpl);
Money.displayName = "Money";
```

- [ ] **Step 5: Barrel + index**

```ts
// src/shared/ui/primitives/Money/index.ts
export { Money } from "./Money.js";
export type { MoneyProps, MoneySign } from "./Money.js";
```

Append `export * from "./Money/index.js";` to `src/shared/ui/primitives/index.ts`.

- [ ] **Step 6: Verify and commit**

```bash
npm test -- --run src/shared/ui/primitives/Money/Money.test.tsx
git add src/shared/ui/primitives/Money src/shared/ui/primitives/index.ts
git commit -m "feat(ds): add <Money> primitive (BRL/USD via Intl.NumberFormat, U+2212 minus, em-dash for invalid)"
```

---

### Task 4: `<Sparkline>` primitive

**Files:**
- Create: `src/shared/ui/primitives/Sparkline/{Sparkline.tsx, Sparkline.css, Sparkline.test.tsx, index.ts}`
- Modify: `src/shared/ui/primitives/index.ts`

- [ ] **Step 1: Write the failing test**

```tsx
// src/shared/ui/primitives/Sparkline/Sparkline.test.tsx
import { createRef } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Sparkline } from "./Sparkline.js";

describe("<Sparkline>", () => {
  it("renders an svg with the path for multiple values", () => {
    const { container } = render(<Sparkline values={[1, 2, 3, 4]} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.querySelectorAll("path").length).toBeGreaterThanOrEqual(1);
  });

  it("renders nothing for an empty values array", () => {
    const { container } = render(<Sparkline values={[]} />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("renders a horizontal line for a single value", () => {
    const { container } = render(<Sparkline values={[5]} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.querySelector("line")).not.toBeNull();
  });

  it.each(["gain", "loss", "neutral"] as const)(
    "applies the %s tone via stroke",
    (tone) => {
      const { container } = render(<Sparkline values={[1, 2, 3]} tone={tone} />);
      const path = container.querySelector("path[stroke]");
      expect(path?.getAttribute("stroke")).toContain(
        tone === "gain" ? "--gain" : tone === "loss" ? "--loss" : "--accent",
      );
    },
  );

  it("uses an explicit color over the tone", () => {
    const { container } = render(
      <Sparkline values={[1, 2, 3]} tone="gain" color="#123456" />,
    );
    const path = container.querySelector("path[stroke]");
    expect(path?.getAttribute("stroke")).toBe("#123456");
  });

  it("forwards refs to the svg", () => {
    const ref = createRef<SVGSVGElement>();
    render(<Sparkline ref={ref} values={[1, 2, 3]} />);
    expect(ref.current?.tagName.toLowerCase()).toBe("svg");
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

- [ ] **Step 3: Write Sparkline.css** (minimal — most styling is via SVG attrs)

```css
/* src/shared/ui/primitives/Sparkline/Sparkline.css */
@layer components {
  .fw-sparkline {
    display: inline-block;
    vertical-align: middle;
  }
}
```

- [ ] **Step 4: Write Sparkline.tsx**

```tsx
// src/shared/ui/primitives/Sparkline/Sparkline.tsx
import type { ForwardedRef, JSX, SVGAttributes } from "react";
import { forwardRef } from "react";
import "./Sparkline.css";

export type SparklineTone = "gain" | "loss" | "neutral";

export interface SparklineProps
  extends Omit<SVGAttributes<SVGSVGElement>, "values" | "color"> {
  values: number[];
  width?: number;
  height?: number;
  tone?: SparklineTone;
  color?: string;
  fill?: boolean;
}

const TONE_COLOR: Record<SparklineTone, string> = {
  gain: "var(--gain)",
  loss: "var(--loss)",
  neutral: "var(--accent)",
};

function SparklineImpl(
  {
    values,
    width = 120,
    height = 32,
    tone = "neutral",
    color,
    fill = true,
    className,
    ...rest
  }: SparklineProps,
  ref: ForwardedRef<SVGSVGElement>,
): JSX.Element | null {
  if (values.length === 0) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn("<Sparkline> received an empty values array.");
    }
    return null;
  }

  const stroke = color ?? TONE_COLOR[tone];
  const classes = ["fw-sparkline", className].filter(Boolean).join(" ");

  if (values.length === 1) {
    const y = height / 2;
    return (
      <svg
        ref={ref}
        className={classes}
        width={width}
        height={height}
        viewBox={`0 0 ${String(width)} ${String(height)}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        {...rest}
      >
        <line
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = width / (values.length - 1);
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - 2 - ((v - min) / span) * (height - 4);
    return [x, y] as const;
  });
  const path = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const fillPath = `${path} L${String(width)},${String(height)} L0,${String(height)} Z`;

  return (
    <svg
      ref={ref}
      className={classes}
      width={width}
      height={height}
      viewBox={`0 0 ${String(width)} ${String(height)}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      {...rest}
    >
      {fill ? <path d={fillPath} fill={stroke} opacity="0.08" /> : null}
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const Sparkline = forwardRef(SparklineImpl);
Sparkline.displayName = "Sparkline";
```

- [ ] **Step 5: Barrel + index**

```ts
// src/shared/ui/primitives/Sparkline/index.ts
export { Sparkline } from "./Sparkline.js";
export type { SparklineProps, SparklineTone } from "./Sparkline.js";
```

Append `export * from "./Sparkline/index.js";` to the primitives index.

- [ ] **Step 6: Verify and commit**

```bash
npm test -- --run src/shared/ui/primitives/Sparkline/Sparkline.test.tsx
git add src/shared/ui/primitives/Sparkline src/shared/ui/primitives/index.ts
git commit -m "feat(ds): add <Sparkline> primitive (hand-rolled SVG, tone-aware stroke)"
```

---

### Task 5: `<KPIStat>` primitive

**Files:**
- Create: `src/shared/ui/primitives/KPIStat/{KPIStat.tsx, KPIStat.css, KPIStat.test.tsx, index.ts}`
- Modify: `src/shared/ui/primitives/index.ts`

- [ ] **Step 1: Write the failing test**

```tsx
// src/shared/ui/primitives/KPIStat/KPIStat.test.tsx
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { KPIStat } from "./KPIStat.js";
import { useLocaleStore } from "../../../../app/providers/LocaleProvider.js";

beforeEach(() => {
  useLocaleStore.setState({ locale: "pt-BR" });
});

afterEach(() => {
  useLocaleStore.setState({ locale: "pt-BR" });
});

describe("<KPIStat>", () => {
  it("renders the label and value", () => {
    render(<KPIStat label="Saldo" value={12483.9} />);
    expect(screen.getByText("Saldo")).toBeInTheDocument();
    expect(screen.getByText(/12\.483,90/)).toBeInTheDocument();
  });

  it("renders a positive delta with verbal aria-label (pt-BR)", () => {
    const { container } = render(
      <KPIStat label="x" value={1} delta={2.4} deltaLabel="vs. mês anterior" />,
    );
    const delta = container.querySelector(".fw-kpi-delta");
    expect(delta?.getAttribute("aria-label")).toContain("alta de 2,4 por cento");
    expect(delta?.getAttribute("aria-label")).toContain("vs. mês anterior");
  });

  it("renders a negative delta as 'baixa' in pt-BR", () => {
    const { container } = render(<KPIStat label="x" value={1} delta={-1.2} />);
    const delta = container.querySelector(".fw-kpi-delta");
    expect(delta?.getAttribute("aria-label")).toContain("baixa de 1,2 por cento");
  });

  it("renders an English aria-label under en-US", () => {
    useLocaleStore.setState({ locale: "en-US" });
    const { container } = render(
      <KPIStat label="x" value={1} delta={2.4} deltaLabel="vs. last month" />,
    );
    const delta = container.querySelector(".fw-kpi-delta");
    expect(delta?.getAttribute("aria-label")).toContain("up 2.4 percent");
    expect(delta?.getAttribute("aria-label")).toContain("vs. last month");
  });

  it("renders an inline sparkline when sparkline prop is set", () => {
    const { container } = render(
      <KPIStat label="x" value={1} sparkline={[1, 2, 3]} />,
    );
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("forwards refs to the wrapper", () => {
    const ref = createRef<HTMLDivElement>();
    render(<KPIStat ref={ref} label="x" value={1} />);
    expect(ref.current?.tagName).toBe("DIV");
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

- [ ] **Step 3: Write KPIStat.css**

```css
/* src/shared/ui/primitives/KPIStat/KPIStat.css */
@layer components {
  .fw-kpi {
    padding: 18px 20px;
    background: var(--surface-1);
    border: var(--hairline);
    border-radius: var(--radius-lg);
  }
  .fw-kpi-value {
    font-family: var(--font-serif);
    font-weight: 500;
    font-size: 28px;
    line-height: 1.1;
    margin-top: 8px;
  }
  .fw-kpi-delta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    margin-top: 8px;
    font-variant-numeric: tabular-nums lining-nums;
  }
  .fw-kpi-delta.is-gain { color: var(--gain); }
  .fw-kpi-delta.is-loss { color: var(--loss); }
  .fw-kpi-delta-label {
    color: var(--fg-3);
    margin-left: 4px;
    font-weight: 400;
  }
  .fw-kpi-spark {
    margin-top: 10px;
  }
  [data-density="compact"] .fw-kpi {
    padding: 12px 14px;
  }
  [data-density="compact"] .fw-kpi-value {
    font-size: 22px;
  }
}
```

- [ ] **Step 4: Write KPIStat.tsx**

```tsx
// src/shared/ui/primitives/KPIStat/KPIStat.tsx
import type { ForwardedRef, HTMLAttributes, JSX } from "react";
import { forwardRef } from "react";
import { Icon } from "../Icon/Icon.js";
import { Money } from "../Money/Money.js";
import { Sparkline, type SparklineTone } from "../Sparkline/Sparkline.js";
import {
  useLocale,
  type Locale,
} from "../../../../app/providers/LocaleProvider.js";
import "./KPIStat.css";

export interface KPIStatProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: number | null | undefined;
  currency?: string;
  delta?: number;
  deltaLabel?: string;
  sparkline?: number[];
  sparkTone?: SparklineTone;
}

function formatDeltaPercent(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(value));
}

function buildDeltaAriaLabel(
  delta: number,
  deltaLabel: string | undefined,
  locale: Locale,
): string {
  const magnitude = formatDeltaPercent(delta, locale);
  if (locale === "en-US") {
    const direction = delta >= 0 ? "up" : "down";
    return [`${direction} ${magnitude} percent`, deltaLabel]
      .filter(Boolean)
      .join(" ");
  }
  const direction = delta >= 0 ? "alta" : "baixa";
  return [`${direction} de ${magnitude} por cento`, deltaLabel]
    .filter(Boolean)
    .join(" ");
}

function KPIStatImpl(
  {
    label,
    value,
    currency = "BRL",
    delta,
    deltaLabel,
    sparkline,
    sparkTone,
    className,
    ...rest
  }: KPIStatProps,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  const { locale } = useLocale();
  const classes = ["fw-kpi", className].filter(Boolean).join(" ");
  const isGain = delta !== undefined && delta >= 0;
  const deltaClass = `fw-kpi-delta ${isGain ? "is-gain" : "is-loss"}`;
  const deltaAria =
    delta !== undefined ? buildDeltaAriaLabel(delta, deltaLabel, locale) : "";
  const formattedDelta =
    delta !== undefined ? formatDeltaPercent(delta, locale) : "";

  return (
    <div ref={ref} className={classes} {...rest}>
      <div className="t-micro">{label}</div>
      <div className="fw-kpi-value">
        <Money amount={value} currency={currency} display sign="never" />
      </div>
      {delta !== undefined ? (
        <div className={deltaClass} aria-label={deltaAria}>
          <Icon name={isGain ? "arrowUp" : "arrowDown"} size={12} />
          <span aria-hidden="true">
            {isGain ? "+" : "−"}
            {formattedDelta}%
          </span>
          {deltaLabel ? (
            <span className="fw-kpi-delta-label" aria-hidden="true">
              {deltaLabel}
            </span>
          ) : null}
        </div>
      ) : null}
      {sparkline ? (
        <div className="fw-kpi-spark">
          <Sparkline values={sparkline} width={240} height={36} tone={sparkTone} />
        </div>
      ) : null}
    </div>
  );
}

export const KPIStat = forwardRef(KPIStatImpl);
KPIStat.displayName = "KPIStat";
```

- [ ] **Step 5: Barrel + index**

```ts
// src/shared/ui/primitives/KPIStat/index.ts
export { KPIStat } from "./KPIStat.js";
export type { KPIStatProps } from "./KPIStat.js";
```

Append `export * from "./KPIStat/index.js";` to the primitives index.

- [ ] **Step 6: Verify and commit**

```bash
npm test -- --run src/shared/ui/primitives/KPIStat/KPIStat.test.tsx
git add src/shared/ui/primitives/KPIStat src/shared/ui/primitives/index.ts
git commit -m "feat(ds): add <KPIStat> primitive (Money + Sparkline + verbal delta aria-label)"
```

---

### Task 6: Final verification + push + PR

- [ ] **Step 1: Full pipeline**

```bash
npm run lint && npm run typecheck && npm test -- --run && npm run build
```

Expected PASS on all four. Test count climbs by ~30 (LocaleProvider 4, Money 11, Sparkline 8, KPIStat 6).

- [ ] **Step 2: Push branch**

```bash
git push -u origin feature/ds-wave-3-primitives
```

CI auto-opens or finds the PR.

- [ ] **Step 3: Edit PR title and body**

Title: `feat(ds): wave 3 — finance-aware primitives (Money, Sparkline, KPIStat) + LocaleProvider`

Body should summarize the three primitives, the LocaleProvider addition, the en-US/pt-BR switch test, and reference the spec.

- [ ] **Step 4: Hand-off**

After CI green and review, merge with **"Squash and merge"** (feature → develop). Wave 4 (form primitives — Input, Select, Checkbox, Radio, Switch, DateRangePicker) becomes the next eligible wave.

---

## Acceptance criteria

This wave is done when:

1. `LocaleProvider` and `useLocale()` exist in `src/app/providers/LocaleProvider.tsx` and are wired in `<App>`.
2. `<Money>`, `<Sparkline>`, `<KPIStat>` are exported from `src/shared/ui/primitives/index.ts`.
3. Each primitive's `.test.tsx` passes the contract: smoke render, every prop variant, ref forwarding, A11y attributes, locale switching where relevant.
4. `npm run lint`, `npm run typecheck`, `npm test -- --run`, `npm run build` all pass.
5. The architecture test still passes.
6. Switching `useLocale().setLocale("en-US")` flips an existing pt-BR `<Money>` to `$` formatting.
