'use client'
// src/components/tarot/TarotDictionaryClient.tsx
import { useState, useMemo, useEffect } from 'react'
import { TAROT_CARDS, ARCANA_LABELS, TarotCard, Arcana } from '@/data/tarotCards'
import { AnimatePresence, motion } from 'framer-motion'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

// 아르카나별 색상 (퍼플 베이스 + 아르카나 고유색)
const ARCANA_STYLE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  major:     { bg: 'var(--tarot-50)',  color: 'var(--tarot-800)', border: 'var(--tarot-200)', label: '대아르카나' },
  wands:     { bg: '#FFF4E6',          color: '#92400E',          border: '#FCD34D',          label: '완드' },
  cups:      { bg: '#EFF6FF',          color: '#1E40AF',          border: '#BFDBFE',          label: '컵' },
  swords:    { bg: '#F1F5F9',          color: '#334155',          border: '#CBD5E1',          label: '소드' },
  pentacles: { bg: '#F0FDF4',          color: '#166534',          border: '#BBF7D0',          label: '펜타클' },
}

export default function TarotDictionaryClient() {
  const [filter, setFilter] = useState<'all' | Arcana>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<TarotCard | null>(null)
  const [cardImages, setCardImages] = useState<Record<number, string>>({})

  useEffect(() => {
    if (!db) return
    getDocs(collection(db, 'tarotCards')).then((snap) => {
      const map: Record<number, string> = {}
      snap.forEach((doc) => {
        const d = doc.data()
        if (d.imageUrl) map[d.id] = d.imageUrl
      })
      setCardImages(map)
    }).catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    return TAROT_CARDS.filter((c) => {
      const matchArcana = filter === 'all' || c.arcana === filter
      const q = search.toLowerCase()
      const matchSearch = !q || c.name.includes(q) || c.eng.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.includes(q))
      return matchArcana && matchSearch
    })
  }, [filter, search])

  return (
    <main className="min-h-screen tarot-bg pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-8">

        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="text-xs tracking-widest mb-2" style={{ color: 'var(--tarot-500)' }}>✦ CARD LIBRARY ✦</div>
          <h1 className="text-2xl font-bold text-gray-800">타로 카드 사전</h1>
          <p className="text-sm text-gray-400 mt-1">78장의 의미를 찾아보세요</p>
        </div>

        {/* 검색 */}
        <div className="relative mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="카드 이름, 키워드로 검색..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-gray-700 placeholder:text-gray-300 outline-none transition-all"
            style={{ border: '1px solid var(--tarot-100)', background: 'white' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--tarot-300, var(--tarot-400))' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--tarot-100)' }}
          />
          <span className="absolute left-3.5 top-3.5 text-gray-300 text-sm">🔍</span>
        </div>

        {/* 필터 */}
        <div className="flex gap-2 flex-wrap mb-6">
          {(Object.keys(ARCANA_LABELS) as Array<'all' | Arcana>).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={filter === key
                ? { background: 'var(--tarot-500)', color: 'white', border: '1px solid var(--tarot-500)' }
                : { background: 'white', color: '#6b7280', border: '1px solid #e5e7eb' }
              }
            >
              {ARCANA_LABELS[key]}
            </button>
          ))}
        </div>

        {/* 카운트 */}
        <div className="text-xs text-gray-400 mb-4">{filtered.length}장</div>

        {/* 그리드 */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {filtered.map((card) => {
            const s = ARCANA_STYLE[card.arcana]
            return (
              <motion.button
                key={card.id}
                layout
                onClick={() => setSelected(card)}
                className="glass-card rounded-2xl p-3 text-center hover:scale-105 transition-transform"
                style={{ borderColor: 'rgba(127,119,221,0.15)' }}
              >
                <div className="mb-1.5 w-full aspect-[2/3] rounded-xl overflow-hidden flex items-center justify-center" style={{ background: 'var(--tarot-50)' }}>
                  {cardImages[card.id]
                    ? <img src={cardImages[card.id]} alt={card.name} className="w-full h-full object-contain" />
                    : <span className="text-3xl">{card.emoji}</span>
                  }
                </div>
                <div className="text-[10px] text-gray-400 mb-0.5">{card.num}</div>
                <div className="text-xs font-medium text-gray-800 leading-tight mb-2">{card.name}</div>
                <span className="text-[9px] px-2 py-0.5 rounded-full border"
                  style={{ background: s.bg, color: s.color, borderColor: s.border }}>
                  {s.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* 카드 상세 모달 */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(38,33,92,0.5)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="w-full max-w-md bg-white rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 카드 헤더 */}
              <div className="flex gap-4 mb-5">
                <div className="w-20 h-32 rounded-2xl overflow-hidden flex items-center justify-center text-4xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--tarot-50), #f3f2ff)', border: '1px solid var(--tarot-100)' }}>
                  {cardImages[selected.id]
                    ? <img src={cardImages[selected.id]} alt={selected.name} className="w-full h-full object-contain" />
                    : selected.emoji
                  }
                </div>
                <div className="flex-1">
                  <div className="text-[10px] tracking-widest mb-1" style={{ color: 'var(--tarot-400)' }}>{selected.num}</div>
                  <div className="text-lg font-bold text-gray-800 mb-0.5">{selected.name}</div>
                  <div className="text-xs text-gray-400 mb-3">{selected.eng}</div>
                  <div className="flex flex-wrap gap-1">
                    {selected.keywords.map((k) => (
                      <span key={k} className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--tarot-50)', color: 'var(--tarot-600)' }}>
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-5">{selected.desc}</p>

              {/* 정방향 / 역방향 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl" style={{ background: 'var(--tarot-50)' }}>
                  <div className="text-[10px] font-semibold mb-1.5" style={{ color: 'var(--tarot-600)' }}>⬆ 정방향</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{selected.upright}</p>
                </div>
                <div className="p-3 rounded-2xl" style={{ background: '#faf9ff', border: '1px solid var(--tarot-100)' }}>
                  <div className="text-[10px] font-semibold mb-1.5" style={{ color: 'var(--tarot-400)' }}>⬇ 역방향</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{selected.reversed}</p>
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="w-full mt-5 py-3 rounded-2xl text-sm transition-opacity hover:opacity-70"
                style={{ border: '1px solid var(--tarot-200)', color: 'var(--tarot-500)' }}
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
