'use client';

import { Sparkles, Heart, Zap, ChevronRight, AlertCircle, Layout } from 'lucide-react';
import AnalysisAccordion from './AnalysisAccordion';
import ShareButtons from './ShareButtons';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function PillarChart({ pillars, title, color = "bg-[#FEE500]" }: { pillars: any[], title?: string, color?: string }) {
  return (
    <div className="space-y-4">
      {title && <h4 className="text-center font-black text-[#3C1E1E] text-sm md:text-base">{title}</h4>}
      <div className="grid grid-cols-4 gap-1.5 md:gap-3">
        {pillars.map((p: any, colIdx: number) => {
          const isDayPillar = p.label === '일주';
          return (
            <div key={colIdx} className="space-y-2">
              <div className="text-center text-[8px] md:text-[10px] font-black text-gray-400 tracking-tighter opacity-80 uppercase">
                {p.label}
              </div>
              <div className="space-y-1.5 md:space-y-3">
                <div className={cn(
                  p.ganColor.bg, p.ganColor.text,
                  "p-2.5 md:p-6 rounded-[1.2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center gap-0.5 md:gap-1 shadow-sm border-[2px] md:border-[3px] transition-all",
                  isDayPillar ? "border-pink-300 shadow-md scale-105" : "border-white"
                )}>
                  <span className="text-[9px] md:text-xs font-black opacity-60">{p.ganKo}</span>
                  <span className="text-xl md:text-5xl font-sans font-black leading-none tracking-tight">
                    {p.gan}
                  </span>
                </div>
                <div className={cn(
                  p.zhiColor.bg, p.zhiColor.text,
                  "p-2.5 md:p-6 rounded-[1.2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center gap-0.5 md:gap-1 shadow-sm border-[2px] md:border-[3px] border-white"
                )}>
                  <span className="text-[9px] md:text-xs font-black opacity-60">{p.zhiKo}</span>
                  <span className="text-xl md:text-5xl font-sans font-black leading-none tracking-tight">
                    {p.zhi}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface GungHapPreviewProps {
  data: any;
}

export default function GungHapPreview({ data }: GungHapPreviewProps) {
  const { user1, user2, saju1, saju2, aiResult, isPaid, relation } = data;

  const relationLabels: Record<string, string> = {
    friend: '친구', some: '썸남 썸녀', couple: '연인', spouse: '배우자',
    'ex-couple': '전여친 전남친', 'ex-spouse': '전아내 전남편',
    family: '부모와 자녀', siblings: '형제/자매', colleague: '직장 동료',
    partner: '사업 파트너', idol: '아이돌과 팬', etc: '기타'
  };

  return (
    <div className="space-y-10">
      {/* 1. 상단 결제 배너 (미결제 시) */}
      {!isPaid && (
        <div className="bg-[#3C1E1E] rounded-[2.5rem] p-8 text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FEE500]/10 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse" />
          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-center gap-2 text-[#FEE500]">
              <Zap className="w-6 h-6 fill-[#FEE500]" />
              <span className="font-black text-sm tracking-widest uppercase italic">Destiny CheatKey</span>
            </div>
            <h2 className="text-white text-2xl md:text-3xl font-black break-keep leading-tight">
              단돈 <span className="text-[#FEE500]">990원</span>으로 <br/>
              두 사람의 <span className="text-[#FEE500]">치트키</span>를 켜세요!
            </h2>
            <button className="w-full bg-[#FEE500] hover:bg-[#FDD000] text-[#3C1E1E] py-5 rounded-2xl font-black text-xl shadow-lg transition-all active:scale-[0.95] flex items-center justify-center gap-3">
              치트키 충전하기 (990원)
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* 2. 정보 요약 비교 */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { user: user1, role: data.role1 || '본인', color: 'blue' },
          { user: user2, role: data.role2 || '상대방', color: 'pink' }
        ].map((item, idx) => ( idx === 0 ? (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.role}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-black text-[#3C1E1E]">{item.user.name}</p>
              <p className="text-[11px] text-gray-500 font-bold">{item.user.birthDate} ({item.user.gender === 'male' ? '남' : '여'})</p>
            </div>
          </div>
        ) : (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.role}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-black text-[#3C1E1E]">{item.user.name}</p>
              <p className="text-[11px] text-gray-500 font-bold">{item.user.birthDate} ({item.user.gender === 'male' ? '남' : '여'})</p>
            </div>
          </div>
        )))}
      </div>

      <div className="flex items-center justify-center gap-3 bg-white py-4 rounded-2xl border border-gray-100 shadow-sm">
        <Heart className="w-5 h-5 text-red-500 fill-current" />
        <span className="font-black text-[#3C1E1E]">관계: {relationLabels[relation] || '궁합'}</span>
      </div>

      {/* 3. 양방향 만세력 표 */}
      <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border border-gray-100 space-y-12">
        <div className="text-center space-y-1">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">두 사람의 운명 매칭</h3>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Manseyrok Comparison</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <PillarChart pillars={saju1.pillars} title={`${user1.name}님의 사주`} />
          <PillarChart pillars={saju2.pillars} title={`${user2.name}님의 사주`} />
        </div>
      </div>

      {/* 4. 분석 결과 (결제 여부에 따라) */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 ml-2">
          <Layout className="w-6 h-6 text-[#3C1E1E]" />
          <h3 className="text-2xl font-bold text-gray-900">심층 궁합 리포트</h3>
        </div>

        {isPaid ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {(() => {
              const themes = [
                { key: 'summary', theme: '한 줄 요약', title: '관계의 정의', icon: '📢' },
                { key: 'innerThought', theme: '속마음 팩폭', title: '서로를 향한 시선', icon: '🧠' },
                { key: 'synergy', theme: '시너지 분석', title: '우리가 만나면 생기는 일', icon: '🧬' },
                { key: 'cheatKey', theme: '환승 치트키', title: '관계를 위한 조언', icon: '🗓️' }
              ];
              const displayData = themes.map(t => ({
                theme: t.theme,
                title: t.title,
                icon: t.icon,
                content: aiResult[t.key] || '분석 중...'
              }));
              return <AnalysisAccordion data={displayData} />;
            })()}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-gray-100 space-y-10 relative overflow-hidden">
            <div className="space-y-4 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-red-500 font-black text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>충격 주의: 두 사람의 진짜 속궁합은 이게 아닙니다</span>
              </div>
              <h4 className="text-2xl md:text-3xl font-black text-[#3C1E1E] leading-tight break-keep">
                "두 사람, 사실 사주 원국 대조 결과 <br/> <span className="text-red-500 underline decoration-red-200 decoration-8 underline-offset-[-4px]">역대급 반전</span>이 포착되었습니다."
              </h4>
              <p className="text-gray-500 font-bold leading-relaxed">
                겉으로는 평온해 보이지만, 깊은 무의식 레벨에서 서로를 밀어내는 기운과 당기는 기운이 요동치고 있습니다. 특히 조만간 두 사람 사이를 뒤흔들 <span className="text-[#3C1E1E]">결정적인 사건</span>이 보입니다.
              </p>
            </div>
            {/* 가려진 미리보기 (Blur) */}
            <div className="space-y-6 opacity-40 select-none pointer-events-none filter blur-[8px]">
              <div className="h-4 bg-gray-100 rounded-full w-full" />
              <div className="h-4 bg-gray-100 rounded-full w-5/6" />
              <div className="h-4 bg-gray-100 rounded-full w-4/6" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
        <ShareButtons name={`${user1.name} & ${user2.name}`} />
      </div>
    </div>
  );
}
