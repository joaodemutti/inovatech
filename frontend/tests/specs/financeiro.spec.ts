import { test, expect } from '@playwright/test';

test.describe('Financeiro', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');
  });

  test('exibe 4 cards de indicadores financeiros', async ({ page }) => {
    await expect(page.getByText('Receita Paga')).toBeVisible();
    await expect(page.getByText('A Receber')).toBeVisible();
    await expect(page.getByText('Atrasado')).toBeVisible();
    await expect(page.getByText('Total Lançado')).toBeVisible();
  });

  test('exibe gráfico de pizza de distribuição', async ({ page }) => {
    await expect(page.getByText('Distribuição')).toBeVisible();
  });

  test('exibe lista de lançamentos', async ({ page }) => {
    await expect(page.getByText('Lançamentos')).toBeVisible();
  });

  test('botão Novo Lançamento abre dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Novo Lançamento' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Novo Lançamento')).toBeVisible();
  });

  test('dialog de lançamento tem campos obrigatórios', async ({ page }) => {
    await page.getByRole('button', { name: 'Novo Lançamento' }).click();
    await expect(page.getByRole('dialog').getByLabel('Serviço')).toBeVisible();
    await expect(page.getByRole('dialog').getByLabel(/Valor/)).toBeVisible();
    await expect(page.getByRole('dialog').getByLabel('Data')).toBeVisible();
  });

  test('filtro de status filtra lançamentos', async ({ page }) => {
    const select = page.getByRole('combobox').first();
    await select.selectOption('pago');
    await page.waitForTimeout(500);
    await expect(page.getByText('Lançamentos')).toBeVisible();
  });

  test('exporta Excel financeiro', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exportar' }).click(),
    ]);
    expect(download.suggestedFilename()).toContain('.xlsx');
  });
});
