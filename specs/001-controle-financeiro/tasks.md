---
description: "Task list for Controle Financeiro Pessoal — donos do grupo em cada item"
---

# Tasks: Controle Financeiro Pessoal

**Input**: `specs/001-controle-financeiro/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: não obrigatórios nesta v1 (aceite manual no quickstart).

**Organization**: por user story. Marque `[x]` só quando o dono terminar. Donos: **Natalia**, **João**, **Nakashima**, **Taxiotti**, **Duda**.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode em paralelo (arquivo diferente)
- **[Story]**: US1…US7
- Caminhos reais: `backend/` (FastAPI) e `Front-end/` (Vite)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: repositório pronto para todo mundo clonar e rodar

- [x] T001 [Natalia] Garantir pasta `Front-end/` (Vite+React) e `backend/` (FastAPI) sem apagar `.specify/`, `.cursor/` nem `specs/`
- [ ] T002 [Natalia] Configurar Tailwind, shadcn/ui em `Front-end/`, `VITE_API_URL=http://localhost:8000/api`
- [ ] T003 [P] [Natalia] Adicionar no Front-end TanStack Query, React Hook Form, Zod, Recharts, lucide-react
- [ ] T004 [P] [Natalia] Ajustar README com o fluxo do `quickstart.md` (API 8000 + UI 5173)

**Checkpoint**: `uvicorn` em :8000 e `npm run dev` em :5173

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: banco, validações e layout — bloqueia as histórias

**⚠️ CRITICAL**: histórias de produto só depois desta fase

- [x] T005 [João] Completar models SQLAlchemy em `backend/app/models/` e índices de `data-model.md` (tabelas via `create_all` na subida da API; sem migrations)
- [x] T006 [João] Implementar `backend/app/seed.py` (usuário `dev@local.test` + categorias padrão)
- [x] T007 [P] [João] Completar schemas Pydantic em `backend/app/schemas/` alinhados a `contracts/openapi.yaml`
- [ ] T008 [P] [Nakashima] Instalar componentes shadcn (Button, Input, Label, Dialog, Table, Select, Card, Alert) em `Front-end/src/components/ui/`
- [ ] T009 [Nakashima] Layout/nav do dashboard no Front-end (Início, Transações, Categorias, Relatórios)
- [ ] T010 [P] [Natalia] `Front-end/src/lib/utils.ts` (`formatMoney`, `formatDate`) e `api-client.ts` (`VITE_API_URL`)

**Checkpoint**: SQLite criado na subida da API; layout navega entre rotas vazias; `/health` responde ok

---

## Phase 3: User Story 1 - Organizar categorias (Priority: P1) 🎯 MVP

**Goal**: listar padrão + CRUD customizado com cor/ícone

**Independent Test**: criar/editar categoria e recarregar a página

- [x] T011 [US1] [João] `GET`/`POST` em `backend/app/api/v1/endpoints/categorias.py`
- [x] T012 [US1] [João] `PATCH`/`DELETE` em `categorias.py` (409 se padrão ou em uso)
- [ ] T013 [P] [US1] [Nakashima] `Front-end/src/components/categoria-form.tsx` (modal, cor, ícone, validação)
- [ ] T014 [US1] [Nakashima] Página de categorias no Front-end (tabela + ações)
- [ ] T015 [US1] [Natalia] Ligar a página às APIs, toasts de erro/sucesso, conferir seed padrão

**Checkpoint**: US1 testável sem transações

---

## Phase 4: User Story 2 - Registrar receitas e despesas (Priority: P1) 🎯 MVP

**Goal**: CRUD paginado de transações

**Independent Test**: criar receita e despesa, editar, excluir com confirmação

- [x] T016 [US2] [João] `GET` (paginação) / `POST` em `backend/app/api/v1/endpoints/transacoes.py`
- [x] T017 [US2] [João] `PATCH`/`DELETE` em `transacoes.py` + checagem tipo × categoria
- [ ] T018 [P] [US2] [Nakashima] `Front-end/src/components/transacao-form.tsx` (React Hook Form + Zod)
- [ ] T019 [US2] [Nakashima] Página de transações (tabela paginada + confirmação de exclusão)
- [ ] T020 [US2] [Natalia] Integrar form/lista com API; estados loading/erro; conferir pt-BR

**Checkpoint**: histórico funciona mesmo com resumo ainda mockado

---

## Phase 5: User Story 3 - Ver resumo do mês (Priority: P1) 🎯 MVP

**Goal**: cards receitas, despesas, saldo do mês corrente

**Independent Test**: lançar no mês atual e ver totais em R$

- [ ] T021 [US3] [João] `GET /api/relatorios/resumo` em `backend/app/api/v1/endpoints/relatorios.py` (agrega por `data`)
- [ ] T022 [P] [US3] [Taxiotti] `Front-end/src/components/resumo-cards.tsx` + home (estado vazio = R$ 0,00; saldo negativo destacado)
- [ ] T023 [US3] [Natalia] Integrar cards com `/api/relatorios/resumo`; conferir SC-004 vs soma manual

**Checkpoint**: MVP demonstrável (US1+US2+US3)

---

## Phase 6: User Story 4 - Filtrar o histórico (Priority: P2)

**Goal**: filtros período, categoria, tipo, valor no servidor e na lista

**Independent Test**: combinar filtros e limpar

- [ ] T024 [US4] [João] Query params `from`, `to`, `tipo`, `categoriaId`, `minValor`, `maxValor` em `GET /api/transacoes`
- [ ] T025 [P] [US4] [Nakashima] `Front-end/src/components/transacao-filtros.tsx` na listagem + botão limpar
- [ ] T026 [US4] [Natalia] Ligar querystring da UI à API; paginação preserva filtros

