from datetime import date

from sqlalchemy.orm import Session

from app.models.consulta import Consulta


def buscar_por_id(db: Session, consulta_id: int) -> Consulta | None:
    return db.get(Consulta, consulta_id)


def listar(
    db: Session,
    data: date | None = None,
    medico_id: int | None = None,
    status: str | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[Consulta]:
    q = db.query(Consulta)
    if data:
        q = q.filter(Consulta.data == data)
    if medico_id:
        q = q.filter(Consulta.medico_id == medico_id)
    if status:
        q = q.filter(Consulta.status == status)
    return q.order_by(Consulta.data, Consulta.horario).offset(skip).limit(limit).all()


def listar_hoje(db: Session) -> list[Consulta]:
    return listar(db, data=date.today(), limit=1000)


def listar_por_paciente(db: Session, paciente_id: int) -> list[Consulta]:
    return (
        db.query(Consulta)
        .filter(Consulta.paciente_id == paciente_id)
        .order_by(Consulta.data.desc())
        .all()
    )


def criar(db: Session, dados: dict) -> Consulta:
    consulta = Consulta(**dados)
    db.add(consulta)
    db.commit()
    db.refresh(consulta)
    return consulta


def atualizar(db: Session, consulta: Consulta, dados: dict) -> Consulta:
    for campo, valor in dados.items():
        setattr(consulta, campo, valor)
    db.commit()
    db.refresh(consulta)
    return consulta


def excluir(db: Session, consulta: Consulta) -> None:
    db.delete(consulta)
    db.commit()
