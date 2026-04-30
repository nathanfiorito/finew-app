# Design System — Wave 1: Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the design-system foundations (tokens, fonts, icons, theme switching, density switching) into `src/shared/ui/` and `src/app/providers/` so every later wave (Wave 2 basic primitives, Wave 3 finance primitives, Wave 4 form primitives, Wave 5 overlays, Wave 6 table) can `import` from a working foundation.

**Architecture:** CSS custom properties on `:root` and `[data-theme="dark"]` are the source of truth. Tailwind v4 `@theme` re-exports the subset we want as utility classes. Semantic typography lives as plain CSS classes (`.t-display` … `.t-money`) in a co-located file. Fonts are self-hosted under `public/fonts/`. Theme and density are React context providers that write `[data-theme]` and `[data-density]` on `<html>` and persist to `localStorage`. Lucide is wrapped behind a thin `<Icon>` primitive that fixes `strokeWidth={1.75}`.

**Tech Stack:** TypeScript strict, React 19, Vite 8, Tailwind v4, Zustand 5, Vitest 4, `@testing-library/react`, `lucide-react`. Fonts: Source Serif 4 (variable) + Inter (variable), both OFL.

**Hard prerequisite:** the skeleton (`feature/skeleton-architecture-spec`) MUST be merged into `develop` before this plan starts. Wave 1 modifies files (`src/shared/ui/styles/tokens.css`, `src/app/providers/ThemeProvider.tsx`, `src/app/App.tsx`, `src/app/styles/index.css`) that only exist on the skeleton branch. If the skeleton PR is still open when starting this plan, **stop and merge it first**.

**Reference:** the Claude Design output at `docs/design-system-reference/` is the source of truth for token values and the `.t-*` class definitions. Files most touched: `colors_and_type.css` (tokens + semantic type classes) and `ui_kits/finew-pwa/kit.css` (only as far as font-face declarations are concerned).

---

### Task 1: Branch and dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Branch from develop after skeleton merge**

```bash
git switch develop
git pull
git switch -c feature/ds-wave-1-foundations
```

Expected: branch created from a `develop` tip that contains `src/app/`, `src/shared/ui/styles/tokens.css`, `src/app/providers/ThemeProvider.tsx`. Verify with `ls src/app/providers/`.

- [ ] **Step 2: Install runtime deps**

```bash
npm install lucide-react@0.460.0
```

Expected: `lucide-react` appears under `dependencies` in `package.json`. (Pin exact version; bump in a separate PR if needed.)

- [ ] **Step 3: Verify install**

```bash
npm run typecheck
```

Expected: PASS (skeleton already typechecks; we just want to confirm nothing broke).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(ds): add lucide-react for the Icon primitive"
```

---

### Task 2: Token contract test (failing)

**Files:**
- Create: `src/shared/ui/styles/tokens.test.ts`

The contract test is written first and fails because the current `tokens.css` (from the skeleton) only declares ~12 of the ~70 properties the design system needs. Task 3 makes it pass.

- [ ] **Step 1: Write the failing test**

```ts
// src/shared/ui/styles/tokens.test.ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(__dirname, "tokens.css"), "utf8");

const REQUIRED_LIGHT = [
  // surfaces
  "--bg",
  "--surface-0",
  "--surface-1",
  "--surface-2",
  "--surface-3",
  // foreground
  "--fg-1",
  "--fg-2",
  "--fg-3",
  "--fg-4",
  // borders
  "--border-1",
  "--border-2",
  "--border-strong",
  // accent
  "--accent",
  "--accent-hover",
  "--accent-press",
  "--accent-soft",
  "--accent-fg",
  // semantic
  "--gain",
  "--gain-soft",
  "--loss",
  "--loss-soft",
  "--warn",
  "--warn-soft",
  "--info",
  "--info-soft",
  // series
  "--series-1",
  "--series-2",
  "--series-3",
  "--series-4",
  "--series-5",
  "--series-6",
  "--series-7",
  "--series-8",
  // overlay
  "--overlay",
  // type families
  "--font-serif",
  "--font-sans",
  "--font-mono",
  // numeric features
  "--num-tabular",
  "--num-oldstyle",
  // type scale
  "--t-display",
  "--t-h1",
  "--t-h2",
  "--t-h3",
  "--t-h4",
  "--t-body",
  "--t-body-sm",
  "--t-caption",
  "--t-micro",
  // line heights / tracking
  "--lh-tight",
  "--lh-snug",
  "--lh-normal",
  "--lh-loose",
  "--tracking-micro",
  "--tracking-tight",
  "--tracking-normal",
  // spacing
  "--space-0",
  "--space-1",
  "--space-2",
  "--space-3",
  "--space-4",
  "--space-5",
  "--space-6",
  "--space-7",
  "--space-8",
  "--space-9",
  "--space-10",
  // radii
  "--radius-0",
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
  "--radius-xl",
  // borders/shadows
  "--hairline",
  "--shadow-0",
  "--shadow-sm",
  "--shadow-md",
  "--shadow-lg",
  // motion
  "--ease-standard",
  "--duration-1",
  "--duration-2",
  "--duration-3",
  // layout
  "--content-max",
  "--sidebar-w",
  "--sidebar-w-collapsed",
  "--bottomtab-h",
  "--topbar-h",
];

