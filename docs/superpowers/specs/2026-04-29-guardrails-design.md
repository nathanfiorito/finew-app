# Guardrails mínimos — Design

**Data:** 2026-04-29
**Repo:** `nathanfiorito/finew-app` (privado, ADMIN)
**Stack alvo:** Node.js 24.15.0 + npm + TypeScript

## 1. Objetivo

Estabelecer um conjunto mínimo de proteções de branch, integração contínua e automação de Pull Requests para o repositório `finew-app`, antes do início do desenvolvimento da aplicação.

## 2. Modelo de branches (Git Flow simplificado)

Apenas três tipos de branches:

- `main` — produção
- `develop` — integração
- `feature/*` — trabalho em andamento

Fluxo:

```
feature/* ──push──▶ CI ──ok──▶ auto-PR ──▶ develop ──merge──▶ CI ──ok──▶ auto-PR ──▶ main
```

`main` permanece como default branch do GitHub. `feature/*` deve ser criada a partir de `develop` (`git switch develop && git pull && git switch -c feature/<nome>`).

## 3. Arquitetura

| Camada | Localização | Responsabilidade |
|---|---|---|
| Rulesets | `.github/rulesets/main.json`, `.github/rulesets/develop.json` | Proteção declarativa de `main` e `develop` |
| Bootstrap | Comandos `gh api` documentados na seção 8 | Aplicação manual única dos rulesets |
| CI | `.github/workflows/ci.yml` | `lint → typecheck → test → build` + job `open-pr` |
| Tooling | `package.json`, `tsconfig*.json`, `eslint.config.js`, `.nvmrc`, `.gitignore` | Configs invocadas pelo CI |
| Smoke | `src/index.ts`, `src/index.test.ts` | Garantir que o pipeline passe na primeira execução |

## 4. Rulesets

Dois rulesets idênticos em estrutura, um por branch protegida.

### 4.1 `.github/rulesets/main.json`

```json
{
  "name": "protect-main",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/heads/main"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "required_linear_history" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false,
        "allowed_merge_methods": ["squash"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          { "context": "ci / lint" },
          { "context": "ci / typecheck" },
          { "context": "ci / test" },
          { "context": "ci / build" }
        ]
      }
    }
  ],
  "bypass_actors": []
}
```

### 4.2 `.github/rulesets/develop.json`

Idêntico ao anterior, alterando:

- `"name": "protect-develop"`
- `"include": ["refs/heads/develop"]`

### 4.3 Efeitos

- `deletion` — bloqueia delete da branch.
- `non_fast_forward` — bloqueia force-push.
- `required_linear_history` — força histórico linear.
- `pull_request` com `required_approving_review_count: 0` — força que toda mudança passe por PR (sem aprovação obrigatória, pois é solo dev).
- `allowed_merge_methods: ["squash"]` — desabilita merge commit e rebase merge na UI.
- `strict_required_status_checks_policy: true` — exige branch atualizada com a base antes do merge.
- `bypass_actors: []` — sem exceções, nem para admin.

## 5. Workflow de CI

Arquivo único: `.github/workflows/ci.yml`.

### 5.1 Triggers

```yaml
on:
  push:
    branches: ["develop", "feature/**"]
  pull_request:
    branches: ["develop", "main"]
```

### 5.2 Jobs

Todos os jobs rodam em `ubuntu-latest` com Node 24.15.0 e cache de npm.

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "24.15.0", cache: "npm" }
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "24.15.0", cache: "npm" }
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "24.15.0", cache: "npm" }
      - run: npm ci
      - run: npm test -- --run

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "24.15.0", cache: "npm" }
      - run: npm ci
      - run: npm run build

  open-pr:
    needs: [lint, typecheck, test, build]
    if: github.event_name == 'push' && (github.ref == 'refs/heads/develop' || startsWith(github.ref, 'refs/heads/feature/'))
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - id: target
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/develop" ]]; then
            echo "base=main" >> $GITHUB_OUTPUT
          else
            echo "base=develop" >> $GITHUB_OUTPUT
          fi
      - env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          HEAD="${GITHUB_REF#refs/heads/}"
          BASE="${{ steps.target.outputs.base }}"
          if gh pr list --head "$HEAD" --base "$BASE" --state open --json number --jq '.[0].number' | grep -q .; then
            echo "PR already exists for $HEAD → $BASE"
          else
            gh pr create --base "$BASE" --head "$HEAD" \
              --title "$(git log -1 --pretty=%s)" \
              --body "Auto-PR from \`$HEAD\` after CI passed."
          fi
