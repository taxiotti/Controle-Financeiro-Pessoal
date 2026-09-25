from typing import Annotated
from uuid import UUID

import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_usuario_atual
from app.models import Categoria, Transacao, Usuario
from app.schemas.categoria import CategoriaResponse
from app.schemas.transacao import PaginaTransacoes, TransacaoInput, TransacaoResponse

router = APIRouter()


def buscar_categoria_compativel(
    db: Session,
    categoria_id: UUID,
    usuario: Usuario,
    tipo: str,
) -> Categoria:
    categoria = db.scalar(select(Categoria).where(
        Categoria.id == str(categoria_id),
        Categoria.usuario_id == usuario.id,
    ))
    if categoria is None:
        raise HTTPException(400, "Categoria não encontrada.")
    if categoria.tipo not in ("ambos", tipo):
        raise HTTPException(400, "O tipo da transação é incompatível com a categoria.")
    return categoria


def buscar_transacao(db: Session, id: UUID, usuario: Usuario) -> Transacao:
    transacao = db.scalar(select(Transacao).where(
        Transacao.id == str(id),
        Transacao.usuario_id == usuario.id,
    ))
    if transacao is None:
        raise HTTPException(404, "Transação não encontrada.")
    return transacao


def listar_transacoes_usuario(usuario: Usuario):
    return (
        select(Transacao, Categoria)
        .join(Categoria, Categoria.id == Transacao.categoria_id)
        .where(Transacao.usuario_id == usuario.id)
        .order_by(Transacao.data.desc(), Transacao.criado_em.desc(), Transacao.id)
    )


def para_resposta(
    transacao: Transacao,
    categoria: Categoria,
) -> TransacaoResponse:
    return TransacaoResponse(
        id=transacao.id,
        tipo=transacao.tipo,
        valor=transacao.valor,
        descricao=transacao.descricao,
        data=transacao.data,
        categoria_id=transacao.categoria_id,
        categoria=CategoriaResponse.model_validate(categoria),
    )


@router.get("", response_model=PaginaTransacoes)
def listar(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 20,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_atual),
):
    base = select(Transacao).where(Transacao.usuario_id == usuario.id)
    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
    rows = db.execute(
        listar_transacoes_usuario(usuario).offset((page - 1) * page_size).limit(page_size)
    ).all()
    return PaginaTransacoes(
        items=[para_resposta(transacao, categoria) for transacao, categoria in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/export")
def exportar(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_atual),
):
    rows = db.execute(listar_transacoes_usuario(usuario)).all()
    buffer = io.StringIO()
    buffer.write("\ufeff")
    writer = csv.writer(buffer, delimiter=";", lineterminator="\r\n")
    writer.writerow(["Data", "Tipo", "Descrição", "Valor", "Categoria"])
    for transacao, categoria in rows:
        writer.writerow([
            transacao.data.strftime("%d/%m/%Y"),
            transacao.tipo,
            transacao.descricao,
            f"{transacao.valor:.2f}".replace(".", ","),
            categoria.nome,
        ])
    return Response(
        content=buffer.getvalue().encode("utf-8"),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="transacoes.csv"'},
    )


@router.post("", response_model=TransacaoResponse, status_code=201)
def criar(
    payload: TransacaoInput,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_atual),
):
    categoria = buscar_categoria_compativel(
        db,
        payload.categoria_id,
        usuario,
        payload.tipo,
    )
    transacao = Transacao(
        usuario_id=usuario.id,
        categoria_id=categoria.id,
        tipo=payload.tipo,
        valor=payload.valor,
        descricao=payload.descricao,
        data=payload.data,
        recorrente=False,
    )
    db.add(transacao)
    db.commit()
    db.refresh(transacao)
    return para_resposta(transacao, categoria)


@router.patch("/{id}", response_model=TransacaoResponse)
def editar(
    id: UUID,
    payload: TransacaoInput,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_atual),
):
    transacao = buscar_transacao(db, id, usuario)
    categoria = buscar_categoria_compativel(
        db,
        payload.categoria_id,
        usuario,
        payload.tipo,
    )
    transacao.categoria_id = categoria.id
    transacao.tipo = payload.tipo
    transacao.valor = payload.valor
    transacao.descricao = payload.descricao
    transacao.data = payload.data
    db.commit()
    db.refresh(transacao)
    return para_resposta(transacao, categoria)


@router.delete("/{id}", status_code=204)
def excluir(
    id: UUID,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_atual),
):
    transacao = buscar_transacao(db, id, usuario)
    db.delete(transacao)
    db.commit()
    return Response(status_code=204)
