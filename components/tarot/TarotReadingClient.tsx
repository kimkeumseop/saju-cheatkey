'use client'
// src/components/tarot/TarotReadingClient.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TAROT_CARDS, SPREAD_LABELS, TarotCard } from '@/data/tarotCards'
import TarotResultView from './TarotResultView'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

interface DrawnCard extends TarotCard { isReversed: boolean; position: string }

const SPREADS = [
  { value: 1, label: '원카드', desc: '지금 가장 필요한 메시지' },
  { value: 3, label: '쓰리카드', desc: '과거 · 현재 · 미래 흐름' },
  { value: 5, label: '오각형', desc: '상황을 다각도로 심층 분석' },
]

type Step = 'spread' | 'question' | 'shuffle' | 'drawn' | 'result'

// 퍼플 테마 공통 스타일 헬퍼
const T = {
  badge: { background: 'var(--tarot-50)', color: 'var(--tarot-600)' } as React.CSSProperties,
  btnPrimary: {
    background: 'linear-gradient(135deg, var(--tarot-500), var(--tarot-800))',
    boxShadow: '0 4px 16px rgba(127,119,221,0.25)',
  } as React.CSSProperties,
  btnOutline: {
    border: '1px solid var(--tarot-200)',
    color: 'var(--tarot-600)',
  } as React.CSSProperties,
  cardSelected: {
    border: '2px solid var(--tarot-400)',
    background: 'var(--tarot-50)',
  } as React.CSSProperties,
  cardDefault: {
    border: '1px solid #e5e7eb',
    background: 'white',
  } as React.CSSProperties,
  chip: { background: 'var(--tarot-50)', border: '0.5px solid var(--tarot-200)', color: 'var(--tarot-700, var(--tarot-600))' } as React.CSSProperties,
  dot: (active: boolean, passed: boolean) => ({
    background: active ? 'var(--tarot-500)' : passed ? 'var(--tarot-300, var(--tarot-200))' : '#e5e7eb',
    transform: active ? 'scale(1.25)' : 'scale(1)',
  }) as React.CSSProperties,
}

