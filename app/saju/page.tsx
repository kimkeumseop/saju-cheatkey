'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { calculateSaju } from '@/lib/saju';
import { Sparkles, Loader2 } from 'lucide-react';

function SajuProcessingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loadingStep, setLoadingStep] = useState('사주 원국 계산 중...');

  useEffect(() => {
    const type = searchParams.get('type') || 'saju';
    
    if (type === 'compatibility') {
      const user1 = {
        name: searchParams.get('u1_name') || '인물1',
        birthDate: searchParams.get('u1_birthDate'),
        birthTime: searchParams.get('u1_birthTime') === 'unknown' ? '12:00' : (searchParams.get('u1_birthTime') || '12:00'),
        isTimeUnknown: searchParams.get('u1_birthTime') === 'unknown',
        calendarType: searchParams.get('u1_calendarType') || 'solar',
        gender: searchParams.get('u1_gender') || 'male',
      };
      const user2 = {
        name: searchParams.get('u2_name') || '인물2',
        birthDate: searchParams.get('u2_birthDate'),
        birthTime: searchParams.get('u2_birthTime') === 'unknown' ? '12:00' : (searchParams.get('u2_birthTime') || '12:00'),
        isTimeUnknown: searchParams.get('u2_birthTime') === 'unknown',
        calendarType: searchParams.get('u2_calendarType') || 'solar',
        gender: searchParams.get('u2_gender') || 'male',
      };
      const relation = searchParams.get('relation') || 'some';

      if (user1.birthDate && user2.birthDate) {
        processCompatibilityAnalysis(user1, user2, relation);
      }
    } else {
      const name = searchParams.get('name') || '방문자';
      const birthDate = searchParams.get('birthDate');
      const rawTime = searchParams.get('birthTime');
      const isTimeUnknown = rawTime === 'unknown';
      const birthTime = isTimeUnknown ? '12:00' : (rawTime || '12:00');
      const calendarType = (searchParams.get('calendarType') as 'solar' | 'lunar') || 'solar';
      const gender = searchParams.get('gender') || 'male';

      if (birthDate) {
        processAnalysis(name, birthDate, birthTime, calendarType, gender, isTimeUnknown);
      }
    }
  }, [searchParams]);

  const processAnalysis = async (name: string, birthDate: string, birthTime: string, calendarType: 'solar' | 'lunar', gender: string, isTimeUnknown: boolean) => {
    try {
      setLoadingStep('우주의 기운을 스캔하는 중...');
      const sajuData = calculateSaju(birthDate, birthTime, calendarType, gender);

      setLoadingStep('명리학 전문가가 당신의 운명을 팩폭 중...');
      const response = await fetch('/api/saju', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, birthDate, birthTime, calendarType, gender, isTimeUnknown }),
      });
      
      if (!response.ok) throw new Error('AI 분석 실패');
      
      const resData = await response.json();
      const finalResult = {
        type: 'saju',
        userName: name,
        birthDate,
        birthTime: isTimeUnknown ? 'unknown' : birthTime,
        calendarType,
        gender,
        sajuData,
        aiResult: resData.analysis,
        isPaid: false,
        createdAt: new Date().toISOString()
      };

      await saveAndRedirect(finalResult);
    } catch (error: any) {
      handleAnalysisError(error);
    }
  };

  const processCompatibilityAnalysis = async (user1: any, user2: any, relation: string) => {
    try {
      setLoadingStep('두 사람의 인연을 매칭하는 중...');
      const saju1 = calculateSaju(user1.birthDate, user1.birthTime, user1.calendarType, user1.gender);
      const saju2 = calculateSaju(user2.birthDate, user2.birthTime, user2.calendarType, user2.gender);

      setLoadingStep('환승 궁합 전문가가 두 사람의 속마음을 터는 중...');
      const response = await fetch('/api/gunghap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1, user2, relationship: relation }),
      });
      
      if (!response.ok) throw new Error('궁합 분석 실패');
      
      const resData = await response.json();
      const finalResult = {
        type: 'compatibility',
        user1,
        user2,
        saju1,
        saju2,
        relation,
        aiResult: resData.analysis,
        isPaid: false,
        createdAt: new Date().toISOString()
      };

      await saveAndRedirect(finalResult);
    } catch (error: any) {
      handleAnalysisError(error);
    }
  };

  const saveAndRedirect = async (result: any) => {
    const localId = `local_${Date.now()}`;
    localStorage.setItem(`saju_result_${localId}`, JSON.stringify(result));
    try {
      const docRef = await addDoc(collection(db, 'sajuResults'), result);
      router.push(`/result/${docRef.id}`);
    } catch (dbError) {
      router.push(`/result/${localId}`);
    }
  };

  const handleAnalysisError = (error: any) => {
    console.error('❌ 분석 오류:', error);
    alert(`오류: ${error.message || '알 수 없는 오류'}`);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-[#FEE500] rounded-[2.5rem] flex items-center justify-center shadow-lg animate-pulse">
          <Loader2 className="w-12 h-12 text-[#3C1E1E] animate-spin stroke-[3]" />
        </div>
        <Sparkles className="w-10 h-10 text-[#3C1E1E] absolute -top-4 -right-4 animate-bounce" />
      </div>
      <div className="space-y-4">
        <h2 className="text-3xl font-black text-[#3C1E1E] tracking-tight">
          {searchParams.get('type') === 'compatibility' ? '두 사람의 운명을 매칭하는 중...' : '당신의 우주를 스캔하는 중...'}
        </h2>
        <p className="text-lg font-bold text-gray-500 animate-pulse">{loadingStep}</p>
      </div>
    </div>
  );
}

export default function SajuProcessingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#FEE500]" /></div>}>
      <SajuProcessingContent />
    </Suspense>
  );
}
