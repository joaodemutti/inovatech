from datetime import date, datetime, time
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel


class ConsultaCreate(BaseModel):
    paciente_id: int
    medico_id: int
    data: date
    horario: time
    tipo_consulta: str
    convenio: str | None = None
    valor: Decimal


class ConsultaUpdate(BaseModel):
    data: date | None = None
    horario: time | None = None
    tipo_consulta: str | None = None
    convenio: str | None = None
    valor: Decimal | None = None
    status: Literal["agendada", "confirmada", "realizada", "cancelada"] | None = None


class ConsultaResponse(BaseModel):
    id: int
    paciente_id: int
    medico_id: int
    data: date
    horario: time
    tipo_consulta: str
    convenio: str | None
    valor: Decimal
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
