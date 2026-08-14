import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command }) => ({
  // 生产构建部署在 GitHub Pages 子路径；开发模式保持根路径（E2E 与本地体验不变）
  base: command === 'build' ? '/codevision-lab/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
  },
  build: {
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      output: {
        manualChunks(id: string): string | undefined {
          if (id.includes('monaco-editor')) return 'monaco';
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('react-router')
          ) {
            return 'react';
          }
          if (id.includes('zustand')) return 'state';
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
}));
