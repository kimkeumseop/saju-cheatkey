'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AnalysisAccordion from '@/components/AnalysisAccordion';
import ShareButtons from '@/components/ShareButtons';
import Navbar from '@/components/Navbar';
import { calculateSaju } from '@/lib/saju';
import { Sparkles, Loader2, Layout } from 'lucide-react';

function SajuContent() {
  const searchParams = useSearchParams();
  const [sajuData, setSajuData] = useState<any>(null);
  const [aiResult, setAiResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-[#F7F8FA] pt-24 pb-20 px-4 md:px-6">
      <Navbar />
      
      <div className="max-w-4xl mx-auto space-y-12">
        {/* 상단 헤더 */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FEE500] text-[#3C1E1E] text-sm font-bold shadow-sm">
            <Sparkles className="w-4 h-4" />
            MZ세대 맞춤형 AI 사주 리포트
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            <span className="text-[#3C1E1E] bg-[#FEE500] px-2 rounded-lg">{sajuData.userName}</span> 님의 인생 결과표
          </h1>
          <p className="text-gray-500 flex items-center justify-center gap-4 text-sm md:text-lg font-medium">
            <span>{searchParams.get('birthDate')}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <span>{searchParams.get('birthTime')} ({searchParams.get('calendarType') === 'solar' ? '양력' : '음력'})</span>
          </p>
        </div>

        {/* 1. 명식표 (트렌디한 디자인) */}
        <div className="grid grid-cols-4 gap-4 md:gap-6">
          {sajuData.sajuBreakdown.map((column: any, idx: number) => (
            <div key={idx} className="space-y-4">
              <div className="text-center text-xs font-black text-gray-400 tracking-widest uppercase">{column.title}</div>
              <div className="space-y-4">
                {column.items.map((item: any, i: number) => (
                  <div 
                    key={i} 
                    className="bg-white p-4 md:p-6 rounded-[1.5rem] border border-gray-100 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all group"
                  >
                    <span className="text-3xl md:text-5xl font-bold tracking-tighter" style={{ color: item.color }}>{item.char}</span>
                    <span className="text-sm md:text-base text-gray-800 font-bold">{item.sound}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 2. AI 분석 결과 (아코디언) */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 ml-2">
            <Layout className="w-6 h-6 text-[#3C1E1E]" />
            <h3 className="text-2xl font-bold text-gray-900">심층 분석 리포트</h3>
          </div>

          <div className="min-h-[400px] relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-[#FEE500] animate-spin stroke-[3]" />
                  <Sparkles className="w-8 h-8 text-[#3C1E1E] absolute -top-2 -right-2 animate-bounce" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-bold text-gray-900">운명의 데이터 분석 중...</p>
                  <p className="text-gray-400">당신만을 위한 뼈 때리는 조언을 생성하고 있어요.</p>
                </div>
              </div>
            ) : aiResult ? (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <AnalysisAccordion data={aiResult} />
                
                <div className="mt-12 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-gray-900">결과가 맘에 드시나요?</h4>
                    <p className="text-gray-500 text-sm">친구들에게 이 놀라운 분석 결과를 공유해보세요!</p>
                  </div>
                  <ShareButtons name={sajuData.userName} />
                </div>

                <div className="mt-10 text-center">
                  <p className="text-sm text-gray-400 italic">※ 명리학 분석은 재미와 참고용으로만 활용해주세요. 당신의 미래는 당신이 만들어가는 것입니다.</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500 bg-white rounded-[2.5rem] border border-gray-100">분석 데이터를 불러오지 못했습니다. 다시 시도해주세요.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SajuResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center"><Loader2 className="w-10 h-10 text-[#FEE500] animate-spin" /></div>}>
      <SajuContent />
    </Suspense>
  );
}
