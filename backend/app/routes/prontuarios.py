from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_role
from app.models.usuario import Usuario
from app.repositories import prontuario_repository
from app.schemas.prontuario import ProntuarioCreate, ProntuarioResponse, ProntuarioUpdate
from app.services import prontuario_service

router = APIRouter(prefix="/prontuarios", tags=["Prontuários"])


@router.get("", response_model=list[ProntuarioResponse])
def listar(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_role("gestor", "medico")),
):
    return prontuario_service.listar_prontuarios(db, skip=skip, limit=limit)


@router.post("", response_model=ProntuarioResponse, status_code=201)
def criar(
    payload: ProntuarioCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor", "medico")),
):
    ip = request.client.host if request.client else None
    return prontuario_service.criar_prontuario(db, payload.model_dump(), current_user, ip)


@router.get("/paciente/{paciente_id}", response_model=list[ProntuarioResponse])
def historico_paciente(
    paciente_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_role("gestor", "medico")),
):
    return prontuario_repository.listar_por_paciente(db, paciente_id)


@router.get("/{prontuario_id}", response_model=ProntuarioResponse)
def buscar(
    prontuario_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_role("gestor", "medico")),
):
    return prontuario_service.buscar_prontuario(db, prontuario_id)


@router.patch("/{prontuario_id}", response_model=ProntuarioResponse)
def atualizar(
    prontuario_id: int,
    payload: ProntuarioUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor", "medico")),
):
    ip = request.client.host if request.client else None
    return prontuario_service.atualizar_prontuario(
        db, prontuario_id, payload.model_dump(exclude_none=True), current_user.id, ip
    )


@router.patch("/{prontuario_id}/liberar-laudo", response_model=ProntuarioResponse)
def liberar_laudo(
    prontuario_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor", "medico")),
):
    ip = request.client.host if request.client else None
    return prontuario_service.liberar_laudo(db, prontuario_id, current_user.id, ip)
