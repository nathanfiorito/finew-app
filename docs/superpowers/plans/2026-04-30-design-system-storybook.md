# Design System — Storybook (Ladle) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land a local Ladle sandbox that lists all 26 primitives with one default story each, plus a toolbar that flips theme / density / locale globally.

**Architecture:** Per the spec (`docs/superpowers/specs/2026-04-30-design-system-storybook-design.md`). Ladle (Vite-native), co-located stories, Phase 1 only.

**Tech Stack:** `@ladle/react` (recent), Vite 8, React 19, our existing providers from `src/shared/config/locale/` and `src/app/providers/`.

**Hard prerequisite:** Wave 4/5/6 PRs all merged into `develop` (already true).

---

### Task 1: Branch and install Ladle

**Files:** `package.json`, `.gitignore`

- [ ] **Step 1: Branch**

```bash
git switch develop && git pull
git switch -c feature/ds-storybook-ladle
```

- [ ] **Step 2: Install**

```bash
npm install -D @ladle/react@latest
```

- [ ] **Step 3: Add scripts to package.json**

Modify the `scripts` block:

```json
"ladle": "ladle serve",
"ladle:build": "ladle build"
```

- [ ] **Step 4: Update .gitignore**

Append:

```
.ladle/dist/
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore(ds): add @ladle/react for storybook sandbox"
```

---

### Task 2: Ladle config + global decorators

**Files:** `.ladle/config.mjs`, `.ladle/components.tsx`

- [ ] **Step 1: `.ladle/config.mjs`**

```js
// .ladle/config.mjs
export default {
  stories: "src/**/*.stories.{ts,tsx}",
  defaultStory: "primitives--icon",
  addons: {
    theme: { enabled: false }, // we provide our own toolbar
    width: { enabled: false },
    rtl: { enabled: false },
    source: { enabled: true },
    a11y: { enabled: false },
  },
};
```

- [ ] **Step 2: `.ladle/components.tsx`**

```tsx
// .ladle/components.tsx
// Global decorator wraps every story with our providers and pipes the
// Ladle toolbar controls into the corresponding Zustand stores.

import type { GlobalProvider } from "@ladle/react";
import { useEffect } from "react";

import "../src/app/styles/index.css";
import { ThemeProvider, useThemeStore } from "../src/app/providers/ThemeProvider.js";
import { DensityProvider, useDensityStore } from "../src/app/providers/DensityProvider.js";
import { LocaleProvider, useLocaleStore } from "../src/shared/config/locale/index.js";

export const argTypes = {
  theme: {
    control: { type: "radio" },
    options: ["light", "dark"],
    defaultValue: "light",
  },
  density: {
    control: { type: "radio" },
    options: ["comfortable", "compact"],
    defaultValue: "comfortable",
  },
  locale: {
    control: { type: "radio" },
    options: ["pt-BR", "en-US"],
    defaultValue: "pt-BR",
  },
};

export const Provider: GlobalProvider = ({ children, globalState }) => {
  const theme = globalState.theme as "light" | "dark";
  const density = globalState.density as "comfortable" | "compact";
  const locale = globalState.locale as "pt-BR" | "en-US";

  useEffect(() => {
    useThemeStore.setState({ theme, override: theme });
  }, [theme]);
  useEffect(() => {
    useDensityStore.setState({ density });
  }, [density]);
  useEffect(() => {
    useLocaleStore.setState({ locale });
  }, [locale]);

  return (
    <ThemeProvider>
      <DensityProvider>
        <LocaleProvider>{children}</LocaleProvider>
      </DensityProvider>
    </ThemeProvider>
  );
};
```

- [ ] **Step 3: Smoke run**

```bash
npm run ladle
```

Expected: server starts at `http://localhost:61000` (or similar), shows "no stories yet" since none exist. Stop the server (Ctrl-C).

- [ ] **Step 4: Commit**

```bash
git add .ladle
git commit -m "feat(ds): add Ladle config and global theme/density/locale decorator"
```

---

### Task 3: Stories for static / non-overlay primitives

**Files:** `<Name>.stories.tsx` for Icon, Button, Card, Avatar, CategoryPill, Badge, Skeleton, EmptyState, Breadcrumb, Pagination, Money, Sparkline, KPIStat, Input, Select, Checkbox, Radio, Switch.

