# Research: Controle Financeiro Pessoal

**Date**: 2026-09-18

## 1. React + Vite e FastAPI

**Decision**: manter a SPA React + TypeScript + Vite em `Front-end/` e implementar o backend futuramente como serviço FastAPI separado.

**Rationale**: o protótipo Vite já existe e FastAPI é a tecnologia definida para a API. O contrato `contracts/openapi.yaml` desacopla as entregas e evita que as páginas dependam da implementação do servidor.

**Frontend-only atual**: US1–US5 usam um adapter `localStorage` com as mesmas entidades, filtros, paginação e agregações do contrato. Nenhuma rota FastAPI é criada nesta etapa.

## 2. Persistência futura

**Decision**: FastAPI + Pydantic para transporte/validação e SQLAlchemy ou SQLModel para persistência; SQLite no desenvolvimento, com desenho migrável para PostgreSQL.

**Rationale**: Pydantic mantém validação explícita no limite HTTP; tipos decimais no Python e no banco evitam erro visível de ponto flutuante.

## 3. Autenticação

**Decision**: a US6 será definida no serviço FastAPI, com senha armazenada por hash e sessão/token seguro. O mecanismo exato será fechado antes da implementação da US6.

**Rejected**: autenticação apenas no client; ela não fornece isolamento nem segurança. A fase frontend-only opera com usuário único implícito.

## 4. Contrato e estado no cliente

**Decision**: TanStack Query para consultas/mutações; React Hook Form + Zod no cliente; modelos Pydantic equivalentes no FastAPI.

**Rationale**: o frontend não reutiliza código Python, mas os dois lados seguem os mesmos schemas e status descritos no OpenAPI.

## 5. Dinheiro e datas

**Decision**: respostas monetárias são strings decimais; o adapter local persiste strings e calcula em centavos inteiros. A API futura deve usar `Decimal`. “Mês corrente” usa a data da transação em `America/Sao_Paulo`.

## 6. Gráficos

**Decision**: Recharts no frontend. O adapter local agrega todas as transações, não apenas a página visível; no backend futuro, as agregações passam aos endpoints `/relatorios/*`.

**Acessibilidade**: cada gráfico acompanha uma tabela com os mesmos valores.

## 7. Fora de escopo atual

Backend FastAPI, autenticação, CSV, recorrência automática, PDF, PWA, notificações, Open Finance e tema escuro.

## 8. Papéis e fronteiras

| Área | Dono | Fronteira |
|---|---|---|
| FastAPI, Pydantic, persistência e queries | João | `contracts/openapi.yaml` |
| Forms, tabelas, filtros e navegação | Nakashima | `Front-end/src/` |
| Dashboard, Recharts e responsividade | Taxiotti | DTOs de relatório |
| Auth e CSV | Duda | API FastAPI após US6 |
| Setup, adapter, integração e QA | Natalia | contrato e quickstart |
