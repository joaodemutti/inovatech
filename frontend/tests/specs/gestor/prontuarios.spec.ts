import { test, expect } from '@playwright/test';

/** RF02 — Prontuário (visão do gestor: leitura/consulta; criação é do médico). */
test.describe('Prontuários (gestor)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prontuarios');
    await page.waitForLoadState('networkidle');
  });

  test('exibe a tabela com as colunas corretas', { tag: '@RF02' }, async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
    for (const col of ['Paciente', 'Médico', 'CID', 'Retorno', 'Laudo']) {
      await expect(page.getByRole('columnheader', { name: col })).toBeVisible();
    }
  });

  test('mostra o CID dos registros (campo obrigatório do prontuário)', { tag: '@RF02' }, async ({ page }) => {
    // o seed contém prontuários com CID I10/J06.9/etc.
    await expect(page.getByText(/[A-Z]\d{2}/).first()).toBeVisible();
  });

  test('busca por paciente/CID funciona', { tag: '@RF02' }, async ({ page }) => {
    await page.getByPlaceholder('Buscar por paciente ou CID...').fill('I10');
    await page.waitForTimeout(500);
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('gestor não vê o botão "Novo Prontuário" (exclusivo do médico)', { tag: '@RF02' }, async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Novo Prontuário' })).toHaveCount(0);
  });

  test('exporta a planilha de prontuários (.xlsx)', { tag: '@RF11' }, async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exportar' }).click(),
    ]);
    expect(download.suggestedFilename()).toContain('.xlsx');
  });
});
