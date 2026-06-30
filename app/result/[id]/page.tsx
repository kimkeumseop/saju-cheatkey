'use client';

import { useEffect, useState, use, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import AuroraBackground from '@/components/AuroraBackground';
import AnalysisAccordion from '@/components/AnalysisAccordion';
import ShareButtons from '@/components/ShareButtons';
import GungHapPreview from '@/components/GungHapPreview';
import GungHapInputModal from '@/components/GungHapInputModal';
import { Loader2, BarChart3, Star, History, Moon, Heart, CircleDollarSign, AlertTriangle, TrendingUp, Sparkles, Activity, Users } from 'lucide-react';
import { ELEMENT_STYLE } from '@/lib/saju';
import { normalizeSajuAiResult, normalizeSajuReport } from '@/lib/ai-result';
import { SAJU_ITEM_LABELS, type SajuReport, type SajuItem, type SajuItemKey, type SajuShinsalReading, type SajuLifeStages } from '@/lib/saju-schema';
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
      {title && <h4 className="text-center font-bold text-lg" style={{ color: '#2D1B1E' }}>{title}</h4>}
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
                <div className="text-[10px] font-black tracking-tighter uppercase" style={{ color: 'rgba(212,104,138,0.55)' }}>{p.label}</div>
                <div className="text-[11px] font-black" style={{ color: 'rgba(45,27,30,0.7)' }}>{showDash ? '-' : p.tenGodGan}</div>
              </div>
              <div className="space-y-2 md:space-y-4">
                <div className={cn('relative transition-all duration-500', isDayPillar ? 'scale-105 z-20' : '')}>
                  <div className={cn(ganStyle.bg, ganStyle.text, 'p-3 md:p-8 rounded-[1.5rem] md:rounded-[3rem] flex flex-col items-center justify-center border-[2px] md:border-[4px]', isDayPillar ? 'border-[#d4688a] shadow-xl shadow-[#d4688a]/30' : 'border-white/10 shadow-sm')}>
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
                <div className="text-[11px] font-black" style={{ color: 'rgba(45,27,30,0.7)' }}>{showDash ? '-' : p.tenGodZhi}</div>
                <div className="text-[10px] font-bold" style={{ color: 'rgba(45,27,30,0.4)' }}>{showDash ? '-' : p.unSeong}</div>
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

// ── 운세 점수 육각 레이더 차트 ────────────────────────────────────
function Radar({ entries }: { entries: { label: string; value: number }[] }) {
  const n = entries.length || 6;
  const W = 340, H = 290, cx = 170, cy = 145, R = 92, labelR = R + 22;
  const levels = [0.25, 0.5, 0.75, 1];
  const clamp = (v: number) => Math.max(0, Math.min(5, v ?? 0));

  const angleFor = (i: number) => (-90 + i * (360 / n)) * (Math.PI / 180);
  const pt = (i: number, r: number): [number, number] => {
    const a = angleFor(i);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const ring = (ratio: number) => entries.map((_, i) => pt(i, R * ratio).join(',')).join(' ');
  const valuePoly = entries.map((e, i) => pt(i, R * (clamp(e.value) / 5)).join(',')).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[340px] mx-auto" role="img" aria-label="운세 점수 레이더 차트">
      <defs>
        <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c6fd6" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#d4688a" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {levels.map((lv) => (
        <polygon key={lv} points={ring(lv)} fill="none" stroke="rgba(45,27,30,0.10)" strokeWidth={1} />
      ))}
      {entries.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(45,27,30,0.10)" strokeWidth={1} />;
      })}
      <polygon points={valuePoly} fill="url(#radarFill)" stroke="#7c6fd6" strokeWidth={2} strokeLinejoin="round" />
      {entries.map((e, i) => {
        const [x, y] = pt(i, R * (clamp(e.value) / 5));
        return <circle key={e.label} cx={x} cy={y} r={3.5} fill="#d4688a" />;
      })}
      {entries.map((e, i) => {
        const [lx, ly] = pt(i, labelR);
        const cos = Math.cos(angleFor(i));
        const anchor = Math.abs(cos) < 0.35 ? 'middle' : cos > 0 ? 'start' : 'end';
        return (
          <g key={e.label}>
            <text x={lx} y={ly - 3} textAnchor={anchor} fontSize={12} fontWeight={800} fill="rgba(45,27,30,0.6)">{e.label}</text>
            <text x={lx} y={ly + 12} textAnchor={anchor} fontSize={13} fontWeight={900} fill="#2D1B1E">{clamp(e.value).toFixed(1)}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── 별점 (반 개 단위) ─────────────────────────────────────────────
function Stars({ score, size = 16 }: { score: number; size?: number }) {
  const v = Math.max(0, Math.min(5, score));
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`별점 ${v.toFixed(1)}/5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, v - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute left-0 top-0" style={{ width: size, height: size, color: 'rgba(45,27,30,0.16)' }} />
            <span className="absolute left-0 top-0 overflow-hidden block" style={{ width: fill * size, height: size }}>
              <Star className="block" style={{ width: size, height: size, color: '#d4688a', fill: '#d4688a' }} />
            </span>
          </span>
        );
      })}
    </div>
  );
}

// ── 항목별 정통사주 카드 ──────────────────────────────────────────
const ITEM_META: { key: SajuItemKey; short: string; icon: ReactNode; accent: string }[] = [
  { key: 'personality', short: '성격', icon: <Sparkles className="w-5 h-5" />, accent: '#7c6fd6' },
  { key: 'wealth', short: '재물', icon: <CircleDollarSign className="w-5 h-5" />, accent: '#0e9f73' },
  { key: 'career', short: '직업', icon: <TrendingUp className="w-5 h-5" />, accent: '#d4688a' },
  { key: 'love', short: '애정', icon: <Heart className="w-5 h-5" />, accent: '#d4688a' },
  { key: 'health', short: '건강', icon: <Activity className="w-5 h-5" />, accent: '#c2883a' },
  { key: 'relationship', short: '대인', icon: <Users className="w-5 h-5" />, accent: '#7c6fd6' },
];

function ItemCard({ label, item, icon, accent }: { label: string; item: SajuItem; icon: ReactNode; accent: string }) {
  return (
    <article className="rounded-[2rem] p-6 md:p-7 space-y-4" style={{ background: 'rgba(255,255,255,0.92)', border: `1px solid ${accent}30`, boxShadow: `0 8px 32px ${accent}10` }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-2xl flex items-center justify-center" style={{ background: `${accent}18`, color: accent }}>{icon}</div>
          <h4 className="text-lg font-bold" style={{ color: '#2D1B1E' }}>{label}</h4>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Stars score={item.score} />
          <span className="text-xs font-black" style={{ color: accent }}>{item.score.toFixed(1)}</span>
        </div>
      </div>
      {item.body && (
        <p className="text-[14px] md:text-[15px] font-medium leading-[1.85] break-keep whitespace-pre-wrap" style={{ color: 'rgba(45,27,30,0.78)' }}>{item.body}</p>
      )}
      {item.tip && (
        <div className="rounded-2xl px-4 py-3 flex items-start gap-2" style={{ background: `${accent}10`, border: `1px solid ${accent}22` }}>
          <span className="text-[10px] font-black mt-1 shrink-0" style={{ color: accent }}>TIP</span>
          <p className="text-[13px] font-bold leading-relaxed break-keep" style={{ color: 'rgba(45,27,30,0.86)' }}>{item.tip}</p>
        </div>
      )}
    </article>
  );
}

// ── 길흉성(신살) 풀이 ─────────────────────────────────────────────
function ShinsalPanel({ shinsal }: { shinsal: SajuShinsalReading[] }) {
  if (!shinsal.length) return null;
  return (
    <section className="rounded-[2rem] p-6 md:p-8 space-y-4" style={{ background: 'rgba(212,104,138,0.05)', border: '1px solid rgba(212,104,138,0.16)' }}>
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5" style={{ color: '#d4688a', fill: '#d4688a' }} />
        <h3 className="text-xl font-bold" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>길흉성 풀이</h3>
      </div>
      <div className="space-y-3">
        {shinsal.map((s) => (
          <div key={s.name} className="rounded-2xl px-4 py-3.5 space-y-2" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(45,27,30,0.08)' }}>
            <span className="inline-block px-3 py-1 rounded-full text-[12px] font-black" style={{ background: 'rgba(212,104,138,0.12)', color: '#d4688a', border: '1px solid rgba(212,104,138,0.22)' }}>#{s.name}</span>
            <p className="text-sm font-medium leading-relaxed break-keep whitespace-pre-wrap" style={{ color: 'rgba(45,27,30,0.74)' }}>{s.meaning}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── 생애 흐름 패널 (초년/중년/말년 + 전성기) ─────────────────────
function LifeArcPanel({ stages }: { stages: SajuLifeStages }) {
  const items = [
    { label: '초년', sub: '~20대', text: stages.early, accent: '#7c6fd6' },
    { label: '중년', sub: '30~40대', text: stages.middle, accent: '#d4688a' },
    { label: '말년', sub: '50대~', text: stages.late, accent: '#0e9f73' },
  ].filter((it) => it.text);

  if (!stages.peak && items.length === 0) return null;

  return (
    <section className="space-y-5">
      {stages.peak && (
        <div className="rounded-[2rem] p-6 md:p-8 space-y-3" style={{ background: 'rgba(124,111,214,0.07)', border: '1px solid rgba(124,111,214,0.18)', boxShadow: '0 8px 40px rgba(124,111,214,0.08)' }}>
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: '#7c6fd6' }}>
            <History className="w-4 h-4" />
            생애 흐름 · 전성기
          </div>
          <p className="text-xl md:text-2xl font-bold leading-snug break-keep" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>
            {stages.peak}
          </p>
        </div>
      )}
      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {items.map((it) => (
            <article key={it.label} className="rounded-[2rem] p-5 md:p-6 space-y-3" style={{ background: 'rgba(255,255,255,0.92)', border: `1px solid ${it.accent}33`, boxShadow: `0 8px 32px ${it.accent}12` }}>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-black" style={{ color: it.accent }}>{it.label}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: 'rgba(45,27,30,0.4)' }}>{it.sub}</span>
              </div>
              <p className="text-[13px] md:text-sm font-medium leading-relaxed break-keep whitespace-pre-wrap" style={{ color: 'rgba(45,27,30,0.72)' }}>{it.text}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ── 점신식 정통사주 결과 뷰 (신버전 메인) ──────────────────────────
function SajuReportView({ report }: { report: SajuReport }) {
  const { headline, keywords, overallScore, overall, items, lifeStages, shinsal, lucky, caution } = report;
  const radarEntries = ITEM_META.map((m) => ({ label: m.short, value: items[m.key].score }));
  const hasLucky = !!lucky && (lucky.numbers.length > 0 || !!lucky.color || !!lucky.direction || !!lucky.advice);

  return (
    <div className="space-y-12">
      {/* 평생 총운 히어로 */}
      <section className="rounded-[2rem] p-6 md:p-8 space-y-5" style={{ background: 'rgba(212,104,138,0.06)', border: '1px solid rgba(212,104,138,0.16)', boxShadow: '0 8px 40px rgba(212,104,138,0.08)' }}>
        <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: '#d4688a' }}>
          <Star className="w-4 h-4" style={{ fill: '#d4688a' }} />
          평생 총운
        </div>
        {headline && (
          <p className="text-xl md:text-2xl font-bold leading-snug break-keep" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>{headline}</p>
        )}
        <div className="flex items-center gap-3">
          <Stars score={overallScore} size={22} />
          <span className="text-lg font-black" style={{ color: '#d4688a' }}>{overallScore.toFixed(1)}</span>
        </div>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <span key={kw} className="px-3 py-1.5 rounded-full text-[12px] font-black" style={{ background: 'rgba(212,104,138,0.12)', color: '#d4688a', border: '1px solid rgba(212,104,138,0.22)' }}>#{kw}</span>
            ))}
          </div>
        )}
        {overall && (
          <p className="text-[14px] md:text-[15px] font-medium leading-[1.9] break-keep whitespace-pre-wrap pt-1" style={{ color: 'rgba(45,27,30,0.78)' }}>{overall}</p>
        )}
      </section>

      {/* 종합 레이더 */}
      <section className="rounded-[2rem] p-6 md:p-8 space-y-5" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(124,111,214,0.14)' }}>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" style={{ color: '#7c6fd6' }} />
          <h3 className="text-xl font-bold" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>운세 종합 점수</h3>
        </div>
        <Radar entries={radarEntries} />
      </section>

      {/* 항목별 정통사주 */}
      <section className="space-y-5">
        <div className="flex items-center gap-3 ml-1">
          <Moon className="w-6 h-6" style={{ color: '#d4688a', fill: '#d4688a' }} />
          <h3 className="text-2xl font-bold" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>항목별 정통사주</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ITEM_META.map((m) => (
            <ItemCard key={m.key} label={SAJU_ITEM_LABELS[m.key]} item={items[m.key]} icon={m.icon} accent={m.accent} />
          ))}
        </div>
      </section>

      {/* 생애 흐름 */}
      {lifeStages && <LifeArcPanel stages={lifeStages} />}

      {/* 길흉성 풀이 */}
      <ShinsalPanel shinsal={shinsal} />

      {/* 개운법 */}
      {hasLucky && (
        <section className="rounded-[2rem] p-6 md:p-8 space-y-4" style={{ background: 'rgba(14,159,115,0.05)', border: '1px solid rgba(14,159,115,0.18)' }}>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5" style={{ color: '#0e9f73', fill: '#0e9f73' }} />
            <h3 className="text-xl font-bold" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>개운법 · 행운 포인트</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {lucky!.numbers.length > 0 && (
              <div className="px-4 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(14,159,115,0.2)' }}>
                <span className="text-[10px] font-black uppercase tracking-wider block" style={{ color: 'rgba(14,159,115,0.7)' }}>숫자</span>
                <span className="text-sm font-black" style={{ color: '#2D1B1E' }}>{lucky!.numbers.join(', ')}</span>
              </div>
            )}
            {lucky!.color && (
              <div className="px-4 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(14,159,115,0.2)' }}>
                <span className="text-[10px] font-black uppercase tracking-wider block" style={{ color: 'rgba(14,159,115,0.7)' }}>색</span>
                <span className="text-sm font-black" style={{ color: '#2D1B1E' }}>{lucky!.color}</span>
              </div>
            )}
            {lucky!.direction && (
              <div className="px-4 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(14,159,115,0.2)' }}>
                <span className="text-[10px] font-black uppercase tracking-wider block" style={{ color: 'rgba(14,159,115,0.7)' }}>방향</span>
                <span className="text-sm font-black" style={{ color: '#2D1B1E' }}>{lucky!.direction}</span>
              </div>
            )}
          </div>
          {lucky!.advice && (
            <p className="text-sm font-medium leading-relaxed break-keep" style={{ color: 'rgba(45,27,30,0.66)' }}>{lucky!.advice}</p>
          )}
        </section>
      )}

      {/* 냉정하게 짚는 약점 */}
      {caution && (
        <section className="rounded-[2rem] p-6 md:p-8 space-y-2" style={{ background: 'rgba(194,136,58,0.05)', border: '1px solid rgba(194,136,58,0.2)' }}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" style={{ color: '#c2883a' }} />
            <h3 className="text-xl font-bold" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>냉정하게 짚는 약점</h3>
          </div>
          <p className="text-sm md:text-[15px] font-medium leading-relaxed break-keep whitespace-pre-wrap" style={{ color: 'rgba(45,27,30,0.7)' }}>{caution}</p>
        </section>
      )}
    </div>
  );
}

// ── 결과 페이지 ──────────────────────────────────────────────────
export default function SajuResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDaeunIdx, setSelectedDaeunIdx] = useState<number | null>(null);
  const [isGungHapModalOpen, setIsGungHapModalOpen] = useState(false);

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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: '#FBF7F2' }}>
      <Loader2 className="w-12 h-12 animate-spin stroke-[3]" style={{ color: '#d4688a' }} />
      <p className="mt-4 font-bold" style={{ color: 'rgba(212,104,138,0.7)' }}>운명의 속삭임을 듣는 중...</p>
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
    setIsGungHapModalOpen(true);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden pt-24 pb-32 px-3 sm:px-4 md:px-6" style={{ background: '#FBF7F2' }}>
      <AuroraBackground />
      <Navbar />
      <div className="relative z-10 max-w-4xl mx-auto space-y-12">
        {isCompatibility ? (
          <GungHapPreview data={{ ...data, isPaid: true }} resultId={id} />
        ) : (
          <div className="space-y-12">

            {/* ══ 작업 1: 헤더 카피 개선 ══ */}
            <div className="text-center space-y-5">
              <div
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold"
                style={{ background: 'rgba(212,104,138,0.10)', border: '1px solid rgba(212,104,138,0.20)', color: '#d4688a' }}
              >
                <Moon className="w-4 h-4" style={{ fill: '#d4688a', color: '#d4688a' }} />
                신비로운 영혼의 리포트
              </div>
              <div className="space-y-3">
                <h1 className="font-bold tracking-tight break-keep leading-tight text-3xl md:text-5xl" style={{ fontFamily: '"Noto Serif KR", serif' }}>
                  <span style={{ background: 'linear-gradient(135deg, #d4688a 0%, #7c6fd6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{data.userName}</span>
                  <span style={{ color: 'rgba(45,27,30,0.92)' }}>, 당신이 아직 모르는</span>
                  <br />
                  <span style={{ color: '#2D1B1E' }}>진짜 자신</span>
                </h1>
                {dominantElementInfo && (
                  <p className="font-bold text-sm md:text-base" style={{ color: 'rgba(212,104,138,0.8)' }}>
                    {dominantElementInfo.emoji} 핵심 기운 ·{' '}
                    <span className="font-black" style={{ color: '#d4688a' }}>{dominantElementInfo.keyword}</span>
                    {' '}— {dominantElementInfo.desc}
                  </p>
                )}
                <p className="text-xs font-bold italic" style={{ color: 'rgba(45,27,30,0.34)' }}>
                  {data.birthDate}
                  {data.birthTime && data.birthTime !== 'unknown' ? ` ${data.birthTime}` : ''}
                </p>
              </div>
            </div>

            {/* 만세력 설계도 */}
            <div
              className="p-5 sm:p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-10 relative overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(212,104,138,0.14)',
                boxShadow: '0 8px 40px rgba(212,104,138,0.08)',
              }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32" style={{ background: 'rgba(212,104,138,0.10)' }} />
              <div className="text-center space-y-1 relative z-10">
                <h3 className="text-2xl font-bold tracking-tight" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>인생 설계도 (만세력)</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(212,104,138,0.4)' }}>Manseyrok INFOGRAPHIC</p>
              </div>
              {saju && <PillarChart pillars={saju.pillars} isTimeUnknown={isTimeUnknown} />}
              <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8" style={{ borderTop: '1px solid rgba(212,104,138,0.10)' }}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 ml-1">
                    <BarChart3 className="w-4 h-4" style={{ color: '#d4688a' }} />
                    <span className="text-sm font-bold" style={{ color: 'rgba(45,27,30,0.8)' }}>오행 분포</span>
                  </div>
                  {filteredElements && <ElementsChart counts={filteredElements} />}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 ml-1">
                    <Star className="w-4 h-4" style={{ color: '#d4688a' }} />
                    <span className="text-sm font-bold" style={{ color: 'rgba(45,27,30,0.8)' }}>핵심 귀인 & 신살</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {saju?.keyShinsal?.map((s: string) => (
                      <div key={s} className="px-4 py-2 rounded-2xl text-[11px] font-black" style={{ background: 'rgba(212,104,138,0.12)', color: '#d4688a', border: '1px solid rgba(212,104,138,0.22)' }}>
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
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(124,111,214,0.12)',
                boxShadow: '0 8px 40px rgba(124,111,214,0.06)',
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5" style={{ color: '#7c6fd6' }} />
                  <h3 className="text-xl font-bold" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>대운 (10년 주기의 흐름)</h3>
                </div>
                <p className="text-[13px] font-medium leading-relaxed ml-7 break-keep" style={{ color: 'rgba(45,27,30,0.42)' }}>
                  대운(大運)은 내 인생의 계절이 바뀌는 시점입니다. 각 시기를 눌러 에너지를 확인해보세요.
                </p>
              </div>

              <div className="relative space-y-2">
                {/* 세로 타임라인 선 */}
                <div className="absolute left-[1.2rem] top-5 bottom-5 w-0.5 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(124,111,214,0.05), rgba(124,111,214,0.4), rgba(124,111,214,0.05))' }} />

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
                          ? 'border-[#7c6fd6] shadow-lg shadow-[#7c6fd6]/40 scale-110'
                          : 'border-black/15'
                      )} style={{ background: '#FFFFFF' }}>
                        {isCurrent ? (
                          <div className="w-4 h-4 rounded-full" style={{ background: '#7c6fd6' }} />
                        ) : (
                          <span className="text-[10px] font-black text-black/40">{idx + 1}</span>
                        )}
                      </div>

                      {/* 카드 버튼 */}
                      <button
                        onClick={() => setSelectedDaeunIdx(isSelected ? null : idx)}
                        className="flex-1 text-left rounded-[1.5rem] border p-4 transition-all duration-300 mb-2"
                        style={
                          isCurrent
                            ? { borderColor: 'rgba(124,111,214,0.4)', background: 'linear-gradient(135deg, rgba(124,111,214,0.14), rgba(255,255,255,0.6))', boxShadow: '0 4px 20px rgba(124,111,214,0.12)' }
                            : isSelected
                            ? { borderColor: 'rgba(124,111,214,0.28)', background: 'rgba(255,255,255,0.85)' }
                            : { borderColor: 'rgba(45,27,30,0.10)', background: 'rgba(255,255,255,0.6)' }
                        }
                      >
                        {/* 카드 상단 행 */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 space-y-1">
                            <span className="text-sm font-black" style={{ color: isCurrent ? '#7c6fd6' : 'rgba(45,27,30,0.42)' }}>
                              {startYear}년 시작
                            </span>
                            {isCurrent && (
                              <span className="ml-2 px-2 py-0.5 text-[10px] font-black rounded-full leading-none" style={{ background: 'rgba(124,111,214,0.18)', color: '#7c6fd6' }}>
                                현재
                              </span>
                            )}
                            <p className="text-base font-black leading-snug break-keep" style={{ color: '#2D1B1E' }}>
                              {daeunGuide.title}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full px-3 py-1 text-[11px] font-black" style={{ background: 'rgba(124,111,214,0.14)', color: '#7c6fd6', border: '1px solid rgba(124,111,214,0.22)' }}>
                            {daeunGuide.badge}
                          </span>
                        </div>

                        {/* 실전 포인트 */}
                        <div className="mt-2 space-y-1.5">
                          <p className="text-xs font-medium break-keep leading-relaxed" style={{ color: 'rgba(45,27,30,0.56)' }}>
                            하면 좋은 것: {daeunGuide.focus}
                          </p>
                          <p className="text-xs font-medium break-keep leading-relaxed" style={{ color: 'rgba(45,27,30,0.46)' }}>
                            대표 체크: {startYear}년, {midYear}년, {endYear}년
                          </p>
                          <p className="text-xs font-medium break-keep leading-relaxed" style={{ color: 'rgba(45,27,30,0.38)' }}>
                            조심할 것: {daeunGuide.caution}
                          </p>
                        </div>

                        {/* 선택 시 상세 설명 (툴팁 패널) */}
                        {isSelected && (
                          <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: '1px solid rgba(124,111,214,0.16)' }}>
                            <p className="text-sm font-bold break-keep leading-relaxed" style={{ color: 'rgba(45,27,30,0.82)' }}>
                              이 구간은 <span style={{ color: '#7c6fd6' }}>{daeunGuide.focus}</span>에 힘을 쓰면 결과가 잘 쌓이는 흐름이에요.
                            </p>
                            <p className="text-xs break-keep leading-relaxed" style={{ color: 'rgba(45,27,30,0.4)' }}>
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

            {/* 정통사주 리포트 */}
            <div className="space-y-10 relative">
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {(() => {
                  const report = normalizeSajuReport(data.aiResult);
                  if (report) return <SajuReportView report={report} />;

                  // 레거시(옛 sections 결과) 폴백: 상세 리포트 아코디언만 렌더
                  const legacy = normalizeSajuAiResult(data.aiResult);
                  const sections = legacy.sections.filter((s) => !isLowPrioritySajuSection(s) && !isSajuOverviewSection(s));
                  return (
                    <div className="space-y-8">
                      <div className="flex items-center gap-3 ml-2">
                        <Moon className="w-6 h-6" style={{ color: '#d4688a', fill: '#d4688a' }} />
                        <h3 className="text-2xl font-bold" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>상세 리포트</h3>
                      </div>
                      <AnalysisAccordion data={sections} />
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* ══ 작업 4: 공유/바이럴 CTA ══ */}
            <div
              className="p-8 rounded-[2.5rem] space-y-8"
              style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(212,104,138,0.12)',
                boxShadow: '0 4px 32px rgba(45,27,30,0.10)',
              }}
            >
              {/* 친구 궁합 보기 CTA */}
              <div className="text-center space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(212,104,138,0.5)' }}>더 알아보기</p>
                <h4 className="text-xl font-bold break-keep" style={{ color: '#2D1B1E' }}>
                  소중한 인연과의 궁합도 확인해보세요
                </h4>
                <p className="text-sm break-keep max-w-sm mx-auto" style={{ color: 'rgba(45,27,30,0.42)' }}>
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

              <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(45,27,30,0.12), transparent)' }} />

              {/* 타로 리딩 CTA */}
              <div className="text-center space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(124,111,214,0.6)' }}>타로 리딩</p>
                <h4 className="text-xl font-bold break-keep" style={{ color: '#2D1B1E' }}>
                  지금 이 순간, 카드가 건네는 메시지
                </h4>
                <p className="text-sm break-keep max-w-sm mx-auto" style={{ color: 'rgba(45,27,30,0.42)' }}>
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

              <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(45,27,30,0.12), transparent)' }} />

              {/* 내 사주 공유하기 */}
              <ShareButtons name={data.userName} />
            </div>

          </div>
        )}
      </div>

      <GungHapInputModal isOpen={isGungHapModalOpen} onClose={() => setIsGungHapModalOpen(false)} />
    </div>
  );
}
