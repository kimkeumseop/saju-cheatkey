'use client'
// src/components/tarot/TarotResultView.tsx
import { TarotCard } from '@/data/tarotCards'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useRouter } from 'next/navigation'
import ShareButtons from '@/components/ShareButtons'

interface DrawnCard extends TarotCard { isReversed: boolean; position: string }

interface Props {
  cards: DrawnCard[]
  aiResult: string
  loading: boolean
  question: string
  onReset: () => void
}

export default function TarotResultView({ cards, aiResult, loading, question, onReset }: Props) {
  const router = useRouter()
  return (
    <div className="space-y-5">

      {/* 리더 프로필 */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-3"
        style={{ borderColor: 'rgba(127,119,221,0.18)' }}>
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--tarot-400), var(--tarot-800))' }}>
          🔮
        </div>
        <div>
          <div className="text-sm font-bold" style={{ color: '#f5eef2' }}>성월 선생님</div>
          <div className="text-xs" style={{ color: 'rgba(240,232,238,0.42)' }}>타로 리더 · {loading ? '해석 중...' : '해석 완료'}</div>
        </div>
        {loading && (
          <div className="ml-auto w-5 h-5 border-2 rounded-full animate-spin flex-shrink-0"
            style={{ borderColor: 'var(--tarot-100)', borderTopColor: 'var(--tarot-500)' }} />
        )}
      </div>

      {/* 질문 */}
      {question && (
        <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(157,143,255,0.08)', border: '1px solid rgba(157,143,255,0.2)' }}>
          <div className="text-[10px] tracking-widest mb-1" style={{ color: '#9d8fff' }}>YOUR QUESTION</div>
          <div className="text-sm" style={{ color: 'rgba(240,232,238,0.7)' }}>"{question}"</div>
        </div>
      )}

      {/* 뽑힌 카드들 */}
      <div className="glass-card rounded-2xl p-4" style={{ borderColor: 'rgba(127,119,221,0.15)' }}>
        <div className="text-[10px] tracking-widest mb-3" style={{ color: 'rgba(240,232,238,0.42)' }}>DRAWN CARDS</div>
        <div className="flex gap-2 flex-wrap">
          {cards.map((c, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(157,143,255,0.1)', border: '1px solid rgba(157,143,255,0.2)' }}>
              {c.imageUrl
                ? <img src={c.imageUrl} alt={c.name} className="w-6 h-9 object-cover rounded" />
                : <span className="text-base">{c.emoji}</span>
              }
              <span className="text-xs" style={{ color: 'rgba(240,232,238,0.7)' }}>{c.name}</span>
              {c.isReversed && <span className="text-[10px]" style={{ color: 'var(--tarot-400)' }}>역</span>}
            </div>
          ))}
        </div>
      </div>

      {/* AI 해석 */}
      <div className="glass-card rounded-2xl p-5" style={{ borderColor: 'rgba(127,119,221,0.15)' }}>
        <div className="text-[10px] tracking-widest mb-4" style={{ color: 'rgba(240,232,238,0.42)' }}>READING</div>
        {loading ? (
          <div className="space-y-3">
            {[90, 75, 85, 60].map((w, i) => (
              <div key={i} className="h-3 rounded-full animate-pulse" style={{ width: `${w}%`, background: 'var(--tarot-50)' }} />
            ))}
            <p className="text-xs text-center mt-4" style={{ color: 'var(--tarot-400)' }}>
              성월 선생님이 카드를 읽고 있어요 🌙
            </p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="text-sm font-bold mt-4 mb-2 first:mt-0" style={{ color: '#9d8fff' }}>
                    {children}
                  </h2>
                ),
                p: ({ children }) => <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(240,232,238,0.62)' }}>{children}</p>,
                li: ({ children }) => (
                  <li className="text-sm leading-relaxed mb-1 flex gap-2" style={{ color: 'rgba(240,232,238,0.62)' }}>
                    <span className="flex-shrink-0" style={{ color: 'var(--tarot-400)' }}>•</span>
                    <span>{children}</span>
                  </li>
                ),
                ul: ({ children }) => <ul className="space-y-1 mb-3 list-none pl-0">{children}</ul>,
              }}
            >
              {aiResult}
            </ReactMarkdown>
          </motion.div>
        )}
      </div>

      {/* 카드별 의미 요약 */}
      <div className="glass-card rounded-2xl p-4" style={{ borderColor: 'rgba(127,119,221,0.15)' }}>
        <div className="text-[10px] tracking-widest mb-3" style={{ color: 'rgba(240,232,238,0.42)' }}>CARD MEANINGS</div>
        <div className="space-y-3">
          {cards.map((c, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-8 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--tarot-50)' }}>
                {c.imageUrl
                  ? <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                  : <span className="text-lg">{c.emoji}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-bold" style={{ color: '#f5eef2' }}>{c.name}</span>
                  {c.isReversed && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(157,143,255,0.15)', color: '#9d8fff' }}>역방향</span>
                  )}
                  <span className="text-[10px] ml-auto" style={{ color: 'rgba(240,232,238,0.4)' }}>{c.position}</span>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(240,232,238,0.46)' }}>
                  {c.isReversed ? c.reversed : c.upright}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 사주 분석 CTA */}
      <div className="rounded-2xl p-6 text-center space-y-3" style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(232,130,154,0.12), rgba(18,8,16,0.85) 60%)', border: '1px solid rgba(232,130,154,0.16)' }}>
        <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(232,130,154,0.6)' }}>사주 분석</p>
        <h4 className="text-base font-bold break-keep" style={{ color: '#f5eef2' }}>타로가 보여준 흐름, 사주로 더 깊이 확인해요</h4>
        <p className="text-xs break-keep" style={{ color: 'rgba(240,232,238,0.46)' }}>생년월일로 분석한 나의 운명 코드를 알아보세요.</p>
        <button
          onClick={() => router.push('/')}
          className="btn-shimmer text-white px-6 py-3 rounded-2xl font-black text-sm shadow-md shadow-primary-200/40 transition-all active:scale-95 inline-flex items-center gap-1.5"
        >
          🌙 사주 분석 받기
        </button>
      </div>

      {/* 궁합 CTA */}
      <div className="rounded-2xl p-6 text-center space-y-3" style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(212,104,138,0.12), rgba(18,8,16,0.85) 60%)', border: '1px solid rgba(212,104,138,0.16)' }}>
        <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(212,104,138,0.6)' }}>운명 궁합</p>
        <h4 className="text-base font-bold break-keep" style={{ color: '#f5eef2' }}>소중한 인연과의 에너지 궁합도 확인해보세요</h4>
        <p className="text-xs break-keep" style={{ color: 'rgba(240,232,238,0.46)' }}>두 사람의 사주로 운명적 인연인지 알아봐요.</p>
        <button
          onClick={() => router.push('/')}
          className="btn-shimmer text-white px-6 py-3 rounded-2xl font-black text-sm shadow-md shadow-primary-200/40 transition-all active:scale-95 inline-flex items-center gap-1.5"
        >
          💖 궁합 보기
        </button>
      </div>

      {/* 공유 버튼 */}
      <ShareButtons name="타로 리딩" />

      {/* 다시 리딩 버튼 */}
      <div className="pb-8">
        <button
          onClick={onReset}
          className="w-full py-3.5 rounded-2xl text-sm font-medium transition-opacity hover:opacity-70"
          style={{ border: '1px solid var(--tarot-200)', color: 'var(--tarot-500)' }}
        >
          🔄 다시 리딩하기
        </button>
      </div>
    </div>
  )
}
