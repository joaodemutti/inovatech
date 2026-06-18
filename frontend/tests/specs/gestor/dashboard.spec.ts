import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../pages/DashboardPage';

/** RF07 — Painel com indicadores: total de pacientes, consultas do dia, receita e pendências. */
test.describe('Dashboard (gestor)', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.goto();
  });

  test('exibe os 4 indicadores (KPI)', { tag: '@RF07' }, async () => {
    await dashboard.expectKpiCards();
  });

  test('exibe os gráficos financeiros e de consultas', { tag: '@RF07' }, async () => {
    await dashboard.expectChartsVisible();
  });

  test('exibe consultas de hoje e pacientes recentes', { tag: '@RF07' }, async ({ page }) => {
    await expect(page.getByText('Consultas de Hoje')).toBeVisible();
    await expect(page.getByText('Pacientes Recentes')).toBeVisible();
  });

  test('navega para Pacientes e Consultas pela sidebar', { tag: '@RF07' }, async ({ page }) => {
    await page.getByRole('link', { name: 'Pacientes' }).click();
    await expect(page).toHaveURL(/pacientes/);
    await page.getByRole('link', { name: 'Consultas' }).click();
    await expect(page).toHaveURL(/consultas/);
  });

  test('logout encerra a sessão e volta ao login', { tag: '@RF-AUTH' }, async ({ page }) => {
    await page.getByTitle('Sair').click();
    await expect(page).toHaveURL(/login/, { timeout: 10_000 });
  });
});
