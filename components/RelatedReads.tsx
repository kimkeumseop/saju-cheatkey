import Link from 'next/link';
import { columns } from '@/lib/site';

interface RelatedReadsProps {
  title?: string;
  description?: string;
  /** 가이드 칩으로 노출할 링크들. 비우면 가이드 영역은 표시하지 않는다. */
  guideLinks?: { href: string; label: string }[];
  /** 강조 노출할 칼럼 id 목록 (기본: 2026 운세 · 심리학 · 대운) */
  featuredColumnIds?: string[];
}

const DEFAULT_FEATURED = ['3', '1', '5'];

export default function RelatedReads({
  title = '더 깊이 읽어보기',
  description = '기초 개념과 명리 칼럼을 함께 보면 결과를 훨씬 입체적으로 이해할 수 있어요.',
  guideLinks = [],
  featuredColumnIds = DEFAULT_FEATURED,
}: RelatedReadsProps) {
  const featured = featuredColumnIds
    .map((id) => columns.find((column) => column.id === id))
    .filter((column): column is (typeof columns)[number] => Boolean(column));

  return (
    <section
      className="rounded-[2.5rem] p-8 md:p-10 space-y-6"
      style={{
        background: 'radial-gradient(ellipse at 0% 0%, rgba(124,111,214,0.12) 0%, rgba(255,255,255,0.85) 60%)',
        border: '1px solid rgba(124,111,214,0.16)',
        boxShadow: '0 8px 40px rgba(124,111,214,0.08)',
      }}
    >
      <div className="space-y-2">
        <h2 className="text-xl font-bold" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>{title}</h2>
        <p className="text-sm leading-7 break-keep" style={{ color: 'rgba(45,27,30,0.46)' }}>{description}</p>
      </div>

      {guideLinks.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: 'rgba(124,111,214,0.7)' }}>기초 가이드</p>
          <div className="flex flex-wrap gap-3">
            {guideLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-full text-sm font-bold transition-colors"
                style={{ background: 'rgba(45,27,30,0.08)', border: '1px solid rgba(124,111,214,0.18)', color: 'rgba(45,27,30,0.82)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: 'rgba(124,111,214,0.7)' }}>명리 칼럼</p>
          <Link href="/column" className="text-sm font-bold transition-colors" style={{ color: '#7c6fd6' }}>전체 보기 →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((column) => (
            <Link
              key={column.id}
              href={`/column/${column.id}`}
              className="rounded-[1.5rem] p-5 space-y-2 transition-transform hover:-translate-y-0.5"
              style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(124,111,214,0.14)' }}
            >
              <h3 className="text-sm font-bold break-keep leading-snug" style={{ color: '#2D1B1E' }}>{column.title}</h3>
              <p className="text-xs leading-relaxed break-keep" style={{ color: 'rgba(45,27,30,0.5)' }}>{column.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
