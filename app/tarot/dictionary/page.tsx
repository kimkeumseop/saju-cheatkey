// src/app/tarot/dictionary/page.tsx
import { Metadata } from 'next'
import TarotDictionaryClient from '@/components/tarot/TarotDictionaryClient'

export const metadata: Metadata = {
  title: '타로 카드 사전 78장 정·역방향 해석 | 사주 치트키',
  description: '대아르카나 22장, 소아르카나(완드·컵·소드·펜타클) 56장 전체 타로 카드 사전. 각 카드의 정방향·역방향 의미와 연애·직업·금전 해석을 무료로 확인하세요.',
  keywords: ['타로 카드 사전', '타로 카드 의미', '대아르카나', '소아르카나', '타로 78장', '타로 역방향', '타로 정방향'],
  alternates: { canonical: 'https://saju-cheatkey.kr/tarot/dictionary' },
  openGraph: {
    title: '타로 카드 사전 78장 | 사주 치트키',
    description: '대아르카나 22장, 소아르카나 56장 전체 타로 카드 정·역방향 해석.',
    url: 'https://saju-cheatkey.kr/tarot/dictionary',
    siteName: '사주 치트키',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: 'https://saju-cheatkey.kr/og-default.svg', width: 1200, height: 630, alt: '타로 카드 사전' }],
  },
  twitter: { card: 'summary_large_image', title: '타로 카드 사전 78장 | 사주 치트키', images: ['https://saju-cheatkey.kr/og-default.svg'] },
}

export default function TarotDictionaryPage() {
  return <TarotDictionaryClient />
}
