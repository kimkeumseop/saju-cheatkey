'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuroraBackground from '@/components/AuroraBackground';
import ShareButtons from '@/components/ShareButtons';
import PaymentWidget from '@/components/PaymentWidget';
import DailyUnseView from '@/components/DailyUnseView';
import { Loader2, Sparkles, Moon, Heart, Star, Gift, Music, Lock, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import type { DailyUnse } from '@/lib/saju-schema';

function UnseResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [daily, setDaily] = useState<DailyUnse | null>(null);
  const [premium, setPremium] = useState<any>(null);
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
    const payload = { name, birthDate, birthTime, calendarType, gender };
    const fetchUnse = async () => {
      try {
        // 무료 데일리(날짜 캐싱) — 모든 방문자에게 보이는 메인 카드
        const res = await fetch('/api/unse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, mode: 'daily' }),
        });
        const data = await res.json();
        if (data.success && data.daily) setDaily(data.daily);
        else setError(data.error || '운세를 불러오지 못했습니다.');

        // 결제/관리자만 프리미엄 속삭임을 추가로 불러온다.
        if (isUnlocked) {
          const pRes = await fetch('/api/unse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const pData = await pRes.json();
          if (pData.success) setPremium(pData.analysis);
        }
      } catch (err) {
        setError('네트워크 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (name && birthDate) fetchUnse();
    else if (!loading) router.push('/unse');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, birthDate, birthTime, calendarType, gender, router]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-6 text-center py-20">
      <div className="relative">
        <Moon className="w-16 h-16 animate-pulse" style={{ color: '#d4688a', fill: 'rgba(212,104,138,0.18)' }} />
        <Sparkles className="w-6 h-6 absolute -top-2 -right-2 animate-bounce" style={{ color: '#d4688a' }} />
      </div>
      <p className="mt-6 font-black text-xl tracking-tight" style={{ color: '#d4688a' }}>오늘의 운세를 읽고 있다...</p>
    </div>
  );

  if (error || !daily) return (
    <div className="flex flex-col items-center justify-center p-6 text-center py-20">
      <p className="font-bold" style={{ color: '#c2255c' }}>{error || '데이터를 찾을 수 없습니다.'}</p>
      <button onClick={() => router.push('/unse')} className="mt-4 px-6 py-2 text-white rounded-full font-bold" style={{ background: 'linear-gradient(135deg, #d4688a, #c2255c)' }}>다시 시도하기</button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto px-6 space-y-10">
      {/* 상단 헤더 */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black" style={{ background: 'rgba(212,104,138,0.10)', border: '1px solid rgba(212,104,138,0.22)', color: '#d4688a' }}>
          <Star className="w-3.5 h-3.5" style={{ fill: '#d4688a', color: '#d4688a' }} />
          Today's Fortune
        </div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#2D1B1E', fontFamily: '"Noto Serif KR", serif' }}>
          {name}의 <br /> 오늘의 운세
        </h1>
      </div>

      {/* 무료 데일리 카드(점신식) */}
      <DailyUnseView daily={daily} />

      {/* 프리미엄 속삭임 */}
      <div className="space-y-6 relative">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: '#2D1B1E' }}>
            <Sparkles className="w-5 h-5" style={{ color: '#d4688a', fill: '#d4688a' }} /> 프리미엄 속삭임
          </h3>
          {!isUnlocked && <span className="text-[10px] font-bold" style={{ color: 'rgba(45,27,30,0.4)' }}>총 4개 섹션 잠김</span>}
        </div>

        {isUnlocked && premium ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="rounded-[2rem] p-7 space-y-3" style={{ background: '#FFFFFF', border: '1px solid rgba(212,104,138,0.16)', boxShadow: '0 8px 24px rgba(212,104,138,0.08)' }}>
              <h3 className="font-black text-sm flex items-center gap-2" style={{ color: '#d4688a' }}><Moon className="w-4 h-4" style={{ fill: 'rgba(212,104,138,0.3)' }} /> 오늘의 분위기</h3>
              <p className="font-medium leading-relaxed break-keep" style={{ color: 'rgba(45,27,30,0.74)' }}>{premium.vibe}</p>
            </div>
            <div className="rounded-[2rem] p-7 space-y-3" style={{ background: 'rgba(212,104,138,0.06)', border: '1px solid rgba(212,104,138,0.2)' }}>
              <h3 className="font-black text-sm flex items-center gap-2" style={{ color: '#d4688a' }}><Heart className="w-4 h-4" style={{ fill: '#d4688a', color: '#d4688a' }} /> 가슴 뛰는 순간</h3>
              <p className="font-medium leading-relaxed break-keep" style={{ color: 'rgba(45,27,30,0.8)' }}>{premium.heartFlutter}</p>
            </div>
            <div className="rounded-[2rem] p-7 space-y-3" style={{ background: '#FFFFFF', border: '1px solid rgba(212,104,138,0.16)', boxShadow: '0 8px 24px rgba(212,104,138,0.08)' }}>
              <h3 className="font-black text-sm flex items-center gap-2" style={{ color: '#d4688a' }}><Music className="w-4 h-4" /> 행운의 가이드</h3>
              <p className="font-medium leading-relaxed break-keep" style={{ color: 'rgba(45,27,30,0.74)' }}>{premium.luckyWhisper}</p>
            </div>
            <div className="rounded-[2rem] p-7 text-center space-y-2" style={{ background: 'rgba(212,104,138,0.06)', border: '1px solid rgba(212,104,138,0.18)' }}>
              <Gift className="w-8 h-8 mx-auto" style={{ color: '#d4688a' }} />
              <h3 className="font-bold text-lg" style={{ color: '#2D1B1E' }}>오늘 하늘이 주는 선물</h3>
              <p className="font-bold text-sm break-keep" style={{ color: '#d4688a' }}>{premium.gift}</p>
            </div>
          </div>
        ) : !isUnlocked ? (
          <div className="relative">
            {/* 잠금 카드(블러) */}
            <div className="space-y-6 opacity-40 blur-[6px] pointer-events-none select-none">
              <div className="h-32 rounded-[2rem]" style={{ background: 'rgba(45,27,30,0.05)' }} />
              <div className="h-32 rounded-[2rem]" style={{ background: 'rgba(45,27,30,0.05)' }} />
            </div>
            {/* 결제 유도 페이월 */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="rounded-[2rem] p-8 text-center w-full space-y-6" style={{ background: '#FFFFFF', border: '1px solid rgba(212,104,138,0.22)', boxShadow: '0 24px 60px rgba(45,27,30,0.12)' }}>
                <div className="space-y-2">
                  <div className="flex justify-center"><Lock className="w-10 h-10" style={{ color: '#d4688a' }} /></div>
                  <h2 className="text-xl font-bold leading-tight" style={{ color: '#2D1B1E' }}>
                    방금 읽은 건 시작일 뿐이다. <br />
                    <span style={{ color: '#d4688a' }}>시간대별 디테일</span>을 열어볼까?
                  </h2>
                  <p className="text-xs font-bold" style={{ color: 'rgba(45,27,30,0.5)' }}>777원으로 오늘 하루의 완벽한 치트키를 확인하세요.</p>
                </div>
                <button
                  onClick={() => setShowPayment(true)}
                  className="w-full text-white py-5 rounded-2xl font-bold text-lg transition-all active:scale-[0.95] hover:brightness-110 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #d4688a, #c2255c)', boxShadow: '0 4px 24px rgba(212,104,138,0.32), 0 1px 0 rgba(255,255,255,0.16) inset' }}
                >
                  <Zap className="w-5 h-5 fill-white" />
                  777원으로 모두 확인하기
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8"><Loader2 className="w-7 h-7 animate-spin mx-auto" style={{ color: '#d4688a' }} /></div>
        )}
      </div>

      {/* 하단 공유 */}
      <div className="pt-6 space-y-8">
        <div className="text-center space-y-4">
          <p className="font-bold text-xs uppercase tracking-widest" style={{ color: 'rgba(45,27,30,0.4)' }}>Share the fortune</p>
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
    <main className="relative min-h-screen overflow-x-hidden pt-24 pb-32" style={{ background: '#FBF7F2' }}>
      <AuroraBackground />
      <Navbar />
      <div className="relative z-10">
        <Suspense fallback={<div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto" style={{ color: '#d4688a' }} /></div>}>
          <UnseResultContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
