"""
Reseta o banco para um estado limpo e reaplica o seed completo.
Uso (local): docker compose exec backend python reset_db.py

Usado pelo global-setup do Playwright para garantir banco "novo" a cada execução
de testes. NUNCA aponta para produção (roda dentro do container local).
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import text

from app.database import SessionLocal, Base
import app.models  # noqa: F401 — registra todas as tabelas no metadata
from seed import seed, seed_usuarios


def reset():
    db = SessionLocal()
    try:
        tabelas = [t.name for t in Base.metadata.sorted_tables]
        if tabelas:
            db.execute(
                text(f'TRUNCATE TABLE {", ".join(tabelas)} RESTART IDENTITY CASCADE')
            )
            db.commit()
            print(f"  {len(tabelas)} tabela(s) truncada(s)")
        seed(db)           # dados de demonstração completos
        seed_usuarios(db)  # garante personas essenciais (inclui Dona Marta)
        print("✓ Banco resetado e populado")
    except Exception as e:  # pragma: no cover
        db.rollback()
        print(f"✗ Erro no reset: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    reset()
