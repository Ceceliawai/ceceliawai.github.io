import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const isUserOrOrgPage = repository.endsWith('.github.io');
const base =
  process.env.VITE_BASE_PATH ||
  (process.env.GITHUB_ACTIONS && repository && !isUserOrOrgPage ? `/${repository}/` : '/');

export default defineConfig({
  plugins: [react()],
  base,
});
