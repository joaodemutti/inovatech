import { test, expect } from '@playwright/test';
import { PacientesPage } from '../../pages/PacientesPage';
import { MedicosPage } from '../../pages/MedicosPage';
import { cpfUnico, crmUnico, emailUnico, nomeUnico } from '../../utils/helpers';

/** RF03 — Recepcionista também cadastra pacientes e médicos. */
test.describe('Cadastros (recepcionista)', () => {
  test('cadastra um paciente', { tag: '@RF03' }, async ({ page }) => {
    const pacientes = new PacientesPage(page);
    await pacientes.goto();
    const nome = nomeUnico('Paciente Recep');
    await pacientes.openCreateDialog();
    await pacientes.fillForm({
      nome,
      cpf: cpfUnico(),
      telefone: '11988887777',
      email: emailUnico('recep'),
      convenio: 'Bradesco Saúde',
    });
    await pacientes.submitForm();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });
    await pacientes.expectPatientInTable(nome);
  });

  test('cadastra um médico', { tag: '@RF03' }, async ({ page }) => {
    const medicos = new MedicosPage(page);
    await medicos.goto();
    const nome = nomeUnico('Dr. Recep');
    await medicos.openCreateDialog();
    await medicos.fillForm({
      nome,
      cpf: cpfUnico(),
      crm: crmUnico(),
      especialidade: 'Pediatria',
    });
    await medicos.submitForm();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });
    await medicos.expectDoctorInTable(nome);
  });
});
