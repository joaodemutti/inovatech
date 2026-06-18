import { test, expect } from '@playwright/test';
import { PortalPage } from '../../pages/PortalPage';
import { garantirLaudoLiberado } from '../../utils/helpers';

/** RF10 — Portal do Paciente: consultas próprias e download de laudos liberados. */
test.describe('Portal do Paciente', () => {
  let portal: PortalPage;

  // Garante a precondição (um laudo liberado para Maria) mesmo rodando isolado
  test.beforeAll(async () => {
    await garantirLaudoLiberado();
  });

  test.beforeEach(async ({ page }) => {
    portal = new PortalPage(page);
    await portal.goto();
  });

  test('exibe as consultas e os laudos do paciente', { tag: '@RF10' }, async ({ page }) => {
    await portal.expectAcessoPermitido();
    await expect(page.getByText(/consulta\(s\)/)).toBeVisible();
    await expect(page.getByText(/laudo\(s\) dispon/i)).toBeVisible();
  });

  test('RF10: baixa um laudo liberado (PDF)', { tag: '@RF10' }, async () => {
    // aguarda o laudo liberado renderizar (evita corrida com o carregamento)
    await expect(portal.botoesBaixar().first()).toBeVisible({ timeout: 10_000 });
    const download = await portal.baixarPrimeiroLaudo();
    expect(download.suggestedFilename()).toMatch(/laudo.*\.pdf$/i);
  });
});
