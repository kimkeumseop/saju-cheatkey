'use client';

import { useEffect, useState, use, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import CosmicBackground from '@/components/CosmicBackground';
import AnalysisAccordion from '@/components/AnalysisAccordion';
import ShareButtons from '@/components/ShareButtons';
import InstaStoryButton from '@/components/InstaStoryButton';
import GungHapPreview from '@/components/GungHapPreview';
import GungHapInputModal from '@/components/GungHapInputModal';
import LoginModal from '@/components/LoginModal';
import { Loader2, BarChart3, Star, History, Moon, Heart, CircleDollarSign, AlertTriangle, CheckCircle2, CalendarDays, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { ELEMENT_STYLE } from '@/lib/saju';
import { normalizeSajuAiResult } from '@/lib/ai-result';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getSafeColor = (elementKey: string) => {
  return ELEMENT_STYLE[elementKey] || { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-100', color: '#999999' };
};

// ── 나이 계산 ────────────────────────────────────────────────────
function calcAge(birthDate: string): number {
  if (!birthDate) return 25;
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return 25;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}

// ── 만세력 차트 ──────────────────────────────────────────────────
function PillarChart({ pillars, title, isTimeUnknown }: { pillars: any[]; title?: string; isTimeUnknown?: boolean }) {
  return (
    <div className="space-y-6">
      {title && <h4 className="text-center font-bold text-lg" style={{ color: '#f5eef2' }}>{title}</h4>}
      <div className="grid grid-cols-4 gap-2 md:gap-4 relative z-10">
        {pillars.map((p: any, colIdx: number) => {
          const isDayPillar = p.label === '일주';
          const isTimePillar = p.label === '시주';
          const forceHide = isTimePillar && isTimeUnknown;
          const showDash = p.isUnknown || forceHide;
          const ganStyle = p.ganColor || getSafeColor(p.ganElement);
          const zhiStyle = p.zhiColor || getSafeColor(p.zhiElement);

          return (
            <div key={colIdx} className="space-y-3">
              <div className="text-center space-y-1">
                <div className="text-[10px] font-black tracking-tighter uppercase" style={{ color: 'rgba(232,130,154,0.55)' }}>{p.label}</div>
                <div className="text-[11px] font-black" style={{ color: 'rgba(240,232,238,0.7)' }}>{showDash ? '-' : p.tenGodGan}</div>
              </div>
              <div className="space-y-2 md:space-y-4">
                <div className={cn('relative transition-all duration-500', isDayPillar ? 'scale-105 z-20' : '')}>
                  <div className={cn(ganStyle.bg, ganStyle.text, 'p-3 md:p-8 rounded-[1.5rem] md:rounded-[3rem] flex flex-col items-center justify-center border-[2px] md:border-[4px]', isDayPillar ? 'border-[#e8829a] shadow-xl shadow-[#e8829a]/30' : 'border-white/10 shadow-sm')}>
                    <span className="text-2xl md:text-7xl font-sans font-black leading-none tracking-tight">{showDash ? '-' : p.ganKo}</span>
                  </div>
                </div>
                <div className="relative transition-all duration-500">
                  <div className={cn(zhiStyle.bg, zhiStyle.text, 'p-3 md:p-8 rounded-[1.5rem] md:rounded-[3rem] flex flex-col items-center justify-center border-[2px] md:border-[4px] border-white/10 shadow-sm overflow-hidden relative')}>
                    {!showDash && <span className="text-xl absolute top-1 right-1 opacity-20">{p.zodiacIcon}</span>}
                    <span className="text-2xl md:text-7xl font-sans font-black leading-none tracking-tight relative z-10">{showDash ? '-' : p.zhiKo}</span>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-1 mt-2">
                <div className="text-[11px] font-black" style={{ color: 'rgba(240,232,238,0.7)' }}>{showDash ? '-' : p.tenGodZhi}</div>
                <div className="text-[10px] font-bold" style={{ color: 'rgba(240,232,238,0.4)' }}>{showDash ? '-' : p.unSeong}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 오행 분포 차트 ────────────────────────────────────────────────
function ElementsChart({ counts }: { counts: any }) {
  const elements = [
    { label: '목', key: '木', color: getSafeColor('木').color, bg: 'bg-[#E8F5E9]' },
    { label: '화', key: '火', color: getSafeColor('火').color, bg: 'bg-[#FFEBEE]' },
    { label: '토', key: '土', color: getSafeColor('土').color, bg: 'bg-[#FFF8E1]' },
    { label: '금', key: '金', color: getSafeColor('金').color, bg: 'bg-[#FAFAFA]' },
    { label: '수', key: '水', color: getSafeColor('水').color, bg: 'bg-[#E3F2FD]' },
  ];
  const total = Object.values(counts).reduce((a: any, b: any) => a + b, 0) as number;
  return (
    <div className="grid grid-cols-5 gap-2">
      {elements.map((el) => {
        const count = counts[el.key] || counts[el.label] || 0;
        const percent = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={el.key} className={cn(el.bg, 'p-3 rounded-2xl space-y-2 border border-white/50 text-center')}>
            <span className="text-[10px] font-black text-gray-500">{el.label}</span>
            <div className="h-1.5 w-full bg-white/50 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${percent}%`, backgroundColor: el.color }} />
            </div>
            <span className="text-xs font-black" style={{ color: el.color }}>{count}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── 오행 정보 ────────────────────────────────────────────────────
const ELEMENT_INFO: Record<string, { emoji: string; keyword: string; desc: string }> = {
  '木': { emoji: '🌱', keyword: '성장', desc: '새로운 시작과 성장의 에너지' },
  '火': { emoji: '🔥', keyword: '열정', desc: '확산하는 에너지와 빛나는 열정' },
  '土': { emoji: '⛰️', keyword: '안정', desc: '든든한 기반과 중심의 안정' },
  '金': { emoji: '💎', keyword: '결실', desc: '단호한 결단과 빛나는 결실' },
  '水': { emoji: '💧', keyword: '지혜', desc: '깊은 통찰과 유연한 지혜' },
};

const KO_TO_ZH: Record<string, string> = { '목': '木', '화': '火', '토': '土', '금': '金', '수': '水' };

type BriefingSection = {
  title: string;
  content: string;
};

function normalizeContentLines(content = '') {
  return content
    .replace(/\\n\\n/g, '\n\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function cleanInsightLine(line: string) {
  return line
    .replace(/^#+\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/^[✅📌💡💰💸⚠️🔥✨🌱🌊🌙⭐️⭐\-*•\d.)\s]+/u, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function findReportSection(sections: BriefingSection[], titleWords: string[], contentWords: string[] = []) {
  return sections.find((section) => {
    const title = section.title.replace(/\s/g, '');
    const content = section.content.replace(/\s/g, '');
    return titleWords.some((word) => title.includes(word.replace(/\s/g, ''))) ||
      contentWords.some((word) => content.includes(word.replace(/\s/g, '')));
  });
}

function getUsefulLines(section: BriefingSection | undefined, max = 3) {
  if (!section) return [];
  return normalizeContentLines(section.content)
    .map(cleanInsightLine)
    .filter((line) => line.length >= 8 && !line.includes('가지') && !line.endsWith(':'))
    .slice(0, max);
}

function getBlockLines(section: BriefingSection | undefined, startWords: string[], stopWords: string[], max = 3) {
  if (!section) return [];
  const lines = normalizeContentLines(section.content);
  const startIndex = lines.findIndex((line) => startWords.some((word) => line.includes(word)));
  const scanLines = startIndex >= 0 ? lines.slice(startIndex + 1) : lines;
  const picked: string[] = [];

  for (const rawLine of scanLines) {
    const isNextBlock = picked.length > 0 && stopWords.some((word) => rawLine.includes(word));
    if (isNextBlock) break;

    const line = cleanInsightLine(rawLine);
    if (!line || line.length < 8 || startWords.some((word) => line.includes(word))) continue;
    if (line.endsWith(':')) continue;

    picked.push(line);
    if (picked.length >= max) break;
  }

  return picked;
}

function extractMonths(lines: string[]) {
  const months = new Set<number>();
  lines.forEach((line) => {
    const matches = line.matchAll(/(\d{1,2})\s*월/g);
    Array.from(matches).forEach((match) => {
      const month = Number(match[1]);
      if (month >= 1 && month <= 12) months.add(month);
    });
  });
  return months;
}

function isLowPrioritySajuSection(section: BriefingSection) {
  const title = section.title.replace(/\s/g, '');
  return title.includes('연애운') ||
    title.includes('인간관계') ||
    title.includes('인연이머무는곳') ||
    title.includes('관계의비결');
}

function SajuBriefingPanel({ sections, userName, currentYear }: { sections: BriefingSection[]; userName: string; currentYear: number }) {
  const daeyunSection = findReportSection(sections, ['향후대운10년돈타이밍', '대운10년돈타이밍'], ['대박 가능 구간', '손실 주의 구간']);
  const moneyTimingSection = findReportSection(sections, [`${currentYear}년돈이움직이는시기표`, '돈이움직이는시기표', '돈들어오는시기'], ['돈이 들어오기 쉬운 구간', '지출과 손실']);
  const wealthSection = findReportSection(sections, ['재물운', '지갑', '돈'], ['재물 포인트', '수입']);
  const yearSection = findReportSection(sections, [`${currentYear}년`, '운세흐름', '럭키포인트']);
  const natureSection = findReportSection(sections, ['기질', '본성', '진짜모습']);

  const daeyunJackpotLines = getBlockLines(
    daeyunSection,
    ['대박 가능 구간', '승부'],
    ['돈이 쌓이는 구간', '손실 주의 구간', '인생 의사결정'],
    2
  );
  const daeyunCautionLines = getBlockLines(
    daeyunSection,
    ['손실 주의 구간', '주의'],
    ['인생 의사결정', '대박 가능 구간', '돈이 쌓이는 구간'],
    2
  );
  const daeyunDecisionLines = getBlockLines(
    daeyunSection,
    ['인생 의사결정 포인트', '의사결정'],
    ['대박 가능 구간', '돈이 쌓이는 구간', '손실 주의 구간'],
    3
  );

  const opportunityLines = getBlockLines(
    moneyTimingSection,
    ['돈이 들어오기 쉬운', '기회가 커지는', '승부 구간'],
    ['대박을 노려볼', '지출과 손실', '조심할 구간', '바로 할 일'],
    3
  );
  const cautionLines = getBlockLines(
    moneyTimingSection,
    ['지출과 손실', '조심할 구간', '주의'],
    ['바로 할 일', '돈이 들어오기', '대박을 노려볼'],
    3
  );
  const actionLines = getBlockLines(
    moneyTimingSection,
    ['바로 할 일', '지금 할 일', '액션'],
    ['돈이 들어오기', '지출과 손실', '대박을 노려볼'],
    3
  );
  const winLines = getBlockLines(
    moneyTimingSection,
    ['대박을 노려볼', '승부 구간', '승부 방식'],
    ['지출과 손실', '조심할 구간', '바로 할 일'],
    2
  );

  const moneyFallback = getUsefulLines(wealthSection, 3);
  const yearFallback = getUsefulLines(yearSection, 3);
  const natureFallback = getUsefulLines(natureSection, 2);

  const opportunities = opportunityLines.length > 0 ? opportunityLines : (moneyFallback.length > 0 ? moneyFallback : yearFallback);
  const cautions = cautionLines.length > 0 ? cautionLines : yearFallback.slice(0, 3);
  const actions = actionLines.length > 0 ? actionLines : [
    `${currentYear}년 일정표에 수입 목표와 큰 지출 예정일을 먼저 적어두세요.`,
    '돈이 움직이는 달에는 제안, 협상, 계약 조건을 한 번 더 확인하세요.',
    '조심 구간에는 충동 지출보다 정산과 기록을 우선해보세요.',
  ];
  const wins = winLines.length > 0 ? winLines : [
    '한 번에 크게 베팅하기보다 이미 가진 강점을 수입 루트로 바꾸는 방식이 좋아요.',
    '협상, 성과 정리, 부업 테스트처럼 결과가 숫자로 남는 움직임에 힘을 주세요.',
  ];
  const daeyunWins = daeyunJackpotLines.length > 0 ? daeyunJackpotLines : wins;
  const daeyunRisks = daeyunCautionLines.length > 0 ? daeyunCautionLines : cautions.slice(0, 2);
  const daeyunDecisions = daeyunDecisionLines.length > 0 ? daeyunDecisionLines : actions;

  const opportunityMonths = extractMonths(opportunities);
  const cautionMonths = extractMonths(cautions);
  const hasMonthSignals = opportunityMonths.size > 0 || cautionMonths.size > 0;
  const quickHeadline = natureFallback[0] || `${userName}님의 올해는 방향을 넓히기보다 돈과 에너지가 새는 곳을 먼저 잡는 쪽이 유리해요.`;

  const monthTone = (month: number) => {
    if (opportunityMonths.has(month)) return { label: '기회', color: '#00d18f', bg: 'rgba(0,209,143,0.10)', border: 'rgba(0,209,143,0.26)' };
    if (cautionMonths.has(month)) return { label: '주의', color: '#ffb86b', bg: 'rgba(255,184,107,0.10)', border: 'rgba(255,184,107,0.28)' };
    return { label: '점검', color: 'rgba(240,232,238,0.38)', bg: 'rgba(255,255,255,0.025)', border: 'rgba(255,255,255,0.08)' };
  };

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between gap-4 px-1">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: '#00d18f' }}>
            <TrendingUp className="w-4 h-4" />
            First Check
          </div>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight break-keep" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>
            먼저 보는 핵심 브리핑
          </h3>
          <p className="text-sm md:text-base font-medium leading-relaxed break-keep max-w-2xl" style={{ color: 'rgba(240,232,238,0.58)' }}>
            {quickHeadline}
          </p>
        </div>
        <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: 'rgba(0,209,143,0.10)', border: '1px solid rgba(0,209,143,0.22)' }}>
          <CircleDollarSign className="w-6 h-6" style={{ color: '#00d18f' }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <BriefingCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="대운"
          title="향후 10년 승부 구간"
          lines={daeyunWins}
          accent="#9d8fff"
        />
        <BriefingCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="대운 주의"
          title="크게 새기 쉬운 구간"
          lines={daeyunRisks}
          accent="#ffb86b"
        />
        <BriefingCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="결정"
          title="인생 의사결정 포인트"
          lines={daeyunDecisions}
          accent="#e8829a"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <BriefingCard
          icon={<CircleDollarSign className="w-5 h-5" />}
          label="돈"
          title={`${currentYear}년 들어오기 쉬운 구간`}
          lines={opportunities}
          accent="#00d18f"
        />
        <BriefingCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="주의"
          title="새기 쉬운 구간"
          lines={cautions}
          accent="#ffb86b"
        />
        <BriefingCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="액션"
          title="지금 바로 할 일"
          lines={actions}
          accent="#e8829a"
        />
      </div>

      {hasMonthSignals && (
        <div className="rounded-[2rem] p-5 md:p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" style={{ color: '#9d8fff' }} />
            <h4 className="text-lg font-bold" style={{ color: '#f5eef2' }}>{currentYear} 돈 타이밍</h4>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
            {Array.from({ length: 12 }, (_, index) => {
              const month = index + 1;
              const tone = monthTone(month);
              return (
                <div
                  key={month}
                  className="min-h-16 rounded-2xl border px-2 py-3 text-center flex flex-col items-center justify-center gap-1"
                  style={{ background: tone.bg, borderColor: tone.border }}
                >
                  <span className="text-sm font-black" style={{ color: '#f5eef2' }}>{month}월</span>
                  <span className="text-[10px] font-black" style={{ color: tone.color }}>{tone.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <BriefingCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="승부"
          title="대박을 노려볼 방식"
          lines={wins}
          accent="#9d8fff"
        />
        <BriefingCard
          icon={<CalendarDays className="w-5 h-5" />}
          label="올해"
          title={`${currentYear}년에 특히 볼 것`}
          lines={yearFallback.length > 0 ? yearFallback : actions}
          accent="#e8829a"
        />
      </div>
    </section>
  );
}

function BriefingCard({ icon, label, title, lines, accent }: { icon: ReactNode; label: string; title: string; lines: string[]; accent: string }) {
  return (
    <article
      className="rounded-[2rem] p-5 md:p-6 min-h-[13rem] flex flex-col gap-4"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${accent}33`,
        boxShadow: `0 8px 32px ${accent}12, 0 1px 0 rgba(255,255,255,0.04) inset`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl flex items-center justify-center" style={{ background: `${accent}18`, color: accent }}>
            {icon}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: accent }}>{label}</span>
        </div>
      </div>
      <h4 className="text-lg font-bold leading-snug break-keep" style={{ color: '#f5eef2' }}>{title}</h4>
      <div className="space-y-2.5">
        {lines.slice(0, 3).map((line, index) => (
          <p key={`${title}-${index}`} className="text-[13px] md:text-sm font-medium leading-relaxed break-keep" style={{ color: 'rgba(240,232,238,0.64)' }}>
            <span className="font-black" style={{ color: accent }}>{index + 1}. </span>
            {line}
          </p>
        ))}
      </div>
    </article>
  );
}

// ── 결과 페이지 ──────────────────────────────────────────────────
export default function SajuResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDaeunIdx, setSelectedDaeunIdx] = useState<number | null>(null);
  const [isGungHapModalOpen, setIsGungHapModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => { window.location.href = '/'; };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let fetchedData = null;
        if (id.startsWith('local_')) {
          const localData = localStorage.getItem(`saju_result_${id}`);
          if (localData) fetchedData = JSON.parse(localData);
        } else {
          const docSnap = await getDoc(doc(db, 'sajuResults', id));
          if (docSnap.exists()) fetchedData = docSnap.data();
        }
        if (fetchedData) {
          setData(fetchedData);
          // 실제 생년월일로 현재 대운 찾기
          const userAge = fetchedData.birthDate ? calcAge(fetchedData.birthDate) : 25;
          const daeunList: any[] = fetchedData.sajuData?.daYun || [];
          const currentIdx = daeunList.findIndex((dy: any, i: number) => {
            const nextAge = daeunList[i + 1]?.age ?? 100;
            return userAge >= dy.age && userAge < nextAge;
          });
          setSelectedDaeunIdx(currentIdx !== -1 ? currentIdx : 0);
        } else {
          router.push('/');
        }
      } catch (error) {
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, router]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: '#0d0710' }}>
      <Loader2 className="w-12 h-12 animate-spin stroke-[3]" style={{ color: '#e8829a' }} />
      <p className="mt-4 font-bold" style={{ color: 'rgba(232,130,154,0.7)' }}>운명의 속삭임을 듣는 중...</p>
    </div>
  );

  if (!data) return null;

  const isCompatibility = data.type === 'compatibility';
  const saju = isCompatibility ? data.saju1 : data.sajuData;
  const isTimeUnknown = data.birthTime === 'unknown' || !data.birthTime;

  const getFilteredElements = (sajuObj: any, unknown: boolean) => {
    if (!unknown) return sajuObj.elementsCount;
    const counts: Record<string, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
    const ELE_MAP: Record<string, string> = { '木': '목', '火': '화', '土': '토', '金': '금', '水': '수' };
    sajuObj.pillars.forEach((p: any) => {
      if (p.label === '시주') return;
      if (ELE_MAP[p.ganElement]) counts[ELE_MAP[p.ganElement]]++;
      if (ELE_MAP[p.zhiElement]) counts[ELE_MAP[p.zhiElement]]++;
    });
    return counts;
  };

  const filteredElements = saju ? getFilteredElements(saju, isTimeUnknown) : null;

  // 주도 오행 키워드 (헤더 서브타이틀용)
  const dominantElementInfo = filteredElements ? (() => {
    const sorted = Object.entries(filteredElements as Record<string, number>).sort(([, a], [, b]) => b - a);
    const topKey = sorted[0]?.[0];
    const zhKey = KO_TO_ZH[topKey] || topKey;
    return ELEMENT_INFO[zhKey] || null;
  })() : null;

  // 현재 대운 인덱스 (스타일 강조용)
  const userAge = data.birthDate ? calcAge(data.birthDate) : 25;
  const daeunList: any[] = saju?.daYun || [];
  const currentDaeunIdx = daeunList.findIndex((dy: any, i: number) => {
    const nextAge = daeunList[i + 1]?.age ?? 100;
    return userAge >= dy.age && userAge < nextAge;
  });
  const currentYear = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', year: 'numeric' }).format(new Date()));

  const handleGungHapClick = () => {
    if (user) setIsGungHapModalOpen(true);
    else setIsLoginModalOpen(true);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden pt-24 pb-32 px-3 sm:px-4 md:px-6" style={{ background: '#0d0710' }}>
      <CosmicBackground />
      <Navbar dark />
      <div className="relative z-10 max-w-4xl mx-auto space-y-12">
        {isCompatibility ? (
          <GungHapPreview data={{ ...data, isPaid: true }} resultId={id} />
        ) : (
          <div className="space-y-12">

            {/* ══ 작업 1: 헤더 카피 개선 ══ */}
            <div className="text-center space-y-5">
              <div
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold"
                style={{ background: 'rgba(232,130,154,0.10)', border: '1px solid rgba(232,130,154,0.20)', color: '#e8829a' }}
              >
                <Moon className="w-4 h-4" style={{ fill: '#e8829a', color: '#e8829a' }} />
                신비로운 영혼의 리포트
              </div>
              <div className="space-y-3">
                <h1 className="font-bold tracking-tight break-keep leading-tight text-3xl md:text-5xl" style={{ fontFamily: '"Noto Serif KR", serif' }}>
                  <span style={{ background: 'linear-gradient(135deg, #e8829a 0%, #c49fff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{data.userName}</span>
                  <span style={{ color: 'rgba(245,238,242,0.92)' }}>, 당신이 아직 모르는</span>
                  <br />
                  <span style={{ color: '#f5eef2' }}>진짜 자신</span>
                </h1>
                {dominantElementInfo && (
                  <p className="font-bold text-sm md:text-base" style={{ color: 'rgba(232,130,154,0.8)' }}>
                    {dominantElementInfo.emoji} 핵심 기운 ·{' '}
                    <span className="font-black" style={{ color: '#e8829a' }}>{dominantElementInfo.keyword}</span>
                    {' '}— {dominantElementInfo.desc}
                  </p>
                )}
                <p className="text-xs font-bold italic" style={{ color: 'rgba(240,232,238,0.34)' }}>
                  {data.birthDate}
                  {data.birthTime && data.birthTime !== 'unknown' ? ` ${data.birthTime}` : ''}
                </p>
              </div>
            </div>

            {/* 만세력 설계도 */}
            <div
              className="p-5 sm:p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-10 relative overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.025)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(232,130,154,0.14)',
                boxShadow: '0 8px 40px rgba(232,130,154,0.08), 0 1px 0 rgba(255,255,255,0.04) inset',
              }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32" style={{ background: 'rgba(232,130,154,0.10)' }} />
              <div className="text-center space-y-1 relative z-10">
                <h3 className="text-2xl font-bold tracking-tight" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>인생 설계도 (만세력)</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(232,130,154,0.4)' }}>Manseyrok INFOGRAPHIC</p>
              </div>
              {saju && <PillarChart pillars={saju.pillars} isTimeUnknown={isTimeUnknown} />}
              <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8" style={{ borderTop: '1px solid rgba(232,130,154,0.10)' }}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 ml-1">
                    <BarChart3 className="w-4 h-4" style={{ color: '#e8829a' }} />
                    <span className="text-sm font-bold" style={{ color: 'rgba(240,232,238,0.8)' }}>오행 분포</span>
                  </div>
                  {filteredElements && <ElementsChart counts={filteredElements} />}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 ml-1">
                    <Star className="w-4 h-4" style={{ color: '#e8829a' }} />
                    <span className="text-sm font-bold" style={{ color: 'rgba(240,232,238,0.8)' }}>핵심 귀인 & 신살</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {saju?.keyShinsal?.map((s: string) => (
                      <div key={s} className="px-4 py-2 rounded-2xl text-[11px] font-black" style={{ background: 'rgba(232,130,154,0.12)', color: '#e8829a', border: '1px solid rgba(232,130,154,0.22)' }}>
                        #{s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ══ 작업 5: 대운 세로 타임라인 ══ */}
            <div
              className="p-5 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-8 relative overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.025)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(157,143,255,0.12)',
                boxShadow: '0 8px 40px rgba(157,143,255,0.06), 0 1px 0 rgba(255,255,255,0.04) inset',
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5" style={{ color: '#9d8fff' }} />
                  <h3 className="text-xl font-bold" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>대운 (10년 주기의 흐름)</h3>
                </div>
                <p className="text-[13px] font-medium leading-relaxed ml-7 break-keep" style={{ color: 'rgba(240,232,238,0.42)' }}>
                  대운(大運)은 내 인생의 계절이 바뀌는 시점입니다. 각 시기를 눌러 에너지를 확인해보세요.
                </p>
              </div>

              <div className="relative space-y-2">
                {/* 세로 타임라인 선 */}
                <div className="absolute left-[1.2rem] top-5 bottom-5 w-0.5 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(157,143,255,0.05), rgba(157,143,255,0.4), rgba(157,143,255,0.05))' }} />

                {daeunList.map((dy: any, idx: number) => {
                  const isCurrent = currentDaeunIdx === idx;
                  const isSelected = selectedDaeunIdx === idx;
                  const ganInfo = ELEMENT_INFO[dy.ganElement] || { emoji: '✨', keyword: '기운', desc: '' };
                  const zhiInfo = ELEMENT_INFO[dy.zhiElement] || { emoji: '✨', keyword: '기운', desc: '' };
                  const ganStyle = dy.ganColor || getSafeColor(dy.ganElement);
                  const zhiStyle = dy.zhiColor || getSafeColor(dy.zhiElement);

                  return (
                    <div key={idx} className="flex items-start gap-3 relative">
                      {/* 타임라인 도트 */}
                      <div className={cn(
                        'relative z-10 mt-3.5 w-10 h-10 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300',
                        isCurrent
                          ? 'border-[#9d8fff] shadow-lg shadow-[#9d8fff]/40 scale-110'
                          : 'border-white/15'
                      )} style={{ background: '#160c1a' }}>
                        {isCurrent ? (
                          <div className="w-4 h-4 rounded-full" style={{ background: '#9d8fff' }} />
                        ) : (
                          <span className="text-[10px] font-black text-white/30">{idx + 1}</span>
                        )}
                      </div>

                      {/* 카드 버튼 */}
                      <button
                        onClick={() => setSelectedDaeunIdx(isSelected ? null : idx)}
                        className="flex-1 text-left rounded-[1.5rem] border p-4 transition-all duration-300 mb-2"
                        style={
                          isCurrent
                            ? { borderColor: 'rgba(157,143,255,0.4)', background: 'linear-gradient(135deg, rgba(157,143,255,0.14), rgba(255,255,255,0.02))', boxShadow: '0 4px 20px rgba(157,143,255,0.12)' }
                            : isSelected
                            ? { borderColor: 'rgba(157,143,255,0.28)', background: 'rgba(255,255,255,0.04)' }
                            : { borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }
                        }
                      >
                        {/* 카드 상단 행 */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black" style={{ color: isCurrent ? '#9d8fff' : 'rgba(240,232,238,0.42)' }}>
                              {dy.age}세~
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 text-[10px] font-black rounded-full leading-none" style={{ background: 'rgba(157,143,255,0.18)', color: '#9d8fff' }}>
                                현재
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <div className={cn(ganStyle.bg, ganStyle.text, 'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shadow-sm border border-white/10')}>
                              {dy.ganKo}
                            </div>
                            <div className={cn(zhiStyle.bg, zhiStyle.text, 'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shadow-sm border border-white/10')}>
                              {dy.zhiKo}
                            </div>
                          </div>
                        </div>

                        {/* 키워드 행 */}
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium" style={{ color: 'rgba(240,232,238,0.5)' }}>{ganInfo.emoji} {ganInfo.keyword}</span>
                          <span className="text-xs" style={{ color: 'rgba(240,232,238,0.25)' }}>+</span>
                          <span className="text-xs font-medium" style={{ color: 'rgba(240,232,238,0.5)' }}>{zhiInfo.emoji} {zhiInfo.keyword}</span>
                        </div>

                        {/* 선택 시 상세 설명 (툴팁 패널) */}
                        {isSelected && (
                          <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: '1px solid rgba(157,143,255,0.16)' }}>
                            <p className="text-sm font-bold break-keep leading-relaxed" style={{ color: 'rgba(245,238,242,0.82)' }}>
                              &ldquo;<span style={{ color: '#9d8fff' }}>{ganInfo.keyword}</span>&rdquo;를 바탕으로{' '}
                              &ldquo;<span style={{ color: '#9d8fff' }}>{zhiInfo.keyword}</span>&rdquo;을 꽃피우는 시기
                            </p>
                            <p className="text-xs" style={{ color: 'rgba(240,232,238,0.4)' }}>
                              {dy.age}세부터 10년간 흐르는 주된 에너지 · {ganInfo.desc} / {zhiInfo.desc}
                            </p>
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 핵심 브리핑 + 상세 리포트 */}
            <div className="space-y-10 relative">
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {(() => {
                  const result = normalizeSajuAiResult(data.aiResult);
                  const storySection = result.sections.find(
                    (s) => s.title.includes('인스타 스토리') || s.title.includes('스토리 요약')
                  );
                  const accordionSections = result.sections.filter((s) => s !== storySection && !isLowPrioritySajuSection(s));
                  return (
                    <>
                      <SajuBriefingPanel
                        sections={accordionSections}
                        userName={data.userName}
                        currentYear={currentYear}
                      />
                      <div className="space-y-8 pt-2">
                        <div className="flex items-center gap-3 ml-2">
                          <Moon className="w-6 h-6" style={{ color: '#e8829a', fill: '#e8829a' }} />
                          <h3 className="text-2xl font-bold" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>상세 리포트</h3>
                        </div>
                        <AnalysisAccordion data={accordionSections} />
                      </div>
                      {storySection && (
                        <InstaStoryButton
                          userName={data.userName}
                          summaryContent={storySection.content}
                          type="saju"
                        />
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* ══ 작업 4: 공유/바이럴 CTA ══ */}
            <div
              className="p-8 rounded-[2.5rem] space-y-8"
              style={{
                background: 'rgba(255,255,255,0.025)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(232,130,154,0.12)',
                boxShadow: '0 4px 32px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.04) inset',
              }}
            >
              {/* 친구 궁합 보기 CTA */}
              <div className="text-center space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(232,130,154,0.5)' }}>더 알아보기</p>
                <h4 className="text-xl font-bold break-keep" style={{ color: '#f5eef2' }}>
                  소중한 인연과의 궁합도 확인해보세요
                </h4>
                <p className="text-sm break-keep max-w-sm mx-auto" style={{ color: 'rgba(240,232,238,0.42)' }}>
                  나의 사주를 확인했다면, 운명의 파트너와의 에너지 궁합을 함께 살펴보세요.
                </p>
                <button
                  onClick={handleGungHapClick}
                  className="text-white px-8 py-4 rounded-2xl font-bold text-base transition-all active:scale-95 inline-flex items-center gap-2 hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg, #d4688a, #9e1c4e)', boxShadow: '0 4px 24px rgba(212,104,138,0.32), 0 1px 0 rgba(255,255,255,0.16) inset' }}
                >
                  <Heart className="w-5 h-5 fill-white" />
                  운명 궁합 보기
                </button>
              </div>

              <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)' }} />

              {/* 타로 리딩 CTA */}
              <div className="text-center space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(157,143,255,0.6)' }}>타로 리딩</p>
                <h4 className="text-xl font-bold break-keep" style={{ color: '#f5eef2' }}>
                  지금 이 순간, 카드가 건네는 메시지
                </h4>
                <p className="text-sm break-keep max-w-sm mx-auto" style={{ color: 'rgba(240,232,238,0.42)' }}>
                  사주로 운명의 흐름을 알았다면, 타로로 오늘의 에너지를 읽어보세요.
                </p>
                <button
                  onClick={() => router.push('/tarot')}
                  className="text-white px-8 py-4 rounded-2xl font-black text-base shadow-lg transition-all active:scale-95 inline-flex items-center gap-2 hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, var(--tarot-500, #7F77DD), var(--tarot-800, #4b44a8))', boxShadow: '0 8px 24px rgba(127,119,221,0.3)' }}
                >
                  🔮 타로 리딩 하기
                </button>
              </div>

              <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)' }} />

              {/* 내 사주 공유하기 */}
              <ShareButtons name={data.userName} />
            </div>

          </div>
        )}
      </div>

      <GungHapInputModal isOpen={isGungHapModalOpen} onClose={() => setIsGungHapModalOpen(false)} />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
