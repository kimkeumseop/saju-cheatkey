'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ShareButtons from '@/components/ShareButtons';
import PaymentWidget from '@/components/PaymentWidget';
import { Loader2, Sparkles, Moon, Heart, Star, Gift, Coffee, Music, ChevronRight, Lock, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth';

function UnseResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [unseData, setUnseResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const name = searchParams.get('name');
  const birthDate = searchParams.get('birthDate');
  const birthTime = searchParams.get('birthTime');
  const calendarType = searchParams.get('calendarType');
  const gender = searchParams.get('gender');
  const isPaidParam = searchParams.get('payment') === 'success';
  const isAdmin = user?.email === 'oops676@gmail.com';
  const isUnlocked = isPaidParam || isAdmin;

  useEffect(() => {
    const fetchUnse = async () => {
      try {
        const res = await fetch('/api/unse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, birthDate, birthTime, calendarType, gender }),
        });
        const data = await res.json();
        if (data.success) setUnseResult(data);
        else setError(data.error || '운세를 불러오지 못했습니다.');
      } catch (err) {
        setError('네트워크 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (name && birthDate) fetchUnse();
    else if (!loading) router.push('/unse');
  }, [name, birthDate, birthTime, calendarType, gender, router]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-6 text-center py-20">
      <div className="relative">
        <Moon className="w-16 h-16 text-primary-400 animate-pulse fill-primary-100" />
        <Sparkles className="w-6 h-6 text-primary-300 absolute -top-2 -right-2 animate-bounce" />
      </div>
      <p className="mt-6 text-primary-600 font-black text-xl tracking-tight">오늘의 속삭임을 듣고 있어요...</p>
    </div>
  );

  if (error || !unseData) return (
    <div className="flex flex-col items-center justify-center p-6 text-center py-20">
      <p className="text-red-400 font-bold">{error || '데이터를 찾을 수 없습니다.'}</p>
      <button onClick={() => router.push('/unse')} className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-full font-bold">다시 시도하기</button>
    </div>
  );

  const { summary, vibe, heartFlutter, luckyWhisper, gift } = unseData.analysis;

  return (
    <div className="max-w-md mx-auto px-6 space-y-10">
      {/* 상단 헤더 */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-600 text-xs font-black shadow-sm">
          <Star className="w-3.5 h-3.5 fill-primary-400 text-primary-400" />
          Today's Whisper
        </div>
        <h1 className="text-3xl font-black text-primary-900 tracking-tight">
          {name}님을 위한 <br/> 오늘의 속삭임
        </h1>
      </div>

      {/* 무료 요약 카드 (신문 운세 스타일) */}
      <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border-4 border-primary-100 relative overflow-hidden ring-8 ring-primary-50/50">
        <div className="absolute top-0 right-0 p-4">
          <span className="text-[10px] font-black bg-primary-500 text-white px-2 py-1 rounded-lg">무료 공개</span>
        </div>
        <div className="space-y-4 relative z-10">
          <h3 className="text-primary-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
            <Coffee className="w-4 h-4" /> 오늘의 한 줄 요약
          </h3>
          <p className="text-primary-900 font-bold text-xl leading-snug break-keep underline decoration-primary-100 decoration-8 underline-offset-[-4px]">
            "{summary}"
          </p>
        </div>
      </section>

      {/* 프리미엄 섹션 */}
      <div className="space-y-6 relative">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-primary-900 font-black text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500 fill-primary-500" /> 프리미엄 속삭임
          </h3>
          {!isUnlocked && <span className="text-[10px] font-bold text-primary-300">총 4개 섹션 잠김</span>}
        </div>

        {isUnlocked ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-lg border border-pink-50 space-y-4">
              <h3 className="text-primary-500 font-black text-sm flex items-center gap-2"><Moon className="w-4 h-4 fill-primary-200" /> 오늘의 분위기</h3>
              <p className="text-gray-600 font-medium leading-relaxed break-keep">{vibe}</p>
            </div>
            <div className="bg-primary-900 rounded-[2.5rem] p-8 shadow-2xl space-y-4">
              <h3 className="text-primary-200 font-black text-sm flex items-center gap-2"><Heart className="w-4 h-4 fill-primary-400 text-primary-400" /> 가슴 뛰는 순간</h3>
              <p className="text-white font-medium leading-relaxed break-keep">{heartFlutter}</p>
            </div>
            <div className="bg-white rounded-[2.5rem] p-8 shadow-lg border border-pink-50 space-y-4">
              <h3 className="text-primary-500 font-black text-sm flex items-center gap-2"><Music className="w-4 h-4" /> 행운의 가이드</h3>
              <p className="text-gray-600 font-medium leading-relaxed break-keep">{luckyWhisper}</p>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-[2.5rem] p-8 shadow-lg border border-white text-center space-y-2">
              <Gift className="w-8 h-8 text-primary-500 mx-auto" />
              <h3 className="text-primary-900 font-black text-lg">오늘 우주가 주는 선물</h3>
              <p className="text-primary-600 font-bold text-sm break-keep">{gift}</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* 잠금 상태의 카드들 (블러 처리) */}
            <div className="space-y-6 opacity-30 blur-[6px] pointer-events-none select-none">
              <div className="bg-white h-32 rounded-[2rem]" />
              <div className="bg-white h-32 rounded-[2rem]" />
            </div>

            {/* 결제 유도 페이월 */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-primary-900 rounded-[2.5rem] p-8 text-center shadow-2xl w-full border-4 border-white/10 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-center"><Lock className="w-10 h-10 text-primary-300" /></div>
                  <h2 className="text-white text-xl font-black leading-tight">
                    방금 읽은 내용은 시작일 뿐! <br/>
                    <span className="text-primary-300">시간대별 디테일</span>을 열어볼까요?
                  </h2>
                  <p className="text-white/60 text-xs font-bold">777원으로 오늘 하루의 완벽한 치트키를 확인하세요.</p>
                </div>
                
                <button 
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-[0.95] flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5 fill-white" />
                  777원으로 모두 확인하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단 공유 */}
      <div className="pt-6 space-y-8">
        <div className="text-center space-y-4">
          <p className="text-primary-300 font-bold text-xs uppercase tracking-widest">Share the whisper</p>
          <ShareButtons name={name || '나'} />
        </div>
      </div>

      {showPayment && (
        <PaymentWidget 
          resultId={`unse_premium_${Date.now()}`} 
          onCancel={() => setShowPayment(false)} 
        />
      )}
    </div>
  );
}

export default function UnseResultPage() {
  return (
    <main className="min-h-screen bg-[#FFF5F7] pt-24 pb-32 overflow-x-hidden">
      <Navbar />
      <Suspense fallback={<div className="text-center py-20"><Loader2 className="w-10 h-10 text-primary-400 animate-spin mx-auto" /></div>}>
        <UnseResultContent />
      </Suspense>
      <Footer />
    </main>
  );
}
