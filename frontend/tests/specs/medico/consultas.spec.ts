import { test, expect } from '@playwright/test';

/** RF01 / RNF05 — Médico visualiza a agenda, mas não agenda nem exporta. */
test.describe('Agenda (médico — somente leitura)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/consultas');
    await page.waitForLoadState('networkidle');
  });

  test('médico visualiza o calendário e a legenda', { tag: '@RF01' }, async ({ page }) => {
    await expect(page.locator('.fc')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('agendada', { exact: true })).toBeVisible();
  });

  test('médico não vê o botão "Nova Consulta"', { tag: '@RNF05' }, async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Nova Consulta' })).toHaveCount(0);
  });

  test('médico não vê as ações de Excel (exclusivas do gestor)', { tag: '@RNF05' }, async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Exportar' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Importar' })).toHaveCount(0);
  });
});
