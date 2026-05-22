from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.usuario import Usuario
from app.schemas.auth import LoginRequest
from app.schemas.usuario import UsuarioResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/login")
def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    ip = request.client.host if request.client else None
    token = auth_service.login(db, payload.login, payload.password, ip)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * settings.access_token_expire_minutes,
    )
    return {"message": "Login realizado com sucesso"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logout realizado com sucesso"}


@router.get("/me", response_model=UsuarioResponse)
def me(current_user: Usuario = Depends(get_current_user)):
    return current_user
