from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field, field_serializer


class ValoresMonetarios(BaseModel):
    total_receitas: Decimal = Field(serialization_alias="totalReceitas")
    total_despesas: Decimal = Field(serialization_alias="totalDespesas")
    saldo: Decimal

    @field_serializer("total_receitas", "total_despesas", "saldo")
    def serializar_decimal(self, valor: Decimal) -> str:
        return f"{valor:.2f}"


class ResumoMensal(ValoresMonetarios):
    ano: int
    mes: int


class FatiaPizza(BaseModel):
    categoria_id: UUID = Field(serialization_alias="categoriaId")
    nome: str
    cor: str
    total: Decimal

    @field_serializer("total")
    def serializar_total(self, valor: Decimal) -> str:
        return f"{valor:.2f}"


class PontoEvolucao(BaseModel):
    ano: int
    mes: int
    total_receitas: Decimal = Field(serialization_alias="totalReceitas")
    total_despesas: Decimal = Field(serialization_alias="totalDespesas")

    @field_serializer("total_receitas", "total_despesas")
    def serializar_total(self, valor: Decimal) -> str:
        return f"{valor:.2f}"


class Comparativo(BaseModel):
    atual: ResumoMensal
    anterior: ResumoMensal
    variacao_receitas: Decimal = Field(serialization_alias="variacaoReceitas")
    variacao_despesas: Decimal = Field(serialization_alias="variacaoDespesas")
    variacao_saldo: Decimal = Field(serialization_alias="variacaoSaldo")

    @field_serializer(
        "variacao_receitas",
        "variacao_despesas",
        "variacao_saldo",
    )
    def serializar_variacao(self, valor: Decimal) -> str:
        return f"{valor:.2f}"
