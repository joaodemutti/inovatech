import { test, expect } from '@playwright/test';
import { ProntuariosPage } from '../../pages/ProntuariosPage';
import { campo, idPacientePorNome } from '../../utils/helpers';

/** RF02 — Registro de prontuário (CID obrigatório). RF10 — liberação de laudo pelo médico. */

function cidUnico(): string {
  return `Z${Date.now().toString().slice(-3)}`;
}

test.describe('Prontuários (médico)', () => {
  let pront: ProntuariosPage;

  test.beforeEach(async ({ page }) => {
    pront = new ProntuariosPage(page);
    await pront.goto();
  });

  test('médico vê o botão "Novo Prontuário"', { tag: '@RF02' }, async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Novo Prontuário' })).toBeVisible();
  });

  test('RF02: CID é obrigatório', { tag: '@RF02' }, async ({ page }) => {
    await pront.abrirNovo();
    const dialog = page.getByRole('dialog');
    await campo(dialog, 'paciente_id').fill('1');
    await campo(dialog, 'diagnostico').fill('Quadro clínico para teste e2e');
    await campo(dialog, 'prescricao').fill('Conduta clínica para teste e2e');
    await dialog.getByRole('button', { name: 'Criar' }).click();
    await expect(page.getByText('CID obrigatório')).toBeVisible();
  });

  test('RF02: cria prontuário com CID, diagnóstico e prescrição', { tag: '@RF02' }, async ({ page }) => {
    const pacienteId = await idPacientePorNome('Maria Oliveira');
    await pront.abrirNovo();
    await pront.preencherComoMedico({
      pacienteId,
      cid: cidUnico(),
      diagnostico: 'Cefaleia tensional sem sinais de alarme',
      prescricao: 'Dipirona 500mg se dor; reavaliar em 15 dias',
      retornoDias: 15,
    });
    await pront.salvar();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Criado/i)).toBeVisible();
  });

  test('RF10: médico libera o laudo de um prontuário', { tag: '@RF10' }, async ({ page }) => {
    const pacienteId = await idPacientePorNome('Maria Oliveira');
    const cid = cidUnico();
    await pront.abrirNovo();
    await pront.preencherComoMedico({
      pacienteId,
      cid,
      diagnostico: 'Lombalgia aguda mecânica',
      prescricao: 'Anti-inflamatório por 7 dias e repouso relativo',
    });
    await pront.salvar();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });

    await page.getByPlaceholder('Buscar por paciente ou CID...').fill(cid);
    await page.waitForTimeout(400);
    const row = page.getByRole('row').filter({ hasText: cid }).first();
    await row.hover();
    await row.getByRole('button').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: /Liberar Laudo/i }).click();
    await expect(page.getByText(/Laudo liberado/i)).toBeVisible({ timeout: 10_000 });
  });
});
