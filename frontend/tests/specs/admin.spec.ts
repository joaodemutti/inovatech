import { test, expect } from '@playwright/test';

test.describe('Administração', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
  });

  test('exibe tabs Usuários e Log de Auditoria', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Usuários' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Log de Auditoria' })).toBeVisible();
  });

  test('tab Usuários exibe tabela', async ({ page }) => {
    await page.getByRole('tab', { name: 'Usuários' }).click();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('tabela de usuários tem colunas corretas', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Nome' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Perfil' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
  });

  test('botão Novo Usuário abre dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Novo Usuário' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Novo Usuário')).toBeVisible();
  });

  test('dialog de criação tem campos obrigatórios', async ({ page }) => {
    await page.getByRole('button', { name: 'Novo Usuário' }).click();
    await expect(page.getByLabel('Nome')).toBeVisible();
    await expect(page.getByLabel('Login')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Perfil')).toBeVisible();
    await expect(page.getByLabel('Senha')).toBeVisible();
  });

  test('tab Log de Auditoria exibe tabela de logs', async ({ page }) => {
    await page.getByRole('tab', { name: 'Log de Auditoria' }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('filtro de módulo funciona na auditoria', async ({ page }) => {
    await page.getByRole('tab', { name: 'Log de Auditoria' }).click();
    await page.getByPlaceholder('Filtrar módulo...').fill('auth');
    await page.waitForTimeout(500);
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('filtro de resultado funciona na auditoria', async ({ page }) => {
    await page.getByRole('tab', { name: 'Log de Auditoria' }).click();
    await page.getByRole('combobox').selectOption('sucesso');
    await page.waitForTimeout(500);
    await expect(page.getByRole('table')).toBeVisible();
  });
});
