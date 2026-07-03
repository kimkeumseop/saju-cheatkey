import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuroraBackground from '@/components/AuroraBackground';
import { createMetadata, SITE_URL, SITE_NAME } from '@/lib/site';
import UnseClient from './UnseClient';

export const metadata: Metadata = createMetadata({
  title: '오늘의 운세 — 매일 무료로 확인하는 나의 하루 흐름',
  description:
    '생년월일 기반으로 매일 달라지는 오늘의 운세를 무료로 확인하세요. 그날의 일진과 내 사주의 상호작용을 바탕으로 총운, 애정운, 재물운, 직장운을 안내합니다.',
  path: '/unse',
  keywords: ['오늘의 운세', '무료 운세', '오늘 운세', '일진', '띠별 운세', '2026년 운세', '사주 치트키'],
});

const unseFaq = [
  {
    question: '오늘의 운세는 무엇을 근거로 만들어지나요?',
    answer:
      '명리학에서는 하루하루에도 그날의 천간과 지지, 즉 일진(日辰)이 있다고 봅니다. 오늘의 운세는 그날의 일진이 내 사주 원국과 어떤 관계를 맺는지를 바탕으로, 하루의 전반적인 흐름과 주의할 영역을 참고용으로 정리한 콘텐츠입니다.',
  },
  {
    question: '매일 내용이 달라지나요?',
    answer:
      '네. 일진은 60갑자를 따라 매일 바뀌기 때문에, 같은 사주라도 날짜에 따라 해석이 달라집니다. 날짜가 바뀌면 새로운 운세가 생성됩니다.',
  },
  {
    question: '운세 내용은 얼마나 믿어야 하나요?',
    answer:
      '오늘의 운세는 미래를 단정하는 예언이 아니라 하루를 계획할 때 참고할 수 있는 관점 중 하나입니다. 중요한 결정은 실제 상황과 객관적인 정보를 우선으로 판단하고, 운세는 하루의 컨디션과 태도를 점검하는 가벼운 도구로 활용하는 것이 좋습니다.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/unse#webpage`,
      url: `${SITE_URL}/unse`,
      name: '오늘의 운세 — 매일 무료로 확인하는 나의 하루 흐름',
      description:
        '생년월일 기반으로 매일 달라지는 오늘의 운세를 무료로 확인하세요. 그날의 일진과 내 사주의 상호작용을 바탕으로 하루의 흐름을 안내합니다.',
      inLanguage: 'ko-KR',
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: '오늘의 운세', item: `${SITE_URL}/unse` },
      ],
    },
  ],
};

const relatedGuides = [
  {
    href: '/guide/how-to-read-yearly-fortune',
    title: '연운 읽는 법',
    description: '한 해의 흐름을 읽는 기본 관점을 설명합니다.',
  },
  {
    href: '/guide/what-is-daeun',
    title: '대운이란 무엇인가',
    description: '10년 단위로 흐르는 큰 운의 개념을 안내합니다.',
  },
  {
    href: '/guide/reading-2026-fortune',
    title: '2026년 병오년 운세 읽기',
    description: '병오년의 기운과 해석 포인트를 정리했습니다.',
  },
];

export default function UnsePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden pt-20 pb-32" style={{ background: '#FBF7F2' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AuroraBackground />
      <Navbar />

      <div className="relative z-10 max-w-md mx-auto px-6 py-8">
        <UnseClient />
      </div>

      {/* 정보성 콘텐츠: 오늘의 운세 개념/활용 안내 */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 mt-12 space-y-6">
        <section className="rounded-[2.5rem] p-8 md:p-10 space-y-5" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(212,104,138,0.12)' }}>
          <h2 className="text-2xl font-bold tracking-tight break-keep" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>오늘의 운세는 어떻게 만들어지나요</h2>
          <div className="space-y-4 leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>
            <p>
              명리학에서는 연, 월, 일, 시 각각에 고유한 기운이 흐른다고 봅니다. 그중 하루 단위의 기운을 일진(日辰)이라고 부르며, 일진은 60갑자의 순서를 따라 매일 바뀝니다. 오늘의 운세는 그날의 일진이 내 사주 원국의 여덟 글자와 어떤 관계(생, 극, 합, 충)를 만드는지를 바탕으로 하루의 흐름을 읽는 방식입니다.
            </p>
            <p>
              같은 날이라도 사주가 다르면 일진과의 관계가 달라지기 때문에, 오늘의 운세는 생년월일에 따라 사람마다 다르게 나옵니다. {SITE_NAME}의 오늘의 운세는 총운을 중심으로 애정운, 재물운, 직장운 같은 생활 영역별 흐름과 그날 참고할 수 있는 조언을 함께 안내합니다.
            </p>
          </div>
        </section>

        <section className="rounded-[2.5rem] p-8 md:p-10 space-y-5" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(212,104,138,0.12)' }}>
          <h2 className="text-2xl font-bold tracking-tight break-keep" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>오늘의 운세, 이렇게 활용하세요</h2>
          <div className="space-y-4 leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>
            <p>
              운세는 하루를 단정하는 예언이 아니라, 하루를 시작하기 전에 마음가짐을 점검하는 짧은 리추얼로 쓸 때 가장 유용합니다. 예를 들어 &ldquo;오늘은 감정이 앞서기 쉬운 날&rdquo;이라는 안내를 봤다면, 중요한 대화나 결정을 오후로 미루는 식의 작은 조정이 가능합니다.
            </p>
            <p>
              반대로 좋은 흐름이 안내된 날이라고 해서 무리한 결정을 해도 된다는 뜻은 아닙니다. 운세의 역할은 확신을 주는 것이 아니라, 놓치기 쉬운 관점을 하나 더 얹어주는 것입니다. 하루의 컨디션, 관계, 일정 관리에 참고하는 보조 도구로 가볍게 활용하시길 권합니다.
            </p>
          </div>
        </section>

        <section className="rounded-[2.5rem] p-8 md:p-10 space-y-6" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(212,104,138,0.12)' }}>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>자주 묻는 질문</h2>
          <div className="space-y-5">
            {unseFaq.map((item) => (
              <div key={item.question} className="space-y-2">
                <h3 className="font-bold break-keep" style={{ color: '#2D1B1E' }}>{item.question}</h3>
                <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2.5rem] p-8 md:p-10 space-y-6" style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(124,111,214,0.12), rgba(255,255,255,0.85) 60%)', border: '1px solid rgba(124,111,214,0.16)' }}>
          <div className="space-y-2">
            <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: 'rgba(124,111,214,0.7)' }}>Related</p>
            <h2 className="text-2xl font-bold" style={{ color: '#2D1B1E' }}>함께 읽으면 좋은 가이드</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedGuides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="rounded-[1.75rem] p-5 space-y-2 transition-colors hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(124,111,214,0.12)' }}
              >
                <h3 className="font-bold break-keep" style={{ color: '#2D1B1E' }}>{guide.title}</h3>
                <p className="text-sm leading-relaxed break-keep" style={{ color: 'rgba(45,27,30,0.5)' }}>{guide.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
