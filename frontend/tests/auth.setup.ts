import { test as setup, expect } from '@playwright/test';
import { PERSONAS, personaLabel, authFile, type Role } from './utils/helpers';

/**
 * Setup de autenticação: faz login de cada perfil pela UI e persiste o cookie
 * de sessão em tests/.auth/<perfil>.json. Cada projeto de teste reaproveita o
 * storageState correspondente, evitando refazer login a cada spec.
 */
const perfis: Role[] = ['gestor', 'recepcionista', 'medico', 'paciente'];

for (const role of perfis) {
  setup(`autenticar como ${personaLabel(role)}`, async ({ page }) => {
    const { login, password } = PERSONAS[role];

    await page.goto('/login');
    await page.getByPlaceholder('Login').fill(login);
    await page.getByPlaceholder('Senha').fill(password);
    await page.getByRole('button', { name: 'Entrar' }).click();

    // O login sempre redireciona para /dashboard. O paciente é bloqueado lá
    // (vê "Acesso Restrito"), mas a sessão/cookie já está válida.
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
    await expect(page).toHaveURL(/dashboard/);

    await page.context().storageState({ path: authFile(role) });
  });
}
