'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Moon, Copy, Check, MessageSquare, AlertTriangle, CheckCircle2, CalendarDays, Sparkles } from 'lucide-react';
import AnalysisAccordion from './AnalysisAccordion';
import ShareButtons from './ShareButtons';
import InstaStoryButton from './InstaStoryButton';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ELEMENT_STYLE } from '@/lib/saju';
import { normalizeGunghapAiResult } from '@/lib/ai-result';
import { getRelationTheme, type RelationTheme } from '@/lib/relation-theme';
import { motion } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getSafeColor = (elementKey: string) => {
  return ELEMENT_STYLE[elementKey] || { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-100', color: '#999999' };
};

type RelationSection = {
  title: string;
  content: string;
};

function normalizeLines(content = '') {
  return content
    .replace(/\\n\\n/g, '\n\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function cleanLine(line: string) {
  return line
    .replace(/^#+\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\-*•\s]+/u, '')
    .replace(/^\d+[.)]\s+/u, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeBriefingPart(part: string) {
  return part
    .replace(/^근거\s*[:：]\s*/, '좋은 이유: ')
    .replace(/^왜\s*이렇게\s*보나요\s*[:：]\s*/, '좋은 이유: ')
    .replace(/^행동\s*[:：]\s*/, '추천 행동: ')
    .replace(/^추천\s*행동\s*[:：]\s*/, '추천 행동: ')
    .trim();
}

function parseBriefingLine(line: string) {
  const cleaned = cleanLine(line);
  if (!cleaned.includes('|')) {
    return { headline: cleaned, details: [] };
  }

  const [headline = '', ...details] = cleaned
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    headline: headline || cleaned,
    details: details.map(normalizeBriefingPart).filter(Boolean),
  };
}

function findRelationSection(sections: RelationSection[], titleWords: string[], contentWords: string[] = []) {
  return sections.find((section) => {
    const title = section.title.replace(/\s/g, '');
    const content = section.content.replace(/\s/g, '');
    return titleWords.some((word) => title.includes(word.replace(/\s/g, ''))) ||
      contentWords.some((word) => content.includes(word.replace(/\s/g, '')));
  });
}

function getRelationLines(section: RelationSection | undefined, max = 3) {
  if (!section) return [];
  return normalizeLines(section.content)
    .map(cleanLine)
    .filter((line) => line.length >= 8 && !line.endsWith(':') && !line.includes('가지'))
    .slice(0, max);
}

function getRelationBlockLines(section: RelationSection | undefined, startWords: string[], stopWords: string[], max = 3) {
  if (!section) return [];
  const lines = normalizeLines(section.content);
  const startIndex = lines.findIndex((line) => startWords.some((word) => line.includes(word)));
  const scanLines = startIndex >= 0 ? lines.slice(startIndex + 1) : lines;
  const picked: string[] = [];

  for (const rawLine of scanLines) {
    const isNextBlock = picked.length > 0 && stopWords.some((word) => rawLine.includes(word));
    if (isNextBlock) break;
    const line = cleanLine(rawLine);
    if (!line || line.length < 8 || startWords.some((word) => line.includes(word)) || line.endsWith(':')) continue;
    picked.push(line);
    if (picked.length >= max) break;
  }

  return picked;
}

function RelationBriefingPanel({ sections, theme }: { sections: RelationSection[]; theme: RelationTheme }) {
  const coreSection = findRelationSection(sections, ['관계핵심브리핑', '진짜결론', '총평']);
  const synergySection = findRelationSection(sections, ['끌림과시너지', '시너지포인트']);
  const conflictSection = findRelationSection(sections, ['갈등포인트', '진짜마음', '반복되는오해']);
  const timingSection = findRelationSection(sections, ['향후10년관계타이밍', '관계타이밍'], ['가까워지는 구간', '멀어지기 쉬운 구간']);
  const actionSection = findRelationSection(sections, ['실전행동', '지켜줄다정한조언', '관계를지키는']);
  const avoidSection = findRelationSection(sections, ['피해야할선택', '방치하면틀어지는']);

  const closerLines = getRelationBlockLines(
    timingSection,
    ['가까워지는 해', '가까워지는 구간'],
    ['멀어지기 쉬운 해', '멀어지기 쉬운 구간', '관계를 결정해야', '그 시기에 하면 좋은 행동'],
    2
  );
  const distanceLines = getRelationBlockLines(
    timingSection,
    ['멀어지기 쉬운 해', '멀어지기 쉬운 구간'],
    ['관계를 결정해야', '그 시기에 하면 좋은 행동', '가까워지는 해', '가까워지는 구간'],
    2
  );
  const decisionLines = getRelationBlockLines(
    timingSection,
    ['관계를 결정해야 하는 해', '관계를 결정해야 하는 포인트', '결정해야'],
    ['그 시기에 하면 좋은 행동', '가까워지는 해', '가까워지는 구간', '멀어지기 쉬운 해', '멀어지기 쉬운 구간'],
    3
  );

  const coreLines = getRelationLines(coreSection, 3);
  const synergyLines = getRelationLines(synergySection, 3);
  const conflictLines = getRelationLines(conflictSection, 3);
  const actionLines = getRelationLines(actionSection, 3);
  const avoidLines = getRelationLines(avoidSection, 3);

  return (
    <section className="space-y-5">
      <div className="space-y-2 px-1">
        <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: theme.color }}>
          <Sparkles className="w-4 h-4" />
          First Check
        </div>
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight break-keep" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>
          먼저 보는 관계 브리핑
        </h3>
        <p className="text-sm md:text-base font-medium leading-relaxed break-keep max-w-2xl" style={{ color: 'rgba(240,232,238,0.58)' }}>
          {coreLines[0] || '두 사람은 좋은 지점과 조심할 지점이 함께 보이는 관계예요.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <RelationBriefingCard icon={<Heart className="w-5 h-5" />} label="시너지" title="잘 맞는 지점" lines={synergyLines.length ? synergyLines : coreLines} accent={theme.color} />
        <RelationBriefingCard icon={<AlertTriangle className="w-5 h-5" />} label="주의" title="반복 갈등 포인트" lines={conflictLines.length ? conflictLines : avoidLines} accent="#ffb86b" />
        <RelationBriefingCard icon={<CheckCircle2 className="w-5 h-5" />} label="행동" title="관계를 지키는 방법" lines={actionLines.length ? actionLines : decisionLines} accent="#9d8fff" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <RelationBriefingCard icon={<CalendarDays className="w-5 h-5" />} label="타이밍" title="가까워지는 구간" lines={closerLines.length ? closerLines : synergyLines} accent="#00d18f" />
        <RelationBriefingCard icon={<AlertTriangle className="w-5 h-5" />} label="거리감" title="멀어지기 쉬운 구간" lines={distanceLines.length ? distanceLines : conflictLines} accent="#ffb86b" />
        <RelationBriefingCard icon={<CheckCircle2 className="w-5 h-5" />} label="결정" title="관계 결정 포인트" lines={decisionLines.length ? decisionLines : actionLines} accent="#e8829a" />
      </div>
    </section>
  );
}

function RelationBriefingCard({ icon, label, title, lines, accent }: { icon: ReactNode; label: string; title: string; lines: string[]; accent: string }) {
  return (
    <article
      className="rounded-[2rem] p-5 md:p-6 min-h-[12rem] flex flex-col gap-4"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${accent}33`,
        boxShadow: `0 8px 32px ${accent}12, 0 1px 0 rgba(255,255,255,0.04) inset`,
      }}
    >
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-2xl flex items-center justify-center" style={{ background: `${accent}18`, color: accent }}>
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: accent }}>{label}</span>
      </div>
      <h4 className="text-lg font-bold leading-snug break-keep" style={{ color: '#f5eef2' }}>{title}</h4>
      <div className="space-y-2.5">
        {(lines.length ? lines : ['아직 리포트 내용을 정리하는 중이에요.']).slice(0, 3).map((line, index) => {
          const parsed = parseBriefingLine(line);
          return (
            <div key={`${title}-${index}`} className="space-y-1.5 rounded-2xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.022)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[13px] md:text-sm font-bold leading-relaxed break-keep" style={{ color: 'rgba(245,238,242,0.84)' }}>
                <span className="font-black" style={{ color: accent }}>{index + 1}. </span>
                {parsed.headline}
              </p>
              {parsed.details.map((detail, detailIndex) => {
                const [rawLabel, ...bodyParts] = detail.split(':');
                const body = bodyParts.join(':').trim();
                const hasLabel = Boolean(body);
                return (
                  <div key={`${title}-${index}-${detailIndex}`} className="grid gap-0.5">
                    {hasLabel ? (
                      <>
                        <span className="text-[10px] font-black" style={{ color: accent }}>{rawLabel.trim()}</span>
                        <span className="text-[12px] md:text-[13px] font-medium leading-relaxed break-keep" style={{ color: 'rgba(240,232,238,0.58)' }}>{body}</span>
                      </>
                    ) : (
                      <span className="text-[12px] md:text-[13px] font-medium leading-relaxed break-keep" style={{ color: 'rgba(240,232,238,0.58)' }}>{detail}</span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </article>
  );
}

// getPercentile / getScoreLevel → 테마 시스템으로 대체됨 (lib/relation-theme.ts)

// ── 만세력 차트 ──────────────────────────────────────────────────
function PillarChart({
  pillars,
  title,
  themeColor = 'primary',
  isTimeUnknown,
}: {
  pillars: any[];
  title?: string;
  themeColor?: 'primary' | 'blue' | 'pink';
  isTimeUnknown?: boolean;
}) {
  const borderColor =
    themeColor === 'blue' ? 'border-blue-200' : themeColor === 'pink' ? 'border-pink-300' : 'border-primary-200';
  return (
    <div className="space-y-4">
      {title && (
        <h4 className="text-center font-bold text-sm md:text-base" style={{ color: '#f5eef2' }}>{title}</h4>
      )}
      <div className="grid grid-cols-4 gap-1.5 md:gap-3">
        {pillars.map((p: any, colIdx: number) => {
          const isDayPillar = p.label === '일주';
          const isTimePillar = p.label === '시주';
          const forceHide = isTimePillar && isTimeUnknown;
          const showDash = p.isUnknown || forceHide;
          const ganStyle = p.ganColor || getSafeColor(p.ganElement);
          const zhiStyle = p.zhiColor || getSafeColor(p.zhiElement);
          return (
            <div key={colIdx} className="space-y-2">
              <div className="text-center space-y-0.5">
                <div className="text-[8px] md:text-[10px] font-black tracking-tighter uppercase" style={{ color: 'rgba(240,232,238,0.4)' }}>{p.label}</div>
                <div className="text-[9px] md:text-[11px] font-black" style={{ color: 'rgba(240,232,238,0.7)' }}>{showDash ? '-' : p.tenGodGan}</div>
              </div>
              <div className="space-y-1.5 md:space-y-3">
                <div className={cn(ganStyle.bg, ganStyle.text, 'p-2.5 md:p-6 rounded-[1.2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center border-[2px] md:border-[3px] transition-all', isDayPillar ? cn('scale-105 z-10', borderColor) : 'border-white/10 shadow-sm')}>
                  <span className="text-xl md:text-5xl font-sans font-black leading-none tracking-tight">{showDash ? '-' : p.ganKo}</span>
                </div>
                <div className={cn(zhiStyle.bg, zhiStyle.text, 'p-2.5 md:p-6 rounded-[1.2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center border-[2px] md:border-[3px] border-white/10 shadow-sm overflow-hidden relative')}>
                  {!showDash && <span className="text-xs md:text-xl absolute top-1 right-1 opacity-10">{p.zodiacIcon}</span>}
                  <span className="text-xl md:text-5xl font-sans font-black leading-none tracking-tight relative z-10">{showDash ? '-' : p.zhiKo}</span>
                </div>
              </div>
              <div className="text-center space-y-0.5 mt-1">
                <div className="text-[9px] md:text-[11px] font-black" style={{ color: 'rgba(240,232,238,0.7)' }}>{showDash ? '-' : p.tenGodZhi}</div>
                <div className="text-[8px] md:text-[10px] font-bold" style={{ color: 'rgba(240,232,238,0.4)' }}>{showDash ? '-' : p.unSeong}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 점수 게이지 (관계 유형별 테마 적용) ─────────────────────────
function ScoreGauge({
  score = 0,
  name1,
  name2,
  theme,
}: {
  score: number;
  name1?: string;
  name2?: string;
  theme: RelationTheme;
}) {
  const percentile = theme.topPercent(score);

  return (
    <div className="space-y-6 py-6 md:py-8">
      {/* 상단 아이콘 + 두 이름 */}
      <div className="flex flex-col items-center gap-3">
        <span className="text-4xl">{theme.icon}</span>
        {name1 && name2 && (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="font-black text-xl md:text-2xl" style={{ color: '#f5eef2' }}>{name1}</span>
            <div
              className="flex items-center justify-center w-9 h-9 rounded-full shadow-md"
              style={{ backgroundColor: `${theme.color}20` }}
            >
              <Heart className="w-5 h-5" style={{ color: theme.color, fill: theme.color }} />
            </div>
            <span className="font-black text-xl md:text-2xl" style={{ color: '#f5eef2' }}>{name2}</span>
          </div>
        )}
      </div>

      {/* 점수 숫자 (1.5배 확대) */}
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="relative flex items-end justify-center gap-2">
          <div
            className="absolute inset-0 blur-3xl opacity-15 rounded-full pointer-events-none"
            style={{ background: theme.color }}
          />
          <span
            className="text-[8rem] md:text-[10rem] font-black tracking-tighter leading-none relative z-10"
            style={{ color: theme.color }}
          >
            {score}
          </span>
          <span className="text-3xl font-black mb-5 relative z-10" style={{ color: `${theme.color}80` }}>
            점
          </span>
        </div>
        {/* 라벨: theme.label + theme.labelEmoji */}
        <div
          className="px-5 py-1.5 rounded-full text-sm font-black uppercase tracking-wider shadow-sm"
          style={{ backgroundColor: `${theme.color}18`, color: theme.color }}
        >
          {theme.label} {theme.labelEmoji}
        </div>
      </motion.div>

      {/* 상위 N% 문구 — theme.percentText 적용 */}
      <p className="text-center font-black text-base md:text-lg break-keep px-4" style={{ color: 'rgba(240,232,238,0.72)' }}>
        두 사람은 상위{' '}
        <span className="text-2xl md:text-3xl font-black" style={{ color: theme.color }}>
          {percentile}%
        </span>
        {theme.percentText}
      </p>

      {/* 프로그레스 바 — theme.color 통일 */}
      <div className="w-full max-w-[280px] mx-auto space-y-2">
        <div className="flex justify-between px-1">
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(240,232,238,0.4)' }}>Synergy Level</span>
          <span className="text-[9px] font-black" style={{ color: theme.color }}>{score}%</span>
        </div>
        <div
          className="h-3 w-full rounded-full overflow-hidden shadow-inner p-0.5"
          style={{ backgroundColor: `${theme.color}15`, border: `1px solid ${theme.color}20` }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="h-full rounded-full shadow-sm"
            style={{ background: `linear-gradient(to right, ${theme.color}60, ${theme.color})` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────
export default function GungHapPreview({ data }: { data: any; resultId: string }) {
  const router = useRouter();
  const { user1, user2, saju1, saju2, relation } = data;
  const aiResult = normalizeGunghapAiResult(data.aiResult);
  const score = aiResult.compatibilityScore || 0;
  const [quickCopied, setQuickCopied] = useState(false);

  // 관계 유형 테마 (작업 2·3)
  const theme = getRelationTheme(relation);

  const relationLabels: Record<string, string> = {
    friend: '친구', some: '썸남 썸녀', couple: '연인', spouse: '배우자',
    'ex-couple': '전여친 전남친', 'ex-spouse': '전아내 전남편',
    family: '부모와 자녀', siblings: '형제/자매', colleague: '직장 동료',
    partner: '사업 파트너', idol: '아이돌과 팬', etc: '기타',
  };

  // Kakao 초기화
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initKakao = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init('e91f1178e0df9d98888b7290db014a32');
      }
    };
    if (window.Kakao) initKakao();
    else {
      const script = document.createElement('script');
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
      script.onload = initKakao;
      document.head.appendChild(script);
    }
  }, []);

  const handleQuickShare = () => {
    const percentile = theme.topPercent(score);
    if (typeof window !== 'undefined' && window.Kakao?.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `${user1?.name} ♥ ${user2?.name} 궁합 결과: ${score}점!`,
          description: `두 사람은 상위 ${percentile}%의 인연! 당신의 궁합도 확인해보세요.`,
          imageUrl: 'https://images.unsplash.com/photo-1506704980455-b6d738199d75?q=80&w=1000&auto=format&fit=crop',
          link: { mobileWebUrl: window.location.href, webUrl: window.location.href },
        },
        buttons: [{ title: '나도 궁합 보기 💖', link: { mobileWebUrl: window.location.href, webUrl: window.location.href } }],
      });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setQuickCopied(true);
      setTimeout(() => setQuickCopied(false), 2000);
    }
  };

  const isUnknownTimeValue = (value: any) => {
    if (value === null || value === undefined) return false;
    if (typeof value !== 'string') return false;
    const normalized = value.trim().toLowerCase();
    return normalized === '' || normalized === 'unknown' || normalized === '모름';
  };

  const isUser1TimeUnknown = Boolean(user1?.isTimeUnknown) || isUnknownTimeValue(user1?.birthTime) || isUnknownTimeValue(user1?.time);
  const isUser2TimeUnknown = Boolean(user2?.isTimeUnknown) || isUnknownTimeValue(user2?.birthTime) || isUnknownTimeValue(user2?.time);

  const getFilteredElements = (sajuObj: any, unknown: boolean) => {
    if (!unknown) return sajuObj?.elementsCount;
    const counts: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    const ELE_MAP: Record<string, string> = { 木: '목', 火: '화', 土: '토', 金: '금', 水: '수' };
    sajuObj?.pillars?.forEach((p: any) => {
      if (p.label === '시주') return;
      if (ELE_MAP[p.ganElement]) counts[ELE_MAP[p.ganElement]]++;
      if (ELE_MAP[p.zhiElement]) counts[ELE_MAP[p.zhiElement]]++;
    });
    return counts;
  };

  const normalizedSaju1 = { ...saju1, elementsCount: getFilteredElements(saju1, isUser1TimeUnknown) };
  const normalizedSaju2 = { ...saju2, elementsCount: getFilteredElements(saju2, isUser2TimeUnknown) };
  const getDisplayTime = (user: any, unknown: boolean) =>
    unknown ? '' : (user?.birthTime || user?.time || '');

  return (
    <div className="space-y-8">

      {/* ══ 작업 1·2: 점수 카드 (관계 유형 테마 그라데이션) ══ */}
      <div
        className="relative mt-8 rounded-[2.5rem] p-[2px] overflow-hidden"
        style={{
          background: theme.gradient,
          boxShadow: `0 20px 60px ${theme.color}30, 0 8px 24px ${theme.color}1a`,
        }}
      >
        <div
          className="relative rounded-[2.4rem] p-6 md:p-10 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.color}18, rgba(18,8,16,0.92) 55%, ${theme.color}10)`,
            backdropFilter: 'blur(2px)',
          }}
        >
          {/* 배경 블롭 */}
          <div
            className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ background: theme.color }}
          />
          <div
            className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-2xl pointer-events-none opacity-10"
            style={{ background: theme.color }}
          />

          <ScoreGauge score={score} name1={user1?.name} name2={user2?.name} theme={theme} />

          {/* 헤드라인 */}
          <div className="text-center pb-2 relative z-10">
            <p className="font-black text-base md:text-lg leading-tight break-keep px-2" style={{ color: '#f5eef2' }}>
              &ldquo;{aiResult.headline || '두 사람의 운명이 선명하게 겹쳐지네요.'}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* ══ 작업 2: 점수 카드 바로 아래 공유 버튼 ══ */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleQuickShare}
          className="inline-flex items-center gap-2.5 font-black px-7 py-3.5 rounded-2xl transition-all active:scale-95 text-sm"
          style={{ border: `2px solid ${theme.color}40`, background: 'rgba(255,255,255,0.04)', color: '#f5eef2' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${theme.color}80`)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${theme.color}40`)}
        >
          {quickCopied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-green-600">링크가 복사됐어요!</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4 text-[#3C1E1E]" style={{ fill: '#FEE500', stroke: '#3C1E1E' }} />
              💌 이 궁합 결과 공유하기
            </>
          )}
        </button>
        <p className="text-[10px] font-bold" style={{ color: 'rgba(240,232,238,0.34)' }}>카카오톡 공유 또는 링크 복사</p>
      </div>

      {/* 이름 + 관계 인포 카드 */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {[
          { label: '나', user: user1, saju: normalizedSaju1, unknown: isUser1TimeUnknown },
          { label: '그대', user: user2, saju: normalizedSaju2, unknown: isUser2TimeUnknown },
        ].map((item, idx) => (
          <div key={idx} className="p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] space-y-3 md:space-y-4" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(232,130,154,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.22)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn('w-2 h-2 rounded-full', idx === 0 ? 'bg-blue-400' : 'bg-pink-400')} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(240,232,238,0.4)' }}>{item.label}</span>
              </div>
              <span className="text-[10px] font-black" style={{ color: 'rgba(240,232,238,0.7)' }}>{item.saju.dayGanKo}일간</span>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold" style={{ color: '#f5eef2' }}>{item.user.name}</p>
              <p className="text-[10px] font-bold" style={{ color: 'rgba(240,232,238,0.34)' }}>
                {item.user.birthDate} {getDisplayTime(item.user, item.unknown)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 py-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(232,130,154,0.12)' }}>
        <Heart className="w-5 h-5 fill-current" style={{ color: '#e8829a' }} />
        <span className="font-bold leading-none mt-0.5" style={{ color: '#f5eef2' }}>
          관계: {relationLabels[relation] || '궁합'}
        </span>
      </div>

      {/* ══ 작업 3: 두 만세력 연결 비주얼 ══ */}
      <div
        className="p-5 sm:p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.025)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(212,104,138,0.14)',
          boxShadow: '0 8px 40px rgba(212,104,138,0.08), 0 1px 0 rgba(255,255,255,0.04) inset',
        }}
      >
        {/* 섹션 헤더 */}
        <div className="text-center space-y-1 mb-8">
          <h3 className="text-2xl font-bold tracking-tight" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>영혼의 설계도 대조</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(212,104,138,0.4)' }}>Manseyrok Comparison</p>
        </div>

        {/* "두 사람의 사주" 페어 컨테이너 */}
        <div
          className="rounded-[1.5rem] md:rounded-[2rem] overflow-hidden"
          style={{ background: 'linear-gradient(180deg, rgba(157,143,255,0.06) 0%, rgba(255,255,255,0.01) 40%, rgba(255,255,255,0.01) 60%, rgba(212,104,138,0.06) 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* 상단 레이블 */}
          <div className="flex items-center justify-center gap-2 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(240,232,238,0.5)' }}>두 사람의 사주</span>
            <div className="w-2 h-2 rounded-full bg-pink-400" />
          </div>

          <div className="p-5 md:p-8 space-y-10 md:space-y-14">
            {/* 첫 번째 만세력 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span className="text-xs font-black text-blue-500 uppercase tracking-widest">{user1?.name}</span>
              </div>
              <PillarChart
                pillars={normalizedSaju1.pillars}
                themeColor="blue"
                isTimeUnknown={isUser1TimeUnknown}
              />
            </div>

            {/* 중앙 연결 구분선 (♥ 인연 분석) */}
            <div className="flex items-center justify-center gap-3 relative">
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(212,104,138,0.3), rgba(212,104,138,0.15))' }} />
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full" style={{ background: 'rgba(232,130,154,0.10)', border: '1px solid rgba(232,130,154,0.2)' }}>
                <Heart className="w-3.5 h-3.5" style={{ color: '#e8829a', fill: '#e8829a' }} />
                <span className="text-[11px] font-black tracking-wider" style={{ color: '#e8829a' }}>인연 분석</span>
                <Heart className="w-3.5 h-3.5" style={{ color: '#e8829a', fill: '#e8829a' }} />
              </div>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(157,143,255,0.3), rgba(157,143,255,0.15))' }} />
            </div>

            {/* 두 번째 만세력 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                <span className="text-xs font-black text-pink-500 uppercase tracking-widest">{user2?.name}</span>
              </div>
              <PillarChart
                pillars={normalizedSaju2.pillars}
                themeColor="pink"
                isTimeUnknown={isUser2TimeUnknown}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ══ 작업 4: 리포트 섹션 (AnalysisAccordion 재사용 — 더 보기 토글 포함) ══ */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 ml-2">
          <Moon className="w-6 h-6" style={{ color: '#d4688a', fill: '#d4688a' }} />
          <h3 className="text-2xl font-bold" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>운명적인 인연의 리포트</h3>
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {(() => {
            const storySection = aiResult.sections.find(
              (s) => s.title.includes('인스타 스토리') || s.title.includes('스토리 요약')
            );
            const accordionSections = aiResult.sections.filter((s) => s !== storySection);
            return (
              <>
                <RelationBriefingPanel sections={accordionSections} theme={theme} />
                <AnalysisAccordion data={accordionSections} />
                {storySection && (
                  <InstaStoryButton
                    userName={`${user1.name} & ${user2.name}`}
                    summaryContent={storySection.content}
                    type="gunghap"
                    relation={relation}
                  />
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* 타로 리딩 CTA */}
      <div
        className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-center space-y-4"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(157,143,255,0.14)', boxShadow: '0 4px 32px rgba(157,143,255,0.05), 0 1px 0 rgba(255,255,255,0.04) inset' }}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(157,143,255,0.6)' }}>타로 리딩</p>
        <h4 className="text-xl font-bold break-keep" style={{ color: '#f5eef2' }}>
          지금 두 사람의 에너지, 카드로 확인해볼까요?
        </h4>
        <p className="text-sm break-keep max-w-sm mx-auto" style={{ color: 'rgba(240,232,238,0.42)' }}>
          궁합을 확인했다면, 타로로 오늘의 관계 흐름과 메시지를 읽어보세요.
        </p>
        <button
          onClick={() => router.push('/tarot')}
          className="text-white px-8 py-4 rounded-2xl font-black text-base transition-all active:scale-95 inline-flex items-center gap-2 hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--tarot-500, #7F77DD), var(--tarot-800, #4b44a8))', boxShadow: '0 8px 24px rgba(127,119,221,0.3)' }}
        >
          🔮 타로 리딩 하기
        </button>
      </div>

      {/* 하단 공유 버튼 */}
      <div
        className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-center"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(232,130,154,0.12)' }}
      >
        <ShareButtons name={`${user1.name} & ${user2.name}`} />
      </div>
    </div>
  );
}

declare global {
  interface Window {
    Kakao: any;
  }
}
