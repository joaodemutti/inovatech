from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Pessoa(Base):
    __tablename__ = "pessoas"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nome_completo: Mapped[str] = mapped_column(String, nullable=False)
    cpf: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    telefone: Mapped[str | None] = mapped_column(String, nullable=True)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(
        Enum("ativo", "inativo", name="status_pessoa_enum"),
        default="ativo",
        nullable=False,
    )
    tipo: Mapped[str] = mapped_column(
        Enum("paciente", "medico", name="tipo_pessoa_enum"),
        nullable=False,
    )
