import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://api.prod.jcloudify.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
