
from typing import Annotated
import csv
from datetime import date
from decimal import Decimal
from io import StringIO
from typing import Annotated, Literal
from uuid import UUID
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


def criterios_filtrados(
    usuario: Usuario,
    data_inicial: date | None,
    data_final: date | None,
    tipo: Literal["receita", "despesa"] | None,
    categoria_id: UUID | None,
    valor_minimo: Decimal | None,
    valor_maximo: Decimal | None,
):
    if data_inicial and data_final and data_inicial > data_final:
        raise HTTPException(400, "A data inicial não pode ser posterior à data final.")
    if valor_minimo is not None and valor_maximo is not None and valor_minimo > valor_maximo:
        raise HTTPException(400, "O valor mínimo não pode ser maior que o valor máximo.")

    filtros = [Transacao.usuario_id == usuario.id]
    if data_inicial:
        filtros.append(Transacao.data >= data_inicial)
    if data_final:
        filtros.append(Transacao.data <= data_final)
    if tipo:
        filtros.append(Transacao.tipo == tipo)
    if categoria_id:
        filtros.append(Transacao.categoria_id == str(categoria_id))
    if valor_minimo is not None:
        filtros.append(Transacao.valor >= valor_minimo)
    if valor_maximo is not None:
        filtros.append(Transacao.valor <= valor_maximo)
    return filtros


def parametros_filtros(
    data_inicial: Annotated[date | None, Query(alias="from")] = None,
    data_final: Annotated[date | None, Query(alias="to")] = None,
    tipo: Annotated[Literal["receita", "despesa"] | None, Query()] = None,
    categoria_id: Annotated[UUID | None, Query(alias="categoriaId")] = None,
    valor_minimo: Annotated[Decimal | None, Query(alias="minValor", ge=0)] = None,
    valor_maximo: Annotated[Decimal | None, Query(alias="maxValor", ge=0)] = None,
):
    return data_inicial, data_final, tipo, categoria_id, valor_minimo, valor_maximo

@router.get("", response_model=PaginaTransacoes)
def listar(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 20,
    filtros: tuple[
        date | None,
        date | None,
        Literal["receita", "despesa"] | None,
        UUID | None,
        Decimal | None,
        Decimal | None
    ] = Depends(parametros_filtros),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_atual),
):
    criterios = criterios_filtrados(usuario, *filtros)
    base = select(Transacao).where(*criterios)
    total = db.scalar(
        select(func.count()).select_from(base.subquery())
    ) or 0
    rows = db.execute(
        select(Transacao, Categoria)
        .join(Categoria, Categoria.id == Transacao.categoria_id)
        .where(*criterios)
        .order_by(
            Transacao.data.desc(),
            Transacao.criado_em.desc(),
            Transacao.id
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()

    return PaginaTransacoes(
        items=[
            para_resposta(transacao, categoria)
            for transacao, categoria in rows
        ],
        total=total,
        page=page,
        page_size=page_size,
    )

@router.get("/export", response_class=Response)
def exportar(
    filtros: tuple[
        date | None,
        date | None,
        Literal["receita", "despesa"] | None,
        UUID | None,
        Decimal | None,
        Decimal | None
    ] = Depends(parametros_filtros),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_atual),
):
    criterios = criterios_filtrados(usuario, *filtros)

    rows = db.execute(
        select(Transacao, Categoria)
        .join(Categoria, Categoria.id == Transacao.categoria_id)
        .where(*criterios)
        .order_by(
            Transacao.data.desc(),
            Transacao.criado_em.desc(),
            Transacao.id
        )
    ).all()

    stream = StringIO(newline="")
    stream.write("\ufeff")

    writer = csv.writer(
        stream,
        delimiter=";",
        lineterminator="\r\n"
    )

    writer.writerow([
        "Descrição",
        "Data",
        "Categoria",
        "Tipo",
        "Valor"
    ])

    for transacao, categoria in rows:
        writer.writerow([
            transacao.descricao,
            transacao.data.strftime("%d/%m/%Y"),
            categoria.nome,
            "Receita" if transacao.tipo == "receita" else "Despesa",
            f"{transacao.valor:.2f}".replace(".", ","),
        ])

    return Response(
        content=stream.getvalue().encode("utf-8"),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": 'attachment; filename="transacoes.csv"'
        },
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
