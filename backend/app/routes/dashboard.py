from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.consulta import Consulta
from app.models.lancamento_financeiro import LancamentoFinanceiro
from app.models.paciente import Paciente
from app.models.usuario import Usuario

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/indicadores")
def indicadores(
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
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

    return {
        "total_pacientes": total_pacientes,
        "consultas_hoje": consultas_hoje,
        "receita_mes": float(receita_mes),
        "valores_pendentes": float(valores_pendentes),
    }
