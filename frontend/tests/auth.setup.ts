import { test as setup, expect } from '@playwright/test';
import path from 'path';

const GESTOR_FILE = path.join(__dirname, '.auth/gestor.json');

setup('autenticar como gestor', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('Login').fill(process.env.GESTOR_LOGIN ?? 'admin');
  await page.getByPlaceholder('Senha').fill(process.env.GESTOR_PASSWORD ?? 'admin123');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/dashboard/, { timeout: 10_000 });
  await page.context().storageState({ path: GESTOR_FILE });
});
