'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import AnalysisAccordion from '@/components/AnalysisAccordion';
import ShareButtons from '@/components/ShareButtons';
import GungHapPreview from '@/components/GungHapPreview';
import { Loader2, Sparkles, Layout, Lock, Zap, ChevronRight, AlertCircle, Heart } from 'lucide-react';
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
              <div className="text-center text-[8px] md:text-xs font-black text-gray-400 tracking-tighter opacity-80">
                {p.label}
              </div>
              <div className="space-y-2 md:space-y-4">
                <div className={cn(
                  "relative group transition-all duration-500",
                  isDayPillar ? "scale-105 z-20" : "hover:scale-[1.02]"
                )}>
                  <div className={cn(
                    p.ganColor.bg, p.ganColor.text,
                    "p-3 md:p-8 rounded-[1.5rem] md:rounded-[3rem] flex flex-col items-center justify-center gap-1 md:gap-2 shadow-md border-[2px] md:border-[4px] transition-all duration-300",
                    isDayPillar ? "border-pink-400 shadow-xl shadow-pink-100" : "border-white"
                  )}>
                    <span className="text-[10px] md:text-sm font-black opacity-60 mb-[-4px]">{p.ganKo}</span>
                    <span className="text-2xl md:text-7xl font-sans font-black leading-none drop-shadow-md tracking-tight">
                      {p.gan}
                    </span>
                  </div>
                </div>

                <div className="relative group transition-all duration-500 hover:scale-[1.02]">
                  <div className={cn(
                    p.zhiColor.bg, p.zhiColor.text,
                    "p-3 md:p-8 rounded-[1.5rem] md:rounded-[3rem] flex flex-col items-center justify-center gap-1 md:gap-2 shadow-md border-[2px] md:border-[4px] border-white transition-all duration-300"
                  )}>
                    <span className="text-[10px] md:text-sm font-black opacity-60 mb-[-4px]">{p.zhiKo}</span>
                    <span className="text-2xl md:text-7xl font-sans font-black leading-none drop-shadow-md tracking-tight">
                      {p.zhi}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SajuResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id.startsWith('local_')) {
          const localData = localStorage.getItem(`saju_result_${id}`);
          if (localData) {
            setData(JSON.parse(localData));
            setLoading(false);
            return;
          }
        }

        const docRef = doc(db, 'sajuResults', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData(docSnap.data());
        } else {
          const localData = localStorage.getItem(`saju_result_${id}`);
          if (localData) {
            setData(JSON.parse(localData));
          } else {
            alert('결과 데이터를 찾을 수 없습니다.');
            router.push('/');
          }
        }
      } catch (error) {
        console.error('데이터 로드 오류:', error);
        const localData = localStorage.getItem(`saju_result_${id}`);
        if (localData) {
          setData(JSON.parse(localData));
        } else {
          router.push('/');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-[#FEE500] animate-spin stroke-[3]" />
        <p className="mt-4 text-gray-500 font-bold">사주 치트키 불러오는 중...</p>
      </div>
    );
  }

  if (!data) return null;

  const isCompatibility = data.type === 'compatibility';

  return (
    <div className="min-h-screen bg-[#F7F8FA] pt-24 pb-32 px-4 md:px-6">
      <Navbar />
      
      <div className="max-w-4xl mx-auto space-y-12">
        {isCompatibility ? (
          <GungHapPreview data={data} />
        ) : (
          <>
            {/* 상단 헤더 */}
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FEE500] text-[#3C1E1E] text-sm font-bold shadow-sm">
                <Sparkles className="w-4 h-4" />
                MZ세대 맞춤형 전문가 사주 리포트
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                <span className="text-[#3C1E1E] bg-[#FEE500] px-2 rounded-lg">{data.userName}</span> 님의 인생 결과표
              </h1>
              <p className="text-gray-500 flex items-center justify-center gap-4 text-sm md:text-lg font-medium">
                <span>{data.birthDate}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                <span>{data.birthTime} ({data.calendarType === 'solar' ? '양력' : '음력'})</span>
              </p>
            </div>

            {/* 1. 명식표 섹션 */}
            <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-white/50 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100/20 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="text-center space-y-1 relative z-10">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">나의 인생 설계도, 만세력</h3>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Saju Analysis Chart</p>
              </div>
              <PillarChart pillars={data.sajuData.pillars} />
            </div>

            {/* 2. 전문가 분석 결과 */}
            <div className="space-y-8 relative">
              <div className="flex items-center gap-3 ml-2">
                <Layout className="w-6 h-6 text-[#3C1E1E]" />
                <h3 className="text-2xl font-bold text-gray-900">심층 분석 리포트</h3>
              </div>

              {data.isPaid ? (
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
                  <div className="space-y-4 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-red-500 font-black text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>충격 주의: 당신의 진짜 모습은 이게 아닙니다</span>
                    </div>
                    <h4 className="text-2xl md:text-3xl font-black text-[#3C1E1E] leading-tight break-keep">
                      "{data.userName}님, 사실 <span className="text-red-500 underline decoration-red-200 decoration-8 underline-offset-[-4px]">돈 복이 터지는 시기</span>가 따로 있다는 거 아시나요?"
                    </h4>
                    <p className="text-gray-500 font-bold leading-relaxed">
                      현재 분석된 데이터에 따르면, 당신의 사주에는 남들에게 말하지 못한 엄청난 야망과 함께 조만간 찾아올 역대급 기회가 포착되었습니다.
                    </p>
                  </div>

                  <div className="bg-[#3C1E1E] rounded-[2.5rem] p-8 text-center shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FEE500]/10 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse" />
                    <div className="space-y-6 relative z-10">
                      <div className="flex items-center justify-center gap-2 text-[#FEE500]">
                        <Zap className="w-6 h-6 fill-[#FEE500]" />
                        <span className="font-black text-sm tracking-widest uppercase italic">Unlock Your Destiny</span>
                      </div>
                      <h2 className="text-white text-2xl md:text-3xl font-black break-keep leading-tight">
                        단돈 <span className="text-[#FEE500]">990원</span>으로 <br/>
                        인생의 <span className="text-[#FEE500]">치트키</span>를 켜세요!
                      </h2>
                      <div className="flex flex-col gap-3 max-w-xs mx-auto">
                        <button className="w-full bg-[#FEE500] hover:bg-[#FDD000] text-[#3C1E1E] py-6 rounded-2xl font-black text-xl shadow-lg transition-all active:scale-[0.95] flex items-center justify-center gap-3 group">
                          리포트 전체 열람하기
                          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* 가려진 미리보기 (Blur) */}
                  <div className="space-y-6 opacity-40 select-none pointer-events-none filter blur-[6px]">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-100 rounded-full w-full" />
                      <div className="h-4 bg-gray-100 rounded-full w-5/6" />
                    </div>
                  </div>
                </div>
              )}

              {/* 하단 공유 */}
              <div className="mt-12 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 text-center">
                <ShareButtons name={data.userName} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
