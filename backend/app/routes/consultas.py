from datetime import date

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user, require_role
from app.models.usuario import Usuario
from app.schemas.consulta import ConsultaCreate, ConsultaResponse, ConsultaUpdate
from app.services import consulta_service

router = APIRouter(prefix="/consultas", tags=["Consultas"])


@router.get("/hoje", response_model=list[ConsultaResponse])
def hoje(
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    return consulta_service.listar_consultas(db, data=date.today(), limit=1000)


@router.get("", response_model=list[ConsultaResponse])
def listar(
    data: date | None = None,
    medico_id: int | None = None,
    status: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    return consulta_service.listar_consultas(
        db, data=data, medico_id=medico_id, status=status, skip=skip, limit=limit
    )


@router.post("", response_model=ConsultaResponse, status_code=201)
def criar(
    payload: ConsultaCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    ip = request.client.host if request.client else None
    return consulta_service.criar_consulta(
        db, payload.model_dump(), current_user.id, ip
    )


@router.get("/{consulta_id}", response_model=ConsultaResponse)
def buscar(
    consulta_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    return consulta_service.buscar_consulta(db, consulta_id)


@router.patch("/{consulta_id}", response_model=ConsultaResponse)
def atualizar(
    consulta_id: int,
    payload: ConsultaUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    ip = request.client.host if request.client else None
    return consulta_service.atualizar_consulta(
        db, consulta_id, payload.model_dump(exclude_none=True), current_user.id, ip
    )


@router.delete("/{consulta_id}", status_code=204)
def excluir(
    consulta_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor", "recepcionista")),
):
    ip = request.client.host if request.client else None
    consulta_service.excluir_consulta(db, consulta_id, current_user.id, ip)
