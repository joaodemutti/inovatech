import { test, expect } from '@playwright/test';

test.describe('Prontuários', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prontuarios');
    await page.waitForLoadState('networkidle');
  });

  test('exibe tabela de prontuários', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('exibe botão exportar para gestor', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Exportar' })).toBeVisible();
  });

  test('busca por paciente funciona', async ({ page }) => {
    await page.getByPlaceholder(/Buscar/i).fill('Silva');
    await page.waitForTimeout(500);
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('colunas corretas na tabela', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Paciente' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Médico' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'CID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Laudo' })).toBeVisible();
  });

  test('dialog de prontuário abre ao clicar em editar', async ({ page }) => {
    const rows = page.getByRole('row').filter({ hasNot: page.locator('th') });
    if (await rows.count() === 0) test.skip();
    await rows.first().hover();
    await rows.first().getByRole('button').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('exporta Excel de prontuários', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exportar' }).click(),
    ]);
    expect(download.suggestedFilename()).toContain('.xlsx');
  });
});
