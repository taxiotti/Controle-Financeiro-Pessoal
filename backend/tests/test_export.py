def test_export_csv_com_cabecalho_e_linhas_do_usuario(api):
    client, _ = api
    vazia = client.get("/api/transacoes/export")
    assert vazia.status_code == 200
    assert "text/csv" in vazia.headers["content-type"]
    texto_vazio = vazia.content.decode("utf-8-sig")
    assert texto_vazio.splitlines()[0] == "Data;Tipo;Descrição;Valor;Categoria"

    categorias = client.get("/api/categorias").json()
    despesa = next(item for item in categorias if item["tipo"] == "despesa")
    client.post("/api/transacoes", json={
        "tipo": "despesa",
        "valor": 12.5,
        "descricao": "Almoço",
        "data": "2026-09-20",
        "categoriaId": despesa["id"],
    })

    csv_bytes = client.get("/api/transacoes/export").content
    texto = csv_bytes.decode("utf-8-sig")
    assert "20/09/2026;despesa;Almoço;12,50;" in texto
    assert despesa["nome"] in texto
