// src/app/tarot/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import TodayTarotCard from '@/components/tarot/TodayTarotCard'
import AuroraBackground from '@/components/AuroraBackground'
import Footer from '@/components/Footer'
import RelatedReads from '@/components/RelatedReads'

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
    images: [{ url: 'https://saju-cheatkey.kr/og', width: 1200, height: 630, alt: '사주 치트키 타로 카드' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '무료 타로 카드 리딩 AI 해석 | 사주 치트키',
    description: 'AI 타로 리더 성월이 오늘의 카드를 해석해드려요.',
    images: ['https://saju-cheatkey.kr/og'],
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
    <main className="relative min-h-screen overflow-x-hidden" style={{ background: '#FBF7F2' }}>
      <AuroraBackground />

      {/* 히어로 */}
      <section className="relative z-10 pt-20 pb-12 px-4 text-center">
        <div
          className="inline-block px-4 py-1.5 rounded-full text-xs font-black tracking-widest mb-6"
          style={{ background: 'rgba(124,111,214,0.12)', border: '1px solid rgba(124,111,214,0.25)', color: '#7c6fd6' }}
        >
          ✦ TAROT READING ✦
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>
          타로 카드로<br />
          <span style={{
            background: 'linear-gradient(135deg, #7c6fd6, #7c6fd6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            지금 이 순간을 읽다
          </span>
        </h1>
        <p className="text-base max-w-md mx-auto mb-8 leading-relaxed" style={{ color: 'rgba(45,27,30,0.5)' }}>
          타로 리더 성월이 카드의 메시지를 해석해드려요.<br />
          마음속 질문을 가지고 카드를 선택해보세요 🌙
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/tarot/reading"
            className="px-8 py-3.5 rounded-full text-white font-bold text-sm transition-all hover:-translate-y-0.5 hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #7c6fd6, #7c6fd6)',
              boxShadow: '0 8px 24px rgba(124,111,214,0.3)',
            }}
          >
            🔮 카드 펼치기
          </Link>
          <Link
            href="/tarot/dictionary"
            className="px-8 py-3.5 rounded-full font-bold text-sm transition-all hover:bg-black/[0.08]"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(124,111,214,0.25)',
              color: '#7c6fd6',
            }}
          >
            카드 사전 보기
          </Link>
        </div>
      </section>

      {/* 오늘의 타로 */}
      <section className="relative z-10 px-4 max-w-sm mx-auto mb-12">
        <TodayTarotCard />
      </section>

      {/* Features */}
      <section className="relative z-10 px-4 max-w-3xl mx-auto pb-20">
        <h2 className="text-center text-lg font-bold mb-6" style={{ color: 'rgba(45,27,30,0.82)' }}>✨ 타로 치트키만의 특별함</h2>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(124,111,214,0.16)',
                boxShadow: '0 4px 24px rgba(45,27,30,0.22)',
              }}
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-bold text-sm mb-1" style={{ color: '#2D1B1E' }}>{f.title}</div>
              <div className="text-xs leading-relaxed" style={{ color: 'rgba(45,27,30,0.46)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 타로 기초 해설 */}
      <section className="relative z-10 px-4 max-w-3xl mx-auto pb-20 space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight break-keep" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>
            타로는 무엇을 보는 도구인가
          </h2>
          <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>
            타로 덱은 78장으로 이루어져 있습니다. 인생의 큰 주제를 다루는 대아르카나 22장과, 일상의 구체적인 국면을 다루는 소아르카나 56장입니다. 소아르카나는 다시 완드·컵·소드·펜타클 네 개의 슈트로 나뉘며 각각 불·물·공기·흙의 원소에 대응합니다. 완드는 열정과 추진, 컵은 감정과 관계, 소드는 생각과 갈등, 펜타클은 현실적인 결과를 담당합니다.
          </p>
          <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>
            타로가 잘 하는 일은 미래를 맞히는 것이 아니라 지금 상황을 다른 각도에서 비추는 것입니다. 같은 카드가 나와도 질문이 다르면 해석이 달라지는 이유가 여기 있습니다. 그래서 카드를 뽑기 전에 질문을 얼마나 구체적으로 좁혔는지가 결과의 쓸모를 크게 좌우합니다.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: '대아르카나 22장', body: '바보에서 세계까지, 인생의 전환점과 큰 주제를 다룹니다. 리딩에 많이 등장하면 개인의 선택보다 큰 흐름이 움직이는 국면으로 봅니다.' },
            { title: '소아르카나 56장', body: '네 슈트 각 14장으로, 일상에서 벌어지는 구체적인 상황을 다룹니다. 지금 무엇을 하면 좋을지에 대한 힌트가 여기서 나옵니다.' },
            { title: '정방향과 역방향', body: '역방향은 반대의 의미가 아니라 같은 에너지가 막히거나 과해진 상태입니다. 좋고 나쁨이 아니라 상태의 차이로 읽습니다.' },
          ].map((item) => (
            <div key={item.title} className="p-6 rounded-2xl space-y-2" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(124,111,214,0.16)' }}>
              <h3 className="font-bold break-keep" style={{ color: '#2D1B1E' }}>{item.title}</h3>
              <p className="text-sm leading-7 break-keep" style={{ color: 'rgba(45,27,30,0.6)' }}>{item.body}</p>
            </div>
          ))}
        </div>

        <div className="p-7 rounded-[2rem] space-y-3" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(124,111,214,0.16)' }}>
          <h3 className="text-lg font-bold" style={{ color: '#2D1B1E' }}>이렇게 쓰시면 도움이 됩니다</h3>
          <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>
            &ldquo;잘 될까요&rdquo;처럼 예/아니오로 끝나는 질문보다, &ldquo;지금 무엇을 준비하면 좋을까요&rdquo;처럼 답을 행동으로 옮길 수 있는 질문이 훨씬 유용한 결과를 만듭니다. 또한 같은 질문을 짧은 간격으로 반복해 뽑는 것은 권하지 않습니다. 원하는 답이 나올 때까지 묻는 형태가 되면 생각을 정리하는 도구가 아니라 불안을 달래는 반복 행동이 되기 때문입니다.
          </p>
          <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>
            타로는 검증된 예측 체계가 아닙니다. 이직이나 계약, 이별처럼 되돌리기 어려운 결정은 현실 정보와 대화로 판단하시고, 타로는 그 과정에서 놓친 관점을 점검하는 보조 자료로 쓰시는 것이 안전합니다.
          </p>
        </div>
      </section>

      <section className="relative z-10 px-4 max-w-3xl mx-auto pb-24">
        <RelatedReads
          title="명리 칼럼으로 더 깊이"
          description="타로가 오늘의 흐름을 비춰준다면, 명리 칼럼은 나를 이해하는 더 큰 틀을 보여줍니다. 함께 읽어보세요."
          featuredColumnIds={['1', '2', '6']}
        />
      </section>

      <Footer />
    </main>
    </>
  )
}
