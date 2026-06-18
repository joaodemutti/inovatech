import { test, expect } from '@playwright/test';
import { PERSONAS, campo, legenda, cpfUnico, crmUnico, emailUnico, nomeUnico } from '../../utils/helpers';
import { PacientesPage } from '../../pages/PacientesPage';
import { MedicosPage } from '../../pages/MedicosPage';

/**
 * TOUR COMPLETO (para o vídeo) — percorre TODOS os RF do lado do gestor, com
 * legendas na tela indicando cada passo. RF02 (criação) e RF10 são demonstrados
 * no dual-login.spec.ts (médico + paciente).
 *
 * Gravar:  PWSLOWMO=350 npx playwright test demo/tour-completo --headed
 */
test('Tour completo dos requisitos (gestora Dona Marta)', { tag: '@DEMO' }, async ({ page }) => {
  test.setTimeout(300_000);

  // ── Autenticação (RF de login) ───────────────────────────────────────────
  await page.goto('/login');
  await legenda(page, 'Autenticação — login da Dona Marta (Gestora)');
  await page.getByPlaceholder('Login').fill(PERSONAS.gestor.login);
  await page.getByPlaceholder('Senha').fill(PERSONAS.gestor.password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL(/dashboard/, { timeout: 15_000 });

  // ── RF07 — Dashboard ──────────────────────────────────────────────────────
  await legenda(page, 'RF07 · Dashboard: indicadores em tempo real');
  await expect(page.getByText('Total de Pacientes', { exact: true })).toBeVisible({ timeout: 10_000 });

  // ── RF03 — Cadastro de paciente e médico ─────────────────────────────────
  const pacientes = new PacientesPage(page);
  await pacientes.goto();
  await legenda(page, 'RF03 · Cadastro de pacientes (CPF, contato, convênio)');
  const nomePac = nomeUnico('Paciente');
  await pacientes.openCreateDialog();
  await pacientes.fillForm({ nome: nomePac, cpf: cpfUnico(), telefone: '11999990000', email: emailUnico('demo'), convenio: 'Unimed' });
  await pacientes.submitForm();
  await pacientes.expectPatientInTable(nomePac);

  const medicos = new MedicosPage(page);
  await medicos.goto();
  await legenda(page, 'RF03 · Cadastro de médicos (CRM, especialidade)');
  const nomeMed = nomeUnico('Dr. Médico');
  await medicos.openCreateDialog();
  await medicos.fillForm({ nome: nomeMed, cpf: cpfUnico(), crm: crmUnico(), especialidade: 'Pediatria' });
  await medicos.submitForm();
  await medicos.expectDoctorInTable(nomeMed);

  // ── RF01 — Agenda: agendar consulta ──────────────────────────────────────
  const horario = `21:${String(new Date().getSeconds()).padStart(2, '0')}`;
  const tipo = `Consulta Tour ${Date.now()}`;
  await page.goto('/consultas');
  await page.waitForLoadState('networkidle');
  await legenda(page, 'RF01 · Agenda: agendar consulta (cores por status)');
  await expect(page.locator('.fc')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Nova Consulta' }).click();
  const dlg = page.getByRole('dialog');
  await expect(dlg).toBeVisible();
  await campo(dlg, 'paciente_id').selectOption({ index: 1 });
  await campo(dlg, 'medico_id').selectOption({ index: 1 });
  await campo(dlg, 'data').fill(new Date().toISOString().split('T')[0]);
  await campo(dlg, 'horario').fill(horario);
  await campo(dlg, 'tipo_consulta').fill(tipo);
  await campo(dlg, 'valor').fill('250');
  await dlg.getByRole('button', { name: 'Agendar' }).click();
  await expect(dlg).not.toBeVisible({ timeout: 10_000 });

  // ── RF09 — Consulta "Realizada" gera lançamento financeiro ───────────────
  await legenda(page, 'RF09 · Marcar "Realizada" gera lançamento financeiro automático');
  await page.locator('.fc-event').filter({ hasText: horario }).first().click();
  const dlg2 = page.getByRole('dialog');
  await expect(dlg2).toBeVisible();
  await dlg2.getByRole('button', { name: 'Realizada' }).click();
  await expect(page.getByText(/Status atualizado/i)).toBeVisible({ timeout: 10_000 });

  // ── RF04 — Financeiro ─────────────────────────────────────────────────────
  await page.goto('/financeiro');
  await page.waitForLoadState('networkidle');
  await legenda(page, 'RF04 · Financeiro: receitas, pendências e atrasos');
  await expect(page.getByText('Receita Paga', { exact: true })).toBeVisible();
  await expect(page.getByText(tipo)).toBeVisible({ timeout: 10_000 });

  // ── RF02 — Prontuário (visão; criação é do médico, ver dual-login) ────────
  await page.goto('/prontuarios');
  await page.waitForLoadState('networkidle');
  await legenda(page, 'RF02 · Prontuários: histórico clínico com CID obrigatório');
  await expect(page.getByRole('table')).toBeVisible();

  // ── RF05 — Folha de Ponto ─────────────────────────────────────────────────
  await page.goto('/ponto');
  await page.waitForLoadState('networkidle');
  await legenda(page, 'RF05 · Folha de Ponto: horas trabalhadas, faltas e atrasos');
  await expect(page.getByText('H. Trabalhadas')).toBeVisible();

  // ── RF06 / RNF06 — Administração: usuários e auditoria ────────────────────
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
  await legenda(page, 'RF06 · Administração: gestão de usuários e perfis');
  await expect(page.getByRole('tab', { name: 'Usuários' })).toBeVisible();
  await page.getByRole('tab', { name: 'Log de Auditoria' }).click();
  await legenda(page, 'RNF06 · Log de auditoria — rastreabilidade das ações');
  await expect(page.getByRole('table')).toBeVisible();

  // ── RF08 — Backup ─────────────────────────────────────────────────────────
  await page.getByRole('tab', { name: 'Usuários' }).click();
  await legenda(page, 'RF08 · Backup com registro no log de auditoria');
  await page.getByRole('button', { name: 'Backup' }).click();
  await expect(page.getByText(/Backup registrado/i)).toBeVisible({ timeout: 10_000 });

  // ── RF11 / RF12 — Exportar e Importar Excel ──────────────────────────────
  await page.goto('/pacientes');
  await page.waitForLoadState('networkidle');
  await legenda(page, 'RF11 · Exportar dados em planilha .xlsx');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Exportar' }).click(),
  ]);
  const arquivo = await download.path();
  await legenda(page, 'RF12 · Importar planilha .xlsx (com validação de CPF/CRM)');
  await page.locator('input[type="file"]').setInputFiles(arquivo);
  await expect(page.getByText(/importad|erro/i)).toBeVisible({ timeout: 20_000 });

  await legenda(page, '✓ Tour completo: RF01 a RF12 demonstrados', 1800);
});
