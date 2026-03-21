// src/app/tarot/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import TodayTarotCard from '@/components/tarot/TodayTarotCard'

export const metadata: Metadata = {
  title: '무료 타로 카드 리딩 AI 해석 | 사주 치트키',
  description: 'AI 타로 리더 성월이 오늘의 카드를 해석해드려요. 원카드, 쓰리카드, 연애·직업·금전 스프레드와 78장 타로 카드 사전을 무료로 제공합니다.',
  keywords: ['무료 타로', '타로 카드 리딩', 'AI 타로', '타로 점', '타로 카드 사전', '오늘의 타로', '연애 타로'],
  alternates: { canonical: 'https://saju-cheatkey.kr/tarot' },
  openGraph: {
    title: '무료 타로 카드 리딩 AI 해석 | 사주 치트키',
    description: 'AI 타로 리더 성월이 오늘의 카드를 해석해드려요. 원카드, 쓰리카드, 78장 카드 사전까지 무료.',
    url: 'https://saju-cheatkey.kr/tarot',
    siteName: '사주 치트키',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: 'https://saju-cheatkey.kr/og-default.svg', width: 1200, height: 630, alt: '사주 치트키 타로 카드' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '무료 타로 카드 리딩 AI 해석 | 사주 치트키',
    description: 'AI 타로 리더 성월이 오늘의 카드를 해석해드려요.',
    images: ['https://saju-cheatkey.kr/og-default.svg'],
  },
}

const FEATURES = [
  { icon: '🔮', title: '맞춤 해석', desc: '질문과 카드 조합을 분석해 나만의 해석을 제공해요' },
  { icon: '🃏', title: '78장 완전 지원', desc: '대아르카나부터 소아르카나까지 정·역방향 해석 모두 포함' },
  { icon: '⭐', title: '오늘의 타로', desc: '매일 새로운 카드가 오늘 하루의 에너지를 알려드려요' },
  { icon: '🎴', title: '다양한 스프레드', desc: '원카드, 쓰리카드, 오각형 스프레드로 깊이 있는 리딩' },
]

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '홈', item: 'https://saju-cheatkey.kr' },
    { '@type': 'ListItem', position: 2, name: '타로 카드', item: 'https://saju-cheatkey.kr/tarot' },
  ],
};

export default function TarotPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    <main className="min-h-screen tarot-bg">

      {/* 히어로 */}
      <section className="pt-20 pb-12 px-4 text-center">
        <div
          className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-widest mb-6"
          style={{ background: 'var(--tarot-50)', color: 'var(--tarot-600)' }}
        >
          ✦ TAROT READING ✦
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
          타로 카드로<br />
          <span style={{
            background: 'linear-gradient(135deg, var(--tarot-500), var(--tarot-800))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            지금 이 순간을 읽다
          </span>
        </h1>
        <p className="text-gray-500 text-base max-w-md mx-auto mb-8 leading-relaxed">
          타로 리더 성월이 카드의 메시지를 해석해드려요.<br />
          마음속 질문을 가지고 카드를 선택해보세요 🌙
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/tarot/reading"
            className="px-8 py-3.5 rounded-full text-white font-medium text-sm transition-all hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, var(--tarot-500), var(--tarot-800))',
              boxShadow: '0 8px 24px rgba(127,119,221,0.3)',
            }}
          >
            🔮 카드 펼치기
          </Link>
          <Link
            href="/tarot/dictionary"
            className="px-8 py-3.5 rounded-full font-medium text-sm transition-all hover:opacity-80"
            style={{
              background: 'white',
              border: '1px solid var(--tarot-200)',
              color: 'var(--tarot-600)',
            }}
          >
            카드 사전 보기
          </Link>
        </div>
      </section>

      {/* 오늘의 타로 */}
      <section className="px-4 max-w-sm mx-auto mb-12">
        <TodayTarotCard />
      </section>

      {/* Features */}
      <section className="px-4 max-w-3xl mx-auto pb-20">
        <h2 className="text-center text-lg font-semibold text-gray-700 mb-6">✨ 타로 치트키만의 특별함</h2>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass-card p-5 rounded-2xl"
              style={{ borderColor: 'rgba(127,119,221,0.18)' }}
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-semibold text-gray-800 text-sm mb-1">{f.title}</div>
              <div className="text-gray-500 text-xs leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

    </main>
    </>
  )
}
