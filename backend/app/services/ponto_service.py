from datetime import date, time as time_type, timedelta
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.registro_ponto import RegistroPonto
from app.repositories import ponto_repository
from app.schemas.ponto import TotaisPonto
from app.services import auditoria_service


def calcular_dados_ponto(
    entrada: time_type | None,
    saida: time_type | None,
    h_esperadas: Decimal,
) -> tuple[Decimal, Decimal, str] | None:
    # RN03: cálculo automático de situação. Retorna None quando apenas entrada ou saída está presente.
    if entrada and saida:
        delta = (
            timedelta(hours=saida.hour, minutes=saida.minute, seconds=saida.second)
            - timedelta(hours=entrada.hour, minutes=entrada.minute, seconds=entrada.second)
        )
        h_trabalhadas = Decimal(str(delta.total_seconds() / 3600))
        diferenca = h_trabalhadas - h_esperadas
        if diferenca > Decimal("1.0"):
            situacao = "h_extra"
        elif diferenca < Decimal("0"):
            situacao = "atraso"
        else:
            situacao = "normal"
        return h_trabalhadas, diferenca, situacao
    if entrada is None and saida is None:
        return Decimal("0"), Decimal("0") - h_esperadas, "falta"
    return None


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

    resultado = calcular_dados_ponto(entrada, saida, h_esperadas)
    if resultado is not None:
        dados["h_trabalhadas"], dados["diferenca"], dados["situacao"] = resultado

    ponto = ponto_repository.criar(db, dados)
    auditoria_service.registrar_acao(
        db=db,
        acao="criar",
        modulo="ponto",
        resultado="sucesso",
        usuario_id=usuario_id,
        ip=ip,
        detalhes=f"Registro de ponto criado: {ponto.id} (funcionario: {ponto.usuario_id})",
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

    resultado = calcular_dados_ponto(entrada, saida, h_esperadas)
    if resultado is not None:
        dados["h_trabalhadas"], dados["diferenca"], dados["situacao"] = resultado

    ponto = ponto_repository.atualizar(db, ponto, dados)
    auditoria_service.registrar_acao(
        db=db,
        acao="editar",
        modulo="ponto",
        resultado="sucesso",
        usuario_id=usuario_id,
        ip=ip,
        detalhes=f"Ponto {ponto_id} atualizado (funcionario: {ponto.usuario_id})",
    )
    return ponto


def obter_totais(
    db: Session,
    usuario_id: int | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
) -> TotaisPonto:
    return ponto_repository.calcular_totais(db, usuario_id, data_inicio, data_fim)
