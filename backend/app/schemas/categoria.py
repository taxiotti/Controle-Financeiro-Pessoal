
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CategoriaInput(BaseModel):
    nome: str = Field(min_length=2, max_length=40)
    tipo: Literal["receita", "despesa", "ambos"]
    cor: str = Field(pattern=r"^#[0-9A-Fa-f]{6}$")
    icone: str
    model_config = ConfigDict(str_strip_whitespace=True)


class CategoriaResponse(BaseModel):
    id: UUID
    nome: str
    tipo: Literal["receita", "despesa", "ambos"]
    cor: str
    icone: str
    padrao: bool
    model_config = ConfigDict(from_attributes=True)
