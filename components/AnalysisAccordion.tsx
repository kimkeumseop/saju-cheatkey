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
    .replace(/[ \t]*(\*\*(?:한 줄 결론|왜 이렇게 보나요\??|왜 이렇게 보는지|핵심 포인트|실전 조언|추천 행동|피해야 할 행동)[^*]*\*\*)/g, '\n\n$1')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
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

  const previewParagraphs = paragraphs.slice(0, 2);
  const restAfterPreview = paragraphs.slice(2);

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
    summaryParagraph: previewParagraphs.join('\n\n'),
    restParagraphs: restAfterPreview,
    hasMore: restAfterPreview.length > 0,
  };
}

function renderInlineText(rawText: string) {
  const parts = rawText.split(/(\*\*.*?\*\*)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-black" style={{ color: '#2D1B1E' }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function stripLineMarker(line: string) {
  return line
    .replace(/^\s*[-*•]\s*/, '')
    .replace(/^\s*\d+[.)]\s+/, '')
    .trim();
}

function normalizeStructuredPart(part: string) {
  return part
    .replace(/^근거\s*[:：]\s*/, '좋은 이유: ')
    .replace(/^왜\s*이렇게\s*보나요\s*[:：]\s*/, '좋은 이유: ')
    .replace(/^행동\s*[:：]\s*/, '추천 행동: ')
    .replace(/^추천\s*행동\s*[:：]\s*/, '추천 행동: ')
    .trim();
}

function parseStructuredLine(rawLine: string) {
  const line = stripLineMarker(rawLine);
  if (!line.includes('|') || !/(근거|행동|추천\s*행동|왜\s*이렇게\s*보나요)/.test(line)) return null;

  const [headline = '', ...details] = line
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);

  if (!headline || details.length === 0) return null;

  return {
    headline,
    details: details.map(normalizeStructuredPart).filter(Boolean),
  };
}

