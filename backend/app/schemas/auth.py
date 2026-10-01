from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegistroInput(BaseModel):
    nome: str = Field(min_length=2, max_length=80)
    email: EmailStr
    senha: str = Field(min_length=8, max_length=128)
    model_config = ConfigDict(str_strip_whitespace=True)


class LoginInput(BaseModel):
    email: EmailStr
    senha: str = Field(min_length=1, max_length=128)
    model_config = ConfigDict(str_strip_whitespace=True)


class UsuarioPublico(BaseModel):
    id: UUID
    nome: str
    email: str
    model_config = ConfigDict(from_attributes=True)


class SessaoResponse(BaseModel):
    access_token: str = Field(serialization_alias="accessToken")
    token_type: str = Field(default="bearer", serialization_alias="tokenType")
    usuario: UsuarioPublico
    model_config = ConfigDict(populate_by_name=True)
