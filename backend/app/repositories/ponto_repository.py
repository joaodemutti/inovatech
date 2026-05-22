from datetime import date
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.registro_ponto import RegistroPonto
from app.schemas.ponto import TotaisPonto


def buscar_por_id(db: Session, ponto_id: int) -> RegistroPonto | None:
    return db.get(RegistroPonto, ponto_id)


def listar(
    db: Session,
    usuario_id: int | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[RegistroPonto]:
    q = db.query(RegistroPonto)
    if usuario_id:
        q = q.filter(RegistroPonto.usuario_id == usuario_id)
    if data_inicio:
        q = q.filter(RegistroPonto.data >= data_inicio)
    if data_fim:
        q = q.filter(RegistroPonto.data <= data_fim)
    return q.order_by(RegistroPonto.data.desc()).offset(skip).limit(limit).all()


def criar(db: Session, dados: dict) -> RegistroPonto:
    ponto = RegistroPonto(**dados)
    db.add(ponto)
    db.commit()
    db.refresh(ponto)
    return ponto


def atualizar(db: Session, ponto: RegistroPonto, dados: dict) -> RegistroPonto:
    for campo, valor in dados.items():
        setattr(ponto, campo, valor)
    db.commit()
    db.refresh(ponto)
    return ponto


def calcular_totais(
    db: Session,
    usuario_id: int | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
) -> TotaisPonto:
    registros = listar(
        db, usuario_id=usuario_id, data_inicio=data_inicio, data_fim=data_fim, limit=10000
    )

    total_h_trabalhadas = Decimal("0")
    total_h_esperadas = Decimal("0")
    total_diferenca = Decimal("0")
    faltas = atrasos = extras = normais = 0

    for r in registros:
        total_h_trabalhadas += Decimal(str(r.h_trabalhadas or 0))
        total_h_esperadas += Decimal(str(r.h_esperadas or 8))
        total_diferenca += Decimal(str(r.diferenca or 0))
        if r.situacao == "falta":
            faltas += 1
        elif r.situacao == "atraso":
            atrasos += 1
        elif r.situacao == "h_extra":
            extras += 1
        elif r.situacao == "normal":
            normais += 1

    return TotaisPonto(
        total_registros=len(registros),
        total_horas_trabalhadas=total_h_trabalhadas,
        total_horas_esperadas=total_h_esperadas,
        total_diferenca=total_diferenca,
        faltas=faltas,
        atrasos=atrasos,
        horas_extras=extras,
        normais=normais,
    )
