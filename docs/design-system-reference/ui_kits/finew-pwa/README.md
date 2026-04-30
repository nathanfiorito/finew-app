# Finew PWA — UI Kit

High-fidelity recreation of the Finew personal-finance PWA. Mobile-first with full desktop parity.

## Files

- `index.html` — interactive prototype, mobile + desktop side-by-side, click through screens
- `Components.jsx` — shared primitives (Button, Money, KPI, CategoryPill, Sparkline, etc.)
- `MobileApp.jsx` — mobile shell: bottom tabs, top bar, sheets
- `DesktopApp.jsx` — desktop shell: sidebar, top bar, content
- `Screens.jsx` — Overview, Transactions, Budgets, Cards, Goals — same screens, both shells

## Architecture mirror

In production these become FSD slices:
- `src/shared/ui/primitives/` ← `Components.jsx`
- `src/widgets/sidebar/` ← part of `DesktopApp.jsx`
- `src/widgets/bottom-nav/` ← part of `MobileApp.jsx`
- `src/pages/overview/` ← `Screens.Overview`

## Caveats

The skeleton repo is empty; this kit is built from the brief. As soon as real components exist, this should be replaced with extractions from the actual code.
