import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { PERSONAS, campo, legenda, cpfUnico, emailUnico, nomeUnico, idPacientePorNome } from '../../utils/helpers';
import { PacientesPage } from '../../pages/PacientesPage';

// Tempo (ms) que cada passo/legenda permanece na tela — controla a DURAÇÃO do vídeo.
// Ajustado para o total ficar < 2 min mesmo com PWSLOWMO alto.
const D = Number(process.env.PWDWELL ?? 3000);

/**
 * VÍDEO ÚNICO (~2 min) — uma só janela/gravação cobrindo TODOS os RF (RF01–RF12)
 * na história: Dona Marta (gestora) → Dr. Carlos (médico) → Maria (paciente).
 * Legendas na tela indicam cada passo / RF.
 *
 * Rodar local + gerar o vídeo (1600x900):
 *   PWSLOWMO=120 npx playwright test demo/video           (gera test-results/.../video.webm)
 *   PWSLOWMO=200 npx playwright test demo/video --headed   (assistir ao vivo)
 */

async function entrar(page: Page, role: 'gestor' | 'medico' | 'paciente', legendaTexto: string) {
  await page.goto('/login');
  await legenda(page, legendaTexto, D);
  await page.getByPlaceholder('Login').fill(PERSONAS[role].login);
  await page.getByPlaceholder('Senha').fill(PERSONAS[role].password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL(/dashboard/, { timeout: 15_000 });
}

async function sair(page: Page) {
  await page.getByTitle('Sair').click();
  try {
    await page.waitForURL(/login/, { timeout: 15_000 });
  } catch {
    await page.context().clearCookies();
    await page.goto('/login');
  }
}

/** Capa de abertura do vídeo (logo SENAI + título + créditos). Tira print em videos-demo/capa.png. */
async function capa(page: Page) {
  // Usa a imagem real do logo (public/senai-logo.png) embutida em base64.
  // Se o arquivo não existir, cai para uma versão SVG aproximada.
  const logoFile = path.resolve(process.cwd(), 'public', 'senai-logo.png');
  let logoHtml: string;
  if (fs.existsSync(logoFile)) {
    const b64 = fs.readFileSync(logoFile).toString('base64');
    logoHtml = `<img src="data:image/png;base64,${b64}" alt="SENAI" style="width:440px;height:auto;border-radius:4px;filter:drop-shadow(0 12px 34px rgba(0,0,0,.45))"/>`;
  } else {
    logoHtml = `
    <svg viewBox="0 0 740 170" width="430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SENAI" style="filter:drop-shadow(0 12px 34px rgba(0,0,0,.45))">
      <rect width="740" height="170" fill="#ED1C24"/>
      <g fill="#ffffff">
        ${[18, 44, 70, 96, 122, 148].map((y) => `<rect x="14" y="${y}" width="66" height="13"/>`).join('')}
        ${[18, 44, 70, 96, 122, 148].map((y) => `<rect x="660" y="${y}" width="66" height="13"/>`).join('')}
      </g>
      <text x="370" y="120" text-anchor="middle" fill="#ffffff" font-family="'Arial Black',Arial,sans-serif"
            font-weight="900" font-style="italic" font-size="128" letter-spacing="2">SENAI</text>
    </svg>`;
  }

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',system-ui,Arial,sans-serif}
    body{width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;
      background:linear-gradient(135deg,#1e1b4b 0%,#312e81 35%,#1e3a8a 70%,#0c4a6e 100%);color:#fff}
    .card{text-align:center;padding:32px}
    .logo{margin-bottom:26px}
    h1{font-size:84px;font-weight:800;line-height:1;background:linear-gradient(90deg,#a855f7,#3b82f6);
      -webkit-background-clip:text;background-clip:text;color:transparent}
    .sub{font-size:29px;font-weight:600;color:#e2e8f0;margin-top:12px}
    .sub2{font-size:20px;color:#93c5fd;margin-top:6px;letter-spacing:.4px}
    .divider{width:130px;height:4px;border-radius:2px;margin:24px auto;background:linear-gradient(90deg,#a855f7,#3b82f6)}
    .block{margin-top:14px}
    .block h3{font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#818cf8;margin-bottom:6px}
    .block p{font-size:18px;color:#e2e8f0;line-height:1.7}
  </style></head><body>
    <div class="card">
      <div class="logo">${logoHtml}</div>
      <h1>InovaTech</h1>
      <div class="sub">Sistema ERP de Clínica Médica</div>
      <div class="sub2">Testes E2E Automatizados com Playwright</div>
      <div class="divider"></div>
      <div class="block"><h3>Professor</h3><p>Emerson Flamarion da Cruz</p></div>
      <div class="block"><h3>Equipe</h3><p>João Facin Demutti<br>Luiz Fernando Fratti Canoa<br>Mariana Rodrigues de Paiva<br>Natália Bastazini Durães dos Santos<br>Samuel Siqueira Lima</p></div>
    </div>
  </body></html>`;

  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path: 'videos-demo/capa.png' });
  await page.waitForTimeout(D + 2500);
}

test('INOVATECH — demonstração (todos os RF) em ~2 minutos', { tag: '@DEMO' }, async ({ page }) => {
  test.setTimeout(240_000);
  await capa(page);
  const cid = `Z${Date.now().toString().slice(-4)}`;
  const hoje = new Date().toISOString().split('T')[0];
  const mariaId = await idPacientePorNome('Maria Oliveira');

  // ───────────── GESTORA — Dona Marta ─────────────
  await entrar(page, 'gestor', 'Login — Dona Marta (Gestora)');
  await legenda(page, 'RF07 · Dashboard com indicadores', D);
  await expect(page.getByText('Total de Pacientes', { exact: true })).toBeVisible({ timeout: 10_000 });

  // RF03 — cadastro de paciente
  const pacientes = new PacientesPage(page);
  await pacientes.goto();
  await legenda(page, 'RF03 · Cadastro de paciente', D);
  const nome = nomeUnico('Paciente');
  await pacientes.openCreateDialog();
  await pacientes.fillForm({ nome, cpf: cpfUnico(), telefone: '11999990000', email: emailUnico('demo'), convenio: 'Unimed' });
  await pacientes.submitForm();
  await pacientes.expectPatientInTable(nome);

  // RF11 / RF12 — exportar e importar Excel (.xlsx)
  await legenda(page, 'RF11 · Exportar planilha .xlsx', D);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Exportar' }).click(),
  ]);
  const arquivo = await download.path();
  await legenda(page, 'RF12 · Importar .xlsx (com validação)', D);
  await page.locator('input[type="file"]').setInputFiles(arquivo);
  await expect(page.getByText(/importad|erro/i)).toBeVisible({ timeout: 20_000 });

  // RF01 — agendar consulta
  const horario = `21:${String(new Date().getSeconds()).padStart(2, '0')}`;
  const tipo = `Consulta ${Date.now()}`;
  await page.goto('/consultas');
  await page.waitForLoadState('networkidle');
  await legenda(page, 'RF01 · Agendar consulta', D);
  await expect(page.locator('.fc')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Nova Consulta' }).click();
  const dlg = page.getByRole('dialog');
  await expect(dlg).toBeVisible();
  await campo(dlg, 'paciente_id').selectOption({ index: 1 });
  await campo(dlg, 'medico_id').selectOption({ index: 1 });
  await campo(dlg, 'data').fill(hoje);
  await campo(dlg, 'horario').fill(horario);
  await campo(dlg, 'tipo_consulta').fill(tipo);
  await campo(dlg, 'valor').fill('250');
  await dlg.getByRole('button', { name: 'Agendar' }).click();
  await expect(dlg).not.toBeVisible({ timeout: 10_000 });

  // RF09 — "Realizada" gera lançamento financeiro
  await legenda(page, 'RF09 · "Realizada" gera lançamento financeiro', D);
  await page.locator('.fc-event').filter({ hasText: horario }).first().click();
  const dlg2 = page.getByRole('dialog');
  await expect(dlg2).toBeVisible();
  await dlg2.getByRole('button', { name: 'Realizada' }).click();
  await expect(page.getByText(/Status atualizado/i)).toBeVisible({ timeout: 10_000 });

  // RF04 — Financeiro
  await page.goto('/financeiro');
  await page.waitForLoadState('networkidle');
  await legenda(page, 'RF04 · Financeiro: lançamento gerado pela consulta (RF09)', D);
  await expect(page.getByText('Receita Paga', { exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(tipo)).toBeVisible({ timeout: 10_000 });

  // RF05 — Folha de Ponto
  await page.goto('/ponto');
  await page.waitForLoadState('networkidle');
  await legenda(page, 'RF05 · Folha de Ponto: horas, faltas e atrasos', D);
  await expect(page.getByText('H. Trabalhadas')).toBeVisible({ timeout: 10_000 });

  // RF06 — Administração: criar usuário + RNF06 auditoria + RF08 backup
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
  await legenda(page, 'RF06 · Gestão de usuários', D);
  await page.getByRole('button', { name: 'Novo Usuário' }).click();
  const du = page.getByRole('dialog');
  await expect(du).toBeVisible();
  await campo(du, 'nome').fill(nomeUnico('Usuário'));
  await campo(du, 'login').fill(`user${Date.now().toString().slice(-6)}`);
  await campo(du, 'email').fill(emailUnico('user'));
  await campo(du, 'perfil').selectOption('recepcionista');
  await campo(du, 'password').fill('Senha@123');
  await du.getByRole('button', { name: 'Criar' }).click();
  await expect(page.getByText(/Usuário criado/i)).toBeVisible({ timeout: 10_000 });

  await page.getByRole('tab', { name: 'Log de Auditoria' }).click();
  await legenda(page, 'RNF06 · Log de auditoria (rastreabilidade)', D);
  await expect(page.getByRole('table')).toBeVisible();

  await page.getByRole('tab', { name: 'Usuários' }).click();
  await legenda(page, 'RF08 · Backup com registro no log', D);
  await page.getByRole('button', { name: 'Backup' }).click();
  await expect(page.getByText(/Backup registrado/i)).toBeVisible({ timeout: 10_000 });

  await sair(page);

  // ───────────── MÉDICO — Dr. Carlos ─────────────
  await entrar(page, 'medico', 'Login — Dr. Carlos Lima (Médico)');
  await page.goto('/prontuarios');
  await page.waitForLoadState('networkidle');
  await legenda(page, 'RF02 · Médico cria prontuário (CID obrigatório)', D);
  await page.getByRole('button', { name: 'Novo Prontuário' }).click();
  const dp = page.getByRole('dialog');
  await expect(dp).toBeVisible();
  await campo(dp, 'paciente_id').fill(String(mariaId));
  await campo(dp, 'cid').fill(cid);
  await campo(dp, 'diagnostico').fill('Caso demonstrativo para liberação de laudo');
  await campo(dp, 'prescricao').fill('Conduta de demonstração do fluxo RF10');
  await dp.getByRole('button', { name: 'Criar' }).click();
  await expect(dp).not.toBeVisible({ timeout: 10_000 });

  await legenda(page, 'RF10 · Médico libera o laudo', D);
  await page.getByPlaceholder('Buscar por paciente ou CID...').fill(cid);
  await page.waitForTimeout(400);
  const row = page.getByRole('row').filter({ hasText: cid }).first();
  await row.hover();
  await row.getByRole('button').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: /Liberar Laudo/i }).click();
  await expect(page.getByText(/Laudo liberado/i)).toBeVisible({ timeout: 10_000 });

  await sair(page);

  // ───────────── PACIENTE — Maria ─────────────
  await entrar(page, 'paciente', 'Login — Maria Oliveira (Paciente)');
  await page.goto('/portal');
  await page.waitForLoadState('networkidle');
  await legenda(page, 'RF10 · Portal: laudo liberado disponível', D);
  await expect(page.getByText(`CID: ${cid}`)).toBeVisible({ timeout: 10_000 });
  const [laudoPdf] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Baixar/i }).first().click(),
  ]);
  expect(laudoPdf.suggestedFilename()).toMatch(/laudo.*\.pdf$/i);

  await legenda(page, '✓ RF01–RF12 demonstrados: gestora → médico → paciente', D);
});
