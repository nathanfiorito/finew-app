# Finew Design System

> Personal-finance management PWA for serious self-directed planners. Editorial sophistication meets data density. Brazilian Portuguese first, English second-class citizen of equal standing.

---

## Index

| File / Folder | Purpose |
|---|---|
| `README.md` | This file — context, content fundamentals, visual foundations, iconography |
| `colors_and_type.css` | CSS custom properties — color tokens, type scale, semantic tokens, dark theme |
| `fonts/` | Source Serif 4 + Inter (open-source, OFL) — local copies |
| `assets/icons/` | Lucide icon set, MIT (subset copied locally + CDN fallback) |
| `assets/logos/` | Finew wordmark + monogram (placeholder marks — real assets pending) |
| `preview/` | HTML cards used by the Design System tab to display tokens, type, components |
| `ui_kits/finew-pwa/` | High-fidelity recreation of the PWA — mobile and desktop screens |
| `SKILL.md` | Cross-compatible skill manifest for Claude Code |

---

## Product context

**Finew** is a personal-finance management PWA aimed at serious self-directed planners. It is mobile-first with full desktop parity — collapsible sidebar on desktop, bottom-tab navigation plus a secondary drawer on mobile. The product is **data-dense by default** but offers a compact ↔ comfortable density toggle so the same surfaces can serve spreadsheet-minded planners *and* casual users who just want to know where the money went.

**Canonical locale:** Brazilian Portuguese (BRL, *parcelas*, *faturas de cartão*, *reserva de emergência*).
**Secondary locale:** English, equally first-class.

### Aesthetic positioning

> **Premium financial magazine.** Stripe + Financial Times + Notion Calendar. Never Bloomberg-terminal, never retail-bank.

Dense in *content*, calm in *chrome*. Generous whitespace despite high information density. The product should feel like reading a well-designed financial publication — not operating a trading station.

### Architecture (target codebase)

- **Skeleton repo:** `https://github.com/nathanfiorito/finew-app` (currently empty — TS scaffold only)
- **Stack:** Vite + React 19 + TypeScript strict + FSD (Feature-Sliced Design)
- **Token consumption:** Tailwind v4 `@theme` directive consumes CSS custom properties from `src/shared/ui/styles/tokens.css`
- **Primitives location:** `src/shared/ui/primitives/` — must be presentational only (no domain logic, no API calls, no stores)
- **Theme switch:** `[data-theme="dark"]` on `<html>`

### v1 primitive scope (~25)

**Generic:** Button, Input, Select, Checkbox, Radio, Switch, Card, Badge, Modal, BottomSheet, Toast, Table, Tabs, Accordion, Tooltip, Popover, Drawer, Stepper, Skeleton, EmptyState, Avatar, Breadcrumb, Pagination
**Finance-aware:** Money (BRL/USD-aware, tabular figures), Sparkline, KPIStat, DateRangePicker, CategoryPill

---

## Content fundamentals

### Voice

The product speaks like an **experienced financial advisor** — calm, formal-neutral, confident. Second person. Complete sentences. No slang, no emoji, no exclamation marks. The user is treated as an adult who can handle precise information about their own money.

**Register:** *"Sua reserva de emergência cobre 4,2 meses de despesas."* — not "Você tá com 4 meses guardados! 🎉"

### Casing

- **Sentence case** for headings, buttons, menu items, and tabs.
  *"Adicionar transação"* — not *"Adicionar Transação"* or *"ADICIONAR TRANSAÇÃO"*.
- **All-caps reserved** for very small labels (KPI captions ≤11px, table column headers ≤12px) with `letter-spacing: 0.06em`.
- **Brand wordmark** is rendered as `Finew` (capital F, the rest lowercase).

### Person

- **Second person, formal-neutral** (`você` in pt-BR, `you` in English). Never `tu`, never `vossa`, never the agency-speak `we`.
- The product never refers to itself — it does not say *"Finew sugere…"*, it just makes the suggestion: *"Considere mover R$ 1.200 para a reserva de emergência."*

### Empty states explain *why*, not just *what*

Bad: *"Nenhuma transação."*
Good: *"Ainda não há transações neste período. Importe um extrato bancário ou registre uma transação manualmente para começar."*

### Numbers and money