These don't need open/close state — just render with sensible props.

- [ ] **Step 1: Icon (registry visual reference)**

`src/shared/ui/primitives/Icon/Icon.stories.tsx`:

```tsx
import type { JSX } from "react";
import { Icon } from "./Icon.js";

const NAMES = [
  "home", "list", "pie", "card", "target", "search", "bell", "plus",
  "menu", "user", "arrowUp", "arrowDown", "chevronUp", "chevronRight",
  "chevronLeft", "chevronDown", "close", "filter", "calendar", "cog",
  "wallet",
] as const;

export const Default = (): JSX.Element => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 16, padding: 16 }}>
    {NAMES.map((n) => (
      <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 11, color: "var(--fg-3)" }}>
        <Icon name={n} size={24} />
        <span>{n}</span>
      </div>
    ))}
  </div>
);
```

- [ ] **Step 2: Button**

`src/shared/ui/primitives/Button/Button.stories.tsx`:

```tsx
import type { JSX } from "react";
import { Button } from "./Button.js";

export const Default = (): JSX.Element => (
  <div style={{ display: "flex", gap: 12, padding: 16, alignItems: "center" }}>
    <Button>Salvar</Button>
    <Button variant="secondary">Cancelar</Button>
    <Button variant="ghost">Detalhes</Button>
    <Button variant="danger">Excluir</Button>
    <Button loading>Carregando</Button>
  </div>
);
```

- [ ] **Step 3: Card**

`src/shared/ui/primitives/Card/Card.stories.tsx`:

```tsx
import type { JSX } from "react";
import { Card } from "./Card.js";
import { Money } from "../Money/Money.js";

export const Default = (): JSX.Element => (
  <div style={{ padding: 16, maxWidth: 360 }}>
    <Card title="Saldo">
      <Money amount={12483.9} display />
    </Card>
  </div>
);
```

- [ ] **Step 4: Avatar**

`src/shared/ui/primitives/Avatar/Avatar.stories.tsx`:

```tsx
import type { JSX } from "react";
import { Avatar } from "./Avatar.js";

export const Default = (): JSX.Element => (
  <div style={{ display: "flex", gap: 12, padding: 16, alignItems: "center" }}>
    <Avatar initials="NF" size="sm" />
    <Avatar initials="NF" size="md" />
    <Avatar initials="NF" size="lg" />
  </div>
);
```

- [ ] **Step 5: CategoryPill**

`src/shared/ui/primitives/CategoryPill/CategoryPill.stories.tsx`:

```tsx
import type { JSX } from "react";
import { CategoryPill } from "./CategoryPill.js";

export const Default = (): JSX.Element => (
  <div style={{ display: "flex", gap: 8, padding: 16, flexWrap: "wrap" }}>
    <CategoryPill label="Mercado" color="var(--series-1)" />
    <CategoryPill label="Transporte" color="var(--series-2)" />
    <CategoryPill label="Restaurantes" color="var(--series-3)" />
    <CategoryPill label="Assinaturas" color="var(--series-4)" />
  </div>
);
```

- [ ] **Step 6: Badge**

`src/shared/ui/primitives/Badge/Badge.stories.tsx`:

```tsx
import type { JSX } from "react";
import { Badge } from "./Badge.js";

export const Default = (): JSX.Element => (
  <div style={{ display: "flex", gap: 8, padding: 16, alignItems: "center" }}>
    <Badge tone="neutral">Pendente</Badge>
    <Badge tone="gain">Pago</Badge>
    <Badge tone="loss">Atrasado</Badge>
    <Badge tone="warn">Aviso</Badge>
    <Badge tone="info">Info</Badge>
  </div>
);
```

- [ ] **Step 7: Skeleton**

`src/shared/ui/primitives/Skeleton/Skeleton.stories.tsx`:

```tsx
import type { JSX } from "react";
import { Skeleton } from "./Skeleton.js";

export const Default = (): JSX.Element => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16, maxWidth: 320 }}>
    <Skeleton width={240} height={16} />
    <Skeleton variant="text" lines={3} />
    <Skeleton variant="circle" width={48} height={48} />
  </div>
);
```

- [ ] **Step 8: EmptyState**

