from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database import get_db
from app.dependencies.auth import get_current_user, get_current_user_optional
from app.models.usuario import Usuario
from app.schemas.auth import LoginRequest
from app.schemas.usuario import UsuarioResponse
from app.services import auditoria_service, auth_service

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/login", response_model=UsuarioResponse)
def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    ip = request.client.host if request.client else None
    usuario, token = auth_service.login(db, payload.login, payload.password, ip)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=60 * settings.access_token_expire_minutes,
    )
    return usuario


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: Usuario | None = Depends(get_current_user_optional),
):
    if current_user:
        ip = request.client.host if request.client else None
        auditoria_service.registrar_acao(
            db=db,
            acao="logout",
            modulo="auth",
            resultado="sucesso",
            usuario_id=current_user.id,
            ip=ip,
            detalhes=f"Logout realizado: {current_user.login}",
        )
    response.delete_cookie("access_token")
    return {"message": "Logout realizado com sucesso"}


@router.get("/me", response_model=UsuarioResponse)
def me(current_user: Usuario = Depends(get_current_user)):
    return current_user
