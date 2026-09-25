from datetime import date
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session

import app.api.v1.endpoints.relatorios as endpoint
from app.core.config import settings
from app.core.database import Base, get_db
from app.main import app
from app.models import Categoria, Transacao, Usuario
from app.seed import seed


@pytest.fixture
def api(tmp_path, monkeypatch):
    engine = create_engine(
        f"sqlite:///{tmp_path / 'test.db'}",
        connect_args={"check_same_thread": False},
    )

    @event.listens_for(engine, "connect")
    def foreign_keys(connection, _):
        connection.execute("PRAGMA foreign_keys=ON")

    Base.metadata.create_all(engine)
    monkeypatch.setattr(settings, "dev_user_password", "test-password")
    with Session(engine) as db:
        seed(db)

    def override_db():
        with Session(engine) as db:
            yield db

    app.dependency_overrides[get_db] = override_db
    client = TestClient(app)
    yield client, engine
    client.close()
    app.dependency_overrides.clear()
    engine.dispose()


def categoria_id(client, tipo):
    categorias = client.get("/api/categorias").json()
    return next(categoria["id"] for categoria in categorias if categoria["tipo"] == tipo)


def criar(client, categoria, tipo, valor, data, descricao="Lançamento"):
    resposta = client.post("/api/transacoes", json={
        "categoriaId": categoria,
        "tipo": tipo,
        "valor": valor,
        "data": data,
        "descricao": descricao,
    })
    assert resposta.status_code == 201, resposta.text
    return resposta.json()


def test_resumo_mensal_agrega_por_data_e_retorna_zero_sem_lancamentos(api):
    client, _ = api
    receita = categoria_id(client, "receita")
    despesa = categoria_id(client, "despesa")
    criar(client, receita, "receita", 1500.50, "2026-09-01")
    criar(client, receita, "receita", 499.50, "2026-09-30")
    criar(client, despesa, "despesa", 320.25, "2026-09-10")
    criar(client, despesa, "despesa", 99.75, "2026-08-31")

    resumo = client.get("/api/relatorios/resumo?ano=2026&mes=9")
    assert resumo.status_code == 200
    assert resumo.json() == {
        "ano": 2026,
        "mes": 9,
        "totalReceitas": "2000.00",
        "totalDespesas": "320.25",
        "saldo": "1679.75",
    }
    vazio = client.get("/api/relatorios/resumo?ano=2026&mes=7")
    assert vazio.json()["totalReceitas"] == "0.00"
    assert vazio.json()["totalDespesas"] == "0.00"
    assert vazio.json()["saldo"] == "0.00"


def test_pizza_agrupa_categoria_filtra_tipo_e_ordena_total(api):
    client, _ = api
    primeira = client.post("/api/categorias", json={
        "nome": "Casa",
        "tipo": "despesa",
        "cor": "#111111",
        "icone": "house",
    }).json()
    segunda = client.post("/api/categorias", json={
        "nome": "Pets",
        "tipo": "despesa",
        "cor": "#222222",
        "icone": "paw-print",
    }).json()
    receita = categoria_id(client, "receita")
    criar(client, primeira["id"], "despesa", 100, "2026-09-03")
    criar(client, segunda["id"], "despesa", 250, "2026-09-04")
    criar(client, receita, "receita", 900, "2026-09-05")

    pizza = client.get("/api/relatorios/pizza?ano=2026&mes=9&tipo=despesa")
    assert pizza.status_code == 200
    assert pizza.json() == [
        {"categoriaId": segunda["id"], "nome": "Pets", "cor": "#222222", "total": "250.00"},
        {"categoriaId": primeira["id"], "nome": "Casa", "cor": "#111111", "total": "100.00"},
    ]
    assert client.get("/api/relatorios/pizza?ano=2026&mes=8&tipo=despesa").json() == []
    assert client.get("/api/relatorios/pizza?ano=2026&mes=9&tipo=invalido").status_code == 400


def test_evolucao_inclui_meses_sem_lancamentos(api, monkeypatch):
    client, _ = api
    receita = categoria_id(client, "receita")
    despesa = categoria_id(client, "despesa")
    monkeypatch.setattr(endpoint, "hoje_local", lambda: date(2026, 9, 25))
    criar(client, receita, "receita", 100, "2026-08-01")
    criar(client, despesa, "despesa", 25, "2026-09-20")

    evolucao = client.get("/api/relatorios/evolucao?meses=3")
    assert evolucao.status_code == 200
    assert evolucao.json() == [
        {"ano": 2026, "mes": 7, "totalReceitas": "0.00", "totalDespesas": "0.00"},
        {"ano": 2026, "mes": 8, "totalReceitas": "100.00", "totalDespesas": "0.00"},
        {"ano": 2026, "mes": 9, "totalReceitas": "0.00", "totalDespesas": "25.00"},
    ]
    assert client.get("/api/relatorios/evolucao?meses=25").status_code == 400


def test_comparativo_calcula_variacoes_e_isola_usuario(api):
    client, engine = api
    receita = categoria_id(client, "receita")
    despesa = categoria_id(client, "despesa")
    criar(client, receita, "receita", 500, "2026-09-01")
    criar(client, despesa, "despesa", 150, "2026-09-02")
    criar(client, receita, "receita", 200, "2026-08-01")
    criar(client, despesa, "despesa", 100, "2026-08-02")

    with Session(engine) as db:
        outro = Usuario(nome="Outro", email="other@example.com", senha_hash="hash-de-teste")
        db.add(outro)
        db.flush()
        categoria = Categoria(
            usuario_id=outro.id,
            nome="Outra",
            tipo="receita",
            cor="#000000",
            icone="circle",
            padrao=False,
        )
        db.add(categoria)
        db.flush()
        db.add(Transacao(
            usuario_id=outro.id,
            categoria_id=categoria.id,
            tipo="receita",
            valor=Decimal("9999.00"),
            descricao="Não pode aparecer",
            data=date(2026, 9, 10),
        ))
        db.commit()

    comparativo = client.get("/api/relatorios/comparativo?ano=2026&mes=9")
    assert comparativo.status_code == 200
    assert comparativo.json() == {
        "atual": {
            "ano": 2026,
            "mes": 9,
            "totalReceitas": "500.00",
            "totalDespesas": "150.00",
            "saldo": "350.00",
        },
        "anterior": {
            "ano": 2026,
            "mes": 8,
            "totalReceitas": "200.00",
            "totalDespesas": "100.00",
            "saldo": "100.00",
        },
        "variacaoReceitas": "300.00",
        "variacaoDespesas": "50.00",
        "variacaoSaldo": "250.00",
    }


@pytest.mark.parametrize("url", [
    "/api/relatorios/resumo?ano=2026&mes=0",
    "/api/relatorios/comparativo?ano=0&mes=1",
    "/api/relatorios/pizza?ano=2026&mes=13",
])
def test_parametros_invalidos(api, url):
    client, _ = api
    assert client.get(url).status_code == 400

