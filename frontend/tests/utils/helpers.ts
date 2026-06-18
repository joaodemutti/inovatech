import { type Page, type Locator, type APIRequestContext, expect, request } from '@playwright/test';
import path from 'path';

/**
 * Perfis suportados e suas credenciais (sobrescrevíveis via tests/.env.test).
 * Senha padrão definida em backend/seed.py → SENHA_PADRAO = "Inovatech@2026".
 */
export type Role = 'gestor' | 'recepcionista' | 'medico' | 'paciente';

export interface Persona {
  login: string;
  password: string;
  nome: string;
  papel: string;
  descricao: string;
  especialidade?: string;
}

/**
 * Personas dos atores do sistema, conforme definidas no INOVATECH_PROJECT.md:
 *  - §2 "Dona Marta" (gestora da Clínica Vida Plena)
 *  - §4 "Atores e Perfis de Acesso"
 * Logins/senha vêm do seed (backend/seed.py · USUARIOS_ESSENCIAIS); senha
 * padrão "Inovatech@2026". Sobrescrevíveis via tests/.env.test.
 */
export const PERSONAS: Record<Role, Persona> = {
  gestor: {
    login: process.env.GESTOR_LOGIN ?? 'marta',
    password: process.env.GESTOR_PASSWORD ?? 'Inovatech@2026',
    nome: 'Dona Marta',
    papel: 'Gestora',
    descricao: 'Gestora da Clínica Vida Plena — acesso a todos os módulos, indicadores, usuários e auditoria.',
  },
  recepcionista: {
    login: process.env.RECEPCIONISTA_LOGIN ?? 'ana',
    password: process.env.RECEPCIONISTA_PASSWORD ?? 'Inovatech@2026',
    nome: 'Ana Lima',
    papel: 'Recepcionista',
    descricao: 'Acesso a Agenda e Cadastro; cria, confirma e cancela consultas e cadastra pacientes.',
  },
  medico: {
    login: process.env.MEDICO_LOGIN ?? 'carlos',
    password: process.env.MEDICO_PASSWORD ?? 'Inovatech@2026',
    nome: 'Dr. Carlos Lima',
    papel: 'Médico',
    especialidade: 'Clínica Geral',
    descricao: 'Acesso a Agenda e Prontuário; registra diagnósticos com CID e libera laudos.',
  },
  paciente: {
    login: process.env.PACIENTE_LOGIN ?? 'maria',
    password: process.env.PACIENTE_PASSWORD ?? 'Inovatech@2026',
    nome: 'Maria Oliveira',
    papel: 'Paciente',
    descricao: 'Acesso restrito ao Portal; consulta agendamentos próprios e baixa laudos liberados.',
  },
};

/** Alias de compatibilidade. */
export const CREDENCIAIS = PERSONAS;

/** Rótulo de exibição da persona, ex.: "Dona Marta (Gestora)". */
export function personaLabel(role: Role): string {
  return `${PERSONAS[role].nome} (${PERSONAS[role].papel})`;
}

/**
 * Exibe uma legenda/banner na tela descrevendo o passo atual (aparece no vídeo).
 * Reinjete após cada navegação. `pausaMs` dá tempo do espectador ler.
 */
export async function legenda(page: Page, texto: string, pausaMs = 1100): Promise<void> {
  await page.evaluate((t) => {
    let el = document.getElementById('e2e-legenda');
    if (!el) {
      el = document.createElement('div');
      el.id = 'e2e-legenda';
      el.style.cssText = [
        'position:fixed', 'top:16px', 'left:50%', 'transform:translateX(-50%)',
        'z-index:2147483647', 'max-width:92vw', 'padding:12px 24px',
        'font:600 18px/1.35 system-ui,"Segoe UI",Arial,sans-serif',
        'color:#fff', 'background:linear-gradient(135deg,#7c3aed,#3b82f6)',
        'border-radius:9999px', 'box-shadow:0 12px 32px rgba(0,0,0,.4)',
        'pointer-events:none', 'letter-spacing:.2px', 'text-align:center',
      ].join(';');
      document.body.appendChild(el);
    }
    el.textContent = t;
  }, texto);
  await page.waitForTimeout(pausaMs);
}