`src/shared/ui/primitives/EmptyState/EmptyState.stories.tsx`:

```tsx
import type { JSX } from "react";
import { EmptyState } from "./EmptyState.js";
import { Button } from "../Button/Button.js";

export const Default = (): JSX.Element => (
  <div style={{ padding: 16, maxWidth: 480 }}>
    <EmptyState
      iconName="filter"
      title="Sem dados suficientes para o gráfico"
      description="Registre ao menos duas transações neste período para visualizar a evolução."
      action={<Button iconLeading="plus">Adicionar transação</Button>}
    />
  </div>
);
```

- [ ] **Step 9: Breadcrumb**

`src/shared/ui/primitives/Breadcrumb/Breadcrumb.stories.tsx`:

```tsx
import type { JSX } from "react";
import { Breadcrumb } from "./Breadcrumb.js";

export const Default = (): JSX.Element => (
  <div style={{ padding: 16 }}>
    <Breadcrumb
      items={[
        { label: "Início", href: "/" },
        { label: "Contas", href: "/contas" },
        { label: "Detalhes" },
      ]}
    />
  </div>
);
```

- [ ] **Step 10: Pagination**

`src/shared/ui/primitives/Pagination/Pagination.stories.tsx`:

```tsx
import { useState, type JSX } from "react";
import { Pagination } from "./Pagination.js";

export const Default = (): JSX.Element => {
  const [page, setPage] = useState(3);
  return (
    <div style={{ padding: 16 }}>
      <Pagination page={page} pageCount={12} onPageChange={setPage} />
    </div>
  );
};
```

- [ ] **Step 11: Money**

`src/shared/ui/primitives/Money/Money.stories.tsx`:

```tsx
import type { JSX } from "react";
import { Money } from "./Money.js";

export const Default = (): JSX.Element => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}>
    <div><Money amount={12483.9} /></div>
    <div><Money amount={-480} /></div>
    <div><Money amount={1234.5} sign="always" /></div>
    <div><Money amount={null} /></div>
    <div><Money amount={42000} display /></div>
  </div>
);
```

- [ ] **Step 12: Sparkline**

`src/shared/ui/primitives/Sparkline/Sparkline.stories.tsx`:

```tsx
import type { JSX } from "react";
import { Sparkline } from "./Sparkline.js";

export const Default = (): JSX.Element => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
    <Sparkline values={[1, 2, 3, 5, 4, 7, 6]} tone="neutral" />
    <Sparkline values={[10, 8, 12, 14, 11, 16]} tone="gain" />
    <Sparkline values={[20, 18, 14, 12, 9, 7]} tone="loss" />
  </div>
);
```

- [ ] **Step 13: KPIStat**

`src/shared/ui/primitives/KPIStat/KPIStat.stories.tsx`:

```tsx
import type { JSX } from "react";
import { KPIStat } from "./KPIStat.js";

export const Default = (): JSX.Element => (
  <div style={{ padding: 16, maxWidth: 360 }}>
    <KPIStat
      label="Saldo · abril"
      value={12483.9}
      delta={2.4}
      deltaLabel="vs. mês anterior"
      sparkline={[10, 11, 12, 13, 12, 14, 12.5]}
      sparkTone="gain"
    />
  </div>
);
```

- [ ] **Step 14: Input**

`src/shared/ui/primitives/Input/Input.stories.tsx`:

```tsx
import type { JSX } from "react";
import { Input } from "./Input.js";

export const Default = (): JSX.Element => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16, maxWidth: 320 }}>
    <Input name="email" placeholder="seu@email.com" />
    <Input name="invalid" placeholder="campo com erro" error="Formato inválido" />
  </div>
);
```

- [ ] **Step 15: Select**

`src/shared/ui/primitives/Select/Select.stories.tsx`:

```tsx
import { useState, type JSX } from "react";
import { Select } from "./Select.js";

export const Default = (): JSX.Element => {
  const [value, setValue] = useState<string | undefined>(undefined);
  return (
    <div style={{ padding: 16, maxWidth: 320 }}>
      <Select
        value={value}
        onValueChange={setValue}
        placeholder="Selecione uma conta"
        options={[
          { value: "checking", label: "Conta corrente" },
          { value: "savings", label: "Poupança" },
          { value: "credit", label: "Cartão de crédito" },
        ]}
      />
    </div>
  );
};
```

