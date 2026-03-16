'use client';

import { useEffect, useMemo, useState } from 'react';
import { Volume2, VolumeX, Link2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AnalysisItem {
  title: string;
  content: string;
}

interface AnalysisAccordionProps {
  data: AnalysisItem[];
}

// ── 이모지 처리 ────────────────────────────────────────────────────
// 제목: 이모지 1개만 유지
const ALL_EMOJI_RE = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu;

function keepOneEmoji(title: string): string {
  const match = title.match(ALL_EMOJI_RE);
  const stripped = title.replace(ALL_EMOJI_RE, '').replace(/\s{2,}/g, ' ').trim();
  return match && match[0] ? `${match[0]} ${stripped}` : stripped;
}

// 본문: 고범위 장식용 이모지 제거, ✅ → 텍스트 변환
function cleanBodyText(text: string): string {
  return text
    .replace(/✅\s*/g, '✓ ')
    .replace(/❌\s*/g, '✗ ')
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ── 콘텐츠 파싱 ────────────────────────────────────────────────────
const isListLine = (line: string) => /^[✅✔☑️✓•\-\*]\s/.test(line.trim());

function splitContent(content: string): {
  summaryParagraph: string;
  restParagraphs: string[];
  hasMore: boolean;
} {
  const normalized = content
    .replace(/\\n\\n/g, '\n\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n');

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return { summaryParagraph: content, restParagraphs: [], hasMore: false };
  }

  // 단일 단락: 체크리스트 항목이 3개 초과면 분할
  if (paragraphs.length === 1) {
    const lines = paragraphs[0].split('\n');
    const listLines = lines.filter(isListLine);
    if (listLines.length > 3) {
      const nonListLines = lines.filter((l) => !isListLine(l));
      const visible = [...nonListLines, ...listLines.slice(0, 3)].filter(Boolean).join('\n');
      const hidden = listLines.slice(3).join('\n');
      return { summaryParagraph: visible, restParagraphs: [hidden], hasMore: true };
    }
    return { summaryParagraph: paragraphs[0], restParagraphs: [], hasMore: false };
  }

  // 다중 단락: 첫 단락에 체크리스트 3개 초과 시 오버플로우 처리
  const firstParagraph = paragraphs[0];
  const firstLines = firstParagraph.split('\n');
  const firstListLines = firstLines.filter(isListLine);

  if (firstListLines.length > 3) {
    const nonListLines = firstLines.filter((l) => !isListLine(l));
    const visible = [...nonListLines, ...firstListLines.slice(0, 3)].filter(Boolean).join('\n');
    const overflow = firstListLines.slice(3).join('\n');
    return {
      summaryParagraph: visible,
      restParagraphs: [overflow, ...paragraphs.slice(1)].filter(Boolean),
      hasMore: true,
    };
  }

  return {
    summaryParagraph: firstParagraph,
    restParagraphs: paragraphs.slice(1),
    hasMore: true,
  };
}

// ── 텍스트 렌더링 ──────────────────────────────────────────────────
function renderParagraph(rawText: string, className?: string) {
  const cleaned = cleanBodyText(rawText);
  const parts = cleaned.split(/(\*\*.*?\*\*)/g);

  return (
    <p className={cn('whitespace-pre-wrap break-keep', className)}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-black text-rose-600">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────
export default function AnalysisAccordion({ data }: AnalysisAccordionProps) {
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedIndexes, setExpandedIndexes] = useState<Set<number>>(new Set());
  const [liveData, setLiveData] = useState<AnalysisItem[]>(() => data.map((item) => ({ ...item })));

  const dataSignature = useMemo(
    () => data.map((item, index) => `${index}:${item.title}::${item.content}`).join('\u0001'),
    [data]
  );

  useEffect(() => {
    setLiveData(data.map((item) => ({ ...item })));
  }, [dataSignature, data]);

  const handleSpeak = (text: string, index: number) => {
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.onend = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyLink = (index: number) => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="space-y-5 w-full">
      {liveData.map((item, index) => {
        const isExpanded = expandedIndexes.has(index);
        const isSpeaking = speakingIndex === index;
        const isCopied = copiedIndex === index;
        const cleanTitle = keepOneEmoji(item.title);
        const { summaryParagraph, restParagraphs, hasMore } = splitContent(item.content);

        return (
          <article
            key={`${index}-${item.title}`}
            className="rounded-[2rem] md:rounded-[2.5rem] border border-pink-100 bg-white/95 p-5 md:p-8 shadow-[0_12px_40px_-15px_rgba(190,24,93,0.16)] overflow-hidden"
          >
            {/* ── 헤더: 번호 + 제목 + 버튼 ── */}
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 text-base font-black text-white shadow-lg shadow-rose-200/60">
                {index + 1}
              </div>
              <h4 className="flex-1 font-black tracking-tight text-rose-950 break-keep leading-snug text-[17px] md:text-[21px] pt-1.5">
                {cleanTitle}
              </h4>
              {/* 액션 버튼 */}
              <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleCopyLink(index)}
                  className={cn(
                    'rounded-full border p-2 shadow-sm transition-all active:scale-95',
                    isCopied
                      ? 'border-green-300 bg-green-50 text-green-500'
                      : 'border-pink-100 bg-rose-50 text-rose-300 hover:border-rose-200 hover:text-rose-500'
                  )}
                  aria-label="링크 복사"
                  title="이 결과 링크 복사"
                >
                  {isCopied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleSpeak(item.content || item.title, index)}
                  className={cn(
                    'rounded-full border p-2 shadow-sm transition-all active:scale-95',
                    isSpeaking
                      ? 'border-rose-400 bg-rose-500 text-white'
                      : 'border-pink-100 bg-rose-50 text-rose-400 hover:border-rose-200 hover:text-rose-600'
                  )}
                  aria-label={isSpeaking ? '음성 재생 중지' : '본문 음성 재생'}
                >
                  {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* ── 핵심 요약 (항상 표시) ── */}
            <div className="rounded-[1.5rem] bg-gradient-to-br from-rose-50 via-white to-pink-50 px-5 py-4 border border-pink-50/80">
              <div className={cn(
                'text-[15px] font-medium leading-relaxed text-slate-700 md:text-[16px] break-keep',
                isSpeaking && 'text-rose-950'
              )}>
                {renderParagraph(summaryParagraph)}
              </div>
            </div>

            {/* ── 펼쳐지는 나머지 내용 ── */}
            {hasMore && isExpanded && (
              <div className="mt-3 px-5 py-4 rounded-[1.5rem] bg-white/70 border border-pink-50 space-y-3">
                <div className="space-y-3 text-[14px] font-medium leading-relaxed text-slate-600 break-keep">
                  {restParagraphs.map((p, i) => (
                    <div key={i}>{renderParagraph(p)}</div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 더 보기 토글 버튼 ── */}
            {hasMore && (
              <button
                type="button"
                onClick={() => toggleExpand(index)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-black text-rose-300 hover:text-rose-500 hover:bg-rose-50/60 transition-all"
              >
                {isExpanded ? (
                  <>접기 <ChevronUp className="w-3.5 h-3.5" /></>
                ) : (
                  <>더 보기 <ChevronDown className="w-3.5 h-3.5" /></>
                )}
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}
