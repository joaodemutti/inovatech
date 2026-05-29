#!/bin/bash
# Executa todos os testes e gera relatórios HTML + cobertura

set -e

echo "==> Instalando dependências de teste..."
pip install -r requirements-test.txt -q

echo "==> Criando banco de teste (se não existir)..."
psql -U inovatech -c "CREATE DATABASE inovatech_test OWNER inovatech;" 2>/dev/null || true

echo "==> Rodando testes..."
pytest \
  --cov=app \
  --cov-report=html:reports/coverage \
  --cov-report=term-missing \
  --html=reports/report.html \
  --self-contained-html \
  -v \
  "$@"

echo ""
echo "=============================="
echo " Relatórios gerados:"
echo "  • Testes:    reports/report.html"
echo "  • Cobertura: reports/coverage/index.html"
echo "=============================="
