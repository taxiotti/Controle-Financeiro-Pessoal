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
- Caminhos reais do Front-end Vite e do futuro Back-end FastAPI

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: repositório pronto para todo mundo clonar e rodar

- [x] T001 [Natalia] Consolidar o app React + TypeScript + Vite em `Front-end/` sem apagar `.specify/`, `.cursor/` nem `specs/`
- [x] T002 [Natalia] Configurar CSS próprio responsivo, ESLint e metadados pt-BR do Front-end
- [x] T003 [P] [Natalia] Adicionar React Router, TanStack Query, React Hook Form, Zod, Recharts, lucide-react e Vitest em `Front-end/package.json`
- [x] T004 [P] [Natalia] Ajustar README com o fluxo do `quickstart.md` e apontar `specs/001-controle-financeiro/`

**Checkpoint**: `cd Front-end && npm install && npm run dev` sobe a SPA

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: contrato, adapter local, validações e layout; banco FastAPI fica para etapa futura

**CRITICAL**: histórias de produto só depois da fundação do Front-end

- [ ] T005 [João] Criar modelos SQLAlchemy/SQLModel (Usuario, Categoria, Transacao), índices de `data-model.md` e primeira migration no futuro `Back-end/`
- [ ] T006 [João] Implementar seed FastAPI (usuário `dev@local.test` + categorias padrão) e sessão de banco
- [ ] T007 [P] [João] Criar schemas Pydantic de categoria e transação alinhados a `contracts/openapi.yaml`
- [x] T008 [P] [Nakashima] Criar componentes visuais base (botões, inputs, modais, tabelas, cards e alertas) com CSS próprio
- [x] T009 [Nakashima] Criar layout em `Front-end/src/components/DashboardLayout.tsx` (nav: Início, Transações, Categorias, Relatórios)
- [x] T010 [P] [Natalia] Criar formatação pt-BR, tipos do contrato, interface de cliente e adapter `localStorage`

**Checkpoint**: layout navega entre rotas e o adapter local cria as categorias padrão; backend continua pendente

---

## Phase 3: User Story 1 - Organizar categorias (Priority: P1) 🎯 MVP

**Goal**: listar padrão + CRUD customizado com cor/ícone

**Independent Test**: criar/editar categoria e recarregar a página

- [ ] T011 [US1] [João] FastAPI `GET`/`POST /categorias`
- [ ] T012 [US1] [João] FastAPI `PATCH`/`DELETE /categorias/{id}` (409 se padrão ou em uso)
- [x] T013 [P] [US1] [Nakashima] Formulário de categoria em `Front-end/src/pages/CategoriasPage.tsx` (modal, cor, ícone, validação)
- [x] T014 [US1] [Nakashima] Página `/categorias` com grid e ações
- [x] T015 [US1] [Natalia] Ligar a página ao adapter local, feedback de erro/sucesso e seed padrão

**Checkpoint**: US1 testável sem transações

---

## Phase 4: User Story 2 - Registrar receitas e despesas (Priority: P1) 🎯 MVP

**Goal**: CRUD paginado de transações

**Independent Test**: criar receita e despesa, editar, excluir com confirmação

- [ ] T016 [US2] [João] FastAPI `GET` paginado / `POST /transacoes`
- [ ] T017 [US2] [João] FastAPI `PATCH`/`DELETE /transacoes/{id}` + checagem tipo × categoria
- [x] T018 [P] [US2] [Nakashima] Formulário de transação com React Hook Form + Zod
- [x] T019 [US2] [Nakashima] Página `/transacoes` com tabela paginada e confirmação de exclusão
- [x] T020 [US2] [Natalia] Integrar form/lista ao adapter local; estados loading/erro; conferir pt-BR

**Checkpoint**: histórico funciona mesmo com resumo ainda mockado

---

## Phase 5: User Story 3 - Ver resumo do mês (Priority: P1) 🎯 MVP

**Goal**: cards receitas, despesas, saldo do mês corrente

**Independent Test**: lançar no mês atual e ver totais em R$

