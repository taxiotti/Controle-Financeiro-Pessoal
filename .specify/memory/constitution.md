<!--
  Sync Impact Report (remover antes do commit se o grupo preferir)
  Version change: 1.0.0 → 1.1.0
  Modified principles: IV (validação FastAPI/Pydantic); Constraints de Produto
  Added sections: nenhum
  Removed sections: nenhum
  TODOs: nenhum
-->

# Constituição do Controle Financeiro Pessoal

## Core Principles

### I. Produto antes de tecnologia
Toda alteração MUST partir de um comportamento observável pelo usuário
(cadastrar transação, ver saldo, filtrar, autenticar). Código sem história
de usuário correspondente MUST NÃO entrar na branch principal.
**Rationale**: o grupo é multidisciplinar; a spec é o contrato comum.

### II. Entrega incremental (MVP primeiro)
Fase 1 (transações, categorias, resumo) MUST ser utilizável sozinha, sem
gráficos, sem exportação e sem autenticação. Fases seguintes MUST NÃO quebrar
o que já funciona. Itens fora do escopo v1 (recorrência automática, PDF,
PWA, Open Finance, notificações) MUST NÃO bloquear o MVP.
**Rationale**: o grupo precisa demonstrar valor cedo e paralelizar o trabalho.

### III. Contrato de API compartilhado
Backend e frontend MUST seguir os contratos em `specs/*/contracts/`.
Mudança de campo, rota ou status HTTP MUST atualizar o contrato no mesmo PR.
O frontend MUST NÃO inventar formatos paralelos.
**Rationale**: Natália integra telas e APIs; sem contrato o merge quebra.

### IV. Isolamento e validação no servidor
Quando a autenticação existir, toda leitura e escrita MUST filtrar pelo
usuário autenticado. Inputs MUST ser validados no servidor com Pydantic,
mesmo que já existam no cliente. Senhas MUST ser armazenadas apenas como hash.
**Rationale**: filtro só no cliente não é segurança.

### V. UX brasileira, acessível e honesta
Valores MUST usar Real (R$ 1.234,56). Datas MUST usar dd/mm/aaaa na UI.
Ações destrutivas MUST pedir confirmação. Loading, sucesso e erro MUST ser
visíveis. Inputs MUST ter label. Gráficos MUST ter texto/ARIA equivalente.
Tema claro/escuro SHOULD ser suportado sem atrasar o MVP.
**Rationale**: o produto é pessoal e local; clareza vale mais que ornamentação.

## Constraints de Produto

- Idioma da interface e das specs: português (Brasil).
- Stack v1: React + TypeScript + Vite no frontend; FastAPI + Pydantic +
  SQLAlchemy/SQLModel no backend; SQLite em desenvolvimento; Recharts.
- Frontend e backend são serviços separados e MUST compartilhar os formatos
  definidos em `specs/*/contracts/openapi.yaml`.
- Dados financeiros são sensíveis: NUNCA commitar `.env`, secrets ou dumps
  com senha real.

## Fluxo do Grupo

- Papéis: João (backend/banco), Nakashima (componentes/telas de cadastro),
  Taxiotti (dashboard/gráficos), Duda (auth/CSV), Natalia (setup/integração/QA).
- Cada demanda em `tasks.md` tem um responsável. Outra pessoa SÓ assume com
  acordo do grupo.
- Integração (Natalia) começa DEPOIS do contrato daquela história existir e
  de um endpoint ou mock estável.
- Status das tarefas: `A fazer` → `Em andamento` → `Concluída`.
- Spec, plano e tasks em `specs/` prevalecem sobre conversas de chat.

## Governance

Esta constituição prevalece sobre preferências individuais de stack ou
escopo. Emendas exigem: (1) atualizar este arquivo, (2) bump de versão
semântica, (3) acordo do grupo. MAJOR: remover/redefinir princípio.
MINOR: novo princípio ou restrição. PATCH: só redação.
PRs e revisões MUST checar isolamento de dados, contrato de API e critérios
de aceite da história. Complexidade extra MUST ser justificada em
`plan.md` (Complexity Tracking).

**Version**: 1.1.0 | **Ratified**: 2026-09-14 | **Last Amended**: 2026-09-18
