from datetime import date

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_role
from app.models.consulta import Consulta
from app.models.lancamento_financeiro import LancamentoFinanceiro
from app.models.paciente import Paciente
from app.models.usuario import Usuario

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


class IndicadoresDashboard(BaseModel):
    total_pacientes: int
    consultas_hoje: int
    receita_mes: float
    valores_pendentes: float

    model_config = {
        "json_schema_extra": {
            "example": {
                "total_pacientes": 42,
                "consultas_hoje": 8,
                "receita_mes": 12500.00,
                "valores_pendentes": 3200.00,
            }
        }
    }


@router.get("/indicadores", response_model=IndicadoresDashboard)
def indicadores(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_role("gestor", "recepcionista", "medico")),
):
    total_pacientes = db.query(func.count(Paciente.id)).scalar() or 0

    hoje = date.today()
    consultas_hoje = (
        db.query(func.count(Consulta.id))
        .filter(Consulta.data == hoje)
        .scalar()
        or 0
    )

    mes_inicio = date(hoje.year, hoje.month, 1)
    receita_mes = (
        db.query(func.sum(LancamentoFinanceiro.valor))
        .filter(
            LancamentoFinanceiro.status == "pago",
            LancamentoFinanceiro.data >= mes_inicio,
        )
        .scalar()
        or 0.0
    )

    valores_pendentes = (
        db.query(func.sum(LancamentoFinanceiro.valor))
        .filter(LancamentoFinanceiro.status == "pendente")
        .scalar()
        or 0.0
    )

    return IndicadoresDashboard(
        total_pacientes=total_pacientes,
        consultas_hoje=consultas_hoje,
        receita_mes=float(receita_mes),
        valores_pendentes=float(valores_pendentes),
    )