- [ ] T021 [US3] [João] FastAPI `GET /relatorios/resumo` (agrega por `data`)
- [x] T022 [P] [US3] [Taxiotti] Cards e dashboard em `Front-end/src/pages/DashboardPage.tsx` (estado vazio = R$ 0,00; saldo negativo destacado)
- [x] T023 [US3] [Natalia] Integrar cards ao adapter local; conferir SC-004 vs soma manual

**Checkpoint**: MVP demonstrável (US1+US2+US3)

---

## Phase 6: User Story 4 - Filtrar o histórico (Priority: P2)

**Goal**: filtros período, categoria, tipo, valor no servidor e na lista

**Independent Test**: combinar filtros e limpar

- [ ] T024 [US4] [João] Query params `from`, `to`, `tipo`, `categoriaId`, `minValor`, `maxValor` em `GET /transacoes` no FastAPI
- [x] T025 [P] [US4] [Nakashima] Filtros na listagem + botão limpar
- [x] T026 [US4] [Natalia] Ligar querystring da UI ao adapter local; paginação preserva filtros

**Checkpoint**: lista filtrada consistente após F5

---

## Phase 7: User Story 5 - Entender o mês com gráficos (Priority: P2)

**Goal**: pizza, linha, comparativo + responsivo

**Independent Test**: dois meses / duas categorias; totais = API

- [ ] T027 [US5] [João] FastAPI `GET /relatorios/pizza`
- [ ] T028 [P] [US5] [João] FastAPI `GET /relatorios/evolucao` e `/relatorios/comparativo`
- [x] T029 [P] [US5] [Taxiotti] Gráfico de pizza + tabela equivalente
- [x] T030 [P] [US5] [Taxiotti] Gráfico de linha + tabela equivalente
- [x] T031 [US5] [Taxiotti] Comparativo e página `/relatorios`
- [x] T032 [US5] [Taxiotti] Ajustes de responsividade (375px e 1280px) em dashboard, gráficos e tabelas
- [x] T033 [US5] [Natalia] Integrar Relatórios ao adapter local; empty state; conferir totais

**Checkpoint**: US5 independente, MVP intacto

---

## Phase 8: User Story 6 - Entrar com conta própria (Priority: P3)

**Goal**: registro, login, logout, middleware, isolamento

**Independent Test**: dois usuários sem vazamento de dados

- [ ] T034 [US6] [João] Garantir `Usuario` + `usuarioId` em Categoria/Transacao, migration e seed por usuário
- [x] T035 [US6] [Duda] Implementar autenticação FastAPI com credenciais, JWT e hash seguro
- [x] T036 [P] [US6] [Duda] Páginas `/login` e `/register` no Front-end
- [x] T037 [US6] [Duda] Proteção de rotas, sessão persistente e logout
- [x] T038 [US6] [Duda] Isolamento: toda query/API usa `usuarioId` da sessão (401/403 sem sessão)
- [ ] T039 [US6] [Natalia] Integrar auth ao dashboard, redirects e erros; QA com duas contas

**Checkpoint**: visitante não entra no dashboard; A não vê dados de B

---

## Phase 9: User Story 7 - Exportar listagem em CSV (Priority: P4)

**Goal**: download CSV com os mesmos filtros da lista

**Independent Test**: filtrar, baixar, abrir no Excel

- [ ] T040 [US7] [João] (se combinado) dados para export no servidor — ou Duda usa a mesma query
- [ ] T041 [US7] [Duda] FastAPI `GET /transacoes/export` (`text/csv`) + botão na listagem
- [ ] T042 [US7] [Natalia] QA: filtros da tela = linhas do arquivo; cabeçalho ok

**Checkpoint**: extra do roadmap (CSV) entregue; PDF continua fora

---

## Phase 10: Polish & Cross-Cutting Concerns

- [x] T043 [Natalia] Percorrer fluxos do `quickstart.md`, erros, confirmações de exclusão, labels
- [x] T044 [P] [Nakashima] Refino visual de nav, forms e espaçamento (sem mudar contrato)
- [x] T045 [Natalia] Atualizar status em `team.md` / `tasks.md` e README após mudança para Vite + FastAPI futuro

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
