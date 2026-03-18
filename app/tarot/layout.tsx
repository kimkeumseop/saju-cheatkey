// src/app/tarot/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '타로 카드 | 사주 치트키',
  description: 'AI 타로 리더 성월이 78장 카드로 당신의 이야기를 읽어드려요.',
}

export default function TarotLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tarot-theme">
      {children}
    </div>
  )
}
