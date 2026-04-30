# `src/shared/config/` — environment and constants

**Purpose:** central place for env-derived values and project-wide constants. Read `import.meta.env` here, validate, and export typed values.

**Conventions:**
- No conditional logic depending on the environment elsewhere — read the typed config from this folder.
