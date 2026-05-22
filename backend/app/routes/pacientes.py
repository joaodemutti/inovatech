from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user, require_role
from app.models.usuario import Usuario
from app.repositories import paciente_repository
from app.schemas.paciente import PacienteCreate, PacienteResponse, PacienteUpdate
from app.services import auditoria_service

router = APIRouter(prefix="/pacientes", tags=["Pacientes"])


def _to_response(p) -> dict:
    return {
        "id": p.id,
        "pessoa_id": p.pessoa_id,
        "nome_completo": p.pessoa.nome_completo,
        "cpf": p.pessoa.cpf,
        "telefone": p.pessoa.telefone,
        "email": p.pessoa.email,
        "status": p.pessoa.status,
        "data_nascimento": p.data_nascimento,
        "convenio": p.convenio,
        "endereco": p.endereco,
    }


@router.get("", response_model=list[PacienteResponse])
def listar(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_role("gestor", "recepcionista", "medico")),
):
    pacientes = paciente_repository.listar(db)
    return [_to_response(p) for p in pacientes]


@router.post("", response_model=PacienteResponse, status_code=201)
def criar(
    payload: PacienteCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor", "recepcionista")),
):
    if paciente_repository.buscar_por_cpf(db, payload.cpf):
        raise HTTPException(status_code=409, detail="CPF já cadastrado")

    pessoa_dados = {
        "nome_completo": payload.nome_completo,
        "cpf": payload.cpf,
        "telefone": payload.telefone,
        "email": payload.email,
    }
    paciente_dados = {
        "data_nascimento": payload.data_nascimento,
        "convenio": payload.convenio,
        "endereco": payload.endereco,
    }
    paciente = paciente_repository.criar(db, pessoa_dados, paciente_dados)
    auditoria_service.registrar_acao(
        db=db, acao="criar", modulo="cadastro", resultado="sucesso",
        usuario_id=current_user.id, ip=request.client.host if request.client else None,
        detalhes=f"Paciente criado: {paciente.id}",
    )
    return _to_response(paciente)


@router.get("/{paciente_id}", response_model=PacienteResponse)
def buscar(
    paciente_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    p = paciente_repository.buscar_por_id(db, paciente_id)
    if not p:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    return _to_response(p)


@router.patch("/{paciente_id}", response_model=PacienteResponse)
def atualizar(
    paciente_id: int,
    payload: PacienteUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor", "recepcionista")),
):
    p = paciente_repository.buscar_por_id(db, paciente_id)
    if not p:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    p = paciente_repository.atualizar(db, p, payload.model_dump(exclude_none=True))
    auditoria_service.registrar_acao(
        db=db, acao="editar", modulo="cadastro", resultado="sucesso",
        usuario_id=current_user.id, detalhes=f"Paciente {paciente_id} editado",
    )
    return _to_response(p)


@router.delete("/{paciente_id}", status_code=204)
def excluir(
    paciente_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor", "recepcionista")),
):
    p = paciente_repository.buscar_por_id(db, paciente_id)
    if not p:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    paciente_repository.atualizar(db, p, {"status": "inativo"})
    auditoria_service.registrar_acao(
        db=db, acao="excluir", modulo="cadastro", resultado="sucesso",
        usuario_id=current_user.id, detalhes=f"Paciente {paciente_id} desativado",
    )
