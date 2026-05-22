from datetime import date, time
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel


class PontoCreate(BaseModel):
    usuario_id: int
    data: date
    entrada: time | None = None
    saida: time | None = None
    h_esperadas: Decimal = Decimal("8.0")


class PontoUpdate(BaseModel):
    entrada: time | None = None
    saida: time | None = None
    h_esperadas: Decimal | None = None


class PontoResponse(BaseModel):
    id: int
    usuario_id: int
    data: date
    entrada: time | None
    saida: time | None
    h_trabalhadas: Decimal | None
    h_esperadas: Decimal
    diferenca: Decimal | None
    situacao: str | None

    model_config = {"from_attributes": True}


class TotaisPonto(BaseModel):
    total_registros: int
    total_horas_trabalhadas: Decimal
    total_horas_esperadas: Decimal
    total_diferenca: Decimal
    faltas: int
    atrasos: int
    horas_extras: int
    normais: int
