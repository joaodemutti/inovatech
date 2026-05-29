#!/bin/bash
# Executa testes E2E de API contra um backend real.

set -e

echo "==> Instalando dependencias de teste..."
pip install -r requirements-test.txt -q

export E2E_API_URL="${E2E_API_URL:-http://localhost:8000}"

echo "==> Rodando testes E2E de API em ${E2E_API_URL}..."
pytest tests_e2e "$@"

echo ""
echo "=============================="
echo " Relatorio gerado:"
echo "  - Testes: reports/report.html"
echo "=============================="
