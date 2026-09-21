# Research: Controle Financeiro Pessoal

**Date**: 2026-09-18

## 1. SPA Vite + API FastAPI (emenda 2026-09-18)

**Decision**: `Front-end/` (React + Vite) e `backend/` (Python + FastAPI).

**Rationale**: o frontend do grupo já está em Vite. O backend será Python para João trabalhar a API com FastAPI, independente da UI.

**Rejected**: Next.js monolito da spec v1 — não reflete o `Front-end/` existente nem FastAPI.

## 2. SQLAlchemy 2 + SQLite (sem migrations)

**Decision**: ORM SQLAlchemy 2; SQLite no `.env` local. Tabelas criadas com `Base.metadata.create_all` na subida da API. UUID como string; `Numeric(12, 2)` para dinheiro.

**Rationale**: o grupo não vai manter histórico de schema com Alembic. `create_all` basta para o trabalho acadêmico.

**Rejected**: Alembic (overhead de migrations neste projeto); Prisma Python.

## 3. JWT no FastAPI + bcrypt

**Decision**: `passlib`/`bcrypt` + JWT (`python-jose`). Telas de login continuam no Vite (Duda).

**Rationale**: auth vive na API. Frontend guarda token e manda `Authorization`. Sem OAuth nesta versão.

**Rejected**: Auth.js/NextAuth (depende de Next.js).

## 4. Momento da autenticação

**Decision**: schema já nasce com `usuario_id` opcional + seed `dev@local.test`. Rotas P1/P2 podem usar esse usuário até a US6.

**Rationale**: constituição exige MVP sem auth. João modela `usuarios` cedo para não refazer FK.

## 5. Gráficos

**Decision**: Recharts. Agregação no servidor (`/api/relatorios/*`). Taxiotti só consome JSON.

## 6. Estado no cliente

**Decision**: TanStack Query; React Hook Form + Zod no cliente; Pydantic nas Route handlers FastAPI, espelhando `openapi.yaml`.

## 7. Fora de escopo

Recorrência automática, PDF, PWA, push/e-mail, Open Finance, tema dark como aceite.

## 8. Papéis e fronteiras

| Área | Dono | Não faz |
|---|---|---|
| SQLAlchemy, rotas FastAPI, queries | João | CSS/layout de páginas |
| shadcn, forms, tabelas, filtros UI | Nakashima | SQL |
| Dashboard, Recharts, responsivo visual | Taxiotti | endpoints |
| JWT, telas login, CSV | Duda | CRUD de categoria/transação |
| Vite, CORS/`VITE_API_URL`, wiring, QA | Natalia | reimplementar o que o dono já fez |
