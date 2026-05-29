import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SajuPageClient from '@/components/SajuPageClient';
import { createMetadata } from '@/lib/site';

export const metadata = createMetadata({
  title: '무료 사주 분석 — 생년월일로 보는 나의 기운과 흐름',
  description: '생년월일시를 입력하면 오행 분포, 일주, 타고난 기질과 2026년 운세까지 AI가 무료로 분석해드려요. 초보자도 읽기 쉬운 설명형 사주 해석.',
  path: '/saju',
  keywords: ['무료 사주', '사주 분석', '사주팔자', '오행 분석', '일주 해석', '2026 운세', '사주 무료'],
});

const FAQ = [
  { q: '사주 분석에 어떤 정보가 필요한가요?', a: '이름, 생년월일, 출생 시간, 양력·음력 여부, 성별이 필요합니다. 출생 시간을 모를 경우 "모름"으로 선택하면 연·월·일 기준으로 분석합니다.' },
  { q: '출생 시간을 모르면 결과가 부정확한가요?', a: '연·월·일만으로도 오행 분포와 일주 기반 성향은 충분히 확인할 수 있습니다. 시주가 빠지면 일부 세부 해석이 제외되지만, 핵심 성향 분석은 가능합니다.' },
  { q: '양력과 음력 중 어느 걸 선택해야 하나요?', a: '본인이 아는 생년월일이 양력이면 양력을, 음력이면 음력을 선택하면 됩니다. 내부에서 자동으로 환산해 사주를 계산합니다.' },
  { q: '결과는 얼마나 걸리나요?', a: 'AI가 실시간으로 분석하기 때문에 보통 30초~1분 내에 결과를 볼 수 있습니다.' },
  { q: '결과를 저장하거나 다시 볼 수 있나요?', a: '로그인 상태에서 분석하면 결과가 저장되어 언제든 다시 확인할 수 있습니다.' },
];

const WHAT_YOU_GET = [
  { icon: '🌿', title: '오행 분포 분석', desc: '목·화·토·금·수 다섯 기운의 강약과 균형을 시각적으로 확인할 수 있어요.' },
  { icon: '☀️', title: '일주 기반 성향', desc: '일간과 일지의 조합으로 드러나는 나의 핵심 기질과 에너지 패턴을 읽어드려요.' },
  { icon: '🌊', title: '타고난 흐름 읽기', desc: '강점이 살아나는 환경, 주의할 패턴, 반복되기 쉬운 관계 방식을 설명형으로 안내해요.' },
  { icon: '📅', title: '2026년 운세', desc: '올해 어떤 주제가 부각될 가능성이 있는지, 시기별 에너지 흐름을 참고용으로 정리해드려요.' },
];

