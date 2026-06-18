import { test, expect } from '@playwright/test';
import { MedicosPage } from '../../pages/MedicosPage';
import { cpfUnico, crmUnico, nomeUnico } from '../../utils/helpers';

/** RF03 — Cadastro de médicos (CRM, especialidade). */
test.describe('Médicos (gestor)', () => {
  let medicos: MedicosPage;

  test.beforeEach(async ({ page }) => {
    medicos = new MedicosPage(page);
    await medicos.goto();
  });

  test('exibe a tabela de médicos', { tag: '@RF03' }, async () => {
    await medicos.expectTableVisible();
  });

  test('cria um médico com dados válidos', { tag: '@RF03' }, async ({ page }) => {
    const nome = nomeUnico('Dr. Médico');
    await medicos.openCreateDialog();
    await medicos.fillForm({
      nome,
      cpf: cpfUnico(),
      crm: crmUnico(),
      especialidade: 'Cardiologia',
    });
    await medicos.submitForm();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });
    await medicos.expectDoctorInTable(nome);
  });

  test('valida campos obrigatórios', { tag: '@RF03' }, async ({ page }) => {
    await medicos.openCreateDialog();
    await page.getByRole('button', { name: 'Cadastrar' }).click();
    await expect(page.getByText(/obrigatório|inválido/i).first()).toBeVisible();
  });

  test('exporta a planilha de médicos (.xlsx)', { tag: '@RF11' }, async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exportar' }).click(),
    ]);
    expect(download.suggestedFilename()).toContain('.xlsx');
  });
});
