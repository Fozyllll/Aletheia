
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Aletheia/',
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    target: 'esnext'
  }
});
