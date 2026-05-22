from datetime import datetime

from sqlalchemy import JSON, DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String, nullable=False)
    perfil: Mapped[str] = mapped_column(
        Enum("gestor", "recepcionista", "medico", "paciente", name="perfil_enum"),
        nullable=False,
    )
    login: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    ultimo_acesso: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(
        Enum("ativo", "inativo", name="status_usuario_enum"),
        default="ativo",
        nullable=False,
    )
    modulos_permitidos: Mapped[list | None] = mapped_column(JSON, nullable=True)
    observacao: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime, onupdate=func.now(), nullable=True
    )
