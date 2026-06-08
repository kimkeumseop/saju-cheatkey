'use client'
// src/components/tarot/TarotDictionaryClient.tsx
import { useState, useMemo } from 'react'
import { TAROT_CARDS, ARCANA_LABELS, TarotCard, Arcana } from '@/data/tarotCards'
import { getTarotImageUrl } from '@/data/tarotImages'
import { AnimatePresence, motion } from 'framer-motion'
import CosmicBackground from '@/components/CosmicBackground'
import TarotCardImage from './TarotCardImage'

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
    <main className="relative min-h-screen overflow-x-hidden pb-20" style={{ background: '#0d0710' }}>
      <CosmicBackground />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-8">

        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="text-xs font-black tracking-widest mb-2" style={{ color: '#9d8fff' }}>✦ CARD LIBRARY ✦</div>
          <h1 className="text-2xl font-bold" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>타로 카드 사전</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(240,232,238,0.42)' }}>78장의 의미를 찾아보세요</p>
        </div>

        {/* 검색 */}
        <div className="relative mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="카드 이름, 키워드로 검색..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm outline-none transition-all text-[#f5eef2] placeholder:text-white/30"
            style={{ border: '1px solid rgba(157,143,255,0.2)', background: 'rgba(255,255,255,0.04)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(157,143,255,0.5)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(157,143,255,0.2)' }}
          />
          <span className="absolute left-3.5 top-3.5 text-white/30 text-sm">🔍</span>
        </div>

        {/* 필터 */}
        <div className="flex gap-2 flex-wrap mb-6">
          {(Object.keys(ARCANA_LABELS) as Array<'all' | Arcana>).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={filter === key
                ? { background: '#9d8fff', color: 'white', border: '1px solid #9d8fff' }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(240,232,238,0.5)', border: '1px solid rgba(255,255,255,0.12)' }
              }
            >
              {ARCANA_LABELS[key]}
            </button>
          ))}
        </div>

        {/* 카운트 */}
        <div className="text-xs mb-4" style={{ color: 'rgba(240,232,238,0.42)' }}>{filtered.length}장</div>

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
                  <TarotCardImage imageUrl={getTarotImageUrl(card.id)} name={card.name} emoji={card.emoji} fallbackClassName="text-3xl" />
                </div>
                <div className="text-[10px] mb-0.5" style={{ color: 'rgba(240,232,238,0.4)' }}>{card.num}</div>
                <div className="text-xs font-bold leading-tight mb-2" style={{ color: '#f5eef2' }}>{card.name}</div>
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
              className="w-full max-w-md rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
              style={{
                background: 'linear-gradient(180deg, rgba(26,14,24,0.97), rgba(13,7,16,0.98))',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(157,143,255,0.18)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 8px 40px rgba(157,143,255,0.1)',
              }}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 카드 헤더 */}
              <div className="flex gap-4 mb-5">
                <div className="w-20 h-32 rounded-2xl overflow-hidden flex items-center justify-center text-4xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--tarot-50), #f3f2ff)', border: '1px solid var(--tarot-100)' }}>
                  <TarotCardImage imageUrl={getTarotImageUrl(selected.id)} name={selected.name} emoji={selected.emoji} fallbackClassName="text-4xl" showName />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] tracking-widest mb-1" style={{ color: '#9d8fff' }}>{selected.num}</div>
                  <div className="text-lg font-bold mb-0.5" style={{ color: '#f5eef2' }}>{selected.name}</div>
                  <div className="text-xs mb-3" style={{ color: 'rgba(240,232,238,0.4)' }}>{selected.eng}</div>
                  <div className="flex flex-wrap gap-1">
                    {selected.keywords.map((k) => (
                      <span key={k} className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(157,143,255,0.15)', color: '#9d8fff', border: '1px solid rgba(157,143,255,0.2)' }}>
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(240,232,238,0.62)' }}>{selected.desc}</p>

              {/* 정방향 / 역방향 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl" style={{ background: 'rgba(157,143,255,0.1)', border: '1px solid rgba(157,143,255,0.18)' }}>
                  <div className="text-[10px] font-bold mb-1.5" style={{ color: '#9d8fff' }}>⬆ 정방향</div>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,232,238,0.62)' }}>{selected.upright}</p>
                </div>
                <div className="p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="text-[10px] font-bold mb-1.5" style={{ color: 'rgba(157,143,255,0.7)' }}>⬇ 역방향</div>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,232,238,0.62)' }}>{selected.reversed}</p>
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="w-full mt-5 py-3 rounded-2xl text-sm transition-opacity hover:opacity-70"
                style={{ border: '1px solid rgba(157,143,255,0.25)', color: 'rgba(157,143,255,0.8)' }}
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
