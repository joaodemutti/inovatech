import { type Page, expect } from '@playwright/test';
import { campo } from '../utils/helpers';

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
    const d = this.page.getByRole('dialog');
    await campo(d, 'paciente_id').selectOption({ index: data.pacienteIndex ?? 1 });
    await campo(d, 'medico_id').selectOption({ index: data.medicoIndex ?? 1 });
    await campo(d, 'data').fill(data.data);
    await campo(d, 'horario').fill(data.horario);
    await campo(d, 'tipo_consulta').fill(data.tipo);
    await campo(d, 'valor').fill(data.valor);
  }

  async submitForm() {
    await this.page.getByRole('button', { name: 'Agendar' }).click();
  }

  async expectLegendVisible() {
    await expect(this.page.getByText('agendada')).toBeVisible();
    await expect(this.page.getByText('confirmada')).toBeVisible();
  }
}
