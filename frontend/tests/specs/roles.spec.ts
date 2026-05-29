import { test, expect } from '@playwright/test';

// Testa restrições de acesso por perfil
// Este spec roda sem storageState pré-autenticado

async function loginAs(page: ReturnType<typeof test.info>['project']['use'] extends infer T ? T : never, login: string, password: string) {
  return; // placeholder — veja abaixo
}

test.describe('Controle de Acesso por Perfil', () => {
  async function doLogin(page: import('@playwright/test').Page, login: string, password: string) {
    await page.goto('/login');
    await page.getByPlaceholder('Login').fill(login);
    await page.getByPlaceholder('Senha').fill(password);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 10_000 });
  }

  test('gestor acessa Financeiro', async ({ page }) => {
    await doLogin(page, process.env.GESTOR_LOGIN ?? 'admin', process.env.GESTOR_PASSWORD ?? 'admin123');
    await page.goto('/financeiro');
    await expect(page.getByText('Receita Paga')).toBeVisible({ timeout: 8_000 });
  });

  test('gestor acessa Administração', async ({ page }) => {
    await doLogin(page, process.env.GESTOR_LOGIN ?? 'admin', process.env.GESTOR_PASSWORD ?? 'admin123');
    await page.goto('/admin');
    await expect(page.getByRole('tab', { name: 'Usuários' })).toBeVisible({ timeout: 8_000 });
  });

  test('gestor vê botão Novo Médico', async ({ page }) => {
    await doLogin(page, process.env.GESTOR_LOGIN ?? 'admin', process.env.GESTOR_PASSWORD ?? 'admin123');
    await page.goto('/medicos');
    await expect(page.getByRole('button', { name: 'Novo Médico' })).toBeVisible({ timeout: 8_000 });
  });

  test('gestor vê todos os itens do sidebar', async ({ page }) => {
    await doLogin(page, process.env.GESTOR_LOGIN ?? 'admin', process.env.GESTOR_PASSWORD ?? 'admin123');
    await page.goto('/dashboard');
    await expect(page.getByRole('link', { name: 'Financeiro' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Administração' })).toBeVisible();
  });
});
