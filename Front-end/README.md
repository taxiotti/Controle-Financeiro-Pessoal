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

Em outro terminal, suba o backend e carregue as categorias padrão:

```bash
cd ../backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload
```

Por padrão, o frontend usa `http://localhost:8000/api`. Para outro endereço,
crie `Front-end/.env.local` com `VITE_API_URL=http://servidor:porta/api`.

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

## Integração com API

As páginas usam `src/api/httpClient.ts`, que chama o backend FastAPI nos
endpoints de categorias e transações. Os tipos em `src/api/types.ts` seguem
`specs/001-controle-financeiro/contracts/openapi.yaml`.

O backend atual ainda não disponibiliza filtros nem endpoints de relatórios.
Enquanto isso, o cliente busca as páginas de transações da API e aplica os
filtros e agregações necessários para manter o dashboard e os gráficos
coerentes com os dados do servidor.

## Limites

Autenticação, isolamento real entre usuários, CSV, filtros no servidor e
endpoints de relatórios ainda não foram implementados. O backend usa o usuário
de desenvolvimento definido em sua configuração; não deve ser tratado como
proteção de dados financeiros.
