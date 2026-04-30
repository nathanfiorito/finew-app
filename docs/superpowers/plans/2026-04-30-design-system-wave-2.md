# Design System — Wave 2: Basic Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land nine presentational primitives (Button, Card, Avatar, CategoryPill, Badge, Skeleton, EmptyState, Breadcrumb, Pagination) in `src/shared/ui/primitives/`, each with TS source, co-located CSS, tests, and barrel exports. After this wave, page-level work in Wave-after-DS can compose real primitives.

**Architecture:** Per the Wave 2 spec (`docs/superpowers/specs/2026-04-30-design-system-wave-2-design.md`): each primitive lives in its own folder with `<Name>.tsx`, `<Name>.css` (rules wrapped in `@layer components`), `<Name>.test.tsx`, and `index.ts`. CSS uses the `fw-*` prefix already established by the Claude Design kit. Every primitive uses `React.forwardRef`. Density-aware spacing comes from `--space-*` tokens (which already swap under `[data-density="compact"]`).

**Tech Stack:** TypeScript strict, React 19 (`forwardRef`), Vitest + `@testing-library/react`, Tailwind v4 `@layer components`, `lucide-react` (already wrapped behind `<Icon>`).

**Hard prerequisite:** PR #11 / #12 / #13 / #14 / Wave-1 PR all merged into `develop`. The `<Icon>` primitive must exist at `src/shared/ui/primitives/Icon/`.

**Reference:** the Claude Design output at `docs/design-system-reference/ui_kits/finew-pwa/` (`Components.jsx` and `kit.css`) is the source of truth for ports.

---

### Task 1: Branch and lock the primitive template via Button

Button is the most complex primitive; building it first locks the conventions every later primitive reuses (forwardRef pattern, CSS @layer wrapping, side-effect CSS import, test contract).

**Files:**
- Create: `src/shared/ui/primitives/Button/Button.tsx`
- Create: `src/shared/ui/primitives/Button/Button.css`
- Create: `src/shared/ui/primitives/Button/Button.test.tsx`
- Create: `src/shared/ui/primitives/Button/index.ts`
- Modify: `src/shared/ui/primitives/index.ts`

- [ ] **Step 1: Branch from develop**

```bash
git switch develop && git pull
git switch -c feature/ds-wave-2-primitives
```

- [ ] **Step 2: Write the failing test**

```tsx
// src/shared/ui/primitives/Button/Button.test.tsx
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button.js";

describe("<Button>", () => {
  it("renders a button element with the label", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it.each(["primary", "secondary", "ghost", "danger"] as const)(
    "applies the %s variant class",
    (variant) => {
      render(<Button variant={variant}>x</Button>);
      expect(screen.getByRole("button")).toHaveClass(`fw-btn-${variant}`);
    },
  );

  it.each(["sm", "md", "lg"] as const)("applies the %s size class", (size) => {
    render(<Button size={size}>x</Button>);
    expect(screen.getByRole("button")).toHaveClass(`fw-btn-${size}`);
  });

  it("forwards refs to the underlying button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>x</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("renders a leading icon when iconLeading is provided", () => {
    const { container } = render(<Button iconLeading="plus">Add</Button>);
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("renders both icons when both slots are filled", () => {
    const { container } = render(
      <Button iconLeading="plus" iconTrailing="chevronRight">
        Next
      </Button>,
    );
    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });

  it("disables and aria-disables when loading", () => {
    render(<Button loading>x</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("forwards onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>x</Button>);
    screen.getByRole("button").click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when loading", () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        x
      </Button>,
    );
    screen.getByRole("button").click();
    expect(onClick).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npm test -- --run src/shared/ui/primitives/Button/Button.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 4: Write Button.css**

```css
/* src/shared/ui/primitives/Button/Button.css */
@layer components {
  .fw-btn {
    font-family: var(--font-sans);
    font-weight: 500;
    border-radius: var(--radius-md);
    border: 1px solid transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background var(--duration-2) var(--ease-standard),
      color var(--duration-2) var(--ease-standard),
      border-color var(--duration-2) var(--ease-standard);
  }
  .fw-btn:active:not(:disabled) {
    transform: translateY(1px);
  }
  .fw-btn:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .fw-btn:disabled,
  .fw-btn[aria-disabled="true"] {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .fw-btn-sm { height: 28px; padding: 0 10px; font-size: 12.5px; }
  .fw-btn-md { height: 36px; padding: 0 14px; font-size: 13.5px; }
  .fw-btn-lg { height: 44px; padding: 0 18px; font-size: 15px; }

  .fw-btn-primary {
    background: var(--accent);
    color: var(--accent-fg);
  }
  .fw-btn-primary:hover:not(:disabled) {
    background: var(--accent-hover);
  }
  .fw-btn-secondary {
    background: var(--surface-1);
    color: var(--fg-1);
    border-color: var(--border-2);
  }
  .fw-btn-secondary:hover:not(:disabled) {
    background: var(--surface-2);
  }
  .fw-btn-ghost {
    background: transparent;
    color: var(--fg-1);
  }
  .fw-btn-ghost:hover:not(:disabled) {
    background: var(--surface-2);
  }
  .fw-btn-danger {
    background: transparent;
    color: var(--loss);
    border-color: var(--border-2);
  }
  .fw-btn-danger:hover:not(:disabled) {
    background: var(--loss-soft);
  }

  .fw-btn-spinner {
    width: 12px;
    height: 12px;
    border: 1.5px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: fw-btn-spin 0.7s linear infinite;
  }
  @keyframes fw-btn-spin {
    to { transform: rotate(360deg); }
  }
  @media (prefers-reduced-motion: reduce) {
    .fw-btn-spinner { animation: none; }
  }
}
```

- [ ] **Step 5: Write Button.tsx**

```tsx
// src/shared/ui/primitives/Button/Button.tsx
import type { ButtonHTMLAttributes, ForwardedRef } from "react";
import { forwardRef } from "react";
import { Icon, type IconName } from "../Icon/Icon.js";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeading?: IconName;
  iconTrailing?: IconName;
  loading?: boolean;
}

