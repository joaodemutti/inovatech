from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class LancamentoFinanceiro(Base):
    __tablename__ = "lancamentos_financeiros"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    consulta_id: Mapped[int | None] = mapped_column(
        ForeignKey("consultas.id"), nullable=True
    )
    paciente_id: Mapped[int] = mapped_column(ForeignKey("pacientes.id"), nullable=False)
    medico_id: Mapped[int | None] = mapped_column(
        ForeignKey("medicos.id"), nullable=True
    )
    data: Mapped[date] = mapped_column(Date, nullable=False)
    servico: Mapped[str] = mapped_column(String, nullable=False)
    convenio: Mapped[str | None] = mapped_column(String, nullable=True)
    valor: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("pago", "pendente", "atrasado", name="status_financeiro_enum"),
        default="pendente",
        nullable=False,
    )
    forma_pagamento: Mapped[str | None] = mapped_column(String, nullable=True)
    observacao: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime, onupdate=func.now(), nullable=True
    )

    consulta = relationship("Consulta", foreign_keys=[consulta_id])
    paciente = relationship("Paciente", foreign_keys=[paciente_id])
    medico = relationship("Medico", foreign_keys=[medico_id])
