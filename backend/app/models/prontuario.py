from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Prontuario(Base):
    __tablename__ = "prontuarios"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    paciente_id: Mapped[int] = mapped_column(ForeignKey("pacientes.id"), nullable=False)
    medico_id: Mapped[int] = mapped_column(ForeignKey("medicos.id"), nullable=False)
    data: Mapped[date] = mapped_column(Date, nullable=False)
    cid: Mapped[str] = mapped_column(String, nullable=False)
    diagnostico: Mapped[str] = mapped_column(Text, nullable=False)
    prescricao: Mapped[str] = mapped_column(Text, nullable=False)
    retorno_em_dias: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    laudo_liberado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime, onupdate=func.now(), nullable=True
    )

    paciente = relationship("Paciente", foreign_keys=[paciente_id])
    medico = relationship("Medico", foreign_keys=[medico_id])
