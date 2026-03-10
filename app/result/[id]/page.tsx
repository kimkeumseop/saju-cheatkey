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
import { Loader2, Sparkles, Layout, Lock, Zap, ChevronRight, AlertCircle, Heart, Coins } from 'lucide-react';
import { useAuth } from '@/lib/auth';

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

  return (
    <div className="min-h-screen bg-[#F7F8FA] pt-24 pb-32 px-4 md:px-6">
      <Navbar />
      
      <div className="max-w-4xl mx-auto space-y-12">
        {isCompatibility ? (
          <GungHapPreview data={{...data, isPaid: isUnlocked}} resultId={id} />
        ) : (
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                <span className="text-[#3C1E1E] bg-[#FEE500] px-2 rounded-lg">{data.userName}</span> 님의 분석 결과
              </h1>
            </div>

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
