import type { Metadata } from 'next';
import Link from 'next/link';
import { Brain, ChevronRight, SlidersHorizontal, Timer } from 'lucide-react';
import AuroraBackground from '@/components/AuroraBackground';
import Footer from '@/components/Footer';
import RelatedReads from '@/components/RelatedReads';
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
    <main className="relative min-h-screen overflow-x-hidden pt-20 pb-28" style={{ background: '#FBF7F2' }}>
      <AuroraBackground />
      <section className="relative z-10 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 inline-flex items-center gap-3 rounded-full px-5 py-2 text-sm font-black" style={{ background: 'rgba(14,159,115,0.10)', border: '1px solid rgba(14,159,115,0.25)', color: '#0e9f73' }}>
            <Brain className="h-4 w-4" />
            MBTI PERSONALITY TEST
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>
                20문항으로 끝내는
                <br />
                <span className="bg-[linear-gradient(135deg,#0e9f73,#7fd9b8)] bg-clip-text text-transparent">
                  MBTI 테스트
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 md:text-lg" style={{ color: 'rgba(45,27,30,0.52)' }}>
                16Personalities 스타일의 5단계 응답 방식으로 성향을 빠르게 확인하세요.
                결과 페이지에서는 유형 설명, 강점과 약점, 잘 맞는 유형까지 한 번에 볼 수 있습니다.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/mbti/test"
                  className="inline-flex items-center gap-2 rounded-2xl px-6 py-4 text-base font-bold text-white transition hover:-translate-y-0.5 hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg, #0e9f73, #059669)', boxShadow: '0 8px 32px rgba(14,159,115,0.28)' }}
                >
                  테스트 시작하기
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <div className="inline-flex items-center rounded-2xl px-5 py-4 text-sm font-bold" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(14,159,115,0.2)', color: 'rgba(14,159,115,0.85)' }}>
                  16가지 유형 · 3~4분 소요
                </div>
              </div>
            </div>

            <div
              className="rounded-[2rem] p-6"
              style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(14,159,115,0.16)',
                boxShadow: '0 8px 40px rgba(14,159,115,0.08)',
              }}
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-black" style={{ color: '#0e9f73' }}>테스트 구성</span>
                <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: 'rgba(14,159,115,0.12)', color: '#0e9f73' }}>E/I · S/N · T/F · J/P</span>
              </div>
              <div className="space-y-4">
                {['외향 vs 내향', '감각 vs 직관', '사고 vs 감정', '판단 vs 인식'].map((item) => (
                  <div key={item} className="rounded-2xl px-4 py-3 text-sm font-bold" style={{ background: 'rgba(14,159,115,0.06)', border: '1px solid rgba(14,159,115,0.12)', color: 'rgba(45,27,30,0.7)' }}>
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
                style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(14,159,115,0.14)', boxShadow: '0 4px 24px rgba(45,27,30,0.22)' }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: 'linear-gradient(135deg, #0e9f73, #059669)', boxShadow: '0 4px 16px rgba(14,159,115,0.3)' }}>
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold" style={{ color: '#2D1B1E' }}>{feature.title}</h2>
                <p className="mt-2 text-sm leading-7" style={{ color: 'rgba(45,27,30,0.46)' }}>{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 mt-14 px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight break-keep" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>
              MBTI 네 가지 지표는 무엇을 나누는가
            </h2>
            <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>
              MBTI는 성격을 네 개의 축으로 나누어 살펴보는 분류 체계입니다. 각 축은 우열을 가르는 것이 아니라, 같은 상황에서 무엇을 먼저 보고 어떻게 반응하는지의 차이를 설명합니다. 네 축의 조합으로 열여섯 가지 유형이 만들어집니다.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { code: 'E / I', title: '에너지의 방향', body: '사교성의 크기가 아니라 회복 방식의 차이입니다. 사람들과 있을 때 충전되면 E, 혼자일 때 충전되면 I입니다. 말수가 많은 I도 조용한 E도 흔합니다.' },
              { code: 'S / N', title: '정보를 받는 방식', body: '감각(S)은 확인 가능한 사실에서, 직관(N)은 그 너머의 가능성과 패턴에서 출발합니다. 같은 상황도 S는 사실로, N은 의미로 먼저 설명합니다.' },
              { code: 'T / F', title: '판단의 기준', body: '사고(T)는 일관된 원칙을, 감정(F)은 사람과 상황의 조화를 우선합니다. T가 냉정하다는 뜻이 아니라 먼저 확인하는 항목이 다르다는 의미입니다.' },
              { code: 'J / P', title: '생활을 다루는 방식', body: '판단(J)은 미리 정해두고 진행하는 쪽, 인식(P)은 열어두고 조정하는 쪽입니다. 계획성의 유무가 아니라 결정을 확정하는 시점의 차이입니다.' },
            ].map((item) => (
              <div key={item.code} className="rounded-[1.8rem] p-6 space-y-2" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(14,159,115,0.14)' }}>
                <p className="text-xs font-black tracking-[0.28em]" style={{ color: '#0e9f73' }}>{item.code}</p>
                <h3 className="font-bold break-keep" style={{ color: '#2D1B1E' }}>{item.title}</h3>
                <p className="text-sm leading-7 break-keep" style={{ color: 'rgba(45,27,30,0.6)' }}>{item.body}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[2rem] p-7 space-y-3" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(14,159,115,0.14)' }}>
            <h3 className="text-lg font-bold" style={{ color: '#2D1B1E' }}>결과를 읽을 때의 기준</h3>
            <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>
              네 글자로 나온 유형은 정체성이 아니라 지금의 경향을 요약한 표현입니다. 지표 점수가 중간에 가까울수록 두 방향의 특성이 함께 나타나므로, 유형 이름보다 개별 지표의 기울기를 보시는 편이 정확합니다. 시기를 두고 다시 검사했을 때 결과가 바뀌는 것도 이 때문이며, 오류라기보다 자기 인식이 달라졌다는 신호에 가깝습니다.
            </p>
            <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>
              MBTI는 심리학계에서 신뢰도와 타당도에 대한 비판이 꾸준히 제기되어 온 도구이기도 합니다. 자기 이해와 대화를 위한 언어로 쓰시고, 채용이나 진단처럼 무게가 큰 판단의 근거로는 사용하지 않으시길 권합니다.
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 mt-12 px-6">
        <div className="mx-auto max-w-5xl">
          <RelatedReads
            title="성격을 더 깊이 읽는 명리 칼럼"
            description="MBTI가 성격의 한 단면이라면, 명리학은 타고난 기질을 또 다른 언어로 풀어냅니다. 두 관점을 함께 비교해보세요."
            featuredColumnIds={['1', '2', '6']}
          />
        </div>
      </section>

      <Footer />
    </main>
    </>
  );
}
