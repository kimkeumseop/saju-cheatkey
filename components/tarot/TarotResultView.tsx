'use client'
// src/components/tarot/TarotResultView.tsx
import { TarotCard } from '@/data/tarotCards'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useRouter } from 'next/navigation'
import ShareButtons from '@/components/ShareButtons'
import { AlertTriangle, CheckCircle2, Compass, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import TarotCardImage from './TarotCardImage'

interface DrawnCard extends TarotCard { isReversed: boolean; position: string }

interface Props {
  cards: DrawnCard[]
  aiResult: string
  loading: boolean
  question: string
  onReset: () => void
}

type TarotSection = {
  title: string
  content: string
}

function parseTarotSections(markdown: string): TarotSection[] {
  return markdown
    .replace(/\r\n/g, '\n')
    .split(/(?=^##\s+)/m)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [titleLine = '', ...contentLines] = block.split('\n')
      return {
        title: titleLine.replace(/^##\s*/, '').trim(),
        content: contentLines.join('\n').trim(),
      }
    })
}

function cleanTarotLine(line: string) {
  return line
    .replace(/^#+\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/^[✅📌💡🔮🃏⚠️🌟✨\-*•\d.)\s]+/u, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function getSectionLines(section: TarotSection | undefined, max = 3) {
  if (!section) return []
  return section.content
    .replace(/\\n/g, '\n')
    .split('\n')
    .map((line) => cleanTarotLine(line.trim()))
    .filter((line) => line.length >= 7 && !line.endsWith(':'))
    .slice(0, max)
}

function findTarotSection(sections: TarotSection[], words: string[]) {
  return sections.find((section) => {
    const title = section.title.replace(/\s/g, '')
    return words.some((word) => title.includes(word.replace(/\s/g, '')))
  })
}

function TarotBriefingPanel({ aiResult }: { aiResult: string }) {
  const sections = parseTarotSections(aiResult)
  const core = findTarotSection(sections, ['핵심결론', '먼저보는'])
  const caution = findTarotSection(sections, ['조심해야할흐름', '주의'])
  const action = findTarotSection(sections, ['지금바로할일', '필요한것'])
  const final = findTarotSection(sections, ['최종조언', '나아가는방향'])

  const coreLines = getSectionLines(core, 3)
  const cautionLines = getSectionLines(caution, 3)
  const actionLines = getSectionLines(action, 3)
  const finalLines = getSectionLines(final, 3)

  if (!aiResult.trim()) return null

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TarotBriefingCard icon={<Sparkles className="w-5 h-5" />} label="결론" title="카드가 먼저 말하는 답" lines={coreLines.length ? coreLines : finalLines} accent="#7c6fd6" />
        <TarotBriefingCard icon={<AlertTriangle className="w-5 h-5" />} label="주의" title="지금 조심할 흐름" lines={cautionLines} accent="#c2883a" />
        <TarotBriefingCard icon={<CheckCircle2 className="w-5 h-5" />} label="행동" title="오늘 바로 할 일" lines={actionLines} accent="#0e9f73" />
        <TarotBriefingCard icon={<Compass className="w-5 h-5" />} label="방향" title="최종 조언" lines={finalLines.length ? finalLines : coreLines} accent="#d4688a" />
      </div>
    </section>
  )
}

function TarotBriefingCard({ icon, label, title, lines, accent }: { icon: ReactNode; label: string; title: string; lines: string[]; accent: string }) {
  return (
    <article
      className="rounded-2xl p-4 min-h-[11rem] flex flex-col gap-3"
      style={{
        background: 'rgba(255,255,255,0.92)',
        border: `1px solid ${accent}33`,
        boxShadow: `0 8px 28px ${accent}10`,
      }}
    >
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-2xl flex items-center justify-center" style={{ background: `${accent}18`, color: accent }}>
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: accent }}>{label}</span>
      </div>
      <h4 className="text-base font-bold leading-snug break-keep" style={{ color: '#2D1B1E' }}>{title}</h4>
      <div className="space-y-2">
        {(lines.length ? lines : ['카드 해석을 정리하는 중이에요.']).slice(0, 3).map((line, index) => (
          <p key={`${title}-${index}`} className="text-xs leading-relaxed break-keep" style={{ color: 'rgba(45,27,30,0.62)' }}>
            <span className="font-black" style={{ color: accent }}>{index + 1}. </span>
            {line}
          </p>
        ))}
      </div>
    </article>
  )
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
          <div className="text-sm font-bold" style={{ color: '#2D1B1E' }}>성월 선생님</div>
          <div className="text-xs" style={{ color: 'rgba(45,27,30,0.42)' }}>타로 리더 · {loading ? '해석 중...' : '해석 완료'}</div>
        </div>
        {loading && (
          <div className="ml-auto w-5 h-5 border-2 rounded-full animate-spin flex-shrink-0"
            style={{ borderColor: 'var(--tarot-100)', borderTopColor: 'var(--tarot-500)' }} />
        )}
      </div>

      {/* 질문 */}
      {question && (
        <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(124,111,214,0.08)', border: '1px solid rgba(124,111,214,0.2)' }}>
          <div className="text-[10px] tracking-widest mb-1" style={{ color: '#7c6fd6' }}>YOUR QUESTION</div>
          <div className="text-sm" style={{ color: 'rgba(45,27,30,0.7)' }}>"{question}"</div>
        </div>
      )}

      {/* 뽑힌 카드들 */}
      <div className="glass-card rounded-2xl p-4" style={{ borderColor: 'rgba(127,119,221,0.15)' }}>
        <div className="text-[10px] tracking-widest mb-3" style={{ color: 'rgba(45,27,30,0.42)' }}>DRAWN CARDS</div>
        <div className="flex gap-2 flex-wrap">
          {cards.map((c, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(124,111,214,0.1)', border: '1px solid rgba(124,111,214,0.2)' }}>
              <div className="h-9 w-6 overflow-hidden rounded">
                <TarotCardImage imageUrl={c.imageUrl} name={c.name} emoji={c.emoji} className="h-full w-full object-cover" fallbackClassName="text-base" />
              </div>
              <span className="text-xs" style={{ color: 'rgba(45,27,30,0.7)' }}>{c.name}</span>
              {c.isReversed && <span className="text-[10px]" style={{ color: 'var(--tarot-400)' }}>역</span>}
            </div>
          ))}
        </div>
      </div>

      {/* AI 해석 */}
      <div className="glass-card rounded-2xl p-5" style={{ borderColor: 'rgba(127,119,221,0.15)' }}>
        <div className="text-[10px] tracking-widest mb-4" style={{ color: 'rgba(45,27,30,0.42)' }}>READING</div>
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
            <TarotBriefingPanel aiResult={aiResult} />
            <div className="my-5 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(124,111,214,0.24), transparent)' }} />
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="text-sm font-bold mt-4 mb-2 first:mt-0" style={{ color: '#7c6fd6' }}>
                    {children}
                  </h2>
                ),
                p: ({ children }) => <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(45,27,30,0.62)' }}>{children}</p>,
                li: ({ children }) => (
                  <li className="text-sm leading-relaxed mb-1 flex gap-2" style={{ color: 'rgba(45,27,30,0.62)' }}>
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
        <div className="text-[10px] tracking-widest mb-3" style={{ color: 'rgba(45,27,30,0.42)' }}>CARD MEANINGS</div>
        <div className="space-y-3">
          {cards.map((c, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-8 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--tarot-50)' }}>
                <TarotCardImage imageUrl={c.imageUrl} name={c.name} emoji={c.emoji} className="h-full w-full object-cover" fallbackClassName="text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-bold" style={{ color: '#2D1B1E' }}>{c.name}</span>
                  {c.isReversed && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(124,111,214,0.15)', color: '#7c6fd6' }}>역방향</span>
                  )}
                  <span className="text-[10px] ml-auto" style={{ color: 'rgba(45,27,30,0.4)' }}>{c.position}</span>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(45,27,30,0.46)' }}>
                  {c.isReversed ? c.reversed : c.upright}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 사주 분석 CTA */}
      <div className="rounded-2xl p-6 text-center space-y-3" style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(212,104,138,0.12), rgba(255,255,255,0.85) 60%)', border: '1px solid rgba(212,104,138,0.16)' }}>
        <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(212,104,138,0.6)' }}>사주 분석</p>
        <h4 className="text-base font-bold break-keep" style={{ color: '#2D1B1E' }}>타로가 보여준 흐름, 사주로 더 깊이 확인해요</h4>
        <p className="text-xs break-keep" style={{ color: 'rgba(45,27,30,0.46)' }}>생년월일로 분석한 나의 운명 코드를 알아보세요.</p>
        <button
          onClick={() => router.push('/')}
          className="btn-shimmer text-white px-6 py-3 rounded-2xl font-black text-sm shadow-md shadow-primary-200/40 transition-all active:scale-95 inline-flex items-center gap-1.5"
        >
          🌙 사주 분석 받기
        </button>
      </div>

      {/* 궁합 CTA */}
      <div className="rounded-2xl p-6 text-center space-y-3" style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(212,104,138,0.12), rgba(255,255,255,0.85) 60%)', border: '1px solid rgba(212,104,138,0.16)' }}>
        <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(212,104,138,0.6)' }}>운명 궁합</p>
        <h4 className="text-base font-bold break-keep" style={{ color: '#2D1B1E' }}>소중한 인연과의 에너지 궁합도 확인해보세요</h4>
        <p className="text-xs break-keep" style={{ color: 'rgba(45,27,30,0.46)' }}>두 사람의 사주로 운명적 인연인지 알아봐요.</p>
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
