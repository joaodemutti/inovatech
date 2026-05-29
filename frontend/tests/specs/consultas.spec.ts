import { test, expect } from '@playwright/test';
import { ConsultasPage } from '../pages/ConsultasPage';

test.describe('Agenda de Consultas', () => {
  let consultasPage: ConsultasPage;

  test.beforeEach(async ({ page }) => {
    consultasPage = new ConsultasPage(page);
    await consultasPage.goto();
  });

  test('exibe calendário FullCalendar', async () => {
    await consultasPage.expectCalendarVisible();
  });

  test('exibe legenda de status com cores', async () => {
    await consultasPage.expectLegendVisible();
  });

  test('exibe botão Nova Consulta', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Nova Consulta' })).toBeVisible();
  });

  test('abre dialog de nova consulta', async () => {
    await consultasPage.openCreateDialog();
  });

  test('dialog de consulta tem campos obrigatórios', async ({ page }) => {
    await consultasPage.openCreateDialog();
    await expect(page.getByRole('dialog').getByLabel('Data')).toBeVisible();
    await expect(page.getByRole('dialog').getByLabel('Horário')).toBeVisible();
    await expect(page.getByRole('dialog').getByLabel('Tipo')).toBeVisible();
  });

  test('alterna entre vistas do calendário', async ({ page }) => {
    await consultasPage.expectCalendarVisible();
    await page.getByRole('button', { name: 'Semana' }).click();
    await expect(page.locator('.fc-timeGridWeek-view')).toBeVisible();
    await page.getByRole('button', { name: 'Dia' }).click();
    await expect(page.locator('.fc-timeGridDay-view')).toBeVisible();
    await page.getByRole('button', { name: 'Mês' }).click();
    await expect(page.locator('.fc-dayGridMonth-view')).toBeVisible();
  });

  test('navega entre meses no calendário', async ({ page }) => {
    await consultasPage.expectCalendarVisible();
    const titleBefore = await page.locator('.fc-toolbar-title').textContent();
    await page.getByRole('button', { name: 'próximo' }).first().click();
    const titleAfter = await page.locator('.fc-toolbar-title').textContent();
    expect(titleBefore).not.toBe(titleAfter);
  });

  test('exporta Excel de consultas', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exportar' }).click(),
    ]);
    expect(download.suggestedFilename()).toContain('.xlsx');
  });
});
