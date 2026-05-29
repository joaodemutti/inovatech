from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.medico import Medico
from app.models.pessoa import Pessoa


def buscar_por_id(db: Session, medico_id: int) -> Medico | None:
    return (
        db.query(Medico)
        .options(joinedload(Medico.pessoa))
        .filter(Medico.id == medico_id)
        .first()
    )


def buscar_por_crm(db: Session, crm: str) -> Medico | None:
    return db.query(Medico).filter(Medico.crm == crm).first()


def buscar_por_cpf(db: Session, cpf: str) -> Pessoa | None:
    return db.query(Pessoa).filter(Pessoa.cpf == cpf).first()


def buscar_por_email(db: Session, email: str) -> Medico | None:
    return (
        db.query(Medico)
        .join(Pessoa)
        .options(joinedload(Medico.pessoa))
        .filter(func.lower(Pessoa.email) == email.lower())
        .first()
    )


def listar(db: Session, skip: int = 0, limit: int = 100) -> list[Medico]:
    return (
        db.query(Medico)
        .options(joinedload(Medico.pessoa))
        .offset(skip)
        .limit(limit)
        .all()
    )


def criar(db: Session, pessoa_dados: dict, medico_dados: dict) -> Medico:
    pessoa = Pessoa(**pessoa_dados, tipo="medico")
    db.add(pessoa)
    db.flush()
    medico = Medico(**medico_dados, pessoa_id=pessoa.id)
    db.add(medico)
    db.commit()
    db.refresh(medico)
    return buscar_por_id(db, medico.id)


def atualizar(db: Session, medico: Medico, dados: dict) -> Medico:
    pessoa_campos = {"nome_completo", "telefone", "email", "status"}
    medico_campos = {"especialidade", "data_formatura", "crm"}

    for campo, valor in dados.items():
        if campo in pessoa_campos:
            setattr(medico.pessoa, campo, valor)
        elif campo in medico_campos:
            setattr(medico, campo, valor)

    db.commit()
    db.refresh(medico)
    return buscar_por_id(db, medico.id)
