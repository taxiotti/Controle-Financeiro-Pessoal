# Data Model: Controle Financeiro Pessoal

## Usuario

| Campo | Tipo lógico | Regras |
|---|---|---|
| id | UUID | PK |
| email | string | único, lowercase, formato e-mail |
| nome | string | 2–80 chars |
| senhaHash | string | bcrypt; NUNCA retornar na API |
| criadoEm | datetime | default now |

**Seed dev**: `dev@local.test` (senha só no `.env.example`, nunca produção).

## Categoria

| Campo | Tipo lógico | Regras |
|---|---|---|
| id | UUID | PK |
| usuarioId | UUID FK | obrigatório após US6; seed por usuário |
| nome | string | 2–40 chars, único por usuário |
| tipo | enum | `receita` \| `despesa` \| `ambos` |
| cor | string | hex `#RRGGBB` |
| icone | string | nome do ícone (ex. lucide: `utensils`) |
| padrao | boolean | true = seed; não excluir |
| criadoEm | datetime | default now |

**Seed padrão** (por usuário): alimentação, transporte, moradia, saúde, educação, lazer, salário, investimentos, outros.

Sugestão de tipo: salário/investimentos → `receita`; demais → `despesa`; `outros` → `ambos`.

## Transacao

| Campo | Tipo lógico | Regras |
|---|---|---|
| id | UUID | PK |
| usuarioId | UUID FK | obrigatório após US6 |
| categoriaId | UUID FK | categoria do mesmo usuário |
| tipo | enum | `receita` \| `despesa` |
| valor | decimal(12,2) | > 0 |
| descricao | string | 1–120 chars |
| data | date | data do fato financeiro |
| recorrente | boolean | sempre `false` nesta feature |
| criadoEm | datetime | |
| atualizadoEm | datetime | |

**Invariantes**

- `tipo` da transação MUST ser compatível com `categoria.tipo` (`ambos` aceita os dois).
- Excluir categoria: recusar se `padrao` ou se existir transação.
- Relatórios agrupam por `data` (mês/ano), não por `criadoEm`.
- Após US6, toda query MUST incluir `usuarioId` da sessão.

## Relacionamentos

```
Usuario 1 ── * Categoria
Usuario 1 ── * Transacao
Categoria 1 ── * Transacao
```

Delete: usuário em cascata (quando existir). Categoria: Restrict se houver transações.

## Índices

- `Transacao(usuarioId, data)`
- `Transacao(usuarioId, categoriaId)`
- `Transacao(usuarioId, tipo)`
- `Categoria(usuarioId, nome)` único
- `Usuario(email)` único

## SQLAlchemy (esboço)

João implementa em `backend/app/models/`. Colunas no banco em `snake_case` (`usuario_id`, `senha_hash`). JSON da API em **camelCase** (igual ao contrato: `categoriaId`, `pageSize`). Usar `Numeric(12, 2)` para valor; serializar na API como string (`"150.90"`).
