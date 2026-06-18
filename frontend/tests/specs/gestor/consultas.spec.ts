import { test, expect } from '@playwright/test';
import { ConsultasPage } from '../../pages/ConsultasPage';
import { campo } from '../../utils/helpers';

/** RF01 — Agenda: calendário, sistema de cores por status e visualizações. */
test.describe('Agenda de Consultas (gestor)', () => {
  let consultas: ConsultasPage;

  test.beforeEach(async ({ page }) => {
    consultas = new ConsultasPage(page);
    await consultas.goto();
  });

  test('exibe o calendário', { tag: '@RF01' }, async () => {
    await consultas.expectCalendarVisible();
  });

  test('exibe a legenda de status com cores', { tag: '@RF01' }, async ({ page }) => {
    for (const status of ['agendada', 'confirmada', 'realizada', 'cancelada']) {
      await expect(page.getByText(status, { exact: true })).toBeVisible();
    }
  });

  test('alterna entre as visualizações Mês/Semana/Dia', { tag: '@RF01' }, async ({ page }) => {
    await consultas.expectCalendarVisible();
    await page.getByRole('button', { name: 'Semana' }).click();
    await expect(page.locator('.fc-timeGridWeek-view')).toBeVisible();
    await page.getByRole('button', { name: 'Dia' }).click();
    await expect(page.locator('.fc-timeGridDay-view')).toBeVisible();
    await page.getByRole('button', { name: 'Mês' }).click();
    await expect(page.locator('.fc-dayGridMonth-view')).toBeVisible();
  });

  test('abre o diálogo de nova consulta com campos obrigatórios', { tag: '@RF01' }, async ({ page }) => {
    await consultas.openCreateDialog();
    const dialog = page.getByRole('dialog');
    await expect(campo(dialog, 'paciente_id')).toBeVisible();
    await expect(campo(dialog, 'data')).toBeVisible();
    await expect(campo(dialog, 'horario')).toBeVisible();
    await expect(campo(dialog, 'tipo_consulta')).toBeVisible();
    await expect(campo(dialog, 'valor')).toBeVisible();
  });

  test('exporta a planilha de consultas (.xlsx)', { tag: '@RF11' }, async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exportar' }).click(),
    ]);
    expect(download.suggestedFilename()).toContain('.xlsx');
  });
});
