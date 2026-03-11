'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { calculateSaju } from '@/lib/saju';
import { Sparkles, Loader2, Moon, Heart } from 'lucide-react';

function SajuProcessingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loadingStep, setLoadingStep] = useState('사주 원국 계산 중...');

  useEffect(() => {
    const type = searchParams.get('type') || 'saju';
    
    if (type === 'compatibility') {
      // 🛠️ 버그 수정: 모달에서 넘어오는 파라미터명과 일치시킴
      const user1 = {
        name: searchParams.get('u1_name') || '인물1',
        birthDate: searchParams.get('u1_date'),
        birthTime: searchParams.get('u1_time') === 'unknown' ? '12:00' : (searchParams.get('u1_time') || '12:00'),
        isTimeUnknown: searchParams.get('u1_time') === 'unknown',
        calendarType: searchParams.get('u1_cal') || 'solar',
        gender: searchParams.get('u1_gen') || 'female',
      };
      const user2 = {
        name: searchParams.get('u2_name') || '인물2',
        birthDate: searchParams.get('u2_date'),
        birthTime: searchParams.get('u2_time') === 'unknown' ? '12:00' : (searchParams.get('u2_time') || '12:00'),
        isTimeUnknown: searchParams.get('u2_time') === 'unknown',
        calendarType: searchParams.get('u2_cal') || 'solar',
        gender: searchParams.get('u2_gen') || 'male',
      };
      const relation = searchParams.get('relation') || 'couple';

      if (user1.birthDate && user2.birthDate) {
        processCompatibilityAnalysis(user1, user2, relation);
      } else {
        console.error('Missing dates:', { user1, user2 });
        handleAnalysisError(new Error('생년월일 정보가 부족합니다.'));
      }
    } else {
      const name = searchParams.get('name') || '방문자';
      const birthDate = searchParams.get('birthDate');
      const rawTime = searchParams.get('birthTime');
      const isTimeUnknown = rawTime === 'unknown';
      const birthTime = isTimeUnknown ? '12:00' : (rawTime || '12:00');
      const calendarType = (searchParams.get('calendarType') as 'solar' | 'lunar') || 'solar';
      const gender = searchParams.get('gender') || 'female';

      if (birthDate) {
        processAnalysis(name, birthDate, birthTime, calendarType, gender, isTimeUnknown);
      } else {
        handleAnalysisError(new Error('정보가 올바르지 않습니다.'));
      }
    }
  }, [searchParams]);

  const processAnalysis = async (name: string, birthDate: string, birthTime: string, calendarType: 'solar' | 'lunar', gender: string, isTimeUnknown: boolean) => {
    try {
      setLoadingStep('우주의 기운을 스캔하고 있어요...');
      const sajuData = calculateSaju(birthDate, birthTime, calendarType, gender);

      setLoadingStep('운명의 속삭임을 가만히 듣는 중...');
      const response = await fetch('/api/saju', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, birthDate, birthTime, calendarType, gender, isTimeUnknown }),
      });
      
      if (!response.ok) throw new Error('분석 서버 응답 실패');
      
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
        isPaid: true, // 전면 무료화
        createdAt: new Date().toISOString()
      };

      await saveAndRedirect(finalResult);
    } catch (error: any) {
      handleAnalysisError(error);
    }
  };

  const processCompatibilityAnalysis = async (user1: any, user2: any, relation: string) => {
    try {
      setLoadingStep('두 사람의 인연을 조심스레 맞추는 중...');
      const saju1 = calculateSaju(user1.birthDate, user1.birthTime, user1.calendarType, user1.gender);
      const saju2 = calculateSaju(user2.birthDate, user2.birthTime, user2.calendarType, user2.gender);

      setLoadingStep('서로를 향한 숨겨진 진심을 읽고 있어요...');
      const response = await fetch('/api/gunghap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1, user2, relationship: relation }),
      });
      
      if (!response.ok) throw new Error('궁합 분석 서버 응답 실패');
      
      const resData = await response.json();
      const finalResult = {
        type: 'compatibility',
        user1,
        user2,
        saju1,
        saju2,
        relation,
        aiResult: resData.analysis,
        isPaid: true, // 전면 무료화
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
      // router.replace 사용하여 히스토리 방지 (뒤로가기 시 홈으로)
      router.replace(`/result/${docRef.id}`);
    } catch (dbError) {
      router.replace(`/result/${localId}`);
    }
  };

  const handleAnalysisError = (error: any) => {
    console.error('❌ 분석 오류:', error);
    alert(`운명의 속삭임을 듣지 못했습니다: ${error.message || '잠시 후 다시 시도해주세요.'}`);
    router.replace('/');
  };

  const isCompatibility = searchParams.get('type') === 'compatibility';

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <div className="relative mb-12">
        {/* 핑크 테마 로딩 UI */}
        <div className="w-32 h-32 bg-white rounded-[3rem] flex items-center justify-center shadow-2xl relative z-10">
          <Loader2 className="w-12 h-12 text-primary-400 animate-spin stroke-[3]" />
        </div>
        <div className="absolute inset-0 bg-primary-200/20 rounded-full blur-3xl animate-pulse scale-150" />
        {isCompatibility ? (
          <Heart className="w-12 h-12 text-rose-400 fill-rose-400 absolute -top-6 -right-6 animate-bounce" />
        ) : (
          <Moon className="w-12 h-12 text-primary-400 fill-primary-400 absolute -top-6 -right-6 animate-bounce" />
        )}
      </div>
      
      <div className="space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-primary-600 text-xs font-black shadow-sm">
          <Sparkles className="w-3.5 h-3.5 fill-primary-400 text-primary-400" />
          ENERGY SCANNING
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-primary-900 tracking-tight leading-tight">
          {isCompatibility ? '두 사람의 운명이 \n 하나로 이어지고 있어요' : '당신의 영혼이 가진 \n 빛깔을 확인하고 있어요'}
        </h2>
        <p className="text-primary-300 font-bold text-lg animate-pulse">{loadingStep}</p>
      </div>
    </div>
  );
}

export default function SajuProcessingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary-400" /></div>}>
      <SajuProcessingContent />
    </Suspense>
  );
}
