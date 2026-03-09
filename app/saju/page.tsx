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

      // 2. 전문가 심층 분석 호출
      setLoadingStep('명리학 전문가가 당신의 운명을 팩폭 중... (약 5초 소요)');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sajuData: sajuData.rawSaju, userName: name }),
      });
      
      if (!response.ok) throw new Error('AI 분석 실패');
      const aiResult = await response.json();

      // 3. 결과 데이터 구성
      const finalResult = {
        userName: name,
        birthDate,
        birthTime,
        calendarType,
        gender,
        sajuData,
        aiResult,
        createdAt: new Date().toISOString()
      };

      // 4. 로컬 스토리지에 먼저 백업 (DB 저장 실패 대비)
      const localId = `local_${Date.now()}`;
      localStorage.setItem(`saju_result_${localId}`, JSON.stringify(finalResult));
      
      setLoadingStep('치트키 생성 완료! 저장 중...');

      // 5. Firestore 저장 시도 (백그라운드 느낌으로 처리)
      try {
        console.log('🚀 Firestore 저장 시도 중...');
        const docRef = await addDoc(collection(db, 'sajuResults'), finalResult);
        console.log('✅ Firestore 저장 성공:', docRef.id);
        router.push(`/result/${docRef.id}`);
      } catch (dbError) {
        console.error('⚠️ DB 저장 실패, 로컬 모드로 전환:', dbError);
        // DB 저장 실패 시 로컬 ID로 리다이렉트
        router.push(`/result/${localId}`);
      }

    } catch (error: any) {
      console.error('❌ 치명적 오류:', error);
      alert(`오류: ${error.message || '알 수 없는 오류'}`);
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
        <h2 className="text-3xl font-black text-[#3C1E1E] tracking-tight">
          당신의 우주를 스캔하는 중...
        </h2>
        <p className="text-lg font-bold text-gray-500 animate-pulse">
          {loadingStep}
        </p>
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