> **Note:** verify the actual `<Select>` API (prop names — `options`, `onValueChange`, etc.) before writing this story. Adjust to match the Wave 4 source. If the API differs, update the snippet above to match what the primitive actually accepts.

- [ ] **Step 16: Checkbox**

`src/shared/ui/primitives/Checkbox/Checkbox.stories.tsx`:

```tsx
import { useState, type JSX } from "react";
import { Checkbox } from "./Checkbox.js";

export const Default = (): JSX.Element => {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ padding: 16 }}>
      <Checkbox checked={checked} onCheckedChange={setChecked} label="Aceito os termos" />
    </div>
  );
};
```

> **Note:** confirm the prop names against the actual primitive (`onCheckedChange`, `label`, etc.).

- [ ] **Step 17: Radio**

`src/shared/ui/primitives/Radio/Radio.stories.tsx`:

```tsx
import { useState, type JSX } from "react";
import { Radio } from "./Radio.js";

export const Default = (): JSX.Element => {
  const [value, setValue] = useState("monthly");
  return (
    <div style={{ padding: 16 }}>
      <Radio
        value={value}
        onValueChange={setValue}
        options={[
          { value: "monthly", label: "Mensal" },
          { value: "yearly", label: "Anual" },
        ]}
      />
    </div>
  );
};
```

> **Note:** confirm against actual API.

- [ ] **Step 18: Switch**

`src/shared/ui/primitives/Switch/Switch.stories.tsx`:

```tsx
import { useState, type JSX } from "react";
import { Switch } from "./Switch.js";

export const Default = (): JSX.Element => {
  const [on, setOn] = useState(false);
  return (
    <div style={{ padding: 16 }}>
      <Switch checked={on} onCheckedChange={setOn} label="Notificações por e-mail" />
    </div>
  );
};
```

- [ ] **Step 19: Smoke run + commit**

```bash
npm run ladle
```

Expected: 18 stories visible in sidebar, all render. Stop server.

```bash
git add src/shared/ui/primitives
git commit -m "feat(ds): add stories for static primitives (18)"
```

---

### Task 4: Stories for overlay / interactive primitives

These need local state to demonstrate open/close.

**Files:** `<Name>.stories.tsx` for DateRangePicker, Modal, BottomSheet, Drawer, Toast, Tabs, Accordion, Tooltip, Popover, Stepper.

- [ ] **Step 1: DateRangePicker**

`src/shared/ui/primitives/DateRangePicker/DateRangePicker.stories.tsx`:

```tsx
import { useState, type JSX } from "react";
import { DateRangePicker } from "./DateRangePicker.js";

export const Default = (): JSX.Element => {
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});
  return (
    <div style={{ padding: 16 }}>
      <DateRangePicker value={range} onChange={setRange} />
    </div>
  );
};
```

> **Note:** verify the prop names (`value` / `onChange` vs `range` / `onRangeChange`). Adjust to match Wave 4 source.

- [ ] **Step 2: Modal**

`src/shared/ui/primitives/Modal/Modal.stories.tsx`:

```tsx
import { useState, type JSX } from "react";
import { Modal } from "./Modal.js";
import { Button } from "../Button/Button.js";

export const Default = (): JSX.Element => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: 16 }}>
      <Button onClick={() => { setOpen(true); }}>Abrir modal</Button>
      <Modal open={open} onOpenChange={setOpen} title="Excluir transação?">
        Esta ação não pode ser desfeita.
      </Modal>
    </div>
  );
};
```

> **Note:** verify `Modal` actual API (size prop, slots for footer, etc.).

- [ ] **Step 3: BottomSheet**

`src/shared/ui/primitives/BottomSheet/BottomSheet.stories.tsx`:

```tsx
import { useState, type JSX } from "react";
import { BottomSheet } from "./BottomSheet.js";
import { Button } from "../Button/Button.js";

export const Default = (): JSX.Element => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: 16 }}>
      <Button onClick={() => { setOpen(true); }}>Abrir bottom sheet</Button>
      <BottomSheet open={open} onOpenChange={setOpen} title="Nova transação">
        <div style={{ padding: 16 }}>Formulário aqui.</div>
      </BottomSheet>
    </div>
  );
};
```

