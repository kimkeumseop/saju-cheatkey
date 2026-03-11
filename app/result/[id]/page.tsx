'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import AnalysisAccordion from '@/components/AnalysisAccordion';
import ShareButtons from '@/components/ShareButtons';
import GungHapPreview from '@/components/GungHapPreview';
import { Loader2, Sparkles, Layout, BarChart3, Star, History, Moon, Gift } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { ELEMENT_STYLE } from '@/lib/saju';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getSafeColor = (elementKey: string) => {
  return ELEMENT_STYLE[elementKey] || { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-100', color: '#999999' };
};

function PillarChart({ pillars, title }: { pillars: any[], title?: string }) {
  return (
    <div className="space-y-6">
      {title && <h4 className="text-center font-black text-primary-900 text-lg">{title}</h4>}
      <div className="grid grid-cols-4 gap-2 md:gap-4 relative z-10">
        {pillars.map((p: any, colIdx: number) => {
          const isDayPillar = p.label === '일주';
          const ganStyle = p.ganColor || getSafeColor(p.ganElement);
          const zhiStyle = p.zhiColor || getSafeColor(p.zhiElement);
          
          return (
            <div key={colIdx} className="space-y-3">
              <div className="text-center space-y-1">
                <div className="text-[10px] font-black text-primary-200 tracking-tighter opacity-80 uppercase">{p.label}</div>
                <div className="text-[11px] font-black text-primary-800">{p.tenGodGan}</div>
              </div>
              
              <div className="space-y-2 md:space-y-4">
                <div className={cn("relative transition-all duration-500", isDayPillar ? "scale-105 z-20" : "")}>
                  <div className={cn(ganStyle.bg, ganStyle.text, "p-3 md:p-8 rounded-[1.5rem] md:rounded-[3rem] flex flex-col items-center justify-center border-[2px] md:border-[4px]", isDayPillar ? "border-primary-300 shadow-xl shadow-primary-200/20" : "border-white shadow-sm")}>
                    <span className="text-2xl md:text-7xl font-sans font-black leading-none tracking-tight">{p.isUnknown ? '?' : p.ganKo}</span>
                  </div>
                </div>
                <div className="relative transition-all duration-500">
                  <div className={cn(zhiStyle.bg, zhiStyle.text, "p-3 md:p-8 rounded-[1.5rem] md:rounded-[3rem] flex flex-col items-center justify-center border-[2px] md:border-[4px] border-white shadow-sm overflow-hidden relative")}>
                    <span className="text-xl absolute top-1 right-1 opacity-20">{p.zodiacIcon}</span>
                    <span className="text-2xl md:text-7xl font-sans font-black leading-none tracking-tight relative z-10">{p.isUnknown ? '?' : p.zhiKo}</span>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1 mt-2">
                <div className="text-[11px] font-black text-primary-800">{p.tenGodZhi}</div>
                <div className="text-[10px] font-bold text-primary-300">{p.unSeong}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
          <div key={el.key} className={cn(el.bg, "p-3 rounded-2xl space-y-2 border border-white/50 text-center")}>
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

export default function SajuResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 뒤로가기 감지 시 홈으로 이동
  useEffect(() => {
    const handlePopState = () => {
      window.location.href = '/';
    };
    // 현재 상태를 히스토리에 하나 더 쌓아서 뒤로가기 발생 시 이벤트를 가로챔
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
        if (fetchedData) setData(fetchedData);
        else router.push('/');
      } catch (error) {
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, router]);

  if (loading) return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="w-12 h-12 text-primary-400 animate-spin stroke-[3]" />
      <p className="mt-4 text-primary-400 font-bold">운명의 속삭임을 듣는 중...</p>
    </div>
  );

  if (!data) return null;

  const isCompatibility = data.type === 'compatibility';
  const isUnlocked = true;
  const saju = isCompatibility ? data.saju1 : data.sajuData;

  return (
    <div className="min-h-screen bg-[#FFF5F7] pt-24 pb-32 px-4 md:px-6">
      <Navbar />
      <div className="max-w-4xl mx-auto space-y-12">
        {isCompatibility ? (
          <GungHapPreview data={{...data, isPaid: true}} resultId={id} />
        ) : (
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-bold shadow-sm">
                <Moon className="w-4 h-4 fill-primary-400 text-primary-400" />
                신비로운 영혼의 리포트
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                <span className="text-primary-900 px-2">{data.userName}</span> 님의 운명
              </h1>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border border-pink-50 space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="text-center space-y-1 relative z-10"><h3 className="text-2xl font-black text-primary-900 tracking-tight text-serif">인생 설계도 (만세력)</h3><p className="text-[10px] font-black text-primary-200 uppercase tracking-[0.3em]">Manseyrok INFOGRAPHIC</p></div>
              {saju && <PillarChart pillars={saju.pillars} />}
              <div className="pt-8 border-t border-pink-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 ml-1"><BarChart3 className="w-4 h-4 text-primary-400" /><span className="text-sm font-black text-primary-800">오행 분포</span></div>
                  {saju && <ElementsChart counts={saju.elementsCount} />}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 ml-1"><Star className="w-4 h-4 text-primary-400" /><span className="text-sm font-black text-primary-800">핵심 귀인 & 신살</span></div>
                  <div className="flex flex-wrap gap-2">
                    {saju?.keyShinsal?.map((s: string) => <div key={s} className="px-4 py-2 rounded-2xl bg-primary-50 text-primary-600 text-[11px] font-black border border-primary-100 shadow-sm">#{s}</div>)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-lg border border-pink-50 space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary-500" />
                  <h3 className="text-xl font-black text-primary-900">대운 (10년 주기의 흐름)</h3>
                </div>
                <p className="text-[13px] text-gray-400 font-medium leading-relaxed ml-7">
                  💡 대운(大運)이란? 10년마다 내 인생에 깔리는 '배경화면'이에요. <br className="hidden md:block" />
                  지금 나는 인생의 어떤 계절을 걷고 있는지 색상으로 확인해 보세요!
                </p>
              </div>
              <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">                {saju?.daYun?.map((dy: any, idx: number) => {
                  const style = dy.ganColor || getSafeColor(dy.ganElement);
                  return (
                    <div key={idx} className="flex-shrink-0 w-24 space-y-3">
                      <div className="text-center text-[10px] font-black text-primary-300">{dy.age}세~</div>
                      <div className="space-y-1.5">
                        <div className={cn(style.bg, style.text, "h-12 rounded-xl flex items-center justify-center font-black text-lg border border-white shadow-sm")}>{dy.ganKo}</div>
                        <div className={cn(style.bg, style.text, "h-12 rounded-xl flex items-center justify-center font-black text-lg border border-white shadow-sm")}>{dy.zhiKo}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-8 relative">
              <div className="flex items-center gap-3 ml-2"><Moon className="w-6 h-6 text-primary-600 fill-primary-600" /><h3 className="text-2xl font-bold text-gray-900">운명의 속삭임 리포트</h3></div>
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {(() => {
                  const result = data.aiResult || {};
                  const sectionKeys = ['section1', 'section2', 'section3', 'section4', 'section5', 'section6', 'section7'];
                  const displayData = sectionKeys.map(key => {
                    const section = result[key];
                    return { theme: section?.title || '신비로운 분석', title: '', content: section?.content || '분석 내용을 불러오고 있어요.' };
                  });
                  return <AnalysisAccordion data={displayData} />;
                })()}
              </div>
              <div className="mt-12 bg-white p-8 rounded-[2.5rem] border border-pink-50 shadow-sm text-center"><ShareButtons name={data.userName} /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
