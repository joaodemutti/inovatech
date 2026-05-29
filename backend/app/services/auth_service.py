from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.security import criar_token, verificar_senha
from app.repositories import usuario_repository
from app.services import auditoria_service


def login(db: Session, login: str, password: str, ip: str | None = None) -> str:
    usuario = usuario_repository.buscar_por_login(db, login)

    if not usuario or not verificar_senha(password, usuario.password_hash):
        auditoria_service.registrar_acao(
            db=db,
            acao="login",
            modulo="auth",
            resultado="falha",
            ip=ip,
            detalhes=f"Tentativa de login falha para login: {login}",
        )
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    if usuario.status == "inativo":
        auditoria_service.registrar_acao(
            db=db,
            acao="login",
            modulo="auth",
            resultado="falha",
            usuario_id=usuario.id,
            ip=ip,
            detalhes=f"Tentativa de login de usuario inativo: {usuario.login}",
        )
        raise HTTPException(status_code=403, detail="Usuário inativo")

    token = criar_token({"sub": str(usuario.id), "perfil": usuario.perfil})

    usuario_repository.atualizar(db, usuario, {"ultimo_acesso": datetime.utcnow()})

    auditoria_service.registrar_acao(
        db=db,
        acao="login",
        modulo="auth",
        resultado="sucesso",
        usuario_id=usuario.id,
        ip=ip,
        detalhes=f"Login realizado: {usuario.login}",
    )

    return token