/** Caminho do storageState gerado pelo auth.setup para um perfil. */
export function authFile(role: Role): string {
  return path.join(__dirname, '..', '.auth', `${role}.json`);
}

/** Executa o fluxo de login pela UI (sem reaproveitar storageState). */
export async function loginPelaUI(page: Page, role: Role): Promise<void> {
  const { login, password } = CREDENCIAIS[role];
  await page.goto('/login');
  await page.getByPlaceholder('Login').fill(login);
  await page.getByPlaceholder('Senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  // Após login o app sempre navega para /dashboard (mesmo o paciente, que vê
  // "Acesso Restrito" lá). O cookie httpOnly é o que importa para a sessão.
  await page.waitForURL(/dashboard/, { timeout: 15_000 });
}

/** URL base do frontend (Next.js). */
export const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

/** URL base da API (mesma resolução do frontend). */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

/**
 * Cria um APIRequestContext autenticado com o cookie de um perfil já logado.
 * Útil para preparar dados de teste sem passar pela UI.
 */
export async function apiComoPerfil(role: Role): Promise<APIRequestContext> {
  return request.newContext({ baseURL: API_URL, storageState: authFile(role) });
}

/**
 * Localiza um campo de formulário pelo atributo `name` (gerado automaticamente
 * pelo react-hook-form via register). Mais robusto que getByLabel, pois os
 * formulários do projeto não associam <Label> ao <input> por id/htmlFor.
 */
export function campo(scope: Page | Locator, name: string): Locator {
  return scope.locator(`[name="${name}"]`);
}

/** Descobre o id do paciente (tabela paciente) a partir do nome, via API do gestor. */
export async function idPacientePorNome(nome: string): Promise<number> {
  const api = await apiComoPerfil('gestor');
  const resp = await api.get('/pacientes');
  expect(resp.ok(), 'GET /pacientes deve responder 200').toBeTruthy();
  const lista: Array<{ id: number; nome_completo: string }> = await resp.json();
  await api.dispose();
  const paciente = lista.find((p) => p.nome_completo === nome);
  if (!paciente) throw new Error(`Paciente "${nome}" não encontrado no seed`);
  return paciente.id;
}

/**
 * Garante (via API, como médico) que a paciente Maria tenha ao menos um laudo
 * liberado — precondição para os testes de download no Portal do Paciente.
 */
export async function garantirLaudoLiberado(): Promise<void> {
  const pacienteId = await idPacientePorNome('Maria Oliveira');
  const api = await apiComoPerfil('medico');
  const hoje = new Date().toISOString().split('T')[0];
  const resp = await api.post('/prontuarios', {
    data: {
      paciente_id: pacienteId,
      data: hoje,
      cid: 'Z000',
      diagnostico: 'Precondição de teste para laudo liberado',
      prescricao: 'Conduta de precondição de teste e2e',
      retorno_em_dias: 0,
    },
  });
  if (resp.ok()) {
    const pront = await resp.json();
    await api.patch(`/prontuarios/${pront.id}/liberar-laudo`);
  }
  await api.dispose();
}

/** Gera um sufixo único e estável por execução para evitar colisões de CPF/CRM/login. */
let contador = 0;
function sufixo(): string {
  contador += 1;
  return `${Date.now()}${contador}`.slice(-9);
}

export function cpfUnico(): string {
  return sufixo().padStart(11, '0').slice(0, 11);
}

export function crmUnico(): string {
  return `CRM-SP ${sufixo().slice(-5)}`;
}

export function emailUnico(prefixo = 'teste'): string {
  return `${prefixo}.${sufixo()}@e2e.com`;
}

export function nomeUnico(prefixo: string): string {
  return `${prefixo} E2E ${sufixo()}`;
}