**Checkpoint**: lista filtrada consistente após F5

---

## Phase 7: User Story 5 - Entender o mês com gráficos (Priority: P2)

**Goal**: pizza, linha, comparativo + responsivo

**Independent Test**: dois meses / duas categorias; totais = API

- [ ] T027 [US5] [João] `GET /api/relatorios/pizza` em `relatorios.py`
- [ ] T028 [P] [US5] [João] `GET /api/relatorios/evolucao` e `/comparativo` em `relatorios.py`
- [ ] T029 [P] [US5] [Taxiotti] `Front-end/src/components/grafico-pizza.tsx` + tabela/ARIA equivalente
- [ ] T030 [P] [US5] [Taxiotti] `Front-end/src/components/grafico-linha.tsx`
- [ ] T031 [US5] [Taxiotti] `Front-end/src/components/comparativo-mes.tsx` + página Relatórios
- [ ] T032 [US5] [Taxiotti] Ajustes de responsividade (375px e 1280px) em dashboard, gráficos e tabelas
- [ ] T033 [US5] [Natalia] Integrar Relatórios às 3 APIs; empty state; conferir totais

**Checkpoint**: US5 independente, MVP intacto

---

## Phase 8: User Story 6 - Entrar com conta própria (Priority: P3)

**Goal**: registro, login, logout, middleware, isolamento

**Independent Test**: dois usuários sem vazamento de dados

- [ ] T034 [US6] [João] Garantir `Usuario` + `usuario_id` em Categoria/Transacao e seed por usuário
- [ ] T035 [US6] [Duda] JWT + bcrypt em `backend/app/core/security.py` e `backend/app/api/v1/endpoints/auth.py`
- [ ] T036 [P] [US6] [Duda] Páginas de login e cadastro no `Front-end`
- [ ] T037 [US6] [Duda] Middleware de rotas, sessão persistente, logout
- [ ] T038 [US6] [Duda] Isolamento: toda query/API usa `usuarioId` da sessão (401/403 sem sessão)
- [ ] T039 [US6] [Natalia] Integrar auth ao dashboard, redirects e erros; QA com duas contas

**Checkpoint**: visitante não entra no dashboard; A não vê dados de B

---

## Phase 9: User Story 7 - Exportar listagem em CSV (Priority: P4)

**Goal**: download CSV com os mesmos filtros da lista

**Independent Test**: filtrar, baixar, abrir no Excel

- [ ] T040 [US7] [João] (se combinado) dados para export no servidor — ou Duda usa a mesma query
- [ ] T041 [US7] [Duda] Completar `GET /api/transacoes/export` em `transacoes.py` (`text/csv`) + botão na listagem
- [ ] T042 [US7] [Natalia] QA: filtros da tela = linhas do arquivo; cabeçalho ok

**Checkpoint**: extra do roadmap (CSV) entregue; PDF continua fora

---

## Phase 10: Polish & Cross-Cutting Concerns

- [ ] T043 [Natalia] Percorrer fluxos do `quickstart.md`, erros, confirmações de exclusão, labels
- [ ] T044 [P] [Nakashima] Refino visual de nav, forms e espaçamento (sem mudar contrato)
- [ ] T045 [Natalia] Atualizar status em `team.md` / `tasks.md` e README se o setup mudou

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: começa agora — Natalia
- **Foundational (Phase 2)**: depois do Setup — João + Nakashima
- **US1 → US2 → US3**: MVP; US1 desbloqueia US2
- **US4 e US5**: depois do MVP; podem em paralelo (filtros vs gráficos)
- **US6**: depois do schema de usuário (T034) e do MVP estável
- **US7**: depois dos filtros (US4) e de sessão (US6)
- **Polish**: depois das histórias combinadas para a entrega

### User Story Dependencies

- **US1**: só Phase 2
- **US2**: categorias (US1) para o select
- **US3**: transações (US2) para ter o que somar
- **US4**: listagem US2
- **US5**: agregações; UI pode usar mock JSON do contrato até João terminar
- **US6**: modelo João + telas Duda
- **US7**: US4 + US6

### Parallel Opportunities

- Nakashima UI base (T008/T009) || João schema (T005/T006)
- Taxiotti cards (T022) || João resumo (T021) — integrar em T023
- Taxiotti gráficos (T029–T032) || João relatórios (T027/T028)
- Duda telas login (T036) || João FK usuário (T034)

---

## Parallel Example: MVP

```text
Depois do Setup:
  João: T005 T006 T007 T011 T012
  Nakashima: T008 T009 T013 T014
  Natalia: T010 depois T015

Depois de categorias:
  João: T016 T017
  Nakashima: T018 T019
  Natalia: T020
  Taxiotti: T022 (pode mockar o JSON do resumo)
```

---

## Implementation Strategy

### MVP First (US1–US3)

1. Phase 1 Natalia (Vite + URL da API; backend já esboçado)
2. Phase 2 João + Nakashima
3. US1 → US2 → US3
4. **STOP**: demo do resumo mensal

### Incremental Delivery

1. Filtros (US4)
2. Relatórios (US5)
3. Contas isoladas (US6)
4. CSV (US7)

### Parallel Team Strategy

| Pessoa | Foco após foundation |
|---|---|
| João | APIs na ordem US1→US5, depois usuarios |
| Nakashima | componentes e telas US1, US2, US4 |
| Taxiotti | US3 e US5 (JSON do contrato) |
| Duda | US6 e US7 quando T034 existir |
| Natalia | cada história assim que API+UI existirem |

---

## Notes

- Não implementar recorrência, PDF, PWA, Open Finance.
- Valores na API como string decimal (`"150.90"`) para não perder centavos.
- Commit por task ou por grupo lógico do mesmo dono.
- Atualizar `team.md` quando o status mudar.