function ButtonImpl(
  {
    variant = "primary",
    size = "md",
    iconLeading,
    iconTrailing,
    loading = false,
    disabled,
    type = "button",
    className,
    children,
    onClick,
    ...rest
  }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
): JSX.Element {
  const iconSize = size === "sm" ? 14 : 16;
  const isDisabled = disabled === true || loading;
  const classes = ["fw-btn", `fw-btn-${variant}`, `fw-btn-${size}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      onClick={loading ? undefined : onClick}
      {...rest}
    >
      {loading ? (
        <span className="fw-btn-spinner" aria-hidden="true" />
      ) : iconLeading ? (
        <Icon name={iconLeading} size={iconSize} />
      ) : null}
      {children}
      {iconTrailing ? <Icon name={iconTrailing} size={iconSize} /> : null}
    </button>
  );
}

export const Button = forwardRef(ButtonImpl);
Button.displayName = "Button";
```

- [ ] **Step 6: Write barrel and append to primitives index**

```ts
// src/shared/ui/primitives/Button/index.ts
export { Button } from "./Button.js";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button.js";
```

```ts
// src/shared/ui/primitives/index.ts
export * from "./Icon/index.js";
export * from "./Button/index.js";
```

- [ ] **Step 7: Run test to verify it passes**

```bash
npm test -- --run src/shared/ui/primitives/Button/Button.test.tsx
```

Expected: PASS — all 9+ assertions green.

- [ ] **Step 8: Run lint and typecheck**

```bash
npm run lint && npm run typecheck
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/shared/ui/primitives/Button src/shared/ui/primitives/index.ts
git commit -m "feat(ds): add <Button> primitive (port from Claude Design kit)"
```

---

### Task 2: Card

**Files:**
- Create: `src/shared/ui/primitives/Card/Card.tsx`
- Create: `src/shared/ui/primitives/Card/Card.css`
- Create: `src/shared/ui/primitives/Card/Card.test.tsx`
- Create: `src/shared/ui/primitives/Card/index.ts`
- Modify: `src/shared/ui/primitives/index.ts`

- [ ] **Step 1: Write the failing test**

```tsx
// src/shared/ui/primitives/Card/Card.test.tsx
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from "./Card.js";

describe("<Card>", () => {
  it("renders the children", () => {
    render(<Card>body</Card>);
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("renders the title in a header when provided", () => {
    render(<Card title="Saldo">body</Card>);
    expect(screen.getByRole("heading", { name: "Saldo" })).toBeInTheDocument();
  });

  it("renders an action slot in the header", () => {
    render(
      <Card title="Saldo" action={<button type="button">Ver</button>}>
        body
      </Card>,
    );
    expect(screen.getByRole("button", { name: "Ver" })).toBeInTheDocument();
  });

  it("omits the body padding when padded={false}", () => {
    const { container } = render(<Card padded={false}>body</Card>);
    expect(container.querySelector(".fw-card-body")).toBeNull();
  });

  it("forwards refs to the section element", () => {
    const ref = createRef<HTMLElement>();
    render(<Card ref={ref}>x</Card>);
    expect(ref.current?.tagName).toBe("SECTION");
  });
});
```

- [ ] **Step 2: Run to verify FAIL**

```bash
npm test -- --run src/shared/ui/primitives/Card/Card.test.tsx
```

- [ ] **Step 3: Write Card.css**

```css
/* src/shared/ui/primitives/Card/Card.css */
@layer components {
  .fw-card {
    background: var(--surface-1);
    border: var(--hairline);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  .fw-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: var(--hairline);
  }
  .fw-card-body {
    padding: var(--space-6);
  }
  [data-density="compact"] .fw-card-head {
    padding: 10px 14px;
  }
  [data-density="compact"] .fw-card-body {
    padding: var(--space-4);
  }
}
```

- [ ] **Step 4: Write Card.tsx**

```tsx
// src/shared/ui/primitives/Card/Card.tsx
import type { HTMLAttributes, ForwardedRef, ReactNode } from "react";
import { forwardRef } from "react";
import "./Card.css";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  title?: ReactNode;
  action?: ReactNode;
  padded?: boolean;
}

function CardImpl(
  { title, action, padded = true, className, children, ...rest }: CardProps,
  ref: ForwardedRef<HTMLElement>,
): JSX.Element {
  const classes = ["fw-card", className].filter(Boolean).join(" ");
  return (
    <section ref={ref} className={classes} {...rest}>
      {(title || action) && (
        <header className="fw-card-head">
          {title && <h3 className="t-h4">{title}</h3>}
          {action}
        </header>
      )}
      {padded ? <div className="fw-card-body">{children}</div> : children}
    </section>
  );
}

export const Card = forwardRef(CardImpl);
Card.displayName = "Card";
```

- [ ] **Step 5: Barrel + index**

```ts
// src/shared/ui/primitives/Card/index.ts
export { Card } from "./Card.js";
export type { CardProps } from "./Card.js";
```

Append `export * from "./Card/index.js";` to `src/shared/ui/primitives/index.ts`.

- [ ] **Step 6: Verify and commit**

```bash
npm test -- --run src/shared/ui/primitives/Card/Card.test.tsx
git add src/shared/ui/primitives/Card src/shared/ui/primitives/index.ts
git commit -m "feat(ds): add <Card> primitive"
```

---

### Task 3: Avatar

**Files:**
- Create: `src/shared/ui/primitives/Avatar/{Avatar.tsx, Avatar.css, Avatar.test.tsx, index.ts}`
- Modify: `src/shared/ui/primitives/index.ts`

- [ ] **Step 1: Write the failing test**

```tsx
// src/shared/ui/primitives/Avatar/Avatar.test.tsx
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar } from "./Avatar.js";

describe("<Avatar>", () => {
  it("renders uppercased initials when no src", () => {
    render(<Avatar initials="nf" />);
    expect(screen.getByText("NF")).toBeInTheDocument();
  });

  it("renders the image when src is set", () => {
    render(<Avatar src="/x.png" alt="Nathan" />);
    expect(screen.getByRole("img", { name: "Nathan" })).toHaveAttribute(
      "src",
      "/x.png",
    );
  });

  it.each(["sm", "md", "lg"] as const)("applies the %s size class", (size) => {
    const { container } = render(<Avatar initials="x" size={size} />);
    expect(container.firstElementChild).toHaveClass(`fw-avatar-${size}`);
  });

  it("forwards refs", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar ref={ref} initials="x" />);
    expect(ref.current?.tagName).toBe("SPAN");
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

- [ ] **Step 3: Write Avatar.css**

```css
/* src/shared/ui/primitives/Avatar/Avatar.css */
@layer components {
  .fw-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--accent);
    color: var(--accent-fg);
    font-family: var(--font-sans);
    font-weight: 600;
    overflow: hidden;
    flex-shrink: 0;
  }
  .fw-avatar-sm { width: 24px; height: 24px; font-size: 10px; }
  .fw-avatar-md { width: 32px; height: 32px; font-size: 12px; }
  .fw-avatar-lg { width: 40px; height: 40px; font-size: 14px; }
  .fw-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
```

- [ ] **Step 4: Write Avatar.tsx**

```tsx
// src/shared/ui/primitives/Avatar/Avatar.tsx
import type { HTMLAttributes, ForwardedRef } from "react";
import { forwardRef } from "react";
import "./Avatar.css";

export type AvatarSize = "sm" | "md" | "lg";
export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  initials?: string;
  src?: string;
  alt?: string;
  size?: AvatarSize;
}

