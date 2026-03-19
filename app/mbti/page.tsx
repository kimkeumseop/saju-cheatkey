import type { Metadata } from 'next';
import Link from 'next/link';
import { Brain, ChevronRight, SlidersHorizontal, Timer } from 'lucide-react';
import { createMetadata } from '@/lib/site';

export const metadata: Metadata = createMetadata({
  title: 'MBTI 테스트',
  description: '20문항 슬라이더로 3~4분 안에 확인하는 MBTI 테스트',
  path: '/mbti',
  keywords: ['MBTI 테스트', '성격 유형 검사', 'MBTI 결과'],
});

const features = [
  { icon: Timer, title: '3~4분 완성', desc: '20문항만 답하면 바로 결과를 확인할 수 있습니다.' },
  { icon: SlidersHorizontal, title: '5단계 슬라이더', desc: '매우 동의부터 매우 비동의까지 직관적으로 선택합니다.' },
  { icon: Brain, title: '16가지 유형', desc: '유형 설명, 강점과 약점, 궁합 포인트까지 한 번에 봅니다.' },
];

export default function MbtiHomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_30%),linear-gradient(180deg,#ecfdf5_0%,#f7fffb_55%,#ecfdf5_100%)] pt-20 pb-28">
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-white/80 px-5 py-2 text-sm font-black text-emerald-700 shadow-sm">
            <Brain className="h-4 w-4" />
            MBTI PERSONALITY TEST
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900 md:text-6xl">
                20문항으로 끝내는
                <br />
                <span className="bg-[linear-gradient(135deg,#059669,#10B981,#34D399)] bg-clip-text text-transparent">
                  MBTI 테스트
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
                16Personalities 스타일의 5단계 응답 방식으로 성향을 빠르게 확인하세요.
                결과 페이지에서는 유형 설명, 강점과 약점, 잘 맞는 유형까지 한 번에 볼 수 있습니다.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/mbti/test"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#10B981] px-6 py-4 text-base font-black text-white shadow-[0_16px_40px_rgba(16,185,129,0.28)] transition hover:-translate-y-0.5"
                >
                  테스트 시작하기
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <div className="inline-flex items-center rounded-2xl border border-emerald-200 bg-white/90 px-5 py-4 text-sm font-bold text-emerald-800">
                  16가지 유형 · 3~4분 소요
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-100 bg-white/85 p-6 shadow-[0_16px_50px_rgba(16,185,129,0.12)] backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-black text-emerald-600">테스트 구성</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">E/I · S/N · T/F · J/P</span>
              </div>
              <div className="space-y-4">
                {['외향 vs 내향', '감각 vs 직관', '사고 vs 감정', '판단 vs 인식'].map((item) => (
                  <div key={item} className="rounded-2xl bg-emerald-50/70 px-4 py-3 text-sm font-bold text-gray-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6">
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-[1.8rem] border border-emerald-100 bg-white/90 p-6 shadow-[0_10px_30px_rgba(16,185,129,0.08)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#10B981,#34D399)] text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-black text-gray-900">{feature.title}</h2>
                <p className="mt-2 text-sm leading-7 text-gray-600">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
