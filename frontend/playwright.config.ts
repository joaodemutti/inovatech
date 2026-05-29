import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Carrega tests/.env.test se existir
const envFile = path.join(__dirname, 'tests/.env.test');
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key && rest.length > 0) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  }
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 30_000,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },

  projects: [
    { name: 'setup', testMatch: '**/auth.setup.ts' },
    {
      name: 'gestor',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/gestor.json',
      },
      dependencies: ['setup'],
      testIgnore: ['**/auth.spec.ts', '**/roles.spec.ts'],
    },
    {
      name: 'auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/auth.spec.ts', '**/roles.spec.ts'],
    },
  ],
});
