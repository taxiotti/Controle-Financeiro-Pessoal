# Quickstart — Controle Financeiro Pessoal

Para o grupo subir o Front-end com dados locais. A API FastAPI será adicionada
em uma etapa futura e não é necessária para executar US1–US5.

## Pré-requisitos

- Python 3.12
- Node.js 20 LTS
- Git

## Backend (FastAPI)

```bash
cd Front-end
npm install
npm run dev
```

Abra a URL informada pelo Vite (normalmente `http://localhost:5173`).

## Dados locais

Antes da US6, o app opera com usuário único implícito. Categorias e transações
ficam no `localStorage` deste navegador. Limpar os dados do site reinicia o
adapter e recria as nove categorias padrão.

## Rotas da UI

| Caminho | História | Dono UI |
|---|---|---|
| `/login`, `/register` | US6 | Duda |
| `/` | US3 | Taxiotti |
| `/categorias` | US1 | Nakashima |
| `/transacoes` | US2 / US4 | Nakashima |
| `/relatorios` | US5 | Taxiotti |

## Ordem segura de desenvolvimento

1. Natalia: setup Vite, dependências e adapter local alinhado ao contrato.
2. Nakashima: categorias, transações, validações, filtros e paginação.
3. Taxiotti: cards, gráficos, comparativo e responsividade.
4. Natalia: integração local, estados de erro e QA US1–US5.
5. João, em etapa futura: FastAPI + Pydantic + persistência e endpoints.
6. Natalia troca o adapter local pelo HTTP quando o contrato estiver implementado.
7. Duda implementa autenticação e CSV após a API.

## Conferência rápida do MVP (P1)

- [ ] Categorias padrão visíveis
- [ ] Criar categoria customizada
- [ ] Criar receita e despesa
- [ ] Editar e excluir transação (com confirmação)
- [ ] Cards do mês: receitas, despesas, saldo em R$

## Contratos

Qualquer mudança de campo: atualizar `contracts/openapi.yaml` no mesmo PR.
