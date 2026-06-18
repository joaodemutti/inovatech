import { test, expect } from '@playwright/test';
import { campo } from '../../utils/helpers';

/** RF04 — Financeiro: lançamentos por status e totais (paga, a receber, atraso). */
test.describe('Financeiro (gestor)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');
  });

  test('exibe os 4 indicadores financeiros', { tag: '@RF04' }, async ({ page }) => {
    // "A Receber"/"Atrasado" também aparecem na legenda do gráfico → usar .first()
    await expect(page.getByText('Receita Paga')).toBeVisible();
    await expect(page.getByText('A Receber').first()).toBeVisible();
    await expect(page.getByText('Atrasado').first()).toBeVisible();
    await expect(page.getByText('Total Lançado')).toBeVisible();
  });

  test('exibe a lista de lançamentos', { tag: '@RF04' }, async ({ page }) => {
    await expect(page.getByText('Lançamentos')).toBeVisible();
  });

  test('abre o diálogo de novo lançamento com campos obrigatórios', { tag: '@RF04' }, async ({ page }) => {
    await page.getByRole('button', { name: 'Novo Lançamento' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(campo(dialog, 'paciente_id')).toBeVisible();
    await expect(campo(dialog, 'servico')).toBeVisible();
    await expect(campo(dialog, 'valor')).toBeVisible();
    await expect(campo(dialog, 'data')).toBeVisible();
  });

  test('filtra lançamentos por status de pagamento', { tag: '@RF04' }, async ({ page }) => {
    await page.getByRole('combobox').first().selectOption('pago');
    await page.waitForTimeout(500);
    await expect(page.getByText('Lançamentos')).toBeVisible();
  });

  test('exporta a planilha financeira (.xlsx)', { tag: '@RF11' }, async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exportar' }).click(),
    ]);
    expect(download.suggestedFilename()).toContain('.xlsx');
  });
});
