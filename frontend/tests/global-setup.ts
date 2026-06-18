import { execSync } from 'child_process';
import * as path from 'path';

/**
 * Roda UMA vez antes de toda a suíte: reseta o banco local para um estado limpo
 * (TRUNCATE + seed completo), garantindo testes determinísticos.
 *
 * Segurança: só executa contra ambiente LOCAL (nunca produção). Desligar com
 * RESET_DB=off. Não falha a suíte se o Docker não estiver disponível.
 */
export default async function globalSetup() {
  if (process.env.RESET_DB === 'off') return;

  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
  if (!/localhost|127\.0\.0\.1/.test(baseURL)) {
    console.log(`[global-setup] base não-local (${baseURL}) — pulando reset do banco.`);
    return;
  }

  const repoRoot = path.resolve(__dirname, '..', '..');
  try {
    console.log('[global-setup] resetando banco local (docker compose exec backend python reset_db.py)…');
    execSync('docker compose exec -T backend python reset_db.py', {
      cwd: repoRoot,
      stdio: 'inherit',
    });
  } catch {
    console.warn('[global-setup] não foi possível resetar o banco (Docker indisponível?). Seguindo sem reset.');
  }
}
