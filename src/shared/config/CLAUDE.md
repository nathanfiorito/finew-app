# `src/shared/config/` — environment and constants

**Purpose:** central place for env-derived values and project-wide constants. Read `import.meta.env` here, validate, and export typed values.

**Conventions:**

- No conditional logic depending on the environment elsewhere — read the typed config from this folder.
- Locale lives here (`locale/`) — it's user-selectable configuration with the same shape as env: read once on mount, persisted to localStorage, consumed everywhere via a hook.
