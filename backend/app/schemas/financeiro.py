from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel


class LancamentoCreate(BaseModel):
    consulta_id: int | None = None
    paciente_id: int
    medico_id: int | None = None
    data: date
    servico: str
    convenio: str | None = None
    valor: Decimal
    forma_pagamento: str | None = None
    observacao: str | None = None


class LancamentoUpdate(BaseModel):
    status: Literal["pago", "pendente", "atrasado"] | None = None
    forma_pagamento: str | None = None
    observacao: str | None = None
    valor: Decimal | None = None


class LancamentoResponse(BaseModel):
    id: int
    consulta_id: int | None
    paciente_id: int
    medico_id: int | None
    data: date
    servico: str
    convenio: str | None
    valor: Decimal
    status: str
    forma_pagamento: str | None
    observacao: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class IndicadoresFinanceiros(BaseModel):
    receita_paga: Decimal
    a_receber: Decimal
    atrasado: Decimal
    total_lancado: Decimal

    model_config = {
        "json_schema_extra": {
            "example": {
                "receita_paga": 1500.00,
                "a_receber": 600.00,
                "atrasado": 400.00,
                "total_lancado": 2500.00,
            }
        }
    }
