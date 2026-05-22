from fastapi import APIRouter, Depends, Request, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_role
from app.models.consulta import Consulta
from app.models.lancamento_financeiro import LancamentoFinanceiro
from app.models.log_auditoria import LogAuditoria
from app.models.medico import Medico
from app.models.paciente import Paciente
from app.models.prontuario import Prontuario
from app.models.registro_ponto import RegistroPonto
from app.models.usuario import Usuario
from app.services import auditoria_service
from app.services.excel_service import exportar_para_xlsx, importar_de_xlsx

router = APIRouter(prefix="/excel", tags=["Excel"])

MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


def _stream(buffer, nome: str) -> StreamingResponse:
    return StreamingResponse(
        buffer,
        media_type=MEDIA_TYPE,
        headers={"Content-Disposition": f"attachment; filename={nome}.xlsx"},
    )


# ────── EXPORTAÇÕES ──────

@router.get("/export/pacientes")
def export_pacientes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    pacientes = db.query(Paciente).all()
    dados = [
        {
            "id": p.id,
            "nome_completo": p.pessoa.nome_completo,
            "cpf": p.pessoa.cpf,
            "telefone": p.pessoa.telefone,
            "email": p.pessoa.email,
            "status": p.pessoa.status,
            "data_nascimento": str(p.data_nascimento or ""),
            "convenio": p.convenio,
            "endereco": p.endereco,
        }
        for p in pacientes
    ]
    colunas = ["id", "nome_completo", "cpf", "telefone", "email", "status", "data_nascimento", "convenio", "endereco"]
    return _stream(exportar_para_xlsx(dados, colunas), "pacientes")


@router.get("/export/medicos")
def export_medicos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    medicos = db.query(Medico).all()
    dados = [
        {
            "id": m.id,
            "nome_completo": m.pessoa.nome_completo,
            "cpf": m.pessoa.cpf,
            "crm": m.crm,
            "especialidade": m.especialidade,
            "telefone": m.pessoa.telefone,
            "email": m.pessoa.email,
            "data_formatura": str(m.data_formatura or ""),
        }
        for m in medicos
    ]
    colunas = ["id", "nome_completo", "cpf", "crm", "especialidade", "telefone", "email", "data_formatura"]
    return _stream(exportar_para_xlsx(dados, colunas), "medicos")


@router.get("/export/consultas")
def export_consultas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    consultas = db.query(Consulta).all()
    dados = [
        {
            "id": c.id,
            "paciente_id": c.paciente_id,
            "medico_id": c.medico_id,
            "data": str(c.data),
            "horario": str(c.horario),
            "tipo_consulta": c.tipo_consulta,
            "convenio": c.convenio,
            "valor": float(c.valor),
            "status": c.status,
        }
        for c in consultas
    ]
    colunas = ["id", "paciente_id", "medico_id", "data", "horario", "tipo_consulta", "convenio", "valor", "status"]
    return _stream(exportar_para_xlsx(dados, colunas), "consultas")


@router.get("/export/prontuarios")
def export_prontuarios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    prontuarios = db.query(Prontuario).all()
    dados = [
        {
            "id": p.id,
            "paciente_id": p.paciente_id,
            "medico_id": p.medico_id,
            "data": str(p.data),
            "cid": p.cid,
            "diagnostico": p.diagnostico,
            "prescricao": p.prescricao,
            "retorno_em_dias": p.retorno_em_dias,
            "laudo_liberado": p.laudo_liberado,
        }
        for p in prontuarios
    ]
    colunas = ["id", "paciente_id", "medico_id", "data", "cid", "diagnostico", "prescricao", "retorno_em_dias", "laudo_liberado"]
    return _stream(exportar_para_xlsx(dados, colunas), "prontuarios")


