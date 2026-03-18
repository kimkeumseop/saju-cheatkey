// src/app/tarot/reading/page.tsx
import { Metadata } from 'next'
import TarotReadingClient from '@/components/tarot/TarotReadingClient'

export const metadata: Metadata = {
  title: '타로 리딩 | 사주 치트키',
  description: '카드를 뽑고 AI 해석을 받아보세요.',
}

export default function TarotReadingPage() {
  return <TarotReadingClient />
}
