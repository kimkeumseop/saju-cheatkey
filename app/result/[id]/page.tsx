'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import AnalysisAccordion from '@/components/AnalysisAccordion';
import ShareButtons from '@/components/ShareButtons';
import { Loader2, Sparkles, Layout } from 'lucide-react';
import { ELEMENT_STYLE } from '@/lib/saju';

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

  const { userName, birthDate, birthTime, calendarType, sajuData, aiResult } = data;

  return (
    <div className="min-h-screen bg-[#F7F8FA] pt-24 pb-32 px-4 md:px-6">
      <Navbar />
      
      <div className="max-w-4xl mx-auto space-y-12">
        {/* 상단 헤더 */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FEE500] text-[#3C1E1E] text-sm font-bold shadow-sm">
            <Sparkles className="w-4 h-4" />
            MZ세대 맞춤형 전문가 사주 리포트 {id.startsWith('local_') && '(임시저장됨)'}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            <span className="text-[#3C1E1E] bg-[#FEE500] px-2 rounded-lg">{userName}</span> 님의 인생 결과표
          </h1>
          <p className="text-gray-500 flex items-center justify-center gap-4 text-sm md:text-lg font-medium">
            <span>{birthDate}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <span>{birthTime} ({calendarType === 'solar' ? '양력' : '음력'})</span>
          </p>
        </div>

        {/* 1. 명식표 (8글자 바코드 스타일 - 리팩토링 버전) */}
        <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-white/50 space-y-8 relative overflow-hidden">
          {/* 부드러운 배경 데코 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100/20 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl -ml-32 -mb-32" />
          
          <div className="text-center space-y-1 relative z-10">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">내 운명의 8글자 바코드</h3>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Personal Destiny Code</p>
          </div>

          <div className="grid grid-cols-4 gap-2 md:gap-4 relative z-10">
            {sajuData.sajuBreakdown.map((column: any, colIdx: number) => (
              <div key={colIdx} className="space-y-3">
                <div className="text-center text-[10px] md:text-xs font-black text-gray-400 tracking-tighter opacity-80">
                  {column.title}
                </div>
                <div className="space-y-2 md:space-y-4">
                  {column.items.map((item: any, rowIdx: number) => {
                    const style = ELEMENT_STYLE[item.element] || ELEMENT_STYLE['토'];
                    const isDayMaster = colIdx === 2 && rowIdx === 0; // 일간

                    return (
                      <div 
                        key={rowIdx} 
                        className={`
                          relative group transition-all duration-500
                          ${isDayMaster ? 'scale-105 z-20' : 'hover:scale-[1.02]'}
                        `}
                      >
                        {/* '나의 본질' 뱃지 */}
                        {isDayMaster && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap">
                            <span className="bg-gradient-to-r from-pink-500 to-rose-600 text-white text-[10px] md:text-[12px] font-black px-4 py-1.5 rounded-full shadow-lg border-2 border-white flex items-center gap-1.5 animate-bounce">
                              👑 나의 본질
                            </span>
                          </div>
                        )}

                        <div className={`
                          ${style.bg} ${style.text}
                          p-4 md:p-8 rounded-[2rem] md:rounded-[3rem]
                          flex flex-col items-center justify-center gap-2 md:gap-4
                          shadow-md border-[4px] transition-all duration-300
                          ${isDayMaster 
                            ? 'border-pink-400 shadow-xl shadow-pink-100 ring-8 ring-pink-50/50' 
                            : 'border-white group-hover:shadow-lg group-hover:border-gray-100'
                          }
                        `}>
                          {/* 상단: 이모지 + 오행 (인스타 감성 직관적 표시) */}
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 text-[10px] md:text-[13px] font-bold shadow-sm">
                            <span>{item.emoji}</span>
                            <span>{item.elementLabel}</span>
                          </div>
                          
                          {/* 중앙: 한자 (둥글둥글하고 트렌디한 모던 고딕 스타일) */}
                          <span className="text-4xl md:text-7xl font-sans font-black leading-none py-2 md:py-4 drop-shadow-md tracking-tight">
                            {item.char}
                          </span>
                          
                          {/* 하단: 한글 발음 */}
                          <div className="px-3 py-0.5 bg-black/5 rounded-lg">
                            <span className="text-xs md:text-xl font-black tracking-tight opacity-90">
                              {item.sound}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. 전문가 분석 결과 (아코디언) */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 ml-2">
            <Layout className="w-6 h-6 text-[#3C1E1E]" />
            <h3 className="text-2xl font-bold text-gray-900">심층 분석 리포트</h3>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* 데이터 형식 변환 로직 (객체 -> 배열) */}
            {(() => {
              let displayData = [];
              
              if (Array.isArray(aiResult)) {
                displayData = aiResult;
              } else if (typeof aiResult === 'object' && aiResult !== null) {
                // 프리미엄 객체 데이터를 배열로 변환
                const themes = [
                  { key: 'basic', theme: '나의 스탯', title: '타고난 기운과 능력치', icon: '🧬' },
                  { key: 'overall', theme: '본질 자아', title: '성격 본질과 세계관', icon: '🧠' },
                  { key: 'career', theme: '성공 공식', title: '직업운과 재물 파이프라인', icon: '💰' },
                  { key: 'love', theme: '연애 귀인', title: '인연 지수와 관계 분석', icon: '💖' },
                  { key: 'advice', theme: '갓생 가이드', title: '2026년 월별 행동 지침', icon: '🗓️' }
                ];

                displayData = themes.map(t => ({
                  theme: t.theme,
                  title: t.title,
                  icon: t.icon,
                  content: aiResult[t.key] || '분석 내용을 불러오지 못했습니다.'
                }));
              }

              return <AnalysisAccordion data={displayData} />;
            })()}

            {/* CTA 배너 섹션 */}
            <div className="mt-12 space-y-4">
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white py-6 px-4 rounded-[2rem] shadow-lg shadow-pink-200 transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-1 group"
              >
                <span className="text-lg md:text-xl font-black tracking-tight">내 사주만 보기 아쉽다면? 😈</span>
                <span className="text-sm font-bold opacity-90 group-hover:underline">친구, 연인 사주 훔쳐보기 🤍</span>
              </button>

              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('openTeaserModal'))}
                className="w-full bg-[#FEE500] hover:bg-[#FDD000] text-[#3C1E1E] py-6 px-4 rounded-[2rem] shadow-lg shadow-yellow-100 transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-1 group"
              >
                <span className="text-lg md:text-xl font-black tracking-tight">돈벼락 맞을 준비 됐어? 💸</span>
                <span className="text-sm font-bold opacity-80 group-hover:underline">2026년 신년운세 보러가기 💖</span>
              </button>
            </div>
            
            <div className="mt-12 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-gray-900">결과가 맘에 드시나요?</h4>
                <p className="text-gray-500 text-sm">친구들에게 이 놀라운 분석 결과를 공유해보세요!</p>
              </div>
              <ShareButtons name={userName} />
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-gray-400 italic">※ 명리학 분석은 재미와 참고용으로만 활용해주세요.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
