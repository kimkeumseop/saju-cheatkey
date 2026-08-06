// src/app/tarot/reading/page.tsx
import { Metadata } from 'next'
import TarotReadingClient from '@/components/tarot/TarotReadingClient'
import TarotReadingGuide from '@/components/tarot/TarotReadingGuide'

export const metadata: Metadata = {
  title: '타로 카드 뽑기 AI 해석 | 사주 치트키',
  description: '질문을 마음속에 담고 카드를 뽑아보세요. AI 타로 리더 성월이 원카드, 쓰리카드, 오각형 스프레드로 정·역방향 해석을 제공합니다.',
  keywords: ['타로 카드 뽑기', '타로 리딩', 'AI 타로 해석', '원카드 타로', '쓰리카드 타로', '연애 타로'],
  alternates: { canonical: 'https://saju-cheatkey.kr/tarot/reading' },
  openGraph: {
    title: '타로 카드 뽑기 AI 해석 | 사주 치트키',
    description: 'AI 타로 리더 성월이 카드를 해석해드려요.',
    url: 'https://saju-cheatkey.kr/tarot/reading',
    siteName: '사주 치트키',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: 'https://saju-cheatkey.kr/og', width: 1200, height: 630, alt: '타로 카드 뽑기' }],
  },
  twitter: { card: 'summary_large_image', title: '타로 카드 뽑기 AI 해석 | 사주 치트키', images: ['https://saju-cheatkey.kr/og'] },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '타로에서 같은 질문을 여러 번 뽑아도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '짧은 간격의 반복은 권하지 않습니다. 원하는 답이 나올 때까지 묻는 형태가 되기 쉽습니다. 상황이 실제로 달라진 뒤에 다시 보시는 것이 좋습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '타로 역방향이 나오면 나쁜 뜻인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '역방향은 정방향의 반대가 아니라 같은 에너지가 막히거나 과해진 상태로 읽습니다. 좋고 나쁨보다 상태의 차이로 보시면 해석이 정확해집니다.',
      },
    },
    {
      '@type': 'Question',
      name: '타로로 미래를 알 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '사건을 특정하는 용도로는 적합하지 않습니다. 지금 상황에서 보지 못한 각도를 비추고 판단의 재료를 늘리는 도구로 쓰실 때 가장 쓸모가 큽니다.',
      },
    },
  ],
}

export default function TarotReadingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <TarotReadingClient />
      <TarotReadingGuide />
    </>
  )
}
