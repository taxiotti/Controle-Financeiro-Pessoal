# Feature Specification: Controle Financeiro Pessoal

**Feature Branch**: `001-controle-financeiro`

**Created**: 2026-09-14

**Status**: Draft

**Input**: Aplicação web para gerenciamento financeiro pessoal, permitindo o controle de receitas e despesas com categorização e geração de relatórios mensais.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Organizar categorias (Priority: P1)

Como pessoa que controla o próprio dinheiro, quero ver categorias padrão e criar as minhas (com nome, cor e ícone), para classificar cada gasto e cada receita sem começar do zero.

**Why this priority**: sem categoria não há agrupamento, resumo útil nem gráfico. É a base do MVP.

**Independent Test**: abrir a tela de categorias, criar uma customizada, editar nome/cor/ícone, excluir uma que não está em uso e conferir que as padrão continuam listadas.

**Acceptance Scenarios**:

1. **Given** o sistema recém-inicializado, **When** o usuário abre Categorias, **Then** vê as padrão: alimentação, transporte, moradia, saúde, educação, lazer, salário, investimentos, outros.
2. **Given** a lista de categorias, **When** o usuário cria uma categoria com nome, tipo (receita, despesa ou ambos), cor e ícone, **Then** ela aparece na lista com a cor e o ícone escolhidos.
3. **Given** uma categoria customizada existente, **When** o usuário edita nome, cor ou ícone, **Then** as alterações persistem após recarregar a página.
4. **Given** uma categoria customizada sem transações, **When** o usuário confirma a exclusão, **Then** ela desaparece da lista.
5. **Given** uma categoria padrão ou uma categoria com transações vinculadas, **When** o usuário tenta excluir, **Then** o sistema impede a exclusão e explica o motivo.

**Owner**: Nakashima (UI) + João (API/banco)

---

### User Story 2 - Registrar receitas e despesas (Priority: P1)

Como usuário, quero cadastrar, editar e excluir transações (data, valor, descrição, tipo e categoria) para manter um histórico fiel do meu dinheiro.

**Why this priority**: é o núcleo do produto. Sem CRUD de transação o restante não tem dados.

**Independent Test**: criar uma receita e uma despesa, editar a descrição de uma, excluir a outra (com confirmação) e ver a lista atualizada.

**Acceptance Scenarios**:

1. **Given** pelo menos uma categoria compatível, **When** o usuário cadastra uma transação com data, valor > 0, descrição, tipo receita ou despesa e categoria, **Then** ela aparece na listagem.
2. **Given** uma transação existente, **When** o usuário altera valor, data, descrição ou categoria, **Then** a listagem e os totais passam a usar os novos dados.
3. **Given** uma transação existente, **When** o usuário pede exclusão e confirma, **Then** ela some; se cancelar, ela permanece.
4. **Given** um formulário incompleto ou valor ≤ 0, **When** o usuário tenta salvar, **Then** a transação NÃO é gravada e os erros aparecem no campo correspondente.
5. **Given** muitas transações, **When** o usuário percorre a lista, **Then** a listagem é paginada (não carrega milhares de linhas de uma vez).

**Owner**: Nakashima (UI) + João (API/banco)

---

### User Story 3 - Ver resumo do mês (Priority: P1)

Como usuário, quero ver no início do app o total de receitas, o total de despesas e o saldo do mês corrente, para saber em segundos se o mês está positivo.

**Why this priority**: fecha o MVP demonstrável (cadastrar + entender o mês).

**Independent Test**: cadastrar transações no mês atual e conferir os três cards (receitas, despesas, saldo = receitas − despesas).

**Acceptance Scenarios**:

1. **Given** transações no mês corrente, **When** o usuário abre a página inicial, **Then** vê receitas, despesas e saldo formatados em R$.
2. **Given** nenhuma transação no mês, **When** o usuário abre a página inicial, **Then** os totais são R$ 0,00 e a tela não quebra.
3. **Given** saldo negativo, **When** o resumo é exibido, **Then** o saldo é visivelmente distinto (cor/ênfase) das receitas.

**Owner**: Taxiotti (cards) + João (agregação)

---

### User Story 4 - Filtrar o histórico (Priority: P2)

Como usuário, quero filtrar transações por período, categoria, tipo e faixa de valor para achar um lançamento sem varrer a lista inteira.

**Why this priority**: necessário quando o volume cresce; não bloqueia o MVP.

**Independent Test**: criar transações com tipos, categorias, datas e valores diferentes e aplicar cada filtro isoladamente e combinado.

