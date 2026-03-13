'use client';

import { useState } from 'react';
import { Sparkles, Heart, Zap, ChevronRight, AlertCircle, Layout, BarChart3, Star, History, Coins, Moon } from 'lucide-react';
import AnalysisAccordion from './AnalysisAccordion';
import ShareButtons from './ShareButtons';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ELEMENT_STYLE } from '@/lib/saju';
import { normalizeGunghapAiResult } from '@/lib/ai-result';
import { motion } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getSafeColor = (elementKey: string) => {
  return ELEMENT_STYLE[elementKey] || { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-100', color: '#999999' };
};

function PillarChart({ pillars, title, themeColor = 'primary', isTimeUnknown }: { pillars: any[], title?: string, themeColor?: 'primary' | 'blue' | 'pink', isTimeUnknown?: boolean }) {
  const borderColor = themeColor === 'blue' ? 'border-blue-200' : themeColor === 'pink' ? 'border-pink-200' : 'border-primary-200';
  return (
    <div className="space-y-4">
      {title && <h4 className="text-center font-black text-primary-900 text-sm md:text-base">{title}</h4>}
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
                <div className="text-[8px] md:text-[10px] font-black text-gray-300 tracking-tighter opacity-80 uppercase">{p.label}</div>
                <div className="text-[9px] md:text-[11px] font-black text-primary-800">{showDash ? '-' : p.tenGodGan}</div>
              </div>
              <div className="space-y-1.5 md:space-y-3">
                <div className={cn(ganStyle.bg, ganStyle.text, "p-2.5 md:p-6 rounded-[1.2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center border-[2px] md:border-[3px] transition-all", isDayPillar ? cn("scale-105 z-10", borderColor) : "border-white shadow-sm")}>
                  <span className="text-xl md:text-5xl font-sans font-black leading-none tracking-tight">{showDash ? '-' : p.ganKo}</span>
                </div>
                <div className={cn(zhiStyle.bg, zhiStyle.text, "p-2.5 md:p-6 rounded-[1.2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center border-[2px] md:border-[3px] border-white shadow-sm overflow-hidden relative")}>
                  {!showDash && <span className="text-xs md:text-xl absolute top-1 right-1 opacity-10">{p.zodiacIcon}</span>}
                  <span className="text-xl md:text-5xl font-sans font-black leading-none tracking-tight relative z-10">{showDash ? '-' : p.zhiKo}</span>
                </div>
              </div>
              <div className="text-center space-y-0.5 mt-1">
                <div className="text-[9px] md:text-[11px] font-black text-primary-800">{showDash ? '-' : p.tenGodZhi}</div>
                <div className="text-[8px] md:text-[10px] font-bold text-primary-300">{showDash ? '-' : p.unSeong}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScoreGauge({ score = 0 }: { score: number }) {
  const getColors = (s: number) => {
    if (s >= 90) return { text: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' };
    if (s >= 70) return { text: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' };
    if (s >= 50) return { text: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { text: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' };
  };
  const colors = getColors(score);
  return (
    <div className="relative flex flex-col items-center justify-center py-12">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10">
        <div className="absolute inset-0 flex items-center justify-center -z-10 blur-3xl opacity-20 bg-rose-400 rounded-full" />
        <div className={cn("w-40 h-40 md:w-56 md:h-40 rounded-full flex flex-col items-center justify-center gap-1 border-4 shadow-2xl bg-white", colors.border)}>
          <span className="text-[10px] font-black text-primary-300 uppercase tracking-widest leading-none">Destiny Match</span>
          <div className="flex items-end gap-1"><span className={cn("text-6xl md:text-7xl font-black tracking-tighter leading-none", colors.text)}>{score}</span><span className="text-xl font-black text-primary-200 mb-1">점</span></div>
          <div className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm", colors.bg, colors.text)}>
            {score >= 90 ? 'Soulmates' : score >= 70 ? 'Great' : score >= 50 ? 'Not Bad' : 'Danger'}
          </div>
        </div>
      </motion.div>
      <div className="w-full max-w-[240px] mt-8 space-y-2">
        <div className="flex justify-between px-1"><span className="text-[9px] font-black text-primary-200 uppercase tracking-widest">Synergy Level</span><span className="text-[9px] font-black text-primary-400">{score}%</span></div>
        <div className="h-3 w-full bg-primary-50 rounded-full overflow-hidden border border-pink-100 shadow-inner p-0.5">
          <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-rose-300 to-rose-500 rounded-full shadow-sm" />
        </div>
      </div>
    </div>
  );
}

export default function GungHapPreview({ data }: { data: any, resultId: string }) {
  const { user1, user2, saju1, saju2, relation } = data;
  const aiResult = normalizeGunghapAiResult(data.aiResult);
  const score = aiResult.compatibilityScore || 0;
  const relationLabels: Record<string, string> = {
    friend: '친구', some: '썸남 썸녀', couple: '연인', spouse: '배우자', 'ex-couple': '전여친 전남친', 'ex-spouse': '전아내 전남편',
    family: '부모와 자녀', siblings: '형제/자매', colleague: '직장 동료', partner: '사업 파트너', idol: '아이돌과 팬', etc: '기타'
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
  const getDisplayTime = (user: any, unknown: boolean) => (unknown ? '' : (user?.birthTime || user?.time || ''));

  return (
    <div className="space-y-10">
      <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-pink-50 relative overflow-hidden mt-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
        <ScoreGauge score={score} />
        <div className="text-center pb-4"><p className="text-primary-900 font-black text-lg leading-tight break-keep">"{aiResult.headline || '두 사람의 운명이 선명하게 겹쳐지네요.'}"</p></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[{ label: '나', user: user1, saju: normalizedSaju1, unknown: isUser1TimeUnknown }, { label: '그대', user: user2, saju: normalizedSaju2, unknown: isUser2TimeUnknown }].map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-[2rem] border border-pink-50 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><div className={cn("w-2 h-2 rounded-full", idx === 0 ? "bg-blue-400" : "bg-pink-400")} /><span className="text-[10px] font-black text-primary-200 uppercase tracking-widest">{item.label}</span></div>
              <span className="text-[10px] font-black text-primary-800">{item.saju.dayGanKo}일간</span>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-black text-primary-900">{item.user.name}</p>
              <p className="text-[10px] text-primary-300 font-bold">
                {item.user.birthDate} {getDisplayTime(item.user, item.unknown)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 bg-white py-4 rounded-2xl border border-pink-50 shadow-sm">
        <Heart className="w-5 h-5 text-rose-500 fill-current" />
        <span className="font-black text-primary-900 leading-none mt-0.5">관계: {relationLabels[relation] || '궁합'}</span>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border border-pink-50 space-y-12">
        <div className="text-center space-y-1"><h3 className="text-2xl font-black text-primary-900 tracking-tight text-serif">영혼의 설계도 대조</h3><p className="text-[10px] font-black text-primary-200 uppercase tracking-[0.3em]">Manseyrok Comparison</p></div>
        <div className="space-y-16">
          <PillarChart pillars={normalizedSaju1.pillars} title={`${user1.name}님의 기운`} themeColor="blue" isTimeUnknown={isUser1TimeUnknown} />
          <div className="flex items-center justify-center py-2 relative"><div className="h-px bg-pink-100 flex-1" /><div className="px-6 py-2 bg-primary-50 rounded-full text-[10px] font-black text-primary-400 italic flex items-center gap-2 shadow-sm border border-pink-100"><Moon className="w-3 h-3 fill-primary-300" /> WHISPER OF FATE</div><div className="h-px bg-pink-100 flex-1" /></div>
          <PillarChart pillars={normalizedSaju2.pillars} title={`${user2.name}님의 기운`} themeColor="pink" isTimeUnknown={isUser2TimeUnknown} />
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-3 ml-2"><Moon className="w-6 h-6 text-primary-600 fill-primary-600" /><h3 className="text-2xl font-bold text-gray-900">운명적인 인연의 리포트</h3></div>
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <AnalysisAccordion data={aiResult.sections} />
        </div>
      </div>

      <div className="mt-12 bg-white p-8 rounded-[2.5rem] border border-pink-50 shadow-sm text-center"><ShareButtons name={`${user1.name} & ${user2.name}`} /></div>
    </div>
  );
}
