# Implementation Plan: Controle Financeiro Pessoal

**Branch**: `001-controle-financeiro` | **Date**: 2026-09-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-controle-financeiro/spec.md`

## Summary

App web para registrar receitas/despesas por categoria e ver resumo e relatórios mensais. **Dois serviços** no mesmo repositório: UI em **React + Vite** (`Front-end/`) e API em **Python + FastAPI** (`backend/`). Persistência **SQLAlchemy 2 + SQLite** (sem migrations: `create_all` na subida). Gráficos **Recharts**, forms **React Hook Form + Zod**, validação no servidor **Pydantic**. Auth **JWT** no FastAPI (fase P3). O contrato REST em `contracts/openapi.yaml` é a fronteira entre João (API), Nakashima/Taxiotti (UI) e Natalia (integração). CORS libera `http://localhost:5173`.

## Technical Context

**Language/Version**: TypeScript 5.x (UI), Python 3.12 (API), Node.js 20 LTS, React 18+

**Primary Dependencies**: Vite, Tailwind, shadcn/ui, FastAPI, SQLAlchemy 2, Pydantic, passlib/bcrypt, python-jose, React Hook Form, Zod, TanStack Query, Recharts

**Storage**: SQLite via SQLAlchemy em desenvolvimento (`Base.metadata.create_all`); sem Alembic. PostgreSQL fica fora desta versão.

**Testing**: testes manuais de aceite por história; pytest opcional em `backend/tests/`

**Target Platform**: Navegador moderno; viewport mobile ~375px e desktop ~1280px; API local na porta 8000

**Project Type**: Web application (SPA + API REST)

**Performance Goals**: listagem paginada e resumo mensal < 2s com ~200 transações em local

**Constraints**: BRL only; validação no servidor; sem secrets no git; pt-BR na UI; HTTPS só em produção futura

**Scale/Scope**: 5 integrantes, 2 pastas de código, ~4 rotas autenticadas, 3 entidades, 7 user stories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Como o plano atende |
|---|---|---|
| I. Produto antes de tecnologia | PASS | Stories P1–P4 mapeadas em `tasks.md` |
| II. Entrega incremental | PASS | Auth e CSV depois do MVP; recorrência/PDF/PWA fora |
| III. Contrato de API compartilhado | PASS | `contracts/openapi.yaml` servido em `/api` |
| IV. Isolamento e validação no servidor | PASS | `usuario_id` após US6; Pydantic nas rotas |
| V. UX brasileira e acessível | PASS | `Intl` pt-BR; confirmação delete; labels; texto nos gráficos |

## Project Structure

### Documentation (this feature)

```text
specs/001-controle-financeiro/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── team.md
├── contracts/
│   └── openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
Front-end/                         # Vite + React (Nakashima, Taxiotti, Duda UI, Natalia)
├── src/
│   ├── pages/                     # ou rotas equivalentes
│   ├── components/
│   │   ├── ui/
│   │   ├── transacao-form.tsx
│   │   ├── categoria-form.tsx
│   │   ├── transacao-filtros.tsx
│   │   ├── resumo-cards.tsx
│   │   ├── grafico-pizza.tsx
│   │   ├── grafico-linha.tsx
│   │   └── comparativo-mes.tsx
│   └── lib/
│       ├── api-client.ts          # baseURL = VITE_API_URL
│       └── utils.ts

backend/                           # FastAPI (João, Duda auth/CSV)
├── app/
│   ├── main.py
│   ├── seed.py
│   ├── core/                      # config, database, security
│   ├── models/                    # Usuario, Categoria, Transacao
│   ├── schemas/                   # Pydantic = contrato
│   └── api/v1/endpoints/          # categorias, transacoes, relatorios, auth
└── tests/
```

**Structure Decision**: dois projetos (`Front-end/` já existia em Vite; API em Python/FastAPI a pedido do grupo). Não usar Route Handlers do Next.js.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Dois serviços (SPA + API) | Front-end já é Vite; backend será Python | Next.js monolito contradiz a pasta `Front-end/` e a escolha FastAPI |
