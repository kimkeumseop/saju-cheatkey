'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ShareButtons from '@/components/ShareButtons';
import { calculateSaju, OHAENG_COLORS } from '@/lib/saju';
import { Sparkles, Loader2, Calendar, User, TrendingUp, Heart, Briefcase, Info, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function SajuContent() {
  const searchParams = useSearchParams();
  const [sajuData, setSajuData] = useState<any>(null);
  const [aiResult, setAiResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    const name = searchParams.get('name') || '방문자';
    const birthDate = searchParams.get('birthDate');
    const birthTime = searchParams.get('birthTime') || '12:00';
    const calendarType = searchParams.get('calendarType') || 'solar';
    const gender = searchParams.get('gender') || 'male';

    if (birthDate) {
      const data = calculateSaju(birthDate, birthTime, calendarType, gender);
      setSajuData({ ...data, userName: name });
      analyzeWithAi(data, name);

      // 최근 분석 기록 저장
      if (typeof window !== 'undefined') {
        const newHistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          birthDate,
          birthTime,
          calendarType,
          gender,
          timestamp: Date.now()
        };
        const saved = localStorage.getItem('saju_history');
        let history = saved ? JSON.parse(saved) : [];
        history = history.filter((item: any) => !(item.name === name && item.birthDate === birthDate));
        history.unshift(newHistoryItem);
        localStorage.setItem('saju_history', JSON.stringify(history.slice(0, 10)));
      }
    }
  }, [searchParams]);

  const analyzeWithAi = async (data: any, name: string) => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sajuData: data.rawSaju, userName: name }),
      });
      const result = await response.json();
      setAiResult(result);
    } catch (error) {
      console.error('AI 분석 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!sajuData) return null;

  const tabs = [
    { id: 'basic', label: '사주 풀이', icon: Info },
    { id: 'overall', label: '종합 총평', icon: User },
    { id: 'career', label: '직업·재물', icon: Briefcase },
    { id: 'love', label: '연애·관계', icon: Heart },
    { id: 'advice', label: '올해의 조언', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-20 px-4 md:px-6">
      <Navbar />
      
      <div className="max-w-5xl mx-auto space-y-10">
        {/* 상단 헤더: 이름 & 생년월일 정보 */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            현대적 명리 심리 분석 리포트
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white text-serif">
            <span className="text-gold-400">{sajuData.userName}</span> 님의 인생 지도
          </h1>
          <p className="text-gray-400 flex items-center justify-center gap-4 text-sm md:text-base">
            <span>{searchParams.get('birthDate')}</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>{searchParams.get('birthTime')} ({searchParams.get('calendarType') === 'solar' ? '양력' : '음력'})</span>
          </p>
        </div>

        {/* 1. 명식표 (8글자 카드) */}
        <div className="grid grid-cols-4 gap-3 md:gap-6">
          {sajuData.sajuBreakdown.map((column: any, idx: number) => (
            <div key={idx} className="space-y-3">
              <div className="text-center text-xs font-bold text-gray-500 tracking-widest uppercase">{column.title}</div>
              <div className="space-y-3">
                {column.items.map((item: any, i: number) => (
                  <div 
                    key={i} 
                    className="glass-card p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/10 flex flex-col items-center justify-center gap-2 hover:border-gold-500/30 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-2xl md:text-4xl font-bold text-serif relative z-10" style={{ color: item.color }}>{item.char}</span>
                    <span className="text-xs md:text-sm text-gray-400 font-medium relative z-10">{item.sound}</span>
                    <span className="absolute top-2 right-2 text-[10px] md:text-xs text-gray-600 opacity-50 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 2. 오행 분석 차트 (심플형) */}
        <div className="glass-panel p-8 rounded-[2.5rem] border border-white/10">
          <h3 className="text-lg font-bold text-gray-200 mb-8 flex items-center gap-2 text-serif">
            <div className="w-1.5 h-6 bg-gold-500 rounded-full" />
            오행(五行) 분포 분석
          </h3>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(sajuData.ohaengCount).map(([key, count]: any) => (
              <div key={key} className="space-y-3 flex flex-col items-center">
                <div 
                  className="w-full rounded-2xl flex items-end justify-center px-1 overflow-hidden bg-white/5 relative"
                  style={{ height: '120px' }}
                >
                  <div 
                    className="w-full rounded-t-xl transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    style={{ 
                      height: `${(count / 8) * 100}%`, 
                      backgroundColor: OHAENG_COLORS[key],
                      opacity: count > 0 ? 1 : 0.2
                    }} 
                  />
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-gray-200">{key}</div>
                  <div className="text-xs text-gray-500">{count}개</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. AI 심층 상담 (5-탭 시스템) */}
        <div className="space-y-6">
          <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-black/40 rounded-[2rem] border border-white/5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all",
                  activeTab === tab.id 
                    ? "bg-gold-600 text-white shadow-lg shadow-gold-900/20" 
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] border border-white/10 min-h-[400px] relative overflow-hidden">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/50 backdrop-blur-sm z-20">
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
                  <Sparkles className="w-6 h-6 text-gold-400 absolute -top-2 -right-2 animate-bounce" />
                </div>
                <p className="text-gray-300 font-medium animate-pulse text-serif">인생의 지도를 읽어내는 중입니다...</p>
              </div>
            ) : aiResult ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 rounded-2xl bg-gold-500/10 border border-gold-500/20">
                    {(() => {
                      const Icon = tabs.find(t => t.id === activeTab)?.icon || Info;
                      return <Icon className="w-6 h-6 text-gold-400" />;
                    })()}
                  </div>
                  <h4 className="text-xl font-bold text-white text-serif">{tabs.find(t => t.id === activeTab)?.label}</h4>
                </div>
                
                <div className="space-y-6">
                  {aiResult[activeTab]?.split('\n').map((paragraph: string, i: number) => (
                    <p key={i} className="text-gray-300 leading-[1.9] text-lg font-light break-keep indent-2 first:first-letter:text-3xl first:first-letter:font-bold first:first-letter:text-gold-400 first:first-letter:mr-1">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <ShareButtons name={sajuData.userName} />

                <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center">
                  <p className="text-xs text-gray-500 italic">※ 명리학 분석은 삶의 방향을 제안할 뿐, 모든 선택은 본인의 몫입니다.</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">분석 데이터를 불러오지 못했습니다.</div>
            )}
          </div>
        </div>
      </div>

      {/* 배경 장식 */}
      <div className="fixed top-1/4 -right-20 w-[40vw] h-[40vw] bg-gold-900/5 blur-[150px] rounded-full z-[-1] pointer-events-none" />
      <div className="fixed bottom-1/4 -left-20 w-[40vw] h-[40vw] bg-primary-900/5 blur-[150px] rounded-full z-[-1] pointer-events-none" />
    </div>
  );
}

export default function SajuResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-10 h-10 text-gold-500 animate-spin" /></div>}>
      <SajuContent />
    </Suspense>
  );
}
