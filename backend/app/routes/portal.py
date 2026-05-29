from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
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
    current_user: Usuario = Depends(require_role("paciente")),
):
    paciente = _get_paciente_do_usuario(db, current_user)
    prontuario = prontuario_service.buscar_prontuario(db, prontuario_id)
    if prontuario.paciente_id != paciente.id:
        raise HTTPException(status_code=404, detail="Prontuário não encontrado")
    if not prontuario.laudo_liberado:
        raise HTTPException(status_code=403, detail="Laudo não liberado pelo médico responsável")

    arquivo = prontuario_service.gerar_pdf_laudo(prontuario)
    return StreamingResponse(
        arquivo,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=laudo-{prontuario.id}.pdf"},
    )
