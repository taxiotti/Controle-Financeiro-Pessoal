
from datetime import date
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_serializer

from app.schemas.categoria import CategoriaResponse


class TransacaoInput(BaseModel):
    tipo: Literal["receita", "despesa"]
    valor: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    descricao: str = Field(min_length=1, max_length=120)
    data: date
    categoria_id: UUID = Field(alias="categoriaId")
    model_config = ConfigDict(str_strip_whitespace=True, populate_by_name=True)


class TransacaoResponse(BaseModel):
    id: UUID
    tipo: Literal["receita", "despesa"]
    valor: Decimal
    descricao: str
    data: date
    categoria_id: UUID = Field(serialization_alias="categoriaId")
    categoria: CategoriaResponse
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    @field_serializer("valor")
    def serialize_valor(self, valor: Decimal) -> str:
        return f"{valor:.2f}"


class PaginaTransacoes(BaseModel):
    items: list[TransacaoResponse]
    total: int
    page: int
    page_size: int = Field(serialization_alias="pageSize")
    model_config = ConfigDict(populate_by_name=True)
