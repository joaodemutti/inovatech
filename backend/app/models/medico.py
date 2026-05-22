from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Medico(Base):
    __tablename__ = "medicos"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    pessoa_id: Mapped[int] = mapped_column(ForeignKey("pessoas.id"), nullable=False)
    crm: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    especialidade: Mapped[str] = mapped_column(String, nullable=False)
    data_formatura: Mapped[date | None] = mapped_column(Date, nullable=True)

    pessoa = relationship("Pessoa", foreign_keys=[pessoa_id])
