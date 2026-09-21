import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // Deployed under https://brian.mplusm.site/wm/ — asset URLs must be prefixed
    // accordingly. Change this if the app moves to a different sub-path or root.
    base: '/wm/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      // Keep support broad enough for older clinical tablets/iPads.
      target: 'es2020',
      sourcemap: false,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // 本地开发时把 /api 转发到本机的 pm2 服务（生产由 nginx 反代）。
      // 这样前端始终用同源相对路径 /api，cookie 也能正常工作。
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3011',
          changeOrigin: false,
        },
      },
    },
  };
});
