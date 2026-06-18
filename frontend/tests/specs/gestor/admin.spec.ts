import { test, expect } from '@playwright/test';
import { campo, emailUnico } from '../../utils/helpers';

/** RF06 — Administração: usuários/perfis + log de auditoria. RF08 — backup com registro no log. */
test.describe('Administração (gestor)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
  });

  test('exibe as abas Usuários e Log de Auditoria', { tag: '@RF06' }, async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Usuários' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Log de Auditoria' })).toBeVisible();
  });

  test('tabela de usuários tem as colunas corretas', { tag: '@RF06' }, async ({ page }) => {
    for (const col of ['Nome', 'Login', 'Email', 'Perfil', 'Status']) {
      await expect(page.getByRole('columnheader', { name: col })).toBeVisible();
    }
  });

  test('cria um novo usuário com perfil', { tag: '@RF06' }, async ({ page }) => {
    const login = `user${Date.now()}`.slice(0, 14);
    await page.getByRole('button', { name: 'Novo Usuário' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await campo(dialog, 'nome').fill('Usuário E2E');
    await campo(dialog, 'login').fill(login);
    await campo(dialog, 'email').fill(emailUnico('user'));
    await campo(dialog, 'perfil').selectOption('recepcionista');
    await campo(dialog, 'password').fill('Senha@123');
    await dialog.getByRole('button', { name: 'Criar' }).click();
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(login)).toBeVisible({ timeout: 10_000 });
  });

  test('log de auditoria lista as ações registradas', { tag: '@RNF06' }, async ({ page }) => {
    await page.getByRole('tab', { name: 'Log de Auditoria' }).click();
    await page.waitForTimeout(800);
    await expect(page.getByRole('table')).toBeVisible();
    for (const col of ['Data/Hora', 'Ação', 'Módulo', 'Resultado']) {
      await expect(page.getByRole('columnheader', { name: col })).toBeVisible();
    }
  });

  test('filtra o log de auditoria por módulo', { tag: '@RNF06' }, async ({ page }) => {
    await page.getByRole('tab', { name: 'Log de Auditoria' }).click();
    await page.getByPlaceholder('Filtrar módulo...').fill('auth');
    await page.waitForTimeout(600);
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('executa backup e registra no log de auditoria', { tag: '@RF08' }, async ({ page }) => {
    await page.getByRole('button', { name: 'Backup' }).click();
    await expect(page.getByText(/Backup registrado/i)).toBeVisible({ timeout: 10_000 });
  });
});
