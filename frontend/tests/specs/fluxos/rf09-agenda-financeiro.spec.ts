import { test, expect } from '@playwright/test';
import { authFile, campo } from '../../utils/helpers';

/**
 * RF09 — Integração Agenda → Financeiro.
 * Ao registrar uma consulta como "Realizada", o backend cria automaticamente
 * um lançamento financeiro (servico = tipo da consulta).
 */
test('RF09: consulta "Realizada" gera lançamento financeiro automático', { tag: '@RF09' }, async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: authFile('gestor') });
  const page = await ctx.newPage();

  const marca = `RF09 ${Date.now()}`;
  const hoje = new Date().toISOString().split('T')[0];
  const horario = `21:${String(new Date().getSeconds()).padStart(2, '0')}`;

  // 1) Agenda a consulta (status inicial = agendada)
  await page.goto('/consultas');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.fc')).toBeVisible({ timeout: 10_000 });

  await page.getByRole('button', { name: 'Nova Consulta' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await campo(dialog, 'paciente_id').selectOption({ index: 1 });
  await campo(dialog, 'medico_id').selectOption({ index: 1 });
  await campo(dialog, 'data').fill(hoje);
  await campo(dialog, 'horario').fill(horario);
  await campo(dialog, 'tipo_consulta').fill(marca);
  await campo(dialog, 'valor').fill('199.90');
  await dialog.getByRole('button', { name: 'Agendar' }).click();
  await expect(dialog).not.toBeVisible({ timeout: 10_000 });

  // 2) Reabre o evento e marca como Realizada
  await page.locator('.fc-event').filter({ hasText: horario }).first().click();
  const dialog2 = page.getByRole('dialog');
  await expect(dialog2).toBeVisible();
  await dialog2.getByRole('button', { name: 'Realizada' }).click();
  await expect(page.getByText(/Status atualizado/i)).toBeVisible({ timeout: 10_000 });

  // 3) O lançamento correspondente aparece no Financeiro
  await page.goto('/financeiro');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(marca)).toBeVisible({ timeout: 10_000 });

  await ctx.close();
});
