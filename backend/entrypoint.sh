#!/bin/bash
set -e

echo "▶ Verificando migrações Alembic..."
if [ -z "$(ls -A alembic/versions/*.py 2>/dev/null)" ]; then
    echo "  Nenhuma migração encontrada — gerando migração inicial..."
    alembic revision --autogenerate -m "initial"
fi

echo "▶ Aplicando migrações..."
alembic upgrade head

echo "▶ Executando seed inicial..."
python seed.py

echo "▶ Iniciando servidor FastAPI..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
