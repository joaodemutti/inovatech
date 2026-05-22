from sqlalchemy.orm import Session

from app.models.usuario import Usuario


def buscar_por_id(db: Session, usuario_id: int) -> Usuario | None:
    return db.get(Usuario, usuario_id)


def buscar_por_login(db: Session, login: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.login == login).first()


def buscar_por_email(db: Session, email: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.email == email).first()


def listar(db: Session, skip: int = 0, limit: int = 100) -> list[Usuario]:
    return db.query(Usuario).offset(skip).limit(limit).all()


def criar(db: Session, dados: dict) -> Usuario:
    usuario = Usuario(**dados)
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


def atualizar(db: Session, usuario: Usuario, dados: dict) -> Usuario:
    for campo, valor in dados.items():
        setattr(usuario, campo, valor)
    db.commit()
    db.refresh(usuario)
    return usuario
