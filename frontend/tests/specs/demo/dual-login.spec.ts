import { test, expect, chromium, type Page } from '@playwright/test';
import { authFile, idPacientePorNome, BASE_URL, legenda } from '../../utils/helpers';
import { ProntuariosPage } from '../../pages/ProntuariosPage';
import { PortalPage } from '../../pages/PortalPage';

/**
 * DOIS LOGINS SIMULTÂNEOS, INTERAGINDO EM TEMPO REAL (para o vídeo).
 * Duas janelas lado a lado — médico (esquerda) e paciente (direita) — agindo de
 * forma intercalada/concorrente para demonstrar o RF10 ao vivo: enquanto o
 * médico libera o laudo, o portal do paciente fica atualizando e o laudo "surge"
 * no momento da liberação.
 *
 * Gravação (janelas visíveis, em câmera lenta):
 *   PWSLOWMO=450 npx playwright test demo/dual-login --headed
 */

/** Recarrega o portal do paciente até o laudo do CID aparecer (efeito "ao vivo"). */
async function observarAteAparecer(pacPage: Page, cid: string) {
  await expect(async () => {
    await pacPage.reload();
    await expect(pacPage.getByText(`CID: ${cid}`)).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 25_000, intervals: [800, 800, 1200] });
}

test('Dois logins ao mesmo tempo, interagindo: médico libera e o paciente recebe ao vivo (RF10)', { tag: '@DEMO' }, async ({}, testInfo) => {
  // Dois navegadores + câmera lenta + polling ao vivo precisam de mais tempo.
  test.setTimeout(180_000);
  const headed = testInfo.project.use.headless === false || process.env.DEMO_HEADED === '1';
  // Câmera lenta via PWSLOWMO (vale também em headless, para gerar vídeos bem ritmados)
  const slowMo = Number(process.env.PWSLOWMO ?? (headed ? 350 : 0));
  const cid = `Z${Date.now().toString().slice(-4)}`;
  const pacienteId = await idPacientePorNome('Maria Oliveira');

  // Duas janelas grandes lado a lado (esquerda = médico, direita = paciente)
  const navMedico = await chromium.launch({ headless: !headed, slowMo, args: ['--window-position=0,0', '--window-size=950,1000'] });
  const navPaciente = await chromium.launch({ headless: !headed, slowMo, args: ['--window-position=958,0', '--window-size=950,1000'] });

  const viewport = { width: 940, height: 920 };
  // Grava um vídeo .webm de cada janela (médico/paciente) em videos-demo/
  const ctxMedico = await navMedico.newContext({
    storageState: authFile('medico'), baseURL: BASE_URL, viewport, locale: 'pt-BR',
    recordVideo: { dir: 'videos-demo/medico', size: viewport },
  });
  const ctxPaciente = await navPaciente.newContext({
    storageState: authFile('paciente'), baseURL: BASE_URL, viewport, locale: 'pt-BR',
    recordVideo: { dir: 'videos-demo/paciente', size: viewport },
  });

  const medPage = await ctxMedico.newPage();
  const pacPage = await ctxPaciente.newPage();
  const prontuarios = new ProntuariosPage(medPage);
  const portal = new PortalPage(pacPage);

  try {
    // 1) As duas sessões abrem AO MESMO TEMPO
    await Promise.all([prontuarios.goto(), portal.goto()]);
    await Promise.all([
      legenda(medPage, 'Médico — Dr. Carlos Lima (Prontuários)'),
      legenda(pacPage, 'Paciente — Maria Oliveira (Portal): sem o laudo ainda'),
    ]);
    await expect(pacPage.getByText(`CID: ${cid}`)).toHaveCount(0);

    // 2) Enquanto o médico abre o formulário, o paciente confere o portal (concorrente)
    await Promise.all([prontuarios.abrirNovo(), portal.goto()]);
    await legenda(medPage, 'RF02 · Médico cria prontuário (CID obrigatório)');

    // 3) Médico preenche e salva o prontuário; o paciente atualiza no mesmo instante
    await prontuarios.preencherComoMedico({
      pacienteId,
      cid,
      diagnostico: 'Caso demonstrativo para liberação de laudo',
      prescricao: 'Conduta de demonstração do fluxo RF10',
    });
    await Promise.all([prontuarios.salvar(), pacPage.reload()]);
    await expect(medPage.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });

    // ...e o laudo AINDA não aparece para o paciente (pendente de liberação)
    await legenda(pacPage, 'RF10 · Laudo pendente — ainda NÃO aparece para a paciente');
    await expect(pacPage.getByText(`CID: ${cid}`)).toHaveCount(0);

    // 4) Médico localiza e abre o prontuário recém-criado
    await legenda(medPage, 'Médico abre o prontuário para liberar o laudo');
    await medPage.getByPlaceholder('Buscar por paciente ou CID...').fill(cid);
    await medPage.waitForTimeout(300);
    const row = medPage.getByRole('row').filter({ hasText: cid }).first();
    await row.hover();
    await row.getByRole('button').first().click();
    await expect(medPage.getByRole('dialog')).toBeVisible();

    // 5) CLÍMAX: o médico clica em "Liberar Laudo" ENQUANTO o portal do paciente
    //    fica atualizando — o laudo surge na tela do paciente ao vivo.
    await legenda(medPage, 'RF10 · Médico LIBERA o laudo');
    await Promise.all([
      medPage.getByRole('button', { name: /Liberar Laudo/i }).click(),
      observarAteAparecer(pacPage, cid),
    ]);
    await expect(medPage.getByText(/Laudo liberado/i)).toBeVisible({ timeout: 10_000 });
    await legenda(pacPage, 'RF10 · Laudo liberado já aparece para a paciente!');

    // 6) Paciente baixa o laudo recém-liberado (PDF)
    await legenda(pacPage, 'Paciente baixa o laudo em PDF');
    const download = await portal.baixarPrimeiroLaudo();
    expect(download.suggestedFilename()).toMatch(/laudo.*\.pdf$/i);
  } finally {
    await ctxMedico.close();
    await ctxPaciente.close();
    await navMedico.close();
    await navPaciente.close();
  }
});