export default function SajuPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(250,162,193,0.18),transparent_28%),linear-gradient(180deg,#fff5f7_0%,#fffafb_60%,#fff5f7_100%)]">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 pt-28 pb-32 space-y-14">

        {/* ─── 히어로 ─── */}
        <header className="glass-panel rounded-[3rem] p-8 md:p-14 space-y-6">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-primary-400">Saju Analysis</p>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-gray-900 md:text-6xl break-keep">
            무료 사주 분석<br />
            <span className="text-primary-600">나의 본질과 기운을 읽다</span>
          </h1>
          <p className="max-w-2xl text-base leading-8 text-gray-600 break-keep md:text-lg">
            사주는 태어난 연·월·일·시의 네 기둥을 바탕으로 개인의 기질과 에너지 흐름을 읽는 동양 명리학의 핵심 도구입니다.
            복잡한 용어 없이, 오행 분포와 일주 성향을 중심으로 쉽게 읽을 수 있는 설명형 결과를 제공합니다.
          </p>
          {/* 클라이언트 CTA — 서버 렌더링 이후 버튼이 나타남 */}
          <SajuPageClient />
        </header>

        {/* ─── 사주란 무엇인가 ─── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-gray-900">사주 분석으로 무엇을 알 수 있나요</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {WHAT_YOU_GET.map((item) => (
              <article key={item.title} className="bg-white rounded-[2rem] border border-pink-50 shadow-sm p-6 space-y-2">
                <div className="text-3xl">{item.icon}</div>
                <h3 className="text-lg font-black text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-7 break-keep">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ─── 사주 설명 본문 ─── */}
        <section className="bg-white rounded-[2.5rem] border border-pink-50 shadow-sm p-8 md:p-12 space-y-6">
          <h2 className="text-2xl font-black text-gray-900">사주가 읽는 것은 운명이 아닌 성향입니다</h2>
          <div className="space-y-5 text-gray-600 leading-8 break-keep">
            <p>
              많은 분들이 사주를 '미래를 맞히는 예언'으로 오해하지만, 실제 명리학에서 사주는 타고난 기질과 에너지 흐름을 읽는 참고 도구에 가깝습니다.
              같은 해에 태어났더라도 월과 시간에 따라 오행 분포가 달라지며, 그 조합이 만들어내는 성향과 관계 패턴이 사주 해석의 핵심입니다.
            </p>
            <p>
              사주 분석의 기본 단위는 <strong className="text-gray-900">천간(天干)과 지지(地支)</strong>의 조합입니다.
              천간 10자와 지지 12자가 만들어내는 60개의 패턴은 개인의 기질, 강점, 조심해야 할 영역을 입체적으로 드러냅니다.
              여기에 오행(목·화·토·금·수)의 강약을 더하면 에너지의 방향과 균형 여부까지 확인할 수 있습니다.
            </p>
            <p>
              사주 치트키는 복잡한 명리 용어를 그대로 나열하는 대신, 일상 언어로 번역해 설명합니다.
              예민함은 관찰력으로, 강한 추진력은 과열 위험과 함께, 신중함은 결정 느림의 양면으로 설명해 실생활에 참고하기 좋은 형태로 제공합니다.
            </p>
            <p>
              <strong className="text-gray-900">대운(大運)</strong>은 10년 단위로 바뀌는 흐름을, <strong className="text-gray-900">세운(歲運)</strong>은 올해의 기운을 더해줍니다.
              원국의 성향이 어떤 시기에 더 잘 맞는지, 어떤 시기에 조율이 필요한지를 파악하면 연간 계획과 의사결정에 실질적인 참고가 됩니다.
            </p>
          </div>
        </section>

        {/* ─── 이용 방법 ─── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-gray-900">이용 방법</h2>
          <ol className="space-y-4">
            {[
              { step: '01', title: '정보 입력', desc: '이름, 생년월일, 출생 시간, 성별을 입력합니다. 시간을 모를 경우 "모름"을 선택하면 됩니다.' },
              { step: '02', title: 'AI 분석', desc: '오행 분포와 일주를 기반으로 AI가 맞춤 해석 리포트를 작성합니다. 보통 30초~1분 내 완료됩니다.' },
              { step: '03', title: '결과 확인', desc: '성향 요약, 오행 강약, 올해 운세 흐름을 설명형으로 읽을 수 있습니다. 로그인 시 결과가 저장됩니다.' },
            ].map((item) => (
              <li key={item.step} className="flex gap-5 bg-white rounded-[1.5rem] border border-pink-50 shadow-sm p-6">
                <span className="text-3xl font-black text-primary-200 shrink-0">{item.step}</span>
                <div>
                  <h3 className="text-base font-black text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 leading-7 break-keep">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ─── FAQ ─── */}
        <section className="space-y-5">
          <h2 className="text-2xl font-black text-gray-900">자주 묻는 질문</h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="group bg-white rounded-[1.5rem] border border-pink-50 shadow-sm p-6 cursor-pointer">
                <summary className="text-base font-black text-gray-900 list-none flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-primary-400 shrink-0 text-xl leading-none group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-sm text-gray-500 leading-7 break-keep">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ─── 관련 가이드 ─── */}
        <section className="bg-[#2D1B1E] rounded-[2.5rem] p-8 md:p-10 space-y-5">
          <h2 className="text-xl font-black text-white">사주를 더 잘 이해하고 싶다면</h2>
          <p className="text-white/50 text-sm leading-7 break-keep">결과를 읽기 전에 기초 개념을 먼저 확인하면 훨씬 입체적으로 이해할 수 있어요.</p>
          <div className="flex flex-wrap gap-3">
            {[
              { href: '/guide/what-is-saju', label: '사주란 무엇인가' },
              { href: '/guide/five-elements', label: '오행의 의미' },
              { href: '/guide/heavenly-stems-earthly-branches', label: '천간과 지지 기초' },
              { href: '/guide/what-is-ilju', label: '일주란 무엇인가' },
              { href: '/guide/birth-time-unknown', label: '출생 시간 모를 때' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>

      </div>

      <Footer />
    </main>
  );
}
