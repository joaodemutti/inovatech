from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_role
from app.models.usuario import Usuario
from app.repositories import auditoria_repository
from app.services import auditoria_service

router = APIRouter(prefix="/admin", tags=["Administrativo"])


@router.get("/log-auditoria")
def listar_logs(
    usuario_id: int | None = None,
    modulo: str | None = None,
    resultado: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_role("gestor")),
):
    logs = auditoria_repository.listar_logs(
        db, usuario_id=usuario_id, modulo=modulo, resultado=resultado,
        skip=skip, limit=limit
    )
    return logs


@router.get("/backup")
def backup(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    ip = request.client.host if request.client else None
    auditoria_service.registrar_acao(
        db=db, acao="backup", modulo="admin", resultado="sucesso",
        usuario_id=current_user.id, ip=ip,
        detalhes="Backup manual solicitado",
    )
    return {"message": "Backup registrado com sucesso"}
