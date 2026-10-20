import { getCollection } from 'astro:content';
import bairros from '../data/bairros.json';
import site from '../data/site.json';

// MODO=demo mostra os imóveis de exemplo (preview). Sem isso, só entra imóvel real,
// publicado e com data de autorização escrita. Imóvel de exemplo nunca vai ao ar.
// Endereços sempre por u(): o preview mora em github.io/wisekey-imoveis/, a produção na raiz do domínio.
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
export const u = (caminho = '/') => BASE + caminho;

export const MODO_DEMO = process.env.MODO === 'demo' || import.meta.env.DEV;

export function visivel(i) {
  if (i.data.demo) return MODO_DEMO;
  return i.data.publicado && !!i.data.autorizacao_escrita;
}

// Vendido fica no ar com a etiqueta e sai sozinho 60 dias depois de vendido_em.
// O deploy roda todo dia de manhã para essa conta valer sem ninguém mexer.
export const DIAS_VENDIDO = 60;
const avisados = new Set();
export function aindaNoAr(i, hoje = new Date()) {
  if (i.data.status !== 'vendido') return true;
  if (!i.data.vendido_em) {
    if (!avisados.has(i.id)) console.warn(`[imoveis] ${i.data.codigo} está vendido sem vendido_em: fica no ar até ter a data.`);
    avisados.add(i.id);
    return true;
  }
  return hoje - i.data.vendido_em <= DIAS_VENDIDO * 864e5;
}

export async function listarImoveis() {
  const todos = await getCollection('imoveis');
  const ordem = { disponivel: 0, reservado: 1, vendido: 2 };
  const lista = todos
    .filter((i) => visivel(i) && aindaNoAr(i))
    .sort((a, b) => ordem[a.data.status] - ordem[b.data.status] || a.data.preco - b.data.preco);
  // Segunda trava, além da do workflow: imóvel com cara de exemplo derruba o build de produção.
  const intruso = !MODO_DEMO && lista.find((i) => /^demo/i.test(i.id) || /^demo/i.test(i.data.codigo));
  if (intruso) throw new Error(`[imoveis] ${intruso.data.codigo} parece exemplo e entraria na produção. Marque demo: true.`);
  return lista;
}

// A vitrine (menu Imóveis, busca, carrossel e categorias da home) só abre com 3 imóveis no ar.
// Antes disso a produção vive de avaliar, bairros e procuro. A ficha de cada imóvel autorizado
// já existe desde o primeiro: por link direto, QR da placa e na página do bairro.
export const VITRINE_MINIMO = 3;
export const vitrineAberta = async () => (await listarImoveis()).length >= VITRINE_MINIMO;

export const slug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function dadosBairro(nome) {
  const k = nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const b = bairros.bairros[k];
  return b ? { chave: k, slug: slug(k), ...b } : null;
}

export const listaBairros = () =>
  Object.entries(bairros.bairros)
    .map(([k, b]) => ({ chave: k, slug: slug(k), ...b }))
    .sort((a, b) => b.anuncios_total - a.anuncios_total);

export const cidade = bairros.cidade;
export const fonteDado = bairros.fonte;

export const brl = (v) => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
export const m2 = (v) => Math.round(v).toLocaleString('pt-BR') + ' m²';

export const TIPO = { casa: 'Casa', apartamento: 'Apartamento', terreno: 'Terreno', chacara: 'Chácara', comercial: 'Comercial' };
export const TIPO_PLURAL = { casa: 'Casas', apartamento: 'Apartamentos', terreno: 'Terrenos', chacara: 'Chácaras', comercial: 'Imóveis comerciais' };
export const STATUS = {disponivel: 'Disponível', reservado: 'Reservado', vendido: 'Vendido' };

// R$/m² do próprio imóvel: área construída para casa e apartamento, terreno para terreno e chácara.
export function precoM2(d) {
  const base = d.tipo === 'terreno' || d.tipo === 'chacara' ? d.area_terreno : d.area_construida;
  return base ? d.preco / base : null;
}

// Onde o imóvel cai na faixa do bairro para o mesmo tipo (P25 a P75).
export function comparaBairro(d) {
  const b = dadosBairro(d.bairro);
  const t = b?.tipos?.[d.tipo];
  const v = precoM2(d);
  if (!t || !v) return null;
  const dif = v / t.m2_mediana - 1;
  return { bairro: b, tipo: t, valor: v, dif };
}

export function wa(texto) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(texto)}`;
}
