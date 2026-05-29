from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import criar_hash_senha
from app.database import get_db
from app.dependencies.auth import require_role
from app.models.usuario import Usuario
from app.repositories import usuario_repository
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, UsuarioUpdate
from app.services import auditoria_service

router = APIRouter(prefix="/usuarios", tags=["Usuários"])


@router.get("", response_model=list[UsuarioResponse])
def listar(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_role("gestor")),
):
    return usuario_repository.listar(db)


@router.post("", response_model=UsuarioResponse, status_code=201)
def criar(
    payload: UsuarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    if usuario_repository.buscar_por_login(db, payload.login):
        raise HTTPException(status_code=409, detail="Login já existe")
    if usuario_repository.buscar_por_email(db, payload.email):
        raise HTTPException(status_code=409, detail="Email já existe")

    dados = payload.model_dump(exclude={"password"})
    dados["password_hash"] = criar_hash_senha(payload.password)
    usuario = usuario_repository.criar(db, dados)

    auditoria_service.registrar_acao(
        db=db, acao="criar", modulo="admin", resultado="sucesso",
        usuario_id=current_user.id, detalhes=f"Usuário criado: {usuario.login}",
    )
    return usuario


@router.patch("/{usuario_id}", response_model=UsuarioResponse)
def atualizar(
    usuario_id: int,
    payload: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    usuario = usuario_repository.buscar_por_id(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    dados = payload.model_dump(exclude_none=True)
    if "password" in dados:
        dados["password_hash"] = criar_hash_senha(dados.pop("password"))

    usuario = usuario_repository.atualizar(db, usuario, dados)
    auditoria_service.registrar_acao(
        db=db, acao="editar", modulo="admin", resultado="sucesso",
        usuario_id=current_user.id, detalhes=f"Usuário {usuario_id} editado",
    )
    return usuario
