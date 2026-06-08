'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Heart, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { calculateSaju } from '@/lib/saju';

async function readApiResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      error: response.status === 504
        ? '분석 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.'
        : '서버 응답을 읽지 못했습니다. 잠시 후 다시 시도해 주세요.',
      raw: text.slice(0, 160),
    };
  }
}

function normalizeCalendarType(value: string | null): 'solar' | 'lunar' {
  return value === 'lunar' ? 'lunar' : 'solar';
}

function GungHapProcessingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const hasStartedRef = useRef(false);
  const [loadingStep, setLoadingStep] = useState('두 사람의 인연 결을 맞춰보고 있어요...');

  const shouldProcess = Boolean(searchParams.get('u1_date') && searchParams.get('u2_date'));
  const searchSignature = searchParams.toString();

  useEffect(() => {
    if (!shouldProcess) {
      hasStartedRef.current = false;
      return;
    }
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const user1 = {
      name: searchParams.get('u1_name') || '인물1',
      birthDate: searchParams.get('u1_date') || '',
      birthTime: searchParams.get('u1_time') === 'unknown' ? '12:00' : searchParams.get('u1_time') || '12:00',
      isTimeUnknown: searchParams.get('u1_time') === 'unknown',
      calendarType: normalizeCalendarType(searchParams.get('u1_cal')),
      gender: searchParams.get('u1_gen') || 'female',
    };
    const user2 = {
      name: searchParams.get('u2_name') || '인물2',
      birthDate: searchParams.get('u2_date') || '',
      birthTime: searchParams.get('u2_time') === 'unknown' ? '12:00' : searchParams.get('u2_time') || '12:00',
      isTimeUnknown: searchParams.get('u2_time') === 'unknown',
      calendarType: normalizeCalendarType(searchParams.get('u2_cal')),
      gender: searchParams.get('u2_gen') || 'male',
    };
    const relation = searchParams.get('relation') || 'couple';

    const saveAndRedirect = async (result: any) => {
      try {
        setLoadingStep('궁합 리포트를 저장하고 있어요...');
        const docRef = await addDoc(collection(db, 'sajuResults'), result);
        router.replace(`/result/${docRef.id}`);
      } catch {
        const localId = `local_${Date.now()}`;
        localStorage.setItem(`saju_result_${localId}`, JSON.stringify(result));
        router.replace(`/result/${localId}`);
      }
    };

    const handleAnalysisError = (error: any) => {
      console.error('궁합 분석 오류:', error);
      alert(`오류: ${error.message || '잠시 후 다시 시도해 주세요.'}`);
      router.replace('/gunghap');
    };

    const processCompatibilityAnalysis = async () => {
      try {
        if (!user1.birthDate || !user2.birthDate) {
          throw new Error('생년월일 정보가 부족합니다.');
        }

        const saju1 = calculateSaju(user1.birthDate, user1.birthTime, user1.calendarType, user1.gender);
        const saju2 = calculateSaju(user2.birthDate, user2.birthTime, user2.calendarType, user2.gender);

        setLoadingStep('서로에게 어떤 지점이 닿는지 읽고 있어요...');
        const response = await fetch('/api/gunghap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user1, user2, relationship: relation }),
        });
        const resData = await readApiResponse(response);
        if (!response.ok || resData.success === false) {
          throw new Error(resData.error || '궁합 분석 서버 응답 실패');
        }

        await saveAndRedirect({
          type: 'compatibility',
          userId: user?.uid || 'anonymous',
          user1,
          user2,
          saju1,
          saju2,
          relation,
          aiResult: resData.analysis,
          isPaid: true,
          createdAt: serverTimestamp(),
        });
      } catch (error: any) {
        handleAnalysisError(error);
      }
    };

    processCompatibilityAnalysis();
  }, [router, searchParams, searchSignature, shouldProcess, user?.uid]);

  if (!shouldProcess) return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden p-6 text-center" style={{ background: '#0d0710' }}>
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="relative mb-12">
          <div
            className="relative z-10 flex h-32 w-32 items-center justify-center rounded-[3rem]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(232,130,154,0.18)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 40px rgba(232,130,154,0.18), 0 1px 0 rgba(255,255,255,0.06) inset',
            }}
          >
            <Loader2 className="h-12 w-12 animate-spin stroke-[3]" style={{ color: '#e8829a' }} />
          </div>
          <div className="absolute inset-0 scale-150 rounded-full blur-3xl" style={{ background: 'rgba(232,130,154,0.16)' }} />
          <Heart className="absolute -right-6 -top-6 h-12 w-12 animate-bounce" style={{ fill: '#d4688a', color: '#d4688a' }} />
        </div>
        <div className="space-y-6">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black"
            style={{ background: 'rgba(232,130,154,0.10)', border: '1px solid rgba(232,130,154,0.20)', color: '#e8829a' }}
          >
            <Sparkles className="h-3.5 w-3.5" style={{ fill: '#e8829a', color: '#e8829a' }} />
            COMPATIBILITY READING
          </div>
          <h2
            className="whitespace-pre-line text-3xl font-bold leading-tight tracking-tight md:text-4xl"
            style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}
          >
            두 사람의 인연을{'\n'}하나씩 맞춰보고 있어요
          </h2>
          <p className="text-lg font-bold" style={{ color: 'rgba(240,232,238,0.42)' }}>{loadingStep}</p>
        </div>
      </div>
    </div>
  );
}

export default function GungHapProcessingClient() {
  return (
    <Suspense fallback={null}>
      <GungHapProcessingContent />
    </Suspense>
  );
}