**Acceptance Scenarios**:

1. **Given** transações em meses distintos, **When** o usuário filtra um intervalo de datas, **Then** só entram lançamentos dentro do intervalo (inclusive).
2. **Given** transações de tipos e categorias mistos, **When** o usuário filtra tipo e/ou categoria, **Then** a lista obedece aos dois critérios.
3. **Given** valores variados, **When** o usuário informa valor mínimo e/ou máximo, **Then** só entram lançamentos nessa faixa.
4. **Given** filtros ativos, **When** o usuário limpa os filtros, **Then** a listagem volta ao padrão (mês corrente ou todas, conforme combinado na UI).

**Owner**: Nakashima (controles) + João (query)

---

### User Story 5 - Entender o mês com gráficos (Priority: P2)

Como usuário, quero um gráfico de pizza por categoria, um gráfico de linha da evolução mensal (receitas vs despesas) e um comparativo com o mês anterior, para enxergar padrões.

**Why this priority**: valor analítico depois que o cadastro já funciona.

**Independent Test**: com dados em pelo menos dois meses e duas categorias, abrir Relatórios e conferir pizza, linha e comparativo alinhados aos totais.

**Acceptance Scenarios**:

1. **Given** despesas em várias categorias no mês selecionado, **When** o usuário abre Relatórios, **Then** a pizza mostra a distribuição e a soma das fatias bate com o total de despesas (ou o tipo escolhido).
2. **Given** lançamentos em meses consecutivos, **When** o gráfico de linha é exibido, **Then** cada mês tem um ponto de receitas e um de despesas.
3. **Given** mês atual e mês anterior com dados, **When** o comparativo é exibido, **Then** mostra totais dos dois meses e a variação (valor e/ou percentual).
4. **Given** mês sem dados, **When** o usuário abre Relatórios, **Then** vê estado vazio compreensível, não gráfico quebrado.
5. **Given** um gráfico, **When** o usuário navega por teclado/leitor de tela, **Then** existe texto equivalente (tabela ou ARIA) com os mesmos números.

**Owner**: Taxiotti (visual) + João (APIs de relatório)

---

### User Story 6 - Entrar com conta própria (Priority: P3)

Como usuário, quero me cadastrar, entrar e sair, e só ver os meus dados, para usar o app sem misturar finanças com outra pessoa.

**Why this priority**: fase 3 do roadmap; o MVP pode rodar com um usuário único implícito até esta história existir.

**Independent Test**: criar duas contas, lançar transações em cada uma e confirmar que A nunca lista dados de B; rotas internas redirecionam quem não está logado.

**Acceptance Scenarios**:

1. **Given** e-mail ainda não cadastrado, **When** o usuário registra nome, e-mail válido e senha, **Then** a conta é criada e a sessão inicia.
2. **Given** credenciais corretas, **When** o usuário faz login, **Then** acessa o dashboard; senha errada ou e-mail inexistente NÃO revela qual campo falhou de forma excessiva e NÃO autentica.
3. **Given** sessão ativa, **When** o usuário faz logout, **Then** deixa de acessar rotas internas até novo login.
4. **Given** dois usuários com transações próprias, **When** cada um lista transações/categorias/relatórios, **Then** só vê os próprios registros.
5. **Given** visitante sem sessão, **When** tenta URL de dashboard/API protegida, **Then** é recusado (redirect ou 401/403).

**Owner**: Duda (auth/telas/middleware) + João (modelo `usuarios` e FK)

---

### User Story 7 - Exportar listagem em CSV (Priority: P4)

Como usuário autenticado, quero baixar a listagem (respeitando filtros ativos) em CSV para abrir no Excel/LibreOffice.

**Why this priority**: extra do roadmap (substitui PDF nesta versão). PDF, recorrência automática, PWA e Open Finance ficam fora.

**Independent Test**: filtrar a lista, clicar em exportar e abrir o arquivo com as mesmas linhas visíveis, valores e datas legíveis.

**Acceptance Scenarios**:

1. **Given** transações filtradas na tela, **When** o usuário exporta CSV, **Then** o arquivo contém cabeçalho e as linhas correspondentes aos filtros.
2. **Given** nenhuma transação no filtro, **When** o usuário exporta, **Then** o arquivo tem só o cabeçalho (ou mensagem clara na UI, sem erro genérico).

**Owner**: Duda (export) + João (endpoint, se a exportação for no servidor)

---

### Edge Cases

