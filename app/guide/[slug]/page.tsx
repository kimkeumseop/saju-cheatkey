import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdSenseScript from '@/components/AdSenseScript';
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
    <main className="min-h-screen bg-[#FFF5F7] pt-24 pb-32">
      <AdSenseScript />
      <Navbar />

      <article className="max-w-4xl mx-auto px-6 space-y-10">
        <header className="bg-white rounded-[3rem] border border-pink-50 shadow-sm p-8 md:p-12 space-y-5">
          <p className="text-primary-500 text-xs font-black tracking-[0.25em] uppercase">Guide</p>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight break-keep">{guide.title}</h1>
          <p className="text-gray-600 leading-relaxed break-keep text-base md:text-lg">{guide.intro}</p>
          <div className="flex flex-wrap gap-3 text-sm font-bold text-primary-700">
            <Link href="/" className="px-4 py-2 rounded-full bg-primary-50 hover:bg-primary-100 transition-colors">
              홈으로
            </Link>
            <Link href="/faq" className="px-4 py-2 rounded-full bg-primary-50 hover:bg-primary-100 transition-colors">
              FAQ
            </Link>
            <Link href="/about" className="px-4 py-2 rounded-full bg-primary-50 hover:bg-primary-100 transition-colors">
              서비스 소개
            </Link>
          </div>
        </header>

        <div className="space-y-6">
          {guide.sections.map((section) => (
            <section key={section.title} className="bg-white rounded-[2.5rem] border border-pink-50 shadow-sm p-8 md:p-10 space-y-5">
              <h2 className="text-2xl font-black text-primary-900 tracking-tight break-keep">{section.title}</h2>
              <div className="space-y-4 text-gray-600 leading-8 break-keep">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="bg-[#2D1B1E] rounded-[2.5rem] p-8 md:p-10 text-white space-y-4">
          <p className="text-primary-200 text-xs font-black tracking-[0.25em] uppercase">정리</p>
          <h2 className="text-2xl font-black">읽고 나서 기억하면 좋은 점</h2>
          <p className="text-white/80 leading-8 break-keep">{guide.closing}</p>
        </section>

        <section className="bg-white rounded-[2.5rem] border border-pink-50 shadow-sm p-8 md:p-10 space-y-6">
          <div className="space-y-2">
            <p className="text-primary-500 text-xs font-black tracking-[0.25em] uppercase">Related</p>
            <h2 className="text-2xl font-black text-primary-900">관련 글 더 읽기</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedGuides.map((relatedGuide) => (
              <Link
                key={relatedGuide.slug}
                href={`/guide/${relatedGuide.slug}`}
                className="rounded-[1.75rem] bg-[#FFF5F7] border border-pink-50 p-5 space-y-2 hover:bg-primary-50 transition-colors"
              >
                <h3 className="font-black text-primary-900 break-keep">{relatedGuide.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed break-keep">{relatedGuide.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </article>

      <Footer />
    </main>
  );
}
