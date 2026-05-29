# Cronograma Academico de Testes do Projeto INOVATECH

## Objetivo

Este documento apresenta um cronograma simplificado de testes para o sistema INOVATECH, com foco nas funcionalidades principais do projeto.

O objetivo e demonstrar como o sistema sera validado durante o desenvolvimento, considerando regras de negocio, integracao entre modulos e fluxos completos de uso.

---

## Visao Geral dos Tipos de Teste

| Tipo de teste | Finalidade |
|---|---|
| Testes unitarios | Verificar regras pequenas e isoladas do sistema |
| Testes de integracao/conjunto | Verificar se diferentes partes do sistema funcionam juntas |
| Testes funcionais/E2E | Verificar fluxos completos, como o usuario usaria o sistema |

---

## Cronograma por Fases

| Fase | Tema | Objetivo |
|---|---|---|
| 1 | Planejamento dos testes | Definir funcionalidades, perfis de usuario e criterios de validacao |
| 2 | Testes unitarios | Validar regras internas importantes |
| 3 | Testes de integracao/conjunto | Validar comunicacao entre modulos |
| 4 | Testes funcionais do backend | Validar fluxos completos pela API do sistema |
| 5 | Testes funcionais do frontend | Validar fluxos principais pela interface |
| 6 | Revisao final | Consolidar resultados, falhas e melhorias |

---

## Fase 1: Planejamento dos Testes

### Objetivo

Definir o que precisa ser testado e quais funcionalidades sao mais importantes para o funcionamento do sistema.

### Funcionalidades consideradas

| Area do sistema | O que deve ser validado |
|---|---|
| Autenticacao | Entrada e saida de usuarios no sistema |
| Perfis de acesso | Permissoes de gestor, recepcionista, medico e paciente |
| Cadastro | Pacientes e medicos |
| Agenda | Consultas e alteracao de status |
| Financeiro | Lancamentos, pagamentos e indicadores |
| Prontuario | Registro medico e liberacao de laudos |
| Portal do Paciente | Visualizacao de consultas e laudos pelo paciente |
| Ponto | Controle de presenca, atraso, falta e hora extra |
| Administracao | Auditoria e backup |
| Excel | Importacao e exportacao de dados |

### Entrega da fase

Lista das funcionalidades que serao validadas no projeto.

---

## Fase 2: Testes Unitarios

### Objetivo

Validar regras individuais do sistema antes de testar os fluxos completos.

### Exemplos de testes unitarios

| Funcionalidade | Regra a validar |
|---|---|
| Autenticacao | Senha correta permite login; senha incorreta deve falhar |
| Financeiro | Total pago, pendente e atrasado deve ser calculado corretamente |
| Ponto | Sistema identifica situacoes como normal, atraso, falta e hora extra |
| Agenda | Consulta deve aceitar apenas status validos |
| Prontuario | Laudo so deve aparecer para o paciente quando for liberado |
| Excel | Planilha deve conter colunas obrigatorias |

### Entrega da fase

Testes das principais regras de negocio de forma isolada.

---

## Fase 3: Testes de Integracao/Conjunto

### Objetivo

Validar se os modulos do sistema funcionam corretamente quando usados em conjunto.

### Exemplos de testes de integracao

| Modulos envolvidos | Cenario |
|---|---|
| Cadastro + Agenda | Criar uma consulta usando paciente e medico cadastrados |
| Agenda + Financeiro | Consulta realizada deve gerar lancamento financeiro |
| Prontuario + Portal | Laudo liberado pelo medico deve aparecer para o paciente |
| Autenticacao + Perfis | Usuario deve acessar apenas funcionalidades permitidas |
| Excel + Cadastro | Dados importados de planilha devem aparecer no cadastro |
| Admin + Auditoria | Acoes importantes devem gerar registro de auditoria |

### Entrega da fase

Confirmacao de que os modulos principais trabalham corretamente em conjunto.

---

## Fase 4: Testes Funcionais do Backend

### Objetivo

Validar os fluxos completos das funcionalidades principais do sistema.

### Fluxos testados

| Dominio | Fluxo esperado |
|---|---|
| Autenticacao | Usuario faz login, consulta seus dados e faz logout |
| Perfis | Cada tipo de usuario acessa apenas o que e permitido |
| Cadastro | Criar, listar, atualizar e inativar pacientes |
| Cadastro medico | Criar, listar e atualizar medicos |
| Agenda | Criar, confirmar, cancelar e concluir consultas |
| Financeiro | Criar lancamento, registrar pagamento e visualizar indicadores |
| Prontuario | Medico cria prontuario e libera laudo |
| Portal do Paciente | Paciente visualiza apenas seus proprios dados |
| Ponto | Registrar normal, atraso, falta e hora extra |
| Administracao | Consultar auditoria e registrar backup |
| Excel | Exportar dados e importar registros validos |

### Entrega da fase

Validacao dos fluxos principais do sistema pelo lado do backend.

---

## Fase 5: Testes Funcionais do Frontend

### Objetivo

Validar se o usuario consegue usar o sistema pela interface de forma correta.

### Fluxos testados

| Tela ou modulo | O que deve funcionar |
|---|---|
| Login | Usuario consegue entrar no sistema |
| Dashboard | Indicadores principais aparecem corretamente |
| Pacientes | Criar, listar e editar paciente |
| Medicos | Criar, listar e editar medico |
| Consultas | Criar consulta e alterar status |
| Financeiro | Visualizar lancamentos e indicadores |
| Prontuarios | Registrar atendimento e liberar laudo |
| Portal do Paciente | Paciente visualiza consultas e laudos permitidos |
| Navegacao | Menus exibem apenas opcoes permitidas para cada perfil |

### Entrega da fase

Validacao dos fluxos principais do sistema do ponto de vista do usuario.

---

## Fase 6: Revisao Final

### Objetivo

Reunir os resultados dos testes e identificar o que esta funcionando, o que precisa de correcao e o que ainda falta implementar.

### Atividades

| Atividade | Resultado |
|---|---|
| Executar testes unitarios | Confirmar regras individuais |
| Executar testes de integracao | Confirmar comunicacao entre modulos |
| Executar testes funcionais | Confirmar fluxos completos |
| Registrar falhas encontradas | Listar problemas e funcionalidades incompletas |
| Gerar relatorio final | Entregar evidencia dos testes realizados |

### Entrega da fase

Relatorio final com resumo dos testes, resultados e pendencias.

---

## Prioridade das Funcionalidades

| Prioridade | Funcionalidades |
|---|---|
| Alta | Autenticacao, perfis, cadastro, agenda e financeiro |
| Media | Prontuario, portal do paciente, ponto e auditoria |
| Baixa | Excel, relatorios detalhados e melhorias visuais |

---

## Criterios de Aceitacao

O plano de testes sera considerado satisfatorio quando:

- As principais regras de negocio forem testadas.
- Os modulos mais importantes forem testados em conjunto.
- Os fluxos principais do usuario forem validados.
- Cada perfil de usuario tiver suas permissoes verificadas.
- As falhas encontradas forem documentadas.
- O projeto tiver evidencias dos testes realizados.

---

## Conclusao

Este cronograma organiza os testes do INOVATECH de forma progressiva: primeiro validando regras pequenas, depois a integracao entre modulos e, por fim, os fluxos completos do usuario.

Essa abordagem ajuda a demonstrar, em um contexto academico de engenharia de software, que o projeto foi avaliado de forma planejada e funcional.
