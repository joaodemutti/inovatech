import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import { authFile, personaLabel, type Role } from '../../utils/helpers';

/**
 * RNF05 — Controle de acesso por perfil (matriz perfil × tela).
 * Cada perfil só acessa os módulos pertinentes à sua função; nas telas não
 * permitidas o AppLayout renderiza o painel "Acesso Restrito".
 */
type Tela = { path: string; nome: string; marcador: RegExp | string };

const TELAS: Tela[] = [
  { path: '/dashboard', nome: 'Dashboard', marcador: 'Total de Pacientes' },
  { path: '/pacientes', nome: 'Pacientes', marcador: 'Novo Paciente' },
  { path: '/medicos', nome: 'Médicos', marcador: 'Novo Médico' },
  { path: '/consultas', nome: 'Consultas', marcador: 'Agenda de Consultas' },
  { path: '/prontuarios', nome: 'Prontuários', marcador: /registros/ },
  { path: '/financeiro', nome: 'Financeiro', marcador: 'Receita Paga' },
  { path: '/ponto', nome: 'Ponto', marcador: 'H. Trabalhadas' },
  { path: '/admin', nome: 'Administração', marcador: 'Log de Auditoria' },
  { path: '/portal', nome: 'Portal do Paciente', marcador: 'Minhas Consultas' },
];

/** Telas permitidas por perfil (espelha allowedRoles + navItems do frontend). */
const PERMISSOES: Record<Role, string[]> = {
  gestor: ['/dashboard', '/pacientes', '/medicos', '/consultas', '/prontuarios', '/financeiro', '/ponto', '/admin'],
  recepcionista: ['/dashboard', '/pacientes', '/medicos', '/consultas', '/ponto'],
  medico: ['/dashboard', '/consultas', '/prontuarios', '/ponto'],
  paciente: ['/portal'],
};

/** Itens de menu esperados na sidebar por perfil. */
const MENU_ESPERADO: Record<Role, string[]> = {
  gestor: ['Dashboard', 'Pacientes', 'Médicos', 'Consultas', 'Prontuários', 'Financeiro', 'Ponto', 'Administração'],
  recepcionista: ['Dashboard', 'Pacientes', 'Médicos', 'Consultas', 'Ponto'],
  medico: ['Dashboard', 'Consultas', 'Prontuários', 'Ponto'],
  paciente: ['Portal Paciente'],
};

const PERFIS: Role[] = ['gestor', 'recepcionista', 'medico', 'paciente'];

for (const perfil of PERFIS) {
  test.describe(`Controle de acesso · ${personaLabel(perfil)}`, () => {
    let context: BrowserContext;
    let page: Page;

    test.beforeAll(async ({ browser }) => {
      context = await browser.newContext({ storageState: authFile(perfil) });
      page = await context.newPage();
    });

    test.afterAll(async () => {
      await context.close();
    });

    test(`sidebar mostra apenas os módulos de ${personaLabel(perfil)}`, { tag: '@RNF05' }, async () => {
      // Vai para a primeira tela permitida para garantir a sidebar renderizada
      await page.goto(PERMISSOES[perfil][0]);
      await page.waitForLoadState('networkidle');
      const aside = page.locator('aside');
      for (const item of MENU_ESPERADO[perfil]) {
        await expect(aside.getByText(item, { exact: true })).toBeVisible();
      }
      const naoEsperados = Object.values(MENU_ESPERADO)
        .flat()
        .filter((v, i, a) => a.indexOf(v) === i)
        .filter((item) => !MENU_ESPERADO[perfil].includes(item));
      for (const item of naoEsperados) {
        await expect(aside.getByText(item, { exact: true })).toHaveCount(0);
      }
    });

    for (const tela of TELAS) {
      const permitido = PERMISSOES[perfil].includes(tela.path);
      const titulo = permitido ? `acessa ${tela.nome}` : `é bloqueado em ${tela.nome}`;

      test(titulo, { tag: '@RNF05' }, async () => {
        await page.goto(tela.path);
        await page.waitForLoadState('networkidle');

        if (permitido) {
          await expect(page.getByText('Acesso Restrito')).toHaveCount(0);
          await expect(page.getByText(tela.marcador).first()).toBeVisible({ timeout: 10_000 });
        } else {
          await expect(page.getByText('Acesso Restrito')).toBeVisible({ timeout: 10_000 });
        }
      });
    }
  });
}
