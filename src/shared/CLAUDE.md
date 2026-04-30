# `src/shared/` — leaf layer

**Purpose:** generic, domain-agnostic building blocks: UI primitives, helpers, the API client, configuration, and shared types.

**May import from:** only other `shared/*` subfolders.
**Imported by:** every other layer.

**Subfolders:**

- `ui/` — design-system surface (tokens, primitives, styles)
- `api/` — HTTP client and shared request types
- `lib/` — pure helpers (formatting, classnames, date utils)
- `config/` — environment, feature flags, constants
- `types/` — cross-cutting TypeScript types

**Conventions:**

- Nothing here may know about a feature or entity. If it does, move it.
