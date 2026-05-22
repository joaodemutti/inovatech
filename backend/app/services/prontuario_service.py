from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.prontuario import Prontuario
from app.repositories import prontuario_repository
from app.services import auditoria_service


def listar_prontuarios(db: Session, skip: int = 0, limit: int = 100) -> list[Prontuario]:
    return prontuario_repository.listar(db, skip=skip, limit=limit)


def buscar_prontuario(db: Session, prontuario_id: int) -> Prontuario:
    prontuario = prontuario_repository.buscar_por_id(db, prontuario_id)
    if not prontuario:
        raise HTTPException(status_code=404, detail="Prontuário não encontrado")
    return prontuario


def criar_prontuario(
    db: Session, dados: dict, usuario_id: int, ip: str | None = None
) -> Prontuario:
    prontuario = prontuario_repository.criar(db, dados)
    auditoria_service.registrar_acao(
        db=db,
        acao="criar",
        modulo="prontuario",
        resultado="sucesso",
        usuario_id=usuario_id,
        ip=ip,
        detalhes=f"Prontuário criado: {prontuario.id}",
    )
    return prontuario


def atualizar_prontuario(
    db: Session,
    prontuario_id: int,
    dados: dict,
    usuario_id: int,
    ip: str | None = None,
) -> Prontuario:
    prontuario = buscar_prontuario(db, prontuario_id)
    prontuario = prontuario_repository.atualizar(db, prontuario, dados)
    auditoria_service.registrar_acao(
        db=db,
        acao="editar",
        modulo="prontuario",
        resultado="sucesso",
        usuario_id=usuario_id,
        ip=ip,
        detalhes=f"Prontuário {prontuario_id} editado",
    )
    return prontuario


def liberar_laudo(
    db: Session, prontuario_id: int, usuario_id: int, ip: str | None = None
) -> Prontuario:
    prontuario = buscar_prontuario(db, prontuario_id)
    prontuario = prontuario_repository.atualizar(
        db, prontuario, {"laudo_liberado": True}
    )
    auditoria_service.registrar_acao(
        db=db,
        acao="editar",
        modulo="prontuario",
        resultado="sucesso",
        usuario_id=usuario_id,
        ip=ip,
        detalhes=f"Laudo liberado para prontuário {prontuario_id}",
    )
    return prontuario


def verificar_laudo_liberado(db: Session, prontuario_id: int) -> Prontuario:
    # RN02: verifica se o laudo está liberado antes de permitir download
    prontuario = buscar_prontuario(db, prontuario_id)
    if not prontuario.laudo_liberado:
        raise HTTPException(
            status_code=403,
            detail="Laudo não liberado pelo médico responsável",
        )
    return prontuario
