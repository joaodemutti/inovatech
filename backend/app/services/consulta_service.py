from datetime import date, time

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.consulta import Consulta
from app.repositories import consulta_repository, financeiro_repository
from app.services import auditoria_service


def enviar_lembrete_whatsapp(
    telefone: str, nome_paciente: str, data: date, horario: time
) -> None:
    # STUB: Integração futura com WhatsApp Business API
    print(
        f"[WHATSAPP STUB] Lembrete para {nome_paciente} ({telefone}) - {data} {horario}"
    )


def listar_consultas(db: Session, **filtros) -> list[Consulta]:
    return consulta_repository.listar(db, **filtros)


def buscar_consulta(db: Session, consulta_id: int) -> Consulta:
    consulta = consulta_repository.buscar_por_id(db, consulta_id)
    if not consulta:
        raise HTTPException(status_code=404, detail="Consulta não encontrada")
    return consulta


def criar_consulta(
    db: Session, dados: dict, usuario_id: int, ip: str | None = None
) -> Consulta:
    consulta = consulta_repository.criar(db, dados)
    auditoria_service.registrar_acao(
        db=db,
        acao="criar",
        modulo="agenda",
        resultado="sucesso",
        usuario_id=usuario_id,
        ip=ip,
        detalhes=f"Consulta criada: {consulta.id}",
    )
    return consulta


def atualizar_consulta(
    db: Session,
    consulta_id: int,
    dados: dict,
    usuario_id: int,
    ip: str | None = None,
) -> Consulta:
    consulta = buscar_consulta(db, consulta_id)
    status_anterior = consulta.status
    novo_status = dados.get("status")

    consulta = consulta_repository.atualizar(db, consulta, dados)

    # RN01: criar lançamento financeiro quando status muda para "realizada"
    if novo_status == "realizada" and status_anterior != "realizada":
        financeiro_repository.criar(
            db,
            {
                "consulta_id": consulta.id,
                "paciente_id": consulta.paciente_id,
                "medico_id": consulta.medico_id,
                "data": consulta.data,
                "servico": consulta.tipo_consulta,
                "convenio": consulta.convenio,
                "valor": consulta.valor,
                "status": "pendente",
            },
        )

    # RN06: stub WhatsApp quando status muda para "confirmada"
    if novo_status == "confirmada" and status_anterior != "confirmada":
        if consulta.paciente and consulta.paciente.pessoa:
            enviar_lembrete_whatsapp(
                telefone=consulta.paciente.pessoa.telefone or "",
                nome_paciente=consulta.paciente.pessoa.nome_completo,
                data=consulta.data,
                horario=consulta.horario,
            )

    auditoria_service.registrar_acao(
        db=db,
        acao="editar",
        modulo="agenda",
        resultado="sucesso",
        usuario_id=usuario_id,
        ip=ip,
        detalhes=f"Consulta {consulta_id} atualizada. Status: {status_anterior} → {novo_status}",
    )
    return consulta


def excluir_consulta(
    db: Session, consulta_id: int, usuario_id: int, ip: str | None = None
) -> None:
    consulta = buscar_consulta(db, consulta_id)
    consulta_repository.excluir(db, consulta)
    auditoria_service.registrar_acao(
        db=db,
        acao="excluir",
        modulo="agenda",
        resultado="sucesso",
        usuario_id=usuario_id,
        ip=ip,
        detalhes=f"Consulta {consulta_id} excluída",
    )
