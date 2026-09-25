
from datetime import date, datetime
from decimal import Decimal
from typing import Annotated
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.api.v1.endpoints.categorias import get_usuario_atual
from app.core.database import get_db
from app.models import Categoria, Transacao, Usuario
from app.schemas.relatorio import Comparativo, FatiaPizza, PontoEvolucao, ResumoMensal

router = APIRouter()
ZERO = Decimal("0.00")


def inicio_mes(ano: int, mes: int) -> date:
    return date(ano, mes, 1)


def proximo_mes(ano: int, mes: int) -> tuple[int, int]:
    return (ano + 1, 1) if mes == 12 else (ano, mes + 1)


def mes_deslocado(ano: int, mes: int, deslocamento: int) -> tuple[int, int]:
    indice = ano * 12 + (mes - 1) + deslocamento
    return indice // 12, indice % 12 + 1


def hoje_local() -> date:
    try:
        return datetime.now(ZoneInfo("America/Sao_Paulo")).date()
    except ZoneInfoNotFoundError:
        return date.today()


def decimal(valor: object | None) -> Decimal:
    return Decimal(str(valor or 0)).quantize(Decimal("0.01"))


def calcular_resumo(db: Session, usuario_id: str, ano: int, mes: int) -> ResumoMensal:
    inicio = inicio_mes(ano, mes)
    fim = inicio_mes(*proximo_mes(ano, mes))
    totais = db.execute(
        select(
            func.coalesce(
                func.sum(case((Transacao.tipo == "receita", Transacao.valor), else_=0)),
                0,
            ).label("receitas"),
            func.coalesce(
                func.sum(case((Transacao.tipo == "despesa", Transacao.valor), else_=0)),
                0,
            ).label("despesas"),
        ).where(
            Transacao.usuario_id == usuario_id,
            Transacao.data >= inicio,
            Transacao.data < fim,
        )
    ).one()
    receitas = decimal(totais.receitas)
    despesas = decimal(totais.despesas)
    return ResumoMensal(
        ano=ano,
        mes=mes,
        total_receitas=receitas,
        total_despesas=despesas,
        saldo=receitas - despesas,
    )


@router.get("/resumo", response_model=ResumoMensal)
def resumo(
    ano: Annotated[int, Query(ge=1, le=9999)],
    mes: Annotated[int, Query(ge=1, le=12)],
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_atual),
):
    return calcular_resumo(db, usuario.id, ano, mes)


@router.get("/pizza", response_model=list[FatiaPizza])
def pizza(
    ano: Annotated[int, Query(ge=1, le=9999)],
    mes: Annotated[int, Query(ge=1, le=12)],
    tipo: Annotated[str, Query(pattern="^(receita|despesa)$")] = "despesa",
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_atual),
):
    inicio = inicio_mes(ano, mes)
    fim = inicio_mes(*proximo_mes(ano, mes))
    total = func.sum(Transacao.valor).label("total")
    linhas = db.execute(
        select(Categoria.id, Categoria.nome, Categoria.cor, total)
        .join(Transacao, Transacao.categoria_id == Categoria.id)
        .where(
            Transacao.usuario_id == usuario.id,
            Transacao.data >= inicio,
            Transacao.data < fim,
            Transacao.tipo == tipo,
        )
        .group_by(Categoria.id, Categoria.nome, Categoria.cor)
        .order_by(total.desc(), Categoria.nome)
    ).all()
    return [
        FatiaPizza(
            categoria_id=linha.id,
            nome=linha.nome,
            cor=linha.cor,
            total=decimal(linha.total),
        )
        for linha in linhas
    ]


@router.get("/evolucao", response_model=list[PontoEvolucao])
def evolucao(
    meses: Annotated[int, Query(ge=1, le=24)] = 6,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_atual),
):
    atual = hoje_local()
    ano_atual, mes_atual = atual.year, atual.month
    periodos = [
        mes_deslocado(ano_atual, mes_atual, deslocamento)
        for deslocamento in range(1 - meses, 1)
    ]
    inicio = inicio_mes(*periodos[0])
    fim = inicio_mes(*proximo_mes(ano_atual, mes_atual))
    lancamentos = db.execute(
        select(Transacao.tipo, Transacao.valor, Transacao.data).where(
            Transacao.usuario_id == usuario.id,
            Transacao.data >= inicio,
            Transacao.data < fim,
        )
    ).all()

    totais: dict[tuple[int, int], dict[str, Decimal]] = {
        periodo: {"receita": ZERO, "despesa": ZERO}
        for periodo in periodos
    }
    for lancamento in lancamentos:
        periodo = (lancamento.data.year, lancamento.data.month)
        if periodo in totais:
            totais[periodo][lancamento.tipo] += decimal(lancamento.valor)

    return [
        PontoEvolucao(
            ano=ano,
            mes=mes,
            total_receitas=totais[(ano, mes)]["receita"],
            total_despesas=totais[(ano, mes)]["despesa"],
        )
        for ano, mes in periodos
    ]


@router.get("/comparativo", response_model=Comparativo)
def comparativo(
    ano: Annotated[int, Query(ge=1, le=9999)],
    mes: Annotated[int, Query(ge=1, le=12)],
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_atual),
):
    atual = calcular_resumo(db, usuario.id, ano, mes)
    ano_anterior, mes_anterior = mes_deslocado(ano, mes, -1)
    anterior = calcular_resumo(db, usuario.id, ano_anterior, mes_anterior)
    return Comparativo(
        atual=atual,
        anterior=anterior,
        variacao_receitas=atual.total_receitas - anterior.total_receitas,
        variacao_despesas=atual.total_despesas - anterior.total_despesas,
        variacao_saldo=atual.saldo - anterior.saldo,
    )
