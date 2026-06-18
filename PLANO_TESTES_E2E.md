# Plano de Testes E2E — INOVATECH

> Especificação de testes **ponta-a-ponta (E2E)** baseada nos **Requisitos
> Funcionais (RF)** do projeto. Os testes exercitam **frontend + backend como um
> todo** (Next.js → FastAPI → PostgreSQL), validando cada perfil de acesso
> (gestor, recepcionista, médico e paciente) por **tela** e por **RF**.
>
> Projeto Acadêmico · SENAI "Mariano Ferraz" · Engenharia de Software · 2026

---

## 1. Objetivo e escopo

Garantir, de forma automatizada e reproduzível, que os fluxos principais do
sistema funcionam de ponta a ponta para **todos os tipos de login** e que as
**regras de negócio e de acesso** estão corretas.

- **Ferramenta:** [Playwright](https://playwright.dev) (somente).
- **Integração:** testes reais contra a API (sem mocks) — front e back juntos.
- **Ambiente:** stack local com banco populado pelo `seed.py` (dados previsíveis).
- **Organização dupla:** por **perfil/tela** (pastas em `tests/specs/<perfil>/`) e
  por **RF** (cada teste recebe uma *tag* `@RFxx`).

---

## 2. Arquitetura da automação

```
frontend/
├─ playwright.config.ts        # projetos por perfil + gravação de vídeo
└─ tests/
   ├─ auth.setup.ts            # autentica os 4 perfis e salva a sessão (storageState)
   ├─ .auth/<perfil>.json      # cookies de sessão reaproveitados pelos projetos
   ├─ utils/helpers.ts         # credenciais, login, dados únicos, API helper
   ├─ pages/                   # Page Objects (Login, Dashboard, Pacientes, …)
   └─ specs/
      ├─ acesso/               # projeto "acesso" (sem sessão): login + matriz de acesso
      ├─ gestor/               # projeto "gestor"
      ├─ recepcionista/        # projeto "recepcionista"
      ├─ medico/               # projeto "medico"
      ├─ paciente/             # projeto "paciente"
      ├─ fluxos/               # projeto "fluxos": RF09 e RF10 (multi-perfil)
      └─ demo/                 # projeto "demo": vídeo ~2 min (essencial + 2 logins)
```

Cada **projeto** do Playwright reaproveita o `storageState` do usuário
correspondente (login feito uma única vez no `setup`), o que torna a suíte rápida
e fiel ao comportamento real de cada perfil.

---

## 3. Pré-requisitos e execução

### 3.1 Subir a stack (backend + banco)

```bash
# na raiz do repositório
docker compose up -d --build      # sobe PostgreSQL + API (migra e roda o seed)
curl http://localhost:8000/       # deve responder {"status":"ok",...}
```

### 3.2 Subir o frontend

```bash
cd frontend
npm install
npm run dev                       # http://localhost:3000
```

### 3.3 Rodar os testes

```bash
cd frontend
npx playwright install            # 1ª vez: baixa o navegador
npm test                          # roda TODA a suíte (todos os perfis)

# Recortes úteis:
npx playwright test --project=acesso          # login + controle de acesso
npx playwright test --project=gestor          # apenas o perfil gestor
npx playwright test --grep @RF03              # apenas os testes do RF03
npx playwright test --grep "@RF09|@RF10"      # fluxos integrados
npm run test:report                           # abre o relatório HTML
```

Variáveis úteis: `PLAYWRIGHT_BASE_URL` (URL do front), `NEXT_PUBLIC_API_URL`
(URL da API), `PWVIDEO=off` (desliga o vídeo), `PWSLOWMO=400` (câmera lenta).

---

## 4. Personas (atores do INOVATECH_PROJECT.md)

Os testes usam as **personas** descritas na especificação — §2 ("Dona Marta", a
gestora da clínica) e §4 ("Atores e Perfis de Acesso"). Estão definidas em
`tests/utils/helpers.ts` (`PERSONAS`) e provisionadas pelo seed
(`backend/seed.py · USUARIOS_ESSENCIAIS`, senha padrão `Inovatech@2026`).

| Persona | Papel | Login | O que faz (resumo do §4) |
|---|---|---|---|
| **Dona Marta** | Gestora | `marta` | Todos os módulos, indicadores, usuários e auditoria |
| **Ana Lima** | Recepcionista | `ana` | Agenda e Cadastro; cria/confirma/cancela consultas; cadastra pacientes |
| **Dr. Carlos Lima** | Médico (Clínica Geral) | `carlos` | Agenda e Prontuário; registra CID e libera laudos |
| **Maria Oliveira** | Paciente | `maria` | Portal: consulta agendamentos e baixa laudos liberados |

> Outras personas do §4 também existem no seed (`roberto` — gestor exemplo;
> `renata`, `marcos` — médicos; `joao` — paciente) e podem ser usadas via
> `frontend/tests/.env.test` (ex.: `GESTOR_LOGIN=roberto`).

---

## 5. Matriz de cobertura RF × tela

| RF | Módulo / Tela | Perfis que executam | Especificação (arquivo) |
|---|---|---|---|
| RF01 | Agenda (consultas) | recepcionista, gestor, médico | `recepcionista/consultas`, `gestor/consultas`, `medico/consultas` |
| RF02 | Prontuário | médico (criação), gestor (leitura) | `medico/prontuarios`, `gestor/prontuarios` |
| RF03 | Cadastro (pacientes/médicos) | gestor, recepcionista | `gestor/pacientes`, `gestor/medicos`, `recepcionista/cadastro` |
| RF04 | Financeiro | gestor | `gestor/financeiro` |
| RF05 | Folha de Ponto | gestor | `gestor/ponto` |
| RF06 | Administração (usuários + auditoria) | gestor | `gestor/admin` |
| RF07 | Dashboard | gestor | `gestor/dashboard` |
| RF08 | Backup (com log) | gestor | `gestor/admin` |
| RF09 | Agenda → Financeiro (automático) | gestor | `fluxos/rf09-agenda-financeiro` |
| RF10 | Portal do Paciente (laudo liberado) | médico + paciente | `fluxos/rf10-laudo-portal`, `paciente/portal`, `medico/prontuarios` |
| RF11 | Exportação Excel (.xlsx) | gestor | `gestor/excel` + cada tela |
| RF12 | Importação Excel (.xlsx) | gestor | `gestor/excel` |
| RNF05 | Controle de acesso por perfil | todos | `acesso/controle-acesso` |
| RNF06 | Rastreabilidade (log de auditoria) | gestor | `gestor/admin` |
| AUTH | Login / proteção de rotas | todos | `acesso/auth` |

---

## 6. Especificação por requisito

> Notação: **Pré** = pré-condições · **Passos** = roteiro · **Esperado** =
> resultado · **Testes** = onde está implementado.

### AUTH — Autenticação e proteção de rotas
- **Pré:** usuários do seed existentes.
- **Passos:** acessar `/login`; autenticar cada perfil; tentar senha inválida;
  enviar formulário vazio; acessar rota protegida sem sessão.
- **Esperado:** login válido → entra no sistema; paciente → acessa o Portal;
  senha errada → "Credenciais inválidas"; campos vazios → "Login/Senha
  obrigatório"; rota protegida sem sessão → redireciona para `/login`.
- **Testes:** `acesso/auth.spec.ts`.

### RF01 — Agenda
- **Pré:** logado como recepcionista/gestor (escrita) ou médico (leitura).
- **Passos:** abrir agenda; conferir calendário, legenda de cores e
  visualizações (Mês/Semana/Dia); agendar nova consulta; confirmar/realizar.
- **Esperado:** consulta agendada aparece no calendário; mudança de status exibe
  "Status atualizado"; médico vê a agenda mas **não** agenda.
- **Testes:** `recepcionista/consultas.spec.ts`, `gestor/consultas.spec.ts`,
  `medico/consultas.spec.ts`.

### RF02 — Prontuário
- **Pré:** logado como médico (criação) / gestor (leitura).
- **Passos:** criar prontuário deixando o **CID em branco** (validação) e depois
  com CID + diagnóstico + prescrição.
- **Esperado:** sem CID → erro "CID obrigatório"; com dados válidos → "Criado".
- **Testes:** `medico/prontuarios.spec.ts`, `gestor/prontuarios.spec.ts`.

### RF03 — Cadastro
- **Pré:** logado como gestor ou recepcionista.
- **Passos:** cadastrar paciente (CPF, telefone, e-mail, convênio) e médico
  (CRM, especialidade); validar obrigatórios; buscar/filtrar.
- **Esperado:** registro criado aparece na tabela; obrigatórios bloqueiam.
- **Testes:** `gestor/pacientes.spec.ts`, `gestor/medicos.spec.ts`,
  `recepcionista/cadastro.spec.ts`.

### RF04 — Financeiro
- **Pré:** logado como gestor.
- **Passos:** conferir indicadores (Receita Paga, A Receber, Atrasado, Total);
  abrir novo lançamento; filtrar por status.
- **Esperado:** 4 indicadores e lista de lançamentos visíveis; filtro funciona.
- **Testes:** `gestor/financeiro.spec.ts`.

### RF05 — Folha de Ponto
- **Pré:** logado como gestor.
- **Passos:** conferir resumo (horas, faltas, atrasos, extras); filtrar período;
  abrir registro com entrada/saída.
- **Esperado:** cards de resumo e tabela visíveis; diálogo com Entrada/Saída.
- **Testes:** `gestor/ponto.spec.ts`.

### RF06 — Administração e RNF06 — Auditoria
- **Pré:** logado como gestor.
- **Passos:** abas Usuários/Log; criar usuário com perfil; consultar e filtrar o
  log de auditoria.
- **Esperado:** usuário criado aparece na tabela; log lista ações com data/hora,
  ação, módulo e resultado; filtro por módulo funciona.
- **Testes:** `gestor/admin.spec.ts`.

### RF07 — Dashboard
- **Pré:** logado como gestor.
- **Passos:** abrir o dashboard.
- **Esperado:** 4 KPIs (Total de Pacientes, Consultas Hoje, Receita do Mês,
  Valores Pendentes), gráficos e atalhos de navegação.
- **Testes:** `gestor/dashboard.spec.ts`.

### RF08 — Backup
- **Pré:** logado como gestor.
- **Passos:** clicar em **Backup** na Administração.
- **Esperado:** confirmação "Backup registrado" (e registro no log de auditoria).
- **Testes:** `gestor/admin.spec.ts`.

### RF09 — Agenda → Financeiro (lançamento automático)
- **Pré:** logado como gestor.
- **Passos:** agendar consulta com um **tipo único**; reabrir o evento e marcar
  **Realizada**; abrir o Financeiro.
- **Esperado:** um lançamento financeiro com o tipo da consulta é criado
  automaticamente e aparece na lista.
- **Testes:** `fluxos/rf09-agenda-financeiro.spec.ts`.

### RF10 — Portal do Paciente (laudo só após liberação)
- **Pré:** sessões de médico e paciente.
- **Passos:** médico cria prontuário (laudo **pendente**); paciente abre o Portal
  (laudo **não** aparece); médico **libera** o laudo; paciente recarrega.
- **Esperado:** o laudo só fica visível/baixável (PDF) **após** a liberação.
- **Testes:** `fluxos/rf10-laudo-portal.spec.ts`, `paciente/portal.spec.ts`,
  `medico/prontuarios.spec.ts`.

### RF11 — Exportação Excel
- **Pré:** logado como gestor.
- **Passos:** clicar em **Exportar** em cada entidade.
- **Esperado:** download de arquivo `.xlsx`.
- **Testes:** `gestor/excel.spec.ts` e os testes "exporta a planilha…" de cada
  tela (pacientes, médicos, consultas, prontuários, financeiro, ponto).

### RF12 — Importação Excel
- **Pré:** logado como gestor.
- **Passos:** exportar pacientes e **reimportar** o arquivo.
- **Esperado:** o pipeline de importação processa o arquivo e a validação
  (unicidade de CPF/CRM) responde (sucesso ou aviso de erros).
- **Testes:** `gestor/excel.spec.ts`.

---

## 7. Matriz de controle de acesso (RNF05)

Em telas não permitidas, o sistema exibe o painel **"Acesso Restrito"**.
A suíte `acesso/controle-acesso.spec.ts` valida **cada célula** desta matriz e a
sidebar de cada perfil.

| Tela | Gestor | Recepcionista | Médico | Paciente |
|---|:--:|:--:|:--:|:--:|
| Dashboard | ✅ | ✅ | ✅ | ⛔ |
| Pacientes | ✅ | ✅ | ⛔ | ⛔ |
| Médicos | ✅ | ✅ | ⛔ | ⛔ |
| Consultas | ✅ | ✅ | ✅ | ⛔ |
| Prontuários | ✅ | ⛔ | ✅ | ⛔ |
| Financeiro | ✅ | ⛔ | ⛔ | ⛔ |
| Ponto | ✅ | ✅ | ✅ | ⛔ |
| Administração | ✅ | ⛔ | ⛔ | ⛔ |
| Portal Paciente | ⛔ | ⛔ | ⛔ | ✅ |

---

## 8. Vídeo de apresentação (~2 min) — projeto `demo`

O projeto **`demo`** foi feito para ser gravado em **até ~2 minutos** e contém
dois testes de alto impacto:

| Teste | O que mostra | RF cobertos |
|---|---|---|
| `demo/essencial.spec.ts` | Jornada única do gestor: login → dashboard → cadastra paciente → agenda consulta → marca Realizada → vê o lançamento no Financeiro → Backup | RF-AUTH, RF07, RF03, RF01, RF09, RF04, RF08 |
| `demo/dual-login.spec.ts` | **Dois logins ao mesmo tempo**, em janelas lado a lado: o médico libera o laudo e o paciente passa a vê-lo/baixá-lo em tempo real | RF10 |

### Como gravar

```bash
cd frontend

# Fluxo essencial (janela única), em câmera lenta para o vídeo:
PWSLOWMO=350 npx playwright test demo/essencial --headed

# Dois logins lado a lado (duas janelas: médico à esquerda, paciente à direita):
PWSLOWMO=450 npx playwright test demo/dual-login --headed

# Ou os dois de uma vez:
npm run test:demo:headed
```

> `PWSLOWMO` controla a câmera lenta (ms entre ações). O `dual-login` posiciona
> as duas janelas automaticamente (médico à esquerda, paciente à direita) para
> a captura de tela.

### Vídeos automáticos do Playwright

A suíte também grava o vídeo de **todos os testes** (`video: 'on'`). Após
qualquer execução, os arquivos ficam em
`frontend/test-results/<teste>/video.webm` e no relatório HTML
(`npm run test:report`) — prontos para editar e publicar. Use `PWVIDEO=off` para
desligar a gravação em execuções rápidas.

### Roteiro alternativo (cobertura completa em vídeo)
1. `npm run test:acesso` → **todos os logins** + **matriz de acesso** (RNF05).
2. `npx playwright test --grep "@RF09|@RF10"` → integrações.
3. `npm run test:demo:headed` → fluxo essencial + dois logins simultâneos.

---

## 9. Execução em PRODUÇÃO

> ⚠️ Ambos os modos abaixo **APAGAM e repopulam o banco de produção** antes de rodar
> (TRUNCATE + seed via `backend/reset_db.py`). Use apenas em ambiente acadêmico.

URLs de produção: front `https://inovatech-online.vercel.app` · API `https://inovatech-api.onrender.com`.

### 9.1 Disparar pelo navegador (GitHub Actions)
Não é possível **assistir** a um navegador *headed* na nuvem — o Actions roda
headless e entrega **logs ao vivo + o vídeo como artifact**.

1. No GitHub: **Settings → Secrets and variables → Actions → New secret**
   `PROD_DATABASE_URL` = string de conexão do banco de produção (Neon/Render).
2. Aba **Actions → "E2E em Produção (demo)" → Run workflow** → digite `RESET` → Run.
3. Acompanhe os logs; ao final baixe o artifact **`e2e-prod-resultado`** (vídeo + relatório).

Arquivo: [`.github/workflows/e2e-prod.yml`](.github/workflows/e2e-prod.yml).

### 9.2 Assistir AO VIVO (headed) contra produção — máquina local
Para **ver** acontecendo, rode na sua máquina apontando para produção (PowerShell):

```powershell
# backend local só como "executor" do reset
docker compose up -d

# 1) RESET do banco de PRODUÇÃO (CUIDADO: apaga dados reais)
$prod = "<sua_PROD_DATABASE_URL>"
docker compose exec -e DATABASE_URL="$prod" backend python reset_db.py

# 2) Assistir ao vivo (headed) contra produção
cd frontend
$env:PLAYWRIGHT_BASE_URL = "https://inovatech-online.vercel.app"
$env:NEXT_PUBLIC_API_URL = "https://inovatech-api.onrender.com"
$env:RESET_DB = "off"      # não mexe no banco LOCAL
$env:PWSLOWMO = "260"
npm run test:video:headed
```
