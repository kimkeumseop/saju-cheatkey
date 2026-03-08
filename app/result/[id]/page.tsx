'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import AnalysisAccordion from '@/components/AnalysisAccordion';
import ShareButtons from '@/components/ShareButtons';
import { Loader2, Sparkles, Layout } from 'lucide-react';

export default function SajuResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. 로컬 데이터 먼저 확인 (local_로 시작하는 경우)
        if (id.startsWith('local_')) {
          const localData = localStorage.getItem(`saju_result_${id}`);
          if (localData) {
            setData(JSON.parse(localData));
            setLoading(false);
            return;
          }
        }

        // 2. Firestore에서 데이터 가져오기
        const docRef = doc(db, 'sajuResults', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData(docSnap.data());
        } else {
          // Firestore에 없으면 로컬에서도 한 번 더 찾아봄
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
        // 에러 발생 시 로컬 스토리지 시도
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
        <p className="mt-4 text-gray-500 font-bold">인생 치트키 불러오는 중...</p>
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
            MZ세대 맞춤형 AI 사주 리포트 {id.startsWith('local_') && '(임시저장됨)'}
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

        {/* 1. 명식표 */}
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

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <AnalysisAccordion data={aiResult} />

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

            <div className="mt-10 text-center">
              <p className="text-sm text-gray-400 italic">※ 명리학 분석은 재미와 참고용으로만 활용해주세요.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
