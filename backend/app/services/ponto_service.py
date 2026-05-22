from datetime import date, time as time_type
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.registro_ponto import RegistroPonto
from app.repositories import ponto_repository
from app.schemas.ponto import TotaisPonto
from app.services import auditoria_service


def _calcular_situacao(
    entrada: time_type | None,
    saida: time_type | None,
    h_trabalhadas: Decimal,
    h_esperadas: Decimal,
) -> tuple[Decimal, Decimal, str]:
    # RN03: cálculo automático de situação
    if entrada is None and saida is None:
        return Decimal("0"), Decimal("0") - h_esperadas, "falta"

    diferenca = h_trabalhadas - h_esperadas

    if diferenca > Decimal("1.0"):
        situacao = "h_extra"
    elif diferenca < Decimal("0"):
        situacao = "atraso"
    else:
        situacao = "normal"

    return h_trabalhadas, diferenca, situacao


def listar_pontos(db: Session, **filtros) -> list[RegistroPonto]:
    return ponto_repository.listar(db, **filtros)


def buscar_ponto(db: Session, ponto_id: int) -> RegistroPonto:
    ponto = ponto_repository.buscar_por_id(db, ponto_id)
    if not ponto:
        raise HTTPException(status_code=404, detail="Registro de ponto não encontrado")
    return ponto


def criar_ponto(
    db: Session, dados: dict, usuario_id: int, ip: str | None = None
) -> RegistroPonto:
    entrada = dados.get("entrada")
    saida = dados.get("saida")
    h_esperadas = Decimal(str(dados.get("h_esperadas", 8.0)))

    if entrada and saida:
        h_trabalhadas = Decimal(
            str(
                (
                    saida.hour * 3600
                    + saida.minute * 60
                    - entrada.hour * 3600
                    - entrada.minute * 60
                )
                / 3600
            )
        )
        h_trabalhadas, diferenca, situacao = _calcular_situacao(
            entrada, saida, h_trabalhadas, h_esperadas
        )
        dados["h_trabalhadas"] = h_trabalhadas
        dados["diferenca"] = diferenca
        dados["situacao"] = situacao
    elif entrada is None and saida is None:
        dados["h_trabalhadas"] = Decimal("0")
        dados["diferenca"] = Decimal("0") - h_esperadas
        dados["situacao"] = "falta"

    ponto = ponto_repository.criar(db, dados)
    auditoria_service.registrar_acao(
        db=db,
        acao="criar",
        modulo="ponto",
        resultado="sucesso",
        usuario_id=usuario_id,
        ip=ip,
        detalhes=f"Registro de ponto criado: {ponto.id}",
    )
    return ponto


def atualizar_ponto(
    db: Session,
    ponto_id: int,
    dados: dict,
    usuario_id: int,
    ip: str | None = None,
) -> RegistroPonto:
    ponto = buscar_ponto(db, ponto_id)

    entrada = dados.get("entrada", ponto.entrada)
    saida = dados.get("saida", ponto.saida)
    h_esperadas = Decimal(str(dados.get("h_esperadas", ponto.h_esperadas) or 8.0))

    if entrada and saida:
        h_trabalhadas = Decimal(
            str(
                (
                    saida.hour * 3600
                    + saida.minute * 60
                    - entrada.hour * 3600
                    - entrada.minute * 60
                )
                / 3600
            )
        )
        h_trabalhadas, diferenca, situacao = _calcular_situacao(
            entrada, saida, h_trabalhadas, h_esperadas
        )
        dados["h_trabalhadas"] = h_trabalhadas
        dados["diferenca"] = diferenca
        dados["situacao"] = situacao
    elif entrada is None and saida is None:
        dados["h_trabalhadas"] = Decimal("0")
        dados["diferenca"] = Decimal("0") - h_esperadas
        dados["situacao"] = "falta"

    ponto = ponto_repository.atualizar(db, ponto, dados)
    auditoria_service.registrar_acao(
        db=db,
        acao="editar",
        modulo="ponto",
        resultado="sucesso",
        usuario_id=usuario_id,
        ip=ip,
        detalhes=f"Ponto {ponto_id} atualizado",
    )
    return ponto


def obter_totais(
    db: Session,
    usuario_id: int | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
) -> TotaisPonto:
    return ponto_repository.calcular_totais(db, usuario_id, data_inicio, data_fim)
