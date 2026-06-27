import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CosmicBackground from '@/components/CosmicBackground';
import { createMetadata, columns, columnMap } from '@/lib/site';
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

  return (
    <div className="relative min-h-screen overflow-x-hidden pt-24 pb-20 px-4 md:px-6" style={{ background: '#0d0710' }}>
      <CosmicBackground />
      <Navbar dark />
      <article className="relative z-10 max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <Link href="/column" className="font-black mb-4 uppercase tracking-widest text-sm inline-block transition-colors hover:brightness-125" style={{ color: '#9d8fff' }}>Myeongri Column</Link>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>
            {column.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm font-medium" style={{ color: 'rgba(240,232,238,0.42)' }}>
            <span>사주 치트키 편집팀</span>
            <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}></span>
            <span>{formatDate(column.date)}</span>
            <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}></span>
            <span>읽기 시간 {column.readMinutes}분</span>
          </div>
        </header>

        <div className="prose prose-invert lg:prose-xl mx-auto prose-headings:text-[#f5eef2] prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6 prose-strong:text-[#e8829a] prose-p:leading-relaxed prose-p:mb-6" style={{ ['--tw-prose-body' as any]: 'rgba(240,232,238,0.66)' }}>
          {content}
        </div>

        <section className="mt-16 space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: 'rgba(157,143,255,0.7)' }}>More Columns</p>
            <h2 className="text-2xl font-bold" style={{ color: '#f5eef2' }}>다른 명리 칼럼 더 읽기</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedColumns.map((related) => (
              <Link
                key={related.id}
                href={`/column/${related.id}`}
                className="rounded-[1.75rem] p-5 space-y-2 transition-transform hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(157,143,255,0.14)' }}
              >
                <h3 className="font-bold break-keep leading-snug" style={{ color: '#f5eef2' }}>{related.title}</h3>
                <p className="text-sm leading-relaxed break-keep" style={{ color: 'rgba(240,232,238,0.5)' }}>{related.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-16 p-10 rounded-[2.5rem] text-center space-y-6" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(157,143,255,0.14), rgba(18,8,16,0.85) 70%)', border: '1px solid rgba(157,143,255,0.18)' }}>
          <h3 className="text-2xl font-bold" style={{ color: '#f5eef2' }}>당신의 사주도 이런 깊이로 분석해 드립니다.</h3>
          <p className="font-medium" style={{ color: 'rgba(240,232,238,0.6)' }}>단순한 운세를 넘어 삶의 맥락을 읽어주는 정통 명리학 기반 프리미엄 분석을 지금 경험해보세요.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #9d8fff, #534ab7)', boxShadow: '0 8px 24px rgba(157,143,255,0.3)' }}
          >
            지금 바로 사주 분석하기 🔮
          </Link>
        </div>
      </article>
      <Footer dark />
    </div>
  );
}
