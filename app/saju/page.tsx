'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { calculateSaju, SAJU_MEANING } from '@/lib/saju';
import OhaengChart from '@/components/OhaengChart';
import AiCounseling from '@/components/AiCounseling';
import ShareButtons from '@/components/ShareButtons';
import { Info, Calendar } from 'lucide-react';

interface AnalysisData {
  overall: string;
  career: string;
  love: string;
  advice: string;
  tenStars?: string;
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 animate-pulse">
      <div className="h-20 bg-slate-800 rounded-2xl w-2/3 mx-auto" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-slate-700 rounded w-1/2 mx-auto" />
            <div className="h-24 bg-slate-800 rounded-2xl" />
            <div className="h-24 bg-slate-800 rounded-2xl" />
          </div>
        ))}
      </div>
      <div className="h-48 bg-slate-800 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-80 bg-slate-800 rounded-3xl" />
        <div className="space-y-4">
          <div className="h-24 bg-slate-700 rounded-2xl" />
          <div className="h-24 bg-slate-800 rounded-2xl" />
          <div className="h-24 bg-slate-800 rounded-2xl" />
        </div>
      </div>
      <div className="h-[450px] bg-slate-800/50 rounded-[2rem]" />
    </div>
  );
}

function SajuResult() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || '방문자';
  const birthDate = searchParams.get('birthDate');
  const birthTime = searchParams.get('birthTime') || '12:00';
  const calendarType = searchParams.get('calendarType') || 'solar';
  const isLeapMonth = searchParams.get('isLeapMonth') === 'true';
  const gender = searchParams.get('gender') || 'male';

  const data = birthDate ? calculateSaju(birthDate, birthTime, calendarType, gender) : null;
  const strongElement = data ? Object.entries(data.ohaengCount).sort((a,b) => b[1]-a[1])[0][0] : '목';

  if (!data) return <div className="p-20 text-center text-gray-300">정보를 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-100 text-serif">
          {name}님의 명리 분석 보고서
        </h1>
        <p className="text-gray-400 font-medium">
          {birthDate} {birthTime} ({calendarType === 'solar' ? '양력' : '음력'}{isLeapMonth && ', 윤달'}) • {gender === 'male' ? '남성' : '여성'}
        </p>
      </div>

      {/* Myeongsik Table */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: '시주', data: data.rawSaju.hour },
          { label: '일주', data: data.rawSaju.day },
          { label: '월주', data: data.rawSaju.month },
          { label: '년주', data: data.rawSaju.year },
        ].map((col, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-xs font-bold text-gray-400 mb-2">{col.label}</span>
            <div className="w-full flex flex-col gap-2">
              {col.data.map((char, j) => (
                <div 
                  key={j} 
                  className="aspect-square flex flex-col items-center justify-center rounded-2xl glass-card border-2 border-white/5 text-gray-100 px-2 py-4 bg-slate-900/50"
                >
                  <div className="text-4xl font-bold text-gray-100 mb-1">{char}</div>
                  <div className="text-lg font-bold text-gold-500">{SAJU_MEANING[char]?.sound}</div>
                  <div className="text-xs font-medium text-gray-300 mt-2 text-center break-keep">{SAJU_MEANING[char]?.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Daeun Timeline */}
      <div className="glass-card p-8 rounded-3xl space-y-6 overflow-hidden bg-slate-900/50 border border-white/5">
        <div className="flex items-center space-x-2 text-gray-100 font-bold text-lg">
          <Calendar className="w-5 h-5 text-gold-500" />
          <h2 className="text-serif">운세 흐름 (대운)</h2>
        </div>
        <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
          {data.daeunList.map((d, i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className="text-xs font-bold text-gray-400">{d.age}세</div>
              <div className="w-24 h-32 bg-slate-800/50 rounded-xl flex flex-col items-center justify-center border border-white/5 p-2">
                <span className="text-2xl font-bold text-gray-100 leading-none">{d.ganZhi}</span>
                <span className="text-sm text-gold-500 mt-1 font-bold">
                  {SAJU_MEANING[d.ganZhi[0]]?.sound}{SAJU_MEANING[d.ganZhi[1]]?.sound}
                </span>
                <span className="text-[10px] text-gray-300 mt-1 text-center break-keep leading-tight">
                  {SAJU_MEANING[d.ganZhi[0]]?.desc.split(' ')[0]}<br/>{SAJU_MEANING[d.ganZhi[1]]?.desc.split(' ')[0]}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center italic">당신의 대운수는 {data.daeunList[0]?.age || 0}입니다.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="glass-card p-8 rounded-3xl space-y-6 bg-slate-900/50 border border-white/5">
          <div className="flex items-center space-x-2 text-gray-100 font-bold text-lg">
            <Info className="w-5 h-5 text-gold-500" />
            <h2 className="text-serif">오행 분포도</h2>
          </div>
          <OhaengChart data={data.ohaengCount} />
          <p className="text-sm text-gray-300 leading-relaxed text-center italic">
            "당신은 {strongElement}의 기운이 가장 강한 조화를 이루고 있습니다."
          </p>
        </div>
      </div>

      {/* AI Analysis Section with Tabs */}
      <AiCounseling sajuData={data} userName={name} gender={gender} />

      {/* Share Buttons */}
      <ShareButtons name={name} element={strongElement} />
    </div>
  );
}

export default function SajuPage() {
  return (
    <main className="pt-24 min-h-screen bg-slate-950">
      <Navbar />
      <Suspense fallback={<LoadingSkeleton />}>
        <SajuResult />
      </Suspense>
    </main>
  );
}
