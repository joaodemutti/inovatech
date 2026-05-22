from sqlalchemy.orm import Session, joinedload

from app.models.paciente import Paciente
from app.models.pessoa import Pessoa


def buscar_por_id(db: Session, paciente_id: int) -> Paciente | None:
    return (
        db.query(Paciente)
        .options(joinedload(Paciente.pessoa))
        .filter(Paciente.id == paciente_id)
        .first()
    )


def buscar_por_cpf(db: Session, cpf: str) -> Pessoa | None:
    return db.query(Pessoa).filter(Pessoa.cpf == cpf).first()


def listar(db: Session, skip: int = 0, limit: int = 100) -> list[Paciente]:
    return (
        db.query(Paciente)
        .options(joinedload(Paciente.pessoa))
        .offset(skip)
        .limit(limit)
        .all()
    )


def criar(db: Session, pessoa_dados: dict, paciente_dados: dict) -> Paciente:
    pessoa = Pessoa(**pessoa_dados, tipo="paciente")
    db.add(pessoa)
    db.flush()
    paciente = Paciente(**paciente_dados, pessoa_id=pessoa.id)
    db.add(paciente)
    db.commit()
    db.refresh(paciente)
    return buscar_por_id(db, paciente.id)


def atualizar(db: Session, paciente: Paciente, dados: dict) -> Paciente:
    pessoa_campos = {"nome_completo", "telefone", "email", "status"}
    paciente_campos = {"data_nascimento", "convenio", "endereco"}

    for campo, valor in dados.items():
        if campo in pessoa_campos:
            setattr(paciente.pessoa, campo, valor)
        elif campo in paciente_campos:
            setattr(paciente, campo, valor)

    db.commit()
    db.refresh(paciente)
    return buscar_por_id(db, paciente.id)
