import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ophyra.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/', '/diagnosis/*/compare'], // Prevent crawling of private/dynamic paths
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
