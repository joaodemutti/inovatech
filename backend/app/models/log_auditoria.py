from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class LogAuditoria(Base):
    __tablename__ = "log_auditoria"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    data_hora: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    usuario_id: Mapped[int | None] = mapped_column(
        ForeignKey("usuarios.id"), nullable=True
    )
    acao: Mapped[str] = mapped_column(String, nullable=False)
    modulo: Mapped[str] = mapped_column(String, nullable=False)
    ip: Mapped[str | None] = mapped_column(String, nullable=True)
    resultado: Mapped[str] = mapped_column(
        Enum("sucesso", "falha", name="resultado_auditoria_enum"),
        nullable=False,
    )
    detalhes: Mapped[str | None] = mapped_column(Text, nullable=True)

    usuario = relationship("Usuario", foreign_keys=[usuario_id])
