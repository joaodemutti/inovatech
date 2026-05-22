from datetime import date
from typing import Literal

from pydantic import BaseModel


class PacienteCreate(BaseModel):
    nome_completo: str
    cpf: str
    telefone: str | None = None
    email: str | None = None
    data_nascimento: date | None = None
    convenio: str | None = None
    endereco: str | None = None


class PacienteUpdate(BaseModel):
    nome_completo: str | None = None
    telefone: str | None = None
    email: str | None = None
    data_nascimento: date | None = None
    convenio: str | None = None
    endereco: str | None = None
    status: Literal["ativo", "inativo"] | None = None


class PacienteResponse(BaseModel):
    id: int
    pessoa_id: int
    nome_completo: str
    cpf: str
    telefone: str | None
    email: str | None
    status: str
    data_nascimento: date | None
    convenio: str | None
    endereco: str | None

    model_config = {"from_attributes": True}
