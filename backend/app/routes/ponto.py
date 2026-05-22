from datetime import date

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user, require_role
from app.models.usuario import Usuario
from app.schemas.ponto import PontoCreate, PontoResponse, PontoUpdate, TotaisPonto
from app.services import ponto_service

router = APIRouter(prefix="/ponto", tags=["Ponto"])


@router.get("/totais", response_model=TotaisPonto)
def totais(
    usuario_id: int | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_role("gestor")),
):
    return ponto_service.obter_totais(db, usuario_id, data_inicio, data_fim)


@router.get("", response_model=list[PontoResponse])
def listar(
    usuario_id: int | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    return ponto_service.listar_pontos(
        db, usuario_id=usuario_id, data_inicio=data_inicio,
        data_fim=data_fim, skip=skip, limit=limit
    )


@router.post("", response_model=PontoResponse, status_code=201)
def criar(
    payload: PontoCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    ip = request.client.host if request.client else None
    return ponto_service.criar_ponto(db, payload.model_dump(), current_user.id, ip)


@router.get("/{ponto_id}", response_model=PontoResponse)
def buscar(
    ponto_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    return ponto_service.buscar_ponto(db, ponto_id)


@router.patch("/{ponto_id}", response_model=PontoResponse)
def atualizar(
    ponto_id: int,
    payload: PontoUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    ip = request.client.host if request.client else None
    return ponto_service.atualizar_ponto(
        db, ponto_id, payload.model_dump(exclude_none=True), current_user.id, ip
    )
