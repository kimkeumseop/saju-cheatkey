import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuroraBackground from '@/components/AuroraBackground';
import { createMetadata, columns, columnMap, SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/site';
import { columnContent } from './columnContent';

export function generateStaticParams() {
  return columns.map((column) => ({ id: column.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const column = columnMap[id];

  if (!column) {
    return {};
  }

  return createMetadata({
    title: column.title,
    description: column.description,
    path: `/column/${column.id}`,
    keywords: ['명리학 칼럼', '사주 칼럼', column.title, '사주 치트키'],
  });
}

function formatDate(date: string) {
  return date.replace(/-/g, '.');
}

export default async function ColumnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const column = columnMap[id];
  const content = columnContent[id];

  if (!column || !content) {
    notFound();
  }

  const relatedColumns = columns.filter((entry) => entry.id !== id).slice(0, 3);

  const columnUrl = `${SITE_URL}/column/${column.id}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${columnUrl}#article`,
        headline: column.title,
        description: column.description,
        image: DEFAULT_OG_IMAGE,
        datePublished: column.date,
        dateModified: column.dateModified || column.date,
        inLanguage: 'ko-KR',
        mainEntityOfPage: columnUrl,
        author: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/about#editorial` },
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
          { '@type': 'ListItem', position: 2, name: '명리 칼럼', item: `${SITE_URL}/column` },
          { '@type': 'ListItem', position: 3, name: column.title, item: columnUrl },
        ],
      },
    ],
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden pt-24 pb-20 px-4 md:px-6" style={{ background: '#FBF7F2' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AuroraBackground />
      <Navbar />
      <article className="relative z-10 max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <Link href="/column" className="font-black mb-4 uppercase tracking-widest text-sm inline-block transition-colors hover:brightness-125" style={{ color: '#7c6fd6' }}>Myeongri Column</Link>
          <h1 className="break-keep text-3xl md:text-5xl font-bold leading-tight mb-6" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>
            {column.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-medium" style={{ color: 'rgba(45,27,30,0.65)' }}>
            <Link href="/about#editorial" className="underline underline-offset-4">사주 치트키 편집팀</Link>
            <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(45,27,30,0.16)' }}></span>
            <span>{formatDate(column.date)}</span>
            {column.dateModified && <span>수정 {formatDate(column.dateModified)}</span>}
            <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(45,27,30,0.16)' }}></span>
            <span>읽기 시간 {column.readMinutes}분</span>
          </div>
        </header>

        <p className="mb-8 rounded-2xl bg-white p-5 text-sm leading-7 text-[#665159]">
          이 글은 전통 명리학의 상징을 자기 이해와 대화에 활용하는 해설입니다. 성격·건강·재산이나 미래 사건을 측정하거나 예측하는 자료는 아닙니다.
        </p>
        <div className="column-body mx-auto">
          {content}
        </div>
        <aside className="mt-10 rounded-2xl bg-white p-6 text-sm leading-7 text-[#665159]">
          <h2 className="mb-3 text-lg font-bold text-[#2D1B1E]">계산과 해석을 직접 확인하기</h2>
          <p>본문의 성향 표현은 전통적 해석이며 실제 인물의 상담 기록이나 통계 연구 결과가 아닙니다. 사주 치트키의 계산 예시와 한계를 함께 확인해 주세요.</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/guide/what-is-saju#calculation-example" className="underline underline-offset-4">가상 명식 계산 예시</Link>
            <Link href="/guide/birth-time-unknown" className="underline underline-offset-4">출생시간 미상 비교</Link>
            <Link href="/about#editorial" className="underline underline-offset-4">제작 기준과 오류 제보</Link>
          </div>
        </aside>

        <section className="mt-16 space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: 'rgba(124,111,214,0.7)' }}>More Columns</p>
            <h2 className="text-2xl font-bold" style={{ color: '#2D1B1E' }}>다른 명리 칼럼 더 읽기</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedColumns.map((related) => (
              <Link
                key={related.id}
                href={`/column/${related.id}`}
                className="rounded-[1.75rem] p-5 space-y-2 transition-transform hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(124,111,214,0.14)' }}
              >
                <h3 className="font-bold break-keep leading-snug" style={{ color: '#2D1B1E' }}>{related.title}</h3>
                <p className="text-sm leading-relaxed break-keep" style={{ color: 'rgba(45,27,30,0.5)' }}>{related.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-16 p-10 rounded-[2.5rem] text-center space-y-6" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,111,214,0.14), rgba(255,255,255,0.85) 70%)', border: '1px solid rgba(124,111,214,0.18)' }}>
          <h3 className="text-2xl font-bold" style={{ color: '#2D1B1E' }}>당신의 사주도 이런 깊이로 분석해 드립니다.</h3>
          <p className="font-medium" style={{ color: 'rgba(45,27,30,0.6)' }}>단순한 운세를 넘어 삶의 맥락을 읽어주는 정통 명리학 기반 프리미엄 분석을 지금 경험해보세요.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #7c6fd6, #7c6fd6)', boxShadow: '0 8px 24px rgba(124,111,214,0.3)' }}
          >
            지금 바로 사주 분석하기 🔮
          </Link>
        </div>
      </article>
      <Footer />
    </div>
  );
}
