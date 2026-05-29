from fastapi import APIRouter, Depends, File, Request, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_role
from app.models.usuario import Usuario
from app.schemas.excel import ImportResult
from app.services import auditoria_service
from app.services.excel_service import (
    exportar_consultas,
    exportar_financeiro,
    exportar_log_auditoria,
    exportar_medicos,
    exportar_pacientes,
    exportar_ponto,
    exportar_prontuarios,
    exportar_usuarios,
    importar_consultas,
    importar_de_xlsx,
    importar_financeiro,
    importar_medicos,
    importar_pacientes,
    importar_ponto,
    importar_prontuarios,
    importar_usuarios,
)

router = APIRouter(prefix="/excel", tags=["Excel"])

MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


def _stream(buffer, nome: str) -> StreamingResponse:
    return StreamingResponse(
        buffer,
        media_type=MEDIA_TYPE,
        headers={"Content-Disposition": f"attachment; filename={nome}.xlsx"},
    )


def _auditar_excel(
    db: Session,
    current_user: Usuario,
    acao: str,
    modulo: str,
    detalhes: str,
    ip: str | None = None,
    resultado: str = "sucesso",
) -> None:
    auditoria_service.registrar_acao(
        db=db,
        acao=acao,
        modulo=modulo,
        resultado=resultado,
        usuario_id=current_user.id,
        ip=ip,
        detalhes=detalhes,
    )


@router.get("/export/pacientes")
def export_pacientes(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    buffer, total = exportar_pacientes(db)
    _auditar_excel(db, current_user, "exportar", "pacientes", f"{total} registros", request.client.host if request.client else None)
    return _stream(buffer, "pacientes")


@router.get("/export/medicos")
def export_medicos(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    buffer, total = exportar_medicos(db)
    _auditar_excel(db, current_user, "exportar", "medicos", f"{total} registros", request.client.host if request.client else None)
    return _stream(buffer, "medicos")


@router.get("/export/consultas")
def export_consultas(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    buffer, total = exportar_consultas(db)
    _auditar_excel(db, current_user, "exportar", "consultas", f"{total} registros", request.client.host if request.client else None)
    return _stream(buffer, "consultas")


@router.get("/export/prontuarios")
def export_prontuarios(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    buffer, total = exportar_prontuarios(db)
    _auditar_excel(db, current_user, "exportar", "prontuarios", f"{total} registros", request.client.host if request.client else None)
    return _stream(buffer, "prontuarios")


@router.get("/export/financeiro")
def export_financeiro(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    buffer, total = exportar_financeiro(db)
    _auditar_excel(db, current_user, "exportar", "financeiro", f"{total} registros", request.client.host if request.client else None)
    return _stream(buffer, "financeiro")


@router.get("/export/ponto")
def export_ponto(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    buffer, total = exportar_ponto(db)
    _auditar_excel(db, current_user, "exportar", "ponto", f"{total} registros", request.client.host if request.client else None)
    return _stream(buffer, "ponto")


@router.get("/export/usuarios")
def export_usuarios(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    buffer, total = exportar_usuarios(db)
    _auditar_excel(db, current_user, "exportar", "usuarios", f"{total} registros", request.client.host if request.client else None)
    return _stream(buffer, "usuarios")


@router.get("/export/log-auditoria")
def export_log_auditoria(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    buffer, total = exportar_log_auditoria(db)
    _auditar_excel(db, current_user, "exportar", "log-auditoria", f"{total} registros", request.client.host if request.client else None)
    return _stream(buffer, "log_auditoria")


@router.post("/import/pacientes", response_model=ImportResult)
async def import_pacientes_route(
    request: Request,
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    registros, erros = await importar_de_xlsx(arquivo, ["nome_completo", "cpf"])
    importados, erros_persistencia = importar_pacientes(db, registros)
    erros.extend(erros_persistencia)
    ip = request.client.host if request.client else None
    _auditar_excel(db, current_user, "importar", "pacientes", f"{importados} importados, {len(erros)} erros", ip, "sucesso" if importados else "falha")
    return ImportResult(importados=importados, erros=erros)


@router.post("/import/medicos", response_model=ImportResult)
async def import_medicos_route(
    request: Request,
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    registros, erros = await importar_de_xlsx(arquivo, ["nome_completo", "cpf", "crm", "especialidade"])
    importados, erros_persistencia = importar_medicos(db, registros)
    erros.extend(erros_persistencia)
    ip = request.client.host if request.client else None
    _auditar_excel(db, current_user, "importar", "medicos", f"{importados} importados, {len(erros)} erros", ip, "sucesso" if importados else "falha")
    return ImportResult(importados=importados, erros=erros)


@router.post("/import/consultas", response_model=ImportResult)
async def import_consultas_route(
    request: Request,
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    registros, erros = await importar_de_xlsx(arquivo, ["paciente_id", "medico_id", "data", "horario", "tipo_consulta", "valor"])
    importados, erros_persistencia = importar_consultas(db, registros)
    erros.extend(erros_persistencia)
    ip = request.client.host if request.client else None
    _auditar_excel(db, current_user, "importar", "consultas", f"{importados} importados, {len(erros)} erros", ip, "sucesso" if importados else "falha")
    return ImportResult(importados=importados, erros=erros)


@router.post("/import/prontuarios", response_model=ImportResult)
async def import_prontuarios_route(
    request: Request,
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    registros, erros = await importar_de_xlsx(arquivo, ["paciente_id", "medico_id", "data", "cid", "diagnostico", "prescricao"])
    importados, erros_persistencia = importar_prontuarios(db, registros)
    erros.extend(erros_persistencia)
    ip = request.client.host if request.client else None
    _auditar_excel(db, current_user, "importar", "prontuarios", f"{importados} importados, {len(erros)} erros", ip, "sucesso" if importados else "falha")
    return ImportResult(importados=importados, erros=erros)


@router.post("/import/financeiro", response_model=ImportResult)
async def import_financeiro_route(
    request: Request,
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    registros, erros = await importar_de_xlsx(arquivo, ["paciente_id", "data", "servico", "valor"])
    importados, erros_persistencia = importar_financeiro(db, registros)
    erros.extend(erros_persistencia)
    ip = request.client.host if request.client else None
    _auditar_excel(db, current_user, "importar", "financeiro", f"{importados} importados, {len(erros)} erros", ip, "sucesso" if importados else "falha")
    return ImportResult(importados=importados, erros=erros)


@router.post("/import/ponto", response_model=ImportResult)
async def import_ponto_route(
    request: Request,
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    registros, erros = await importar_de_xlsx(arquivo, ["usuario_id", "data"])
    importados, erros_persistencia = importar_ponto(db, registros)
    erros.extend(erros_persistencia)
    ip = request.client.host if request.client else None
    _auditar_excel(db, current_user, "importar", "ponto", f"{importados} importados, {len(erros)} erros", ip, "sucesso" if importados else "falha")
    return ImportResult(importados=importados, erros=erros)


@router.post("/import/usuarios", response_model=ImportResult)
async def import_usuarios_route(
    request: Request,
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    registros, erros = await importar_de_xlsx(arquivo, ["nome", "perfil", "login", "email"])
    importados, erros_persistencia = importar_usuarios(db, registros)
    erros.extend(erros_persistencia)
    ip = request.client.host if request.client else None
    _auditar_excel(db, current_user, "importar", "usuarios", f"{importados} importados, {len(erros)} erros", ip, "sucesso" if importados else "falha")
    return ImportResult(importados=importados, erros=erros)
