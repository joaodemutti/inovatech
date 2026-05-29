from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr


class UsuarioCreate(BaseModel):
    nome: str
    perfil: Literal["gestor", "recepcionista", "medico", "paciente"]
    login: str
    email: EmailStr
    password: str
    status: Literal["ativo", "inativo"] = "ativo"
    modulos_permitidos: list[str] | None = None
    observacao: str | None = None


class UsuarioUpdate(BaseModel):
    nome: str | None = None
    perfil: Literal["gestor", "recepcionista", "medico", "paciente"] | None = None
    email: EmailStr | None = None
    status: Literal["ativo", "inativo"] | None = None
    modulos_permitidos: list[str] | None = None
    observacao: str | None = None
    password: str | None = None


class UsuarioResponse(BaseModel):
    id: int
    nome: str
    perfil: str
    login: str
    email: str
    status: str
    ultimo_acesso: datetime | None
    modulos_permitidos: list | None
    observacao: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