// Tokens that must be redefined (not inherited) in the dark theme.
const REQUIRED_DARK = [
  "--bg",
  "--surface-0",
  "--surface-1",
  "--surface-2",
  "--surface-3",
  "--fg-1",
  "--fg-2",
  "--fg-3",
  "--fg-4",
  "--border-1",
  "--border-2",
  "--border-strong",
  "--accent",
  "--accent-hover",
  "--accent-press",
  "--accent-soft",
  "--accent-fg",
  "--gain",
  "--gain-soft",
  "--loss",
  "--loss-soft",
  "--warn",
  "--warn-soft",
  "--info",
  "--info-soft",
  "--series-1",
  "--series-2",
  "--series-3",
  "--series-4",
  "--series-5",
  "--series-6",
  "--series-7",
  "--series-8",
  "--overlay",
  "--shadow-sm",
  "--shadow-md",
  "--shadow-lg",
];

// Density override must redefine at least the spacing slots that change
// and the type scale steps that shrink.
const REQUIRED_DENSITY_COMPACT = [
  "--space-3",
  "--space-4",
  "--space-5",
  "--space-6",
  "--space-7",
  "--t-display",
  "--t-h1",
  "--t-h2",
  "--t-h3",
  "--t-h4",
  "--t-body",
  "--t-body-sm",
];

function block(selector: string): string {
  // Find the selector, then walk braces to extract its body.
  const idx = css.indexOf(selector);
  if (idx === -1) throw new Error(`Selector ${selector} not found in tokens.css`);
  const open = css.indexOf("{", idx);
  if (open === -1) throw new Error(`No opening brace after ${selector}`);
  let depth = 1;
  let i = open + 1;
  while (i < css.length && depth > 0) {
    const c = css[i];
    if (c === "{") depth++;
    else if (c === "}") depth--;
    i++;
  }
  if (depth !== 0) throw new Error(`Unbalanced braces after ${selector}`);
  return css.slice(open + 1, i - 1);
}

