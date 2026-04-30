# `src/shared/api/` — HTTP transport

**Purpose:** thin, typed `fetch` wrapper used by features. Base URL via `import.meta.env.VITE_API_URL`.

**Conventions:**

- One generic `request<T>` function. Auth, retries, interceptors are added here when needed — never duplicated across features.
- Do not import feature/entity types here; this layer is domain-agnostic.
