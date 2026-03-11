'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ShareButtons from '@/components/ShareButtons';
import { Loader2, Sparkles, Moon, Heart, Star, Gift, Coffee, Music, ChevronRight } from 'lucide-react';

export default function UnseResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [unseData, setUnseResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const name = searchParams.get('name');
  const birthDate = searchParams.get('birthDate');
  const birthTime = searchParams.get('birthTime');
  const calendarType = searchParams.get('calendarType');
  const gender = searchParams.get('gender');

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
    else router.push('/unse');
  }, [name, birthDate, birthTime, calendarType, gender, router]);

  if (loading) return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative">
        <Moon className="w-16 h-16 text-primary-400 animate-pulse fill-primary-100" />
        <Sparkles className="w-6 h-6 text-primary-300 absolute -top-2 -right-2 animate-bounce" />
      </div>
      <p className="mt-6 text-primary-600 font-black text-xl tracking-tight">오늘의 속삭임을 듣고 있어요...</p>
      <p className="mt-2 text-primary-300 font-bold text-sm">당신의 운명이 예쁘게 그려지는 중입니다.</p>
    </div>
  );

  if (error || !unseData) return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col items-center justify-center p-6 text-center">
      <p className="text-red-400 font-bold">{error || '데이터를 찾을 수 없습니다.'}</p>
      <button onClick={() => router.push('/unse')} className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-full font-bold">다시 시도하기</button>
    </div>
  );

  const { vibe, heartFlutter, luckyWhisper, gift } = unseData.analysis;

  return (
    <main className="min-h-screen bg-[#FFF5F7] pt-24 pb-32 overflow-x-hidden">
      <Navbar />
      
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
          <p className="text-primary-300 font-bold text-sm italic">{unseData.today.date} · {unseData.today.pillar}의 기운</p>
        </div>

        {/* 메시지 카드 섹션 */}
        <div className="space-y-6">
          
          {/* 카드 1: 오늘의 바이브 */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-pink-50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Music className="w-20 h-20 text-primary-500" />
            </div>
            <div className="space-y-4 relative z-10">
              <h3 className="text-primary-500 font-black text-sm flex items-center gap-2">
                <Moon className="w-4 h-4 fill-primary-200" /> 오늘의 분위기
              </h3>
              <p className="text-primary-900 font-bold text-xl leading-snug break-keep">{vibe}</p>
            </div>
          </div>

          {/* 카드 2: 간질간질 포인트 */}
          <div className="bg-primary-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
            <div className="space-y-4 relative z-10">
              <h3 className="text-primary-300 font-black text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 fill-primary-400 text-primary-400" /> 가슴 뛰는 순간
              </h3>
              <p className="text-white font-medium text-lg leading-relaxed break-keep">{heartFlutter}</p>
            </div>
          </div>

          {/* 카드 3: 행운의 속삭임 */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-pink-50 space-y-4">
            <h3 className="text-primary-500 font-black text-sm flex items-center gap-2">
              <Coffee className="w-4 h-4" /> 행운의 가이드
            </h3>
            <p className="text-gray-600 font-medium leading-relaxed break-keep">{luckyWhisper}</p>
          </div>

          {/* 카드 4: 우주의 선물 */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-[2.5rem] p-8 shadow-lg border border-white space-y-4 text-center">
            <div className="w-12 h-12 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-sm mb-2">
              <Gift className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="text-primary-900 font-black text-lg">오늘 우주가 주는 선물</h3>
            <p className="text-primary-600 font-bold text-sm leading-relaxed break-keep">{gift}</p>
          </div>

        </div>

        {/* 하단 버튼 및 공유 */}
        <div className="pt-6 space-y-8">
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-[0.95] flex items-center justify-center gap-2"
          >
            홈으로 돌아가기
          </button>
          
          <div className="text-center space-y-4">
            <p className="text-primary-300 font-bold text-xs uppercase tracking-widest">Share the magic</p>
            <ShareButtons name={name || '나'} />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
