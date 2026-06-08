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

const ELEMENT_PAIR_GUIDE: Record<string, { badge: string; title: string; focus: string; caution: string }> = {
  '木木': { badge: '성장', title: '새 일을 키우는 시기', focus: '새로운 계획, 공부, 준비한 일을 밖으로 꺼내기', caution: '벌리기만 하고 마무리를 미루는 패턴' },
  '木火': { badge: '확장', title: '시작한 일을 알리는 시기', focus: '홍보, 발표, 제안, 사이드 프로젝트 공개', caution: '속도가 빨라져 약속과 일정이 과해지는 것' },
  '木土': { badge: '기반', title: '성장을 현실에 붙이는 시기', focus: '루틴, 자격, 계약, 생활 기반 정리', caution: '답답하다고 계획을 중간에 갈아엎는 것' },
  '木金': { badge: '성과', title: '키운 일을 결과로 묶는 시기', focus: '포트폴리오, 성과 정리, 평가와 보상 협상', caution: '완벽주의 때문에 결과 공개를 늦추는 것' },
  '木水': { badge: '준비', title: '배우고 키우는 시기', focus: '공부, 자료 수집, 방향성 점검', caution: '생각만 많아지고 실행이 밀리는 것' },
  '火木': { badge: '실행', title: '아이디어를 빠르게 움직이는 시기', focus: '기획 실행, 사람 앞에 서는 일, 콘텐츠화', caution: '초반 열기로 체력을 한 번에 쓰는 것' },
  '火火': { badge: '확장', title: '존재감이 커지는 시기', focus: '브랜딩, 발표, 영업, 영향력 확장', caution: '과열, 말실수, 무리한 일정' },
  '火土': { badge: '정착', title: '확장한 일을 안정시키는 시기', focus: '업무 체계화, 팀/고객 관리, 장기 계획', caution: '책임이 늘면서 몸이 먼저 지치는 것' },
  '火金': { badge: '평가', title: '성과가 눈에 띄는 시기', focus: '평가, 승진, 성과급, 결과 발표', caution: '인정 욕구 때문에 무리한 선택을 하는 것' },
  '火水': { badge: '조율', title: '속도와 판단을 맞춰야 하는 시기', focus: '중요 결정 전 검토, 감정 조절, 일정 조율', caution: '급하게 결정하고 뒤늦게 수정하는 것' },
  '土木': { badge: '재정비', title: '기반 위에 새 계획을 붙이는 시기', focus: '환경 정리, 루틴 재설계, 다음 성장 준비', caution: '익숙한 방식에만 머무르는 것' },
  '土火': { badge: '공개', title: '준비한 것을 보여주는 시기', focus: '성과 공유, 발표, 제안, 사업/일 확장', caution: '준비보다 이미지에 힘을 너무 쓰는 것' },
  '土土': { badge: '안정', title: '기반을 단단히 다지는 시기', focus: '저축, 생활 안정, 장기 계약, 체력 회복', caution: '변화를 미루다가 기회를 놓치는 것' },
  '土金': { badge: '축적', title: '쌓은 것이 성과로 바뀌는 시기', focus: '보상 협상, 수입 구조화, 자산 관리', caution: '한 번에 크게 벌려는 욕심' },
  '土水': { badge: '정리', title: '생활과 마음의 속도를 정리하는 시기', focus: '휴식, 정산, 관계와 일의 기준 세우기', caution: '걱정이 늘어 실행이 늦어지는 것' },
  '金木': { badge: '재시작', title: '결과를 바탕으로 새 판을 여는 시기', focus: '경험을 상품화하기, 새 업무 전환, 재도전', caution: '이전 성과에만 기대는 것' },
  '金火': { badge: '확산', title: '성과를 더 넓게 알리는 시기', focus: '브랜딩, 영업, 발표, 영향력 확장', caution: '성과를 과장하거나 일정이 과열되는 것' },
  '金土': { badge: '관리', title: '성과를 지키고 관리하는 시기', focus: '수입 관리, 계약 검토, 장기 안정화', caution: '안정만 보다가 성장 타이밍을 놓치는 것' },
  '金金': { badge: '결실', title: '결과를 손에 쥐는 시기', focus: '평가, 정산, 수익화, 마무리', caution: '냉정한 판단이 지나쳐 관계가 딱딱해지는 것' },
  '金水': { badge: '선별', title: '결과를 정리하고 다음 선택을 고르는 시기', focus: '우선순위 정리, 계약 조건 검토, 재무 점검', caution: '계산이 많아져 타이밍을 놓치는 것' },
  '水木': { badge: '실행', title: '생각한 방향을 행동으로 옮기는 시기', focus: '새 공부 시작, 진로 전환, 준비한 계획 실행', caution: '확신이 생길 때까지 계속 미루는 것' },
  '水火': { badge: '표현', title: '조용히 준비한 것을 드러내는 시기', focus: '공개, 발표, 대화, 콘텐츠 제작', caution: '감정 기복에 따라 속도가 흔들리는 것' },
  '水土': { badge: '기준', title: '생각을 현실 기준으로 묶는 시기', focus: '생활 기준, 돈 관리, 건강 루틴', caution: '걱정이 커져 선택을 미루는 것' },
  '水金': { badge: '판단', title: '선택과 성과를 선별하는 시기', focus: '계약 검토, 일 정리, 수익성 판단', caution: '너무 재다가 좋은 제안을 놓치는 것' },
  '水水': { badge: '전략', title: '방향을 깊게 고르는 시기', focus: '전략, 공부, 재정비, 다음 10년 준비', caution: '생각이 길어져 현실 행동이 늦어지는 것' },
};

