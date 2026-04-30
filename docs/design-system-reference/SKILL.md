---
name: finew-design
description: Use this skill to generate well-branded interfaces and assets for Finew, the personal-finance management PWA. Editorial/sophisticated aesthetic — premium financial magazine feel, mobile-first with desktop parity, Brazilian Portuguese first. Contains tokens (CSS custom properties for warm-neutral surfaces, moss-green accent, bordeaux loss color), Source Serif 4 + Inter typography, Lucide iconography, and a high-fidelity React UI kit covering Overview / Transactions / Budgets / Cards / Goals screens.
user-invocable: true
---

# Finew Design Skill

Read `README.md` in this folder first. It contains the full visual + content fundamentals: voice (formal-neutral pt-BR financial advisor), color philosophy (light-canonical, dark first-class courtesy, moss/bordeaux semantic), typography (open-source serif + sans), motion (150–200ms standard ease, no springs), iconography (Lucide 1.75px), and density rules.

## Files

- `README.md` — full system documentation
- `colors_and_type.css` — CSS custom properties, light + dark themes, density variant, semantic type classes
- `preview/` — design-system tab cards demonstrating each token / component cluster
- `ui_kits/finew-pwa/` — interactive React recreation of the PWA (mobile + desktop, 5 screens)

## Working with this skill

When creating **visual artifacts** (slides, mocks, throwaway prototypes):
- Copy `colors_and_type.css` into the artifact and link it
- Copy individual components from `ui_kits/finew-pwa/Components.jsx` (Money, KPI, CategoryPill, Sparkline, Button) — they're presentational and dependency-free
- Use Brazilian Portuguese as the canonical locale unless told otherwise
- Tabular figures on every numeric column (`font-variant-numeric: tabular-nums lining-nums`)
- Always pair semantic colors with sign + arrow — color is reinforcement, not signal
- No emoji. No exclamation marks. Sentence case. No gradients. No glassmorphism. No drop shadows on cards.

When working on **production code** (`finew-app` repo, FSD architecture):
- Place new primitives in `src/shared/ui/primitives/`
- Tokens live in `src/shared/ui/styles/tokens.css` and are consumed via Tailwind v4 `@theme`
- Primitives are presentational only — no domain knowledge, no API calls, no stores
- Theme switch via `[data-theme="dark"]` on `<html>`
- Density variant via `[data-density="compact"]` on the subtree

If invoked without specific guidance, ask the user what they want to build and which surface (mobile, desktop, or marketing), confirm locale (pt-BR / en), confirm density default, then act as an expert designer producing HTML artifacts or production-ready React/TS code.
