import { MetadataRoute } from 'next'
import { SITE_URL, guides } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '',
    '/saju',
    '/unse',
    '/about',
    '/faq',
    '/contact',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  const guideRoutes = guides.map((guide) => ({
    url: `${SITE_URL}/guide/${guide.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const columnIds = ['1', '2', '3'];
  const columnRoutes = columnIds.map((id) => ({
    url: `${SITE_URL}/column/${id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...guideRoutes, ...columnRoutes]
}