```

### 5.3 Comportamento conhecido (`GITHUB_TOKEN`)

PRs criados via `GITHUB_TOKEN` não disparam workflows aninhados. Aceitável aqui porque:

- Os checks `ci / lint`, `ci / typecheck`, `ci / test`, `ci / build` rodaram no `push` e ficam atrelados ao SHA do commit. O PR exibe os mesmos checks (mesmo SHA), satisfazendo o ruleset.
- Não há outros workflows que precisem rodar exclusivamente em `pull_request`.

## 6. Tooling local

### 6.1 `package.json` (esqueleto)

```json
{
  "name": "finew-app",
  "private": true,
  "type": "module",
  "engines": { "node": ">=24.15.0" },
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "build": "tsc -p tsconfig.build.json"
  },
  "devDependencies": {
    "typescript": "^5",
    "eslint": "^9",
    "@eslint/js": "^9",
    "typescript-eslint": "^8",
    "vitest": "^2"
  }
}
```

### 6.2 Demais arquivos

- `tsconfig.json` — base estrita (`strict: true`, `target: ES2023`, `module: ESNext`, `moduleResolution: Bundler`).
- `tsconfig.build.json` — herda da base, define `outDir: dist`, exclui arquivos `*.test.ts`.
- `eslint.config.js` — flat config com `@eslint/js` recommended + `typescript-eslint` recommended.
- `.gitignore` — `node_modules`, `dist`, `coverage`, `.env*`.
- `.nvmrc` — `24.15.0`.

### 6.3 Smoke placeholders

- `src/index.ts` — `export const app = "finew-app";`
- `src/index.test.ts` — teste mínimo do vitest para garantir que `npm test` não falhe por ausência de testes.

## 7. Convenções

- **Conventional Commits** — convenção manual, sem enforcement automatizado. Aplicada no título do PR (que vira o commit final via squash).
- **Estratégia de merge** — apenas squash (forçado pelo ruleset).
- **Nome de feature branch** — `feature/<descrição-curta-em-kebab>`.

## 8. Sequência de bootstrap (única execução)

### Passo 1 — Tooling local

Commit em `main` com todos os arquivos da seção 3 (exceto rulesets, que são apenas referência versionada).

```
chore: bootstrap guardrails (CI, rulesets, tooling)
```

### Passo 2 — Criar branch `develop`

```bash
git switch -c develop
git push -u origin develop
```

O push aciona o CI em `develop`, registrando os contextos de check (`ci / lint`, etc.) na API do GitHub.

### Passo 3 — Aplicar rulesets

```bash
gh api -X POST /repos/nathanfiorito/finew-app/rulesets \
  --input .github/rulesets/main.json

gh api -X POST /repos/nathanfiorito/finew-app/rulesets \
  --input .github/rulesets/develop.json
```

### Passo 4 — Validar (smoke test)

1. `git push origin main` direto → deve ser rejeitado.
2. Criar `feature/test-guardrail`, fazer push → CI roda → auto-PR `feature/test-guardrail → develop` é aberto.
3. Squash & merge → CI roda em `develop` → auto-PR `develop → main` é aberto.
4. Squash & merge → repo estável.

## 9. Critérios de aceite

1. Push direto em `main` é rejeitado.
2. Push direto em `develop` é rejeitado.
3. Force-push em `main` ou `develop` é rejeitado.
4. Delete de `main` ou `develop` é rejeitado.
5. Push em `feature/*` dispara CI; ao passar, um PR para `develop` é aberto automaticamente.
6. PR sem checks verdes não pode ser mergeado.
7. Apenas "Squash and merge" está disponível em PRs.
8. Merge em `develop` dispara CI; ao passar, um PR para `main` é aberto automaticamente.
9. Re-push em `feature/*` com PR já aberto não cria PR duplicado.

## 10. Fora de escopo

- CD/deploy, releases automatizadas, changelog, SemVer.
- Enforcement automatizado de Conventional Commits.
- Hooks locais (husky, lefthook).
- Code coverage gate, security scanning, Dependabot.
- Templates de PR/issue, CODEOWNERS.
- Ambientes (dev/staging/prod), secrets de aplicação.
- Lógica de negócio do `finew-app`.

## 11. Riscos conhecidos

- **Conventional Commits sem enforcement.** Mitigação: disciplina manual ao revisar/editar o título do PR antes do squash.
- **Solo dev sem review obrigatório.** Mitigação: o CI atua como gate (lint, typecheck, test, build).
- **`GITHUB_TOKEN` não dispara workflows aninhados.** Aceitável: os checks já estão no SHA do commit (ver 5.3).
- **Drift de configuração na UI.** Os arquivos JSON em `.github/rulesets/` são a fonte da verdade; em caso de drift, basta reaplicar via `gh api -X PUT /repos/nathanfiorito/finew-app/rulesets/<id> --input <file>`.
