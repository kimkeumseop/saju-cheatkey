'use client'
import { useEffect, useState } from 'react'
import { TAROT_CARDS, TarotCard } from '@/data/tarotCards'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

type Period = 'morning' | 'afternoon' | 'evening'

const PERIOD_CONFIG = {
  morning:   { label: '오전의 타로', icon: '🌅', keywords: ['새로운 시작', '순수', '의지력', '기술', '집중', '현실화', '풍요', '창조', '권위', '구조', '안정', '열정', '영감', '계획', '모험', '자유'] },
  afternoon: { label: '오후의 타로', icon: '☀️', keywords: ['선택', '사랑', '조화', '승리', '힘', '인내', '행동', '결단', '관계', '변화', '균형', '협력', '성취', '리더십', '확장', '성공'] },
  evening:   { label: '저녁의 타로', icon: '🌙', keywords: ['직관', '신비', '내면', '지혜', '성찰', '휴식', '감정', '꿈', '통찰', '재생', '완성', '수용', '치유', '평화', '정화', '해방'] },
}

function getPeriod(): Period {
  const h = new Date().getHours()
  if (h >= 6 && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'afternoon'
  return 'evening'
}

function getStorageKey(period: Period): string {
  const d = new Date()
  return `tarot_today_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}_${period}`
}

function getCardPool(period: Period): TarotCard[] {
  const keywords = PERIOD_CONFIG[period].keywords
  const matched = TAROT_CARDS.filter(c => c.keywords.some(k => keywords.includes(k)))
  return matched.length >= 10 ? matched : TAROT_CARDS
}

export default function TodayTarotCard() {
  const [card, setCard] = useState<TarotCard | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>('morning')

  async function fetchImageUrl(id: number) {
    if (!db) return
    const snap = await getDoc(doc(db, 'tarotCards', String(id))).catch(() => null)
    if (snap?.exists()) setImageUrl(snap.data().imageUrl ?? null)
  }

  useEffect(() => {
    const current = getPeriod()
    setPeriod(current)
    const saved = localStorage.getItem(getStorageKey(current))
    if (saved) {
      const found = TAROT_CARDS.find((c) => c.id === parseInt(saved))
      if (found) { setCard(found); setRevealed(true); fetchImageUrl(found.id) }
    }

    // 시간대 바뀌면 자동 리셋
    const msUntilNextPeriod = () => {
      const now = new Date()
      const h = now.getHours()
      const next = h < 6 ? 6 : h < 12 ? 12 : h < 18 ? 18 : 30
      const target = new Date(now)
      if (next === 30) { target.setDate(target.getDate() + 1); target.setHours(6, 0, 0, 0) }
      else target.setHours(next, 0, 0, 0)
      return target.getTime() - now.getTime()
    }
    const timer = setTimeout(() => {
      setCard(null); setRevealed(false); setImageUrl(null); setPeriod(getPeriod())
    }, msUntilNextPeriod())
    return () => clearTimeout(timer)
  }, [])

  function drawCard() {
    setLoading(true)
    setTimeout(() => {
      const pool = getCardPool(period)
      const picked = pool[Math.floor(Math.random() * pool.length)]
      localStorage.setItem(getStorageKey(period), String(picked.id))
      setCard(picked)
      setRevealed(true)
      setLoading(false)
      fetchImageUrl(picked.id)
    }, 600)
  }

  function reset() {
    localStorage.removeItem(getStorageKey(period))
    setCard(null)
    setRevealed(false)
    setImageUrl(null)
  }

  const { label, icon } = PERIOD_CONFIG[period]

  return (
    <div className="glass-card rounded-3xl p-6 text-center" style={{ borderColor: 'rgba(127,119,221,0.2)' }}>
      <div className="text-xs font-medium tracking-widest mb-4" style={{ color: 'var(--tarot-600)' }}>
        {icon} {label}
      </div>

      <div className="relative mx-auto w-32 h-52 mb-5">
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="back"
              className="absolute inset-0 rounded-2xl flex items-center justify-center cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--tarot-400), var(--tarot-800))',
                boxShadow: '0 8px 24px rgba(127,119,221,0.3)',
              }}
              onClick={!loading ? drawCard : undefined}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              exit={{ rotateY: 90, transition: { duration: 0.2 } }}
            >
              {loading ? (
                <div className="w-8 h-8 border-2 rounded-full animate-spin"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
              ) : (
                <div className="text-center" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  <div className="text-3xl mb-1">✦</div>
                  <div className="text-xs tracking-widest">탭하기</div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="front"
              className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--tarot-50), #f8f7ff)',
                border: '1px solid var(--tarot-100)',
                boxShadow: '0 4px 16px rgba(127,119,221,0.12)',
              }}
              initial={{ rotateY: -90 }}
              animate={{ rotateY: 0, transition: { duration: 0.3 } }}
            >
              {imageUrl
                ? <img src={imageUrl} alt={card?.name} className="w-full h-full object-contain rounded-2xl" />
                : <div className="text-5xl">{card?.emoji}</div>
              }
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {revealed && card && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-sm font-semibold mb-3" style={{ color: 'var(--tarot-700)' }}>{card.name}</div>
            <div className="flex flex-wrap gap-1 justify-center mb-3">
              {card.keywords.map((k) => (
                <span key={k} className="px-2 py-0.5 rounded-full text-[11px]"
                  style={{ background: 'var(--tarot-50)', color: 'var(--tarot-600)' }}>
                  {k}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed text-center mb-4">{card.desc}</p>
            <button onClick={reset} className="w-full py-2 rounded-full text-xs transition-opacity hover:opacity-70"
              style={{ border: '1px solid var(--tarot-200)', color: 'var(--tarot-500)' }}>
              ↺ 다시 뽑기
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!revealed && !loading && (
        <p className="text-xs text-gray-400 mt-1">카드를 탭하면 {label.replace('의 타로', '')} 메시지가 열려요</p>
      )}
    </div>
  )
}
