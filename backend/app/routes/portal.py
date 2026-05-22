from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_role
from app.models.usuario import Usuario
from app.repositories import consulta_repository, paciente_repository, prontuario_repository
from app.schemas.consulta import ConsultaResponse
from app.schemas.prontuario import ProntuarioResponse
from app.services import prontuario_service

router = APIRouter(prefix="/portal", tags=["Portal do Paciente"])


def _get_paciente_do_usuario(db: Session, usuario: Usuario):
    # Encontra o paciente cujo email da pessoa coincide com o email do usuário
    pacientes = paciente_repository.listar(db, limit=10000)
    for p in pacientes:
        if p.pessoa.email == usuario.email:
            return p
    raise HTTPException(
        status_code=404,
        detail="Paciente não encontrado para este usuário",
    )


@router.get("/consultas", response_model=list[ConsultaResponse])
def minhas_consultas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("paciente")),
):
    paciente = _get_paciente_do_usuario(db, current_user)
    return consulta_repository.listar_por_paciente(db, paciente.id)


@router.get("/laudos", response_model=list[ProntuarioResponse])
def meus_laudos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("paciente")),
):
    paciente = _get_paciente_do_usuario(db, current_user)
    return prontuario_repository.listar_laudos_liberados(db, paciente.id)


@router.get("/laudos/{prontuario_id}/download")
def download_laudo(
    prontuario_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_role("paciente")),
):
    # RN02: bloqueia se laudo não estiver liberado
    prontuario = prontuario_service.verificar_laudo_liberado(db, prontuario_id)
    return {
        "id": prontuario.id,
        "cid": prontuario.cid,
        "diagnostico": prontuario.diagnostico,
        "prescricao": prontuario.prescricao,
        "data": prontuario.data,
        "laudo_liberado": prontuario.laudo_liberado,
    }
