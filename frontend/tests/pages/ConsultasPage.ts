import { type Page, expect } from '@playwright/test';

export class ConsultasPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/consultas');
    await this.page.waitForLoadState('networkidle');
  }

  async expectCalendarVisible() {
    await expect(this.page.locator('.fc')).toBeVisible({ timeout: 10_000 });
  }

  async openCreateDialog() {
    await this.page.getByRole('button', { name: 'Nova Consulta' }).click();
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async fillForm(data: {
    pacienteIndex?: number;
    medicoIndex?: number;
    data: string;
    horario: string;
    tipo: string;
    valor: string;
  }) {
    const pacienteSelect = this.page.getByRole('dialog').locator('select').first();
    await pacienteSelect.selectOption({ index: data.pacienteIndex ?? 1 });

    const medicoSelect = this.page.getByRole('dialog').locator('select').nth(1);
    await medicoSelect.selectOption({ index: data.medicoIndex ?? 1 });

    await this.page.getByRole('dialog').getByLabel('Data').fill(data.data);
    await this.page.getByRole('dialog').getByLabel('Horário').fill(data.horario);
    await this.page.getByRole('dialog').getByLabel('Tipo').fill(data.tipo);
    await this.page.getByRole('dialog').getByLabel(/Valor/).fill(data.valor);
  }

  async submitForm() {
    await this.page.getByRole('button', { name: 'Agendar' }).click();
  }

  async expectLegendVisible() {
    await expect(this.page.getByText('agendada')).toBeVisible();
    await expect(this.page.getByText('confirmada')).toBeVisible();
  }
}
