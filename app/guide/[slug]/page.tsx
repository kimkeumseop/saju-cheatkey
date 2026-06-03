import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CosmicBackground from '@/components/CosmicBackground';
import { createMetadata, guideMap, guides } from '@/lib/site';

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

  return (
    <main className="relative min-h-screen overflow-x-hidden pt-24 pb-32" style={{ background: '#0d0710' }}>
      <CosmicBackground />
      <Navbar dark />

      <article className="relative z-10 max-w-4xl mx-auto px-6 space-y-10">
        <header className="rounded-[3rem] p-8 md:p-12 space-y-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(232,130,154,0.14)', boxShadow: '0 8px 40px rgba(232,130,154,0.06)' }}>
          <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: 'rgba(232,130,154,0.7)' }}>Guide</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight break-keep" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>{guide.title}</h1>
          <p className="leading-relaxed break-keep text-base md:text-lg" style={{ color: 'rgba(240,232,238,0.6)' }}>{guide.intro}</p>
          <div className="flex flex-wrap gap-3 text-sm font-bold">
            <Link href="/" className="px-4 py-2 rounded-full transition-colors" style={{ background: 'rgba(232,130,154,0.1)', border: '1px solid rgba(232,130,154,0.2)', color: '#e8829a' }}>
              홈으로
            </Link>
            <Link href="/faq" className="px-4 py-2 rounded-full transition-colors" style={{ background: 'rgba(232,130,154,0.1)', border: '1px solid rgba(232,130,154,0.2)', color: '#e8829a' }}>
              FAQ
            </Link>
            <Link href="/about" className="px-4 py-2 rounded-full transition-colors" style={{ background: 'rgba(232,130,154,0.1)', border: '1px solid rgba(232,130,154,0.2)', color: '#e8829a' }}>
              서비스 소개
            </Link>
          </div>
        </header>

        <div className="space-y-6">
          {guide.sections.map((section) => (
            <section key={section.title} className="rounded-[2.5rem] p-8 md:p-10 space-y-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(232,130,154,0.12)' }}>
              <h2 className="text-2xl font-bold tracking-tight break-keep" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>{section.title}</h2>
              <div className="space-y-4 leading-8 break-keep" style={{ color: 'rgba(240,232,238,0.62)' }}>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="rounded-[2.5rem] p-8 md:p-10 space-y-4" style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(157,143,255,0.12), rgba(18,8,16,0.85) 60%)', border: '1px solid rgba(157,143,255,0.16)' }}>
          <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: 'rgba(157,143,255,0.7)' }}>정리</p>
          <h2 className="text-2xl font-bold" style={{ color: '#f5eef2' }}>읽고 나서 기억하면 좋은 점</h2>
          <p className="leading-8 break-keep" style={{ color: 'rgba(240,232,238,0.6)' }}>{guide.closing}</p>
        </section>

        <section className="rounded-[2.5rem] p-8 md:p-10 space-y-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(232,130,154,0.12)' }}>
          <div className="space-y-2">
            <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: 'rgba(232,130,154,0.7)' }}>Related</p>
            <h2 className="text-2xl font-bold" style={{ color: '#f5eef2' }}>관련 글 더 읽기</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedGuides.map((relatedGuide) => (
              <Link
                key={relatedGuide.slug}
                href={`/guide/${relatedGuide.slug}`}
                className="rounded-[1.75rem] p-5 space-y-2 transition-colors hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(232,130,154,0.1)' }}
              >
                <h3 className="font-bold break-keep" style={{ color: '#f5eef2' }}>{relatedGuide.title}</h3>
                <p className="text-sm leading-relaxed break-keep" style={{ color: 'rgba(240,232,238,0.5)' }}>{relatedGuide.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </article>

      <Footer dark />
    </main>
  );
}
