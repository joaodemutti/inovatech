import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Dashboard', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.goto();
  });

  test('exibe os 4 cards KPI', async () => {
    await dashboard.expectKpiCards();
  });

  test('exibe gráficos financeiros', async () => {
    await dashboard.expectChartsVisible();
  });

  test('exibe sidebar com navegação', async () => {
    await dashboard.expectSidebarVisible();
  });

  test('sidebar colapsa ao clicar no botão', async ({ page }) => {
    await dashboard.goto();
    const toggleBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
    await toggleBtn.click();
    await expect(page.getByText('Clínica Vida Plena')).not.toBeVisible();
  });

  test('exibe tabela de consultas de hoje', async ({ page }) => {
    await dashboard.goto();
    await expect(page.getByText('Consultas de Hoje')).toBeVisible();
  });

  test('exibe lista de pacientes recentes', async ({ page }) => {
    await dashboard.goto();
    await expect(page.getByText('Pacientes Recentes')).toBeVisible();
  });

  test('navega para Pacientes via sidebar', async ({ page }) => {
    await dashboard.goto();
    await page.getByRole('link', { name: 'Pacientes' }).click();
    await expect(page).toHaveURL(/pacientes/);
  });

  test('navega para Consultas via sidebar', async ({ page }) => {
    await dashboard.goto();
    await page.getByRole('link', { name: 'Consultas' }).click();
    await expect(page).toHaveURL(/consultas/);
  });

  test('logout redireciona para login', async ({ page }) => {
    await dashboard.goto();
    await page.getByTitle('Sair').click();
    await expect(page).toHaveURL(/login/, { timeout: 8_000 });
  });
});
