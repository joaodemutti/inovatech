from datetime import date, time

from sqlalchemy import Date, Enum, ForeignKey, Numeric, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class RegistroPonto(Base):
    __tablename__ = "registros_ponto"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    data: Mapped[date] = mapped_column(Date, nullable=False)
    entrada: Mapped[time | None] = mapped_column(Time, nullable=True)
    saida: Mapped[time | None] = mapped_column(Time, nullable=True)
    h_trabalhadas: Mapped[float | None] = mapped_column(
        Numeric(4, 2), nullable=True
    )
    h_esperadas: Mapped[float] = mapped_column(
        Numeric(4, 2), default=8.0, nullable=False
    )
    diferenca: Mapped[float | None] = mapped_column(Numeric(4, 2), nullable=True)
    situacao: Mapped[str | None] = mapped_column(
        Enum(
            "normal",
            "atraso",
            "falta",
            "h_extra",
            name="situacao_ponto_enum",
        ),
        nullable=True,
    )

    usuario = relationship("Usuario", foreign_keys=[usuario_id])
