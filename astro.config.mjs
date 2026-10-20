import { defineConfig } from 'astro/config';

// SITE e BASE vêm do deploy. Preview no GitHub Pages: BASE=/wisekey-imoveis. Produção: raiz de imoveis.wisekey.co.
export default defineConfig({
  site: process.env.SITE || 'https://imoveis.wisekey.co',
  base: process.env.BASE || '/',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'always' },
  compressHTML: true,
  server: { host: '127.0.0.1', port: 4330 },
});
