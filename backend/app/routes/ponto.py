from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_role
from app.models.usuario import Usuario
from app.schemas.ponto import PontoCreate, PontoResponse, PontoUpdate, TotaisPonto
from app.services import ponto_service

router = APIRouter(prefix="/ponto", tags=["Ponto"])


def _usuario_id_permitido(usuario_id: int | None, current_user: Usuario) -> int | None:
    if current_user.perfil == "gestor":
        return usuario_id
    if usuario_id and usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado para este perfil")
    return current_user.id


def _verificar_acesso_usuario(usuario_id: int, current_user: Usuario) -> None:
    if current_user.perfil != "gestor" and usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado para este perfil")


@router.get("/totais", response_model=TotaisPonto)
def totais(
    usuario_id: int | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor", "recepcionista", "medico")),
):
    usuario_id = _usuario_id_permitido(usuario_id, current_user)
    return ponto_service.obter_totais(db, usuario_id, data_inicio, data_fim)


@router.get("", response_model=list[PontoResponse])
def listar(
    usuario_id: int | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor", "recepcionista", "medico")),
):
    usuario_id = _usuario_id_permitido(usuario_id, current_user)
    return ponto_service.listar_pontos(
        db, usuario_id=usuario_id, data_inicio=data_inicio,
        data_fim=data_fim, skip=skip, limit=limit
    )


@router.post("", response_model=PontoResponse, status_code=201)
def criar(
    payload: PontoCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor", "recepcionista", "medico")),
):
    _verificar_acesso_usuario(payload.usuario_id, current_user)
    ip = request.client.host if request.client else None
    return ponto_service.criar_ponto(db, payload.model_dump(), current_user.id, ip)


@router.get("/{ponto_id}", response_model=PontoResponse)
def buscar(
    ponto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor", "recepcionista", "medico")),
):
    ponto = ponto_service.buscar_ponto(db, ponto_id)
    _verificar_acesso_usuario(ponto.usuario_id, current_user)
    return ponto


@router.patch("/{ponto_id}", response_model=PontoResponse)
def atualizar(
    ponto_id: int,
    payload: PontoUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor", "recepcionista", "medico")),
):
    ponto = ponto_service.buscar_ponto(db, ponto_id)
    _verificar_acesso_usuario(ponto.usuario_id, current_user)
    ip = request.client.host if request.client else None
    return ponto_service.atualizar_ponto(
        db, ponto_id, payload.model_dump(exclude_none=True), current_user.id, ip
    )
