# `src/shared/lib/` — pure helpers

**Purpose:** small, pure utilities (e.g., `cn` for classnames, money/date formatters). No React state, no DOM access, no network.

**Conventions:**

- Each helper lives in its own file and is exported by name.
- Side-effect-free; trivially unit-testable.
