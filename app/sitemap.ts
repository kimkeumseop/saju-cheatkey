import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

const SITEMAP_ROUTES = [
  { path: '/', changeFrequency: 'weekly' as const, priority: 1 },

  { path: '/saju', changeFrequency: 'weekly' as const, priority: 0.9 },
  { path: '/gunghap', changeFrequency: 'weekly' as const, priority: 0.9 },
  { path: '/tarot', changeFrequency: 'weekly' as const, priority: 0.9 },
  { path: '/mbti', changeFrequency: 'weekly' as const, priority: 0.9 },

  { path: '/guide/what-is-saju', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: '/guide/heavenly-stems-earthly-branches', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: '/guide/five-elements', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: '/guide/how-to-read-yearly-fortune', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: '/guide/common-misunderstandings', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: '/guide/birth-time-unknown', changeFrequency: 'monthly' as const, priority: 0.8 },

  { path: '/faq', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.5 },
  { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.5 },
  { path: '/about', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.6 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return SITEMAP_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, SITE_URL).toString(),
    lastModified,
    changeFrequency,
    priority,
  }))
}
