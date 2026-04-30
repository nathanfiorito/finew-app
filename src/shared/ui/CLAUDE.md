# `src/shared/ui/` — design-system surface

**Purpose:** the place the future Design System plugs into. Today it hosts CSS-variable tokens, global styles, and an empty `primitives/` folder for reusable UI components (Button, Input, etc.).

**Conventions:**
- Tokens are CSS custom properties in `styles/tokens.css`. Tailwind reads them via `tailwind.config.ts`.
- Theme switching: `[data-theme="dark"]` on `<html>` is owned by `app/providers/ThemeProvider.tsx`.
- Primitives must be presentational — no domain knowledge, no API calls, no Zustand stores.
- Export every primitive via the folder's `index.ts`.
