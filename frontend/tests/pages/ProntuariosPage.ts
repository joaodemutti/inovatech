import { type Page, expect } from '@playwright/test';
import { campo } from '../utils/helpers';

/** Prontuários — RF02 (CID obrigatório) e RF10 (liberar laudo, perfil médico). */
export class ProntuariosPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/prontuarios');
    await this.page.waitForLoadState('networkidle');
  }

  async abrirNovo() {
    await this.page.getByRole('button', { name: 'Novo Prontuário' }).click();
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  /** Preenche o diálogo de criação no formato do perfil médico (ID do paciente numérico). */
  async preencherComoMedico(dados: {
    pacienteId: number;
    data?: string;
    cid: string;
    diagnostico: string;
    prescricao: string;
    retornoDias?: number;
  }) {
    const d = this.page.getByRole('dialog');
    await campo(d, 'paciente_id').fill(String(dados.pacienteId));
    if (dados.data) await campo(d, 'data').fill(dados.data);
    await campo(d, 'cid').fill(dados.cid);
    await campo(d, 'diagnostico').fill(dados.diagnostico);
    await campo(d, 'prescricao').fill(dados.prescricao);
    if (dados.retornoDias != null) {
      await campo(d, 'retorno_em_dias').fill(String(dados.retornoDias));
    }
  }

  async salvar() {
    await this.page.getByRole('dialog').getByRole('button', { name: 'Criar' }).click();
  }

  /** Abre o prontuário de uma linha que contenha o CID informado. */
  async abrirPorCid(cid: string) {
    const row = this.page.getByRole('row').filter({ hasText: cid }).first();
    await row.hover();
    await row.getByRole('button').first().click();
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async liberarLaudo() {
    await this.page.getByRole('button', { name: /Liberar Laudo/i }).click();
  }

  async expectTabelaVisivel() {
    await expect(this.page.getByRole('table')).toBeVisible();
  }
}
