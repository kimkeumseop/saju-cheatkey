import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CosmicBackground from '@/components/CosmicBackground';
import GunghapCTA from '@/components/GunghapCTA';
import GungHapProcessingClient from '@/components/GungHapProcessingClient';
import RelatedReads from '@/components/RelatedReads';
import { createMetadata } from '@/lib/site';

export const metadata: Metadata = createMetadata({
  title: '무료 운명 궁합 — 사주로 보는 두 사람의 인연 분석',
  description: '두 사람의 생년월일을 입력하면 오행 조합과 일주 궁합을 AI가 무료로 분석해드려요. 연인·부부·친구·직장 관계까지 사주로 보는 인연 흐름.',
  path: '/gunghap',
  keywords: ['무료 궁합', '사주 궁합', '궁합 보기', '운명 궁합', '연애 궁합', '부부 궁합', '오행 궁합'],
});

const FAQ = [
  { q: '궁합 분석에 어떤 정보가 필요한가요?', a: '두 사람 각각의 이름, 생년월일, 출생 시간, 성별이 필요합니다. 출생 시간을 모를 경우 "모름"으로 선택해도 됩니다.' },
  { q: '연인 외에 다른 관계도 볼 수 있나요?', a: '네. 연인, 부부, 친구, 직장 동료 등 관계 유형을 선택할 수 있으며, 선택한 맥락에 맞는 해석을 제공합니다.' },
  { q: '궁합이 나쁘면 이 관계는 안 되는 건가요?', a: '아닙니다. 사주 궁합은 두 사람의 에너지가 어떻게 만나는지를 보여주는 참고 자료입니다. 충돌이 있는 구조도 서로의 차이를 이해하면 오히려 균형 잡힌 관계가 될 수 있어요.' },
  { q: '결과는 얼마나 걸리나요?', a: 'AI가 실시간으로 두 사람의 사주를 함께 분석해 보통 30초~1분 내에 결과를 확인할 수 있습니다.' },
  { q: '오행 궁합과 일반 궁합의 차이는 무엇인가요?', a: '오행 궁합은 두 사람의 오행 분포가 서로 상생(돕는)인지 상극(충돌)인지를 봅니다. 여기에 일주 조합, 관계 패턴, 소통 방식까지 더해 입체적인 인연 분석을 제공합니다.' },
];

const WHAT_YOU_GET = [
  { icon: '⚡', title: '오행 상생·상극 분석', desc: '두 사람의 오행이 서로 돕는 구조인지, 충돌하는 구조인지 한눈에 확인할 수 있어요.' },
  { icon: '🌙', title: '일주 궁합 해석', desc: '각자의 일주 조합이 만들어내는 관계 패턴, 소통 방식, 보완 지점을 설명형으로 안내해요.' },
  { icon: '💬', title: '관계 유형별 맞춤 해석', desc: '연인, 부부, 친구, 직장 등 관계 유형에 맞게 집중해야 할 궁합 포인트를 따로 안내해요.' },
  { icon: '🔮', title: '인연의 흐름 파악', desc: '두 사람이 어떤 국면에서 잘 맞고, 어느 부분에서 조율이 필요한지 흐름을 읽어드려요.' },
];