- Valor com mais de duas casas decimais: arredondar para centavos ou recusar no formulário; NUNCA gravar float impreciso visível (usar decimal).
- Categoria de tipo incompatível com a transação (ex.: categoria só de receita em despesa): recusar.
- Exclusão de categoria padrão: sempre recusar.
- Fuso e virada de mês: “mês corrente” usa a data da transação (não a data de criação) no fuso local America/Sao_Paulo.
- E-mail duplicado no cadastro: recusar com mensagem clara.
- Sessão expirada no meio de um save: não perder o contexto sem feedback; pedir login de novo.
- Relatório com uma única categoria: pizza com 100% nessa fatia, não erro.
- Paginação + filtros: totais de relatório NÃO devem ser calculados só na página atual.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir criar, listar, editar e excluir transações com data, valor, descrição, tipo (`receita` | `despesa`) e categoria.
- **FR-002**: O sistema MUST oferecer categorias padrão listadas na US1 e permitir CRUD de categorias customizadas (nome, tipo, cor, ícone).
- **FR-003**: O sistema MUST impedir exclusão de categoria padrão e de categoria com transações vinculadas.
- **FR-004**: O sistema MUST calcular resumo mensal: total receitas, total despesas e saldo.
- **FR-005**: O sistema MUST filtrar transações por período, categoria, tipo e faixa de valor no servidor.
- **FR-006**: O sistema MUST expor dados agregados para gráfico de pizza (por categoria), série mensal (receitas vs despesas) e comparativo mês atual vs anterior.
- **FR-007**: Após a US6, o sistema MUST autenticar por e-mail e senha, manter sessão persistente e isolar dados por usuário.
- **FR-008**: O sistema MUST exportar a listagem filtrada em CSV (US7).
- **FR-009**: A UI MUST formatar moeda em pt-BR (R$) e datas em dd/mm/aaaa.
- **FR-010**: A UI MUST pedir confirmação antes de excluir transação ou categoria.
- **FR-011**: A UI MUST mostrar estados de loading, sucesso e erro nas ações principais.
- **FR-012**: Listagem de transações MUST ser paginada.
- **FR-013**: Inputs MUST ter label; gráficos MUST ter alternativa textual.
- **FR-014**: O backend MUST validar todos os payloads (tipos, valor > 0, FKs existentes).
- **FR-015**: Recorrência automática, exportação PDF, PWA, notificações e Open Finance estão FORA desta feature.

### Key Entities

- **Usuário**: pessoa dona dos dados; e-mail único, nome, credencial secreta (nunca em texto puro). Ausente ou único implícito até a US6.
- **Categoria**: rótulo de classificação; tipo receita/despesa/ambos; cor; ícone; flag de padrão vs customizada; pertence a um usuário após US6 (padrão pode ser seed por usuário).
- **Transação**: lançamento financeiro ligado a uma categoria e, após US6, a um usuário; valor positivo; tipo receita ou despesa; data do fato; descrição.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um membro do grupo consegue cadastrar categoria + transação e ver o resumo do mês em menos de 5 minutos no ambiente local.
- **SC-002**: Com 200 transações de teste, a listagem paginada e o resumo do mês respondem em menos de 2 segundos em desenvolvimento local.
- **SC-003**: Dois usuários de teste nunca visualizam transações um do outro (checklist de QA da US6 = 100% dos casos da história).
- **SC-004**: Pizza, linha e comparativo batem com uma conferência manual dos mesmos dados (diferença de totais = R$ 0,00).
- **SC-005**: CSV exportado abre no Excel/LibreOffice com colunas corretas e números reconhecíveis.
- **SC-006**: Layout principal (dashboard, transações, categorias, relatórios, login) é usável em viewport ~375px e ~1280px.

## Assumptions

- Público: estudantes/grupo acadêmico e uso pessoal, não banco comercial.
- v1 usa dois serviços: `Front-end/` (React + Vite) e `backend/` (Python + FastAPI).
- Desenvolvimento usa SQLite; SQLAlchemy cria as tabelas na subida da API (sem migrations).
- Auth JWT no FastAPI com e-mail/senha e hash bcrypt; sem OAuth nesta versão.
- Gráficos: Recharts. Formulários: React Hook Form + Zod. UI: Tailwind + shadcn/ui. API: Pydantic.
- Recorrência: o campo `recorrente` NÃO faz parte do MVP (pode existir no banco como `false` fixo, sem UI).
- Tema claro/escuro é desejável, mas não bloqueia aceite das histórias P1–P4.
- Sem multi-moeda (apenas BRL).
