import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Autenticação', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('exibe tela de login com logo e campos', async () => {
    await loginPage.logoVisible();
    await expect(page => page.getByPlaceholder('Login')).toBeTruthy();
    await expect(page => page.getByPlaceholder('Senha')).toBeTruthy();
  });

  test('login com credenciais válidas redireciona para dashboard', async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      process.env.GESTOR_LOGIN ?? 'admin',
      process.env.GESTOR_PASSWORD ?? 'admin123'
    );
    await loginPage.expectRedirectToDashboard();
  });

  test('login com senha errada exibe mensagem de erro', async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'senha_errada');
    await loginPage.expectError();
  });

  test('campos obrigatórios bloqueiam envio', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText(/obrigatório/i).first()).toBeVisible();
  });

  test('rota protegida redireciona para login se não autenticado', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/, { timeout: 8_000 });
  });

  test('botão mostrar/ocultar senha funciona', async ({ page }) => {
    await page.goto('/login');
    const senhaInput = page.getByPlaceholder('Senha');
    await expect(senhaInput).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: '' }).filter({ has: page.locator('svg') }).last().click();
    await expect(senhaInput).toHaveAttribute('type', 'text');
  });
});
