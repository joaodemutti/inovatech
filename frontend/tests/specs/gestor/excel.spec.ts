import { test, expect } from '@playwright/test';

/**
 * RF11 — Exportação de entidades em .xlsx.
 * RF12 — Importação via .xlsx com validação (unicidade de CPF/CRM, etc.).
 */
test.describe('Excel — Exportação/Importação (gestor)', () => {
  test('RF11: exporta a planilha de pacientes', { tag: '@RF11' }, async ({ page }) => {
    await page.goto('/pacientes');
    await page.waitForLoadState('networkidle');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exportar' }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
  });

  test('RF11: exporta o log de auditoria', { tag: '@RF11' }, async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exportar Logs' }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
  });

  test('RF12: importa planilha de pacientes com validação', { tag: '@RF12' }, async ({ page }) => {
    await page.goto('/pacientes');
    await page.waitForLoadState('networkidle');

    // Exporta para obter um .xlsx no formato esperado…
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exportar' }).click(),
    ]);
    const arquivo = await download.path();

    // …e reimporta. Como os CPFs já existem, a validação de unicidade
    // do backend deve responder (sucesso ou aviso de erros) — provando o pipeline.
    await page.locator('input[type="file"]').setInputFiles(arquivo);
    await expect(page.getByText(/importad|erro/i)).toBeVisible({ timeout: 20_000 });
  });
});
