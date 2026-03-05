'use client';

import { useState } from 'react';
import { BookOpen, Briefcase, Heart, Sparkles, MessageCircle, UserSearch } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AnalysisData {
  overall: string;
  career: string;
  love: string;
  advice: string;
  tenStars?: string;
}

export default function AnalysisTabs({ data, isLoading }: { data: AnalysisData | null; isLoading: boolean }) {
  const [activeTab, setActiveTab] = useState<'overall' | 'career' | 'love' | 'advice' | 'tenStars'>('overall');

  const tabs = [
    { id: 'overall', label: '종합 총평', icon: BookOpen },
    { id: 'tenStars', label: '핵심 기질', icon: UserSearch },
    { id: 'career', label: '직업·재물', icon: Briefcase },
    { id: 'love', label: '연애·관계', icon: Heart },
    { id: 'advice', label: '올해의 조언', icon: MessageCircle },
  ] as const;

  return (
    <div className="bg-primary-950 text-white rounded-[2rem] shadow-2xl relative overflow-hidden min-h-[480px] flex flex-col">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-800 rounded-full blur-[100px] opacity-30 -mr-20 -mt-20 pointer-events-none" />
      
      <div className="relative z-10 p-8 sm:px-12 sm:pt-12 sm:pb-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="bg-gold-500 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary-950" />
          </div>
          <h2 className="text-2xl font-bold text-serif">AI 심층 카운셀링</h2>
        </div>

        <div className="flex flex-wrap gap-2 p-1 bg-primary-900/50 rounded-2xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                activeTab === tab.id
                  ? "bg-gold-500 text-primary-950 shadow-lg"
                  : "text-primary-200 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex-1 px-8 pb-8 sm:px-12 sm:pb-12">
        <div className="relative min-h-[220px]">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-primary-800 rounded w-full" />
              <div className="h-4 bg-primary-800 rounded w-5/6" />
              <div className="h-4 bg-primary-800 rounded w-4/6" />
              <div className="h-4 bg-primary-800 rounded w-full" />
              <p className="text-sm text-gold-500/80 mt-8 font-medium">십성과 오행의 상호작용을 분석하여 고유한 운명 지도를 그리고 있습니다...</p>
            </div>
          ) : data ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <p className="text-primary-50/90 leading-relaxed text-lg whitespace-pre-wrap">
                {data[activeTab] || "분석 내용이 없습니다."}
              </p>
            </div>
          ) : (
            <p className="text-primary-400 italic">분석 데이터를 불러오지 못했습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
