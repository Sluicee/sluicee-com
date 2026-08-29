import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

function safe(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
}

const buildDate = new Date().toISOString().slice(0, 10);
const gitHash = safe('git rev-parse --short HEAD');

export default defineConfig({
  define: {
    __BUILD_STAMP__: JSON.stringify(gitHash ? `${buildDate} · ${gitHash}` : buildDate),
  },
  preview: {
    allowedHosts: ['sluicee.com'],
  },
});
