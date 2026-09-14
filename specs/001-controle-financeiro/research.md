# Research: Controle Financeiro Pessoal

**Date**: 2026-09-14

## 1. Next.js único vs React + Express

**Decision**: Next.js App Router full-stack neste repositório.

**Rationale**: o grupo já desenhou pastas `app/`, `api/` e o setup da Natalia cita Next.js + Tailwind + shadcn. Evita dois deploys e duplicação de tipos.

**Rejected**: React+Vite+Express — mais arquivos e contrato HTTP extra sem ganho para 5 pessoas.

## 2. Prisma + SQLite (dev)

**Decision**: Prisma ORM; `datasource` SQLite no `.env` local. Modelos com `String` UUID (`@id @default(uuid())`) e `Decimal` para valores.

**Rationale**: João precisa de migrations visíveis. SQLite zera atrito (sem Docker obrigatório). Decimal evita erro de float em dinheiro.

**Rejected**: Drizzle nesta v1 (o grupo mencionou Prisma nas tarefas do João com mais frequência). Troca depois exigiria reescrever tasks.

## 3. Auth.js (NextAuth) + credentials

**Decision**: Auth.js no App Router, provider Credentials, senha com bcrypt. Sessão JWT (strategy jwt) para simplicidade em SQLite.

**Rationale**: bate com a demanda da Duda (login/registro, middleware, isolamento). Sem OAuth nesta versão.

**Rejected**: auth só no client; NextAuth OAuth-only (Google) — foge do cadastro e-mail/senha da spec.

## 4. Momento da autenticação

**Decision**: schema já nasce com `usuarioId` opcional OU seed de um usuário de desenvolvimento. Rotas P1/P2 podem usar um `DEV_USER_ID` até a US6; depois o middleware torna `usuarioId` obrigatório.

**Rationale**: constituição exige MVP sem auth. João modela `usuarios` cedo (tarefa dele) para não refazer FK.

**Implementation note**: documentar no `quickstart.md` o usuário seed (`dev@local.test`).

## 5. Gráficos

**Decision**: Recharts. Agregação sempre no servidor (endpoints `/api/relatorios/*`). Componentes do Taxiotti só recebem JSON já somado.

**Rationale**: totais não podem depender da página atual da lista. Acessibilidade: cada gráfico acompanha tabela resumida.

## 6. Estado no cliente

**Decision**: TanStack Query para GET/mutações; React Hook Form + Zod no cliente, **mesmo schema Zod** (ou equivalente) reutilizado em `lib/validations.ts` nas Route Handlers.

## 7. Fora de escopo (não pesquisar implementação agora)

Recorrência automática, PDF, PWA, push/e-mail, Open Finance, tema dark como aceite.

## 8. Papéis e fronteiras

| Área | Dono | Não faz |
|---|---|---|
| Prisma, rotas API, queries | João | CSS/layout de páginas |
| shadcn, forms, tabelas, filtros UI | Nakashima | SQL/Prisma |
| Dashboard, Recharts, responsivo visual | Taxiotti | endpoints |
| NextAuth, middleware, CSV | Duda | CRUD de categoria/transação |
| create-next-app, wiring, QA | Natalia | reimplementar o que o dono já fez |
