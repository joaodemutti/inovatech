import { test, expect } from '@playwright/test';
import { MedicosPage } from '../pages/MedicosPage';

const NOME_MEDICO = `Dr. Teste ${Date.now()}`;
const CPF_MEDICO = `${Date.now()}`.slice(-11).padStart(11, '0');
const CRM_MEDICO = `CRM${Date.now()}`.slice(-8);

test.describe('Gestão de Médicos', () => {
  let medicosPage: MedicosPage;

  test.beforeEach(async ({ page }) => {
    medicosPage = new MedicosPage(page);
    await medicosPage.goto();
  });

  test('exibe tabela de médicos', async () => {
    await medicosPage.expectTableVisible();
  });

  test('exibe botão Novo Médico para gestor', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Novo Médico' })).toBeVisible();
  });

  test('abre dialog de criação', async () => {
    await medicosPage.openCreateDialog();
  });

  test('cria médico com dados válidos', async ({ page }) => {
    await medicosPage.openCreateDialog();
    await medicosPage.fillForm({
      nome: NOME_MEDICO,
      cpf: CPF_MEDICO,
      crm: CRM_MEDICO,
      especialidade: 'Cardiologia',
    });
    await medicosPage.submitForm();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 8_000 });
    await medicosPage.expectDoctorInTable(NOME_MEDICO);
  });

  test('valida campos obrigatórios', async ({ page }) => {
    await medicosPage.openCreateDialog();
    await page.getByRole('button', { name: 'Cadastrar' }).click();
    await expect(page.getByText(/obrigatório/i).first()).toBeVisible();
  });

  test('busca filtra médicos', async ({ page }) => {
    await medicosPage.search('Cardio');
    await page.waitForTimeout(500);
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('badge de especialidade visível na tabela', async ({ page }) => {
    const rows = page.getByRole('row').filter({ hasNot: page.locator('th') });
    if (await rows.count() === 0) test.skip();
    const badge = rows.first().locator('[class*="badge"], [class*="Badge"]').first();
    await expect(badge).toBeVisible();
  });

  test('exporta Excel', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exportar' }).click(),
    ]);
    expect(download.suggestedFilename()).toContain('.xlsx');
  });
});