function renderStructuredLine(rawLine: string, key: string | number) {
  const parsed = parseStructuredLine(rawLine);
  if (!parsed) return null;

  return (
    <div
      key={key}
      className="rounded-2xl px-4 py-3 space-y-2"
      style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(212,104,138,0.10)' }}
    >
      <p className="text-[14px] md:text-[15px] font-black leading-relaxed break-keep" style={{ color: '#2D1B1E' }}>
        {renderInlineText(parsed.headline)}
      </p>
      <div className="space-y-1.5">
        {parsed.details.map((detail, index) => {
          const [label, ...bodyParts] = detail.split(':');
          const body = bodyParts.join(':').trim();
          const hasLabel = body.length > 0 && /^(좋은 이유|추천 행동|조심할 점|근거|행동)$/.test(label.trim());

          return (
            <div key={`${key}-${index}`} className="grid gap-1 md:grid-cols-[5.5rem_1fr] md:items-start">
              {hasLabel ? (
                <>
                  <span className="text-[11px] font-black" style={{ color: '#d4688a' }}>{label.trim()}</span>
                  <span className="text-[13px] md:text-sm font-medium leading-relaxed break-keep" style={{ color: 'rgba(45,27,30,0.66)' }}>
                    {renderInlineText(body)}
                  </span>
                </>
              ) : (
                <span className="text-[13px] md:text-sm font-medium leading-relaxed break-keep md:col-span-2" style={{ color: 'rgba(45,27,30,0.66)' }}>
                  {renderInlineText(detail)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 텍스트 렌더링 ──────────────────────────────────────────────────
function renderParagraph(rawText: string, className?: string) {
  const cleaned = cleanBodyText(rawText);
  const lines = cleaned.split('\n');

  return (
    <div className={cn('space-y-2 whitespace-pre-wrap break-keep', className)}>
      {lines.map((line, index) => {
        const structuredLine = renderStructuredLine(line, index);
        if (structuredLine) return structuredLine;

        return (
          <p key={index} className="leading-relaxed">
            {renderInlineText(line)}
          </p>
        );
      })}
    </div>
  );
}

function hasRenderableText(item: AnalysisItem) {
  const content = cleanBodyText(item.content || '');
  return content.length >= 6;
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────
export default function AnalysisAccordion({ data }: AnalysisAccordionProps) {
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedIndexes, setExpandedIndexes] = useState<Set<number>>(new Set());
  const [liveData, setLiveData] = useState<AnalysisItem[]>(() => data.filter(hasRenderableText).map((item) => ({ ...item })));

  const dataSignature = useMemo(
    () => data.map((item, index) => `${index}:${item.title}::${item.content}`).join('\u0001'),
    [data]
  );

  useEffect(() => {
    setLiveData(data.filter(hasRenderableText).map((item) => ({ ...item })));
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
      {liveData.length === 0 && (
        <div className="rounded-[2rem] p-5 text-sm font-medium" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(212,104,138,0.14)', color: 'rgba(45,27,30,0.62)' }}>
          리포트 내용을 정리하는 중입니다. 다시 생성하면 더 안정적으로 표시돼요.
        </div>
      )}
      {liveData.map((item, index) => {
        const isExpanded = expandedIndexes.has(index);
        const isSpeaking = speakingIndex === index;
        const isCopied = copiedIndex === index;
        const cleanTitle = keepOneEmoji(item.title);
        const { summaryParagraph, restParagraphs, hasMore } = splitContent(item.content);
        if (!cleanBodyText(summaryParagraph)) return null;

        return (
          <article
            key={`${index}-${item.title}`}
            className="rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(212,104,138,0.14)',
              boxShadow: '0 8px 40px rgba(212,104,138,0.06)',
            }}
          >
            {/* ── 헤더: 번호 + 제목 + 버튼 ── */}
            <div className="flex items-start gap-3 mb-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-base font-black text-white"
                style={{ background: 'linear-gradient(135deg, #d4688a, #c2255c)', boxShadow: '0 4px 16px rgba(212,104,138,0.35)' }}
              >
                {index + 1}
              </div>
              <h4 className="flex-1 font-bold tracking-tight break-keep leading-snug text-[17px] md:text-[21px] pt-1.5" style={{ color: '#2D1B1E' }}>
                {cleanTitle}
              </h4>
              {/* 액션 버튼 */}
              <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleCopyLink(index)}
                  className={cn(
                    'rounded-full border p-2 transition-all active:scale-95',
                    isCopied
                      ? 'border-green-400/40 bg-green-400/10 text-green-400'
                      : 'border-black/10 bg-black/5 text-black/40 hover:text-[#d4688a] hover:border-[#d4688a]/30'
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
                    'rounded-full border p-2 transition-all active:scale-95',
                    isSpeaking
                      ? 'border-transparent bg-[#d4688a] text-white'
                      : 'border-black/10 bg-black/5 text-black/40 hover:text-[#d4688a] hover:border-[#d4688a]/30'
                  )}
                  aria-label={isSpeaking ? '음성 재생 중지' : '본문 음성 재생'}
                >
                  {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* ── 핵심 요약 (항상 표시) ── */}
            <div className="rounded-[1.5rem] px-5 py-4" style={{ background: 'rgba(212,104,138,0.06)', border: '1px solid rgba(212,104,138,0.12)' }}>
              <div className="text-[15px] font-medium leading-relaxed md:text-[16px] break-keep" style={{ color: isSpeaking ? '#2D1B1E' : 'rgba(45,27,30,0.72)' }}>
                {renderParagraph(summaryParagraph)}
              </div>
            </div>

            {/* ── 펼쳐지는 나머지 내용 ── */}
            {hasMore && isExpanded && (
              <div className="mt-3 px-5 py-4 rounded-[1.5rem] space-y-3" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(45,27,30,0.10)' }}>
                <div className="space-y-3 text-[14px] font-medium leading-relaxed break-keep" style={{ color: 'rgba(45,27,30,0.6)' }}>
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
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-black transition-all"
                style={{ color: 'rgba(212,104,138,0.7)' }}
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
