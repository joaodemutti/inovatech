import jwt
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.security import decodificar_token
from app.database import get_db
from app.models.usuario import Usuario


async def get_current_user(
    request: Request, db: Session = Depends(get_db)
) -> Usuario:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")
    try:
        payload = decodificar_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token inválido")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

    user = db.get(Usuario, int(user_id))
    if not user or user.status == "inativo":
        raise HTTPException(
            status_code=401, detail="Usuário inativo ou não encontrado"
        )
    return user


async def get_current_user_optional(
    request: Request, db: Session = Depends(get_db)
) -> Usuario | None:
    token = request.cookies.get("access_token")
    if not token:
        return None
    try:
        payload = decodificar_token(token)
        user_id = payload.get("sub")
        if not user_id:
            return None
        return db.get(Usuario, int(user_id))
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, ValueError):
        return None


def require_role(*perfis: str):
    def dependency(current_user: Usuario = Depends(get_current_user)):
        if current_user.perfil not in perfis:
            raise HTTPException(
                status_code=403, detail="Acesso negado para este perfil"
            )
        return current_user

    return dependency
