# Quickstart — Controle Financeiro Pessoal

Dois processos: API (8000) e UI (5173).

## Pré-requisitos

- Python 3.12
- Node.js 20 LTS
- Git

## Backend (FastAPI)

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python -m app.seed
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000
- Swagger: http://localhost:8000/docs

## Front-end (Vite)

```bash
cd Front-end
npm install
```

Crie `Front-end/.env` com `VITE_API_URL=http://localhost:8000/api` e rode `npm run dev`. Abra http://localhost:5173.

## Usuário de desenvolvimento (após seed)

- E-mail: `dev@local.test`
- Senha: ver `backend/.env.example` (`DEV_USER_PASSWORD`)

Antes da US6, a API pode operar só com esse usuário implícito.

## Rotas da UI

| Caminho | História | Dono UI |
|---|---|---|
| `/login`, `/register` | US6 | Duda |
| `/` | US3 | Taxiotti |
| `/categorias` | US1 | Nakashima |
| `/transacoes` | US2 / US4 | Nakashima |
| `/relatorios` | US5 | Taxiotti |

## Ordem segura de desenvolvimento

1. Natalia: Vite + `VITE_API_URL` + CORS conferido no FastAPI.
2. João: models + seed + `GET/POST /api/categorias`.
3. Nakashima: UI categorias contra a API (ou mock do contrato).
4. João: CRUD transações + resumo.
5. Nakashima + Taxiotti em paralelo.
6. Natalia liga telas ↔ APIs.
7. João: filtros + relatórios JSON.
8. Taxiotti: gráficos. Natalia integra.
9. João: FK usuário. Duda: JWT + telas + isolamento.
10. Duda: CSV. Natalia: QA.

## Conferência rápida do MVP (P1)

- [ ] Categorias padrão visíveis
- [ ] Criar categoria customizada
- [ ] Criar receita e despesa
- [ ] Editar e excluir transação (com confirmação)
- [ ] Cards do mês: receitas, despesas, saldo em R$

## Contratos

Qualquer mudança de campo: atualizar `contracts/openapi.yaml` no mesmo PR.
