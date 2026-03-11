'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import AnalysisAccordion from '@/components/AnalysisAccordion';
import ShareButtons from '@/components/ShareButtons';
import GungHapPreview from '@/components/GungHapPreview';
import PaymentWidget from '@/components/PaymentWidget';
import { Loader2, Sparkles, Layout, Lock, Zap, ChevronRight, AlertCircle, Heart, Coins, BarChart3, Star, History, Target, Fingerprint, Moon, Gift } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { ELEMENT_STYLE } from '@/lib/saju';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function PillarChart({ pillars, title }: { pillars: any[], title?: string }) {
  return (
    <div className="space-y-6">
      {title && <h4 className="text-center font-black text-primary-900 text-lg">{title}</h4>}
      <div className="grid grid-cols-4 gap-2 md:gap-4 relative z-10">
        {pillars.map((p: any, colIdx: number) => {
          const isDayPillar = p.label === '일주';
          return (
            <div key={colIdx} className="space-y-3">
              <div className="text-center space-y-1">
                <div className="text-[10px] font-black text-primary-200 tracking-tighter opacity-80 uppercase">{p.label}</div>
                <div className="text-[11px] font-black text-primary-800">{p.tenGodGan}</div>
              </div>
              
              <div className="space-y-2 md:space-y-4">
                {/* 천간 */}
                <div className={cn(
                  "relative group transition-all duration-500",
                  isDayPillar ? "scale-105 z-20" : "hover:scale-[1.02]"
                )}>
                  <div className={cn(
                    p.ganColor.bg, p.ganColor.text,
                    "p-3 md:p-8 rounded-[1.5rem] md:rounded-[3rem] flex flex-col items-center justify-center gap-1 md:gap-2 shadow-md border-[2px] md:border-[4px] transition-all duration-300",
                    isDayPillar ? "border-primary-300 shadow-xl shadow-primary-200/20" : "border-white"
                  )}>
                    <span className="text-2xl md:text-7xl font-sans font-black leading-none tracking-tight">
                      {p.isUnknown ? '?' : p.ganKo}
                    </span>
                  </div>
                </div>

                {/* 지지 */}
                <div className="relative group transition-all duration-500 hover:scale-[1.02]">
                  <div className={cn(
                    p.zhiColor.bg, p.zhiColor.text,
                    "p-3 md:p-8 rounded-[1.5rem] md:rounded-[3rem] flex flex-col items-center justify-center gap-1 md:gap-2 shadow-md border-[2px] md:border-[4px] border-white transition-all duration-300 overflow-hidden"
                  )}>
                    <span className="text-xl absolute top-1 right-1 opacity-20">{p.zodiacIcon}</span>
                    <span className="text-2xl md:text-7xl font-sans font-black leading-none tracking-tight relative z-10">
                      {p.isUnknown ? '?' : p.zhiKo}
                    </span>
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
    { label: '목', key: '木', color: ELEMENT_STYLE['木'].color, bg: 'bg-[#E8F5E9]' },
    { label: '화', key: '火', color: ELEMENT_STYLE['火'].color, bg: 'bg-[#FFEBEE]' },
    { label: '토', key: '土', color: ELEMENT_STYLE['土'].color, bg: 'bg-[#FFF8E1]' },
    { label: '금', key: '金', color: ELEMENT_STYLE['金'].color, bg: 'bg-[#FAFAFA]' },
    { label: '수', key: '水', color: ELEMENT_STYLE['수'].color, bg: 'bg-[#E3F2FD]' },
  ];

  const total = Object.values(counts).reduce((a: any, b: any) => a + b, 0) as number;

  return (
    <div className="grid grid-cols-5 gap-2">
      {elements.map((el) => {
        const count = counts[el.key] || 0;
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
  const searchParams = useSearchParams();
  const { user, userCheatKeys } = useAuth();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentWidget, setShowPaymentWidget] = useState(false);

  const ADMIN_EMAIL = 'oops676@gmail.com';
  const isAdmin = user?.email === ADMIN_EMAIL;

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

        if (fetchedData && searchParams.get('payment') === 'success') {
          fetchedData.isPaid = true;
          if (id.startsWith('local_')) localStorage.setItem(`saju_result_${id}`, JSON.stringify(fetchedData));
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
  }, [id, router, searchParams]);

  if (loading) return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="w-12 h-12 text-primary-400 animate-spin stroke-[3]" />
      <p className="mt-4 text-primary-400 font-bold">운명의 속삭임을 듣는 중...</p>
    </div>
  );

  if (!data) return null;

  const isCompatibility = data.type === 'compatibility';
  const isUnlocked = data.isPaid || isAdmin;
  const saju = isCompatibility ? data.saju1 : data.sajuData;

  return (
    <div className="min-h-screen bg-[#FFF5F7] pt-24 pb-32 px-4 md:px-6">
      <Navbar />
      
      <div className="max-w-4xl mx-auto space-y-12">
        {isCompatibility ? (
          <GungHapPreview data={{...data, isPaid: isUnlocked}} resultId={id} />
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
              <div className="text-center space-y-1 relative z-10"><h3 className="text-2xl font-black text-primary-900 tracking-tight">인생 설계도 (만세력)</h3><p className="text-[10px] font-black text-primary-200 uppercase tracking-[0.3em]">Manseyrok INFOGRAPHIC</p></div>

              <PillarChart pillars={saju.pillars} />

              <div className="pt-8 border-t border-pink-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 ml-1"><BarChart3 className="w-4 h-4 text-primary-400" /><span className="text-sm font-black text-primary-800">오행 분포</span></div>
                  <ElementsChart counts={saju.elementsCount} />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 ml-1"><Star className="w-4 h-4 text-primary-400" /><span className="text-sm font-black text-primary-800">핵심 귀인 & 신살</span></div>
                  <div className="flex flex-wrap gap-2">
                    {saju.keyShinsal.map((s: string) => <div key={s} className="px-4 py-2 rounded-2xl bg-primary-50 text-primary-600 text-[11px] font-black border border-primary-100 shadow-sm">#{s}</div>)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-lg border border-pink-50 space-y-8">
              <div className="flex items-center gap-2"><History className="w-5 h-5 text-primary-500" /><h3 className="text-xl font-black text-primary-900">대운 (10년 주기의 흐름)</h3></div>
              <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
                {saju.daYun.map((dy: any, idx: number) => (
                  <div key={idx} className="flex-shrink-0 w-24 space-y-3">
                    <div className="text-center text-[10px] font-black text-primary-300">{dy.age}세~</div>
                    <div className="space-y-1.5">
                      <div className={cn(dy.ganColor.bg, dy.ganColor.text, "h-12 rounded-xl flex items-center justify-center font-black text-lg border border-white shadow-sm")}>{dy.ganKo}</div>
                      <div className={cn(dy.zhiColor.bg, dy.zhiColor.text, "h-12 rounded-xl flex items-center justify-center font-black text-lg border border-white shadow-sm")}>{dy.zhiKo}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8 relative">
              <div className="flex items-center gap-3 ml-2"><Moon className="w-6 h-6 text-primary-600 fill-primary-600" /><h3 className="text-2xl font-bold text-gray-900">운명의 속삭임 리포트</h3></div>

              {isUnlocked ? (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  {(() => {
                    const result = data.aiResult;
                    const sectionKeys = ['section1', 'section2', 'section3', 'section4', 'section5', 'section6', 'section7'];
                    
                    // 새로운 7대 섹션 구조로 매핑 (동적 제목 지원)
                    const displayData = sectionKeys.map(key => {
                      const section = result[key];
                      return {
                        theme: section?.title || '신비로운 분석',
                        title: '', // 제목은 theme에 포함됨
                        content: section?.content || '분석 내용을 불러오고 있어요.'
                      };
                    });
                    
                    return <AnalysisAccordion data={displayData} />;
                  })()}
                </div>
              ) : (
                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-pink-50 space-y-10 relative overflow-hidden">
                  <div className="flex items-center justify-between bg-primary-50 p-6 rounded-3xl border border-primary-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center"><Coins className="w-5 h-5 text-primary-500" /></div>
                      <div><p className="text-[10px] font-black text-primary-300 uppercase tracking-widest">보유 치트키</p><p className="text-lg font-black text-primary-800">{userCheatKeys} 개</p></div>
                    </div>
                    <div className="h-10 w-px bg-primary-100" /><div className="text-right"><p className="text-[10px] font-black text-primary-300 uppercase tracking-widest">필요 치트키</p><p className="text-lg font-black text-primary-800">1 개</p></div>
                  </div>
                  <div className="space-y-4 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-primary-500 font-black text-sm"><Sparkles className="w-4 h-4 fill-primary-400" /><span>당신을 기다리고 있는 영혼의 목소리</span></div>
                    <h4 className="text-2xl md:text-3xl font-black text-primary-900 leading-tight">"{data.userName}님, 당신의 운명 속에 <span className="text-primary-500 underline underline-offset-4 decoration-primary-200">숨겨진 아름다운 이야기</span>가 있어요."</h4>
                  </div>
                  <div className="bg-primary-900 rounded-[2.5rem] p-8 text-center shadow-2xl relative overflow-hidden group">
                    <div className="space-y-6 relative z-10">
                      <div className="flex items-center justify-center gap-2 text-primary-200"><Moon className="w-6 h-6 fill-primary-300" /><span className="font-black text-xs tracking-widest uppercase italic">Whisper of Destiny</span></div>
                      <h2 className="text-white text-2xl md:text-3xl font-black leading-tight"><span className="text-primary-300">777원</span>으로 <br/>마법 같은 조언을 들어보세요.</h2>
                      <button onClick={() => setShowPaymentWidget(true)} className="w-full bg-primary-500 hover:bg-primary-600 text-white py-6 rounded-2xl font-black text-xl shadow-lg transition-all active:scale-[0.95] flex items-center justify-center gap-3">777원 결제하기<ChevronRight className="w-6 h-6" /></button>
                    </div>
                  </div>
                  <div className="space-y-6 opacity-40 select-none pointer-events-none filter blur-[8px]"><div className="h-4 bg-primary-50 rounded-full w-full" /><div className="h-4 bg-primary-50 rounded-full w-5/6" /><div className="h-4 bg-primary-50 rounded-full w-4/6" /></div>
                </div>
              )}

              {showPaymentWidget && <PaymentWidget resultId={id} onCancel={() => setShowPaymentWidget(false)} />}
              <div className="mt-12 bg-white p-8 rounded-[2.5rem] border border-pink-50 shadow-sm text-center"><ShareButtons name={data.userName} /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
