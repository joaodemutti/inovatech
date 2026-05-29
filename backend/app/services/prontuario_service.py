import textwrap
from io import BytesIO

from fastapi import HTTPException
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from sqlalchemy.orm import Session

from app.models.prontuario import Prontuario
from app.models.usuario import Usuario
from app.repositories import medico_repository, prontuario_repository
from app.services import auditoria_service


def listar_prontuarios(db: Session, skip: int = 0, limit: int = 100) -> list[Prontuario]:
    return prontuario_repository.listar(db, skip=skip, limit=limit)


def buscar_prontuario(db: Session, prontuario_id: int) -> Prontuario:
    prontuario = prontuario_repository.buscar_por_id(db, prontuario_id)
    if not prontuario:
        raise HTTPException(status_code=404, detail="Prontuário não encontrado")
    return prontuario


def criar_prontuario(
    db: Session, dados: dict, current_user: Usuario, ip: str | None = None
) -> Prontuario:
    if current_user.perfil == "medico":
        medico = medico_repository.buscar_por_email(db, current_user.email)
        if not medico:
            raise HTTPException(status_code=404, detail="Medico nao encontrado para este usuario")
        dados["medico_id"] = medico.id
    elif not dados.get("medico_id"):
        raise HTTPException(status_code=422, detail="medico_id obrigatorio")

    prontuario = prontuario_repository.criar(db, dados)
    auditoria_service.registrar_acao(
        db=db,
        acao="criar",
        modulo="prontuario",
        resultado="sucesso",
        usuario_id=current_user.id,
        ip=ip,
        detalhes=f"Prontuário criado: {prontuario.id}",
    )
    return prontuario


def atualizar_prontuario(
    db: Session,
    prontuario_id: int,
    dados: dict,
    usuario_id: int,
    ip: str | None = None,
) -> Prontuario:
    prontuario = buscar_prontuario(db, prontuario_id)
    prontuario = prontuario_repository.atualizar(db, prontuario, dados)
    auditoria_service.registrar_acao(
        db=db,
        acao="editar",
        modulo="prontuario",
        resultado="sucesso",
        usuario_id=usuario_id,
        ip=ip,
        detalhes=f"Prontuário {prontuario_id} editado",
    )
    return prontuario


def liberar_laudo(
    db: Session, prontuario_id: int, usuario_id: int, ip: str | None = None
) -> Prontuario:
    prontuario = buscar_prontuario(db, prontuario_id)
    prontuario = prontuario_repository.atualizar(
        db, prontuario, {"laudo_liberado": True}
    )
    auditoria_service.registrar_acao(
        db=db,
        acao="editar",
        modulo="prontuario",
        resultado="sucesso",
        usuario_id=usuario_id,
        ip=ip,
        detalhes=f"Laudo liberado para prontuário {prontuario_id}",
    )
    return prontuario


def verificar_laudo_liberado(db: Session, prontuario_id: int) -> Prontuario:
    # RN02: verifica se o laudo está liberado antes de permitir download
    prontuario = buscar_prontuario(db, prontuario_id)
    if not prontuario.laudo_liberado:
        raise HTTPException(
            status_code=403,
            detail="Laudo não liberado pelo médico responsável",
        )
    return prontuario


def gerar_pdf_laudo(prontuario: Prontuario) -> BytesIO:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - 72

    def linha(texto: str, tamanho: int = 11, bold: bool = False, espaco: int = 18):
        nonlocal y
        fonte = "Helvetica-Bold" if bold else "Helvetica"
        pdf.setFont(fonte, tamanho)
        pdf.drawString(72, y, texto[:115])
        y -= espaco

    linha("Clinica Vida Plena", 16, True, 24)
    linha("Laudo Medico", 14, True, 28)
    linha(f"Prontuario: #{prontuario.id}")
    linha(f"Data: {prontuario.data}")
    linha(f"CID: {prontuario.cid}")
    linha("", espaco=10)
    linha("Diagnostico / Queixa", 12, True)
    for parte in _quebrar_texto(prontuario.diagnostico):
        linha(parte)
    linha("", espaco=10)
    linha("Prescricao / Conduta", 12, True)
    for parte in _quebrar_texto(prontuario.prescricao):
        linha(parte)
    linha("", espaco=10)
    linha(f"Retorno em dias: {prontuario.retorno_em_dias}")
    linha("", espaco=28)
    linha("Documento gerado automaticamente pelo sistema INOVATECH.", 9)

    pdf.showPage()
    pdf.save()
    buffer.seek(0)
    return buffer


def _quebrar_texto(texto: str, largura: int = 95) -> list[str]:
    return textwrap.wrap(texto or "", width=largura, break_long_words=True) or [""]
