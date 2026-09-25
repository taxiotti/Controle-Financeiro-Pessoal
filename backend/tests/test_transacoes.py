from datetime import date
from decimal import Decimal
from uuid import uuid4

import pytest
from sqlalchemy.orm import Session

from app.models import Categoria, Transacao, Usuario


def categorias(client):
    resposta = client.get("/api/categorias")
    assert resposta.status_code == 200
    return {categoria["tipo"]: categoria for categoria in resposta.json() if categoria["tipo"] != "ambos"}


def payload(categoria_id, **changes):
    dados = {
        "tipo": "despesa",
        "valor": 12.50,
        "descricao": "Almoço",
        "data": "2026-09-20",
        "categoriaId": categoria_id,
    }
    dados.update(changes)
    return dados


def test_listagem_vazia_e_paginada(api):
    client, _ = api
    vazia = client.get("/api/transacoes")
    assert vazia.status_code == 200
    assert vazia.json() == {"items": [], "total": 0, "page": 1, "pageSize": 20}

    ids = categorias(client)
    despesa = ids["despesa"]["id"]
    receita = ids["receita"]["id"]
    primeira = client.post("/api/transacoes", json=payload(despesa)).json()
    segunda = client.post("/api/transacoes", json=payload(
        receita,
        tipo="receita",
        valor=2500,
        descricao="Bolsa",
        data="2026-09-21",
    )).json()

    pagina = client.get("/api/transacoes?page=1&pageSize=1")
    assert pagina.status_code == 200
    assert pagina.json()["total"] == 2
    assert pagina.json()["pageSize"] == 1
    assert pagina.json()["items"][0]["id"] == segunda["id"]

    proxima = client.get("/api/transacoes?page=2&pageSize=1").json()
    assert proxima["items"][0]["id"] == primeira["id"]


def test_criar_editar_e_excluir_transacao(api):
    client, engine = api
    despesa = categorias(client)["despesa"]
    criada = client.post("/api/transacoes", json=payload(despesa["id"]))
    assert criada.status_code == 201
    dados = criada.json()
    assert dados["valor"] == "12.50"
    assert dados["categoriaId"] == despesa["id"]
    assert dados["categoria"]["nome"] == despesa["nome"]

    alterada = client.patch(f"/api/transacoes/{dados['id']}", json=payload(
        despesa["id"],
        valor=25,
        descricao="Almoço atualizado",
        data="2026-09-22",
    ))
    assert alterada.status_code == 200
    assert alterada.json()["valor"] == "25.00"
    assert alterada.json()["descricao"] == "Almoço atualizado"

    with Session(engine) as db:
        transacao = db.get(Transacao, dados["id"])
        assert transacao.valor == Decimal("25.00")
        assert transacao.data == date(2026, 9, 22)

    removida = client.delete(f"/api/transacoes/{dados['id']}")
    assert removida.status_code == 204
    assert removida.content == b""
    assert client.get("/api/transacoes").json()["total"] == 0


@pytest.mark.parametrize(
    "changes",
    [
        {"valor": 0},
        {"valor": -1},
        {"valor": 10.123},
        {"descricao": " "},
        {"descricao": "x" * 121},
        {"categoriaId": "nao-e-uuid"},
        {"data": "20/09/2026"},
    ],
)
def test_payload_invalido_nao_cria_transacao(api, changes):
    client, _ = api
    despesa = categorias(client)["despesa"]
    resposta = client.post("/api/transacoes", json=payload(despesa["id"], **changes))
    assert resposta.status_code == 400
    assert client.get("/api/transacoes").json()["total"] == 0


def test_categoria_inexistente_ou_tipo_incompativel(api):
    client, _ = api
    ids = categorias(client)
    receita = ids["receita"]["id"]
    assert client.post("/api/transacoes", json=payload(str(uuid4()))).status_code == 400
    assert client.post("/api/transacoes", json=payload(receita)).status_code == 400
    criada = client.post("/api/transacoes", json=payload(
        receita,
        tipo="receita",
        valor=99.90,
    ))
    assert criada.status_code == 201


def test_edicao_e_exclusao_respeitam_usuario_atual(api):
    client, engine = api
    despesa = categorias(client)["despesa"]
    criada = client.post("/api/transacoes", json=payload(despesa["id"])).json()

    with Session(engine) as db:
        outro = Usuario(nome="Outro", email="other@example.com", senha_hash="hash-de-teste")
        db.add(outro)
        db.flush()
        categoria_outra = Categoria(
            usuario_id=outro.id,
            nome="Outra",
            tipo="despesa",
            cor="#000000",
            icone="circle",
            padrao=False,
        )
        db.add(categoria_outra)
        db.flush()
        transacao_outra = Transacao(
            usuario_id=outro.id,
            categoria_id=categoria_outra.id,
            tipo="despesa",
            valor=Decimal("9.00"),
            descricao="Outro usuário",
            data=date(2026, 9, 21),
        )
        db.add(transacao_outra)
        db.commit()
        outro_id = transacao_outra.id

    assert client.patch(
        f"/api/transacoes/{outro_id}",
        json=payload(despesa["id"]),
    ).status_code == 404
    assert client.delete(f"/api/transacoes/{outro_id}").status_code == 404
    assert client.patch(
        f"/api/transacoes/{criada['id']}",
        json=payload(outro_id),
    ).status_code == 400
    assert client.get("/api/transacoes").json()["total"] == 1


def test_parametros_e_ids_invalidos(api):
    client, _ = api
    despesa = categorias(client)["despesa"]
    assert client.get("/api/transacoes?page=0").status_code == 400
    assert client.get("/api/transacoes?pageSize=101").status_code == 400
    assert client.patch("/api/transacoes/not-a-uuid", json=payload(despesa["id"])).status_code == 400
    assert client.delete("/api/transacoes/not-a-uuid").status_code == 400
