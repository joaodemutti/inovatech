import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Carrega tests/.env.test se existir (credenciais dos perfis do seed)
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

// Atraso entre ações (ms) — útil para gravar vídeos de apresentação: PWSLOWMO=400
const slowMo = Number(process.env.PWSLOWMO ?? 0);

export default defineConfig({
  testDir: './tests',
  // Reseta o banco local para um estado limpo antes de cada execução (determinismo).
  globalSetup: './tests/global-setup.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 40_000,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Grava o vídeo de TODOS os testes (para a gravação/apresentação).
    // Use PWVIDEO=off para desligar e acelerar execuções locais.
    video: process.env.PWVIDEO === 'off' ? 'off' : 'on',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    launchOptions: { slowMo },
  },

  projects: [
    // 1) Autentica todos os perfis e salva os storageStates
    { name: 'setup', testMatch: '**/auth.setup.ts' },

    // 2) Acesso e segurança — rodam SEM sessão pré-carregada (testam o login em si)
    {
      name: 'acesso',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testMatch: '**/specs/acesso/**/*.spec.ts',
    },

    // 3) Suites por perfil — cada uma reaproveita a sessão do respectivo usuário
    {
      name: 'gestor',
      use: { ...devices['Desktop Chrome'], storageState: 'tests/.auth/gestor.json' },
      dependencies: ['setup'],
      testMatch: '**/specs/gestor/**/*.spec.ts',
    },
    {
      name: 'recepcionista',
      use: { ...devices['Desktop Chrome'], storageState: 'tests/.auth/recepcionista.json' },
      dependencies: ['setup'],
      testMatch: '**/specs/recepcionista/**/*.spec.ts',
    },
    {
      name: 'medico',
      use: { ...devices['Desktop Chrome'], storageState: 'tests/.auth/medico.json' },
      dependencies: ['setup'],
      testMatch: '**/specs/medico/**/*.spec.ts',
    },
    {
      name: 'paciente',
      use: { ...devices['Desktop Chrome'], storageState: 'tests/.auth/paciente.json' },
      dependencies: ['setup'],
      testMatch: '**/specs/paciente/**/*.spec.ts',
    },

    // 4) Fluxos ponta-a-ponta multi-perfil (RF09, RF10) — criam contextos por perfil
    {
      name: 'fluxos',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testMatch: '**/specs/fluxos/**/*.spec.ts',
    },

    // 5) Demonstração para vídeo: fluxo essencial, tour completo (todos os RF) e
    //    dois logins lado a lado. Tela grande (1600x900) + janela maximizada.
    //    Grave com:  PWSLOWMO=350 npx playwright test --project=demo --headed
    {
      name: 'demo',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1600, height: 900 },
        // grava o vídeo na resolução cheia da viewport (sem o downscale padrão p/ ~800px)
        video: { mode: 'on', size: { width: 1600, height: 900 } },
        deviceScaleFactor: 1,
        launchOptions: { slowMo, args: ['--start-maximized'] },
      },
      dependencies: ['setup'],
      testMatch: '**/specs/demo/**/*.spec.ts',
    },
  ],
});
