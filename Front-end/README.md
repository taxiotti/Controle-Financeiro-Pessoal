# Clarus — Front-end

SPA de controle financeiro pessoal guiada pelas specs em
`specs/001-controle-financeiro/`.

## Executar

Requisitos: Node.js 20+ e npm.

```bash
npm install
npm run dev
```

O Vite informa a URL local, normalmente `http://localhost:5173`.

## Verificações

```bash
npm run lint
npm test
npm run build
```

## Escopo atual

- US1: categorias padrão e CRUD de categorias customizadas.
- US2: CRUD e paginação de transações.
- US3: resumo do mês corrente.
- US4: filtros persistidos na URL.
- US5: pizza por categoria, evolução mensal e comparativo.
- UI em português, BRL, datas brasileiras e layout responsivo.

## Dados locais

Esta etapa não possui backend. O adapter em `src/api/localClient.ts` grava
categorias e transações na chave versionada `cfp:v1:data` do `localStorage`.
Limpar os dados do site recria as nove categorias padrão.

Os tipos em `src/api/types.ts` seguem
`specs/001-controle-financeiro/contracts/openapi.yaml`. Quando a API FastAPI
estiver pronta, um adapter HTTP poderá substituir o cliente local sem mudar
as páginas.

## Limites

Autenticação, isolamento real entre usuários, CSV e o serviço FastAPI ainda
não foram implementados. O armazenamento local serve para desenvolvimento e
demonstração; não deve ser tratado como proteção de dados financeiros.