export default function TarotReadingClient() {
  const [step, setStep] = useState<Step>('spread')
  const [spreadType, setSpreadType] = useState<1 | 3 | 5>(1)
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
  const [question, setQuestion] = useState('')
  const [shuffling, setShuffling] = useState(false)
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([])
  const [flipped, setFlipped] = useState<boolean[]>([])
  const [aiResult, setAiResult] = useState('')
  const [loading, setLoading] = useState(false)

  const STEPS: Step[] = ['spread', 'question', 'shuffle', 'drawn', 'result']

  function handleShuffle() {
    setShuffling(true)
    setTimeout(() => { setShuffling(false); drawCards(); setStep('drawn') }, 900)
  }

  function drawCards() {
    const pool = [...TAROT_CARDS]
    const labels = SPREAD_LABELS[spreadType]
    const picked: DrawnCard[] = []
    for (let i = 0; i < spreadType; i++) {
      const idx = Math.floor(Math.random() * pool.length)
      const card = pool.splice(idx, 1)[0]
      picked.push({ ...card, imageUrl: cardImages[card.id], isReversed: Math.random() < 0.3, position: labels[i] })
    }
    setDrawnCards(picked)
    setFlipped(Array(spreadType).fill(false))
  }

  function flipCard(i: number) {
    setFlipped((prev) => { const next = [...prev]; next[i] = !next[i]; return next })
  }

  function flipAll() {
    setFlipped(Array(spreadType).fill(true))
    setTimeout(() => getAiReading(), 400)
  }

  async function getAiReading() {
    setLoading(true)
    setStep('result')
    try {
      const res = await fetch('/api/tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: drawnCards, spreadType, question }),
      })
      const data = await res.json()
      setAiResult(data.result ?? data.error ?? '해석을 가져오지 못했어요.')
    } catch {
      setAiResult('네트워크 오류가 발생했어요. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep('spread'); setQuestion(''); setDrawnCards([]); setFlipped([]); setAiResult('')
  }

  return (
    <main className="min-h-screen tarot-bg pb-20">
      <div className="max-w-lg mx-auto px-4 pt-8">

        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="text-xs tracking-widest mb-2" style={{ color: 'var(--tarot-500)' }}>✦ TAROT READING ✦</div>
          <h1 className="text-2xl font-bold text-gray-800">타로 리딩</h1>
          <p className="text-sm text-gray-400 mt-1">마음속 질문을 품고 카드를 선택해요</p>
        </div>

        {/* 진행 바 */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={T.dot(step === s, STEPS.indexOf(step) > i)}
              />
              {i < 4 && <div className="w-6 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* STEP 1: 스프레드 */}
          {step === 'spread' && (
            <motion.div key="spread" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <h2 className="text-sm font-semibold text-gray-600 mb-4 text-center">스프레드를 선택해요</h2>
              <div className="space-y-3">
                {SPREADS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSpreadType(s.value as 1 | 3 | 5)}
                    className="w-full p-4 rounded-2xl text-left transition-all"
                    style={spreadType === s.value ? T.cardSelected : T.cardDefault}
                  >
                    <div className="font-semibold text-gray-800 text-sm">{s.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep('question')}
                className="w-full mt-6 py-3.5 rounded-2xl text-white font-medium text-sm"
                style={T.btnPrimary}
              >
                다음 →
              </button>
            </motion.div>
          )}

          {/* STEP 2: 질문 */}
          {step === 'question' && (
            <motion.div key="question" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <h2 className="text-sm font-semibold text-gray-600 mb-2 text-center">마음속 질문을 적어요</h2>
              <p className="text-xs text-gray-400 text-center mb-5">질문이 없으면 넘어가도 괜찮아요 ✨</p>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="예) 이 연애, 계속 이어나가야 할까요?"
                className="w-full h-28 p-4 rounded-2xl text-sm text-gray-700 placeholder:text-gray-300 resize-none outline-none transition-all"
                style={{ border: '1px solid var(--tarot-100)', background: 'white' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--tarot-300, var(--tarot-400))' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--tarot-100)' }}
              />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep('spread')} className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-400 text-sm">
                  ← 뒤로
                </button>
                <button onClick={() => setStep('shuffle')} className="flex-[2] py-3.5 rounded-2xl text-white font-medium text-sm" style={T.btnPrimary}>
                  덱 셔플하기 →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: 셔플 */}
          {step === 'shuffle' && (
            <motion.div key="shuffle" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="text-center">
              <h2 className="text-sm font-semibold text-gray-600 mb-2">마음을 집중하고</h2>
              <p className="text-xs text-gray-400 mb-8">덱을 탭하여 셔플해요</p>
              <div className="relative w-32 h-52 mx-auto mb-8 cursor-pointer" onClick={!shuffling ? handleShuffle : undefined}>
                {[2, 1, 0].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, var(--tarot-400), var(--tarot-800))',
                      transform: `rotate(${(i - 1) * 4}deg) translateY(${i * 3}px)`,
                      boxShadow: '0 4px 20px rgba(127,119,221,0.25)',
                    }}
                    animate={shuffling && i === 0 ? {
                      rotate: [-8, 8, -5, 5, 0],
                      transition: { duration: 0.8 }
                    } : {}}
                  >
                    {i === 0 && (
                      <div className="text-center" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        {shuffling
                          ? <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto"
                              style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                          : <><div className="text-3xl">✦</div><div className="text-[10px] tracking-widest mt-1">SHUFFLE</div></>
                        }
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              <p className="text-xs text-gray-400">{shuffling ? '셔플 중...' : '덱을 탭하면 카드가 섞여요'}</p>
            </motion.div>
          )}

          {/* STEP 4: 카드 뽑기 */}
          {step === 'drawn' && (
            <motion.div key="drawn" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <h2 className="text-sm font-semibold text-gray-600 mb-1 text-center">카드를 탭하여 펼쳐요</h2>
              <p className="text-xs text-gray-400 text-center mb-6">
                {flipped.every(Boolean) ? '모두 펼쳤어요! AI 해석을 받아볼까요?' : `${flipped.filter(Boolean).length}/${spreadType}장 펼침`}
              </p>
              <div className={`flex gap-3 justify-center mb-8 ${spreadType === 5 ? 'flex-wrap' : ''}`}>
                {drawnCards.map((card, i) => {
                  const w = spreadType === 5 ? 90 : 100
                  const h = spreadType === 5 ? 145 : 162
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div style={{ perspective: 800, width: w }} onClick={() => flipCard(i)} className="cursor-pointer">
                        <motion.div
                          style={{ transformStyle: 'preserve-3d', position: 'relative', width: w, height: h }}
                          animate={{ rotateY: flipped[i] ? 180 : 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          {/* 뒷면 */}
                          <div className="absolute inset-0 rounded-2xl flex items-center justify-center"
                            style={{
                              backfaceVisibility: 'hidden',
                              background: 'linear-gradient(135deg, var(--tarot-400), var(--tarot-800))',
                              boxShadow: '0 4px 16px rgba(127,119,221,0.2)',
                            }}>
                            <div className="w-3/4 h-3/4 rounded-xl flex items-center justify-center text-xl"
                              style={{ border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.6)' }}>✦</div>
                          </div>
                          {/* 앞면 */}
                          <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-1 p-2"
                            style={{
                              backfaceVisibility: 'hidden',
                              transform: `rotateY(180deg)${card.isReversed ? ' rotate(180deg)' : ''}`,
                              background: 'linear-gradient(135deg, var(--tarot-50), #f8f7ff)',
                              border: '1px solid var(--tarot-100)',
                            }}>
                            {card.imageUrl
                              ? <img src={card.imageUrl} alt={card.name} className="w-full h-full object-contain rounded-xl" style={{ maxHeight: h - 24 }} />
                              : <div className="text-3xl">{card.emoji}</div>
                            }
                            <div className="text-[10px] font-medium text-center leading-tight" style={{ color: 'var(--tarot-800)' }}>{card.name}</div>
                            {card.isReversed && <div className="text-[9px]" style={{ color: 'var(--tarot-400)' }}>역방향</div>}
                          </div>
                        </motion.div>
                      </div>
                      <div className="text-[10px] text-gray-400 text-center">{card.position}</div>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-3">
                {!flipped.every(Boolean) && (
                  <button onClick={flipAll} className="flex-1 py-3 rounded-2xl text-sm transition-opacity hover:opacity-70"
                    style={T.btnOutline}>
                    전체 펼치기
                  </button>
                )}
                <button onClick={getAiReading} disabled={!flipped.some(Boolean)}
                  className="flex-[2] py-3 rounded-2xl text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  style={T.btnPrimary}>
                  🔮 해석 받기
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: 결과 */}
          {step === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <TarotResultView
                cards={drawnCards}
                aiResult={aiResult}
                loading={loading}
                question={question}
                onReset={reset}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  )
}
