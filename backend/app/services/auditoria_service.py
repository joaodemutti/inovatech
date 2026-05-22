from sqlalchemy.orm import Session

from app.repositories import auditoria_repository


def registrar_acao(
    db: Session,
    acao: str,
    modulo: str,
    resultado: str,
    usuario_id: int | None = None,
    ip: str | None = None,
    detalhes: str | None = None,
) -> None:
    try:
        auditoria_repository.criar_log(
            db=db,
            usuario_id=usuario_id,
            acao=acao,
            modulo=modulo,
            ip=ip,
            resultado=resultado,
            detalhes=detalhes,
        )
    except Exception:
        pass
