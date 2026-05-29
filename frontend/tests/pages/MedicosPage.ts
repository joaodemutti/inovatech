import { type Page, expect } from '@playwright/test';

export class MedicosPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/medicos');
    await this.page.waitForLoadState('networkidle');
  }

  async openCreateDialog() {
    await this.page.getByRole('button', { name: 'Novo Médico' }).click();
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async fillForm(data: {
    nome: string;
    cpf: string;
    crm: string;
    especialidade: string;
  }) {
    await this.page.getByLabel('Nome Completo').fill(data.nome);
    await this.page.getByLabel('CPF').fill(data.cpf);
    await this.page.getByLabel('CRM').fill(data.crm);
    await this.page.getByLabel('Especialidade').fill(data.especialidade);
  }

  async submitForm() {
    await this.page.getByRole('button', { name: /Cadastrar|Salvar/i }).last().click();
  }

  async search(term: string) {
    await this.page.getByPlaceholder('Buscar...').fill(term);
  }

  async expectDoctorInTable(name: string) {
    await expect(this.page.getByText(name)).toBeVisible({ timeout: 8_000 });
  }

  async expectTableVisible() {
    await expect(this.page.getByRole('table')).toBeVisible();
  }
}
