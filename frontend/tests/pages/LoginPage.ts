import { type Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(login: string, password: string) {
    await this.page.getByPlaceholder('Login').fill(login);
    await this.page.getByPlaceholder('Senha').fill(password);
    await this.page.getByRole('button', { name: 'Entrar' }).click();
  }

  async expectError(message?: string) {
    const alert = this.page.locator('[class*="red"]').filter({ hasText: message ?? /inválid/i });
    await expect(alert).toBeVisible();
  }

  async expectRedirectToDashboard() {
    await expect(this.page).toHaveURL(/dashboard/, { timeout: 10_000 });
  }

  logoVisible() {
    return expect(this.page.getByText('INOVATECH')).toBeVisible();
  }
}
