import { type Page, expect } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard');
  }

  async expectKpiCards() {
    await expect(this.page.getByText('Total de Pacientes')).toBeVisible();
    await expect(this.page.getByText('Consultas Hoje')).toBeVisible();
    await expect(this.page.getByText('Receita do Mês')).toBeVisible();
    await expect(this.page.getByText('Valores Pendentes')).toBeVisible();
  }

  async expectChartsVisible() {
    await expect(this.page.getByText('Desempenho Financeiro')).toBeVisible();
    await expect(this.page.getByText('Consultas por Mês')).toBeVisible();
  }

  async expectSidebarVisible() {
    await expect(this.page.getByText('Clínica Vida Plena')).toBeVisible();
  }
}
