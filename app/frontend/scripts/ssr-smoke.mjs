import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const server = await createServer({ root, logLevel: 'error' });
try {
  await server.ssrLoadModule('/src/App.tsx');
  console.log('SSR load OK: App.tsx');
} catch (error) {
  console.error('SSR load FAIL:', error);
  process.exitCode = 1;
} finally {
  await server.close();
}
