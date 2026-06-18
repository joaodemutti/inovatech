import { type Page, expect } from '@playwright/test';
import { campo } from '../utils/helpers';

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
    const d = this.page.getByRole('dialog');
    await campo(d, 'nome_completo').fill(data.nome);
    await campo(d, 'cpf').fill(data.cpf);
    await campo(d, 'crm').fill(data.crm);
    await campo(d, 'especialidade').fill(data.especialidade);
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
