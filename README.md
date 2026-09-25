# Controle Financeiro Pessoal

Aplicação web para gerenciamento financeiro pessoal: receitas e despesas com categorias e relatórios mensais.

## Documentação para o grupo (Spec Kit)

Tudo que o time precisa para desenvolver está em **[specs/001-controle-financeiro/](specs/001-controle-financeiro/)**:

| Arquivo | Para que serve |
|---|---|
| [spec.md](specs/001-controle-financeiro/spec.md) | O que o produto faz (histórias e aceite) |
| [plan.md](specs/001-controle-financeiro/plan.md) | Stack e pastas (Vite + FastAPI futuro) |
| [tasks.md](specs/001-controle-financeiro/tasks.md) | Checklist com dono de cada tarefa |
| [team.md](specs/001-controle-financeiro/team.md) | Papéis, demandas e prompt do diário |
| [quickstart.md](specs/001-controle-financeiro/quickstart.md) | Como rodar depois do setup |
| [contracts/openapi.yaml](specs/001-controle-financeiro/contracts/openapi.yaml) | Contrato das APIs |
| [data-model.md](specs/001-controle-financeiro/data-model.md) | Modelo do banco |
| [research.md](specs/001-controle-financeiro/research.md) | Decisões de arquitetura e integração |

Regras permanentes: [.specify/memory/constitution.md](.specify/memory/constitution.md).

## Papéis

- **Natalia** — setup, integração, QA
- **João** — banco e APIs
- **Nakashima** — componentes e telas de cadastro
- **Taxiotti** — dashboard e gráficos
- **Duda** — autenticação e CSV

## Executar o Front-end atual

```bash
cd Front-end
npm install
npm run dev
```

US1–US5 operam com dados locais. A API será implementada futuramente em
FastAPI; não há backend nesta etapa. Não implemente recorrência, PDF, PWA nem
Open Finance nesta versão.
