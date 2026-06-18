import { test, expect } from '@playwright/test';
import { loginPelaUI, PERSONAS, personaLabel, type Role } from '../../utils/helpers';

/**
 * RF-AUTH / RNF05 — Autenticação e proteção de rotas.
 * Roda no projeto "acesso" (sem sessão pré-carregada): testa o login em si.
 */
test.describe('Autenticação', () => {
  test('exibe a tela de login com logo e campos', { tag: '@RF-AUTH' }, async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'INOVATECH' })).toBeVisible();
    await expect(page.getByPlaceholder('Login')).toBeVisible();
    await expect(page.getByPlaceholder('Senha')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  });

  for (const role of ['gestor', 'recepcionista', 'medico'] as Role[]) {
    test(`login válido como ${personaLabel(role)} acessa o sistema`, { tag: '@RF-AUTH' }, async ({ page }) => {
      await loginPelaUI(page, role);
      await expect(page).toHaveURL(/dashboard/);
      await expect(page.getByText('Total de Pacientes')).toBeVisible({ timeout: 10_000 });
    });
  }

  test(`login válido como ${personaLabel('paciente')} acessa o Portal`, { tag: '@RF10' }, async ({ page }) => {
    await loginPelaUI(page, 'paciente');
    await page.goto('/portal');
    await expect(page.getByText('Minhas Consultas')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Meus Laudos')).toBeVisible();
  });

  test('senha incorreta exibe "Credenciais inválidas"', { tag: '@RF-AUTH' }, async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Login').fill(PERSONAS.gestor.login);
    await page.getByPlaceholder('Senha').fill('senha_totalmente_errada');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText(/Credenciais inválidas/i)).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/login/);
  });

  test('campos obrigatórios bloqueiam o envio', { tag: '@RF-AUTH' }, async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText('Login obrigatório')).toBeVisible();
    await expect(page.getByText('Senha obrigatória')).toBeVisible();
  });

  test('rota protegida sem sessão redireciona para /login', { tag: '@RNF05' }, async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/, { timeout: 10_000 });
  });

  test('botão mostrar/ocultar senha alterna o tipo do campo', { tag: '@RF-AUTH' }, async ({ page }) => {
    await page.goto('/login');
    const senha = page.getByPlaceholder('Senha');
    await senha.fill('segredo123');
    await expect(senha).toHaveAttribute('type', 'password');
    await page.locator('button[type="button"]').filter({ has: page.locator('svg') }).first().click();
    await expect(senha).toHaveAttribute('type', 'text');
  });
});