@router.get("/export/financeiro")
def export_financeiro(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    lancamentos = db.query(LancamentoFinanceiro).all()
    dados = [
        {
            "id": l.id,
            "paciente_id": l.paciente_id,
            "medico_id": l.medico_id,
            "consulta_id": l.consulta_id,
            "data": str(l.data),
            "servico": l.servico,
            "convenio": l.convenio,
            "valor": float(l.valor),
            "status": l.status,
            "forma_pagamento": l.forma_pagamento,
        }
        for l in lancamentos
    ]
    colunas = ["id", "paciente_id", "medico_id", "consulta_id", "data", "servico", "convenio", "valor", "status", "forma_pagamento"]
    return _stream(exportar_para_xlsx(dados, colunas), "financeiro")


@router.get("/export/ponto")
def export_ponto(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    pontos = db.query(RegistroPonto).all()
    dados = [
        {
            "id": p.id,
            "usuario_id": p.usuario_id,
            "data": str(p.data),
            "entrada": str(p.entrada or ""),
            "saida": str(p.saida or ""),
            "h_trabalhadas": float(p.h_trabalhadas or 0),
            "h_esperadas": float(p.h_esperadas),
            "diferenca": float(p.diferenca or 0),
            "situacao": p.situacao,
        }
        for p in pontos
    ]
    colunas = ["id", "usuario_id", "data", "entrada", "saida", "h_trabalhadas", "h_esperadas", "diferenca", "situacao"]
    return _stream(exportar_para_xlsx(dados, colunas), "ponto")


@router.get("/export/usuarios")
def export_usuarios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    usuarios = db.query(Usuario).all()
    dados = [
        {
            "id": u.id,
            "nome": u.nome,
            "perfil": u.perfil,
            "login": u.login,
            "email": u.email,
            "status": u.status,
        }
        for u in usuarios
    ]
    colunas = ["id", "nome", "perfil", "login", "email", "status"]
    return _stream(exportar_para_xlsx(dados, colunas), "usuarios")


@router.get("/export/log-auditoria")
def export_log_auditoria(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    logs = db.query(LogAuditoria).order_by(LogAuditoria.data_hora.desc()).all()
    dados = [
        {
            "id": l.id,
            "data_hora": str(l.data_hora),
            "usuario_id": l.usuario_id,
            "acao": l.acao,
            "modulo": l.modulo,
            "ip": l.ip,
            "resultado": l.resultado,
            "detalhes": l.detalhes,
        }
        for l in logs
    ]
    colunas = ["id", "data_hora", "usuario_id", "acao", "modulo", "ip", "resultado", "detalhes"]
    return _stream(exportar_para_xlsx(dados, colunas), "log_auditoria")


# ────── IMPORTAÇÕES ──────

@router.post("/import/pacientes")
async def import_pacientes(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    registros, erros = await importar_de_xlsx(
        arquivo, ["nome_completo", "cpf"]
    )
    auditoria_service.registrar_acao(
        db=db, acao="criar", modulo="cadastro", resultado="sucesso",
        usuario_id=current_user.id,
        detalhes=f"Importação de pacientes: {len(registros)} registros, {len(erros)} erros",
    )
    return {"importados": len(registros), "erros": erros}


@router.post("/import/medicos")
async def import_medicos(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    registros, erros = await importar_de_xlsx(
        arquivo, ["nome_completo", "cpf", "crm", "especialidade"]
    )
    auditoria_service.registrar_acao(
        db=db, acao="criar", modulo="cadastro", resultado="sucesso",
        usuario_id=current_user.id,
        detalhes=f"Importação de médicos: {len(registros)} registros, {len(erros)} erros",
    )
    return {"importados": len(registros), "erros": erros}


@router.post("/import/consultas")
async def import_consultas(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    registros, erros = await importar_de_xlsx(
        arquivo, ["paciente_id", "medico_id", "data", "horario", "tipo_consulta", "valor"]
    )
    return {"importados": len(registros), "erros": erros}


@router.post("/import/prontuarios")
async def import_prontuarios(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    registros, erros = await importar_de_xlsx(
        arquivo, ["paciente_id", "medico_id", "data", "cid", "diagnostico", "prescricao"]
    )
    return {"importados": len(registros), "erros": erros}


@router.post("/import/financeiro")
async def import_financeiro(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    registros, erros = await importar_de_xlsx(
        arquivo, ["paciente_id", "data", "servico", "valor"]
    )
    return {"importados": len(registros), "erros": erros}


@router.post("/import/ponto")
async def import_ponto(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    registros, erros = await importar_de_xlsx(
        arquivo, ["usuario_id", "data"]
    )
    return {"importados": len(registros), "erros": erros}


@router.post("/import/usuarios")
async def import_usuarios(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("gestor")),
):
    registros, erros = await importar_de_xlsx(
        arquivo, ["nome", "perfil", "login", "email"]
    )
    return {"importados": len(registros), "erros": erros}
