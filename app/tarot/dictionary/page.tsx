// src/app/tarot/dictionary/page.tsx
import { Metadata } from 'next'
import TarotDictionaryClient from '@/components/tarot/TarotDictionaryClient'

export const metadata: Metadata = {
  title: '타로 카드 사전 78장 | 사주 치트키',
  description: '대아르카나 22장, 완드·컵·소드·펜타클 56장의 정·역방향 해석을 확인해보세요.',
}

export default function TarotDictionaryPage() {
  return <TarotDictionaryClient />
}
