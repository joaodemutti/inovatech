# Cronograma Academico de Testes do Projeto INOVATECH

## Objetivo

Este documento apresenta um cronograma simplificado de testes para o sistema INOVATECH, organizado por fases de projeto academico.

O plano considera tres niveis principais de teste:

- **Testes unitarios**: validam pequenas partes do sistema de forma isolada.
- **Testes de integracao/conjunto**: validam a comunicacao entre modulos, banco de dados e regras de negocio.
- **Testes E2E**: validam fluxos completos do usuario usando API real ou interface web.

---

## Cronograma Resumido

| Fase | Periodo sugerido | Tipo de teste | Objetivo principal |
|---|---|---|---|
| 1 | Semana 1 | Planejamento | Definir escopo, ambiente e criterios de teste |
| 2 | Semana 2 | Testes unitarios | Validar regras isoladas do backend |
| 3 | Semana 3 | Integracao/conjunto | Validar modulos trabalhando juntos |
| 4 | Semana 4 | API E2E | Validar fluxos completos pela API real |
| 5 | Semana 5 | Frontend E2E | Validar fluxos principais pela interface |
| 6 | Semana 6 | Revisao e relatorios | Executar regressao, documentar resultados e pendencias |

---

## Fase 1: Planejamento dos Testes

### Objetivo

Preparar a estrategia de testes e o ambiente necessario para executar os testes com seguranca.

### Atividades

| Atividade | Resultado esperado |
|---|---|
| Definir funcionalidades principais | Lista de dominios a serem testados |
| Separar tipos de teste | Unitario, integracao/conjunto e E2E |
| Criar banco de teste | Ambiente isolado para testes |
| Configurar Docker de teste | Banco, backend e runner de testes funcionando |
| Definir usuarios de teste | Gestor, recepcionista, medico e paciente |

### Entrega da fase

Ambiente de teste preparado e escopo dos testes definido.

---

## Fase 2: Testes Unitarios

### Objetivo

Validar regras pequenas e isoladas do sistema, sem depender da interface ou de um fluxo completo.

### O que testar

| Modulo | Exemplos de testes unitarios |
|---|---|
| Autenticacao | Geracao e validacao de senha, token e sessao |
| Financeiro | Calculo de totais, valores pagos, pendentes e atrasados |
| Ponto | Calculo de horas trabalhadas, atraso, falta e hora extra |
| Agenda | Validacao de status da consulta |
| Prontuario | Regra de liberacao de laudo |
| Excel | Validacao de colunas obrigatorias |

### Exemplo de criterio de sucesso

Uma funcao que calcula horas extras deve retornar o valor correto para diferentes horarios de entrada e saida.

### Entrega da fase

Suite inicial de testes unitarios cobrindo regras de negocio importantes.

---

## Fase 3: Testes de Integracao/Conjunto

### Objetivo

Validar se diferentes partes do sistema funcionam corretamente quando usadas em conjunto.

### O que testar

| Integracao | Cenario esperado |
|---|---|
| Cadastro + Banco | Criar paciente e verificar persistencia no banco |
| Cadastro + Agenda | Criar consulta usando paciente e medico cadastrados |
| Agenda + Financeiro | Consulta realizada gera lancamento financeiro |
| Prontuario + Portal | Laudo liberado aparece para o paciente |
| Autenticacao + Permissoes | Usuario acessa apenas rotas permitidas |
| Excel + Cadastro | Importacao de pacientes salva dados corretamente |

### Diferenca para teste unitario

No teste unitario, cada regra e testada sozinha.  
No teste de integracao/conjunto, o foco e verificar se os modulos funcionam juntos.

### Entrega da fase

Testes comprovando que os principais modulos se comunicam corretamente.

---

## Fase 4: Testes E2E de API

### Objetivo

Validar fluxos completos chamando a API real por HTTP, como um cliente externo faria.

### Ferramentas

| Ferramenta | Uso |
|---|---|
| `pytest` | Executar os testes |
| `httpx` | Fazer chamadas HTTP para a API |
| PostgreSQL de teste | Banco isolado |
| Docker Compose | Subir banco, backend e runner |

