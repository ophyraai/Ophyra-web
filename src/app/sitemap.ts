import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase/server';

const LEGAL_SLUGS = [
  'terminos-y-condiciones',
  'politica-de-privacidad',
  'politica-de-cookies',
  'politica-de-envios',
  'politica-de-devoluciones',
  'aviso-de-afiliacion',
  'aviso-legal',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ophyra.com';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/diagnosis`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // Páginas legales — baja prioridad pero deben indexarse (confianza + E-E-A-T)
  const legalRoutes: MetadataRoute.Sitemap = LEGAL_SLUGS.map((slug) => ({
    url: `${baseUrl}/legal/${slug}`,
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.3,
  }));

  // Productos activos — dinámico desde BD
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)
      .not('slug', 'is', null);

    productRoutes = (products || []).map((p) => ({
      url: `${baseUrl}/shop/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (err) {
    // Si la BD está caída no reventamos el sitemap
    console.error('[sitemap] failed to load products:', err);
  }

  return [...staticRoutes, ...legalRoutes, ...productRoutes];
}
