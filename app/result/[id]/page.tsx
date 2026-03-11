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

// 오행별 감성 키워드 매핑
const ELEMENT_INFO: Record<string, { emoji: string; keyword: string; desc: string }> = {
  '木': { emoji: '🌱', keyword: '성장', desc: '새로운 시작과 성장' },
  '火': { emoji: '🔥', keyword: '열정', desc: '확산하는 에너지와 열정' },
  '土': { emoji: '⛰️', keyword: '안정', desc: '든든한 기반과 안정' },
  '金': { emoji: '💎', keyword: '결실', desc: '단호한 결단과 결실' },
  '水': { emoji: '💧', keyword: '지혜', desc: '깊은 통찰과 지혜' },
};

export default function SajuResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDaeunIdx, setSelectedDaeunIdx] = useState<number | null>(null);

  // 뒤로가기 감지 시 홈으로 이동
  useEffect(() => {
    const handlePopState = () => {
      window.location.href = '/';
    };
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
          // 현재 나이에 해당하는 대운 찾기
          const userAge = 25; // 기본값 (실제 로직에서는 생년월일로 계산 가능)
          const currentIdx = fetchedData.sajuData?.daYun?.findIndex((dy: any, i: number, arr: any[]) => {
            const nextAge = arr[i+1]?.age || 100;
            return userAge >= dy.age && userAge < nextAge;
          });
          setSelectedDaeunIdx(currentIdx !== -1 ? currentIdx : 0);
        }
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
  const saju = isCompatibility ? data.saju1 : data.sajuData;

  return (
    <div className="min-h-screen bg-[#FFF5F7] pt-24 pb-32 px-4 md:px-6">
      <Navbar />
      <div className="max-w-4xl mx-auto space-y-12">
        {isCompatibility ? (
          <GungHapPreview data={{...data, isPaid: true}} resultId={id} />
        ) : (
          <div className="space-y-12">
            {/* 상단 타이틀 생략 (동일) */}
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-bold shadow-sm">
                <Moon className="w-4 h-4 fill-primary-400 text-primary-400" />
                신비로운 영혼의 리포트
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                <span className="text-primary-900 px-2">{data.userName}</span> 님의 운명
              </h1>
            </div>

            {/* 만세력 설계도 생략 (동일) */}
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

            {/* 개편된 대운 UI */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-lg border border-pink-50 space-y-8 relative overflow-hidden">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary-500" />
                  <h3 className="text-xl font-black text-primary-900">대운 (10년 주기의 흐름)</h3>
                </div>
                <p className="text-[13px] text-gray-400 font-medium leading-relaxed ml-7">
                  💡 대운(大運)은 내 인생의 **'계절과 배경'**이 변하는 시점이에요. <br className="hidden md:block" />
                  박스를 클릭해 각 시기별 에너지를 확인해 보세요!
                </p>
              </div>

              <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar -mx-2 px-2">
                {saju?.daYun?.map((dy: any, idx: number) => {
                  const ganInfo = ELEMENT_INFO[dy.ganElement] || { emoji: '✨', keyword: '기운', desc: '' };
                  const zhiInfo = ELEMENT_INFO[dy.zhiElement] || { emoji: '✨', keyword: '기운', desc: '' };
                  const isSelected = selectedDaeunIdx === idx;
                  const ganStyle = dy.ganColor || getSafeColor(dy.ganElement);
                  const zhiStyle = dy.zhiColor || getSafeColor(dy.zhiElement);

                  return (
                    <button 
                      key={idx} 
                      onClick={() => setSelectedDaeunIdx(idx)}
                      className={cn(
                        "flex-shrink-0 w-28 md:w-32 transition-all duration-300 rounded-[2rem] p-4 border-2 group",
                        isSelected 
                          ? "bg-rose-50/50 border-rose-300 shadow-lg scale-105 z-10" 
                          : "bg-white border-pink-50 hover:border-pink-200"
                      )}
                    >
                      <div className={cn(
                        "text-center text-[11px] font-black mb-3 transition-colors",
                        isSelected ? "text-rose-500" : "text-gray-300"
                      )}>
                        {dy.age}세~
                      </div>
                      
                      <div className="space-y-3">
                        {/* 천간 키워드 박스 */}
                        <div className={cn(
                          ganStyle.bg, ganStyle.text, 
                          "h-14 rounded-2xl flex flex-col items-center justify-center border border-white shadow-sm relative overflow-hidden"
                        )}>
                          <span className="text-sm opacity-50 absolute top-1 right-1 font-bold">{dy.ganKo}</span>
                          <span className="text-lg mb-0.5">{ganInfo.emoji}</span>
                          <span className="text-xs font-black tracking-tighter">{ganInfo.keyword}</span>
                        </div>
                        
                        {/* 지지 키워드 박스 */}
                        <div className={cn(
                          zhiStyle.bg, zhiStyle.text, 
                          "h-14 rounded-2xl flex flex-col items-center justify-center border border-white shadow-sm relative overflow-hidden"
                        )}>
                          <span className="text-sm opacity-50 absolute top-1 right-1 font-bold">{dy.zhiKo}</span>
                          <span className="text-lg mb-0.5">{zhiInfo.emoji}</span>
                          <span className="text-xs font-black tracking-tighter">{zhiInfo.keyword}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 시각적 피드백 문장 영역 */}
              {selectedDaeunIdx !== null && saju?.daYun?.[selectedDaeunIdx] && (
                <div className="mt-4 p-6 bg-rose-50/30 rounded-[2rem] border border-rose-100/50 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-center">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-pink-100 text-xl">
                        {ELEMENT_INFO[saju.daYun[selectedDaeunIdx].ganElement]?.emoji}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-pink-100 text-xl">
                        {ELEMENT_INFO[saju.daYun[selectedDaeunIdx].zhiElement]?.emoji}
                      </div>
                    </div>
                    <p className="text-rose-900 font-bold text-lg md:text-xl break-keep">
                      "<span className="text-rose-500">{ELEMENT_INFO[saju.daYun[selectedDaeunIdx].ganElement]?.keyword}</span>"을(를) 기반으로 
                      "<span className="text-rose-500">{ELEMENT_INFO[saju.daYun[selectedDaeunIdx].zhiElement]?.keyword}</span>"을(를) 쏟아붓는 시기네요!
                    </p>
                  </div>
                  <p className="mt-2 text-center text-xs text-rose-400 font-medium opacity-80">
                    {saju.daYun[selectedDaeunIdx].age}세부터 10년 동안 당신의 삶에 흐르는 주된 에너지입니다.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-8 relative">
              <div className="flex items-center gap-3 ml-2"><Moon className="w-6 h-6 text-primary-600 fill-primary-600" /><h3 className="text-2xl font-bold text-gray-900">운명의 속삭임 리포트</h3></div>
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {(() => {
                  const result = data.aiResult || {};
                  const displayData = result.sections || [
                    { title: result.section1?.title || '기질 분석', content: result.section1?.content || '' },
                    { title: result.section2?.title || '연애운', content: result.section2?.content || '' },
                    { title: result.section3?.title || '재물운', content: result.section3?.content || '' },
                    { title: result.section4?.title || '인간관계', content: result.section4?.content || '' },
                    { title: result.section5?.title || '위로의 메시지', content: result.section5?.content || '' },
                    { title: result.section6?.title || '미래 전망', content: result.section6?.content || '' },
                    { title: result.section7?.title || '행운의 팁', content: result.section7?.content || '' }
                  ].filter(s => s.content);

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
