from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_role
from app.models.usuario import Usuario
from app.repositories import medico_repository
from app.schemas.medico import MedicoCreate, MedicoResponse, MedicoUpdate
from app.services import auditoria_service

router = APIRouter(prefix="/medicos", tags=["Médicos"])


def _to_response(m) -> dict:
    return {
        "id": m.id,
        "pessoa_id": m.pessoa_id,
        "nome_completo": m.pessoa.nome_completo,
        "cpf": m.pessoa.cpf,
        "telefone": m.pessoa.telefone,
        "email": m.pessoa.email,
        "status": m.pessoa.status,
        "crm": m.crm,
        "especialidade": m.especialidade,
        "data_formatura": m.data_formatura,
    }


@router.get("", response_model=list[MedicoResponse])
def listar(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_role("gestor", "recepcionista")),
):
    medicos = medico_repository.listar(db)
    return [_to_response(m) for m in medicos]


@router.post("", response_model=MedicoResponse, status_code=201)
def criar(
    payload: MedicoCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor", "recepcionista")),
):
    if medico_repository.buscar_por_crm(db, payload.crm):
        raise HTTPException(status_code=409, detail="CRM já cadastrado")
    if medico_repository.buscar_por_cpf(db, payload.cpf):
        raise HTTPException(status_code=409, detail="CPF já cadastrado")

    pessoa_dados = {
        "nome_completo": payload.nome_completo,
        "cpf": payload.cpf,
        "telefone": payload.telefone,
        "email": payload.email,
    }
    medico_dados = {
        "crm": payload.crm,
        "especialidade": payload.especialidade,
        "data_formatura": payload.data_formatura,
    }
    medico = medico_repository.criar(db, pessoa_dados, medico_dados)
    auditoria_service.registrar_acao(
        db=db, acao="criar", modulo="cadastro", resultado="sucesso",
        usuario_id=current_user.id, ip=request.client.host if request.client else None,
        detalhes=f"Médico criado: {medico.id}",
    )
    return _to_response(medico)


@router.get("/{medico_id}", response_model=MedicoResponse)
def buscar(
    medico_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_role("gestor", "recepcionista")),
):
    m = medico_repository.buscar_por_id(db, medico_id)
    if not m:
        raise HTTPException(status_code=404, detail="Médico não encontrado")
    return _to_response(m)


@router.patch("/{medico_id}", response_model=MedicoResponse)
def atualizar(
    medico_id: int,
    payload: MedicoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor", "recepcionista")),
):
    m = medico_repository.buscar_por_id(db, medico_id)
    if not m:
        raise HTTPException(status_code=404, detail="Médico não encontrado")
    m = medico_repository.atualizar(db, m, payload.model_dump(exclude_none=True))
    auditoria_service.registrar_acao(
        db=db, acao="editar", modulo="cadastro", resultado="sucesso",
        usuario_id=current_user.id, detalhes=f"Médico {medico_id} editado",
    )
    return _to_response(m)
