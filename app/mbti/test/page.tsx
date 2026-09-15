import type { Metadata } from 'next';
import Link from 'next/link';
import { createMetadata, SITE_URL } from '@/lib/site';
import MbtiTestClient from './MbtiTestClient';

export const metadata: Metadata = {
  ...createMetadata({
  title: '무료 MBTI 검사 20문항 | 사주 치트키',
  description:
    '20문항으로 3~4분 만에 끝나는 무료 MBTI 성격유형 검사. 네 가지 지표가 무엇을 측정하는지, 결과를 어떻게 읽어야 하는지까지 함께 안내합니다.',
  path: '/mbti/test',
  keywords: ['MBTI 검사', '무료 MBTI 테스트', 'MBTI 20문항', '성격유형 검사', 'MBTI 결과 해석'],
  }),
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

const DIMENSIONS = [
  {
    code: 'E / I',
    title: '에너지의 방향',
    body:
      '외향(E)과 내향(I)은 사교성의 크기가 아니라 에너지를 회복하는 방식의 차이입니다. 사람들과 있을 때 충전되는 쪽이 E, 혼자 있는 시간에 충전되는 쪽이 I입니다. 그래서 말수가 많은 I도, 조용한 E도 흔합니다.',
  },
  {
    code: 'S / N',
    title: '정보를 받아들이는 방식',
    body:
      '감각(S)은 지금 확인 가능한 사실과 경험에서 출발하고, 직관(N)은 그 너머의 가능성과 패턴에서 출발합니다. 같은 상황을 설명할 때 S는 구체적인 사실을 나열하고 N은 의미와 연결을 먼저 말하는 경향이 있습니다.',
  },
  {
    code: 'T / F',
    title: '판단의 기준',
    body:
      '사고(T)는 일관된 원칙과 논리를, 감정(F)은 사람과 상황의 조화를 우선합니다. T가 냉정하고 F가 감정적이라는 뜻이 아니라, 결정을 내릴 때 먼저 확인하는 항목이 다르다는 의미입니다.',
  },
  {
    code: 'J / P',
    title: '생활을 다루는 방식',
    body:
      '판단(J)은 미리 정해두고 진행하는 것을 편하게 느끼고, 인식(P)은 상황을 열어두고 조정하는 것을 편하게 느낍니다. 계획성의 유무가 아니라 언제 결정을 확정하느냐의 차이입니다.',
  },
];

const FAQ = [
  {
    question: '검사 결과가 예전과 다르게 나왔는데 왜 그런가요?',
    answer:
      'MBTI는 응답 시점의 자기 인식을 반영합니다. 환경이나 역할이 바뀌면 응답이 달라지고 지표도 함께 바뀔 수 있습니다. 특히 각 지표의 점수가 중간에 가까웠다면 작은 차이로도 결과가 뒤집힙니다.',
  },
  {
    question: '20문항으로 정확한 결과가 나오나요?',
    answer:
      '간이 검사이므로 정식 진단 도구를 대체하지 않습니다. 대략적인 성향의 방향을 확인하는 용도로 활용하시고, 결과에 어긋나는 부분이 있다면 그대로 두셔도 됩니다.',
  },
  {
    question: 'MBTI 결과를 채용이나 평가에 써도 되나요?',
    answer:
      '권하지 않습니다. MBTI는 신뢰도와 타당도에 대한 비판이 꾸준히 제기되어 온 분류 도구입니다. 자기 이해와 대화를 위한 언어로 쓰는 것이 적절한 사용 범위입니다.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${SITE_URL}/mbti/test#faq`,
  mainEntity: FAQ.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

export default function MbtiTestPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MbtiTestClient />

      <section className="relative px-6 pb-24" style={{ background: '#FBF7F2' }}>
        <div className="mx-auto max-w-3xl space-y-8">
          <header className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight break-keep" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>
              이 검사는 무엇을 측정하나요
            </h2>
            <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>
              MBTI는 성격을 네 가지 축으로 나누어 살펴보는 분류 체계입니다. 각 축은 좋고 나쁨을 가르는 것이 아니라, 같은 상황에서 무엇을 먼저 보고 어떻게 반응하는지의 차이를 설명합니다. 이 검사는 20문항으로 네 축의 방향을 확인하는 간이 버전입니다.
            </p>
          </header>

          <div className="grid gap-5 md:grid-cols-2">
            {DIMENSIONS.map((item) => (
              <div key={item.code} className="rounded-[1.75rem] p-6 space-y-2" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(14,159,115,0.14)' }}>
                <p className="text-xs font-black tracking-[0.28em]" style={{ color: '#0e9f73' }}>{item.code}</p>
                <h3 className="font-bold break-keep" style={{ color: '#2D1B1E' }}>{item.title}</h3>
                <p className="text-sm leading-7 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>{item.body}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[2.5rem] p-8 md:p-10 space-y-4" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(14,159,115,0.14)' }}>
            <h3 className="text-xl font-bold" style={{ color: '#2D1B1E' }}>결과를 읽을 때 기억하면 좋은 것</h3>
            <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>
              결과로 나온 네 글자는 정체성이 아니라 지금의 경향을 요약한 표현입니다. 각 지표의 점수가 중간에 가까울수록 두 방향의 특성이 함께 나타나므로, 유형 이름보다 개별 지표의 기울기를 보시는 편이 정확합니다.
            </p>
            <p className="leading-8 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>
              또한 &ldquo;나는 I라서 못 한다&rdquo;처럼 유형을 한계의 근거로 삼는 사용은 피하시는 것이 좋습니다. 유형은 지금 편한 방식을 알려줄 뿐, 할 수 있는 일의 범위를 정하지 않습니다.
            </p>
          </div>

          <div className="rounded-[2.5rem] p-8 md:p-10 space-y-5" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(14,159,115,0.14)' }}>
            <h3 className="text-xl font-bold" style={{ color: '#2D1B1E' }}>자주 묻는 질문</h3>
            <div className="space-y-4">
              {FAQ.map((item) => (
                <div key={item.question} className="rounded-[1.75rem] p-6 space-y-2" style={{ background: 'rgba(251,247,242,0.85)', border: '1px solid rgba(14,159,115,0.12)' }}>
                  <h4 className="font-bold break-keep" style={{ color: '#2D1B1E' }}>Q. {item.question}</h4>
                  <p className="leading-7 break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>{item.answer}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-1 text-sm font-bold">
              <Link href="/mbti" className="rounded-full px-4 py-2" style={{ background: 'rgba(14,159,115,0.1)', border: '1px solid rgba(14,159,115,0.2)', color: '#0e9f73' }}>
                16가지 유형 살펴보기
              </Link>
              <Link href="/guide/saju-vs-mbti" className="rounded-full px-4 py-2" style={{ background: 'rgba(212,104,138,0.1)', border: '1px solid rgba(212,104,138,0.2)', color: '#d4688a' }}>
                사주와 MBTI 차이
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