function getDaeunGuide(ganElement: string, zhiElement: string) {
  return ELEMENT_PAIR_GUIDE[`${ganElement}${zhiElement}`] || {
    badge: '흐름',
    title: '삶의 방향을 조율하는 시기',
    focus: '일, 돈, 컨디션의 우선순위를 다시 세우기',
    caution: '한쪽으로만 무리하게 몰아가는 것',
  };
}

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

function isSajuOverviewSection(section: BriefingSection) {
  const title = section.title.replace(/\s/g, '');
  return title.includes('핵심운세') ||
    title.includes('핵심브리핑') ||
    title.includes('운세브리핑') ||
    title.includes('가장먼저알아야할결론');
}

function SajuBriefingPanel({ sections, userName, currentYear }: { sections: BriefingSection[]; userName: string; currentYear: number }) {
  const daeyunSection = findReportSection(sections, ['향후대운10년인생타이밍', '대운10년인생타이밍', '향후대운10년돈타이밍'], ['확장 구간', '정비 구간', '주의 구간']);
  const yearlyCalendarSection = findReportSection(sections, [`${currentYear}년월별운세캘린더`, '월별운세캘린더'], ['일과 성장에 좋은 구간', '컨디션과 감정 관리']);
  const moneyTimingSection = yearlyCalendarSection || findReportSection(sections, [`${currentYear}년돈이움직이는시기표`, '돈이움직이는시기표', '돈들어오는시기'], ['돈이 들어오기 쉬운 구간', '지출과 손실']);
  const wealthSection = findReportSection(sections, ['재물운', '지갑', '돈'], ['재물 포인트', '수입']);
  const careerSection = findReportSection(sections, ['직업운', '성장운', '커리어']);
  const recoverySection = findReportSection(sections, ['컨디션과회복루틴', '회복루틴', '컨디션']);
  const yearSection = yearlyCalendarSection || findReportSection(sections, [`${currentYear}년`, '운세흐름', '럭키포인트']);
  const natureSection = findReportSection(sections, ['기질', '본성', '진짜모습']);

  const daeyunExpandLines = getBlockLines(
    daeyunSection,
    ['확장 구간', '승부'],
    ['정비 구간', '주의 구간', '중요 결정', '인생 의사결정'],
    2
  );
  const daeyunMaintenanceLines = getBlockLines(
    daeyunSection,
    ['정비 구간', '축적'],
    ['주의 구간', '중요 결정', '확장 구간'],
    2
  );
  const daeyunCautionLines = getBlockLines(
    daeyunSection,
    ['주의 구간', '손실 주의 구간', '주의'],
    ['중요 결정', '인생 의사결정', '확장 구간', '정비 구간'],
    2
  );
  const daeyunDecisionLines = getBlockLines(
    daeyunSection,
    ['중요 결정 포인트', '인생 의사결정 포인트', '의사결정'],
    ['확장 구간', '정비 구간', '주의 구간'],
    3
  );
  const daeyunYearLines = getBlockLines(
    daeyunSection,
    ['연도별 체크포인트'],
    ['확장 구간', '정비 구간', '주의 구간', '중요 결정'],
    3
  );

  const careerLines = getBlockLines(
    yearlyCalendarSection,
    ['일과 성장에 좋은 구간'],
    ['돈 관리에 유리한 구간', '컨디션과 감정 관리', '바로 할 일'],
    3
  );
  const opportunityLines = getBlockLines(
    moneyTimingSection,
    ['돈 관리에 유리한 구간', '돈이 들어오기 쉬운', '기회가 커지는', '승부 구간'],
    ['컨디션과 감정 관리', '지출과 손실', '조심할 구간', '바로 할 일', '확장 방식'],
    2
  );
  const wealthGoodYearLines = getBlockLines(
    wealthSection,
    ['재물운 좋은 해', '수입 확장에 좋은 해'],
    ['지출 주의 해', '돈을 쌓는 방법'],
    3
  );
  const wealthCautionYearLines = getBlockLines(
    wealthSection,
    ['지출 주의 해'],
    ['돈을 쌓는 방법', '재물운 좋은 해', '수입 확장에 좋은 해'],
    3
  );
  const cautionLines = getBlockLines(
    moneyTimingSection,
    ['컨디션과 감정 관리', '지출과 손실', '조심할 구간', '주의'],
    ['바로 할 일', '돈이 들어오기', '돈 관리에 유리한', '확장 방식'],
    3
  );
  const actionLines = getBlockLines(
    moneyTimingSection,
    ['바로 할 일', '지금 할 일', '액션'],
    ['돈이 들어오기', '지출과 손실', '확장 방식'],
    3
  );
  const winLines = getBlockLines(
    moneyTimingSection,
    ['확장 방식', '승부 구간', '승부 방식'],
    ['지출과 손실', '조심할 구간', '바로 할 일'],
    2
  );

  const moneyFallback = getUsefulLines(wealthSection, 3);
  const careerFallback = getUsefulLines(careerSection, 3);
  const recoveryFallback = getUsefulLines(recoverySection, 3);
  const yearFallback = getUsefulLines(yearSection, 3);
  const natureFallback = getUsefulLines(natureSection, 2);

  const opportunities = wealthGoodYearLines.length > 0 ? wealthGoodYearLines : (opportunityLines.length > 0 ? opportunityLines : (moneyFallback.length > 0 ? moneyFallback : yearFallback));
  const cautions = wealthCautionYearLines.length > 0 ? wealthCautionYearLines : (cautionLines.length > 0 ? cautionLines : yearFallback.slice(0, 3));
  const actions = actionLines.length > 0 ? actionLines : [
    `${currentYear}년 일정표에 수입 목표와 큰 지출 예정일을 먼저 적어두세요.`,
    '중요한 제안이나 계약은 조건, 일정, 내 컨디션을 함께 확인하세요.',
    '조심 구간에는 충동 지출보다 정산과 기록을 우선해보세요.',
  ];
  const wins = winLines.length > 0 ? winLines : [
    '무리하게 판을 키우기보다 잘하는 일을 반복 가능한 구조로 바꾸는 쪽이 좋아요.',
    '성과 정리, 역할 조정, 루틴 재설계처럼 결과가 남는 움직임에 힘을 주세요.',
  ];
  const daeyunWins = daeyunExpandLines.length > 0 ? daeyunExpandLines : wins;
  const daeyunMaintenance = daeyunMaintenanceLines.length > 0 ? daeyunMaintenanceLines : (careerFallback.length > 0 ? careerFallback.slice(0, 2) : wins);
  const daeyunRisks = daeyunCautionLines.length > 0 ? daeyunCautionLines : cautions.slice(0, 2);
  const daeyunDecisions = daeyunYearLines.length > 0 ? daeyunYearLines : (daeyunDecisionLines.length > 0 ? daeyunDecisionLines : actions);
  const careerBrief = careerLines.length > 0 ? careerLines : (careerFallback.length > 0 ? careerFallback : yearFallback);
  const recoveryBrief = recoveryFallback.length > 0 ? recoveryFallback : cautions;

  const opportunityMonths = extractMonths(opportunities);
  const cautionMonths = extractMonths(cautions);
  const hasMonthSignals = opportunityMonths.size > 0 || cautionMonths.size > 0;
  const quickHeadline = natureFallback[0] || `${userName}님의 운세는 밀어붙일 때와 쉬어야 할 때를 나누는 것이 핵심이에요.`;

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
          title="향후 10년 확장 구간"
          lines={daeyunWins}
          accent="#9d8fff"
        />
        <BriefingCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="정비"
          title="차분히 다듬을 구간"
          lines={daeyunMaintenance}
          accent="#00d18f"
        />
        <BriefingCard
          icon={<CalendarDays className="w-5 h-5" />}
          label="결정"
          title="인생 의사결정 포인트"
          lines={daeyunDecisions}
          accent="#e8829a"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <BriefingCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="일"
          title={`${currentYear}년 성장 포인트`}
          lines={careerBrief}
          accent="#9d8fff"
        />
        <BriefingCard
          icon={<CircleDollarSign className="w-5 h-5" />}
          label="돈"
          title="재물운 좋은 해"
          lines={opportunities}
          accent="#00d18f"
        />
        <BriefingCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="컨디션"
          title="무리하면 흔들리는 지점"
          lines={recoveryBrief}
          accent="#ffb86b"
        />
      </div>

      {hasMonthSignals && (
        <div className="rounded-[2rem] p-5 md:p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" style={{ color: '#9d8fff' }} />
            <h4 className="text-lg font-bold" style={{ color: '#f5eef2' }}>{currentYear} 운세 캘린더</h4>
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
          icon={<AlertTriangle className="w-5 h-5" />}
          label="주의"
          title="조심해야 할 구간"
          lines={daeyunRisks.length ? daeyunRisks : cautions}
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
    </section>
  );
}

function BriefingCard({ icon, label, title, lines, accent }: { icon: ReactNode; label: string; title: string; lines: string[]; accent: string }) {
  const displayLines = lines
    .map((line) => cleanInsightLine(line))
    .filter((line) => line.length >= 6)
    .slice(0, 3);

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
        {(displayLines.length > 0 ? displayLines : ['리포트 내용을 다시 정리하는 중이에요.']).map((line, index) => {
          const [headline = line, ...details] = line.split('|').map((part) => part.trim()).filter(Boolean);
          return (
            <div key={`${title}-${index}`} className="space-y-1.5 rounded-2xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[13px] md:text-sm font-black leading-relaxed break-keep" style={{ color: 'rgba(245,238,242,0.86)' }}>
                <span style={{ color: accent }}>{index + 1}. </span>
                {headline}
              </p>
              {details.slice(0, 2).map((detail, detailIndex) => (
                <p key={`${title}-${index}-${detailIndex}`} className="text-[12px] md:text-[13px] font-medium leading-relaxed break-keep" style={{ color: 'rgba(240,232,238,0.56)' }}>
                  {detail.replace(/^근거\s*:\s*/, '왜 이렇게 보나요: ').replace(/^행동\s*:\s*/, '추천 행동: ')}
                </p>
              ))}
            </div>
          );
        })}
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
                  const nextAge = daeunList[idx + 1]?.age ?? dy.age + 10;
                  const startYear = currentYear + (dy.age - userAge);
                  const endYear = startYear + Math.max(1, nextAge - dy.age) - 1;
                  const midYear = Math.min(endYear, startYear + 4);
                  const daeunGuide = getDaeunGuide(dy.ganElement, dy.zhiElement);

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
                          <div className="min-w-0 space-y-1">
                            <span className="text-sm font-black" style={{ color: isCurrent ? '#9d8fff' : 'rgba(240,232,238,0.42)' }}>
                              {startYear}년 시작
                            </span>
                            {isCurrent && (
                              <span className="ml-2 px-2 py-0.5 text-[10px] font-black rounded-full leading-none" style={{ background: 'rgba(157,143,255,0.18)', color: '#9d8fff' }}>
                                현재
                              </span>
                            )}
                            <p className="text-base font-black leading-snug break-keep" style={{ color: '#f5eef2' }}>
                              {daeunGuide.title}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full px-3 py-1 text-[11px] font-black" style={{ background: 'rgba(157,143,255,0.14)', color: '#c8bdff', border: '1px solid rgba(157,143,255,0.22)' }}>
                            {daeunGuide.badge}
                          </span>
                        </div>

                        {/* 실전 포인트 */}
                        <div className="mt-2 space-y-1.5">
                          <p className="text-xs font-medium break-keep leading-relaxed" style={{ color: 'rgba(240,232,238,0.56)' }}>
                            하면 좋은 것: {daeunGuide.focus}
                          </p>
                          <p className="text-xs font-medium break-keep leading-relaxed" style={{ color: 'rgba(240,232,238,0.46)' }}>
                            대표 체크: {startYear}년, {midYear}년, {endYear}년
                          </p>
                          <p className="text-xs font-medium break-keep leading-relaxed" style={{ color: 'rgba(240,232,238,0.38)' }}>
                            조심할 것: {daeunGuide.caution}
                          </p>
                        </div>

                        {/* 선택 시 상세 설명 (툴팁 패널) */}
                        {isSelected && (
                          <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: '1px solid rgba(157,143,255,0.16)' }}>
                            <p className="text-sm font-bold break-keep leading-relaxed" style={{ color: 'rgba(245,238,242,0.82)' }}>
                              이 구간은 <span style={{ color: '#9d8fff' }}>{daeunGuide.focus}</span>에 힘을 쓰면 결과가 잘 쌓이는 흐름이에요.
                            </p>
                            <p className="text-xs break-keep leading-relaxed" style={{ color: 'rgba(240,232,238,0.4)' }}>
                              나이보다 중요한 건 실제 선택의 해예요. 좋은 해와 조심할 해는 위 브리핑과 상세 리포트에서 연도별로 확인하세요.
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
                  const accordionSections = result.sections.filter((s) => s !== storySection && !isLowPrioritySajuSection(s) && !isSajuOverviewSection(s));
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
