'use client';

import { Zap, CreditCard, Lock, Sparkles } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SajuPillar {
  label: string;
  gan: string;
  zhi: string;
  ganKo: string;
  zhiKo: string;
  tenGodGan: string;
  tenGodZhi: string;
  unSeong: string;
  ganColor: { bg: string, text: string, border: string };
  zhiColor: { bg: string, text: string, border: string };
}

interface SajuPreviewProps {
  name?: string;
  gender?: string;
  birthDate?: string;
  pillars: SajuPillar[];
}

export default function SajuPreview({ name = '홍길동', gender = '남', birthDate = '1995.01.01', pillars }: SajuPreviewProps) {
  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-24 px-4">
      {/* 상단: 결제 유도 섹션 - 핑크 테마 적용 */}
      <div className="bg-primary-900 rounded-[2.5rem] p-8 text-center shadow-xl relative overflow-hidden mt-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-center gap-2 text-primary-200 mb-2">
            <Sparkles className="w-5 h-5 fill-primary-300 text-primary-300" />
            <span className="font-black text-xs tracking-widest uppercase">Premium Analysis</span>
          </div>
          
          <h2 className="text-white text-2xl font-black break-keep">
            운명의 치트키를 <br/> <span className="text-primary-300">로그인 없이 바로</span> 확인하세요!
          </h2>

          <div className="flex items-center justify-center gap-4 py-2">
            <div className="bg-white/10 px-4 py-2 rounded-2xl">
              <p className="text-primary-200/60 text-[10px] font-bold">현재 포인트</p>
              <p className="text-white font-black">0 P</p>
            </div>
            <div className="text-primary-400 font-black">/</div>
            <div className="bg-white/10 px-4 py-2 rounded-2xl">
              <p className="text-primary-200/60 text-[10px] font-bold">필요 포인트</p>
              <p className="text-primary-300 font-black">1 P</p>
            </div>
          </div>

          <button className="w-full bg-primary-500 hover:bg-primary-600 text-white py-5 rounded-2xl font-black text-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3">
            <CreditCard className="w-6 h-6" />
            치트키 충전하기 (777원)
          </button>
        </div>
      </div>

      {/* 하단: 만세력 미리보기 섹션 */}
      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-pink-50 space-y-8 relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white via-white/80 to-transparent z-10 rounded-b-[2.5rem] flex items-end justify-center pb-12">
          <div className="text-center space-y-2">
            <Lock className="w-8 h-8 text-primary-200 mx-auto" />
            <p className="text-gray-400 font-bold text-sm">결제 후 전체 분석 내용이 공개됩니다</p>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-primary-900">나의 운명 데이터</h3>
          <p className="text-gray-400 font-bold text-sm">{name} ({gender}) · {birthDate}</p>
        </div>

        {/* 4x2 만세력 표 */}
        <div className="grid grid-cols-4 gap-2">
          {pillars.map((p) => (
            <div key={p.label} className="text-center space-y-1 mb-2">
              <div className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">{p.label}</div>
              <div className="text-[11px] font-black text-gray-700">{p.tenGodGan}</div>
            </div>
          ))}
          
          {/* 천간 */}
          {pillars.map((p, i) => (
            <div key={`gan-${i}`} className={cn(`aspect-square rounded-2xl border flex flex-col items-center justify-center shadow-sm transition-all duration-500`, p.ganColor.border, p.ganColor.bg)}>
              <span className={cn(`text-2xl font-black`, p.ganColor.text)}>{p.ganKo}</span>
            </div>
          ))}

          {/* 지지 */}
          {pillars.map((p, i) => (
            <div key={`zhi-${i}`} className={cn(`aspect-square rounded-2xl border flex flex-col items-center justify-center shadow-sm transition-all duration-500`, p.zhiColor.border, p.zhiColor.bg)}>
              <span className={cn(`text-2xl font-black`, p.zhiColor.text)}>{p.zhiKo}</span>
            </div>
          ))}

          {/* 하단 정보 */}
          {pillars.map((p, i) => (
            <div key={`info-${i}`} className="text-center space-y-0.5 mt-2">
              <div className="text-[11px] font-black text-gray-700">{p.tenGodZhi}</div>
              <div className="text-[9px] font-bold text-gray-400">{p.unSeong}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4 opacity-5">
          <div className="h-4 bg-gray-200 rounded-full w-3/4" />
          <div className="h-4 bg-gray-200 rounded-full w-full" />
          <div className="h-4 bg-gray-200 rounded-full w-5/6" />
        </div>
      </div>
    </div>
  );
}
