# Front-end — Controle Financeiro Pessoal

Dashboard React + Vite do Controle Financeiro Pessoal.

## Entregas desta tela

- Cards de receitas, despesas e saldo do mês selecionado.
- Gráfico de pizza agrupado por categoria de despesa, com tabela equivalente para acessibilidade.
- Gráfico de linha com a evolução de receitas e despesas nos seis meses exibidos.
- Comparativo nominal entre o mês selecionado e o mês anterior.
- Layout responsivo para desktop e mobile, incluindo cards, gráficos, tabela de lançamentos e modal de novo lançamento.

## Integração com o backend existente

A tela usa `VITE_API_URL` (padrão `https://controle-financeiro-pessoal-eeje.onrender.com/api`) e consome as rotas já disponíveis:

- `GET /categorias`
- `GET /transacoes?page=...&pageSize=...`
- `POST /transacoes`

As telas de cadastro e login usam `POST /auth/register` e `POST /auth/login`.
Após a autenticação, o token JWT é persistido no navegador e enviado em todas as
requisições protegidas, incluindo exportação de CSV. As rotas do dashboard
validam a sessão em `GET /auth/me`; uma sessão inválida redireciona para o login.

O cliente percorre as páginas de transações antes de calcular os totais e agrupamentos no front. Assim, o resumo não depende apenas da página atualmente visível. Quando a API está indisponível, a tela exibe um alerta e mantém os estados vazios sem quebrar.

## Desenvolvimento e validação

```bash
npm install
npm run dev
npm run build
npm run lint
```

Crie `Front-end/.env` se a API estiver em outro endereço:

```bash
VITE_API_URL=http://localhost:8000/api
```

Os gráficos também apresentam dados em tabelas ocultas para leitor de tela e os estados vazios são tratados explicitamente.
