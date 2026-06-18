import { test, expect, type Page } from '@playwright/test';
import { campo } from '../../utils/helpers';

/** RF01 — Agendar, confirmar e cancelar consultas (perfil recepcionista). */

const HOJE = new Date().toISOString().split('T')[0];

async function agendar(
  page: Page,
  dados: { data: string; horario: string; tipo: string; valor: string },
) {
  await page.getByRole('button', { name: 'Nova Consulta' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await campo(dialog, 'paciente_id').selectOption({ index: 1 });
  await campo(dialog, 'medico_id').selectOption({ index: 1 });
  await campo(dialog, 'data').fill(dados.data);
  await campo(dialog, 'horario').fill(dados.horario);
  await campo(dialog, 'tipo_consulta').fill(dados.tipo);
  await campo(dialog, 'valor').fill(dados.valor);
  await dialog.getByRole('button', { name: 'Agendar' }).click();
}

test.describe('Agenda (recepcionista)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/consultas');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.fc')).toBeVisible({ timeout: 10_000 });
  });

  test('agenda uma nova consulta', { tag: '@RF01' }, async ({ page }) => {
    await agendar(page, { data: HOJE, horario: '22:15', tipo: 'Clínica Geral', valor: '150' });
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Agendado/i)).toBeVisible();
    await expect(page.locator('.fc-event').filter({ hasText: '22:15' }).first()).toBeVisible();
  });

  test('confirma uma consulta agendada (RF01: status/cores)', { tag: '@RF01' }, async ({ page }) => {
    await agendar(page, { data: HOJE, horario: '22:45', tipo: 'Retorno', valor: '120' });
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });

    await page.locator('.fc-event').filter({ hasText: '22:45' }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Confirmar' }).click();
    await expect(page.getByText(/Status atualizado/i)).toBeVisible({ timeout: 10_000 });
  });
});