- **BRL** uses comma decimal, period thousands: `R$ 12.483,90`
- **USD** uses period decimal, comma thousands: `$12,483.90`
- Always **tabular lining figures** in tables, KPIs, and any column where numbers stack.
- Always **explicit sign** for variation: `+2,4%`, `−R$ 480,00`. The minus sign is U+2212, not a hyphen.
- **Old-style figures** are allowed in serif headings used editorially (e.g. an article-style monthly review header), never in data.

### Microcopy examples

| Surface | pt-BR | English |
|---|---|---|
| Onboarding CTA | Adicionar primeira conta | Add first account |
| Negative balance toast | Saldo insuficiente para concluir o lançamento. | Insufficient balance to complete this entry. |
| Confirm destructive | Excluir esta transação? Esta ação não pode ser desfeita. | Delete this transaction? This action cannot be undone. |
| KPI caption | Despesas — abril | Expenses — April |
| Empty chart | Sem dados suficientes para o gráfico. Registre ao menos duas transações neste período. | Not enough data for the chart. Record at least two transactions in this period. |
| Loading | Carregando… | Loading… |

### Banned words / patterns

- 🚫 emoji, ever
- 🚫 "Awesome!" / "Oops!" / "Whoops!" / "Yay!"
- 🚫 "Your money, your rules" / motivational copy
- 🚫 exclamation marks (one allowed per screen, max, in genuinely celebratory contexts like a paid-off-debt confirmation)
- 🚫 emoji-substitutes like `:)` or `<3`
- 🚫 ALL CAPS for emphasis (use the serif italic instead)

---

## Visual foundations

### Color philosophy

**Light is canonical, dark is a first-class courtesy.** Both themes are designed in parallel; neither is an afterthought.

- **Surfaces are warm neutrals.** Background is a slightly beige off-white (`#FAF8F4` light / `#14110E` dark). Text is graphite, never pure black (`#1F1B16` light / `#EFE9DD` dark). Layered surfaces use warm grays — depth comes from background layering, not from drop shadows.
- **Primary accent: moss green** (`#3F5E4A`). Used for CTAs, links, focus rings, and the primary chart series. Calm, editorial, unmistakably *not* fintech-bright.
- **Semantic gain/loss: moss green / bordeaux** (`#7A2E2E`) — never classic green/red. Color is *reinforcement*, never the sole signal — every variation is paired with a sign (`+`/`−`) and an arrow icon.
- **Categorical series palette** (8 hues, all desaturated to coexist on one chart): moss, teal-petrol, bordeaux, mustard, terracotta, dusty lavender, slate-blue, olive. See `colors_and_type.css` `--series-1` through `--series-8`.

### Typography

Open-source serif + sans pairing.

- **Source Serif 4** for headings, large monetary values (`Money` primitive at hero scale), and editorial moments. Old-style figures permitted here.
- **Inter** for UI, body, tables, KPIs. **Tabular lining figures** mandatory for any numeric column (`font-feature-settings: "tnum" 1, "lnum" 1`).
- No display/decorative fonts. No second sans. No second serif.
- Both are OFL-licensed. Local copies in `fonts/`.

### Spacing

