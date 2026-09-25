# Equipe e demandas — 001-controle-financeiro

Como usar: cada integrante pega as tasks com o seu nome em [tasks.md](./tasks.md). Status: **A fazer** → **Em andamento** → **Concluída**.

| Integrante | Papel | Demandas | Carga | Complexidade | Status |
|---|---|---|---|---|---|
| **João** | Backend & banco | Modelagem SQLAlchemy/SQLModel (`transacoes`/`categorias`) e migrations | Média | Alta | A fazer |
| **João** | Backend & banco | Endpoints CRUD de categorias | Baixa | Média | A fazer |
| **João** | Backend & banco | Endpoints CRUD de transações | Média | Média | A fazer |
| **João** | Backend & banco | Agregações (resumo + gráficos) | Média | Alta | A fazer |
| **João** | Backend & banco | Filtros no backend (período, tipo, categoria, valor) | Média | Média | A fazer |
| **João** | Backend & banco | Tabela `usuarios` e vínculo com transações/categorias | Baixa | Média | A fazer |
| **Nakashima** | Frontend & componentes | Componentes base (botões, inputs, modais, tabela) | Média | Baixa | Concluída |
| **Nakashima** | Frontend & componentes | UI/modal de categorias (ícones e cores) | Média | Média | Concluída |
| **Nakashima** | Frontend & componentes | Tela/modal de transações com validação | Média | Média | Concluída |
| **Nakashima** | Frontend & componentes | Filtros na listagem | Média | Média | Concluída |
| **Nakashima** | Frontend & componentes | Navegação, formulários e layouts | Baixa | Baixa | Concluída |
| **Taxiotti** | Dashboard & relatórios | Página principal e cards de resumo | Média | Média | Concluída |
| **Taxiotti** | Dashboard & relatórios | Gráfico de pizza por categoria | Média | Média | Concluída |
| **Taxiotti** | Dashboard & relatórios | Gráfico de linha (evolução mensal) | Média | Média | Concluída |
| **Taxiotti** | Dashboard & relatórios | Comparativo mês atual vs anterior | Baixa | Baixa | Concluída |
| **Taxiotti** | Dashboard & relatórios | Responsividade mobile/desktop | Média | Média | Concluída |
| **Duda** | Auth & extras | Auth FastAPI, token/sessão e hash de senhas | Alta | Alta | A fazer |
| **Duda** | Auth & extras | Telas de login e cadastro | Média | Média | A fazer |
| **Duda** | Auth & extras | Middleware, rotas protegidas, sessão | Média | Alta | A fazer |
| **Duda** | Auth & extras | Isolamento de dados por usuário | Média | Alta | A fazer |
| **Duda** | Auth & extras | Exportação CSV da listagem | Média | Média | A fazer |
| **Natalia** | Setup, integração & QA | Setup Vite, dependências, Git e Spec Kit | Média | Média | Concluída |
| **Natalia** | Setup, integração & QA | Integrar telas ao adapter local; migrar para API FastAPI depois | Alta | Média | Concluída |
| **Natalia** | Setup, integração & QA | Integrar gráficos ao adapter local; migrar para API FastAPI depois | Alta | Média | Concluída |
| **Natalia** | Setup, integração & QA | Integrar auth da Duda ao restante | Média | Média | A fazer |
| **Natalia** | Setup, integração & QA | Validação de fluxos, erros e correções | Alta | Média | A fazer |

## Dependências entre pessoas

```text
Natalia (setup)
    └── João (schema + CRUD categorias)
            ├── Nakashima (UI categorias / transações)
            └── João (CRUD transações + resumo)
                    ├── Taxiotti (cards) ── Natalia (integração dashboard)
                    ├── Nakashima (filtros) + João (query filtros)
                    └── João (relatórios JSON) ── Taxiotti (gráficos) ── Natalia
                            └── João (usuarios FK) ── Duda (auth + isolamento) ── Natalia
                                    └── Duda (CSV) ── Natalia (QA)
```

## Prompt para diário do relatório

Quando precisarem simular/preencher o histórico diário:

```text
Atue como um gestor de projetos de software. Utilize a tabela de planejamento em specs/001-controle-financeiro/team.md e as tasks em specs/001-controle-financeiro/tasks.md para gerar uma tabela em Markdown.

ESTRUTURA: Data | Integrante | Demanda realizada | Carga de trabalho | Complexidade | Status

REGRAS:
1. Datas em dd/mm nas semanas reais de desenvolvimento.
2. Descrição objetiva (ex.: "Criou os modelos SQLAlchemy para transacoes").
3. Carga e Complexidade só com Baixa, Média ou Alta, coerentes com team.md.
4. Status gradual: A fazer, Em andamento, Concluída.
5. Nomes: João, Nakashima, Taxiotti, Duda e Natalia.
```
