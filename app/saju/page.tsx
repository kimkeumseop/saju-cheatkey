'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { calculateSaju } from '@/lib/saju';
import { Sparkles, Loader2 } from 'lucide-react';

function SajuProcessingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loadingStep, setLoadingStep] = useState('사주 원국 계산 중...');

  useEffect(() => {
    const name = searchParams.get('name') || '방문자';
    const birthDate = searchParams.get('birthDate');
    const birthTime = searchParams.get('birthTime') || '12:00';
    const calendarType = searchParams.get('calendarType') || 'solar';
    const gender = searchParams.get('gender') || 'male';

    if (birthDate) {
      processAnalysis(name, birthDate, birthTime, calendarType, gender);
    }
  }, [searchParams]);

  const processAnalysis = async (name: string, birthDate: string, birthTime: string, calendarType: string, gender: string) => {
    try {
      // 1. 사주 원국 계산
      setLoadingStep('우주의 기운을 스캔하는 중... (사주 원국 계산)');
      const sajuData = calculateSaju(birthDate, birthTime, calendarType, gender);

      // 2. Gemini AI 분석 호출
      setLoadingStep('AI 도사가 당신의 운명을 팩폭 중... (약 5초 소요)');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sajuData: sajuData.rawSaju, userName: name }),
      });
      
      if (!response.ok) throw new Error('AI 분석 실패');
      const aiResult = await response.json();

      // 3. Firestore에 저장
      setLoadingStep('치트키 생성 완료! 저장 중...');
      const docRef = await addDoc(collection(db, 'sajuResults'), {
        userName: name,
        birthDate,
        birthTime,
        calendarType,
        gender,
        sajuData: sajuData, // 전체 계산 데이터 포함
        aiResult: aiResult, // 8개 테마 JSON
        createdAt: serverTimestamp()
      });

      // 4. 결과 페이지로 리다이렉트
      router.push(`/result/${docRef.id}`);

    } catch (error) {
      console.error('분석 프로세스 오류:', error);
      alert('분석 중 오류가 발생했습니다. 메인으로 돌아갑니다.');
      router.push('/');
    }
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
        <h2 className="text-3xl font-black text-[#3C1E1E] tracking-tight animate-in fade-in slide-in-from-bottom-4">
          당신의 우주를 스캔하는 중...
        </h2>
        <p className="text-lg font-bold text-gray-500 animate-pulse">
          {loadingStep}
        </p>
      </div>

      <div className="mt-12 max-w-xs w-full bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-sm text-gray-400 font-medium">
        팁: 태어난 시간이 정확할수록 <br/>더 소름 돋는 결과가 나옵니다 💥
      </div>
    </div>
  );
}

export default function SajuProcessingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#FEE500] animate-spin" />
      </div>
    }>
      <SajuProcessingContent />
    </Suspense>
  );
}
