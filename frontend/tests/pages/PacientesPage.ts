import { type Page, expect } from '@playwright/test';

export class PacientesPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/pacientes');
    await this.page.waitForLoadState('networkidle');
  }

  async openCreateDialog() {
    await this.page.getByRole('button', { name: 'Novo Paciente' }).click();
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async fillForm(data: {
    nome: string;
    cpf: string;
    telefone?: string;
    email?: string;
    convenio?: string;
  }) {
    await this.page.getByLabel('Nome Completo').fill(data.nome);
    await this.page.getByLabel('CPF').fill(data.cpf);
    if (data.telefone) await this.page.getByLabel('Telefone').fill(data.telefone);
    if (data.email) await this.page.getByLabel('Email').fill(data.email);
    if (data.convenio) await this.page.getByLabel('Convênio').fill(data.convenio);
  }

  async submitForm() {
    await this.page.getByRole('button', { name: /Cadastrar|Salvar/i }).last().click();
  }

  async search(term: string) {
    await this.page.getByPlaceholder('Buscar por nome ou CPF...').fill(term);
  }

  async filterStatus(status: 'Ativo' | 'Inativo' | 'Todos') {
    await this.page.getByRole('combobox').selectOption(status === 'Todos' ? '' : status.toLowerCase());
  }

  async expectPatientInTable(name: string) {
    await expect(this.page.getByText(name)).toBeVisible({ timeout: 8_000 });
  }

  async expectTableVisible() {
    await expect(this.page.getByRole('table')).toBeVisible();
  }

  async clickEdit(name: string) {
    const row = this.page.getByRole('row').filter({ hasText: name });
    await row.hover();
    await row.getByRole('button').first().click();
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async exportExcel() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByRole('button', { name: 'Exportar' }).click(),
    ]);
    return download;
  }
}
