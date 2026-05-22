from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.lancamento_financeiro import LancamentoFinanceiro
from app.repositories import financeiro_repository
from app.schemas.financeiro import IndicadoresFinanceiros
from app.services import auditoria_service


def listar_lancamentos(
    db: Session, skip: int = 0, limit: int = 100
) -> list[LancamentoFinanceiro]:
    return financeiro_repository.listar(db, skip=skip, limit=limit)


def buscar_lancamento(db: Session, lancamento_id: int) -> LancamentoFinanceiro:
    lancamento = financeiro_repository.buscar_por_id(db, lancamento_id)
    if not lancamento:
        raise HTTPException(status_code=404, detail="Lançamento não encontrado")
    return lancamento


def criar_lancamento(
    db: Session, dados: dict, usuario_id: int, ip: str | None = None
) -> LancamentoFinanceiro:
    lancamento = financeiro_repository.criar(db, dados)
    auditoria_service.registrar_acao(
        db=db,
        acao="criar",
        modulo="financeiro",
        resultado="sucesso",
        usuario_id=usuario_id,
        ip=ip,
        detalhes=f"Lançamento financeiro criado: {lancamento.id}",
    )
    return lancamento


def atualizar_lancamento(
    db: Session,
    lancamento_id: int,
    dados: dict,
    usuario_id: int,
    ip: str | None = None,
) -> LancamentoFinanceiro:
    lancamento = buscar_lancamento(db, lancamento_id)
    lancamento = financeiro_repository.atualizar(db, lancamento, dados)
    auditoria_service.registrar_acao(
        db=db,
        acao="editar",
        modulo="financeiro",
        resultado="sucesso",
        usuario_id=usuario_id,
        ip=ip,
        detalhes=f"Lançamento {lancamento_id} atualizado",
    )
    return lancamento


def obter_indicadores(db: Session) -> IndicadoresFinanceiros:
    return financeiro_repository.calcular_indicadores(db)
