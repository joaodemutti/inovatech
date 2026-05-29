from datetime import date, datetime

from pydantic import BaseModel


class ProntuarioCreate(BaseModel):
    paciente_id: int
    medico_id: int | None = None
    data: date
    cid: str
    diagnostico: str
    prescricao: str
    retorno_em_dias: int = 0


class ProntuarioUpdate(BaseModel):
    cid: str | None = None
    diagnostico: str | None = None
    prescricao: str | None = None
    retorno_em_dias: int | None = None


class ProntuarioResponse(BaseModel):
    id: int
    paciente_id: int
    medico_id: int
    data: date
    cid: str
    diagnostico: str
    prescricao: str
    retorno_em_dias: int
    laudo_liberado: bool
    created_at: datetime

    model_config = {"from_attributes": True}
