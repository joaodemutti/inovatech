from datetime import date
from typing import Literal

from pydantic import BaseModel


class MedicoCreate(BaseModel):
    nome_completo: str
    cpf: str
    telefone: str | None = None
    email: str | None = None
    crm: str
    especialidade: str
    data_formatura: date | None = None


class MedicoUpdate(BaseModel):
    nome_completo: str | None = None
    telefone: str | None = None
    email: str | None = None
    especialidade: str | None = None
    data_formatura: date | None = None
    status: Literal["ativo", "inativo"] | None = None


class MedicoResponse(BaseModel):
    id: int
    pessoa_id: int
    nome_completo: str
    cpf: str
    telefone: str | None
    email: str | None
    status: str
    crm: str
    especialidade: str
    data_formatura: date | None

    model_config = {"from_attributes": True}
