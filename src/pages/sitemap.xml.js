import { listarImoveis, listaBairros, u, VITRINE_MINIMO } from '../lib/imoveis.js';

export async function GET({ site }) {
  const lista = await listarImoveis();
  // A busca só entra no sitemap quando a vitrine abre (3 imóveis). A ficha entra desde o primeiro.
  const fixas = ['/', ...(lista.length >= VITRINE_MINIMO ? ['/imoveis/'] : []), '/bairros/', '/avaliar/', '/procuro/'];
  const imoveis = lista.filter((i) => !i.data.demo).map((i) => `/imoveis/${i.id}/`);
  const bairros = listaBairros().map((b) => `/bairros/${b.slug}/`);
  const urls = [...fixas, ...bairros, ...imoveis].map((x) => `<url><loc>${new URL(u(x), site).href}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
}
