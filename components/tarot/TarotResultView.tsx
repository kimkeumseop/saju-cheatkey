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
          <div className="text-sm font-semibold text-gray-800">성월 선생님</div>
          <div className="text-xs text-gray-400">타로 리더 · {loading ? '해석 중...' : '해석 완료'}</div>
        </div>
        {loading && (
          <div className="ml-auto w-5 h-5 border-2 rounded-full animate-spin flex-shrink-0"
            style={{ borderColor: 'var(--tarot-100)', borderTopColor: 'var(--tarot-500)' }} />
        )}
      </div>

      {/* 질문 */}
      {question && (
        <div className="px-4 py-3 rounded-2xl" style={{ background: 'var(--tarot-50)', border: '1px solid var(--tarot-100)' }}>
          <div className="text-[10px] tracking-widest mb-1" style={{ color: 'var(--tarot-400)' }}>YOUR QUESTION</div>
          <div className="text-sm text-gray-700">"{question}"</div>
        </div>
      )}

      {/* 뽑힌 카드들 */}
      <div className="glass-card rounded-2xl p-4" style={{ borderColor: 'rgba(127,119,221,0.15)' }}>
        <div className="text-[10px] text-gray-400 tracking-widest mb-3">DRAWN CARDS</div>
        <div className="flex gap-2 flex-wrap">
          {cards.map((c, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'var(--tarot-50)', border: '1px solid var(--tarot-100)' }}>
              {c.imageUrl
                ? <img src={c.imageUrl} alt={c.name} className="w-6 h-9 object-cover rounded" />
                : <span className="text-base">{c.emoji}</span>
              }
              <span className="text-xs text-gray-700">{c.name}</span>
              {c.isReversed && <span className="text-[10px]" style={{ color: 'var(--tarot-400)' }}>역</span>}
            </div>
          ))}
        </div>
      </div>

      {/* AI 해석 */}
      <div className="glass-card rounded-2xl p-5" style={{ borderColor: 'rgba(127,119,221,0.15)' }}>
        <div className="text-[10px] text-gray-400 tracking-widest mb-4">READING</div>
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
                  <h2 className="text-sm font-semibold mt-4 mb-2 first:mt-0" style={{ color: 'var(--tarot-700, var(--tarot-600))' }}>
                    {children}
                  </h2>
                ),
                p: ({ children }) => <p className="text-sm text-gray-600 leading-relaxed mb-3">{children}</p>,
                li: ({ children }) => (
                  <li className="text-sm text-gray-600 leading-relaxed mb-1 flex gap-2">
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
        <div className="text-[10px] text-gray-400 tracking-widest mb-3">CARD MEANINGS</div>
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
                  <span className="text-xs font-medium text-gray-800">{c.name}</span>
                  {c.isReversed && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--tarot-50)', color: 'var(--tarot-500)' }}>역방향</span>
                  )}
                  <span className="text-[10px] text-gray-400 ml-auto">{c.position}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {c.isReversed ? c.reversed : c.upright}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 사주 분석 CTA */}
      <div className="rounded-2xl p-6 text-center space-y-3" style={{ background: 'linear-gradient(135deg, #fff5f8, #fff0f6)', border: '1px solid rgba(240,101,149,0.15)' }}>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-300">사주 분석</p>
        <h4 className="text-base font-black text-gray-900 break-keep">타로가 보여준 흐름, 사주로 더 깊이 확인해요</h4>
        <p className="text-xs text-gray-400 break-keep">생년월일로 분석한 나의 운명 코드를 알아보세요.</p>
        <button
          onClick={() => router.push('/')}
          className="btn-shimmer text-white px-6 py-3 rounded-2xl font-black text-sm shadow-md shadow-primary-200/40 transition-all active:scale-95 inline-flex items-center gap-1.5"
        >
          🌙 사주 분석 받기
        </button>
      </div>

      {/* 궁합 CTA */}
      <div className="rounded-2xl p-6 text-center space-y-3" style={{ background: 'linear-gradient(135deg, #fff5f8, #fff0f6)', border: '1px solid rgba(240,101,149,0.15)' }}>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-300">운명 궁합</p>
        <h4 className="text-base font-black text-gray-900 break-keep">소중한 인연과의 에너지 궁합도 확인해보세요</h4>
        <p className="text-xs text-gray-400 break-keep">두 사람의 사주로 운명적 인연인지 알아봐요.</p>
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
