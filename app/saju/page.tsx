'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Heart, Loader2, Moon, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SajuModal from '@/components/SajuModal';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { calculateSaju } from '@/lib/saju';

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
    name: string,
    birthDate: string,
    birthTime: string,
    calendarType: 'solar' | 'lunar',
    gender: string,
    isTimeUnknown: boolean,
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

      const responseBody = await response.json();
      if (!response.ok || !responseBody.success) {
        throw new Error(responseBody.error || '사주 분석 요청에 실패했습니다.');
      }

      const finalResult = {
        type: 'saju',
        userId: user?.uid || 'anonymous',
        userName: name,
        birthDate,
        birthTime: isTimeUnknown ? 'unknown' : birthTime,
        calendarType,
        gender,
        sajuData,
        aiResult: responseBody.analysis,
        isPaid: true,
        createdAt: serverTimestamp(),
      };

      await saveAndRedirect(finalResult);
    } catch (error: any) {
      handleAnalysisError(error);
    }
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

      if (!response.ok) {
        throw new Error('궁합 분석 서버 응답 실패');
      }

      const resData = await response.json();
      const finalResult = {
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
      };

      await saveAndRedirect(finalResult);
    } catch (error: any) {
      handleAnalysisError(error);
    }
  };

  const saveAndRedirect = async (result: any) => {
    try {
      setLoadingStep('분석 리포트를 저장하고 있어요...');
      const docRef = await addDoc(collection(db, 'sajuResults'), result);
      router.replace(`/result/${docRef.id}`);
    } catch (dbError: any) {
      console.error('DB 저장 실패:', dbError);
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
    <div className="min-h-screen overflow-hidden bg-[#FFF5F7] p-6 text-center">
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="relative mb-12">
          <div className="relative z-10 flex h-32 w-32 items-center justify-center rounded-[3rem] bg-white shadow-2xl">
            <Loader2 className="h-12 w-12 animate-spin stroke-[3] text-primary-400" />
          </div>
          <div className="absolute inset-0 scale-150 rounded-full bg-primary-200/20 blur-3xl" />
          {isCompatibility ? (
            <Heart className="absolute -right-6 -top-6 h-12 w-12 animate-bounce fill-rose-400 text-rose-400" />
          ) : (
            <Moon className="absolute -right-6 -top-6 h-12 w-12 animate-bounce fill-primary-400 text-primary-400" />
          )}
        </div>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-black text-primary-600 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 fill-primary-400 text-primary-400" />
            ENERGY SCANNING
          </div>
          <h2 className="text-3xl font-black leading-tight tracking-tight text-primary-900 md:text-4xl">
            {isCompatibility ? '두 사람의 운명선을\n 하나로 잇고 있어요' : '당신의 고유한 결을\n 분석하고 있어요'}
          </h2>
          <p className="text-lg font-bold text-primary-300">{loadingStep}</p>
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
  const [isOpen, setIsOpen] = useState(!shouldProcess);

  useEffect(() => {
    setIsOpen(!shouldProcess);
  }, [shouldProcess]);

  if (shouldProcess) {
    return <SajuProcessingContent />;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(250,162,193,0.18),transparent_28%),linear-gradient(180deg,#fff5f7_0%,#fffafb_60%,#fff5f7_100%)] pt-20">
      <Navbar />

      <section className="px-6 py-20">
        <div className="glass-panel mx-auto max-w-4xl rounded-[2.7rem] p-8 md:p-12">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-primary-400">Saju Analysis</p>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-gray-900 md:text-6xl">
            나의 본질과 흐름을
            <br />
            바로 읽어보세요
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-gray-500 break-keep md:text-lg">
            생년월일 하나로 나의 사주를 바로 확인해보세요.
          </p>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-primary-600 px-6 py-4 text-base font-black text-white transition hover:bg-primary-700"
          >
            사주 분석 시작하기
          </button>
        </div>
      </section>

      <SajuModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <Footer />
    </main>
  );
}

export default function SajuPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FFF5F7]">
          <Loader2 className="h-10 w-10 animate-spin text-primary-400" />
        </div>
      }
    >
      <SajuEntryContent />
    </Suspense>
  );
}
