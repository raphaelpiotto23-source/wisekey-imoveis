import { defineConfig } from 'astro/config';

// SITE e BASE vêm do deploy. Produção: raiz de wisekeyimobiliaria.com.br (o padrão).
// Preview no GitHub Pages: SITE=https://raphaelpiotto23-source.github.io BASE=/wisekey-imoveis MODO=demo.
export default defineConfig({
  site: process.env.SITE || 'https://wisekeyimobiliaria.com.br',
  base: process.env.BASE || '/',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'always' },
  compressHTML: true,
  server: { host: '127.0.0.1', port: 4330 },
});
