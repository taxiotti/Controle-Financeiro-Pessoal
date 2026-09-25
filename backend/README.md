# Backend — Controle Financeiro Pessoal

Estrutura vazia da API FastAPI. O código fica a cargo do grupo (`tasks.md`, a partir da T005).

Contrato: `../specs/001-controle-financeiro/contracts/openapi.yaml`.

Depois de implementar `app/main.py`:

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```
