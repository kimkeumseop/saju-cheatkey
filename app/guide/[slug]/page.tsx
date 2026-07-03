import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuroraBackground from '@/components/AuroraBackground';
import { createMetadata, guideMap, guides, SITE_URL, SITE_NAME, SITE_TEAM, DEFAULT_OG_IMAGE } from '@/lib/site';

function formatDate(date: string) {
  return date.replace(/-/g, '.');
}

export async function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideMap[slug];

  if (!guide) {
    return {};
  }

  return createMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guide/${guide.slug}`,
    keywords: ['사주 가이드', guide.title, '명리학 기초', '사주 치트키'],
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideMap[slug];

  if (!guide) {
    notFound();
  }

  const relatedGuides = guide.relatedSlugs.map((relatedSlug) => guideMap[relatedSlug]).filter(Boolean);

  const guideUrl = `${SITE_URL}/guide/${guide.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${guideUrl}#article`,
        headline: guide.title,
        description: guide.description,
        articleBody: guide.intro,
        image: DEFAULT_OG_IMAGE,
        datePublished: guide.datePublished,
        dateModified: guide.dateModified,
        inLanguage: 'ko-KR',
        mainEntityOfPage: guideUrl,
        author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: { '@type': 'ImageObject', url: DEFAULT_OG_IMAGE },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: '사주 가이드', item: `${SITE_URL}/guide` },
          { '@type': 'ListItem', position: 3, name: guide.title, item: guideUrl },
        ],
      },
    ],
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden pt-24 pb-32" style={{ background: '#FBF7F2' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AuroraBackground />
      <Navbar />

      <article className="relative z-10 max-w-4xl mx-auto px-6 space-y-10">
        <header className="rounded-[3rem] p-8 md:p-12 space-y-5" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(212,104,138,0.14)', boxShadow: '0 8px 40px rgba(212,104,138,0.06)' }}>
          <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: 'rgba(212,104,138,0.7)' }}>Guide</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight break-keep" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>{guide.title}</h1>
          <p className="leading-relaxed break-keep text-base md:text-lg" style={{ color: 'rgba(45,27,30,0.6)' }}>{guide.intro}</p>
          <p className="text-sm font-bold" style={{ color: 'rgba(45,27,30,0.42)' }}>
            {SITE_TEAM} · 발행 {formatDate(guide.datePublished)} · 최종 수정 {formatDate(guide.dateModified)}
          </p>
          <div className="flex flex-wrap gap-3 text-sm font-bold">
            <Link href="/" className="px-4 py-2 rounded-full transition-colors" style={{ background: 'rgba(212,104,138,0.1)', border: '1px solid rgba(212,104,138,0.2)', color: '#d4688a' }}>
              홈으로
            </Link>
            <Link href="/faq" className="px-4 py-2 rounded-full transition-colors" style={{ background: 'rgba(212,104,138,0.1)', border: '1px solid rgba(212,104,138,0.2)', color: '#d4688a' }}>
              FAQ
            </Link>
            <Link href="/about" className="px-4 py-2 rounded-full transition-colors" style={{ background: 'rgba(212,104,138,0.1)', border: '1px solid rgba(212,104,138,0.2)', color: '#d4688a' }}>
              서비스 소개
            </Link>
          </div>
        </header>

        <div className="space-y-6">
          {guide.sections.map((section) => (
            <section key={section.title} className="rounded-[2.5rem] p-8 md:p-10 space-y-5" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(212,104,138,0.12)' }}>
              <h2 className="text-2xl font-bold tracking-tight break-keep" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>{section.title}</h2>
              <div className="space-y-4 leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="rounded-[2.5rem] p-8 md:p-10 space-y-4" style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(124,111,214,0.12), rgba(255,255,255,0.85) 60%)', border: '1px solid rgba(124,111,214,0.16)' }}>
          <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: 'rgba(124,111,214,0.7)' }}>정리</p>
          <h2 className="text-2xl font-bold" style={{ color: '#2D1B1E' }}>읽고 나서 기억하면 좋은 점</h2>
          <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.6)' }}>{guide.closing}</p>
        </section>

        <section className="rounded-[2.5rem] p-8 md:p-10 space-y-6" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(212,104,138,0.12)' }}>
          <div className="space-y-2">
            <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: 'rgba(212,104,138,0.7)' }}>Related</p>
            <h2 className="text-2xl font-bold" style={{ color: '#2D1B1E' }}>관련 글 더 읽기</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedGuides.map((relatedGuide) => (
              <Link
                key={relatedGuide.slug}
                href={`/guide/${relatedGuide.slug}`}
                className="rounded-[1.75rem] p-5 space-y-2 transition-colors hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(212,104,138,0.1)' }}
              >
                <h3 className="font-bold break-keep" style={{ color: '#2D1B1E' }}>{relatedGuide.title}</h3>
                <p className="text-sm leading-relaxed break-keep" style={{ color: 'rgba(45,27,30,0.5)' }}>{relatedGuide.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </article>

      <Footer />
    </main>
  );
}
