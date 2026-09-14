# Quickstart — Controle Financeiro Pessoal

Para o grupo subir o app depois do setup (Natalia) e do schema (João).

## Pré-requisitos

- Node.js 20 LTS
- npm
- Git

## Primeira vez

```bash
npm install
copy .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Abra `http://localhost:3000`.

## Usuário de desenvolvimento (após seed)

- E-mail: `dev@local.test`
- Senha: ver `.env.example` (`DEV_USER_PASSWORD`)

Antes da US6, o app pode operar só com esse usuário implícito.

## Rotas da UI

| Caminho | História | Dono UI |
|---|---|---|
| `/login`, `/register` | US6 | Duda |
| `/` | US3 | Taxiotti |
| `/categorias` | US1 | Nakashima |
| `/transacoes` | US2 / US4 | Nakashima |
| `/relatorios` | US5 | Taxiotti |

## Ordem segura de desenvolvimento

1. Natalia: `create-next-app`, Tailwind, shadcn, Spec Kit já existente.
2. João: Prisma + seed + `GET/POST /api/categorias`.
3. Nakashima: UI categorias contra a API (ou mock no formato do contrato).
4. João: CRUD transações + resumo.
5. Nakashima + Taxiotti em paralelo (forms vs cards).
6. Natalia liga telas ↔ APIs e trata erros.
7. João: filtros + relatórios JSON.
8. Taxiotti: gráficos. Natalia integra.
9. João: `usuarios` + FK. Duda: Auth.js + middleware + isolamento.
10. Duda: CSV. Natalia: QA dos fluxos.

## Conferência rápida do MVP (P1)

- [ ] Categorias padrão visíveis
- [ ] Criar categoria customizada
- [ ] Criar receita e despesa
- [ ] Editar e excluir transação (com confirmação)
- [ ] Cards do mês: receitas, despesas, saldo em R$

## Contratos

Qualquer mudança de campo: atualizar `contracts/openapi.yaml` no mesmo PR.
