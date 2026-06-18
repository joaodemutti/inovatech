import { type Page, type Download, expect } from '@playwright/test';

/** Portal do Paciente — consultas próprias e laudos liberados (RF10). */
export class PortalPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/portal');
    await this.page.waitForLoadState('networkidle');
  }

  consultasCard() {
    return this.page.getByText('Minhas Consultas');
  }

  laudosCard() {
    return this.page.getByText('Meus Laudos');
  }

  /** Botões "Baixar" de laudos liberados. */
  botoesBaixar() {
    return this.page.getByRole('button', { name: /Baixar/i });
  }

  async quantidadeLaudos(): Promise<number> {
    await this.page.waitForLoadState('networkidle');
    return this.botoesBaixar().count();
  }

  async baixarPrimeiroLaudo(): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.botoesBaixar().first().click(),
    ]);
    return download;
  }

  async expectAcessoPermitido() {
    await expect(this.consultasCard()).toBeVisible({ timeout: 10_000 });
    await expect(this.laudosCard()).toBeVisible();
  }
}
