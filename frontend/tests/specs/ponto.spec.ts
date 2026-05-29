import { test, expect } from '@playwright/test';

test.describe('Controle de Ponto', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ponto');
    await page.waitForLoadState('networkidle');
  });

  test('exibe cards de resumo', async ({ page }) => {
    await expect(page.getByText('H. Trabalhadas')).toBeVisible();
    await expect(page.getByText('Faltas')).toBeVisible();
    await expect(page.getByText('Atrasos')).toBeVisible();
    await expect(page.getByText('H. Extras')).toBeVisible();
  });

  test('exibe filtros de data', async ({ page }) => {
    await expect(page.getByLabel('De')).toBeVisible();
    await expect(page.getByLabel('Até')).toBeVisible();
  });

  test('filtro de data filtra registros', async ({ page }) => {
    const hoje = new Date().toISOString().split('T')[0];
    await page.getByLabel('De').fill(hoje);
    await page.getByLabel('Até').fill(hoje);
    await page.waitForTimeout(500);
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('botão Registrar abre dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Registrar' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Registrar Ponto')).toBeVisible();
  });

  test('dialog de ponto tem campos de entrada e saída', async ({ page }) => {
    await page.getByRole('button', { name: 'Registrar' }).click();
    await expect(page.getByRole('dialog').getByLabel('Entrada')).toBeVisible();
    await expect(page.getByRole('dialog').getByLabel('Saída')).toBeVisible();
  });

  test('exporta Excel de ponto (gestor)', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exportar' }).click(),
    ]);
    expect(download.suggestedFilename()).toContain('.xlsx');
  });
});
