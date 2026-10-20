import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Campos vazios do painel chegam como null ou '': nullish() aceita os dois.
// A ficha do imóvel. Cada imóvel é um arquivo .md em src/content/imoveis/.
// O cadastro pelo Pages CMS (.pages.yml) preenche exatamente estes campos.
const imoveis = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/imoveis' }),
  schema: ({ image }) =>
    z.object({
      codigo: z.string(),
      titulo: z.string(),
      tipo: z.enum(['casa', 'apartamento', 'terreno', 'chacara', 'comercial']),
      status: z.enum(['disponivel', 'reservado', 'vendido']).default('disponivel'),
      bairro: z.string(),
      condominio_nome: z.string().nullish(),
      preco: z.number().positive(),
      condominio_mensal: z.number().nonnegative().nullish(),
      iptu_anual: z.number().nonnegative().nullish(),
      area_construida: z.number().positive().nullish(),
      area_terreno: z.number().positive().nullish(),
      quartos: z.number().int().nonnegative().nullish(),
      suites: z.number().int().nonnegative().nullish(),
      banheiros: z.number().int().nonnegative().nullish(),
      vagas: z.number().int().nonnegative().nullish(),
      destaques: z.array(z.string()).nullish().transform((v) => (v ?? []).filter(Boolean)),
      fotos: z.array(image()).min(1),
      legendas: z.array(z.string()).nullish().transform((v) => v ?? []),
      fotos_ilustrativas: z.boolean().default(false),
      caracteristicas: z
        .object({
          area_externa: z.array(z.string()).nullish(),
          comodos: z.array(z.string()).nullish(),
          facilidades: z.array(z.string()).nullish(),
          diferenciais: z.array(z.string()).nullish(),
        })
        .nullish(),
      video: z.preprocess((v) => (v === '' ? null : v), z.string().url().nullish()),
      laudo: z.boolean().default(false),
      // Lei 6.530/78, art. 20, III: sem autorização escrita, não se anuncia.
      // Vazio ou null fica undefined: z.coerce.date(null) viraria 1970 e liberaria o anúncio.
      autorizacao_escrita: z.preprocess((v) => (v === '' || v == null ? undefined : v), z.coerce.date().optional()),
      publicado: z.boolean().default(false),
      demo: z.boolean().default(false),
    }),
});

export const collections = { imoveis };
