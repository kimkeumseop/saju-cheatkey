import type { Metadata } from 'next';
import Link from 'next/link';
import { Brain, ChevronRight, SlidersHorizontal, Timer } from 'lucide-react';
import CosmicBackground from '@/components/CosmicBackground';
import { createMetadata } from '@/lib/site';

export const metadata: Metadata = createMetadata({
  title: '무료 MBTI 테스트 16가지 성격유형 | 사주 치트키',
  description: '20문항으로 3~4분 만에 완성하는 무료 MBTI 성격유형 테스트. INTJ, INTP, ENFP 등 16가지 유형 설명, 강점과 약점, 궁합 포인트까지 한 번에 확인하세요.',
  path: '/mbti',
  keywords: ['무료 MBTI 테스트', 'MBTI 성격유형', 'MBTI 16가지 유형', '성격유형 검사', 'MBTI 결과', 'MBTI 궁합', 'INTJ', 'ENFP', 'INFP'],
});

const features = [
  { icon: Timer, title: '3~4분 완성', desc: '20문항만 답하면 바로 결과를 확인할 수 있습니다.' },
  { icon: SlidersHorizontal, title: '5단계 슬라이더', desc: '매우 동의부터 매우 비동의까지 직관적으로 선택합니다.' },
  { icon: Brain, title: '16가지 유형', desc: '유형 설명, 강점과 약점, 궁합 포인트까지 한 번에 봅니다.' },
];

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '홈', item: 'https://saju-cheatkey.kr' },
    { '@type': 'ListItem', position: 2, name: 'MBTI 테스트', item: 'https://saju-cheatkey.kr/mbti' },
  ],
};

export default function MbtiHomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    <main className="relative min-h-screen overflow-x-hidden pt-20 pb-28" style={{ background: '#0d0710' }}>
      <CosmicBackground />
      <section className="relative z-10 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 inline-flex items-center gap-3 rounded-full px-5 py-2 text-sm font-black" style={{ background: 'rgba(0,229,160,0.10)', border: '1px solid rgba(0,229,160,0.25)', color: '#00e5a0' }}>
            <Brain className="h-4 w-4" />
            MBTI PERSONALITY TEST
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>
                20문항으로 끝내는
                <br />
                <span className="bg-[linear-gradient(135deg,#00e5a0,#7decc8)] bg-clip-text text-transparent">
                  MBTI 테스트
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 md:text-lg" style={{ color: 'rgba(240,232,238,0.52)' }}>
                16Personalities 스타일의 5단계 응답 방식으로 성향을 빠르게 확인하세요.
                결과 페이지에서는 유형 설명, 강점과 약점, 잘 맞는 유형까지 한 번에 볼 수 있습니다.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/mbti/test"
                  className="inline-flex items-center gap-2 rounded-2xl px-6 py-4 text-base font-bold text-white transition hover:-translate-y-0.5 hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg, #00e5a0, #059669)', boxShadow: '0 8px 32px rgba(0,229,160,0.28), 0 1px 0 rgba(255,255,255,0.16) inset' }}
                >
                  테스트 시작하기
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <div className="inline-flex items-center rounded-2xl px-5 py-4 text-sm font-bold" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,229,160,0.2)', color: 'rgba(0,229,160,0.85)' }}>
                  16가지 유형 · 3~4분 소요
                </div>
              </div>
            </div>

            <div
              className="rounded-[2rem] p-6"
              style={{
                background: 'rgba(255,255,255,0.025)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(0,229,160,0.16)',
                boxShadow: '0 8px 40px rgba(0,229,160,0.08), 0 1px 0 rgba(255,255,255,0.04) inset',
              }}
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-black" style={{ color: '#00e5a0' }}>테스트 구성</span>
                <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: 'rgba(0,229,160,0.12)', color: '#00e5a0' }}>E/I · S/N · T/F · J/P</span>
              </div>
              <div className="space-y-4">
                {['외향 vs 내향', '감각 vs 직관', '사고 vs 감정', '판단 vs 인식'].map((item) => (
                  <div key={item} className="rounded-2xl px-4 py-3 text-sm font-bold" style={{ background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.12)', color: 'rgba(240,232,238,0.7)' }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6">
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-[1.8rem] p-6"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(0,229,160,0.14)', boxShadow: '0 4px 24px rgba(0,0,0,0.22)' }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: 'linear-gradient(135deg, #00e5a0, #059669)', boxShadow: '0 4px 16px rgba(0,229,160,0.3)' }}>
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold" style={{ color: '#f5eef2' }}>{feature.title}</h2>
                <p className="mt-2 text-sm leading-7" style={{ color: 'rgba(240,232,238,0.46)' }}>{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
    </>
  );
}
