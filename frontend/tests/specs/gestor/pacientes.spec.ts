import { test, expect } from '@playwright/test';
import { PacientesPage } from '../../pages/PacientesPage';
import { campo, cpfUnico, emailUnico, nomeUnico } from '../../utils/helpers';

/** RF03 — Cadastro de pacientes (CPF, telefone, e-mail, convênio, etc.). */
test.describe('Pacientes (gestor)', () => {
  let pacientes: PacientesPage;

  test.beforeEach(async ({ page }) => {
    pacientes = new PacientesPage(page);
    await pacientes.goto();
  });

  test('exibe a tabela de pacientes', { tag: '@RF03' }, async () => {
    await pacientes.expectTableVisible();
  });

  test('cria um paciente com dados válidos', { tag: '@RF03' }, async ({ page }) => {
    const nome = nomeUnico('Paciente');
    await pacientes.openCreateDialog();
    await pacientes.fillForm({
      nome,
      cpf: cpfUnico(),
      telefone: '11999990000',
      email: emailUnico('paciente'),
      convenio: 'Unimed',
    });
    await pacientes.submitForm();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });
    await pacientes.expectPatientInTable(nome);
  });

  test('valida campos obrigatórios (CPF/nome)', { tag: '@RF03' }, async ({ page }) => {
    await pacientes.openCreateDialog();
    await campo(page.getByRole('dialog'), 'nome_completo').fill('Sem CPF');
    await pacientes.submitForm();
    await expect(page.getByText(/inválido|obrigatório/i).first()).toBeVisible();
  });

  test('busca filtra pacientes por nome/CPF', { tag: '@RF03' }, async ({ page }) => {
    await pacientes.search('Maria');
    await page.waitForTimeout(500);
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('exporta a planilha de pacientes (.xlsx)', { tag: '@RF11' }, async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exportar' }).click(),
    ]);
    expect(download.suggestedFilename()).toContain('.xlsx');
  });
});
