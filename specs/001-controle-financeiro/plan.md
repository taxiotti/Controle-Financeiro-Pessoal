# Implementation Plan: Controle Financeiro Pessoal

**Branch**: `001-controle-financeiro` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-controle-financeiro/spec.md`

## Summary

App web para uma pessoa registrar receitas/despesas por categoria e ver resumo e relatórios mensais. O frontend é uma SPA em **React + TypeScript + Vite**, com **React Hook Form + Zod**, **TanStack Query**, **Recharts** e CSS próprio. A API futura será implementada separadamente em **FastAPI + Pydantic**, sem backend nesta entrega. Até lá, US1–US5 usam um adapter `localStorage` versionado e compatível com o contrato REST em `contracts/`.

## Technical Context

**Language/Version**: TypeScript 6.x, Node.js 20+, React 19; Python 3.12+ no backend futuro

**Primary Dependencies**: Vite, React Router, Zod, React Hook Form, TanStack Query, Recharts; FastAPI, Pydantic e SQLAlchemy/SQLModel no backend futuro

**Storage**: `localStorage` versionado durante a fase frontend-only; SQLite no backend futuro, com modelos compatíveis com PostgreSQL

**Testing**: Vitest para regras de domínio; build, lint e testes manuais de aceite por história

**Target Platform**: Navegador moderno (Chrome/Edge/Firefox/Safari); viewport mobile ~375px e desktop ~1280px

**Project Type**: SPA Vite em `Front-end/` + serviço FastAPI futuro em `Back-end/`

**Performance Goals**: listagem paginada e resumo mensal < 2s com ~200 transações em local

**Constraints**: BRL only; validação Pydantic obrigatória quando a API existir; sem secrets no git; pt-BR na UI; HTTPS só exigido em produção futura

**Scale/Scope**: 5 integrantes, 1 app, ~4 rotas autenticadas, 3 entidades, 7 user stories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Como o plano atende |
|---|---|---|
| I. Produto antes de tecnologia | PASS | Stories P1–P4 mapeadas em `tasks.md` |
| II. Entrega incremental | PASS | Auth e CSV depois do MVP; recorrência/PDF/PWA fora |
| III. Contrato de API compartilhado | PASS | `contracts/openapi.yaml` |
| IV. Isolamento e validação no servidor | PASS | `usuarioId` após US6; Pydantic nas rotas FastAPI |
| V. UX brasileira e acessível | PASS | `Intl` pt-BR; confirmação delete; labels; texto nos gráficos |

Violations: nenhuma. Complexity Tracking vazio.

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

### Source Code

```text
Front-end/
├── src/
│   ├── api/                     # tipos do contrato + adapters
│   ├── components/              # layout compartilhado
│   ├── lib/                     # dinheiro e datas pt-BR
│   ├── pages/                   # dashboard, transações, categorias, relatórios
│   └── AppRouter.tsx
└── package.json

Back-end/                        # futuro, não criado nesta entrega
├── app/
│   ├── api/                     # routers FastAPI
│   ├── models/                  # SQLAlchemy/SQLModel
│   ├── schemas/                 # modelos Pydantic
│   └── services/                # regras e agregações
└── pyproject.toml
```

**Structure Decision**: frontend e backend separados. O frontend trabalha agora com `localStorage`; o futuro adapter HTTP consumirá a API FastAPI sem alterar páginas ou DTOs.

## Complexity Tracking

> Nenhuma violação da constituição a justificar.
