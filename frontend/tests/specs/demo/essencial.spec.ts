import { test, expect } from '@playwright/test';
import { loginPelaUI, campo, legenda, cpfUnico, emailUnico, nomeUnico } from '../../utils/helpers';
import { PacientesPage } from '../../pages/PacientesPage';

/**
 * FLUXO ESSENCIAL (para o vídeo de ~2 min).
 * Uma única jornada do gestor cobrindo o núcleo do sistema:
 * login (RF-AUTH) → dashboard (RF07) → cadastro (RF03) → agenda (RF01) →
 * realizar consulta (RF09) → conferir no financeiro (RF04) → backup (RF08).
 *
 * Dica de gravação:  PWSLOWMO=350 npx playwright test demo/essencial --headed
 */
test('Fluxo essencial da clínica (gestor)', { tag: '@DEMO' }, async ({ page }) => {
  // Jornada longa + câmera lenta (PWSLOWMO) para o vídeo precisam de mais tempo.
  test.setTimeout(180_000);
  // 1) Login (RF-AUTH) e Dashboard (RF07)
  await loginPelaUI(page, 'gestor');
  await legenda(page, 'RF07 · Dashboard: indicadores da clínica');
  await expect(page.getByText('Total de Pacientes')).toBeVisible({ timeout: 10_000 });

  // 2) Cadastra um paciente (RF03)
  const pacientes = new PacientesPage(page);
  await pacientes.goto();
  await legenda(page, 'RF03 · Cadastro de paciente');
  const nome = nomeUnico('Paciente Demo');
  await pacientes.openCreateDialog();
  await pacientes.fillForm({
    nome,
    cpf: cpfUnico(),
    telefone: '11999990000',
    email: emailUnico('demo'),
    convenio: 'Unimed',
  });
  await pacientes.submitForm();
  await pacientes.expectPatientInTable(nome);

  // 3) Agenda uma consulta para hoje (RF01)
  const hoje = new Date().toISOString().split('T')[0];
  const horario = `21:${String(new Date().getSeconds()).padStart(2, '0')}`;
  const tipo = `Consulta Demo ${Date.now()}`;
  await page.goto('/consultas');
  await page.waitForLoadState('networkidle');
  await legenda(page, 'RF01 · Agendar consulta (cores por status)');
  await expect(page.locator('.fc')).toBeVisible({ timeout: 10_000 });

  await page.getByRole('button', { name: 'Nova Consulta' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await campo(dialog, 'paciente_id').selectOption({ index: 1 });
  await campo(dialog, 'medico_id').selectOption({ index: 1 });
  await campo(dialog, 'data').fill(hoje);
  await campo(dialog, 'horario').fill(horario);
  await campo(dialog, 'tipo_consulta').fill(tipo);
  await campo(dialog, 'valor').fill('250');
  await dialog.getByRole('button', { name: 'Agendar' }).click();
  await expect(dialog).not.toBeVisible({ timeout: 10_000 });

  // 4) Marca a consulta como Realizada (dispara o RF09)
  await legenda(page, 'RF09 · Marcar "Realizada" gera lançamento financeiro');
  await page.locator('.fc-event').filter({ hasText: horario }).first().click();
  const dialog2 = page.getByRole('dialog');
  await expect(dialog2).toBeVisible();
  await dialog2.getByRole('button', { name: 'Realizada' }).click();
  await expect(page.getByText(/Status atualizado/i)).toBeVisible({ timeout: 10_000 });

  // 5) O lançamento financeiro foi criado automaticamente (RF09/RF04)
  await page.goto('/financeiro');
  await page.waitForLoadState('networkidle');
  await legenda(page, 'RF04 · Financeiro: lançamento criado automaticamente');
  await expect(page.getByText(tipo)).toBeVisible({ timeout: 10_000 });

  // 6) Backup com registro no log de auditoria (RF08)
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
  await legenda(page, 'RF08 · Backup com registro no log de auditoria');
  await page.getByRole('button', { name: 'Backup' }).click();
  await expect(page.getByText(/Backup registrado/i)).toBeVisible({ timeout: 10_000 });
});
