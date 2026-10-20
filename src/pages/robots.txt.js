import { u } from '../lib/imoveis.js';

// Gerado no build para apontar o sitemap do endereço certo (produção ou preview).
export function GET({ site }) {
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL(u('/sitemap.xml'), site).href}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
