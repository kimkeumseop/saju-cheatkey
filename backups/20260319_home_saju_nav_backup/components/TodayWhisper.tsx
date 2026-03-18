'use client';

import { useState } from 'react';
import { Loader2, ChevronRight, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';

export default function TodayWhisper() {
  const { profiles } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ keyword: string; message: string } | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [userName, setUserName] = useState('');

  const fetchFreeUnse = async (name: string) => {
    setIsLoading(true);
    try {
      const profile = profiles[0] || {
        birthDate: '1995-01-01',
        calendarType: 'solar',
        gender: 'female',
      };

      const res = await fetch('/api/unse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || '익명',
          birthDate: profile.birthDate,
          birthTime: 'unknown',
          calendarType: profile.calendarType,
          gender: profile.gender,
          isLite: true,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || '운세 응답이 올바르지 않습니다.');
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || '운세 분석에 실패했습니다.');
      }

      setResult(data.analysis);
    } catch (error: any) {
      console.error('TodayWhisper API Error:', error);
      alert(error.message || '일시적인 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = () => {
    if (profiles.length > 0) {
      fetchFreeUnse(profiles[0].name);
      return;
    }

    setShowInput(true);
  };

  return (
    <div className="glass-card rounded-[2rem] p-6 md:p-7 h-full">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="today-whisper-initial"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex h-full flex-col justify-between gap-6"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-black tracking-[0.2em] text-primary-600">
                <Star className="h-3.5 w-3.5 fill-primary-400 text-primary-400" />
                TODAY WHISPER
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black leading-tight text-primary-900 break-keep">
                  오늘의 운세에서
                  <br />
                  지금 필요한 힌트를 확인해보세요
                </h3>
                <p className="text-sm leading-7 text-gray-500 break-keep">
                  로그인된 정보가 있으면 바로 불러오고, 없으면 이름만 입력해 빠르게 오늘의 메시지를 받아볼 수 있어요.
                </p>
              </div>
            </div>

            {!showInput ? (
              <button
                type="button"
                onClick={handleStart}
                disabled={isLoading}
                className="btn-shimmer inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-base font-black text-white shadow-lg shadow-primary-200/50 transition-transform active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : '오늘의 운세 보기'}
                {!isLoading && <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={userName}
                  onChange={(event) => setUserName(event.target.value)}
                  placeholder="이름을 입력해 주세요"
                  className="w-full rounded-2xl border border-primary-100 bg-primary-50 px-4 py-4 font-medium text-gray-800 outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
                />
                <button
                  type="button"
                  onClick={() => fetchFreeUnse(userName)}
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-700 px-5 py-4 text-base font-black text-white transition hover:bg-primary-800"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : '지금 확인하기'}
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="today-whisper-result"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex h-full flex-col justify-between gap-6 text-center"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center rounded-full bg-primary-50 px-3 py-1.5 text-xs font-black tracking-[0.2em] text-primary-600">
                오늘의 운세
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black leading-tight text-primary-900 break-keep">{result.keyword}</h3>
                <div className="mx-auto h-1 w-12 rounded-full bg-primary-100" />
                <p className="text-base leading-8 text-gray-600 break-keep">{result.message}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setResult(null)}
              className="text-sm font-bold text-primary-400 underline underline-offset-4 transition hover:text-primary-600"
            >
              다시 보기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
