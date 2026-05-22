from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.lancamento_financeiro import LancamentoFinanceiro
from app.schemas.financeiro import IndicadoresFinanceiros


def buscar_por_id(db: Session, lancamento_id: int) -> LancamentoFinanceiro | None:
    return db.get(LancamentoFinanceiro, lancamento_id)


def listar(db: Session, skip: int = 0, limit: int = 100) -> list[LancamentoFinanceiro]:
    return (
        db.query(LancamentoFinanceiro)
        .order_by(LancamentoFinanceiro.data.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def criar(db: Session, dados: dict) -> LancamentoFinanceiro:
    lancamento = LancamentoFinanceiro(**dados)
    db.add(lancamento)
    db.commit()
    db.refresh(lancamento)
    return lancamento


def atualizar(
    db: Session, lancamento: LancamentoFinanceiro, dados: dict
) -> LancamentoFinanceiro:
    for campo, valor in dados.items():
        setattr(lancamento, campo, valor)
    db.commit()
    db.refresh(lancamento)
    return lancamento


def calcular_indicadores(db: Session) -> IndicadoresFinanceiros:
    def soma_por_status(status: str) -> Decimal:
        resultado = (
            db.query(func.sum(LancamentoFinanceiro.valor))
            .filter(LancamentoFinanceiro.status == status)
            .scalar()
        )
        return Decimal(str(resultado or 0))

    receita_paga = soma_por_status("pago")
    a_receber = soma_por_status("pendente")
    atrasado = soma_por_status("atrasado")
    total_lancado = receita_paga + a_receber + atrasado

    return IndicadoresFinanceiros(
        receita_paga=receita_paga,
        a_receber=a_receber,
        atrasado=atrasado,
        total_lancado=total_lancado,
    )
