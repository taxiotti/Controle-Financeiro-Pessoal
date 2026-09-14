# Implementation Plan: Controle Financeiro Pessoal

**Branch**: `001-controle-financeiro` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-controle-financeiro/spec.md`

## Summary

App web full-stack para uma pessoa registrar receitas/despesas por categoria e ver resumo e relatórios mensais. Implementação em **Next.js (App Router) + TypeScript**, UI **Tailwind + shadcn/ui**, persistência **Prisma + SQLite** (dev), gráficos **Recharts**, validação **Zod**, auth **Auth.js (NextAuth) + bcrypt** na fase P3. Frontend e API convivem no mesmo repositório; o contrato REST em `contracts/` é a fronteira entre João (API), Nakashima/Taxiotti (UI) e Natalia (integração).

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20 LTS, React 18+

**Primary Dependencies**: Next.js 14+ App Router, Tailwind CSS, shadcn/ui, Prisma, Auth.js (NextAuth), bcrypt, Zod, React Hook Form, TanStack Query, Recharts

**Storage**: SQLite via Prisma em desenvolvimento; schema compatível com PostgreSQL depois (`provider` trocável)

**Testing**: Playwright ou testes manuais de aceite por história (grupo acadêmico; testes automatizados não são obrigatórios nesta v1)

**Target Platform**: Navegador moderno (Chrome/Edge/Firefox/Safari); viewport mobile ~375px e desktop ~1280px

**Project Type**: Web application full-stack (único pacote Next.js)

**Performance Goals**: listagem paginada e resumo mensal < 2s com ~200 transações em local

**Constraints**: BRL only; validação no servidor; sem secrets no git; pt-BR na UI; HTTPS só exigido em produção futura

**Scale/Scope**: 5 integrantes, 1 app, ~4 rotas autenticadas, 3 entidades, 7 user stories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Como o plano atende |
|---|---|---|
| I. Produto antes de tecnologia | PASS | Stories P1–P4 mapeadas em `tasks.md` |
| II. Entrega incremental | PASS | Auth e CSV depois do MVP; recorrência/PDF/PWA fora |
| III. Contrato de API compartilhado | PASS | `contracts/openapi.yaml` |
| IV. Isolamento e validação no servidor | PASS | `usuarioId` após US6; Zod nas rotas |
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

### Source Code (repository root)

```text
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx                 # resumo (Taxiotti)
│   ├── transacoes/page.tsx      # Nakashima
│   ├── categorias/page.tsx      # Nakashima
│   └── relatorios/page.tsx      # Taxiotti
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── transacoes/route.ts
│   ├── transacoes/[id]/route.ts
│   ├── categorias/route.ts
│   ├── categorias/[id]/route.ts
│   ├── relatorios/resumo/route.ts
│   ├── relatorios/pizza/route.ts
│   ├── relatorios/evolucao/route.ts
│   ├── relatorios/comparativo/route.ts
│   └── transacoes/export/route.ts
components/
├── ui/                          # shadcn + base (Nakashima)
├── transacao-form.tsx
├── categoria-form.tsx
├── transacao-filtros.tsx
├── resumo-cards.tsx
├── grafico-pizza.tsx
├── grafico-linha.tsx
└── comparativo-mes.tsx
lib/
├── db.ts
├── auth.ts
├── validations.ts
├── utils.ts                     # formatMoney, formatDate
└── api-client.ts
prisma/
├── schema.prisma
└── seed.ts                      # categorias padrão
```

**Structure Decision**: um único projeto Next.js na raiz (opção web full-stack), alinhado à pasta proposta pelo grupo e à demanda de setup da Natalia. Sem `frontend/` e `backend/` separados.

## Complexity Tracking

> Nenhuma violação da constituição a justificar.
