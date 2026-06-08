'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Heart, Loader2, Moon, Sparkles } from 'lucide-react';
import SajuModal from '@/components/SajuModal';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { calculateSaju } from '@/lib/saju';

async function readApiResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    const timeoutMessage = response.status === 504
      ? '분석 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.'
      : '서버 응답을 읽지 못했습니다. 잠시 후 다시 시도해 주세요.';

    return {
      success: false,
      error: timeoutMessage,
      raw: text.slice(0, 160),
    };
  }
}

function SajuProcessingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loadingStep, setLoadingStep] = useState('사주 명식 계산 중...');

  useEffect(() => {
    const type = searchParams.get('type') || 'saju';

    if (type === 'compatibility') {
      const user1 = {
        name: searchParams.get('u1_name') || '인물1',
        birthDate: searchParams.get('u1_date'),
        birthTime: searchParams.get('u1_time') === 'unknown' ? '12:00' : searchParams.get('u1_time') || '12:00',
        isTimeUnknown: searchParams.get('u1_time') === 'unknown',
        calendarType: searchParams.get('u1_cal') || 'solar',
        gender: searchParams.get('u1_gen') || 'female',
      };
      const user2 = {
        name: searchParams.get('u2_name') || '인물2',
        birthDate: searchParams.get('u2_date'),
        birthTime: searchParams.get('u2_time') === 'unknown' ? '12:00' : searchParams.get('u2_time') || '12:00',
        isTimeUnknown: searchParams.get('u2_time') === 'unknown',
        calendarType: searchParams.get('u2_cal') || 'solar',
        gender: searchParams.get('u2_gen') || 'male',
      };
      const relation = searchParams.get('relation') || 'couple';
      if (user1.birthDate && user2.birthDate) {
        processCompatibilityAnalysis(user1, user2, relation);
      } else {
        handleAnalysisError(new Error('생년월일 정보가 부족합니다.'));
      }
      return;
    }

    const name = searchParams.get('name') || '방문자';
    const birthDate = searchParams.get('birthDate');
    const rawTime = searchParams.get('birthTime');
    const isTimeUnknown = rawTime === 'unknown';
    const birthTime = isTimeUnknown ? '12:00' : rawTime || '12:00';
    const calendarType = (searchParams.get('calendarType') as 'solar' | 'lunar') || 'solar';
    const gender = searchParams.get('gender') || 'female';

    if (birthDate) {
      processAnalysis(name, birthDate, birthTime, calendarType, gender, isTimeUnknown);
    } else {
      handleAnalysisError(new Error('정보가 올바르지 않습니다.'));
    }
  }, [searchParams]);

  const processAnalysis = async (
    name: string, birthDate: string, birthTime: string,
    calendarType: 'solar' | 'lunar', gender: string, isTimeUnknown: boolean,
  ) => {
    try {
      setLoadingStep('사주의 기운을 정리하고 있어요...');
      const sajuData = calculateSaju(birthDate, birthTime, calendarType, gender);
      setLoadingStep('해석 메시지를 작성하고 있어요...');
      const response = await fetch('/api/saju', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, birthDate, birthTime, calendarType, gender, isTimeUnknown }),
      });
      const responseBody = await readApiResponse(response);
      if (!response.ok || !responseBody.success) throw new Error(responseBody.error || '사주 분석 요청에 실패했습니다.');
      const finalResult = {
        type: 'saju', userId: user?.uid || 'anonymous', userName: name,
        birthDate, birthTime: isTimeUnknown ? 'unknown' : birthTime,
        calendarType, gender, sajuData, aiResult: responseBody.analysis,
        isPaid: true, createdAt: serverTimestamp(),
      };
      await saveAndRedirect(finalResult);
    } catch (error: any) { handleAnalysisError(error); }
  };

  const processCompatibilityAnalysis = async (user1: any, user2: any, relation: string) => {
    try {
      setLoadingStep('두 사람의 인연 결을 맞춰보고 있어요...');
      const saju1 = calculateSaju(user1.birthDate, user1.birthTime, user1.calendarType, user1.gender);
      const saju2 = calculateSaju(user2.birthDate, user2.birthTime, user2.calendarType, user2.gender);
      setLoadingStep('서로를 향한 흐름을 읽고 있어요...');
      const response = await fetch('/api/gunghap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1, user2, relationship: relation }),
      });
      const resData = await readApiResponse(response);
      if (!response.ok || resData.success === false) throw new Error(resData.error || '궁합 분석 서버 응답 실패');
      const finalResult = {
        type: 'compatibility', userId: user?.uid || 'anonymous',
        user1, user2, saju1, saju2, relation, aiResult: resData.analysis,
        isPaid: true, createdAt: serverTimestamp(),
      };
      await saveAndRedirect(finalResult);
    } catch (error: any) { handleAnalysisError(error); }
  };

  const saveAndRedirect = async (result: any) => {
    try {
      setLoadingStep('분석 리포트를 저장하고 있어요...');
      const docRef = await addDoc(collection(db, 'sajuResults'), result);
      router.replace(`/result/${docRef.id}`);
    } catch {
      const localId = `local_${Date.now()}`;
      localStorage.setItem(`saju_result_${localId}`, JSON.stringify(result));
      router.replace(`/result/${localId}`);
    }
  };

  const handleAnalysisError = (error: any) => {
    console.error('분석 오류:', error);
    alert(`오류: ${error.message || '잠시 후 다시 시도해 주세요.'}`);
    router.replace('/');
  };

  const isCompatibility = searchParams.get('type') === 'compatibility';

  return (
    <div className="min-h-screen overflow-hidden p-6 text-center" style={{ background: '#0d0710' }}>
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
          {isCompatibility
            ? <Heart className="absolute -right-6 -top-6 h-12 w-12 animate-bounce" style={{ fill: '#d4688a', color: '#d4688a' }} />
            : <Moon className="absolute -right-6 -top-6 h-12 w-12 animate-bounce" style={{ fill: '#e8829a', color: '#e8829a' }} />
          }
        </div>
        <div className="space-y-6">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black"
            style={{ background: 'rgba(232,130,154,0.10)', border: '1px solid rgba(232,130,154,0.20)', color: '#e8829a' }}
          >
            <Sparkles className="h-3.5 w-3.5" style={{ fill: '#e8829a', color: '#e8829a' }} />
            ENERGY SCANNING
          </div>
          <h2
            className="whitespace-pre-line text-3xl font-bold leading-tight tracking-tight md:text-4xl"
            style={{ color: '#f5eef2', fontFamily: '"Noto Serif KR", serif' }}
          >
            {isCompatibility ? '두 사람의 운명선을\n 하나로 잇고 있어요' : '당신의 고유한 결을\n 분석하고 있어요'}
          </h2>
          <p className="text-lg font-bold" style={{ color: 'rgba(240,232,238,0.42)' }}>{loadingStep}</p>
        </div>
      </div>
    </div>
  );
}

function SajuEntryContent() {
  const searchParams = useSearchParams();
  const shouldProcess =
    Boolean(searchParams.get('birthDate')) ||
    Boolean(searchParams.get('u1_date') && searchParams.get('u2_date'));
  const [isOpen, setIsOpen] = useState(false);

  if (shouldProcess) return <SajuProcessingContent />;

  return (
    <>
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-white transition hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #e8829a, #c2255c)',
            boxShadow: '0 4px 24px rgba(232,130,154,0.32), 0 1px 0 rgba(255,255,255,0.16) inset',
          }}
        >
          <Sparkles className="h-4 w-4" />
          무료 사주 분석 시작하기
        </button>
      </div>
      <SajuModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export default function SajuPageClient() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#e8829a' }} />
      </div>
    }>
      <SajuEntryContent />
    </Suspense>
  );
}