export default function GunghapPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden" style={{ background: '#0d0710' }}>
      <CosmicBackground />
      <Navbar dark />
      <GungHapProcessingClient />

      <div className="relative z-10 mx-auto max-w-4xl px-6 pt-28 pb-32 space-y-14">

        <header
          className="rounded-[3rem] p-8 md:p-14 space-y-6"
          style={{
            background: 'radial-gradient(ellipse at 110% -10%, rgba(212,104,138,0.12) 0%, rgba(18,8,16,0.90) 55%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(212,104,138,0.18)',
            boxShadow: '0 8px 40px rgba(212,104,138,0.10), 0 1px 0 rgba(255,255,255,0.04) inset',
          }}
        >
          <p className="text-xs font-black uppercase tracking-[0.28em]" style={{ color: 'rgba(212,104,138,0.72)' }}>Destiny Compatibility</p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl break-keep" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>
            운명 궁합 분석<br />
            <span style={{ background: 'linear-gradient(135deg, #d4688a 0%, #e8829a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>두 사람의 인연을 읽다</span>
          </h1>
          <p className="max-w-2xl text-base leading-8 break-keep md:text-lg" style={{ color: 'rgba(240,232,238,0.52)' }}>
            두 사람의 사주 오행 조합과 일주 궁합을 분석해 관계의 에너지 흐름을 읽어드립니다.
            맞고 틀림이 아닌, 서로의 차이와 보완 지점을 이해하는 참고 자료로 활용하세요.
          </p>
          <GunghapCTA />
        </header>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>궁합 분석으로 무엇을 알 수 있나요</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {WHAT_YOU_GET.map((item) => (
              <article
                key={item.title}
                className="rounded-[2rem] p-6 space-y-2"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(212,104,138,0.12)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
                }}
              >
                <div className="text-3xl">{item.icon}</div>
                <h3 className="text-lg font-bold" style={{ color: '#f5eef2' }}>{item.title}</h3>
                <p className="text-sm leading-7 break-keep" style={{ color: 'rgba(240,232,238,0.46)' }}>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="rounded-[2.5rem] p-8 md:p-12 space-y-6"
          style={{
            background: 'rgba(255,255,255,0.025)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(212,104,138,0.10)',
            boxShadow: '0 4px 32px rgba(212,104,138,0.05), 0 1px 0 rgba(255,255,255,0.04) inset',
          }}
        >
          <h2 className="text-2xl font-bold" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>사주로 보는 궁합이란 무엇인가요</h2>
          <div className="space-y-5 leading-8 break-keep" style={{ color: 'rgba(240,232,238,0.62)' }}>
            <p>
              사주 궁합은 두 사람의 태어난 날짜와 시간을 기반으로 각자의 오행 분포, 일주 구조, 에너지의 방향이 어떻게 교차하는지를 보는 분석 방법입니다.
              단순히 잘 맞는다, 안 맞는다를 판정하는 것이 아니라, 두 사람의 관계에서 어떤 패턴이 반복되기 쉽고 어떤 부분에서 보완이 필요한지를 파악하는 참고 도구입니다.
            </p>
            <p>
              오행 상생·상극은 궁합의 핵심 축입니다. 예를 들어 한 사람의 강한 화(火) 기운이 상대방의 금(金) 기운을 약하게 만드는 구조라면,
              한쪽이 강하게 주도하고 상대방은 눌리기 쉬운 패턴이 나타날 수 있습니다.
              반대로 서로의 기운이 상생 관계라면 자연스럽게 에너지가 순환해 편안한 관계가 형성되기도 합니다.
            </p>
            <p>
              일주 궁합은 각자의 일간(日干)과 일지(日支) 조합을 함께 봅니다.
              두 사람이 어떤 방식으로 감정을 표현하고, 어떤 상황에서 갈등이 생기기 쉬우며, 장기적으로 어떤 방향으로 관계가 발전할 수 있는지를 읽는 데 활용합니다.
            </p>
            <p>
              중요한 것은, 궁합이 좋지 않다는 해석이 관계를 포기해야 한다는 뜻이 아니라는 점입니다.
              두 사람의 에너지 차이를 이해하면 충돌 포인트를 미리 파악하고 소통 방식을 조율하는 데 활용할 수 있습니다.
              실제로 충돌 구조처럼 보이는 관계가 상호 보완적으로 작동하는 경우도 많습니다.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>이용 방법</h2>
          <ol className="space-y-4">
            {[
              { step: '01', title: '두 사람 정보 입력', desc: '각자의 이름, 생년월일, 출생 시간, 성별과 관계 유형(연인·부부·친구 등)을 선택합니다.' },
              { step: '02', title: 'AI 궁합 분석', desc: '두 사람의 오행 조합과 일주 구조를 AI가 함께 읽어 맞춤 궁합 리포트를 작성합니다.' },
              { step: '03', title: '결과 확인', desc: '오행 상생·상극 분석, 관계 패턴, 보완 포인트, 주의할 상황을 설명형으로 확인할 수 있습니다.' },
            ].map((item) => (
              <li
                key={item.step}
                className="flex gap-5 rounded-[1.5rem] p-6"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(212,104,138,0.10)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
                }}
              >
                <span className="text-3xl font-black shrink-0" style={{ color: 'rgba(212,104,138,0.30)' }}>{item.step}</span>
                <div>
                  <h3 className="text-base font-bold" style={{ color: '#f5eef2' }}>{item.title}</h3>
                  <p className="mt-1 text-sm leading-7 break-keep" style={{ color: 'rgba(240,232,238,0.46)' }}>{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl font-bold" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>자주 묻는 질문</h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-[1.5rem] p-6 cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(212,104,138,0.10)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                }}
              >
                <summary className="text-base font-bold list-none flex items-center justify-between gap-4" style={{ color: '#f5eef2' }}>
                  {item.q}
                  <span className="shrink-0 text-xl leading-none group-open:rotate-45 transition-transform" style={{ color: '#d4688a' }}>+</span>
                </summary>
                <p className="mt-4 text-sm leading-7 break-keep" style={{ color: 'rgba(240,232,238,0.46)' }}>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section
          className="rounded-[2.5rem] p-8 md:p-10 space-y-5"
          style={{
            background: 'radial-gradient(ellipse at 0% 0%, rgba(157,143,255,0.12) 0%, rgba(18,8,16,0.85) 60%)',
            border: '1px solid rgba(157,143,255,0.16)',
            boxShadow: '0 8px 40px rgba(157,143,255,0.08), 0 1px 0 rgba(255,255,255,0.04) inset',
          }}
        >
          <h2 className="text-xl font-bold" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>함께 읽으면 좋은 가이드</h2>
          <p className="text-sm leading-7 break-keep" style={{ color: 'rgba(240,232,238,0.46)' }}>궁합 결과를 더 잘 이해하고 싶다면 아래 기초 가이드를 먼저 읽어보세요.</p>
          <div className="flex flex-wrap gap-3">
            {[
              { href: '/guide/how-to-read-gunghap', label: '궁합 보는 법' },
              { href: '/guide/five-elements', label: '오행의 의미' },
              { href: '/guide/heavenly-stems-earthly-branches', label: '천간과 지지 기초' },
              { href: '/guide/what-is-saju', label: '사주란 무엇인가' },
              { href: '/saju', label: '내 사주 먼저 보기' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-full text-sm font-bold transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(157,143,255,0.18)', color: 'rgba(240,232,238,0.82)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <RelatedReads
          title="궁합을 더 깊이 이해하는 칼럼"
          description="두 사람의 기운이 어떻게 만나는지, 관계와 해석의 층위를 다룬 명리 칼럼을 함께 읽어보세요."
          featuredColumnIds={['2', '4', '6']}
        />

      </div>

      <Footer dark />
    </main>
  );
}