### Dominios testados

| Dominio | Fluxos principais |
|---|---|
| Autenticacao | Login, logout, usuario atual e rota protegida |
| Perfis | Acesso de gestor, recepcionista, medico e paciente |
| Cadastro | Criar, listar, atualizar e inativar pacientes/medicos |
| Agenda | Criar, confirmar, cancelar e realizar consulta |
| Financeiro | Lancamento manual, pagamento e indicadores |
| Prontuario | Criacao, atualizacao e liberacao de laudo |
| Portal do Paciente | Visualizar consultas e laudos permitidos |
| Ponto | Normal, atraso, falta, hora extra e totais |
| Admin/Auditoria | Logs, falhas de login e backup |
| Excel | Exportacao e importacao de planilhas |

### Entrega da fase

Suite de testes E2E de API validando os fluxos principais do backend.

---

## Fase 5: Testes E2E de Frontend

### Objetivo

Validar se o usuario consegue executar os principais fluxos pela interface web.

### Ferramenta

Playwright.

### O que testar

| Tela/fluxo | Resultado esperado |
|---|---|
| Login | Usuario entra no sistema |
| Dashboard | Indicadores aparecem corretamente |
| Pacientes | Criar, listar e editar paciente |
| Medicos | Criar, listar e editar medico |
| Consultas | Criar e alterar status de consulta |
| Financeiro | Visualizar lancamentos e indicadores |
| Portal do Paciente | Ver consultas e laudos permitidos |
| Permissoes na interface | Menus e telas respeitam o perfil do usuario |

### Entrega da fase

Testes automatizados simulando o uso real do sistema no navegador.

---

## Fase 6: Revisao, Regressao e Relatorios

### Objetivo

Executar todos os testes, analisar falhas e documentar o estado final do projeto.

### Atividades

| Atividade | Resultado esperado |
|---|---|
| Rodar testes unitarios | Verificar regras isoladas |
| Rodar testes de integracao/conjunto | Verificar comunicacao entre modulos |
| Rodar testes E2E de API | Verificar fluxos completos do backend |
| Rodar testes E2E de frontend | Verificar fluxos completos pela interface |
| Gerar relatorios | Evidencias para entrega academica |
| Documentar falhas conhecidas | Lista clara do que falta implementar |

### Entrega da fase

Relatorio final com testes executados, resultados obtidos e pendencias identificadas.

---

## Organizacao dos Testes por Tipo

### Testes unitarios

```text
backend/
  tests_unit/
    test_auth_service.py
    test_financeiro_service.py
    test_ponto_service.py
    test_excel_service.py
```

### Testes de integracao/conjunto

```text
backend/
  tests_integration/
    test_cadastro_agenda.py
    test_agenda_financeiro.py
    test_prontuario_portal.py
    test_excel_import.py
```

### Testes E2E de API

```text
backend/
  tests_e2e/
    test_auth_roles.py
    test_cadastro.py
    test_agenda_financeiro.py
    test_prontuario_portal.py
    test_ponto_admin_excel.py
```

### Testes E2E de frontend

```text
frontend/
  tests/
    specs/
      auth.spec.ts
      dashboard.spec.ts
      pacientes.spec.ts
      consultas.spec.ts
```

---

## Prioridade de Implementacao

| Prioridade | Testes |
|---|---|
| Alta | Autenticacao, permissoes, cadastro, agenda e financeiro |
| Media | Prontuario, portal do paciente, ponto e auditoria |
| Baixa | Excel completo, relatorios detalhados e testes visuais |

---

## Criterios de Aceitacao

O plano de testes sera considerado satisfatorio quando:

- Existirem testes unitarios para regras importantes.
- Existirem testes de integracao/conjunto para os principais modulos.
- Existirem testes E2E de API para os fluxos principais.
- Existirem testes E2E de frontend para os fluxos mais usados.
- Os testes forem executados em ambiente isolado.
- Os resultados forem registrados em relatorios.
- As falhas conhecidas forem documentadas.

---

## Comando Principal para Testes E2E de API

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from api-e2e
```

Esse comando sobe o banco de teste, inicia o backend real e executa os testes E2E da API.
