'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CosmicBackground from '@/components/CosmicBackground';
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
        <Moon className="w-16 h-16 animate-pulse" style={{ color: '#e8829a', fill: 'rgba(232,130,154,0.2)' }} />
        <Sparkles className="w-6 h-6 absolute -top-2 -right-2 animate-bounce" style={{ color: '#e8829a' }} />
      </div>
      <p className="mt-6 font-black text-xl tracking-tight" style={{ color: '#e8829a' }}>오늘의 속삭임을 듣고 있어요...</p>
    </div>
  );

  if (error || !unseData) return (
    <div className="flex flex-col items-center justify-center p-6 text-center py-20">
      <p className="font-bold" style={{ color: '#fca5a5' }}>{error || '데이터를 찾을 수 없습니다.'}</p>
      <button onClick={() => router.push('/unse')} className="mt-4 px-6 py-2 text-white rounded-full font-bold" style={{ background: 'linear-gradient(135deg, #e8829a, #c2255c)' }}>다시 시도하기</button>
    </div>
  );

  const { summary, vibe, heartFlutter, luckyWhisper, gift } = unseData.analysis;

  return (
    <div className="max-w-md mx-auto px-6 space-y-10">
      {/* 상단 헤더 */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black" style={{ background: 'rgba(232,130,154,0.10)', border: '1px solid rgba(232,130,154,0.22)', color: '#e8829a' }}>
          <Star className="w-3.5 h-3.5" style={{ fill: '#e8829a', color: '#e8829a' }} />
          Today's Whisper
        </div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}>
          {name}님을 위한 <br/> 오늘의 속삭임
        </h1>
      </div>

      {/* 무료 요약 카드 */}
      <section className="rounded-[2.5rem] p-8 relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at 110% -10%, rgba(232,130,154,0.12), rgba(18,8,16,0.9) 55%)', border: '1px solid rgba(232,130,154,0.2)', boxShadow: '0 8px 40px rgba(232,130,154,0.1)' }}>
        <div className="absolute top-0 right-0 p-4">
          <span className="text-[10px] font-black text-white px-2 py-1 rounded-lg" style={{ background: '#e8829a' }}>무료 공개</span>
        </div>
        <div className="space-y-4 relative z-10">
          <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2" style={{ color: 'rgba(232,130,154,0.7)' }}>
            <Coffee className="w-4 h-4" /> 오늘의 한 줄 요약
          </h3>
          <p className="font-bold text-xl leading-snug break-keep" style={{ color: '#f5eef2' }}>
            "{summary}"
          </p>
        </div>
      </section>

      {/* 프리미엄 섹션 */}
      <div className="space-y-6 relative">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: '#f5eef2' }}>
            <Sparkles className="w-5 h-5" style={{ color: '#e8829a', fill: '#e8829a' }} /> 프리미엄 속삭임
          </h3>
          {!isUnlocked && <span className="text-[10px] font-bold" style={{ color: 'rgba(240,232,238,0.34)' }}>총 4개 섹션 잠김</span>}
        </div>

        {isUnlocked ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="rounded-[2.5rem] p-8 space-y-4" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(232,130,154,0.12)' }}>
              <h3 className="font-black text-sm flex items-center gap-2" style={{ color: '#e8829a' }}><Moon className="w-4 h-4" style={{ fill: 'rgba(232,130,154,0.3)' }} /> 오늘의 분위기</h3>
              <p className="font-medium leading-relaxed break-keep" style={{ color: 'rgba(240,232,238,0.62)' }}>{vibe}</p>
            </div>
            <div className="rounded-[2.5rem] p-8 space-y-4" style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(232,130,154,0.14), rgba(18,8,16,0.9) 60%)', border: '1px solid rgba(232,130,154,0.2)' }}>
              <h3 className="font-black text-sm flex items-center gap-2" style={{ color: '#e8829a' }}><Heart className="w-4 h-4" style={{ fill: '#e8829a', color: '#e8829a' }} /> 가슴 뛰는 순간</h3>
              <p className="text-white font-medium leading-relaxed break-keep">{heartFlutter}</p>
            </div>
            <div className="rounded-[2.5rem] p-8 space-y-4" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(232,130,154,0.12)' }}>
              <h3 className="font-black text-sm flex items-center gap-2" style={{ color: '#e8829a' }}><Music className="w-4 h-4" /> 행운의 가이드</h3>
              <p className="font-medium leading-relaxed break-keep" style={{ color: 'rgba(240,232,238,0.62)' }}>{luckyWhisper}</p>
            </div>
            <div className="rounded-[2.5rem] p-8 text-center space-y-2" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(232,130,154,0.14), rgba(18,8,16,0.85) 70%)', border: '1px solid rgba(232,130,154,0.18)' }}>
              <Gift className="w-8 h-8 mx-auto" style={{ color: '#e8829a' }} />
              <h3 className="font-bold text-lg" style={{ color: '#f5eef2' }}>오늘 우주가 주는 선물</h3>
              <p className="font-bold text-sm break-keep" style={{ color: '#e8829a' }}>{gift}</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* 잠금 상태의 카드들 (블러 처리) */}
            <div className="space-y-6 opacity-30 blur-[6px] pointer-events-none select-none">
              <div className="h-32 rounded-[2rem]" style={{ background: 'rgba(255,255,255,0.04)' }} />
              <div className="h-32 rounded-[2rem]" style={{ background: 'rgba(255,255,255,0.04)' }} />
            </div>

            {/* 결제 유도 페이월 */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="rounded-[2.5rem] p-8 text-center w-full space-y-6" style={{ background: 'linear-gradient(180deg, rgba(26,14,24,0.97), rgba(13,7,16,0.98))', border: '1px solid rgba(232,130,154,0.2)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
                <div className="space-y-2">
                  <div className="flex justify-center"><Lock className="w-10 h-10" style={{ color: '#e8829a' }} /></div>
                  <h2 className="text-white text-xl font-bold leading-tight">
                    방금 읽은 내용은 시작일 뿐! <br/>
                    <span style={{ color: '#e8829a' }}>시간대별 디테일</span>을 열어볼까요?
                  </h2>
                  <p className="text-white/60 text-xs font-bold">777원으로 오늘 하루의 완벽한 치트키를 확인하세요.</p>
                </div>

                <button
                  onClick={() => setShowPayment(true)}
                  className="w-full text-white py-5 rounded-2xl font-bold text-lg transition-all active:scale-[0.95] hover:brightness-110 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #e8829a, #c2255c)', boxShadow: '0 4px 24px rgba(232,130,154,0.32), 0 1px 0 rgba(255,255,255,0.16) inset' }}
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
          <p className="font-bold text-xs uppercase tracking-widest" style={{ color: 'rgba(240,232,238,0.34)' }}>Share the whisper</p>
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
    <main className="relative min-h-screen overflow-x-hidden pt-24 pb-32" style={{ background: '#0d0710' }}>
      <CosmicBackground />
      <Navbar dark />
      <div className="relative z-10">
        <Suspense fallback={<div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto" style={{ color: '#e8829a' }} /></div>}>
          <UnseResultContent />
        </Suspense>
      </div>
      <Footer dark />
    </main>
  );
}
