# `src/entities/` — domain models

**Purpose:** representations of domain concepts (e.g., `Account`, `Transaction`, `Budget`) — types, schemas, basic UI atoms tied to the entity (e.g., `<TransactionRow>`).

**May import from:** `shared`.
**Must NOT import from:** `app`, `pages`, `widgets`, `features`, other entities.

**Conventions:**

- One folder per entity. Public surface via `index.ts`.
- No HTTP calls here — those belong in features or shared/api.
