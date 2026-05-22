from sqlalchemy.orm import Session

from app.models.prontuario import Prontuario


def buscar_por_id(db: Session, prontuario_id: int) -> Prontuario | None:
    return db.get(Prontuario, prontuario_id)


def listar(db: Session, skip: int = 0, limit: int = 100) -> list[Prontuario]:
    return (
        db.query(Prontuario)
        .order_by(Prontuario.data.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def listar_por_paciente(db: Session, paciente_id: int) -> list[Prontuario]:
    return (
        db.query(Prontuario)
        .filter(Prontuario.paciente_id == paciente_id)
        .order_by(Prontuario.data.desc())
        .all()
    )


def listar_laudos_liberados(db: Session, paciente_id: int) -> list[Prontuario]:
    return (
        db.query(Prontuario)
        .filter(
            Prontuario.paciente_id == paciente_id,
            Prontuario.laudo_liberado == True,
        )
        .order_by(Prontuario.data.desc())
        .all()
    )


def criar(db: Session, dados: dict) -> Prontuario:
    prontuario = Prontuario(**dados)
    db.add(prontuario)
    db.commit()
    db.refresh(prontuario)
    return prontuario


def atualizar(db: Session, prontuario: Prontuario, dados: dict) -> Prontuario:
    for campo, valor in dados.items():
        setattr(prontuario, campo, valor)
    db.commit()
    db.refresh(prontuario)
    return prontuario