function AvatarImpl(
  { initials, src, alt, size = "md", className, ...rest }: AvatarProps,
  ref: ForwardedRef<HTMLSpanElement>,
): JSX.Element {
  const classes = ["fw-avatar", `fw-avatar-${size}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <span ref={ref} className={classes} {...rest}>
      {src ? (
        <img src={src} alt={alt ?? ""} />
      ) : initials ? (
        initials.slice(0, 2).toUpperCase()
      ) : null}
    </span>
  );
}

export const Avatar = forwardRef(AvatarImpl);
Avatar.displayName = "Avatar";
```

- [ ] **Step 5: Barrel + index**

```ts
// src/shared/ui/primitives/Avatar/index.ts
export { Avatar } from "./Avatar.js";
export type { AvatarProps, AvatarSize } from "./Avatar.js";
```

Append `export * from "./Avatar/index.js";` to `src/shared/ui/primitives/index.ts`.

- [ ] **Step 6: Verify and commit**

```bash
npm test -- --run src/shared/ui/primitives/Avatar/Avatar.test.tsx
git add src/shared/ui/primitives/Avatar src/shared/ui/primitives/index.ts
git commit -m "feat(ds): add <Avatar> primitive"
```

---

### Task 4: CategoryPill

**Files:**
- Create: `src/shared/ui/primitives/CategoryPill/{CategoryPill.tsx, CategoryPill.css, CategoryPill.test.tsx, index.ts}`
- Modify: `src/shared/ui/primitives/index.ts`

Note: kit's `CategoryPill` hardcoded a domain category-to-color map. Per the Wave 2 spec §3.4, the primitive layer must stay domain-free; the pill takes a `color` prop and the consumer passes the appropriate `var(--series-N)` value.

- [ ] **Step 1: Write the failing test**

```tsx
// src/shared/ui/primitives/CategoryPill/CategoryPill.test.tsx
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CategoryPill } from "./CategoryPill.js";

describe("<CategoryPill>", () => {
  it("renders the label", () => {
    render(<CategoryPill label="Mercado" />);
    expect(screen.getByText("Mercado")).toBeInTheDocument();
  });

  it("applies the color to the dot via inline style", () => {
    const { container } = render(
      <CategoryPill label="x" color="var(--series-3)" />,
    );
    const dot = container.querySelector(".fw-pill-dot") as HTMLElement;
    expect(dot.style.background).toBe("var(--series-3)");
  });

  it("forwards refs", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<CategoryPill ref={ref} label="x" />);
    expect(ref.current?.tagName).toBe("SPAN");
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

- [ ] **Step 3: Write CategoryPill.css**

```css
/* src/shared/ui/primitives/CategoryPill/CategoryPill.css */
@layer components {
  .fw-pill {
    font-family: var(--font-sans);
    font-weight: 500;
    font-size: 12px;
    line-height: 1;
    padding: 5px 10px 5px 8px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--surface-1);
    border: 1px solid var(--border-1);
    color: var(--fg-1);
  }
  .fw-pill-dot {
    width: 8px;
    height: 8px;
    border-radius: 2px;
    flex: 0 0 8px;
  }
}
```

- [ ] **Step 4: Write CategoryPill.tsx**

```tsx
// src/shared/ui/primitives/CategoryPill/CategoryPill.tsx
import type { HTMLAttributes, ForwardedRef } from "react";
import { forwardRef } from "react";
import "./CategoryPill.css";

export interface CategoryPillProps extends HTMLAttributes<HTMLSpanElement> {
  label: string;
  color?: string;
}

function CategoryPillImpl(
  { label, color = "var(--fg-3)", className, ...rest }: CategoryPillProps,
  ref: ForwardedRef<HTMLSpanElement>,
): JSX.Element {
  const classes = ["fw-pill", className].filter(Boolean).join(" ");
  return (
    <span ref={ref} className={classes} {...rest}>
      <span className="fw-pill-dot" style={{ background: color }} />
      {label}
    </span>
  );
}

export const CategoryPill = forwardRef(CategoryPillImpl);
CategoryPill.displayName = "CategoryPill";
```

- [ ] **Step 5: Barrel + index, verify, commit**

```ts
// src/shared/ui/primitives/CategoryPill/index.ts
export { CategoryPill } from "./CategoryPill.js";
export type { CategoryPillProps } from "./CategoryPill.js";
```

Append `export * from "./CategoryPill/index.js";` to `src/shared/ui/primitives/index.ts`.

```bash
npm test -- --run src/shared/ui/primitives/CategoryPill/CategoryPill.test.tsx
git add src/shared/ui/primitives/CategoryPill src/shared/ui/primitives/index.ts
git commit -m "feat(ds): add <CategoryPill> primitive (domain-free)"
```

---

### Task 5: Badge

**Files:**
- Create: `src/shared/ui/primitives/Badge/{Badge.tsx, Badge.css, Badge.test.tsx, index.ts}`
- Modify: `src/shared/ui/primitives/index.ts`

- [ ] **Step 1: Write the failing test**

```tsx
// src/shared/ui/primitives/Badge/Badge.test.tsx
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge.js";

describe("<Badge>", () => {
  it("renders children", () => {
    render(<Badge>Pago</Badge>);
    expect(screen.getByText("Pago")).toBeInTheDocument();
  });

  it.each(["neutral", "warn", "gain", "loss", "info"] as const)(
    "applies the %s tone",
    (tone) => {
      const { container } = render(<Badge tone={tone}>x</Badge>);
      expect(container.firstElementChild).toHaveClass(`fw-badge-${tone}`);
    },
  );

  it("renders an icon when iconLeading is provided", () => {
    const { container } = render(<Badge iconLeading="bell">Aviso</Badge>);
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("forwards refs", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>x</Badge>);
    expect(ref.current?.tagName).toBe("SPAN");
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

- [ ] **Step 3: Write Badge.css**

```css
/* src/shared/ui/primitives/Badge/Badge.css */
@layer components {
  .fw-badge {
    font-family: var(--font-sans);
    font-weight: 600;
    font-size: 11px;
    line-height: 1;
    padding: 4px 8px;
    border-radius: var(--radius-sm);
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .fw-badge-neutral { background: var(--surface-2); color: var(--fg-2); }
  .fw-badge-warn    { background: var(--warn-soft); color: var(--warn); }
  .fw-badge-gain    { background: var(--gain-soft); color: var(--gain); }
  .fw-badge-loss    { background: var(--loss-soft); color: var(--loss); }
  .fw-badge-info    { background: var(--info-soft); color: var(--info); }
}
```

- [ ] **Step 4: Write Badge.tsx**

```tsx
// src/shared/ui/primitives/Badge/Badge.tsx
import type { HTMLAttributes, ForwardedRef } from "react";
import { forwardRef } from "react";
import { Icon, type IconName } from "../Icon/Icon.js";
import "./Badge.css";

export type BadgeTone = "neutral" | "warn" | "gain" | "loss" | "info";
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  iconLeading?: IconName;
}

function BadgeImpl(
  { tone = "neutral", iconLeading, className, children, ...rest }: BadgeProps,
  ref: ForwardedRef<HTMLSpanElement>,
): JSX.Element {
  const classes = ["fw-badge", `fw-badge-${tone}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <span ref={ref} className={classes} {...rest}>
      {iconLeading ? <Icon name={iconLeading} size={12} /> : null}
      {children}
    </span>
  );
}

export const Badge = forwardRef(BadgeImpl);
Badge.displayName = "Badge";
```

- [ ] **Step 5: Barrel + index, verify, commit**

```ts
// src/shared/ui/primitives/Badge/index.ts
export { Badge } from "./Badge.js";
export type { BadgeProps, BadgeTone } from "./Badge.js";
```

Append to primitives index, then:

```bash
npm test -- --run src/shared/ui/primitives/Badge/Badge.test.tsx
git add src/shared/ui/primitives/Badge src/shared/ui/primitives/index.ts
git commit -m "feat(ds): add <Badge> primitive"
```

---

### Task 6: Skeleton

**Files:**
- Create: `src/shared/ui/primitives/Skeleton/{Skeleton.tsx, Skeleton.css, Skeleton.test.tsx, index.ts}`
- Modify: `src/shared/ui/primitives/index.ts`

- [ ] **Step 1: Write the failing test**

```tsx
// src/shared/ui/primitives/Skeleton/Skeleton.test.tsx
import { createRef } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./Skeleton.js";

describe("<Skeleton>", () => {
  it("renders a single rect by default", () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelectorAll(".fw-skeleton")).toHaveLength(1);
    expect(container.firstElementChild).toHaveClass("fw-skeleton-rect");
  });

  it.each(["rect", "text", "circle"] as const)(
    "applies the %s variant class",
    (variant) => {
      const { container } = render(<Skeleton variant={variant} />);
      expect(container.firstElementChild).toHaveClass(`fw-skeleton-${variant}`);
    },
  );

  it("renders multiple lines for the text variant", () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    expect(container.querySelectorAll(".fw-skeleton")).toHaveLength(3);
  });

  it("applies inline width and height", () => {
    const { container } = render(<Skeleton width={120} height="2rem" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe("120px");
    expect(el.style.height).toBe("2rem");
  });

  it("forwards refs", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Skeleton ref={ref} />);
    expect(ref.current?.tagName).toBe("SPAN");
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

- [ ] **Step 3: Write Skeleton.css**

```css
/* src/shared/ui/primitives/Skeleton/Skeleton.css */
@layer components {
  .fw-skeleton {
    display: inline-block;
    background: linear-gradient(
      90deg,
      var(--surface-2) 0%,
      var(--surface-3) 50%,
      var(--surface-2) 100%
    );
    background-size: 200% 100%;
    animation: fw-skeleton-shimmer 1.4s linear infinite;
    border-radius: var(--radius-sm);
  }
  .fw-skeleton-rect   { border-radius: var(--radius-sm); }
  .fw-skeleton-text   { width: 100%; height: 1em; border-radius: var(--radius-sm); display: block; margin-bottom: 6px; }
  .fw-skeleton-text:last-child { margin-bottom: 0; }
  .fw-skeleton-circle { border-radius: 50%; }
  @keyframes fw-skeleton-shimmer {
    from { background-position: 200% 0; }
    to   { background-position: -200% 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .fw-skeleton { animation: none; }
  }
}
```

- [ ] **Step 4: Write Skeleton.tsx**

```tsx
// src/shared/ui/primitives/Skeleton/Skeleton.tsx
import type { HTMLAttributes, CSSProperties, ForwardedRef } from "react";
import { forwardRef } from "react";
import "./Skeleton.css";

export type SkeletonVariant = "rect" | "text" | "circle";
export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  lines?: number;
}

function toLength(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === "number" ? `${v}px` : v;
}

function SkeletonImpl(
  {
    variant = "rect",
    width,
    height,
    lines,
    className,
    style,
    ...rest
  }: SkeletonProps,
  ref: ForwardedRef<HTMLSpanElement>,
): JSX.Element {
  const inline: CSSProperties = {
    ...(style ?? {}),
    width: toLength(width) ?? style?.width,
    height: toLength(height) ?? style?.height,
  };
  const classes = ["fw-skeleton", `fw-skeleton-${variant}`, className]
    .filter(Boolean)
    .join(" ");
  if (variant === "text" && typeof lines === "number" && lines > 1) {
    return (
      <span ref={ref} aria-hidden="true" {...rest}>
        {Array.from({ length: lines }).map((_, i) => (
          <span key={i} className={classes} style={inline} />
        ))}
      </span>
    );
  }
  return (
    <span
      ref={ref}
      className={classes}
      style={inline}
      aria-hidden="true"
      {...rest}
    />
  );
}

export const Skeleton = forwardRef(SkeletonImpl);
Skeleton.displayName = "Skeleton";
```

- [ ] **Step 5: Barrel + index, verify, commit**

```ts
// src/shared/ui/primitives/Skeleton/index.ts
export { Skeleton } from "./Skeleton.js";
export type { SkeletonProps, SkeletonVariant } from "./Skeleton.js";
```

Append to primitives index, then:

```bash
npm test -- --run src/shared/ui/primitives/Skeleton/Skeleton.test.tsx
git add src/shared/ui/primitives/Skeleton src/shared/ui/primitives/index.ts
git commit -m "feat(ds): add <Skeleton> primitive"
```

---

### Task 7: EmptyState

**Files:**
- Create: `src/shared/ui/primitives/EmptyState/{EmptyState.tsx, EmptyState.css, EmptyState.test.tsx, index.ts}`
- Modify: `src/shared/ui/primitives/index.ts`

- [ ] **Step 1: Write the failing test**

```tsx
// src/shared/ui/primitives/EmptyState/EmptyState.test.tsx
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./EmptyState.js";

describe("<EmptyState>", () => {
  it("renders the title", () => {
    render(<EmptyState title="Sem dados" />);
    expect(
      screen.getByRole("heading", { name: "Sem dados" }),
    ).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(<EmptyState title="x" description="Importe um extrato." />);
    expect(screen.getByText("Importe um extrato.")).toBeInTheDocument();
  });

  it("renders an icon when iconName is provided", () => {
    const { container } = render(<EmptyState title="x" iconName="filter" />);
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("renders the action slot", () => {
    render(
      <EmptyState
        title="x"
        action={<button type="button">Importar</button>}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Importar" }),
    ).toBeInTheDocument();
  });

  it("forwards refs to the wrapper", () => {
    const ref = createRef<HTMLDivElement>();
    render(<EmptyState ref={ref} title="x" />);
    expect(ref.current?.tagName).toBe("DIV");
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

- [ ] **Step 3: Write EmptyState.css**

```css
/* src/shared/ui/primitives/EmptyState/EmptyState.css */
@layer components {
  .fw-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    text-align: center;
    padding: var(--space-7) var(--space-6);
    color: var(--fg-2);
  }
  .fw-empty-icon {
    color: var(--fg-3);
  }
  .fw-empty-title {
    font-family: var(--font-serif);
    font-size: var(--t-h3);
    font-weight: 600;
    color: var(--fg-1);
    margin: 0;
  }
  .fw-empty-desc {
    font-family: var(--font-sans);
    font-size: var(--t-body);
    color: var(--fg-2);
    max-width: 48ch;
    margin: 0;
  }
  .fw-empty-action {
    margin-top: var(--space-3);
  }
}
```

- [ ] **Step 4: Write EmptyState.tsx**

```tsx
// src/shared/ui/primitives/EmptyState/EmptyState.tsx
import type { ForwardedRef, HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { Icon, type IconName } from "../Icon/Icon.js";
import "./EmptyState.css";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  iconName?: IconName;
  action?: ReactNode;
}

function EmptyStateImpl(
  {
    title,
    description,
    iconName,
    action,
    className,
    ...rest
  }: EmptyStateProps,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  const classes = ["fw-empty", className].filter(Boolean).join(" ");
  return (
    <div ref={ref} className={classes} {...rest}>
      {iconName ? (
        <span className="fw-empty-icon">
          <Icon name={iconName} size={32} />
        </span>
      ) : null}
      <h3 className="fw-empty-title">{title}</h3>
      {description ? <p className="fw-empty-desc">{description}</p> : null}
      {action ? <div className="fw-empty-action">{action}</div> : null}
    </div>
  );
}

export const EmptyState = forwardRef(EmptyStateImpl);
EmptyState.displayName = "EmptyState";
```

- [ ] **Step 5: Barrel + index, verify, commit**

```ts
// src/shared/ui/primitives/EmptyState/index.ts
export { EmptyState } from "./EmptyState.js";
export type { EmptyStateProps } from "./EmptyState.js";
```

Append to primitives index, then:

```bash
npm test -- --run src/shared/ui/primitives/EmptyState/EmptyState.test.tsx
git add src/shared/ui/primitives/EmptyState src/shared/ui/primitives/index.ts
git commit -m "feat(ds): add <EmptyState> primitive"
```

---

### Task 8: Breadcrumb

**Files:**
- Create: `src/shared/ui/primitives/Breadcrumb/{Breadcrumb.tsx, Breadcrumb.css, Breadcrumb.test.tsx, index.ts}`
- Modify: `src/shared/ui/primitives/index.ts`

- [ ] **Step 1: Write the failing test**

```tsx
// src/shared/ui/primitives/Breadcrumb/Breadcrumb.test.tsx
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Breadcrumb } from "./Breadcrumb.js";

describe("<Breadcrumb>", () => {
  const items = [
    { label: "Início", href: "/" },
    { label: "Contas", href: "/contas" },
    { label: "Detalhes" },
  ];

  it("renders a nav with aria-label", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("renders intermediate items as links", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole("link", { name: "Início" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders the last item as plain text with aria-current", () => {
    render(<Breadcrumb items={items} />);
    const last = screen.getByText("Detalhes");
    expect(last).toHaveAttribute("aria-current", "page");
    expect(last.tagName).toBe("SPAN");
  });

  it("renders the custom separator between items", () => {
    const { container } = render(<Breadcrumb items={items} separator="›" />);
    expect(container.textContent).toContain("›");
  });

  it("forwards refs to the nav", () => {
    const ref = createRef<HTMLElement>();
    render(<Breadcrumb ref={ref} items={items} />);
    expect(ref.current?.tagName).toBe("NAV");
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

- [ ] **Step 3: Write Breadcrumb.css**

```css
/* src/shared/ui/primitives/Breadcrumb/Breadcrumb.css */
@layer components {
  .fw-breadcrumb {
    font-family: var(--font-sans);
    font-size: var(--t-body-sm);
    color: var(--fg-3);
  }
  .fw-breadcrumb ol {
    list-style: none;
    margin: 0;
    padding: 0;
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
  }
  .fw-breadcrumb a {
    color: var(--fg-2);
    text-decoration: none;
  }
  .fw-breadcrumb a:hover {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
  .fw-breadcrumb [aria-current="page"] {
    color: var(--fg-1);
    font-weight: 500;
  }
  .fw-breadcrumb-sep {
    color: var(--fg-4);
  }
}
```

- [ ] **Step 4: Write Breadcrumb.tsx**

```tsx
// src/shared/ui/primitives/Breadcrumb/Breadcrumb.tsx
import type { ForwardedRef, HTMLAttributes, ReactNode } from "react";
import { forwardRef, Fragment } from "react";
import "./Breadcrumb.css";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: ReactNode;
}

function BreadcrumbImpl(
  { items, separator = "/", className, ...rest }: BreadcrumbProps,
  ref: ForwardedRef<HTMLElement>,
): JSX.Element {
  const classes = ["fw-breadcrumb", className].filter(Boolean).join(" ");
  return (
    <nav ref={ref} aria-label="Breadcrumb" className={classes} {...rest}>
      <ol>
        {items.map((it, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={i}>
              <li>
                {isLast || it.href === undefined ? (
                  <span aria-current={isLast ? "page" : undefined}>{it.label}</span>
                ) : (
                  <a href={it.href}>{it.label}</a>
                )}
              </li>
              {!isLast ? <li className="fw-breadcrumb-sep" aria-hidden="true">{separator}</li> : null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export const Breadcrumb = forwardRef(BreadcrumbImpl);
Breadcrumb.displayName = "Breadcrumb";
```

- [ ] **Step 5: Barrel + index, verify, commit**

```ts
// src/shared/ui/primitives/Breadcrumb/index.ts
export { Breadcrumb } from "./Breadcrumb.js";
export type { BreadcrumbProps, BreadcrumbItem } from "./Breadcrumb.js";
```

Append to primitives index, then:

```bash
npm test -- --run src/shared/ui/primitives/Breadcrumb/Breadcrumb.test.tsx
git add src/shared/ui/primitives/Breadcrumb src/shared/ui/primitives/index.ts
git commit -m "feat(ds): add <Breadcrumb> primitive"
```

---

### Task 9: Pagination

**Files:**
- Create: `src/shared/ui/primitives/Pagination/{Pagination.tsx, Pagination.css, Pagination.test.tsx, index.ts}`
- Modify: `src/shared/ui/primitives/index.ts`

- [ ] **Step 1: Write the failing test**

```tsx
// src/shared/ui/primitives/Pagination/Pagination.test.tsx
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Pagination } from "./Pagination.js";

describe("<Pagination>", () => {
  it("renders nav with aria-label", () => {
    render(
      <Pagination page={1} pageCount={5} onPageChange={() => undefined} />,
    );
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
  });

  it("marks the current page with aria-current", () => {
    render(
      <Pagination page={3} pageCount={5} onPageChange={() => undefined} />,
    );
    expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("disables prev on the first page", () => {
    render(
      <Pagination page={1} pageCount={5} onPageChange={() => undefined} />,
    );
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
  });

  it("disables next on the last page", () => {
    render(
      <Pagination page={5} pageCount={5} onPageChange={() => undefined} />,
    );
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("calls onPageChange when a page button is clicked", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination page={1} pageCount={5} onPageChange={onPageChange} />,
    );
    screen.getByRole("button", { name: "Page 2" }).click();
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("renders ellipsis for skipped ranges", () => {
    const { container } = render(
      <Pagination
        page={5}
        pageCount={20}
        onPageChange={() => undefined}
        siblingCount={1}
      />,
    );
    expect(container.textContent).toContain("…");
  });

  it("forwards refs", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Pagination
        ref={ref}
        page={1}
        pageCount={5}
        onPageChange={() => undefined}
      />,
    );
    expect(ref.current?.tagName).toBe("NAV");
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

- [ ] **Step 3: Write Pagination.css**

```css
/* src/shared/ui/primitives/Pagination/Pagination.css */
@layer components {
  .fw-pagination {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-family: var(--font-sans);
  }
  .fw-pagination-btn {
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
    border: 0;
    background: transparent;
    color: var(--fg-1);
    font-size: var(--t-body-sm);
    border-radius: var(--radius-sm);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .fw-pagination-btn:hover:not(:disabled) {
    background: var(--surface-2);
  }
  .fw-pagination-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .fw-pagination-btn[aria-current="page"] {
    background: var(--accent-soft);
    color: var(--accent-press);
    font-weight: 600;
  }
  .fw-pagination-ellipsis {
    color: var(--fg-3);
    padding: 0 var(--space-2);
  }
}
```

- [ ] **Step 4: Write Pagination.tsx**

```tsx
// src/shared/ui/primitives/Pagination/Pagination.tsx
import type { ForwardedRef, HTMLAttributes } from "react";
import { forwardRef } from "react";
import { Icon } from "../Icon/Icon.js";
import "./Pagination.css";

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  page: number;
  pageCount: number;
  onPageChange: (next: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

type PageItem = number | "ellipsis";

function buildItems(
  page: number,
  pageCount: number,
  siblingCount: number,
  showFirstLast: boolean,
): PageItem[] {
  if (pageCount <= 1) return [1];
  const first = 1;
  const last = pageCount;
  const left = Math.max(page - siblingCount, first);
  const right = Math.min(page + siblingCount, last);
  const items: PageItem[] = [];
  if (showFirstLast && left > first) {
    items.push(first);
    if (left > first + 1) items.push("ellipsis");
  }
  items.push(...range(left, right));
  if (showFirstLast && right < last) {
    if (right < last - 1) items.push("ellipsis");
    items.push(last);
  }
  return items;
}

function PaginationImpl(
  {
    page,
    pageCount,
    onPageChange,
    siblingCount = 1,
    showFirstLast = true,
    className,
    ...rest
  }: PaginationProps,
  ref: ForwardedRef<HTMLElement>,
): JSX.Element {
  const classes = ["fw-pagination", className].filter(Boolean).join(" ");
  const items = buildItems(page, pageCount, siblingCount, showFirstLast);
  const goto = (n: number): void => {
    if (n >= 1 && n <= pageCount && n !== page) onPageChange(n);
  };
  return (
    <nav ref={ref} aria-label="Pagination" className={classes} {...rest}>
      <button
        type="button"
        className="fw-pagination-btn"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => {
          goto(page - 1);
        }}
      >
        <Icon name="chevronLeft" size={16} />
      </button>
      {items.map((it, i) =>
        it === "ellipsis" ? (
          <span key={`e${i}`} className="fw-pagination-ellipsis" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={it}
            type="button"
            className="fw-pagination-btn"
            aria-label={`Page ${it}`}
            aria-current={it === page ? "page" : undefined}
            onClick={() => {
              goto(it);
            }}
          >
            {it}
          </button>
        ),
      )}
      <button
        type="button"
        className="fw-pagination-btn"
        aria-label="Next page"
        disabled={page >= pageCount}
        onClick={() => {
          goto(page + 1);
        }}
      >
        <Icon name="chevronRight" size={16} />
      </button>
    </nav>
  );
}

export const Pagination = forwardRef(PaginationImpl);
Pagination.displayName = "Pagination";
```

- [ ] **Step 5: Barrel + index, verify, commit**

```ts
// src/shared/ui/primitives/Pagination/index.ts
export { Pagination } from "./Pagination.js";
export type { PaginationProps } from "./Pagination.js";
```

Append to primitives index, then:

```bash
npm test -- --run src/shared/ui/primitives/Pagination/Pagination.test.tsx
git add src/shared/ui/primitives/Pagination src/shared/ui/primitives/index.ts
git commit -m "feat(ds): add <Pagination> primitive"
```

---

### Task 10: Final verification + push + PR

- [ ] **Step 1: Full pipeline**

```bash
npm run lint && npm run typecheck && npm test -- --run && npm run build
```

Expected: PASS on all four. Test count climbs by ~40 (covering nine primitives).

- [ ] **Step 2: Push branch**

```bash
git push -u origin feature/ds-wave-2-primitives
```

CI auto-opens a PR to `develop`.

- [ ] **Step 3: Edit PR title and body**

```bash
gh pr edit --title "feat(ds): wave 2 — basic primitives (Button, Card, Avatar, CategoryPill, Badge, Skeleton, EmptyState, Breadcrumb, Pagination)"
```

PR body should summarize the nine primitives, note that all are presentational + domain-free, and reference the spec.

- [ ] **Step 4: Hand-off**

After CI green and review, merge with **"Squash and merge"** (it's a feature → develop merge). Wave 3 (finance-aware primitives — Money, Sparkline, KPIStat) can then begin.

---

## Acceptance criteria

This wave is done when:

1. `npm run lint`, `npm run typecheck`, `npm test -- --run`, `npm run build` all pass on `feature/ds-wave-2-primitives`.
2. Each of the nine primitives is exported from `src/shared/ui/primitives/index.ts` and importable as `import { Button } from "src/shared/ui/primitives"`.
3. Each primitive's `.test.tsx` passes and covers the §5 contract from the spec.
4. The architecture test still passes (no new feature→feature imports introduced).
5. The PR is open against `develop` with CI green.
