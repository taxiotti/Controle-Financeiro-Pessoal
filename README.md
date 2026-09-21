# Controle Financeiro Pessoal

Aplicação web para gerenciamento financeiro pessoal: receitas e despesas com categorias e relatórios mensais.

## Documentação para o grupo (Spec Kit)

Tudo que o time precisa para desenvolver está em **[specs/001-controle-financeiro/](specs/001-controle-financeiro/)**:

| Arquivo | Para que serve |
|---|---|
| [spec.md](specs/001-controle-financeiro/spec.md) | O que o produto faz (histórias e aceite) |
| [plan.md](specs/001-controle-financeiro/plan.md) | Stack e pastas (`Front-end/` + `backend/`) |
| [tasks.md](specs/001-controle-financeiro/tasks.md) | Checklist com dono de cada tarefa |
| [team.md](specs/001-controle-financeiro/team.md) | Papéis, demandas e prompt do diário |
| [quickstart.md](specs/001-controle-financeiro/quickstart.md) | Como rodar depois do setup |
| [contracts/openapi.yaml](specs/001-controle-financeiro/contracts/openapi.yaml) | Contrato das APIs |
| [data-model.md](specs/001-controle-financeiro/data-model.md) | Modelo do banco |
| [research.md](specs/001-controle-financeiro/research.md) | Decisões (Vite + FastAPI, SQLAlchemy, JWT) |

Regras permanentes: [.specify/memory/constitution.md](.specify/memory/constitution.md).

## Papéis

- **Natalia** — setup, integração, QA
- **João** — banco e APIs
- **Nakashima** — componentes e telas de cadastro
- **Taxiotti** — dashboard e gráficos
- **Duda** — autenticação e CSV

Comece pela **Phase 1** em `tasks.md`. Backend: pasta `backend/` (FastAPI). UI: pasta `Front-end/`. Não implemente recorrência, PDF, PWA nem Open Finance nesta versão.
