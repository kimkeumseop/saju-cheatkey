'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import AnalysisAccordion from '@/components/AnalysisAccordion';
import ShareButtons from '@/components/ShareButtons';
import GungHapPreview from '@/components/GungHapPreview';
import PaymentWidget from '@/components/PaymentWidget';
import { Loader2, Sparkles, Layout, Lock, Zap, ChevronRight, AlertCircle, Heart, Coins, BarChart3, Star, History } from 'lucide-react';
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
      {title && <h4 className="text-center font-black text-[#3C1E1E] text-lg">{title}</h4>}
      <div className="grid grid-cols-4 gap-2 md:gap-4 relative z-10">
        {pillars.map((p: any, colIdx: number) => {
          const isDayPillar = p.label === '일주';
          return (
            <div key={colIdx} className="space-y-3">
              <div className="text-center space-y-1">
                <div className="text-[10px] font-black text-gray-400 tracking-tighter opacity-80">{p.label}</div>
                <div className="text-[11px] font-black text-[#3C1E1E]">{p.tenGodGan}</div>
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
                    isDayPillar ? "border-[#FEE500] shadow-xl shadow-[#FEE500]/20" : "border-white"
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
                    "p-3 md:p-8 rounded-[1.5rem] md:rounded-[3rem] flex flex-col items-center justify-center gap-1 md:gap-2 shadow-md border-[2px] md:border-[4px] border-white transition-all duration-300"
                  )}>
                    <span className="text-2xl md:text-7xl font-sans font-black leading-none tracking-tight">
                      {p.isUnknown ? '?' : p.zhiKo}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1 mt-2">
                <div className="text-[11px] font-black text-[#3C1E1E]">{p.tenGodZhi}</div>
                <div className="text-[10px] font-bold text-gray-400">{p.unSeong}</div>
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
    { label: '木 (목)', key: '木', color: ELEMENT_STYLE['木'].color, bg: 'bg-[#E8F5E9]' },
    { label: '火 (화)', key: '火', color: ELEMENT_STYLE['火'].color, bg: 'bg-[#FFEBEE]' },
    { label: '土 (토)', key: '土', color: ELEMENT_STYLE['土'].color, bg: 'bg-[#FFF8E1]' },
    { label: '金 (금)', key: '金', color: ELEMENT_STYLE['金'].color, bg: 'bg-[#FAFAFA]' },
    { label: '水 (수)', key: '水', color: ELEMENT_STYLE['水'].color, bg: 'bg-[#E3F2FD]' },
  ];

  const total = Object.values(counts).reduce((a: any, b: any) => a + b, 0) as number;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {elements.map((el) => {
        const count = counts[el.key] || 0;
        const percent = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={el.key} className={cn(el.bg, "p-4 rounded-3xl space-y-3 border border-white/50")}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-gray-600">{el.label}</span>
              <span className="text-sm font-black" style={{ color: el.color }}>{count}개</span>
            </div>
            <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000" 
                style={{ width: `${percent}%`, backgroundColor: el.color }}
              />
            </div>
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
          if (id.startsWith('local_')) {
            localStorage.setItem(`saju_result_${id}`, JSON.stringify(fetchedData));
          }
        }

        if (fetchedData) {
          setData(fetchedData);
        } else {
          alert('데이터를 찾을 수 없습니다.');
          router.push('/');
        }
      } catch (error) {
        console.error('로드 오류:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-[#FEE500] animate-spin stroke-[3]" />
        <p className="mt-4 text-gray-500 font-bold">결과 리포트 분석 중...</p>
      </div>
    );
  }

  if (!data) return null;

  const isCompatibility = data.type === 'compatibility';
  const isUnlocked = data.isPaid || isAdmin;
  const saju = isCompatibility ? data.saju1 : data.sajuData;

  return (
    <div className="min-h-screen bg-[#F7F8FA] pt-24 pb-32 px-4 md:px-6">
      <Navbar />
      
      <div className="max-w-4xl mx-auto space-y-12">
        {isCompatibility ? (
          <GungHapPreview data={{...data, isPaid: isUnlocked}} resultId={id} />
        ) : (
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FEE500] text-[#3C1E1E] text-sm font-bold shadow-sm">
                <Sparkles className="w-4 h-4" />
                전문가급 명리학 심층 분석 리포트
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                <span className="text-[#3C1E1E] bg-[#FEE500] px-2 rounded-lg">{data.userName}</span> 님의 치트키
              </h1>
            </div>

            {/* 1. 만세력 섹션 */}
            <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border border-gray-100 space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl -mr-32 -mt-32" />
              
              <div className="text-center space-y-1 relative z-10">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">나의 인생 설계도</h3>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Manseyrok Chart</p>
              </div>

              <PillarChart pillars={saju.pillars} />

              {/* 오행 분포 */}
              <div className="pt-8 border-t border-gray-50 space-y-6">
                <div className="flex items-center gap-2 ml-1">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-black text-[#3C1E1E]">오행 분포 분석</span>
                </div>
                <ElementsChart counts={saju.elementsCount} />
              </div>

              {/* 핵심 신살 칩 */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 ml-1">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-black text-[#3C1E1E]">나의 핵심 귀인 & 신살</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {saju.keyShinsal.map((s: string) => (
                    <div key={s} className="px-4 py-2 rounded-2xl bg-indigo-50 text-indigo-600 text-xs font-black border border-indigo-100 shadow-sm">
                      #{s}
                    </div>
                  ))}
                  {saju.keyShinsal.length === 0 && <p className="text-xs text-gray-400 font-bold ml-1 italic">분석된 특이 신살이 없습니다.</p>}
                </div>
              </div>
            </div>

            {/* 2. 대운 타임라인 */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-lg border border-gray-100 space-y-8">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-500" />
                <h3 className="text-xl font-black text-[#3C1E1E]">대운 (10년 주기의 흐름)</h3>
              </div>
              
              <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
                {saju.daYun.map((dy: any, idx: number) => (
                  <div key={idx} className="flex-shrink-0 w-24 space-y-3">
                    <div className="text-center text-[10px] font-black text-gray-400">{dy.age}세~</div>
                    <div className="space-y-1.5">
                      <div className={cn(dy.ganColor.bg, dy.ganColor.text, "h-12 rounded-xl flex items-center justify-center font-black text-lg border border-white shadow-sm")}>
                        {dy.ganKo}
                      </div>
                      <div className={cn(dy.zhiColor.bg, dy.zhiColor.text, "h-12 rounded-xl flex items-center justify-center font-black text-lg border border-white shadow-sm")}>
                        {dy.zhiKo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 font-bold text-center italic">* 대운은 만나이 기준으로 운의 큰 흐름이 바뀌는 시점을 나타냅니다.</p>
            </div>

            {/* 3. 분석 리포트 페이월 */}
            <div className="space-y-8 relative">
              <div className="flex items-center gap-3 ml-2">
                <Layout className="w-6 h-6 text-[#3C1E1E]" />
                <h3 className="text-2xl font-bold text-gray-900">심층 분석 리포트</h3>
              </div>

              {isUnlocked ? (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  {(() => {
                    const themes = [
                      { key: 'headline', theme: '한 줄 요약', title: '운명의 헤드라인', icon: '📢' },
                      { key: 'nickname', theme: '조선 MBTI', title: '당신의 정체성', icon: '👤' },
                      { key: 'packPok', theme: '본질 팩폭', title: '성격과 야망 분석', icon: '🧠' },
                      { key: 'mbtiAnalysis', theme: 'MBTI 싱크로율', title: '사주와 성향의 연결', icon: '🧬' },
                      { key: 'cheatKey', theme: '인생 치트키', title: '2026년 행동 지침', icon: '🗓️' }
                    ];
                    const displayData = themes.map(t => ({
                      theme: t.theme,
                      title: t.title,
                      icon: t.icon,
                      content: data.aiResult[t.key] || '분석 내용을 불러오지 못했습니다.'
                    }));
                    return <AnalysisAccordion data={displayData} />;
                  })()}
                </div>
              ) : (
                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-gray-100 space-y-10 relative overflow-hidden">
                  <div className="flex items-center justify-between bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                        <Coins className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">보유 치트키</p>
                        <p className="text-lg font-black text-[#3C1E1E]">{userCheatKeys} 개</p>
                      </div>
                    </div>
                    <div className="h-10 w-px bg-gray-200" />
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">필요 치트키</p>
                      <p className="text-lg font-black text-[#3C1E1E]">1 개</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-red-500 font-black text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>충격 주의: 당신의 진짜 모습은 이게 아닙니다</span>
                    </div>
                    <h4 className="text-2xl md:text-3xl font-black text-[#3C1E1E] leading-tight">
                      "{data.userName}님, 사실 <span className="text-red-500 underline underline-offset-4">숨겨진 대박 기회</span>가 따로 있다는 거 아시나요?"
                    </h4>
                  </div>

                  <div className="bg-[#3C1E1E] rounded-[2.5rem] p-8 text-center shadow-2xl relative overflow-hidden group">
                    <div className="space-y-6 relative z-10">
                      <div className="flex items-center justify-center gap-2 text-[#FEE500]">
                        <Zap className="w-6 h-6 fill-[#FEE500]" />
                        <span className="font-black text-xs tracking-widest uppercase italic">Destiny CheatKey</span>
                      </div>
                      <h2 className="text-white text-2xl md:text-3xl font-black leading-tight">
                        <span className="text-[#FEE500]">777원</span>으로 <br/>
                        인생의 치트키를 켜세요!
                      </h2>
                      <button 
                        onClick={() => setShowPaymentWidget(true)}
                        className="w-full bg-[#FEE500] hover:bg-[#FDD000] text-[#3C1E1E] py-6 rounded-2xl font-black text-xl shadow-lg transition-all active:scale-[0.95] flex items-center justify-center gap-3"
                      >
                        치트키 충전하기 (777원)
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6 opacity-40 select-none pointer-events-none filter blur-[8px]">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-100 rounded-full w-full" />
                      <div className="h-4 bg-gray-100 rounded-full w-5/6" />
                      <div className="h-4 bg-gray-100 rounded-full w-4/6" />
                    </div>
                  </div>
                </div>
              )}

              {showPaymentWidget && (
                <PaymentWidget resultId={id} onCancel={() => setShowPaymentWidget(false)} />
              )}

              <div className="mt-12 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
                <ShareButtons name={data.userName} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