A 4px-based scale: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 80`. The compact density variant collapses paddings by one step (e.g. table row `12 → 8`, card padding `24 → 16`).

### Form language

- **Medium radii** — 8px (inputs, buttons, badges, chips), 12px (cards, modals, sheets), 0 (tables, full-bleed sections). No pill buttons. No 24px+ "friendly bubble" radii.
- **Hairline borders** — 1px in translucent gray (`color-mix(in srgb, var(--graphite) 12%, transparent)`).
- **Near-imperceptible shadows** — used sparingly for popovers and overlays only. Cards and panels rely on background layering instead.
- Backgrounds: solid warm neutrals. **No gradients** in surfaces. **No images** as section backgrounds. **No textures, patterns, or grain.** The only "imagery" allowed in chrome is sparklines, charts, and account/category iconography.
- **No backdrop-blur** glassmorphism. The aesthetic is paper-and-ink, not frosted glass.

### Cards

A card is a panel of `--surface-1` on a `--surface-0` background, 1px hairline border, 12px radius, no shadow. Internal padding `24px` comfortable / `16px` compact. Section dividers within cards are 1px hairlines, never colored bars.

### Motion

- 150–200ms transitions, standard easing (`cubic-bezier(0.2, 0.0, 0.2, 1.0)`).
- Used for **state feedback only** — hover, focus, value change.
- **No spring physics.** No bouncy entrances. No page-transition theatrics.
- Number transitions on KPIs use `tabular-nums` and a 200ms cross-fade, never odometer roll.
- `prefers-reduced-motion: reduce` collapses all transitions to 0ms.

### State styles

- **Hover** (interactive surfaces): background shifts one layer warmer (`--surface-1 → --surface-2`); link text gets `text-decoration: underline; text-underline-offset: 0.2em`.
- **Press**: `transform: translateY(1px)` + slight desaturation. **No scale-down.** No haptic-style shrink.
- **Focus**: 2px outline in `--accent` with 2px offset, never a glow or shadow.
- **Disabled**: 40% opacity + `cursor: not-allowed`. No grayscale filter.

### Layout rules

- **Fixed elements:** mobile bottom-tab bar (64px tall, `--surface-1`, hairline top border); desktop sidebar (240px expanded / 64px collapsed, sticky, full height).
- **Content max-width:** 1280px on desktop; tables scroll horizontally past that, never wrap.
- **Mobile sheets:** long forms open in a bottom sheet that snaps to 50%, 90%, fullscreen.
- **Desktop overlays:** centered modal with 480px / 640px / 800px sizes, backdrop is `--graphite` at 32% opacity (no blur).

### Transparency, blur

- Used **only** for the modal backdrop (`rgba(graphite, 0.32)` light theme).
- Never on surfaces, cards, or chrome.

### Imagery (when present)

The product itself contains no decorative imagery. If marketing or onboarding ever introduces photography, the direction is: **warm**, slightly **desaturated**, soft natural light, neutral subjects (paper, plants, hands writing). No stock-photo people-pointing-at-laptops. No illustrations of coins flying out of phones.

### Charts

- **Sparklines** are inline, no axis, no grid, no labels. Single hairline (1.5px) in `--accent`, optional translucent fill at 8% opacity.
- **Full charts** are editorially sober: thin lines (1.5px), translucent area fills, near-invisible 1px grid in `color-mix(graphite, 6%)`, **serif labels** (Source Serif 4 at 11px) for axis ticks, sans labels for callouts.

---

## Iconography

### System

**Lucide** (https://lucide.dev) — MIT-licensed, 1.5–2px outline, slightly rounded corners, 24px native grid. Matches the editorial-but-modern voice better than Phosphor's softer terminals or Heroicons' heavier strokes.

- Local subset in `assets/icons/lucide/` for offline use and pixel-perfect mocks.
- Production code uses the `lucide-react` npm package — tree-shakable, individual imports.
- **Stroke width:** 1.75px is the Finew default (between Lucide's `regular` 2 and `thin` 1.5). Apply via `<Icon strokeWidth={1.75} />`.
- **Sizes:** 16px (inline with body), 20px (default UI), 24px (touch targets, headings).

### What's an icon, what's text, what's nothing

- **Icons used:** navigation (sidebar, bottom-tab), action verbs in buttons paired with text labels, category markers in lists, +/− directional arrows on KPI deltas.
- **Icons *not* used:** alone in buttons without a label (except universally-understood close `×`, search `🔍`, and back `←`); decoratively in empty states (use type instead); in body text.
- **No emoji, ever** — not in UI, not in toasts, not in marketing copy. This is non-negotiable for the financial-advisor register.
- **Unicode characters** used sparingly and intentionally: `−` (U+2212 minus), `×` (U+00D7 close), `→` (U+2192 arrow), `…` (U+2026 ellipsis), `R$` (the literal currency symbol — there is no Lucide icon for currency).
- **Logos / brand marks:** `Finew` wordmark in Source Serif 4 weight 600, optical-size 36+. No graphic mark in v1 — the wordmark *is* the logo.

### Custom iconography

None in v1. If a concept is not in Lucide, file an issue rather than draw a one-off.

---

## Index — see also

- **`SKILL.md`** — manifest for using this design system as a Claude Code skill.
- **`colors_and_type.css`** — every CSS custom property, light + dark themes.
- **`preview/`** — design-tab cards rendering tokens and components.
- **`ui_kits/finew-pwa/`** — high-fidelity prototype of the PWA itself.

---

## Caveats

- The skeleton repo (`finew-app`) is empty — no production tokens, components, or UI to recreate from. Everything in this design system is **derived from the written brief**, not extracted from existing code. As the codebase grows, this system should be updated to match (and become the source of truth for) what's actually shipped.
- No real Finew logo asset exists yet — the wordmark in `assets/logos/` is set in Source Serif 4 as a placeholder.
- Photography and illustration are not part of v1 — the system anticipates future marketing needs but does not commit to a direction.