describe("tokens.css contract", () => {
  it("declares every required custom property in :root", () => {
    const body = block(":root");
    const missing = REQUIRED_LIGHT.filter((name) => !body.includes(`${name}:`));
    expect(missing).toEqual([]);
  });

  it('redefines theme-dependent custom properties under [data-theme="dark"]', () => {
    const body = block('[data-theme="dark"]');
    const missing = REQUIRED_DARK.filter((name) => !body.includes(`${name}:`));
    expect(missing).toEqual([]);
  });

  it("redefines compact-density spacing and type scale", () => {
    const body = block('[data-density="compact"]');
    const missing = REQUIRED_DENSITY_COMPACT.filter(
      (name) => !body.includes(`${name}:`),
    );
    expect(missing).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --run src/shared/ui/styles/tokens.test.ts
```

Expected: FAIL — the current `tokens.css` declares only the placeholder set from the skeleton (`--finew-color-bg`, `--finew-space-1`, etc.) and has no dark theme nor density override block.

- [ ] **Step 3: Commit (red phase)**

```bash
git add src/shared/ui/styles/tokens.test.ts
git commit -m "test(ds): add tokens.css contract test (failing)"
```

---

### Task 3: Migrate tokens.css to the full Claude Design set, drop `--finew-*` prefix

**Files:**
- Replace: `src/shared/ui/styles/tokens.css`

The existing file declares `--finew-color-bg`, `--finew-space-1`, etc., and re-exports them through Tailwind's `@theme`. Replace it wholesale with the full token set, unprefixed.

- [ ] **Step 1: Replace tokens.css**

```css
/* src/shared/ui/styles/tokens.css
   Source of truth: docs/design-system-reference/colors_and_type.css
   Light is canonical; dark is a first-class courtesy. */

:root,
[data-theme="light"] {
  /* Surfaces (warm neutrals, never pure white/black) */
  --bg:            #FAF8F4;
  --surface-0:     #FAF8F4;
  --surface-1:     #F3EFE8;
  --surface-2:     #ECE7DD;
  --surface-3:     #E2DCCF;

  /* Foreground (graphite, never #000) */
  --fg-1:          #1F1B16;
  --fg-2:          #4A453D;
  --fg-3:          #807A6F;
  --fg-4:          #B5AEA1;

  /* Borders */
  --border-1:      color-mix(in srgb, #1F1B16 12%, transparent);
  --border-2:      color-mix(in srgb, #1F1B16 20%, transparent);
  --border-strong: color-mix(in srgb, #1F1B16 32%, transparent);

  /* Accent (moss) */
  --accent:        #3F5E4A;
  --accent-hover:  #344F3E;
  --accent-press:  #2A4233;
  --accent-soft:   #E5ECDF;
  --accent-fg:     #FAF8F4;

  /* Semantic */
  --gain:          #3F5E4A;
  --gain-soft:     #E5ECDF;
  --loss:          #7A2E2E;
  --loss-soft:     #F1E1E1;
  --warn:          #8A6A1F;
  --warn-soft:     #F2EAD3;
  --info:          #3D5A7A;
  --info-soft:     #DEE5EE;

  /* Categorical series */
  --series-1: #3F5E4A; --series-2: #2F5F66; --series-3: #7A2E2E; --series-4: #B08A2E;
  --series-5: #B0623E; --series-6: #7A6B8E; --series-7: #3D5A7A; --series-8: #6B7A3D;

  --overlay:       rgba(31, 27, 22, 0.32);

  /* Type families */
  --font-serif:    "Source Serif 4", Georgia, "Times New Roman", serif;
  --font-sans:     "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  --font-mono:     ui-monospace, "SF Mono", "Roboto Mono", Menlo, monospace;
  --num-tabular:   "tnum" 1, "lnum" 1;
  --num-oldstyle:  "onum" 1, "pnum" 1;

  /* Type scale (px, comfortable) */
  --t-display: 56px; --t-h1: 40px; --t-h2: 28px; --t-h3: 20px; --t-h4: 17px;
  --t-body: 15px; --t-body-sm: 13px; --t-caption: 12px; --t-micro: 11px;
  --lh-tight: 1.15; --lh-snug: 1.3; --lh-normal: 1.5; --lh-loose: 1.65;
  --tracking-micro: 0.06em; --tracking-tight: -0.01em; --tracking-normal: 0;

  /* Spacing (4px base) */
  --space-0: 0; --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-7: 32px; --space-8: 40px;
  --space-9: 56px; --space-10: 80px;

  /* Radii */
  --radius-0: 0; --radius-sm: 6px; --radius-md: 8px; --radius-lg: 12px; --radius-xl: 16px;

  /* Hairline + shadows */
  --hairline: 1px solid var(--border-1);
  --shadow-0: none;
  --shadow-sm: 0 1px 2px rgba(31, 27, 22, 0.06);
  --shadow-md: 0 4px 12px rgba(31, 27, 22, 0.08), 0 1px 2px rgba(31, 27, 22, 0.04);
  --shadow-lg: 0 12px 32px rgba(31, 27, 22, 0.12), 0 2px 6px rgba(31, 27, 22, 0.06);

  /* Motion */
  --ease-standard: cubic-bezier(0.2, 0.0, 0.2, 1.0);
  --duration-1: 150ms; --duration-2: 200ms; --duration-3: 240ms;

  /* Layout */
  --content-max: 1280px;
  --sidebar-w: 240px; --sidebar-w-collapsed: 64px;
  --bottomtab-h: 64px; --topbar-h: 56px;
}

[data-theme="dark"] {
  --bg:            #14110E;
  --surface-0:     #14110E;
  --surface-1:     #1C1814;
  --surface-2:     #25201A;
  --surface-3:     #2F2922;

  --fg-1:          #EFE9DD;
  --fg-2:          #B8B0A0;
  --fg-3:          #807A6F;
  --fg-4:          #54504A;

  --border-1:      color-mix(in srgb, #EFE9DD 10%, transparent);
  --border-2:      color-mix(in srgb, #EFE9DD 18%, transparent);
  --border-strong: color-mix(in srgb, #EFE9DD 28%, transparent);

  --accent:        #7FA487;
  --accent-hover:  #92B499;
  --accent-press:  #6E947A;
  --accent-soft:   #1F2C24;
  --accent-fg:     #14110E;

  --gain:          #7FA487; --gain-soft: #1F2C24;
  --loss:          #C97676; --loss-soft: #2E1E1E;
  --warn:          #D4B36A; --warn-soft: #2E2818;
  --info:          #7FA0C2; --info-soft: #1B2531;

  --series-1: #7FA487; --series-2: #6FA3AB; --series-3: #C97676; --series-4: #D4B36A;
  --series-5: #D49A7A; --series-6: #B0A4C4; --series-7: #7FA0C2; --series-8: #A8B47A;

  --overlay: rgba(0, 0, 0, 0.56);

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.45), 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.55), 0 2px 6px rgba(0, 0, 0, 0.35);
}

[data-density="compact"] {
  --space-3: 8px;
  --space-4: 12px;
  --space-5: 16px;
  --space-6: 16px;
  --space-7: 24px;

  --t-display: 44px;
  --t-h1: 32px;
  --t-h2: 22px;
  --t-h3: 17px;
  --t-h4: 15px;
  --t-body: 13px;
  --t-body-sm: 12px;
}

/* Tailwind v4 @theme re-export — only the subset we want as utilities. */
@theme {
  --color-bg:        var(--bg);
  --color-fg:        var(--fg-1);
  --color-fg-2:      var(--fg-2);
  --color-fg-3:      var(--fg-3);
  --color-accent:    var(--accent);
  --color-accent-fg: var(--accent-fg);
  --color-gain:      var(--gain);
  --color-loss:      var(--loss);

  --spacing-1:  var(--space-1);
  --spacing-2:  var(--space-2);
  --spacing-3:  var(--space-3);
  --spacing-4:  var(--space-4);
  --spacing-5:  var(--space-5);
  --spacing-6:  var(--space-6);
  --spacing-7:  var(--space-7);
  --spacing-8:  var(--space-8);
  --spacing-9:  var(--space-9);
  --spacing-10: var(--space-10);

  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);

  --font-sans:  var(--font-sans);
  --font-serif: var(--font-serif);
}
```

- [ ] **Step 2: Run the contract test**

```bash
npm test -- --run src/shared/ui/styles/tokens.test.ts
```

Expected: PASS — all three `it()` blocks green.

- [ ] **Step 3: Run lint and full test suite**

```bash
npm run lint && npm test -- --run
```

Expected: PASS. The architecture test (`src/architecture.test.ts`) keeps passing because no import direction changed.

- [ ] **Step 4: Commit**

```bash
git add src/shared/ui/styles/tokens.css
git commit -m "feat(ds): migrate tokens.css to full Claude Design set, drop --finew-* prefix"
```

---

### Task 4: Self-host fonts (Source Serif 4 + Inter)

**Files:**
- Create: `public/fonts/Inter-Variable.woff2`
- Create: `public/fonts/SourceSerif4-Variable.woff2`
- Create: `public/fonts/SourceSerif4-Variable-Italic.woff2`
- Create: `src/shared/ui/styles/fonts.css`

We host woff2 variable files locally. Italic is included for Source Serif 4 because the brief calls for editorial italic emphasis.

- [ ] **Step 1: Download font files**

Download from the upstream OFL releases:

- Inter v4.0 variable: `https://github.com/rsms/inter/releases/download/v4.0/Inter-4.0.zip` → extract `Inter-Variable.woff2`.
- Source Serif 4 v4.005: `https://github.com/adobe-fonts/source-serif/releases/download/4.005R/source-serif-4.005R.zip` → extract `WOFF2/Source_Serif_4/SourceSerif4-VariableFont_opsz,wght.ttf.woff2` (rename to `SourceSerif4-Variable.woff2`) and `WOFF2/Source_Serif_4/SourceSerif4-Italic-VariableFont_opsz,wght.ttf.woff2` (rename to `SourceSerif4-Variable-Italic.woff2`).

```bash
mkdir -p public/fonts
# Place the three downloaded woff2 files in public/fonts/.
ls -la public/fonts/
```

Expected: three files present, total size under ~600KB.

- [ ] **Step 2: Create fonts.css**

```css
/* src/shared/ui/styles/fonts.css
   Self-hosted, OFL. Variable fonts; opsz axis used by Source Serif. */

@font-face {
  font-family: "Inter";
  src: url("/fonts/Inter-Variable.woff2") format("woff2-variations");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Source Serif 4";
  src: url("/fonts/SourceSerif4-Variable.woff2") format("woff2-variations");
  font-weight: 200 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Source Serif 4";
  src: url("/fonts/SourceSerif4-Variable-Italic.woff2") format("woff2-variations");
  font-weight: 200 900;
  font-style: italic;
  font-display: swap;
}
```

- [ ] **Step 3: Verify file presence with a guard test**

Create `src/shared/ui/styles/fonts.test.ts`:

```ts
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");

describe("self-hosted fonts", () => {
  it.each([
    "public/fonts/Inter-Variable.woff2",
    "public/fonts/SourceSerif4-Variable.woff2",
    "public/fonts/SourceSerif4-Variable-Italic.woff2",
  ])("ships %s", (rel) => {
    expect(existsSync(join(repoRoot, rel))).toBe(true);
  });
});
```

```bash
npm test -- --run src/shared/ui/styles/fonts.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add public/fonts src/shared/ui/styles/fonts.css src/shared/ui/styles/fonts.test.ts
git commit -m "feat(ds): self-host Source Serif 4 and Inter variable fonts"
```

---

### Task 5: Semantic typography classes

**Files:**
- Create: `src/shared/ui/styles/typography.css`
- Create: `src/shared/ui/styles/typography.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/shared/ui/styles/typography.test.tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";

import "./tokens.css";
import "./typography.css";

const CLASSES = [
  "t-display",
  "t-h1",
  "t-h2",
  "t-h3",
  "t-h4",
  "t-body",
  "t-body-strong",
  "t-body-sm",
  "t-caption",
  "t-micro",
  "t-money",
  "t-money-display",
] as const;

describe("typography classes", () => {
  it.each(CLASSES)("applies font-family for %s", (cls) => {
    const { container } = render(<span className={cls}>x</span>);
    const node = container.firstChild as HTMLElement;
    const family = getComputedStyle(node).fontFamily;
    expect(family).not.toBe("");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --run src/shared/ui/styles/typography.test.tsx
```

Expected: FAIL with "Cannot find module './typography.css'".

- [ ] **Step 3: Create typography.css**

```css
/* src/shared/ui/styles/typography.css
   Semantic type classes — plain CSS by design (not Tailwind utilities).
   Source of truth: docs/design-system-reference/colors_and_type.css. */

.t-display {
  font-family: var(--font-serif);
  font-size: var(--t-display);
  line-height: var(--lh-tight);
  letter-spacing: var(--tracking-tight);
  font-weight: 500;
  font-feature-settings: var(--num-oldstyle);
}
.t-h1 {
  font-family: var(--font-serif);
  font-size: var(--t-h1);
  line-height: var(--lh-tight);
  letter-spacing: var(--tracking-tight);
  font-weight: 600;
}
.t-h2 {
  font-family: var(--font-serif);
  font-size: var(--t-h2);
  line-height: var(--lh-tight);
  font-weight: 600;
}
.t-h3 {
  font-family: var(--font-sans);
  font-size: var(--t-h3);
  line-height: var(--lh-snug);
  font-weight: 600;
  letter-spacing: -0.005em;
}
.t-h4 {
  font-family: var(--font-sans);
  font-size: var(--t-h4);
  line-height: var(--lh-snug);
  font-weight: 600;
}
.t-body {
  font-family: var(--font-sans);
  font-size: var(--t-body);
  line-height: var(--lh-normal);
  font-weight: 400;
}
.t-body-strong {
  font-family: var(--font-sans);
  font-size: var(--t-body);
  line-height: var(--lh-normal);
  font-weight: 600;
}
.t-body-sm {
  font-family: var(--font-sans);
  font-size: var(--t-body-sm);
  line-height: var(--lh-normal);
  font-weight: 400;
}
.t-caption {
  font-family: var(--font-sans);
  font-size: var(--t-caption);
  line-height: var(--lh-normal);
  color: var(--fg-3);
  font-weight: 400;
}
.t-micro {
  font-family: var(--font-sans);
  font-size: var(--t-micro);
  line-height: 1.2;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-micro);
  color: var(--fg-3);
}
.t-money {
  font-family: var(--font-sans);
  font-feature-settings: var(--num-tabular);
  font-variant-numeric: tabular-nums lining-nums;
}
.t-money-display {
  font-family: var(--font-serif);
  font-feature-settings: var(--num-tabular);
  font-variant-numeric: tabular-nums lining-nums;
  font-weight: 500;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --run src/shared/ui/styles/typography.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/ui/styles/typography.css src/shared/ui/styles/typography.test.tsx
git commit -m "feat(ds): add semantic typography classes (.t-display through .t-money)"
```

---

### Task 6: Update globals.css and the app entry stylesheet

**Files:**
- Modify: `src/shared/ui/styles/globals.css`
- Modify: `src/app/styles/index.css`

- [ ] **Step 1: Replace globals.css**

The skeleton's `globals.css` only has `box-sizing` reset and `html/body/#root` height. Add the dark/reduced-motion guards.

```css
/* src/shared/ui/styles/globals.css */

*, *::before, *::after { box-sizing: border-box; }

html, body, #root {
  height: 100%;
  margin: 0;
  background: var(--bg);
  color: var(--fg-1);
  font-family: var(--font-sans);
  font-size: var(--t-body);
  line-height: var(--lh-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0ms !important;
    animation-duration: 0ms !important;
  }
}
```

- [ ] **Step 2: Update app/styles/index.css to include fonts and typography**

Replace the file:

```css
/* src/app/styles/index.css
   Cascade order matters: tailwindcss → tokens → fonts → typography → globals.
   tokens.css must precede everything that consumes them. */

@import "tailwindcss";
@import "../../shared/ui/styles/tokens.css";
@import "../../shared/ui/styles/fonts.css";
@import "../../shared/ui/styles/typography.css";
@import "../../shared/ui/styles/globals.css";
```

- [ ] **Step 3: Run build to confirm CSS resolves**

```bash
npm run build
```

Expected: PASS — `dist/` produced, no missing-file warnings on font URLs (Vite copies `public/fonts/` into `dist/fonts/`).

- [ ] **Step 4: Commit**

```bash
git add src/shared/ui/styles/globals.css src/app/styles/index.css
git commit -m "feat(ds): wire fonts and semantic typography into the cascade"
```

---

### Task 7: Extend ThemeProvider (system pref + persistence + hook)

**Files:**
- Replace: `src/app/providers/ThemeProvider.tsx`
- Create: `src/app/providers/ThemeProvider.test.tsx`

The current provider hardcodes `"light"` and provides no system-pref handling or persistence.

- [ ] **Step 1: Write the failing test**

```tsx
// src/app/providers/ThemeProvider.test.tsx
import type { ReactNode } from "react";
import { act, render, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider, useTheme } from "./ThemeProvider.js";

const STORAGE_KEY = "finew:theme";

function setSystemPref(pref: "light" | "dark"): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: pref === "dark" && query.includes("dark"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  localStorage.clear();
});

describe("ThemeProvider", () => {
  it("applies system pref when no override is stored", () => {
    setSystemPref("dark");
    render(
      <ThemeProvider>
        <span>x</span>
      </ThemeProvider>,
    );
    expect(document.documentElement.dataset["theme"]).toBe("dark");
  });

  it("applies stored override over system pref", () => {
    setSystemPref("dark");
    localStorage.setItem(STORAGE_KEY, "light");
    render(
      <ThemeProvider>
        <span>x</span>
      </ThemeProvider>,
    );
    expect(document.documentElement.dataset["theme"]).toBe("light");
  });

  it("setTheme persists to localStorage and updates the dataset", () => {
    setSystemPref("light");
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme("dark");
    });

    expect(document.documentElement.dataset["theme"]).toBe("dark");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("dark");
    expect(result.current.theme).toBe("dark");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --run src/app/providers/ThemeProvider.test.tsx
```

Expected: FAIL — `useTheme` is not exported by the current ThemeProvider; the system-pref code path does not exist.

- [ ] **Step 3: Replace ThemeProvider.tsx**

```tsx
// src/app/providers/ThemeProvider.tsx
import type { JSX, ReactNode } from "react";
import { useEffect } from "react";
import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  override: Theme | null;
  setTheme: (theme: Theme) => void;
  clearOverride: () => void;
}

const STORAGE_KEY = "finew:theme";

function readSystemPref(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredOverride(): Theme | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "light" || v === "dark" ? v : null;
}

const initialOverride = readStoredOverride();
const initialSystem = readSystemPref();

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialOverride ?? initialSystem,
  override: initialOverride,
  setTheme: (theme) => {
    window.localStorage.setItem(STORAGE_KEY, theme);
    set({ theme, override: theme });
  },
  clearOverride: () => {
    window.localStorage.removeItem(STORAGE_KEY);
    set({ theme: readSystemPref(), override: null });
  },
}));

export function useTheme(): {
  theme: Theme;
  setTheme: (t: Theme) => void;
  clearOverride: () => void;
} {
  const { theme, setTheme, clearOverride } = useThemeStore();
  return { theme, setTheme, clearOverride };
}

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const theme = useThemeStore((s) => s.theme);
  const override = useThemeStore((s) => s.override);

  useEffect(() => {
    document.documentElement.dataset["theme"] = theme;
  }, [theme]);

  useEffect(() => {
    if (override !== null) return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent): void => {
      useThemeStore.setState({ theme: e.matches ? "dark" : "light" });
    };
    mql.addEventListener("change", handler);
    return () => {
      mql.removeEventListener("change", handler);
    };
  }, [override]);

  return <>{children}</>;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --run src/app/providers/ThemeProvider.test.tsx
```

Expected: PASS — all three cases green.

- [ ] **Step 5: Commit**

```bash
git add src/app/providers/ThemeProvider.tsx src/app/providers/ThemeProvider.test.tsx
git commit -m "feat(ds): extend ThemeProvider with system-pref + localStorage persistence"
```

---

### Task 8: DensityProvider

**Files:**
- Create: `src/app/providers/DensityProvider.tsx`
- Create: `src/app/providers/DensityProvider.test.tsx`

Mirrors ThemeProvider, simpler — no system pref (browsers don't expose density).

- [ ] **Step 1: Write the failing test**

```tsx
// src/app/providers/DensityProvider.test.tsx
import type { ReactNode } from "react";
import { act, render, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DensityProvider, useDensity } from "./DensityProvider.js";

const STORAGE_KEY = "finew:density";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-density");
});

afterEach(() => {
  localStorage.clear();
});

describe("DensityProvider", () => {
  it("defaults to comfortable when nothing is stored", () => {
    render(
      <DensityProvider>
        <span>x</span>
      </DensityProvider>,
    );
    expect(document.documentElement.dataset["density"]).toBe("comfortable");
  });

  it("applies stored value", () => {
    localStorage.setItem(STORAGE_KEY, "compact");
    render(
      <DensityProvider>
        <span>x</span>
      </DensityProvider>,
    );
    expect(document.documentElement.dataset["density"]).toBe("compact");
  });

  it("setDensity persists and updates dataset", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DensityProvider>{children}</DensityProvider>
    );
    const { result } = renderHook(() => useDensity(), { wrapper });

    act(() => {
      result.current.setDensity("compact");
    });

    expect(document.documentElement.dataset["density"]).toBe("compact");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("compact");
    expect(result.current.density).toBe("compact");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --run src/app/providers/DensityProvider.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create DensityProvider.tsx**

```tsx
// src/app/providers/DensityProvider.tsx
import type { JSX, ReactNode } from "react";
import { useEffect } from "react";
import { create } from "zustand";

type Density = "comfortable" | "compact";

interface DensityState {
  density: Density;
  setDensity: (d: Density) => void;
}

const STORAGE_KEY = "finew:density";

function readStored(): Density {
  if (typeof window === "undefined") return "comfortable";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "compact" ? "compact" : "comfortable";
}

export const useDensityStore = create<DensityState>((set) => ({
  density: readStored(),
  setDensity: (density) => {
    window.localStorage.setItem(STORAGE_KEY, density);
    set({ density });
  },
}));

export function useDensity(): { density: Density; setDensity: (d: Density) => void } {
  const { density, setDensity } = useDensityStore();
  return { density, setDensity };
}

export function DensityProvider({ children }: { children: ReactNode }): JSX.Element {
  const density = useDensityStore((s) => s.density);
  useEffect(() => {
    document.documentElement.dataset["density"] = density;
  }, [density]);
  return <>{children}</>;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --run src/app/providers/DensityProvider.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/providers/DensityProvider.tsx src/app/providers/DensityProvider.test.tsx
git commit -m "feat(ds): add DensityProvider with localStorage persistence"
```

---

### Task 9: Wire DensityProvider into App.tsx

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/app/App.test.tsx`

- [ ] **Step 1: Update App.tsx to include DensityProvider**

```tsx
// src/app/App.tsx
import type { JSX } from "react";
import { RouterProvider } from "react-router";
import { router } from "./router.js";
import { QueryProvider } from "./providers/QueryProvider.js";
import { ThemeProvider } from "./providers/ThemeProvider.js";
import { DensityProvider } from "./providers/DensityProvider.js";

export function App(): JSX.Element {
  return (
    <QueryProvider>
      <ThemeProvider>
        <DensityProvider>
          <RouterProvider router={router} />
        </DensityProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
```

- [ ] **Step 2: Run existing App test**

```bash
npm test -- --run src/app/App.test.tsx
```

Expected: PASS — the smoke test routes still resolve; no regressions.

- [ ] **Step 3: Commit**

```bash
git add src/app/App.tsx
git commit -m "feat(ds): wrap RouterProvider in DensityProvider"
```

---

### Task 10: `<Icon>` primitive

**Files:**
- Create: `src/shared/ui/primitives/Icon/Icon.tsx`
- Create: `src/shared/ui/primitives/Icon/Icon.test.tsx`
- Create: `src/shared/ui/primitives/Icon/index.ts`
- Create: `src/shared/ui/primitives/index.ts`

- [ ] **Step 1: Write the failing test**

```tsx
// src/shared/ui/primitives/Icon/Icon.test.tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Icon } from "./Icon.js";

describe("<Icon>", () => {
  it("renders the named lucide icon as an SVG", () => {
    const { container } = render(<Icon name="home" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("applies strokeWidth=1.75 by default", () => {
    const { container } = render(<Icon name="search" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("stroke-width")).toBe("1.75");
  });

  it("respects an explicit strokeWidth override", () => {
    const { container } = render(<Icon name="plus" strokeWidth={2.25} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("stroke-width")).toBe("2.25");
  });

  it("forwards size to width and height", () => {
    const { container } = render(<Icon name="bell" size={24} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("24");
    expect(svg?.getAttribute("height")).toBe("24");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --run src/shared/ui/primitives/Icon/Icon.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create Icon.tsx**

```tsx
// src/shared/ui/primitives/Icon/Icon.tsx
import type { JSX } from "react";
import {
  Home,
  List,
  PieChart,
  CreditCard,
  Target,
  Search,
  Bell,
  Plus,
  Menu,
  User,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  Filter,
  Calendar,
  Settings,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const REGISTRY = {
  home: Home,
  list: List,
  pie: PieChart,
  card: CreditCard,
  target: Target,
  search: Search,
  bell: Bell,
  plus: Plus,
  menu: Menu,
  user: User,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronDown: ChevronDown,
  close: X,
  filter: Filter,
  calendar: Calendar,
  cog: Settings,
  wallet: Wallet,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof REGISTRY;

export interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  "aria-label"?: string;
}

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  className,
  "aria-label": ariaLabel,
}: IconProps): JSX.Element {
  const Component = REGISTRY[name];
  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
    />
  );
}
```

- [ ] **Step 4: Create barrel files**

```ts
// src/shared/ui/primitives/Icon/index.ts
export { Icon } from "./Icon.js";
export type { IconName, IconProps } from "./Icon.js";
```

```ts
// src/shared/ui/primitives/index.ts
export * from "./Icon/index.js";
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- --run src/shared/ui/primitives/Icon/Icon.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/shared/ui/primitives/Icon src/shared/ui/primitives/index.ts
git commit -m "feat(ds): add <Icon> primitive wrapping lucide-react with 1.75 stroke"
```

---

### Task 11: Smoke test for theme × density combinations

**Files:**
- Create: `src/app/App.themes.test.tsx`

- [ ] **Step 1: Write the test**

```tsx
// src/app/App.themes.test.tsx
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { App } from "./App.js";

const STORAGE_KEYS = ["finew:theme", "finew:density"];

const COMBOS: Array<{ theme: "light" | "dark"; density: "comfortable" | "compact" }> = [
  { theme: "light", density: "comfortable" },
  { theme: "light", density: "compact" },
  { theme: "dark", density: "comfortable" },
  { theme: "dark", density: "compact" },
];

beforeEach(() => {
  STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-density");
});

afterEach(() => {
  STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
});

describe("App theme/density combinations", () => {
  it.each(COMBOS)(
    "renders cleanly with theme=$theme density=$density",
    ({ theme, density }) => {
      localStorage.setItem("finew:theme", theme);
      localStorage.setItem("finew:density", density);

      const errors: unknown[] = [];
      const restore = console.error;
      console.error = (...args: unknown[]) => {
        errors.push(args);
      };

      try {
        render(<App />);
      } finally {
        console.error = restore;
      }

      expect(document.documentElement.dataset["theme"]).toBe(theme);
      expect(document.documentElement.dataset["density"]).toBe(density);
      expect(errors).toEqual([]);
    },
  );
});
```

- [ ] **Step 2: Run the test**

```bash
npm test -- --run src/app/App.themes.test.tsx
```

Expected: PASS — all four combos clean.

- [ ] **Step 3: Commit**

```bash
git add src/app/App.themes.test.tsx
git commit -m "test(ds): smoke-test all theme × density combinations"
```

---

### Task 12: Final verification + push + open PR

- [ ] **Step 1: Run the full pipeline locally**

```bash
npm run lint && npm run typecheck && npm test -- --run && npm run build
```

Expected: all four PASS. The architecture test continues to pass (no new feature→feature imports introduced).

- [ ] **Step 2: Push the branch**

```bash
git push -u origin feature/ds-wave-1-foundations
```

Expected: branch pushed; CI's `open-pr` job auto-opens or updates a PR to `develop` after `lint`/`typecheck`/`test`/`build` succeed.

- [ ] **Step 3: Verify CI is green and the PR title is conventional**

```bash
gh pr view --json title,state,statusCheckRollup
```

Expected: `state=OPEN`, all four checks passing. If the auto-PR title is not in `feat(ds): …` form, edit it before squash-merge:

```bash
gh pr edit --title "feat(ds): wave 1 — foundations (tokens, fonts, providers, Icon)"
```

- [ ] **Step 4: Hand-off**

The PR is ready for review. After it merges to `develop` (squash), Wave 2's spec/plan can begin.

---

## Acceptance criteria

This wave is done when:

1. `npm run lint`, `npm run typecheck`, `npm test -- --run`, `npm run build` all pass on `feature/ds-wave-1-foundations`.
2. `tokens.css` declares every property listed in the contract test, in `:root`, `[data-theme="dark"]`, and `[data-density="compact"]` blocks; the `--finew-*` prefix is gone.
3. `public/fonts/` contains the three woff2 files; `fonts.test.ts` passes.
4. `<html>` carries `data-theme` and `data-density` attributes after the App mounts, in any of the four combos.
5. `useTheme()` and `useDensity()` hooks expose `theme/density` + setter, persist to `localStorage`, and `useTheme` reflects `prefers-color-scheme` when no override is stored.
6. `<Icon name="home" />` renders an SVG with `stroke-width="1.75"`; the registry covers the 20 icons listed in Task 10.
7. The architecture test (`src/architecture.test.ts`) still passes.
8. The PR is open against `develop`, CI green.

## What this wave deliberately does NOT do

- No `<Button>`, `<Card>`, or any other primitive beyond `<Icon>`.
- No `fw-*` class definitions (those land per-primitive in Wave 2).
- No Storybook.
- No charts library.
- No `<DensityScope>` subtree wrapper (deferred to Wave 2 if a primitive needs it).
