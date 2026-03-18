// src/types/tarot.ts
export interface TarotReadingResult {
  id?: string
  type: 'tarot'
  userId: string
  spreadType: 1 | 3 | 5
  question: string
  cards: DrawnCard[]
  aiResult: string
  createdAt: Date | null
}

export interface DrawnCard {
  cardId: number
  name: string
  eng: string
  emoji: string
  reversed: boolean
  position: string
}
