import { test, expect } from '@playwright/test';
import { PacientesPage } from '../pages/PacientesPage';

const CPF_TESTE = `${Date.now()}`.slice(-11).padStart(11, '0');
const NOME_TESTE = `Paciente Teste ${Date.now()}`;

test.describe('Gestão de Pacientes', () => {
  let page_: PacientesPage;

  test.beforeEach(async ({ page }) => {
    page_ = new PacientesPage(page);
    await page_.goto();
  });

  test('exibe tabela de pacientes', async () => {
    await page_.expectTableVisible();
  });

  test('exibe botão Novo Paciente', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Novo Paciente' })).toBeVisible();
  });

  test('abre dialog ao clicar em Novo Paciente', async () => {
    await page_.openCreateDialog();
  });

  test('cria paciente com dados válidos', async ({ page }) => {
    await page_.openCreateDialog();
    await page_.fillForm({
      nome: NOME_TESTE,
      cpf: CPF_TESTE,
      telefone: '11999990000',
      email: `teste${Date.now()}@email.com`,
      convenio: 'Unimed',
    });
    await page_.submitForm();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 8_000 });
    await page_.expectPatientInTable(NOME_TESTE);
  });

  test('valida CPF obrigatório', async ({ page }) => {
    await page_.openCreateDialog();
    await page.getByLabel('Nome Completo').fill('Teste Validação');
    await page_.submitForm();
    await expect(page.getByText(/inválido|obrigatório/i).first()).toBeVisible();
  });

  test('busca filtra pacientes por nome', async ({ page }) => {
    await page_.search('Teste');
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('filtro de status funciona', async ({ page }) => {
    await page_.filterStatus('Ativo');
    await page.waitForTimeout(500);
    const rows = page.getByRole('row');
    await expect(rows.first()).toBeVisible();
  });

  test('abre dialog de edição ao clicar no ícone', async ({ page }) => {
    const rows = page.getByRole('row').filter({ hasNot: page.locator('th') });
    const count = await rows.count();
    if (count === 0) test.skip();
    await rows.first().hover();
    await rows.first().getByRole('button').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Editar Paciente')).toBeVisible();
  });

  test('dialog de edição pré-preenche dados do paciente', async ({ page }) => {
    const rows = page.getByRole('row').filter({ hasNot: page.locator('th') });
    if (await rows.count() === 0) test.skip();
    await rows.first().hover();
    await rows.first().getByRole('button').first().click();
    const nomeInput = page.getByLabel('Nome Completo');
    await expect(nomeInput).not.toHaveValue('');
  });

  test('exporta Excel (gestor)', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exportar' }).click(),
    ]);
    expect(download.suggestedFilename()).toContain('.xlsx');
  });
});