- [ ] **Step 4: Drawer**

`src/shared/ui/primitives/Drawer/Drawer.stories.tsx`:

```tsx
import { useState, type JSX } from "react";
import { Drawer } from "./Drawer.js";
import { Button } from "../Button/Button.js";

export const Default = (): JSX.Element => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: 16 }}>
      <Button onClick={() => { setOpen(true); }}>Abrir drawer</Button>
      <Drawer open={open} onOpenChange={setOpen} title="Filtros">
        <div style={{ padding: 16 }}>Filtros laterais.</div>
      </Drawer>
    </div>
  );
};
```

- [ ] **Step 5: Toast**

`src/shared/ui/primitives/Toast/Toast.stories.tsx`:

```tsx
import type { JSX } from "react";
import { Button } from "../Button/Button.js";
import { Toaster, toast } from "./Toast.js";

export const Default = (): JSX.Element => (
  <div style={{ padding: 16 }}>
    <Button onClick={() => { toast.success("Lançamento salvo"); }}>Disparar toast</Button>
    <Toaster />
  </div>
);
```

> **Note:** verify Toast exports (`toast` and `Toaster`).

- [ ] **Step 6: Tabs**

`src/shared/ui/primitives/Tabs/Tabs.stories.tsx`:

```tsx
import type { JSX } from "react";
import { Tabs } from "./Tabs.js";

export const Default = (): JSX.Element => (
  <div style={{ padding: 16, maxWidth: 480 }}>
    <Tabs defaultValue="overview">
      <Tabs.List>
        <Tabs.Trigger value="overview">Visão geral</Tabs.Trigger>
        <Tabs.Trigger value="transactions">Transações</Tabs.Trigger>
        <Tabs.Trigger value="budgets">Orçamentos</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview">Visão geral do mês.</Tabs.Content>
      <Tabs.Content value="transactions">Lista de transações.</Tabs.Content>
      <Tabs.Content value="budgets">Acompanhamento de orçamentos.</Tabs.Content>
    </Tabs>
  </div>
);
```

> **Note:** verify Tabs uses dot-namespaced API or separate exports.

- [ ] **Step 7: Accordion**

`src/shared/ui/primitives/Accordion/Accordion.stories.tsx`:

```tsx
import type { JSX } from "react";
import { Accordion } from "./Accordion.js";

export const Default = (): JSX.Element => (
  <div style={{ padding: 16, maxWidth: 480 }}>
    <Accordion type="single" collapsible>
      <Accordion.Item value="item-1">
        <Accordion.Trigger>Quanto rendeu este mês?</Accordion.Trigger>
        <Accordion.Content>+ R$ 248,00 em juros e dividendos.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Trigger>Quais foram os maiores gastos?</Accordion.Trigger>
        <Accordion.Content>Mercado, transporte e assinaturas.</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  </div>
);
```

- [ ] **Step 8: Tooltip**

`src/shared/ui/primitives/Tooltip/Tooltip.stories.tsx`:

```tsx
import type { JSX } from "react";
import { Tooltip } from "./Tooltip.js";
import { Button } from "../Button/Button.js";

export const Default = (): JSX.Element => (
  <div style={{ padding: 64, display: "flex", justifyContent: "center" }}>
    <Tooltip content="Adicionar nova transação">
      <Button iconLeading="plus">Novo</Button>
    </Tooltip>
  </div>
);
```

- [ ] **Step 9: Popover**

`src/shared/ui/primitives/Popover/Popover.stories.tsx`:

```tsx
import type { JSX } from "react";
import { Popover } from "./Popover.js";
import { Button } from "../Button/Button.js";

export const Default = (): JSX.Element => (
  <div style={{ padding: 64, display: "flex", justifyContent: "center" }}>
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="secondary">Filtros</Button>
      </Popover.Trigger>
      <Popover.Content>
        <div style={{ padding: 12 }}>Conteúdo do popover.</div>
      </Popover.Content>
    </Popover>
  </div>
);
```

> **Note:** verify Popover trigger/content compound API; if our wrapper inlines a button, simplify accordingly.

- [ ] **Step 10: Stepper**

`src/shared/ui/primitives/Stepper/Stepper.stories.tsx`:

