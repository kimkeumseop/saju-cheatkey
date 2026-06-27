import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CosmicBackground from '@/components/CosmicBackground';
import { createMetadata, columns } from '@/lib/site';

export const metadata = createMetadata({
  title: '명리 칼럼 전체 목록 — 사주 치트키',
  description:
    '명리학과 현대 심리학의 접점, 2026년 운세, 대운과 개운법까지. 사주를 더 깊이 이해할 수 있는 명리 칼럼을 무료로 읽어보세요.',
  path: '/column',
  keywords: ['명리학 칼럼', '사주 칼럼', '2026년 운세', '대운', '개운법', '사주 치트키'],
});

function formatDate(date: string) {
  return date.replace(/-/g, '.');
}

export default function ColumnListPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden pt-24 pb-32" style={{ background: '#0d0710' }}>
      <CosmicBackground />
      <Navbar dark />

      <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-12">
        <header className="rounded-[3rem] p-8 md:p-12 space-y-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(157,143,255,0.16)', boxShadow: '0 8px 40px rgba(157,143,255,0.06)' }}>
          <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: 'rgba(157,143,255,0.7)' }}>Myeongri Column</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight break-keep" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>명리 칼럼</h1>
          <p className="leading-relaxed break-keep text-base md:text-lg" style={{ color: 'rgba(240,232,238,0.6)' }}>
            사주를 단순한 점이 아니라 자신을 이해하는 언어로 읽어내기 위한 깊이 있는 명리 칼럼을 모았습니다. 명리학과 심리학의 접점, 2026년 병오년의 흐름, 대운과 개운법까지 천천히 읽어보세요.
          </p>
          <div className="flex flex-wrap gap-3 text-sm font-bold">
            <Link href="/" className="px-4 py-2 rounded-full transition-colors" style={{ background: 'rgba(157,143,255,0.1)', border: '1px solid rgba(157,143,255,0.2)', color: '#9d8fff' }}>
              홈으로
            </Link>
            <Link href="/guide" className="px-4 py-2 rounded-full transition-colors" style={{ background: 'rgba(157,143,255,0.1)', border: '1px solid rgba(157,143,255,0.2)', color: '#9d8fff' }}>
              사주 기초 가이드
            </Link>
          </div>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          {columns.map((column) => (
            <Link
              key={column.id}
              href={`/column/${column.id}`}
              className="rounded-[2rem] p-7 md:p-8 space-y-4 transition-transform hover:-translate-y-1"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(157,143,255,0.14)' }}
            >
              <div className="flex items-center gap-3 text-xs font-bold" style={{ color: 'rgba(240,232,238,0.42)' }}>
                <span>{formatDate(column.date)}</span>
                <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}></span>
                <span>읽기 시간 {column.readMinutes}분</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight break-keep leading-snug" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>{column.title}</h2>
              <p className="text-sm md:text-base leading-relaxed break-keep" style={{ color: 'rgba(240,232,238,0.6)' }}>{column.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: '#9d8fff' }}>읽어보기 →</span>
            </Link>
          ))}
        </div>
      </div>

      <Footer dark />
    </main>
  );
}
