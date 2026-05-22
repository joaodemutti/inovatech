from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_role
from app.models.usuario import Usuario
from app.schemas.financeiro import (
    IndicadoresFinanceiros,
    LancamentoCreate,
    LancamentoResponse,
    LancamentoUpdate,
)
from app.services import financeiro_service

router = APIRouter(prefix="/financeiro", tags=["Financeiro"])


@router.get("/indicadores", response_model=IndicadoresFinanceiros)
def indicadores(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_role("gestor")),
):
    return financeiro_service.obter_indicadores(db)


@router.get("", response_model=list[LancamentoResponse])
def listar(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_role("gestor")),
):
    return financeiro_service.listar_lancamentos(db, skip=skip, limit=limit)


@router.post("", response_model=LancamentoResponse, status_code=201)
def criar(
    payload: LancamentoCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    ip = request.client.host if request.client else None
    return financeiro_service.criar_lancamento(db, payload.model_dump(), current_user.id, ip)


@router.patch("/{lancamento_id}", response_model=LancamentoResponse)
def atualizar(
    lancamento_id: int,
    payload: LancamentoUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    ip = request.client.host if request.client else None
    return financeiro_service.atualizar_lancamento(
        db, lancamento_id, payload.model_dump(exclude_none=True), current_user.id, ip
    )