```tsx
import { useState, type JSX } from "react";
import { Stepper } from "./Stepper.js";

export const Default = (): JSX.Element => {
  const [step, setStep] = useState(0);
  return (
    <div style={{ padding: 16, maxWidth: 480 }}>
      <Stepper
        step={step}
        onStepChange={setStep}
        steps={[
          { label: "Conta" },
          { label: "Detalhes" },
          { label: "Confirmar" },
        ]}
      />
    </div>
  );
};
```

> **Note:** verify Stepper API.

- [ ] **Step 11: Table**

`src/shared/ui/primitives/Table/Table.stories.tsx`:

```tsx
import type { JSX } from "react";
import { Table } from "./Table.js";
import { Money } from "../Money/Money.js";

interface Row {
  id: string;
  date: string;
  description: string;
  amount: number;
}

const data: Row[] = [
  { id: "1", date: "2026-04-28", description: "Mercado Extra", amount: -187.5 },
  { id: "2", date: "2026-04-27", description: "Salário",       amount: 6800 },
  { id: "3", date: "2026-04-26", description: "Uber",          amount: -34.9 },
];

export const Default = (): JSX.Element => (
  <div style={{ padding: 16 }}>
    <Table
      data={data}
      rowKey={(r) => r.id}
      columns={[
        { id: "date", header: "Data", accessor: (r) => r.date, sortable: true },
        { id: "description", header: "Descrição", accessor: (r) => r.description },
        {
          id: "amount",
          header: "Valor",
          accessor: (r) => r.amount,
          align: "right",
          cell: (r) => <Money amount={r.amount} sign="always" />,
        },
      ]}
    />
  </div>
);
```

> **Note:** verify Table API matches Wave 6 source (especially `rowKey`, `accessor`, `cell` names).

- [ ] **Step 12: Smoke run + commit**

```bash
npm run ladle
```

Expected: 28 stories total now (Icon + 18 + 9 overlay + Table = 29 actually; plus Stepper from step 10 is overlay-ish). Verify all render, the overlays open/close correctly, the toolbar flips theme/density/locale.

```bash
git add src/shared/ui/primitives
git commit -m "feat(ds): add stories for overlay/interactive primitives (10)"
```

---

### Task 5: Pipeline + verify + push + PR

- [ ] **Step 1: ESLint override for stories (if needed)**

If lint complains about `*.stories.tsx` (return-type rules, etc.), update `eslint.config.js` to extend the test-file relaxed override to story files:

```js
{
  files: ["**/*.test.ts", "**/*.test.tsx", "**/*.stories.tsx", "src/test/**"],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
  },
},
```

Commit if changed:

```bash
git add eslint.config.js
git commit -m "chore(ds): relax lint for story files"
```

- [ ] **Step 2: Confirm Vitest doesn't pick up stories**

```bash
npm test -- --run
```

Expected: same test count as before (224), no new "test files" added.

If Vitest does pick up `.stories.tsx` (treats them as tests), update `vite.config.ts`:

```ts
test: {
  // ...existing fields
  exclude: ["**/node_modules/**", "**/*.stories.{ts,tsx}"],
},
```

- [ ] **Step 3: Pipeline**

```bash
npm run lint && npm run typecheck && npm test -- --run && npm run build && npm run ladle:build
```

All five must PASS.

- [ ] **Step 4: Push**

```bash
git push -u origin feature/ds-storybook-ladle
```

- [ ] **Step 5: PR**

Title: `feat(ds): add Ladle storybook with stories for all 26 primitives`

Body summarizing: Ladle install, co-located stories, theme/density/locale toolbar, Phase 1 scope, link to spec/plan.

---

## Acceptance criteria

This wave is done when:

1. `npm run ladle` opens the sandbox; sidebar lists all 26 primitives (28+ stories counting Icon's grid).
2. Each primitive's `Default` story renders without console errors.
3. Toolbar flipping `Theme`, `Density`, `Locale` updates the rendered story live.
4. `npm run lint && npm run typecheck && npm test -- --run && npm run build && npm run ladle:build` all pass.
5. The architecture test still passes (stories live inside `shared/ui/primitives/<Name>/`, only import siblings + providers/config — all `shared`).
6. PR open against `develop`, CI green.
