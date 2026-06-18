import { test, expect } from '@playwright/test';
import { campo } from '../../utils/helpers';

/** RF05 — Folha de Ponto: entrada/saída, horas trabalhadas e classificação da situação. */
test.describe('Controle de Ponto (gestor)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ponto');
    await page.waitForLoadState('networkidle');
  });

  test('exibe os cards de resumo (horas, faltas, atrasos, extras)', { tag: '@RF05' }, async ({ page }) => {
    await expect(page.getByText('H. Trabalhadas')).toBeVisible();
    await expect(page.getByText('Faltas')).toBeVisible();
    await expect(page.getByText('Atrasos')).toBeVisible();
    await expect(page.getByText('H. Extras')).toBeVisible();
  });

  test('filtra registros por período', { tag: '@RF05' }, async ({ page }) => {
    // os filtros "De"/"Até" são inputs date (não registrados) no topo da página
    const datas = page.locator('input[type="date"]');
    await expect(datas.nth(0)).toBeVisible();
    await expect(datas.nth(1)).toBeVisible();
    await datas.nth(0).fill('2026-05-01');
    await datas.nth(1).fill('2026-05-31');
    await page.waitForTimeout(500);
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('abre o diálogo de registro com entrada e saída', { tag: '@RF05' }, async ({ page }) => {
    await page.getByRole('button', { name: 'Registrar' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(campo(dialog, 'entrada')).toBeVisible();
    await expect(campo(dialog, 'saida')).toBeVisible();
  });

  test('exporta a planilha de ponto (.xlsx)', { tag: '@RF11' }, async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exportar' }).click(),
    ]);
    expect(download.suggestedFilename()).toContain('.xlsx');
  });
});
