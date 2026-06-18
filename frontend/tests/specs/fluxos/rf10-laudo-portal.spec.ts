import { test, expect } from '@playwright/test';
import { authFile, idPacientePorNome } from '../../utils/helpers';
import { ProntuariosPage } from '../../pages/ProntuariosPage';
import { PortalPage } from '../../pages/PortalPage';

/**
 * RF10 / RNF04 — Laudo só fica disponível ao paciente APÓS liberação do médico.
 * Fluxo multi-perfil: médico cria laudo pendente → paciente não vê →
 * médico libera → paciente passa a ver e baixa o PDF.
 */
test('RF10: laudo só aparece no portal após liberação do médico', { tag: '@RF10' }, async ({ browser }) => {
  const cid = `Z${Date.now().toString().slice(-4)}`;
  const pacienteId = await idPacientePorNome('Maria Oliveira');

  // 1) Médico cria o prontuário (laudo PENDENTE)
  const medCtx = await browser.newContext({ storageState: authFile('medico') });
  const medPage = await medCtx.newPage();
  const pront = new ProntuariosPage(medPage);
  await pront.goto();
  await pront.abrirNovo();
  await pront.preencherComoMedico({
    pacienteId,
    cid,
    diagnostico: 'Estudo de caso para o fluxo RF10',
    prescricao: 'Conduta de teste para liberação de laudo',
  });
  await pront.salvar();
  await expect(medPage.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });

  // 2) Paciente NÃO vê o laudo pendente
  const pacCtx = await browser.newContext({ storageState: authFile('paciente') });
  const pacPage = await pacCtx.newPage();
  const portal = new PortalPage(pacPage);
  await portal.goto();
  await expect(pacPage.getByText(`CID: ${cid}`)).toHaveCount(0);

  // 3) Médico libera o laudo
  await medPage.getByPlaceholder('Buscar por paciente ou CID...').fill(cid);
  await medPage.waitForTimeout(400);
  const row = medPage.getByRole('row').filter({ hasText: cid }).first();
  await row.hover();
  await row.getByRole('button').first().click();
  await expect(medPage.getByRole('dialog')).toBeVisible();
  await medPage.getByRole('button', { name: /Liberar Laudo/i }).click();
  await expect(medPage.getByText(/Laudo liberado/i)).toBeVisible({ timeout: 10_000 });

  // 4) Paciente agora vê o laudo e consegue baixá-lo
  await portal.goto();
  await expect(pacPage.getByText(`CID: ${cid}`)).toBeVisible({ timeout: 10_000 });
  const download = await portal.baixarPrimeiroLaudo();
  expect(download.suggestedFilename()).toMatch(/laudo.*\.pdf$/i);

  await medCtx.close();
  await pacCtx.close();
});
