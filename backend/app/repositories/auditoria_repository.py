from datetime import datetime

from sqlalchemy.orm import Session

from app.models.log_auditoria import LogAuditoria


def criar_log(
    db: Session,
    usuario_id: int | None,
    acao: str,
    modulo: str,
    ip: str | None,
    resultado: str,
    detalhes: str | None,
) -> LogAuditoria:
    log = LogAuditoria(
        usuario_id=usuario_id,
        acao=acao,
        modulo=modulo,
        ip=ip,
        resultado=resultado,
        detalhes=detalhes,
        data_hora=datetime.utcnow(),
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def listar_logs(
    db: Session,
    usuario_id: int | None = None,
    modulo: str | None = None,
    resultado: str | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[LogAuditoria]:
    q = db.query(LogAuditoria)
    if usuario_id:
        q = q.filter(LogAuditoria.usuario_id == usuario_id)
    if modulo:
        q = q.filter(LogAuditoria.modulo == modulo)
    if resultado:
        q = q.filter(LogAuditoria.resultado == resultado)
    return q.order_by(LogAuditoria.data_hora.desc()).offset(skip).limit(limit).all()
