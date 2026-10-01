from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Categoria, Transacao, Usuario


def test_register_inicia_sessao_e_rejeita_email_duplicado(api):
    client, _ = api
    criada = client.post("/api/auth/register", json={
        "nome": "Ana Silva",
        "email": "ana@example.com",
        "senha": "senha1234",
    })
    assert criada.status_code == 201
    corpo = criada.json()
    assert corpo["tokenType"] == "bearer"
    assert corpo["usuario"]["email"] == "ana@example.com"
    assert "senha" not in corpo["usuario"]
    assert corpo["accessToken"]

    duplicada = client.post("/api/auth/register", json={
        "nome": "Ana Silva",
        "email": "ANA@example.com",
        "senha": "senha1234",
    })
    assert duplicada.status_code == 409
    assert "e-mail" in duplicada.json()["error"].lower()


def test_login_generico_e_protegido_sem_token(api):
    client, _ = api
    client.headers.pop("Authorization", None)

    falha = client.post("/api/auth/login", json={
        "email": settings.dev_user_email,
        "senha": "erradaaaaa",
    })
    assert falha.status_code == 401
    assert falha.json()["error"] == "E-mail ou senha inválidos."

    inexistente = client.post("/api/auth/login", json={
        "email": "naoexiste@example.com",
        "senha": "senha1234",
    })
    assert inexistente.status_code == 401
    assert inexistente.json()["error"] == "E-mail ou senha inválidos."

    assert client.get("/api/categorias").status_code == 401
    assert client.get("/api/transacoes").status_code == 401
    assert client.get("/api/transacoes/export").status_code == 401
    assert client.get("/api/auth/me").status_code == 401


def test_isolamento_entre_duas_contas(api):
    client, engine = api
    conta_a = client.post("/api/auth/register", json={
        "nome": "Usuário A",
        "email": "a@example.com",
        "senha": "senha1234",
    }).json()
    conta_b = client.post("/api/auth/register", json={
        "nome": "Usuário B",
        "email": "b@example.com",
        "senha": "senha1234",
    }).json()

    headers_a = {"Authorization": f"Bearer {conta_a['accessToken']}"}
    headers_b = {"Authorization": f"Bearer {conta_b['accessToken']}"}

    categorias_a = client.get("/api/categorias", headers=headers_a).json()
    categorias_b = client.get("/api/categorias", headers=headers_b).json()
    ids_a = {item["id"] for item in categorias_a}
    ids_b = {item["id"] for item in categorias_b}
    assert ids_a.isdisjoint(ids_b)

    despesa_a = next(item for item in categorias_a if item["tipo"] == "despesa")
    criada = client.post("/api/transacoes", headers=headers_a, json={
        "tipo": "despesa",
        "valor": 40,
        "descricao": "Só da conta A",
        "data": "2026-09-20",
        "categoriaId": despesa_a["id"],
    })
    assert criada.status_code == 201
    transacao_id = criada.json()["id"]

    lista_b = client.get("/api/transacoes", headers=headers_b).json()
    assert lista_b["total"] == 0
    assert client.patch(
        f"/api/transacoes/{transacao_id}",
        headers=headers_b,
        json={
            "tipo": "despesa",
            "valor": 1,
            "descricao": "tentativa",
            "data": "2026-09-20",
            "categoriaId": categorias_b[0]["id"],
        },
    ).status_code == 404
    assert client.delete(f"/api/transacoes/{transacao_id}", headers=headers_b).status_code == 404

    me = client.get("/api/auth/me", headers=headers_a)
    assert me.status_code == 200
    assert me.json()["email"] == "a@example.com"

    logout = client.post("/api/auth/logout", headers=headers_a)
    assert logout.status_code == 204

    with Session(engine) as db:
        usuario_a = db.query(Usuario).filter(Usuario.email == "a@example.com").one()
        assert db.query(Transacao).filter(Transacao.usuario_id == usuario_a.id).count() == 1
        assert db.query(Categoria).filter(Categoria.usuario_id == usuario_a.id).count() >= 9
        assert Decimal("40.00") == db.query(Transacao).filter(
            Transacao.id == transacao_id,
        ).one().valor
        assert date(2026, 9, 20) == db.query(Transacao).filter(
            Transacao.id == transacao_id,
        ).one().data
