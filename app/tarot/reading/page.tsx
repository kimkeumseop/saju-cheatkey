// src/app/tarot/reading/page.tsx
import { Metadata } from 'next'
import TarotReadingClient from '@/components/tarot/TarotReadingClient'

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
    images: [{ url: 'https://saju-cheatkey.kr/og-default.svg', width: 1200, height: 630, alt: '타로 카드 뽑기' }],
  },
  twitter: { card: 'summary_large_image', title: '타로 카드 뽑기 AI 해석 | 사주 치트키', images: ['https://saju-cheatkey.kr/og-default.svg'] },
}

export default function TarotReadingPage() {
  return <TarotReadingClient />
}
