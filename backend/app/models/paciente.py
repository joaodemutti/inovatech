from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Paciente(Base):
    __tablename__ = "pacientes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    pessoa_id: Mapped[int] = mapped_column(ForeignKey("pessoas.id"), nullable=False)
    data_nascimento: Mapped[date | None] = mapped_column(Date, nullable=True)
    convenio: Mapped[str | None] = mapped_column(String, nullable=True)
    endereco: Mapped[str | None] = mapped_column(String, nullable=True)

    pessoa = relationship("Pessoa", foreign_keys=[pessoa_id])
